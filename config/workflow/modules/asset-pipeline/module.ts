import { WK } from "../../types"
import { transformer, typings } from "./transfomer"
import { addAssets } from "./page-data"
import { RuleSetConditions } from "webpack"
import { rawRule, mjsRule, fileRule } from "./rules";
import { Pipeline } from "asset-pipeline/js/pipeline"
import { Source } from "asset-pipeline/js/source"

export type Options = {
  assets: {
    pipeline: Pipeline
    appSource: Source,
    rules: {
      file: RuleSetConditions,
      raw: RuleSetConditions,
    }
  }
}

export const Hooks: WK.ModuleHooks<Options> = {

  options() {
    const pipeline = new Pipeline("assets")
    const appSource = pipeline.source.add("./app")

    return {
      assets: {
        pipeline,
        appSource,
        rules: {
          file: [ /\.(jpe?g|png|gif|webp|webm|mp4|mp3|ogg)$/i ],
          raw: [ /\.(html|svg|vert|frag|glsl)$/i ],
        }
      }
    }
  },

  modules(config) {
    const pipeline = config.assets.pipeline
    const appSource = config.assets.appSource

    // Enable cache-break
    pipeline.cache.enabled = config.env.cache

    // Host path = "/" || "file://html_content/"
    pipeline.resolve.host = config.env.host

    // Override manifest
    pipeline.manifest.readOnDisk = false

    // Set output
    pipeline.resolve.output("dist")

    /**
     * Shadow add non-existing files to the manifest
     * With webpack, every non-js/ts entrypoints are grouped into bundle.js
     */
    appSource.file.shadow('bundle.js', { tag: 'bundle' })

    // Add asset_url/asset_path tranformer
    config.typescript.visitors.push(transformer(config as WK.ProjectConfig))

    // Expose global tranformers
    config.generate.files.push(typings(config as WK.ProjectConfig))

    // Expose assets to PAGE
    config.pageData.datas.push(addAssets(config as WK.ProjectConfig))
  },

  webpack(config) {
    config.webpack.module!.rules.push(fileRule(config))
    config.webpack.module!.rules.push(rawRule(config))
    config.webpack.module!.rules.push(mjsRule())
  }

}