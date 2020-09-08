import { StylusPluginFactory } from "./plugin";
import { WK } from "../../workflow/types";
import { useFileLoader } from "../../workflow/modules/asset-pipeline/rules";

export type Options = {
  stylus: {
    modules: boolean
  }
}

export const Hooks: WK.ModuleHooks<Options> = {

  options() {
    return {
      stylus: {
        modules: false
      }
    }
  },

  onWebpackUpdate(config) {
    const { webpack, env, assets } = config

    // Stylus loader
    webpack.module!.rules.unshift({
      test: /\.styl(us)?$/i,
      include: webpack.context,
      use: [
        useFileLoader(config, false),
        "extract-loader",
        {
          loader: 'css-loader',
          options: {
            esModule: false,
            modules: config.stylus.modules
          }
        },
        {
          loader: 'stylus-loader',
          options: {
            use: [StylusPluginFactory(assets.pipeline)],
            set: {
              "include css": true,
              "compress": env.compress
            }
          }
        }
      ]
    })

  }

}
