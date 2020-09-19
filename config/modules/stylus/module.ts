import { WK } from "../../workflow/types";
import ExtractCssChunks from "extract-css-chunks-webpack-plugin";
import { removeEntryGroup } from "../../workflow/utils/entry";
import { stylusRule } from "./rules";

export type Options = {
  stylus: {
    // Enable css-modules (doc: https://github.com/css-modules/css-modules)
    modules: boolean,
    use: ((styl: any) => void)[],
  }
}

export const Hooks: WK.ModuleHooks<Options> = {

  options() {
    return {
      stylus: {
        modules: false,
        use: []
      }
    }
  },

  onWebpackUpdate(config) {
    config.webpack.plugins.push(new ExtractCssChunks({
      moduleFilename: ({ name }) => {
        const asset = config.assets.pipeline.manifest.findAssetFromOutput(name)
        if (asset) {
          const input = asset.input.replace(/\.(ts|js)x?/, ".css")
          return config.assets.pipeline.host.pathname.relative(config.assets.pipeline.getPath(input)).web()
        }
        return removeEntryGroup(name.replace(/\.(ts|js)x?/, ".css"))
      }
    }))

    config.webpack.module!.rules.unshift(stylusRule(config))
  }

}
