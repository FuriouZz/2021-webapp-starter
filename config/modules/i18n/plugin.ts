import { Compiler } from 'webpack'
import { Data, load, LoadOptions } from './airtable'

export type I18nAirtablePluginOptions = LoadOptions & {
  locales: Record<string, Data>
}

export class I18nAirtablePlugin {

  private _loaded = false

  constructor(protected config: I18nAirtablePluginOptions) { }

  apply(compiler: Compiler) {
    compiler.hooks.beforeCompile.tapPromise('I18nAirtablePlugin.load', this.load.bind(this))
  }

  async load() {
    if (!this._loaded) {
      this._loaded = true
      this.config.locales = await load(this.config)
    }
  }

}