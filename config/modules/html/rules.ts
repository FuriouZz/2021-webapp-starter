import { RuleSetRule, RuleSetUseItem } from "webpack"
import { WK } from "../../workflow/types"
import { getFileRule } from "../asset-pipeline/rules"

export const htmlRawRules: (config: WK.ProjectConfig) => RuleSetRule = (config) => {
  const { assets, webpack } = config
  const HTML_ENTRY_REGEX = /entry:html$/

  return {
    test: /\.html(\.ejs)?$/i,
    include: webpack.context,
    oneOf: [
      // Export file with entry:html tags
      {
        test(resourcePath) {
          const asset = assets.pipeline.manifest.getAsset(resourcePath)
          return !!asset && HTML_ENTRY_REGEX.test(asset.tag)
        },
        use: [
          getFileRule(config),
        ]
      },

      // Else, accept HTML in JS
      {
        use: [
          "raw-loader"
        ]
      }
    ]
  } as RuleSetRule
}

export const htmlResolveRules: (config: WK.ProjectConfig) => RuleSetRule = (config) => {
  const { assets, webpack, env } = config
  const HTML_ENTRY_REGEX = /entry:html$/

  return {
    test: /\.html(\.ejs)?$/i,
    include: webpack.context,
    oneOf: [
      // Export file with entry:html tags
      {
        test(resourcePath) {
          const asset = assets.pipeline.manifest.getAsset(resourcePath)
          return !!asset && HTML_ENTRY_REGEX.test(asset.tag)
        },
        use: [
          getFileRule(config),
          "extract-loader",
          getHTMLLoaderRule(config)
        ]
      },

      // Else, accept HTML in JS
      {
        use: [
          getHTMLLoaderRule(config)
        ]
      }
    ]
  } as RuleSetRule
}

export function getHTMLLoaderRule({ env }: WK.ProjectConfig) {
  return {
    loader: "html-loader",
    options: {
      // HTML minimizer
      minimize: false,

      // Toggle ES module
      esModule: env.esModule,
    }
  } as RuleSetUseItem
}