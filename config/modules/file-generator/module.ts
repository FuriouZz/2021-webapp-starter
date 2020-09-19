import { WK } from "../../workflow/types"
import { FileGeneratorPlugin, FileData } from "./file-generator-plugin"

export type Options = {
  generate: {
    output: string,
    files: FileData[]
  }
}

export const Hooks: WK.ModuleHooks<Options> = {

  options() {
    return {
      generate: {
        output: "app/scripts/generated",
        files: []
      }
    }
  },

  onWebpackUpdate(config) {
    config.webpack.plugins!.push(new FileGeneratorPlugin(config))
  }

}