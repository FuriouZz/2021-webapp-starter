import { ModuleHooks as CustomHooks } from "../modules/modules"
import { ModuleHooks as DefaultHooks } from "./modules/modules"
import { WK } from "./types"

export class Hooks {

  private static _hooks = new Set([...DefaultHooks, ...CustomHooks])

  static add(hooks: WK.ModuleHooks) {
    Hooks._hooks.add(hooks)
  }

  static call(key: "options", options: WK.ModuleConfig): void
  static call(key: "onModulesUpdate", config: Pick<WK.ProjectConfig, "env" | keyof WK.ModuleConfig>): void
  static call(key: "afterModulesUpdate", config: Pick<WK.ProjectConfig, "env" | keyof WK.ModuleConfig>): void
  static call(key: "onEnvUpdate", config: Pick<WK.ProjectConfig, "env" | keyof WK.ModuleConfig>): void
  static call(key: "afterEnvUpdate", config: Pick<WK.ProjectConfig, "env" | keyof WK.ModuleConfig>): void
  static call(key: "onAssetsUpdate", config: Pick<WK.ProjectConfig, "env" | keyof WK.ModuleConfig>): void
  static call(key: "afterAssetsUpdate", config: Pick<WK.ProjectConfig, "env" | keyof WK.ModuleConfig>): void
  static call(key: "onWebpackUpdate", config: Pick<WK.ProjectConfig, "env" | keyof WK.ModuleConfig | "webpack">): void
  static call(key: "afterWebpackUpdate", config: Pick<WK.ProjectConfig, "env" | keyof WK.ModuleConfig | "webpack">): void
  static call(key: keyof WK.ModuleHooks, arg0: any): any {
    for (const m of Hooks._hooks) {
      if (key in m) {
        if (key === "options") {
          Object.assign(arg0, m[key]!())
        } else {
          m[key]!(arg0)
        }
      }
    }
  }

}