import { WK } from "../../workflow/types";
import { ZipPlugin } from "./plugin";

export type Options = {
  zip: {
    enabled: boolean,
    exclude?: string[],
  }
}

export const Hooks: WK.ModuleHooks<Options> = {

  options() {
    return {
      zip: {
        enabled: true,
        exclude: []
      }
    }
  },

  onWebpackUpdate({ webpack, assets, zip }) {
    if (zip.enabled) {
      const output = assets.pipeline.output.os()
      webpack.plugins.push(new ZipPlugin({
        input: output,
        output:  output + '.zip',
        exclude: zip.exclude.slice(0)
      }))
    }
  }

}