import { WK } from "../../types"
import { transformer } from "./transfomer"
import { RuleSetCondition } from "webpack"
import { rawRule, mjsRule, fileRule, htmlRule } from "./rules";
import { Pipeline } from "asset-pipeline/js/pipeline"
import { ANY_ENTRY_REGEX } from "../../utils/entry";
import { AssetPipelinePlugin } from "./asset-pipeline-plugin";
import { basename, extname } from "path";

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

    // Add asset_url/asset_path tranformer
    config.typescript.visitors.push(transformer(config as WK.ProjectConfig))

    // Expose global tranformers
    config.generate.files.push({
      filename: "assets.d.ts",
      content() {
        let content = ""
        content += `import { PAGE } from "./${basename(config.pageData.filename, extname(config.pageData.filename))}"\n`
        content += `declare global {\n`
        content += `  export function asset_path(key: keyof typeof PAGE["assets"]): string\n`
        content += `  export function asset_url(key: keyof typeof PAGE["assets"]): string\n`
        content += `}\n`
        return content
      }
    })

    // Expose assets to PAGE
    config.pageData.datas.push(async (data) => {
      config.assets.pipeline.fetch(true)
      const entries = Object.entries(config.assets.pipeline.manifest.export("output_key"))
      const outputs: Record<string, { path: string, url: string }> = {}
      for (const [key, value] of entries) {
        outputs[key] = value.output
      }
      data["assets"] = outputs
    })

    // Trick to bypass type-checker
    if (config["ejs"]) {
      const { ejsHelpers } = require("./ejs-helpers");
      ejsHelpers(config as WK.ProjectConfig)
    }

    if (config["stylus"]) {
      const { StylusPluginFactory } = require("./stylus-plugin")
      config["stylus"].use.push(StylusPluginFactory(config as WK.ProjectConfig))
    }
  },

  onWebpackUpdate(config) {
    config.webpack.module!.rules.push(fileRule(config))
    config.webpack.module!.rules.push(rawRule(config))
    config.webpack.module!.rules.push(htmlRule(config))
    config.webpack.module!.rules.push(mjsRule())
    config.webpack.plugins!.push(new AssetPipelinePlugin(config))
  }

}