import { WK } from "../../workflow/types";
import { VueLoaderOptions } from "vue-loader";
import VueLoaderPlugin from "vue-loader/lib/plugin";

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

  onWebpackUpdate({ webpack, vue }) {
    webpack.resolve!.extensions.push(".vue")
    webpack.resolve!.alias!["vue$"] = "vue/dist/vue.esm.js"
    webpack.module!.rules.unshift({
      test: /\.vue$/,
      loader: 'vue-loader',
      options: {
        productionMode: vue.productionMode,
        shadowMode: vue.shadowMode,
      } as VueLoaderOptions
    })
    webpack.plugins!.push(new VueLoaderPlugin())
  }

}
