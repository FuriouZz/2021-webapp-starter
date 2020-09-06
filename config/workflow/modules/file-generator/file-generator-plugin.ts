import { WK } from "../../types";
import webpack from "webpack";
import { writeFile } from "lol/js/node/fs";
import { join, isAbsolute } from "path";

export type FileData = {
  filename: string,
  content: () => Promise<string> | string
}

export class FileGeneratorPlugin {

  constructor(private config: WK.ProjectConfig) { }

  apply(compiler: webpack.Compiler) {
    compiler.hooks.beforeCompile.tapPromise('PagePlugin.generatePage', this.generatePage.bind(this))
  }

  async generatePage() {
    for (const { filename, content } of this.config.generate.files) {
      let data: string
      const result = content()

      if (typeof result === "string") {
        data = result
      } else {
        data = await result
      }

      let path: string
      if (isAbsolute(this.config.generate.output)) {
        path = join(this.config.generate.output, filename)
      } else {
        path = join(this.config.webpack.context, this.config.generate.output, filename)
      }

      await writeFile(data, path)
    }
  }
}