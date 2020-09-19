import { compilation, Compiler } from "webpack";
import { WK } from "../../workflow/types";

export class AssetPipelinePlugin {

  constructor(private config: WK.ProjectConfig) { }

  apply(compiler: Compiler) {
    compiler.hooks.beforeCompile.tapPromise("AssetPipelinePlugin.copy", this.copy.bind(this))
    compiler.hooks.emit.tapPromise("AssetPipelinePlugin.ignoreEmit", this.ignoreEmit.bind(this))
    compiler.hooks.afterEmit.tapPromise("AssetPipelinePlugin.watch", this.watch.bind(this))
    compiler.hooks.invalid.tap("AssetPipelinePlugin.fetch", this.fetch.bind(this))
  }

  // Copy new files only
  async copy() {
    await this.config.assets.pipeline.copy()
  }

  // Ignore some files to emit
  async ignoreEmit(compilation: compilation.Compilation) {
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

  // Watch source path after emit
  async watch(compilation: compilation.Compilation) {
    const paths = this.config.assets.pipeline.source
      .all()
      .map(source => source.path.unix())

    for (const path of paths) {
      if (!compilation.contextDependencies.has(path)) {
        compilation.contextDependencies.add(path)
      }
    }
  }

  // Fetch new files at each watch invalidation
  fetch(name: string, date: Date) {
    this.config.assets.pipeline.fetch(true)
  }

}