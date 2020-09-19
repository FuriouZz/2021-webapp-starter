import { WK } from "../../../workflow/types"
import { StylusPluginFactory } from "../helpers/stylus"

export type Options = {}

export const Hooks: WK.ModuleHooks<Options> = {

  onModulesUpdate(config) {
    config["stylus"].use.push(StylusPluginFactory(config as WK.ProjectConfig))
  }

}