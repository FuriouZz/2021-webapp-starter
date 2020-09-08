import { isFile, editFileSync, fetch, isDirectory } from "lol/js/node/fs"
import { toCamelCase } from "lol/js/string"
import { readFileSync, writeFileSync, statSync } from "fs"
import { join, normalize, relative, isAbsolute } from "path"
import { spawnSync } from "child_process"
import { requireJSON } from "./utils/require-content"

type Config = {
  enabled: boolean,
  name: string,
  dependencies: Record<string, string>,
  devDependencies: Record<string, string>,
  path: string,
  filePath: string,
  dirPath: string
}

type PartialConfig = Partial<Omit<Config, "filePath" | "dirPath">>

type UserConfig = PartialConfig & {
  requiredModules?: Record<string, PartialConfig>
}

function cleanPath(path: string) {
  return normalize(path).replace(/\\/g, "/")
}

function getLastUpdateTime(file: string) {
  const { mtime } = statSync(file)
  return mtime.getTime()
}

function different(arr0: any[], arr1: any[]) {
  if (arr0.length !== arr1.length) return true

  for (let i = 0; i < arr1.length; i++) {
    if (!arr0.includes(arr1[i])) {
      return true
    }
  }

  return false
}

/**
 * Install new packages
 */
function installDependencies({ devDeps, deps }: {
  devDeps: Config['devDependencies'],
  deps: Config['dependencies']
}) {
  let needInstall = false
  editFileSync("package.json", buffer => {
    const content = JSON.parse(buffer.toString("utf-8"))

    content['devDependencies'] = content['devDependencies'] || {}

    for (const [dep, ver] of Object.entries(devDeps)) {
      const diff = !(dep in content['devDependencies']
        && content['devDependencies'][dep] === ver)
      if (diff) {
        needInstall = true
        console.log("[info] Install devDependencies", `${dep}@${ver}`)
        content['devDependencies'][dep] = ver
      }
    }

    content['dependencies'] = content['dependencies'] || {}

    for (const [dep, ver] of Object.entries(deps)) {
      const diff = !(dep in content['dependencies']
        && content['dependencies'][dep] === ver)
      if (diff) {
        needInstall = true
        console.log("[info] Install dependencies", `${dep}@${ver}`)
        content['dependencies'][dep] = ver
      }
    }

    return `${JSON.stringify(content, null, 2)}\n`
  })

  if (needInstall) {
    spawnSync("npm install", { stdio: "inherit", shell: true })
  }
}

/**
 * Update tsconfig.json
 */
function updateTSConfig({ modules, include }: {
  modules: Config[],
  include: Config[],
}) {
  const str = readFileSync("config/tsconfig.json", { encoding: "utf-8" })

  // Update tsconfig.json
  const tsconfig = requireJSON(str, "config/tsconfig.json")

  const before = tsconfig["include"].slice(0)

  const paths = modules.map(m => cleanPath(relative('./config', m.dirPath)))
  const includes = include.map(m => cleanPath(relative('./config', m.dirPath)))

  tsconfig["include"] = tsconfig["include"]
    .filter((file: string) => !paths.includes(file))
    .concat(includes)

  // Keep unique
  tsconfig["include"] = [...new Set(tsconfig["include"])]

  if (different(before, tsconfig["include"])) {
    writeFileSync("config/tsconfig.json", JSON.stringify(tsconfig, null, 2))
    console.log(`[info] tsconfig.json updated`)
  }
}

/**
 * Update types definition
 */
function updateTypes({ include }: {
  include: Config[]
}) {
  editFileSync("config/modules/modules.ts", buffer => {
    const options: string[] = []
    const hooks: string[] = []
    const imports: string[] = []

    include.forEach(m => {
      const name = toCamelCase(m.name)
      const path = cleanPath(relative('./config/modules', m.filePath))
      imports.push(`import { Options as ${name}Options, Hooks as ${name}Hooks } from "./${path}";`)
      options.push(`${name}Options`)
      hooks.push(`${name}Hooks`)
    })

    let content = "export type ModuleOptions = {}\nexport const ModuleHooks = []"
    if (options.length > 0) {
      content = imports.join("\n")
      content += "\n"
      content += `export type ModuleOptions = ${options.join(" & ")}\n`
      content += `export const ModuleHooks = [${hooks.join(", ")}]\n`
    }

    console.log(`[info] Types updated`)
    return `/** Do not touch. This file is updated automatically. */\n${content}`
  })
}

function checkLastUpdate() {
  const ref = getLastUpdateTime("config/modules/modules.ts")

  const files = fetch([
    "config/**/*.ts",
    "config/modules.jsonc",
    "config/tsconfig.json",
  ], [
    "config/modules/modules.ts",
  ])
  const times = files.map(getLastUpdateTime)
  const highest = Math.max.apply(null, times)

  // console.log(files)
  // console.log(ref, highest, files[times.indexOf(highest)])

  return highest > ref
}

async function ConfigureModules(items: Record<string, UserConfig>) {
  const tsConfigParameters = {
    modules: [] as Config[],
    include: [] as Config[]
  }

  const pkgParameters = {
    deps: {} as Config['dependencies'],
    devDeps: {} as Config['devDependencies'],
  }

  const typesParameters = {
    include: [] as Config[]
  }

  // Apply override
  Object.entries(items).forEach(([key, mod]) => {
    if (mod.enabled && mod.requiredModules) {
      for (const [overridedKey, overrideMod] of Object.entries(mod.requiredModules)) {
        console.log(`[info] "${key}" module override "${overridedKey}" module.`)
        items[overridedKey] = overrideMod
      }
    }
  })

  // Filter modules
  Object.entries(items).forEach(([key, mod]) => {
    if (!isAbsolute(mod.path)) {
      mod.path = join('./config', mod.path)
    }

    let dirPath = cleanPath(mod.path)
    let filePath = cleanPath(mod.path) + '/module'

    const m: Config = {
      name: mod.name || key,
      enabled: typeof mod.enabled === "boolean" ? mod.enabled : false,
      path: mod.path,
      dependencies: mod.dependencies || {},
      devDependencies: mod.devDependencies || {},
      filePath,
      dirPath,
    }

    const isDir = isDirectory(m.dirPath)
    if (isDir) tsConfigParameters.modules.push(m)

    if (m.enabled) {
      Object.assign(pkgParameters.deps, m.dependencies)
      Object.assign(pkgParameters.devDeps, m.devDependencies)
      if (isDir) tsConfigParameters.include.push(m)
      if (isFile(filePath + ".ts")) typesParameters.include.push(m)
    }
  })

  const _needUpdate = checkLastUpdate()

  if (_needUpdate) {
    console.log("[info] Config need an update")
    updateTSConfig(tsConfigParameters)
    installDependencies(pkgParameters)
    updateTypes(typesParameters)
    spawnSync("npx tsc -p config/tsconfig.json", { stdio: "inherit", shell: true })
    console.log(`[info] Config compiled`)
  } else {
    console.log("[info] Config does not need an update")
  }
}

function main() {
  const json = requireJSON(readFileSync("config/modules.jsonc", { encoding: "utf-8" }), "config/modules.jsonc")
  return ConfigureModules(json)
}

main()
  .then(null, console.log)