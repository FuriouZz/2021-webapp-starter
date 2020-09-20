import { WK } from "../../workflow/types"
import { RuleSetRule, RuleSetUseItem } from "webpack"
import { ANY_ENTRY_TAG_REGEX } from "../../workflow/utils/entry"

// Use raw loader for every text files
export const assetRule = (config: WK.ProjectConfig) => {
  const { assets, webpack, env } = config
  return {
    include: webpack.context,
    oneOf: [
      {
        loader: "raw-loader",
        test: assets.requireText,
        issuer: /\.(t|j)sx?$/,
        options: {
          // Toggle ES module
          esModule: env.esModule,
        }
      },

      {
        test(resourcePath: string) {
          const asset = assets.pipeline.manifest.getAsset(resourcePath)
          return asset && !ANY_ENTRY_TAG_REGEX.test(asset.tag)
        },
        include: webpack.context,
        use: [
          getFileRule(config)
        ]
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
        const asset = assets.pipeline.manifest.getAsset(resourcePath)
        return asset ? assets.pipeline.host.pathname.relative(assets.pipeline.getPath(asset.input)).web() : url
      },
      publicPath(url: string, resourcePath: string, context: string) {
        const asset = assets.pipeline.manifest.getAsset(resourcePath)
        return asset ? assets.pipeline.getUrl(asset.input) : url
      },
    }
  } as RuleSetUseItem
}