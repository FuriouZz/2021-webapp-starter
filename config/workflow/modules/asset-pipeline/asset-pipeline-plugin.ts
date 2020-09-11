import { compilation, Compiler } from "webpack";
import { WK } from "../../types";

export class AssetPipelinePlugin {

  constructor(private config: WK.ProjectConfig) { }

  apply(compiler: Compiler) {
    compiler.hooks.beforeCompile.tapPromise("AssetPipelinePlugin.copy", this.copy.bind(this))
    compiler.hooks.emit.tap("AssetPipelinePlugin.ignoreEmit", this.ignoreEmit.bind(this))
  }

  async copy() {
    // Force fetching new files
    this.config.assets.pipeline.fetch(true)

    // Copy new files only
    await this.config.assets.pipeline.copy()
  }

  ignoreEmit(compilation: compilation.Compilation) {
    for (const name of Object.keys(compilation.assets)) {

      const ignored = this.config.assets.ignoreEmit.some(pattern => {
        if (typeof pattern === "string") {
          return name === pattern
        }
        return pattern.test(name)
      })

      if (ignored) {
        console.log(`[AssetPipelinePlugin] Ignoring asset ${name}`)
        delete compilation.assets[name]
      }
    }
  }

}