import { CreateWebpackConfig } from "./workflow/build";

export default CreateWebpackConfig({

  onModulesUpdate({ typescript, preRenderSPA, env, stylus }) {
    typescript.build = "fast"
    // modules.i18n.tables["i18n"] = {
    //   appId: process.env['AIRTABLE_APP_ID'],
    //   view: "All",
    //   tabs: [ "Localisation view" ],
    //   flatten: true,
    // }

    // Enable modules from css-loader (Documentation here: https://github.com/webpack-contrib/css-loader#modules)
    stylus.modules = true

    // Prerendering
    preRenderSPA.enabled = !env.server
    preRenderSPA.routes.push('/hello', '/hola')
  },

  onAssetsUpdate(config) {
    const { pipeline } = config.assets

    // Typescript
    const scripts = pipeline.source.add("app/scripts")
    scripts.file.add("main.ts", {
      output: { ext: ".js" },
      cache: config.env.cache,
      tag: "entry:js",
    })

    // Views
    const views = pipeline.source.add("app/views")
    views.file.ignore("**/_*.ejs")
    views.file.add("**/*.ejs", {
      output: { ext: ".html" },
      cache: false,
      tag: "entry:html"
    })

    // Stylus (only common css)
    const styles = pipeline.source.add("app/styles")
    styles.file.add("**/*.styl", {
      output: { ext: ".css" },
      cache: config.env.cache,
      tag: "entry:css"
    })

    // Assets
    const assets = pipeline.source.add("app/assets")
    assets.file.add("**/*", {
      output: { dir: "assets/#{output.dir}" },
      cache: config.env.cache ? {
        dir: "assets/#{output.dir}",
        name: "#{output.name}-#{output.hash}#{ouput.ext}",
      } : false,
      tag: "asset"
    })
  },

  onWebpackUpdate({ webpack, env }) {
    // Enable alias from app/scripts
    webpack.resolve.modules.push('app/scripts')

    if (env.server) {
      // Enable redirection for history support
      webpack.devServer.historyApiFallback = true
    }
  }

})