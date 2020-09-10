import { WK } from "../../types"
import { transformer, typings } from "./transfomer"
import { addAssets } from "./page-data"
import { RuleSetConditions } from "webpack"
import { rawRule, mjsRule, fileRule } from "./rules";
import { Pipeline } from "asset-pipeline/js/pipeline"
import { ANY_ENTRY_REGEX } from "../../utils/entry";
import IgnoreEmitWebpackPlugin from "ignore-emit-webpack-plugin";

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
    const pipeline = new Pipeline("asset")

    return {
      assets: {
        pipeline,
        hashKey: "",
        rules: {
          file: [ /\.(jpe?g|png|gif|webp|webm|mp4|mp3|ogg)$/i ],
          raw: [ /\.(svg|vert|frag|glsl)(\.ejs)?$/i ],
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
    pipeline.host.setOrigin(config.env.host)

    // Override manifest
    pipeline.manifest.readOnDisk = false

    // Set output
    pipeline.output.set(config.env.output)

    // Export file with entry:html tags
    const HTML_ENTRY_REGEX = /entry:html$/
    const HTML_REGEX = /\.html(\.ejs)?$/
    config.assets.rules.file.push((resourcePath) => {
      const asset = config.assets.pipeline.getAsset(resourcePath)
      return !!asset && HTML_ENTRY_REGEX.test(asset.tag)
    })
    // Accept HTML in JS
    config.assets.rules.raw.push((resourcePath) => {
      if (!HTML_REGEX.test(resourcePath)) return false
      const asset = config.assets.pipeline.getAsset(resourcePath)
      return !asset || !HTML_ENTRY_REGEX.test(asset.tag)
    })

    // Add asset_url/asset_path tranformer
    config.typescript.visitors.push(transformer(config as WK.ProjectConfig))

    // Expose global tranformers
    config.generate.files.push(typings(config as WK.ProjectConfig))

    // Expose assets to PAGE
    config.pageData.datas.push(addAssets(config as WK.ProjectConfig))

    // Trick to bypass type-checker
    if (config["ejs"]) {
      // Add asset_path() helper
      config["ejs"].helpers.asset_path = function () {
        const source_path = this.context.resourcePath
        return function (path: string, from?: string) {
          return config.assets.pipeline.getPath(path, { from: from || source_path })
        }
      }

      // Add asset_url() helper
      config["ejs"].helpers.asset_url = function () {
        const source_path = this.context.resourcePath
        return function (path: string, from?: string) {
          return config.assets.pipeline.getUrl(path, { from: from || source_path })
        }
      }
    }
  },

  onWebpackUpdate(config) {
    config.webpack.module!.rules.push(fileRule(config))
    config.webpack.module!.rules.push(rawRule(config))
    config.webpack.module!.rules.push(mjsRule())
    config.webpack.plugins!.push(new IgnoreEmitWebpackPlugin(ANY_ENTRY_REGEX, { debug: true }))
  }

}