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
        options: {
          esModule: false
        }
      },
      {
        loader: 'css-loader',
        options: {
          // Do use export default
          esModule: false,

          // Do not resolt URLS
          url: false,

          // Enable CSS modules
          modules: config.stylus.modules ? {
            mode: "local",
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