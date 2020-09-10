import { WK } from "../../types"
import { RuleSetRule } from "webpack"

// Use this rule to emit files
export const fileRule = (config: WK.ProjectConfig) => {
  return {
    test: config.assets.rules.file,
    include: config.webpack.context,
    use: [
      {
        loader: 'file-loader',
        options: {
          esModule: false,
          outputPath(url: string, resourcePath: string, context: string) {
            const asset = config.assets.pipeline.getAsset(resourcePath)
            return asset ? config.assets.pipeline.getPath(asset.input) : url
          },
          publicPath(url: string, resourcePath: string, context: string) {
            const asset = config.assets.pipeline.getAsset(resourcePath)
            return asset ? config.assets.pipeline.getUrl(asset.input) : url
          },
        }
      }
    ]
  } as RuleSetRule
}

// Use raw loader for every text files
export const rawRule = ({ assets, webpack }: WK.ProjectConfig) => {
  return {
    test: assets.rules.raw,
    include: webpack.context,
    use: [
      {
        loader: "raw-loader",
        options: {
          esModule: false
        }
      }
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