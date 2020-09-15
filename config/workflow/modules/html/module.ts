import { WK } from "../../types"
import { htmlEmitRule } from "./rules"

export type Options = {}

export const Hooks: WK.ModuleHooks<Options> = {

  onWebpackUpdate(config) {
    config.webpack.module!.rules.push(htmlEmitRule(config))
  }

}