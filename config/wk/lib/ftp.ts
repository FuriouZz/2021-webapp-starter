import Client from 'ftp'
import { fetch } from 'lol/js/node/fs'
import { dirname, relative } from 'path'
import { PathBuilder } from "asset-pipeline/js/path"

export interface FtpOptions {
  input: string
  output: string
  include?: string[]
  exclude?: string[]
}

export async function upload(options: FtpOptions) {
  const input = new PathBuilder(options.input)
  options.include = options.include || [ '**/*' ]
  const _include = options.include.map(f => input.join(f).toString("unix"))
  const ios = fetch(_include, options.exclude).map(file => {
    return [
      file,
      new PathBuilder(relative(options.input, file)).web()
    ]
  })

  const c = await connect()
  try {
    await mkdir(c, options.output)
  } catch (e) {}
  await cwd(c, options.output)

  let i = 0
  const uploads = ios.map(([input, output]) => {
    return put(c, input, output).then(() => {
      i++
      console.log(`[ftp][${i}/${ios.length}] uploaded ${output}`)
    })
  })

  await Promise.all(uploads)

  c.destroy()
}

export function connect() {
  return new Promise<Client>((resolve) => {
    const c = new Client()

    c.connect({
      host: process.env['FTP_HOST'],
      user: process.env['FTP_LOGIN'],
      password: process.env['FTP_PASSWORD'],
      port: 21
    })

    c.once("ready", async () => {
      resolve(c)
    })

    c.on("error", (err) => {
      console.log(err)
      // onerror(err)
      // c.destroy()
    })
  })
}

export async function put(client: Client, input: NodeJS.ReadableStream | Buffer | string, destPath: string, useCompression?: boolean) {
  const dirPath = dirname(destPath)
  await mkdir(client, dirPath, true)
  return new Promise<void>((resolve, reject) => {
    client.put(input, destPath, useCompression, err => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

export function mkdir(client: Client, path: string, recursive?: boolean) {
  return new Promise<void>((resolve, reject) => {
    client.mkdir(path, recursive, err => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

export function cwd(client: Client, path: string) {
  return new Promise<string>((resolve, reject) => {
    client.cwd(path, (err, currentDir) => {
      if (err) {
        reject(err)
      } else {
        resolve(currentDir)
      }
    })
  })
}
