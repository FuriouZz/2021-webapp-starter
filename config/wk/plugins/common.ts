import { join, dirname, basename, relative } from "path";
import { NC } from "../lib/notification-center";
import { Plugin } from "../types";

export = <Plugin>{

  name: "common",

  setup(config) {
    const { runner: r } = config

    /**
     * Create aws
     */
    r.task("deploy:aws", async () => {
      const options = config.options.deploy
      const { deploy } = await import("../lib/aws")
      const input = config.pipeline.output.join(config.pipeline.host.pathname.os()).os()
      await deploy({
        input,
        ...options.aws
      })
    })

    /**
     * Create ftp
     */
    r.task("deploy:ftp", async () => {
      const options = config.options.deploy
      const pipeline = config.pipeline
      const input = pipeline.output.join(pipeline.host.pathname.os()).os()
      const output = options.ftp.output

      const exclude = options.exclude.slice(0)
      const include = options.include.slice(0)

      const { upload } = await import("../lib/ftp")
      return upload({
        input,
        output,
        include,
        exclude,
      })
    })

    /**
     * Create zip
     */
    r.task("deploy:zip", async () => {
      const options = config.options.deploy

      const pipeline = config.pipeline
      const input = pipeline.output.join(pipeline.host.pathname.os()).os()
      const output = join(dirname(input), basename(input) + '.zip')

      const exclude = options.exclude.slice(0)
      exclude.push(relative(input, output))

      const include = options.include.slice(0)

      const { zip } = await import("../lib/zip")
      return zip({
        input,
        output,
        include,
        exclude,
      })
    })

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

    r.task("page-data:generate", async () => {
      const { options } = config
      const { generatePageData, } = await import("../lib/page-data")
      options.generate.files.push({
        filename: "app/scripts/generated/PAGE.ts",
        write: true,
        content: () => generatePageData(options.pageData.datas)
      })
    })

    r.task("page-data:ejs", () => {
      const { options } = config
      options.pageData.datas.push((data) => {
        data["ejs"] = options.ejs.data
      })
    })

    r.task("page-data:i18n", () => {
      const { options } = config
      options.pageData.datas.push((data) => {
        data["i18n"] = options.i18n.locales
      })
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

    r.group("page-data")
      .pushBack("page-data:generate")
      .pushBack("page-data:ejs")
      .pushBack("page-data:i18n")
  }

}