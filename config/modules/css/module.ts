import { WK } from "../../workflow/types";
import ExtractCssChunks from "extract-css-chunks-webpack-plugin";
import { removeEntryGroup } from "../../workflow/utils/entry";

export type Options = {
  css: {
    // Enable css-modules (doc: https://github.com/css-modules/css-modules)
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

    webpack.plugins.push(new ExtractCssChunks({
      moduleFilename: ({ name }) => {
        return removeEntryGroup(name.replace(".js", ".css"))
      }
    }))

    // CSS loader
    webpack.module!.rules.unshift({
      test: /\.css$/i,
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
            modules: config.css.modules,
          }
        }
      ]
    })

  }

}
