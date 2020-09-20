import { WK } from "../../workflow/types"
import { pageData, transformer, typing } from "./helpers/typescript"
import { RuleSetCondition } from "webpack"
import { assetRule, mjsRule } from "./rules";
import { Pipeline } from "asset-pipeline/js/pipeline"
import { ANY_ENTRY_REGEX } from "../../workflow/utils/entry";
import { AssetPipelinePlugin } from "./asset-pipeline-plugin";

export type Options = {
  assets: {
    pipeline: Pipeline
    hashKey: string,
    ignoreEmit: (string | RegExp)[]
    requireText: RuleSetCondition[],
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
        requireText: [ /\.(txt|md|svg|vert|frag|glsl)(\.ejs)?$/i ],
      }
    }
  },

  onModulesUpdate(config) {
    const pipeline = config.assets.pipeline

    pipeline.cache.saltKey = config.assets.hashKey

    // Enable cache-break
    pipeline.cache.enabled = config.env.cache

    // Origin
    pipeline.host.setURL(config.env.host)

    // Override manifest
    pipeline.manifest.readOnDisk = false

    // Set output
    pipeline.output.set(config.env.output)

    // Typescript helpers
    config.typescript.visitors.push(transformer(config as WK.ProjectConfig))
    config.generate.files.push(typing(config as WK.ProjectConfig))
    config.page.datas.push(pageData(config as WK.ProjectConfig))
  },

  onWebpackUpdate(config) {
    config.webpack.module!.rules.push(assetRule(config))
    config.webpack.module!.rules.push(mjsRule())
    config.webpack.plugins!.push(new AssetPipelinePlugin(config))
  }

}