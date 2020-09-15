import { RuleSetRule, RuleSetUseItem } from "webpack"
import { WK } from "../../types"
import { getFileRule } from "../asset-pipeline/rules"

export const htmlEmitRule = (config: WK.ProjectConfig) => {
  const { assets, webpack } = config
  const HTML_ENTRY_REGEX = /entry:html$/

  return {
    test: /\.html(\.ejs)?$/i,
    include: webpack.context,
    oneOf: [
      // Export file with entry:html tags
      {
        test(resourcePath) {
          const asset = assets.pipeline.getAsset(resourcePath)
          return !!asset && HTML_ENTRY_REGEX.test(asset.tag)
        },
        use: [
          getFileRule(config),
          "extract-loader",
          getHTMLLoaderRule()
        ]
      },

      // Else, accept HTML in JS
      {
        use: [
          getHTMLLoaderRule()
        ]
      }
    ]
  } as RuleSetRule
}

export function getHTMLLoaderRule() {
  return {
    loader: "html-loader",
    options: {
      minimize: false
    }
  } as RuleSetUseItem
}