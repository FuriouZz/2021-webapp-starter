import { spawnSync } from "child_process";
import { omit } from "lol/js/object";
import { join } from "path";
import { Compiler } from "webpack";
import { load } from "../lib/airtable";
import { Plugin } from "../types";

export = <Plugin>{
  name: "webpack",

  setup(config) {
    const { runner: r, options, pipeline } = config

    r.task("webpack:setup", async () => {
      const { WebpackConfig } = await import("../webpack")
      options.webpack = WebpackConfig(config)
    })

    r.task("webpack:typescript",  async () => {
      const ForkTsCheckerWebpackPlugin = await import("fork-ts-checker-webpack-plugin")

      options.webpack.resolve.modules.push('app/scripts')
      options.webpack.resolve.extensions.push(".ts", ".tsx")

      options.webpack.plugins.push(new ForkTsCheckerWebpackPlugin.default({
        typescript: {
          configFile: join(process.cwd(), "tsconfig.json")
        }
      }))

      options.webpack.module.rules.unshift({
        test: /\.(ts|tsx|js|jsx)$/i,
        include: options.webpack.context,
        use: [
          {
            loader: "ts-loader",
            options: {
              // disable type checker - we will use fork plugin
              transpileOnly: true
            }
          }
        ]
      })
    })

    r.task("webpack:stylus", async () => {
      const ExtractCssChunks = await import("extract-css-chunks-webpack-plugin")
      const { removeEntryGroup } = await import("../utils/entry")

      const useModules = false

      options.webpack.module.rules.unshift({
        test: /\.styl(us)?$/i,
        include: options.webpack.context,
        use: [
          {
            loader: ExtractCssChunks.loader,
          },
          {
            loader: 'css-loader',
            options: {
              // Use Webpack Resolver
              url: false,
              // Toggle ES module
              esModule: options.env.esModule,
              // Enable CSS modules
              modules: useModules ? {
                mode: "global",
                localIdentName: '[local]_[hash:base64]',
                exportGlobals: true,
              } : false,
            }
          },
          {
            loader: 'stylus-loader',
            options: {
              stylusOptions: {
                use: options.stylus.use,
                includeCSS: true,
                compress: options.env.compress,
              }
            }
          }
        ]
      })

      options.webpack.plugins.push(new ExtractCssChunks.default({
        moduleFilename: ({ name }) => {
          const asset = pipeline.manifest.findAssetFromOutput(name)
          if (asset) {
            const input = asset.input.replace(/\.(ts|js)x?/, ".css")
            return pipeline.host.pathname.relative(pipeline.getPath(input)).web()
          }
          return removeEntryGroup(name.replace(/\.(ts|js)x?/, ".css"))
        }
      }))
    })

    r.task("webpack:asset", async () => {
      const { ANY_ENTRY_TAG_REGEX, ANY_ENTRY_REGEX } = await import("../utils/entry")

      const emitFile = true

      options.webpack.module.rules.push({
        include: options.webpack.context,
        oneOf: [
          {
            loader: "raw-loader",
            test: [
              /\.(txt|md|svg|vert|frag|glsl)(\.ejs)?$/i
            ],
            issuer: /\.(t|j)sx?$/,
            options: {
              // Toggle ES module
              esModule: options.env.esModule,
            }
          },

          {
            test(resourcePath: string) {
              const asset = pipeline.manifest.getAsset(resourcePath)
              return asset && !ANY_ENTRY_TAG_REGEX.test(asset.tag)
            },
            include: options.webpack.context,
            use: [
              {
                loader: 'file-loader',
                options: {
                  // Toggle ES module
                  esModule: options.env.esModule,

                  // Emit files
                  emitFile: emitFile,

                  outputPath(url: string, resourcePath: string, context: string) {
                    const asset = pipeline.manifest.getAsset(resourcePath)
                    return asset ? pipeline.host.pathname.relative(pipeline.getPath(asset.input)).web() : url
                  },
                  publicPath(url: string, resourcePath: string, context: string) {
                    const asset = pipeline.manifest.getAsset(resourcePath)
                    return asset ? pipeline.getUrl(asset.input) : url
                  },
                }
              }
            ]
          }
        ]
      })

      options.webpack.module.rules.push({
        test: /\.(mjs)$/i,
        include: /node_modules/,
        type: "javascript/auto"
      })

      options.webpack.plugins.push({
        apply(compiler: Compiler) {
          compiler.hooks.beforeCompile.tapPromise("AssetPipelinePlugin.copy", async () => {
            pipeline.copy()
          })
          compiler.hooks.invalid.tap("AssetPipelinePlugin.fetch", () => {
            pipeline.fetch(true)
          })
          compiler.hooks.emit.tapPromise("AssetPipelinePlugin.ignoreEmit", async compilation => {
            for (const name of Object.keys(compilation.assets)) {
              const ignoreEmit = [ANY_ENTRY_REGEX]
              // const ignoreEmit = this.config.assets.ignoreEmit

              const ignored = ignoreEmit.some(pattern => {
                if (typeof pattern === "string") {
                  return name === pattern
                }
                return pattern.test(name)
              })

              if (ignored) {
                console.log(`[AssetPipelinePlugin] Ignoring asset ${name}`)
                delete compilation.assets[name]
              }
            }
          })
          compiler.hooks.afterEmit.tapPromise("AssetPipelinePlugin.watch", async compilation => {
            const paths = pipeline.source
              .all()
              .map(source => source.path.unix())

            for (const path of paths) {
              if (!compilation.contextDependencies.has(path)) {
                compilation.contextDependencies.add(path)
              }
            }
          })
        }
      })

    })

    r.task("webpack:html", async () => {
      const HTML_ENTRY_REGEX = /entry:html$/
      const emitFile = true

      options.webpack.module.rules.push({
        test: /\.html(\.ejs)?$/i,
        include: options.webpack.context,
        oneOf: [
          // Export file with entry:html tags
          {
            test(resourcePath) {
              const asset = pipeline.manifest.getAsset(resourcePath)
              return !!asset && HTML_ENTRY_REGEX.test(asset.tag)
            },
            use: [
              {
                loader: 'file-loader',
                options: {
                  // Toggle ES module
                  esModule: options.env.esModule,

                  // Emit files
                  emitFile: emitFile,

                  outputPath(url: string, resourcePath: string, context: string) {
                    const asset = pipeline.manifest.getAsset(resourcePath)
                    return asset ? pipeline.host.pathname.relative(pipeline.getPath(asset.input)).web() : url
                  },
                  publicPath(url: string, resourcePath: string, context: string) {
                    const asset = pipeline.manifest.getAsset(resourcePath)
                    return asset ? pipeline.getUrl(asset.input) : url
                  },
                }
              },
            ]
          },

          // Else, accept HTML in JS
          {
            use: [
              "raw-loader"
            ]
          }
        ]
      })
    })

    r.task("webpack:ejs", async () => {
      spawnSync("node config/wk/compile.js config/wk/lib/webpack-ejs-loader.ts", { stdio: "inherit", shell: true })
      options.webpack.module.rules.unshift({
        test: /\.ejs$/i,
        enforce: "pre",
        include: options.webpack.context,
        use: [
          {
            loader: __dirname + "/webpack-ejs-loader.js",
            options: {
              // Toggle ES module
              esModule: options.env.esModule,
              ...options.ejs
            }
          }
        ]
      })
    })

    r.task("webpack:generate", async () => {
      const { FileCreator } = await import("../lib/file-creator")
      const f = new FileCreator(options.generate)
      options.webpack.plugins.push({
        apply: (compiler) => {
          compiler.hooks.beforeCompile.tapPromise('generate', async () => {
            await f.writeAll()
          })
        }
      })
    })

    r.task("webpack:preRenderSPA", async () => {
      const PrerenderSPAPlugin = await import("prerender-spa-plugin")
      const Renderer = PrerenderSPAPlugin.PuppeteerRenderer

      const o = omit<any>(options.preRenderSPA, "renderer")
      o.renderer = new Renderer(options.preRenderSPA.renderer)

      options.webpack.plugins.push(new PrerenderSPAPlugin({
        staticDir: pipeline.cwd.join(pipeline.output.os()).join(pipeline.host.pathname.os()).os(),
        ...o
      }))
    })

    r.task("webpack:i18n", async () => {
      const { load } = await import("../lib/airtable")
      let loaded = false
      options.webpack.plugins.push({
        apply(compiler: Compiler) {
          compiler.hooks.beforeCompile.tapPromise('I18nAirtablePlugin.load', async () => {
            if (!loaded) {
              loaded = true
              options.i18n.locales = await load(options.i18n)
            }
          })
        }
      })
    })

    r.group("webpack")
      .pushBack("webpack:setup")
      .pushBack("webpack:typescript")
      .pushBack("webpack:stylus")
      .pushBack("webpack:asset")
      .pushBack("webpack:html")
      .pushBack("webpack:ejs")
      .pushBack("webpack:generate")
      .pushBack("webpack:preRenderSPA")
      .pushBack("webpack:i18n")
  }
}