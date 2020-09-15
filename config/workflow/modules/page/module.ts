import { WK } from "../../types"

export type PageDataFunction = (data: Record<string, any>) => Promise<void>

export type Options = {
  page: {
    filename: string,
    datas: PageDataFunction[]
  }
}

export const Hooks: WK.ModuleHooks<Options> = {

  options() {
    return {
      page: {
        filename: "PAGE.ts",
        datas: [],
      }
    }
  },

  onModulesUpdate(config) {
    config.generate.files.push({
      filename: config.page.filename,
      content: async () => {
        const data: Record<string, any> = {}
        const options = config.page
        const fetchs = options.datas

        const ps = fetchs.map(async fetch => {
          const res = fetch(data)
          if ("then" in res) await res
        })

        await Promise.all(ps)

        return `export const PAGE = ${JSON.stringify(data, null, 2)}`
      }
    })
  }

}