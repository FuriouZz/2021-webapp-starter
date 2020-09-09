import { WK } from "../../workflow/types";
import ExtractCssChunks from "extract-css-chunks-webpack-plugin";
import { removeEntryGroup } from "../../workflow/utils/entry";

export type Options = {
  stylus: {
    // Enable css-modules (doc: https://github.com/css-modules/css-modules)
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
    const { webpack, env } = config

    webpack.plugins.push(new ExtractCssChunks({
      moduleFilename: ({ name }) => {
        return removeEntryGroup(name.replace(".js", ".css"))
      }
    }))

    // Stylus loader
    webpack.module!.rules.unshift({
      test: /\.styl(us)?$/i,
      include: webpack.context,
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
            modules: config.stylus.modules
          }
        },
        {
          loader: 'stylus-loader',
          options: {
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
