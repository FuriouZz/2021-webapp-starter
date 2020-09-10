import { WK } from "../../workflow/types";
import ExtractCssChunks from "extract-css-chunks-webpack-plugin";
import { removeEntryGroup } from "../../workflow/utils/entry";
import { stylusRule } from "./rules";

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
    config.webpack.plugins.push(new ExtractCssChunks({
      moduleFilename: ({ name }) => {
        return removeEntryGroup(name.replace(".js", ".css"))
      }
    }))

    config.webpack.module!.rules.unshift(stylusRule(config))
  }

}
