import { WK } from "../../workflow/types";
import { RuleSetRule } from "webpack";

export const ejsRule: (config: WK.ProjectConfig) => RuleSetRule = (config) => {
  return {
    test: /\.ejs$/i,
    enforce: "pre",
    include: config.webpack.context,
    use: [
      {
        loader: __dirname + "/ejs-loader.js",
        options: {
          esModule: false,
          ...config.ejs
        }
      }
    ]
  }
}