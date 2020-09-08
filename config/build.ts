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
      cache: config.env.cache,
      tag: "entry:js",
    })

    // Views
    const views = pipeline.source.add("app/views")
    views.file.ignore("**/_*.html")
    views.file.add("**/*.html", {
      cache: false,
      tag: "entry:html"
    })

    // CSS
    const styles = pipeline.source.add("app/styles")
    styles.file.add("**/*.css", {
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

  onWebpackUpdate({ webpack }) {
    // Enable alias from app/scripts
    webpack.resolve.modules.push('app/scripts')
  },

})