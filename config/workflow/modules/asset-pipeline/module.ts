import { WK } from "../../types"
import { transformer, typings } from "./transfomer"
import { addAssets } from "./page-data"
import { RuleSetConditions } from "webpack"
import { rawRule, mjsRule, fileRule } from "./rules";
import { Pipeline } from "asset-pipeline/js/pipeline"

export type Options = {
  assets: {
    pipeline: Pipeline
    hashKey: string,
    rules: {
      file: RuleSetConditions,
      raw: RuleSetConditions,
    }
  }
}

export const Hooks: WK.ModuleHooks<Options> = {

  options() {
    const pipeline = new Pipeline("")

    return {
      assets: {
        pipeline,
        hashKey: "",
        rules: {
          file: [ /\.(jpe?g|png|gif|webp|webm|mp4|mp3|ogg)$/i ],
          raw: [ /\.(html|svg|vert|frag|glsl)$/i ],
        }
      }
    }
  },

  onModulesUpdate(config) {
    const pipeline = config.assets.pipeline

    pipeline.cache.key = config.assets.hashKey

    // Enable cache-break
    pipeline.cache.enabled = config.env.cache

    // Host path = "/" || "file://html_content/"
    pipeline.resolve.host = config.env.host

    // Override manifest
    pipeline.manifest.readOnDisk = false

    // Set output
    pipeline.resolve.output(config.env.output)

    // Add asset_url/asset_path tranformer
    config.typescript.visitors.push(transformer(config as WK.ProjectConfig))

    // Expose global tranformers
    config.generate.files.push(typings(config as WK.ProjectConfig))

    // Expose assets to PAGE
    config.pageData.datas.push(addAssets(config as WK.ProjectConfig))

    if (config["ejs"]) {
      // Add asset_path() helper
      config["ejs"].helpers.asset_path = function () {
        const source_path = this.context.resourcePath
        return function (path: string, from?: string) {
          return config.assets.pipeline.resolve.getPath(path, { from: from || source_path })
        }
      }

      // Add asset_url() helper
      config["ejs"].helpers.asset_url = function () {
        const source_path = this.context.resourcePath
        return function (path: string, from?: string) {
          return config.assets.pipeline.resolve.getUrl(path, { from: from || source_path })
        }
      }
    }
  },

  onWebpackUpdate(config) {
    config.webpack.module!.rules.push(fileRule(config))
    config.webpack.module!.rules.push(rawRule(config))
    config.webpack.module!.rules.push(mjsRule())
  }

}