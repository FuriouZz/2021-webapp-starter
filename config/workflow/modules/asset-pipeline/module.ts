import { WK } from "../../types"
import { pageData, transformer, typing } from "./helpers/typescript"
import { RuleSetCondition } from "webpack"
import { rawRule, mjsRule, fileRule } from "./rules";
import { Pipeline } from "asset-pipeline/js/pipeline"
import { ANY_ENTRY_REGEX } from "../../utils/entry";
import { AssetPipelinePlugin } from "./asset-pipeline-plugin";

export type Options = {
  assets: {
    pipeline: Pipeline
    hashKey: string,
    ignoreEmit: (string | RegExp)[]
    rules: {
      file: RuleSetCondition[],
      raw: RuleSetCondition[],
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
        ignoreEmit: [ ANY_ENTRY_REGEX ],
        rules: {
          file: [],
          raw: [],
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

    // Accept text files as raw content
    config.assets.rules.raw.push(/\.(svg|vert|frag|glsl)(\.ejs)?$/i)

    // Copy any binary files
    config.assets.rules.file.push(/\.(gif|png|jpe?g|webp|mp3|ogg|mp4|webm|otf|ttf|woff2?)$/i)

    // Typescript helpers
    config.typescript.visitors.push(transformer(config as WK.ProjectConfig))
    config.generate.files.push(typing(config as WK.ProjectConfig))
    config.page.datas.push(pageData(config as WK.ProjectConfig))

    // EJS Helpers
    if (config["ejs"]) {
      const { ejsHelpers } = require("./helpers/ejs");
      ejsHelpers(config as WK.ProjectConfig)
    }

    // Stylus helpers
    if (config["stylus"]) {
      const { StylusPluginFactory } = require("./helpers/stylus")
      config["stylus"].use.push(StylusPluginFactory(config as WK.ProjectConfig))
    }
  },

  onWebpackUpdate(config) {
    config.webpack.module!.rules.push(fileRule(config))
    config.webpack.module!.rules.push(rawRule(config))
    config.webpack.module!.rules.push(mjsRule())
    config.webpack.plugins!.push(new AssetPipelinePlugin(config))
  }

}