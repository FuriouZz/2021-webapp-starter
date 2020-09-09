import { WK } from "../../types"
import { RuleSetRule, RuleSetUseItem } from "webpack"

// Use this rule to emit files
export const fileRule = (config: WK.ProjectConfig) => {
  return {
    test: config.assets.rules.file,
    include: config.webpack.context,
    use: [
      useFileLoader(config, false)
    ]
  } as RuleSetRule
}

// Use raw loader every text files
export const rawRule = ({ assets, webpack }: WK.ProjectConfig) => {
  return {
    test: assets.rules.raw,
    include: webpack.context,
    use: [
      'raw-loader'
    ]
  } as RuleSetRule
}

// Use default javascript loader every .mjs files
export const mjsRule = () => {
  return {
    test: /\.(mjs)$/i,
    include: /node_modules/,
    type: "javascript/auto"
  } as RuleSetRule
}

export const htmRule = (config: WK.ProjectConfig) => {
  return {
    test: /\.html(.+)?/,
    use: [
      useFileLoader(config, false),
      "extract-loader"
    ]
  } as RuleSetRule
}

export function useFileLoader({ assets }: WK.ProjectConfig, esModule = false) {
  return {
    loader: 'file-loader',
    options: {
      esModule,
      outputPath(url: string, resourcePath: string, context: string) {
        const asset = assets.pipeline.getAsset(resourcePath)
        return asset ? assets.pipeline.getPath(asset.input) : url
      },
      publicPath(url: string, resourcePath: string, context: string) {
        const asset = assets.pipeline.getAsset(resourcePath)
        return asset ? assets.pipeline.getUrl(asset.input) : url
      },
    }
  } as RuleSetUseItem
}