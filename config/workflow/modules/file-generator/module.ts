import { WK } from "../../types"
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
        output: "scripts/generated",
        files: []
      }
    }
  },

  onWebpackUpdate(config) {
    config.webpack.plugins!.push(new FileGeneratorPlugin(config))
  }

}