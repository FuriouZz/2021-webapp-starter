import { BuildOptionsEntry, Plugin } from "../types";
import * as Fs from "fs";
import { ensureDir } from "lol/js/node/fs";
import { BuildResult } from "esbuild";
import { dirname } from "path";
import { IAssetWithSource } from "asset-pipeline/js/types";
import { Config } from "../lib/config";
import { NC } from "../lib/notification-center";

async function ANOOP() {}
async function ANOOP1() { return true }

const Utils = {

  entry(asset: IAssetWithSource, config: Config, build: ((filename: string) => Promise<string>)) {
    const input = asset.source.path.join(asset.input).os()
    const output = config.pipeline.output.join(asset.output).os()
    const entry: Partial<BuildOptionsEntry> = {
      input,
      output,
      asset,
      result: "",
    }
    entry.build = Utils.build(build, entry as BuildOptionsEntry)
    entry.emit = config.options.env.server ? ANOOP1 : Utils.emit(entry as BuildOptionsEntry)
    entry.watch = config.options.env.watch ? Utils.watch(entry as BuildOptionsEntry) : ANOOP
    return entry as BuildOptionsEntry
  },

  build(build: ((filename: string) => Promise<string>), entry: BuildOptionsEntry) {
    return () => {
      return build(entry.input).then(content => {
        console.log(`[build] ${entry.input}`)
        entry.result = content
        return true
      }, err => {
        console.log(`[build][err] ${entry.input}`)
        console.log(err)
        return false
      })
    }
  },

  emit(entry: BuildOptionsEntry) {
    return () => {
      return Promise.resolve()
        .then(async () => {
          await ensureDir(dirname(entry.output))
          await Fs.promises.writeFile(entry.output, entry.result)
          console.log(`[emit] ${entry.input}`)
          return true
        }, err => {
          console.log(`[emit][err] ${entry.input}`)
          console.log(err)
          return false
        })
    }
  },

  watch(entry: BuildOptionsEntry) {
    return async () => {
      if (entry.watcher) return
      console.log(`[watch] ${entry.input}`)
      const chokidar = (await import("chokidar")).default
      const watcher = entry.watcher = chokidar.watch(entry.input, {})
      let building = false
      watcher.on("change", async () => {
        if (building) return
        building = true
        if (await entry.build()) {
          await entry.emit()
        }
        building = false
      })
    }
  },

}

export = <Plugin>{
  name: "build",

  setup(config) {
    const { runner: r, options, pipeline } = config

    r.task("build:prepare:stylus", async () => {
      const stylus = (await import("stylus")).default

      const _build = async (filename: string) => {
        const content = await Fs.promises.readFile(filename, "utf-8")
        return new Promise<string>((resolve, reject) => {
          const renderer = stylus(content)
          for (const use of options.stylus.use) {
            renderer.use(use)
          }
          renderer.options.filename = filename
          renderer.render((err, css) => {
            if (err) {
              reject(err)
            } else {
              resolve(css)
            }
          })
        })
      }

      pipeline.manifest
        .export("asset_source", "entry")
        .filter(asset => {
          return /\.styl$/.test(asset.input)
        })
        .forEach(asset => {
          options.build.entries.push(Utils.entry(asset, config, _build))
        })
    })

    r.task("build:prepare:esbuild", async () => {
      const { build } = (await import("esbuild"))

      const rebuilds: Record<string, BuildResult> = {}
      const _build = async (filename: string) => {
        let result: BuildResult['outputFiles']

        if (rebuilds[filename]) {
          const rebuild = rebuilds[filename]
          const r = await rebuild.rebuild()
          result = r.outputFiles
        } else {
          const r = rebuilds[filename] = await build({
            entryPoints: [filename],
            bundle: true,
            incremental: options.env.watch,
            write: false,
          })
          result = r.outputFiles
        }

        return result[0].text
      }

      pipeline.manifest
        .export("asset_source", "entry")
        .filter(asset => {
          return /\.(js|ts|jsx|tsx|mjs)$/.test(asset.input)
        })
        .forEach(asset => {
          options.build.entries.push(Utils.entry(asset, config, _build))
        })
    })

    r.task("build:prepare:ejs", async () => {
      const { ejs } = (await import("../lib/ejs"))

      const _build = async (filename: string) => {
        const content = await Fs.promises.readFile(filename, "utf-8")
        return ejs(options.ejs, content, filename)
      }

      pipeline.manifest
        .export("asset_source", "entry")
        .filter(asset => {
          return /\.(ejs)$/.test(asset.input)
        })
        .forEach(asset => {
          options.build.entries.push(Utils.entry(asset, config, _build))
        })
    })

    r.task("build:compile", async () => {
      NC.dispatch("compile")
      const promises = options.build.entries.map(e => e.build())
      await Promise.all(promises)
      NC.dispatch("compiled")
    })

    r.task("build:emit", async () => {
      const promises = options.build.entries.map(e => e.emit())
      await Promise.all(promises)
    })

    r.task("build:watch", async () => {
      const promises = options.build.entries.map(e => e.watch())
      await Promise.all(promises)
    })

    r.group("build:prepare")
      .pushBack("build:prepare:stylus")
      .pushBack("build:prepare:ejs")
      .pushBack("build:prepare:esbuild")

    r.group("watch")
      .pushBack("build:watch")
  }
}