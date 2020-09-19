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
      },
      {
        loader: 'css-loader',
        options: {
          // Toggle ES module
          esModule: config.env.esModule,
          // Enable CSS modules
          modules: config.css.modules ? {
            mode: "global",
            localIdentName: '[local]_[hash:base64]',
            exportGlobals: true,
          } : false,
        }
      }
    ]
  }
}