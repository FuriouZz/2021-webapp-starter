import { isFile, editFileSync, fetch, isDirectory } from "lol/js/node/fs"
import { toCamelCase } from "lol/js/string"
import { readFileSync, writeFileSync, statSync } from "fs"
import { join, normalize, relative, isAbsolute, dirname, extname } from "path"
import { spawnSync } from "child_process"
import { requireJSON } from "./utils/require-content"
import { cwd } from "process"

type Config = {
  enabled: boolean,
  name: string,
  priority: number,
  dependencies: Record<string, string>,
  devDependencies: Record<string, string>,
  path: string,
  filePath: string,
  dirPath: string,
  require: string[]
}

type PartialConfig = Partial<Omit<Config, "filePath" | "dirPath">>

type UserConfig = PartialConfig & {
  override?: Record<string, PartialConfig>
}

type JSONConfig = {
  extends: string[]
  modules: Record<string, UserConfig>
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
      const path = cleanPath(relative('./config/modules', m.filePath.replace(extname(m.filePath), "")))
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

function getModulesAvailability(modules: Record<string, UserConfig>) {
  const enables: Record<string, boolean> = {}

  function checkAvailability(key: string, from?: string) {
    if (key === from) throw new Error(`Circular dependency "${key}".`)

    const mod = modules[key]
    if (!mod) return false

    if (Array.isArray(mod.require)) {
      for (const k of mod.require) {
        if (!checkAvailability(k, key)) return false
      }
    }

    return !!mod.enabled
  }

  Object.keys(modules)
    .forEach(key => enables[key] = checkAvailability(key))

  return enables
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

function loadConfig(filename: string) {
  const config = {
    filename,
    dirname: "",
    modules: {} as Record<string, UserConfig>,
    json: null as JSONConfig
  }

  config.filename = isAbsolute(config.filename) ? config.filename : join(process.cwd(), config.filename)
  config.dirname = dirname(config.filename)
  config.json = requireJSON(readFileSync(config.filename, { encoding: "utf-8" }), config.filename) as JSONConfig

  // Fetch extended config and merge modules
  if (Array.isArray(config.json.extends) && config.json.extends.length > 0) {
    for (let extend of config.json.extends) {
      extend = isAbsolute(extend) ? extend : join(config.dirname, extend)
      const extendedConfig = loadConfig(extend)
      Object.assign(config.modules, extendedConfig.modules)
    }
  }

  // Override extended modules
  Object.entries(config.json.modules)
    .filter(entry => entry[1].enabled)
    .forEach(([key, mod]) => {
      if (key in config.modules) console.log(`[info] "${key}" module overrided (extend).`)
      config.modules[key] = Object.assign(config.modules[key] || {}, mod)
      config.modules[key].path = join(config.dirname, config.modules[key].path)
    })

  return config
}

function parseConfig(filename: string) {
  const _config = loadConfig(filename)

  const config = {
    tsConfigParameters: {
      modules: [] as Config[],
      include: [] as Config[]
    },
    pkgParameters: {
      deps: {} as Config['dependencies'],
      devDeps: {} as Config['devDependencies'],
    },
    typesParameters: {
      include: [] as Config[]
    },
    ..._config
  }

  // Override modules from requiredModules
  Object.entries(config.modules).forEach(([key, mod]) => {
    if (mod.enabled && mod.override) {
      for (const overrideMod of Object.values(mod.override)) {
        console.log(`[info] "${key}" module overrided (overrideModules).`)
        config.modules[key] = Object.assign(config.modules[key] || {}, overrideMod)
        config.modules[key].path = join(config.dirname, config.modules[key].path)
      }
    }
  })

  const enables = getModulesAvailability(config.modules)

  // Filter modules
  Object.entries(config.modules)
    .filter(entry => enables[entry[0]])
    .forEach(([key, mod]) => {
      let dirPath: string
      let filePath: string

      if (isFile(mod.path)) {
        dirPath = cleanPath(dirname(mod.path))
        filePath = cleanPath(mod.path)
      } else {
        dirPath = cleanPath(mod.path)
        filePath = cleanPath(mod.path) + '/module.ts'
      }

      const m: Config = {
        name: mod.name || key,
        priority: isNaN(mod.priority) ? 0 : mod.priority,
        enabled: typeof mod.enabled === "boolean" ? mod.enabled : false,
        path: mod.path,
        dependencies: mod.dependencies || {},
        devDependencies: mod.devDependencies || {},
        filePath,
        dirPath,
        require: Array.isArray(mod.require) ? mod.require : [],
      }

      const isDir = isDirectory(m.dirPath)
      if (isDir) config.tsConfigParameters.modules.push(m)

      if (m.enabled) {
        Object.assign(config.pkgParameters.deps, m.dependencies)
        Object.assign(config.pkgParameters.devDeps, m.devDependencies)
        if (isDir) config.tsConfigParameters.include.push(m)
        if (isFile(filePath)) config.typesParameters.include.push(m)
      }
    })

  // Reorder by priority
  config.typesParameters.include = config.typesParameters.include.sort((a, b) => {
    return a.priority > b.priority ? -1 : 1
  })

  return config
}

async function configureModules(filename: string) {
  const config = parseConfig(filename)

  const _needUpdate = checkLastUpdate()

  if (_needUpdate) {
    console.log("[info] Config need an update")
    updateTSConfig(config.tsConfigParameters)
    installDependencies(config.pkgParameters)
    updateTypes(config.typesParameters)
    spawnSync("npx tsc -p config/tsconfig.json", { stdio: "inherit", shell: true })
    console.log(`[info] Config compiled`)
  } else {
    console.log("[info] Config does not need an update")
  }
}

function main() {
  return configureModules("config/modules.jsonc")
}

main()
  .then(null, console.log)