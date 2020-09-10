import { WK } from "../../workflow/types";
import VueLoaderPlugin from "vue-loader/lib/plugin";
import { vueRule } from "./rules";

export type Options = {
  vue: {
    shadowMode: boolean,
    productionMode: boolean
  }
}

export const Hooks: WK.ModuleHooks<Options> = {

  options() {
    return {
      vue: {
        shadowMode: false,
        productionMode: false,
      }
    }
  },

  onModulesUpdate({ env, vue }) {
    vue.productionMode = env.target !== "development"
  },

  onWebpackUpdate(config) {
    config.webpack.resolve!.extensions.push(".vue")
    config.webpack.resolve!.alias!["vue$"] = "vue/dist/vue.esm.js"
    config.webpack.module!.rules.unshift(vueRule(config))
    config.webpack.plugins!.push(new VueLoaderPlugin())
  }

}
