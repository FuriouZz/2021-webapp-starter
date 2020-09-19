import { WK } from "../../../workflow/types"
import { ejsHelpers } from "../helpers/ejs"

export type Options = {}

export const Hooks: WK.ModuleHooks<Options> = {

  onModulesUpdate(config) {
    ejsHelpers(config as WK.ProjectConfig)
  }

}