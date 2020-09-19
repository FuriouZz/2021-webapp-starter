import { WK } from "../../workflow/types";

export type Options = {}

export const Hooks: WK.ModuleHooks<Options> = {

  onWebpackUpdate(config) {
    // config.webpack.resolve!.alias!["vue$"] = "vue/dist/vue.esm.js"
  }

}
