import { CreateWebpackConfig } from "./workflow/build";

export default CreateWebpackConfig({

  onModulesUpdate({ typescript, css }) {
    // Enable fast build alongside with ts-checker-plugin
    typescript.build = "fast"

    // Enable modules from css-loader (Documentation here: https://github.com/webpack-contrib/css-loader#modules)
    css.modules = true
  },

  onAssetsUpdate(config) {
    const { pipeline } = config.assets

    // Typescript
    const scripts = pipeline.source.add("app/scripts")
    scripts.file.add("main.ts", {
      output: { ext: ".js" },
      tag: "entry:js",
    })

    // Views
    const views = pipeline.source.add("app/views")
    views.file.ignore("**/_*.html.ejs")
    views.file.add("**/*.html.ejs", {
      output: { ext: "" }, // Remove .ejs extension
      cache: false,
      tag: "entry:html"
    })

    // CSS
    const styles = pipeline.source.add("app/styles")
    styles.file.add("**/*.css", {
      tag: "entry:css"
    })

    // Assets
    const assets = pipeline.source.add("app/assets")
    assets.file.add("**/*", {
      output: { dir: "assets/#{output.dir}" },
      cache: "#{output.name}-#{output.hash}#{ouput.ext}",
      tag: "asset"
    })

    // Register copy
    if (!config.env.server) assets.fs.copy("**/*")
  },

  onWebpackUpdate({ webpack }) {
    // Enable alias from app/scripts
    webpack.resolve.modules.push('app/scripts')
  },

})