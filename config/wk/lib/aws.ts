import { exec, execSerie, execParallel } from "lol/js/node/exec"
import { fetch, readFile } from 'lol/js/node/fs'
import * as Fs from "fs"
import * as Path from "path"
import { date } from "lol/js/string/generate"
import { merge } from 'lol/js/object'

export interface BasicOptions {
  profile?: string
  region?: string
  debug?: boolean
}

export interface InvalidationOption extends BasicOptions {
  distribution_id: string
  paths: string[]
}

export interface DeployOptions extends BasicOptions {
  bucket: string
  input: string
  exceptions?: Record<string, ObjectDescription>
  cloudfront?: InvalidationOption
}

export interface ObjectDescription {
  contentType: string,
  contentEncoding: string
}

export interface GZipOptions {
  patterns: Record<string, ObjectDescription>,
  base_dir: string
  debug?: boolean
}

const Exceptions = {
  "**/*.js": {
    contentType: "application/javascript"
  },
  "**/*.css": {
    contentType: "text/css"
  },
  "**/*.bin": {
    contentType: "application/octet-stream",
    contentEncoding: "gzip"
  },
  "**/*.awd": {
    contentType: "application/octet-stream",
    contentEncoding: "gzip"
  },
  "**/*.ktx": {
    contentType: "application/octet-stream",
    contentEncoding: "gzip"
  },
  "**/*.dds": {
    contentType: "application/octet-stream",
    contentEncoding: "gzip"
  },
  "**/*.pvr": {
    contentType: "application/octet-stream",
    contentEncoding: "gzip"
  }
}

export async function gzip(options: GZipOptions) {

  const cmds = []
  const includes = []

  for (const key in options.patterns) {
    if (options.patterns[key].contentEncoding && options.patterns[key].contentEncoding.match(/gzip/gi)) {
      includes.push(Path.join(options.base_dir, key))
    }
  }

  fetch(includes).forEach((f) => {
    const filename = Path.basename(f)

    cmds.push({
      cwd: Path.dirname(f),
      // command: `gzip -9 -c ${filename} > ${filename}`
      command: `gzip -9 ${filename}`
    })

    cmds.push({
      cwd: Path.dirname(f),
      command: `mv ${filename}.gz ${filename}`
    })
  })

  if (options.debug) {
    console.log(cmds);
  } else {
    return execSerie(cmds).then((response) => {
      console.log('[DEPLOY]', 'Files gzipped')
      return response
    })
  }

}

export async function pushObjects(options: DeployOptions) {

  const excludes = Object.keys(options.exceptions).map(function (exception) {
    return '--exclude="' + exception + '"'
  }).join(' ')

  const cmd = [
    'aws s3',
    'sync',
    options.input,
    `s3://${options.bucket}`,
    '--acl public-read',
    '--output json',
    '--delete'
  ]

  if (options.profile) cmd.push(`--profile ${options.profile}`)
  if (options.region) cmd.push(`--region ${options.region}`)

  cmd.push(excludes)

  if (options.debug) {
    console.log(cmd.join(' '));
  } else {
    return exec(cmd.join(' ')).then((response) => {
      console.log('[DEPLOY]', 'Objects pushed')
      return response
    })
  }

}

export async function pushException(options: DeployOptions) {
  const requests = []
  let request = []

  for (const key in options.exceptions) {
    request = [
      'aws s3',
      'sync',
      options.input,
      `s3://${options.bucket}`,
      '--acl public-read',
      '--output json'
    ]

    if (options.profile) request.push(`--profile ${options.profile}`)
    if (options.region) request.push(`--region ${options.region}`)

    if (options.exceptions[key].contentEncoding) {
      request.push(`--content-encoding "${options.exceptions[key].contentEncoding}"`)
    }

    if (options.exceptions[key].contentType) {
      request.push(`--content-type "${options.exceptions[key].contentType}"`)
    }

    request.push(
      '--exclude "*"',
      `--include "${key}"`
    )

    requests.push(request.join(' '))
  }

  if (options.debug) {
    console.log(requests);
  } else {
    execParallel(requests).then((responses) => {
      console.log('[DEPLOY]', 'Exceptions pushed')
      return responses
    })
  }

}

export async function listObjects(options: BasicOptions & { bucket: string }) {
  const dirs = options.bucket.split('/')
  const bucket = dirs.shift()
  const delimiter = dirs.join('/')

  const cmd = [
    'aws s3api',
    'list-objects-v2',
    `--bucket ${bucket}`,
    `--delimiter ${delimiter}`
  ]

  if (options.profile) cmd.push(`--profile ${options.profile}`)
  if (options.region) cmd.push(`--region ${options.region}`)

  if (options.debug) {
    console.log(cmd);
  } else {
    return exec(cmd.join(' ')).then((response) => {
      console.log('[DEPLOY]', 'List fetched')
      return response
    })
  }
}

// export async function backup_objects( options ) {
//   let result = await list_objects( options )
//   const list = JSON.parse(result.data.toString('utf-8'))
// }

export async function invalidatePaths(options: InvalidationOption) {
  const cmd = [
    "aws cloudfront",
    "create-invalidation",
    `--distribution-id ${options.distribution_id}`,
    `--paths ${options.paths}`
  ]

  if (options.profile) cmd.push(`--profile ${options.profile}`)
  if (options.region) cmd.push(`--region ${options.region}`)

  if (options.debug) {
    console.log(cmd.join(' '));
  } else {
    return exec(cmd.join(' ')).then((response) => {
      console.log('[DEPLOY]', 'Create a new invalidation')
      return response
    })
  }
}

export async function deploy(options: DeployOptions) {
  options.exceptions = merge({}, Exceptions, options.exceptions || {})
  Fs.writeFileSync(Path.join(options.input, '.version'), date(false))
  await pushObjects(options)
  await pushException(options)
}

export async function deployLast(options: DeployOptions) {
  let recent = null
  let build = ''

  const files = fetch(Path.join(Path.dirname(options.input), '/**/.version'))

  for (let i = 0; i < files.length; i++) {
    const f = files[i];

    const version = await readFile(f, 'utf-8')
    const year = version.slice(0, 4)
    const month = version.slice(4, 6)
    const day = version.slice(6, 8)
    const hour = version.slice(8, 10)
    const minute = version.slice(10, 12)
    const second = version.slice(12, 14)

    const date = new Date(`${year}-${month}-${day} ${hour}:${minute}:${second}`)

    if (recent == null || recent < date) {
      recent = date
      build = Path.dirname(f)
    }
  }

  if (!!recent) {
    options.input = build
    await deploy(options)
    console.log(`[DEPLOY] Deploy the last build "${build}"`)
  } else {
    console.log('[DEPLOY] No deployment found')
  }
}