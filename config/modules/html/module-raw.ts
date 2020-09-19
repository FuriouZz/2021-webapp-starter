import { WK } from "../../workflow/types"
import { htmlRawRules } from "./rules"

export type Options = {}

export const Hooks: WK.ModuleHooks<Options> = {

  onWebpackUpdate(config) {
    config.webpack.module!.rules.push(htmlRawRules(config))
  }

}