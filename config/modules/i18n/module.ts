import { WK } from "../../workflow/types";
import { Data, LoadOptions } from "./airtable"
import { I18nAirtablePlugin } from "./plugin"

export type Options = {
  i18n: LoadOptions & {
    locales: Record<string, Data>
  }
}

export const Hooks: WK.ModuleHooks<Options> = {

  options() {
    return {
      i18n: {
        apiKey: process.env['AIRTABLE_API_KEY'],
        fetch: true,
        tables: {
          // "i18n": {
          //   appId: "",
          //   view: "All",
          //   tabs: [ "i18n" ],
          //   flatten: true,
          //   // output: "config/data/i18n.json",
          //   key: "key",
          //   category: "category",
          //   ignoreColumns: ['ID', 'key', 'description', 'category']
          // }
        },
        locales: {}
      }
    }
  },

  onModulesUpdate({ pageData }) {
    pageData.datas.push(async (data, { i18n }) => {
      data["locales"] = i18n.locales
    })
  },

  onWebpackUpdate({ webpack, i18n }) {
    webpack.plugins!.push(new I18nAirtablePlugin(i18n))
  }

}