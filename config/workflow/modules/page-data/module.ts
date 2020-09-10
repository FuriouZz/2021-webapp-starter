import { WK } from "../../types"

export type PageDataFunction = (data: Record<string, any>) => Promise<void>

export type Options = {
  pageData: {
    filename: string,
    datas: PageDataFunction[]
  }
}

export const Hooks: WK.ModuleHooks<Options> = {

  options() {
    return {
      pageData: {
        filename: "PAGE.ts",
        datas: [],
      }
    }
  },

  onModulesUpdate(config) {
    config.generate.files.push({
      filename: config.pageData.filename,
      content: async () => {
        const data: Record<string, any> = {}
        const options = config.pageData
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