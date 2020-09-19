import { WK } from "../../workflow/types"
import { htmlResolveRules } from "./rules"

export type Options = {}

export const Hooks: WK.ModuleHooks<Options> = {

  onWebpackUpdate(config) {
    config.webpack.module!.rules.push(htmlResolveRules(config))
  }

}