import { WK } from "../../workflow/types"
import ExtractCssChunks from "extract-css-chunks-webpack-plugin";
import { RuleSetRule } from "webpack";

export const cssRule: (config: WK.ProjectConfig) => RuleSetRule = (config) => {
  return {
    test: /\.css?$/i,
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
          modules: config.css.modules ? {
            mode: "local",
            localIdentName: '[local]_[hash:base64]',
            exportGlobals: true,
          } : false,
        }
      }
    ]
  }
}