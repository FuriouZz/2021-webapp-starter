import { AssetPipeline } from "asset-pipeline/js"
import options from "../options"
import { Plugin } from "../types"
import { Runner } from "./runner"

export class Config {
  pipeline = new AssetPipeline("asset")
  runner = new Runner<Config>()
  options = options

  private _plugins = new Map<string, Plugin>()

  constructor() {
    this.plugin = this.plugin.bind(this)
    this.execute = this.execute.bind(this)
  }

  async plugin(mod: Plugin) {
    if (!this._plugins.has(mod.name)) {
      this._plugins.set(mod.name, mod)

      if (typeof mod.setup === "function") {
        const ret = mod.setup(this)
        if (typeof ret === "object" && typeof ret.then === "function") {
          await ret
        }
      }
    }
  }

  execute(stack: string) {
    return this.runner.execute(stack, this)
  }
}