import { CreateBuildConfig } from "wk";

export default CreateBuildConfig(async config => {
  const { pipeline, options, runner: r } = config

  const assets = pipeline.source.add("app/assets")
  assets.file.add("**/*")

  // Scripts
  const scripts = pipeline.source.add("app/scripts")
  scripts.file.add("*.ts", {
    output: { ext: ".js" },
    tag: "entry",
  })

  // CSS
  const styles = pipeline.source.add("app/styles")
  styles.file.ignore("**/_*.styl")
  styles.file.add("*.styl", {
    output: { ext: ".css" },
    tag: "entry"
  })

  // Views
  const views = pipeline.source.add("app/views")
  views.file.ignore("**/_*.html.ejs")
  views.file.add("sitemap.xml.ejs", {
    output: { ext: "" },
    tag: "entry"
  })
  views.file.add("*.html.ejs", {
    output: { ext: "" },
    tag: "entry"
  })

  const lastmod = new Date().toISOString()
  options.ejs.data.title = "Hello"
  options.ejs.data.env = {
    target: options.env.target
  }
  options.ejs.data.sitemap = [
    { loc: pipeline.host.join("/").toString(), priority: "1.0", lastmod },
  ]

  r.queues.get("bundle")
    .remove("i18n:fetch")
})