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

export function useFileLoader({ assets }: WK.ProjectConfig, esModule = false) {
  return {
    loader: 'file-loader',
    options: {
      esModule,
      outputPath(url: string, resourcePath: string, context: string) {
        const path = assets.pipeline.resolve.parse(resourcePath)
        return path.key ? assets.pipeline.resolve.getPath(path.key) : path.key
      },
      publicPath(url: string, resourcePath: string, context: string) {
        const path = assets.pipeline.resolve.parse(resourcePath)
        return path.key ? assets.pipeline.resolve.getUrl(path.key) : path.key
      },
    }
  } as RuleSetUseItem
}