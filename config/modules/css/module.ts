import { WK } from "../../workflow/types";
import ExtractCssChunks from "extract-css-chunks-webpack-plugin";
import { removeEntryGroup } from "../../workflow/utils/entry";
import { cssRule } from "./rules";

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
    config.webpack.plugins.push(new ExtractCssChunks({
      moduleFilename: ({ name }) => {
        return removeEntryGroup(name.replace(".js", ".css"))
      }
    }))

    // CSS loader
    config.webpack.module!.rules.unshift(cssRule(config))
  }

}
