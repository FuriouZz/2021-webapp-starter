import { WK } from "../../workflow/types"
import ExtractCssChunks from "extract-css-chunks-webpack-plugin";
import { RuleSetRule } from "webpack";

export const stylusRule: (config: WK.ProjectConfig) => RuleSetRule = (config) => {
  return {
    test: /\.styl(us)?$/i,
    include: config.webpack.context,
    use: [
      {
        loader: ExtractCssChunks.loader,
      },
      {
        loader: 'css-loader',
        options: {
          // Toggle ES module
          esModule: config.env.esModule,
          // Enable CSS modules
          modules: config.stylus.modules ? {
            mode: "global",
            localIdentName: '[local]_[hash:base64]',
            exportGlobals: true,
          } : false,
        }
      },
      {
        loader: 'stylus-loader',
        options: {
          use: config.stylus.use,
          set: {
            "include css": true,
            "compress": config.env.compress
          }
        }
      }
    ]
  }
}