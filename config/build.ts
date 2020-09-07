import { CreateWebpackConfig } from "./workflow/build";

export default CreateWebpackConfig({

  // env({ env }) {
  //   // Example: Override watch
  //   env.watch = true
  // },

  onModulesUpdate({ typescript }) {
    typescript.build = "fast"
    // modules.i18n.tables["i18n"] = {
    //   appId: process.env['AIRTABLE_APP_ID'],
    //   view: "All",
    //   tabs: [ "Localisation view" ],
    //   flatten: true,
    // }
  },

  onAssetsUpdate(config) {
    const { pipeline } = config.assets

    // Change output
    pipeline.resolve.output("dist")

    // Typescript
    const scripts = pipeline.source.add("app/scripts")
    scripts.file.add("main.ts", {
      output: { ext: ".js" },
      cache: config.env.cache,
      tag: 'entry',
    })

    // Views
    const views = pipeline.source.add("app/views")
    views.file.ignore("**/_*.ejs")
    views.file.add("**/*.ejs", {
      output: { ext: ".html" },
      cache: false,
      tag: 'html'
    })

    // Stylus
    const styles = pipeline.source.add("app/styles")
    styles.file.add("common.styl", {
      output: { ext: ".css" },
      cache: config.env.cache,
      tag: 'entry'
    })

    // Assets
    const assets = pipeline.source.add("app/assets")
    assets.file.add("**/*", {
      output: { dir: "assets/#{output.dir}" },
      cache: config.env.cache ? {
        dir: "assets/#{output.dir}",
        name: "#{output.name}-#{output.hash}",
      } : false,
      tag: "asset",
    })
  }

})