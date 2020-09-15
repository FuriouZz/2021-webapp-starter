import { WK } from "../../types"
import { RuleSetRule, RuleSetUseItem } from "webpack"

// Use this rule to emit files
export const fileRule = (config: WK.ProjectConfig) => {
  return {
    test: config.assets.rules.file,
    include: config.webpack.context,
    use: [
      getFileRule(config)
    ]
  } as RuleSetRule
}

// Use raw loader for every text files
export const rawRule = ({ assets, webpack, env }: WK.ProjectConfig) => {
  return {
    test: assets.rules.raw,
    include: webpack.context,
    use: [
      {
        loader: "raw-loader",
        options: {
          // Toggle ES module
          esModule: env.esModule,
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

type FileLoaderOptions = {
  emitFile?: boolean
}

export function getFileRule({ assets, env }: WK.ProjectConfig, opts: FileLoaderOptions = {}) {
  const options = Object.assign({
    emitFile: true,
  }, opts)

  return {
    loader: 'file-loader',
    options: {
      // Toggle ES module
      esModule: env.esModule,

      // Emit files
      emitFile: options.emitFile,

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