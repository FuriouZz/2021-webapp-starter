import { WK } from "../../workflow/types";
import { RuleSetRule } from "webpack";
import { VueLoaderOptions } from "vue-loader";

export const vueRule: (config: WK.ProjectConfig) => RuleSetRule = (config) => {
  return {
    test: /\.vue$/,
    loader: 'vue-loader',
    options: {
      productionMode: config.vue.productionMode,
      shadowMode: config.vue.shadowMode,

      // Do not transform asset url
      transformAssetUrls: {},
    } as VueLoaderOptions
  }
}