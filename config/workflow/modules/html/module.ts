import { WK } from "../../types"
import { htmlEmitRule } from "./rules"

export type Options = {
  html: {
    resolveURLs: boolean
  }
}

export const Hooks: WK.ModuleHooks<Options> = {

  options() {
    return {
      html: {
        resolveURLs: true
      }
    }
  },

  onWebpackUpdate(config) {
    config.webpack.module!.rules.push(htmlEmitRule(config))
  }

}