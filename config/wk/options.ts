import { ProjectOptions } from "./types";

export default <ProjectOptions>{
  env: {
    target: process.env["NODE_ENV"] || "development",
    watch: false,
    reload: true,
    https: false,
    host: "/",
    cache: false,
    compress: false,
    output: "public",
    server: false,
  },
  target: {
    path: "config/targets",
    target: process.env["NODE_ENV"] || "development",
  },
  ejs: {
    imports: {},
    helpers: {},
    data: {},
    extract: true
  },
  stylus: {
    use: []
  },
  pageData: {
    datas: []
  },
  generate: {
    files: []
  },
  deploy: {
    include: [ "**/*" ],
    exclude: [],
    ftp: {
      output: "www",
    },
    aws: {
      bucket: "mywebsite.com",
    }
  },
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
  },
  preRenderSPA: {
    routes: [],
  },
  build: {
    entries: [],
  }
}