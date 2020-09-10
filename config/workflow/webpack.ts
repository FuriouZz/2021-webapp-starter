import { WK } from "./types";
import webpack, { Configuration } from "webpack";
import * as Path from "path";
import { toEntryGroup, ANY_ENTRY_TAG_REGEX } from "./utils/entry";

type ProjectConfig = Omit<WK.ProjectConfig, "webpack">

/**
 * Return a webpack configuration based on your config
 */
export function Webpack(config: ProjectConfig, block?: (w: Configuration, config: ProjectConfig) => void) {
  const w: Configuration = {}
  misc(w, config)
  entries(w, config)
  output(w, config)
  resolve(w, config)
  modules(w, config)
  optimization(w, config)
  plugins(w, config)
  server(w, config)
  if (block) block(w, config)
  return w
}

/**
 * Configure webpack.mode, webpack.context, webpack.target, etc...
 */
export function misc(w: Configuration, config: ProjectConfig) {
  w.mode = config.env.target === "development" ? "development" : "production"
  w.context = process.cwd()
  w.watch = config.env.watch
  w.watchOptions = {
    poll: true,
    ignored: [
      Path.join(config.generate.output, "**/*")
    ],
  }
  w.target = "web"

  if (config.env.target === "development") {
    w.cache = true
    w.devtool = "inline-source-map"
    // w.devtool = "cheap-module-eval-source-map"
  }
}

/**
 * Add webpack.entry.
 * Non-JS/TS file are pushed into an entry point "bundle.js"
 */
export function entries(w: Configuration, config: ProjectConfig) {
  const { pipeline } = config.assets
  const entryJSRegex = /^entry:js$/
  const entry: webpack.Entry = {}

  pipeline.manifest
    .export("asset_source")
    .filter(a => ANY_ENTRY_TAG_REGEX.test(a.tag))
    .forEach(asset => {
      let input = "./" + asset.source.path.join(asset.input).web()
      let output = config.assets.pipeline.getPath(asset.input)

      if (entryJSRegex.test(asset.tag)) {
        asset.source.file.shadow(asset.input.replace(/\.(ts|tsx|js|jsx)/, ".css"))
        asset.source.file.fetch()
        entry[output] = input
      } else {
        output = `${output}${toEntryGroup(asset.tag)}`
        entry[output] = input
      }
    })

  w.entry = entry
}

/**
 * Configure webpack.output
 */
export function output(w: Configuration, config: ProjectConfig) {
  const { pipeline } = config.assets
  w.output = {}
  w.output.path = pipeline.cwd.join(pipeline.output.os()).os()
  w.output.filename = '[name]'
  w.output.chunkFilename = '[name].chunk.js'
  w.output.publicPath = pipeline.host.toString()
}

/**
 * Configure webpack-dev-server if started with it
 */
export function server(w: Configuration, config: ProjectConfig) {
  if (process.argv.join(' ').indexOf('webpack-dev-server') == -1) return

  w.devServer = {
    contentBase: "./app",
    host: "0.0.0.0",
    port: 3000,
    https: config.env.https,
    inline: config.env.reload,
    watchContentBase: config.env.watch,
    watchOptions: {
      poll: true,
      ignored: [
        Path.join(config.generate.output, "**/*")
      ],
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': 'true'
    },
    disableHostCheck: true,
  }
}

/**
 * Configure webpack.resolve.
 * If you have external modules to look for please add them the lib pipeline
 */
export function resolve(w: Configuration, config: ProjectConfig) {
  w.resolve = {}
  w.resolve.extensions = ['.js', '.mjs']
  w.resolve.alias = {}
  w.resolve.modules = [
    'node_modules',
  ]
  w.resolve.plugins = []
}

/**
 * Configure webpack.module
 * See "./loaders.ts" for predefined loaders
 */
export function modules(w: Configuration, config: ProjectConfig) {
  w.module = {
    rules: []
  }
}

/**
 * Configure webpack.optimization.
 * TODO: Enhance split chunks
 */
export function optimization(w: Configuration, config: ProjectConfig) {
  w.optimization = {}
  w.optimization.nodeEnv = w.mode

  if (config.env.compress) {
    w.optimization.minimize = true
  }
}

/**
 * Configure webpack.plugins
 */
export function plugins(w: Configuration, config: ProjectConfig) {
  w.plugins = []
}