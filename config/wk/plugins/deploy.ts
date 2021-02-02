import { join, dirname, basename, relative } from "path";
import { Plugin } from "../types";

export = <Plugin>{

  name: "deploy",

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
  }

}