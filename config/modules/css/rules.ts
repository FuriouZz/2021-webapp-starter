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
          esModule: false,
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