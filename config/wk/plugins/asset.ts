import { Plugin } from "../types";

export = <Plugin>{

  name: "asset",

  setup(config) {
    const { runner: r } = config

    /**
     * Prepare asset pipeline
     */
    r.task("asset:setup", () => {
      const { pipeline, options } = config
      pipeline.verbose = true
      pipeline.cache.enabled = options.env.cache
      pipeline.host.setURL(options.env.host)
      pipeline.manifest.readOnDisk = false
      pipeline.manifest.saveOnDisk = false
      pipeline.output.set(options.env.output)

      options.pageData.datas.push((data) => {
        const entries = Object.entries(pipeline.manifest.export("output_key"))
        const outputs: Record<string, { path: string, url: string }> = {}
        for (const [key, value] of entries) {
          outputs[key] = value.output
        }
        data["assets"] = outputs
      })
    })

    /**
     * Fetch assets
     */
    r.task("asset:fetch", () => {
      config.pipeline.fetch(true)
    })

    /**
     * Copy assets
     */
    r.task("asset:copy", async () => {
      await config.pipeline.copy()
    })

    /**
     * Add EJS helpers
     */
    r.task("asset:ejs_helpers", async () => {
      const ejs = config.options.ejs
      const { resolvePath } = await import("../lib/asset-pipeline")

      ejs.helpers.asset_url = (options) => {
        return function (path: string) {
          const result = resolvePath(path, options.filename, config.pipeline, {
            useRequire: false,
            usePath: false
          })
          return result.path
        }
      }

      ejs.helpers.asset_path = (options) => {
        return function (path: string) {
          const result = resolvePath(path, options.filename, config.pipeline, {
            useRequire: false,
            usePath: true
          })
          return result.path
        }
      }
    })

    r.task("asset:stylus_helpers", async () => {
      const { nodes } = await import("stylus")
      const { resolvePath } = await import("../lib/asset-pipeline")

      config.options.stylus.use.push((styl: any) => {
        const filename = styl.options.filename

        styl.define('asset_url', strObject => {
          const result = resolvePath(strObject.string, filename, config.pipeline, {
            useRequire: false,
            usePath: false
          })
          return new nodes.Literal('url("' + result.path + '")')
        })

        styl.define('asset_url_raw', strObject => {
          const result = resolvePath(strObject.string, filename, config.pipeline, {
            useRequire: false,
            usePath: false
          })
          return new nodes.Literal(result.path)
        })

        styl.define('asset_path', strObject => {
          const result = resolvePath(strObject.string, filename, config.pipeline, {
            useRequire: false,
            usePath: true
          })
          return new nodes.Literal('url("' + result.path + '")')
        })

        styl.define('asset_path_raw', strObject => {
          const result = resolvePath(strObject.string, filename, config.pipeline, {
            useRequire: false,
            usePath: true
          })
          return new nodes.Literal(result.path)
        })
      })
    })

    r.task("asset:watch", async () => {
      const chokidar = (await import("chokidar")).default
      config.pipeline.source
        .all()
        .forEach(source => {
          const path = source.fullpath.join("**/*").os()
          const watcher = chokidar.watch(path, {
            ignored: [],
            ignoreInitial: true
          })
          watcher.on("add", (a) => {
            if (/assets/.test(path)) {
              config.pipeline.fetch(true)
              config.execute("generate")
            } else {
              config.execute("build:compile")
            }
          })
          watcher.on("change", (a) => {
            if (/assets/.test(path)) {
              config.pipeline.fetch(true)
              config.execute("generate")
            } else {
              config.execute("build:compile")
            }
          })
        })
    })

    // Create subtask
    r.group("asset")
      .pushBack("asset:setup")
      .pushBack("asset:fetch")
      .pushBack("asset:copy")
      .pushBack("asset:ejs_helpers")
      .pushBack("asset:stylus_helpers")

    r.group("watch")
      .pushBack("asset:watch")
  }

}