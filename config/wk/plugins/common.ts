import { NC } from "../lib/notification-center";
import { Plugin } from "../types";

export = <Plugin>{

  name: "common",

  setup(config) {
    const { runner: r } = config

    /**
     * Read .env or .env.${target} files and merge environment options
     * To pass an environment variables, you have to write like this:
     *   "node build.js --env.watch --env.compress --env.environment='production'"
     */
    r.task("env:load", async () => {
      const { readEnvFile } = await import("../lib/utils/env")
      const { parse } = await import("lol/js/object/argv")
      const { deflat } = await import("lol/js/object")

      readEnvFile()

      // @ts-ignore
      const argv = deflat<any>(parse(process.argv))
      if (argv.env) {
        config.options.env = {
          ...config.options.env,
          ...argv.env
        }
      }
    })

    /**
     * Load target file
     */
    r.task("target:load", async () => {
      const { loadTarget } = await import("../lib/target")
      config.options = loadTarget(config.options, config.options.target)
    })

    r.task("i18n:fetch", async () => {
      const options = config.options.i18n
      const { load } = await import("../lib/airtable")
      await load(options)
    })

    r.task("generate", async () => {
      const { FileCreator } = await import("../lib/file-creator")
      const f = new FileCreator(config.options.generate)
      await f.writeAll()
      NC.on("compiled", () => {
        f.writeAll()
      })
    })

    // Create subtask
    r.group("env")
      .pushBack("env:load")
      .pushBack("target:load")
  }

}