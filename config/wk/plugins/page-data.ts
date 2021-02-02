import { Plugin } from "../types";

export = <Plugin>{

  name: "page-data",

  setup(config) {
    const { runner: r } = config

    r.task("page-data:generate", async () => {
      const { options } = config
      const { generatePageData, } = await import("../lib/page-data")
      options.generate.files.push({
        filename: "app/scripts/generated/PAGE.ts",
        write: true,
        content: () => generatePageData(options.pageData.datas)
      })
    })

    r.task("page-data:ejs", () => {
      const { options } = config
      options.pageData.datas.push((data) => {
        data["ejs"] = options.ejs.data
      })
    })

    r.task("page-data:i18n", () => {
      const { options } = config
      options.pageData.datas.push((data) => {
        data["i18n"] = options.i18n.locales
      })
    })

    // Create subtask
    r.group("page-data")
      .pushBack("page-data:generate")
      .pushBack("page-data:ejs")
      .pushBack("page-data:i18n")
  }

}