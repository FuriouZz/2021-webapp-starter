import { WK } from "../../workflow/types";
import { useFileLoader } from "../../workflow/modules/asset-pipeline/rules";

export type Options = {
  css: {
    modules: boolean
  }
}

export const Hooks: WK.ModuleHooks<Options> = {

  options() {
    return {
      css: {
        modules: false
      }
    }
  },

  onWebpackUpdate(config) {
    const { webpack } = config

    // CSS loader
    webpack.module!.rules.unshift({
      test: /\.css$/i,
      include: webpack.context,
      use: [
        useFileLoader(config, false),
        "extract-loader",
        {
          loader: 'css-loader',
          options: {
            esModule: false,
            modules: config.css.modules
          }
        }
      ]
    })

  }

}
