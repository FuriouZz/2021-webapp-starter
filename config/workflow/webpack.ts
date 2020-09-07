import { WK } from "./types";
import webpack, { Configuration } from "webpack";
import * as Path from "path";

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
  const { appSource } = config.assets

  w.mode = config.env.target === "development" ? "development" : "production"
  w.context = appSource.fullpath.raw()
  w.watch = config.env.watch
  w.watchOptions = {
    poll: true,
    ignored: [/scripts\/generated\/.+/],
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
  const { pipeline, appSource } = config.assets

  w.entry = () => {
    const assets = pipeline.manifest.export()
    const bundle = assets.find(a => a.rule!.tag == 'bundle')!
    const bundleKey = pipeline.resolve.getPath(bundle.input)
    const bundleItems = []

    const entry: webpack.Entry = {
      [bundleKey]: bundleItems
    }

    assets
      .filter(a => a.rule.tag == 'entry')
      .forEach(asset => {
        let input = asset.input
        let output = asset.output

        if (asset.source.uuid !== appSource.uuid) {
          const source = pipeline.source.get(asset.source.uuid)!
          input = appSource.path.relative(source.path.join(input).raw()).toWeb()
        }

        input = './' + input

        if (/\.(ts|tsx|js|jsx)$/i.test(Path.extname(input))) {
          entry[output] = input
        } else {
          bundleItems.push(input)
        }
      })

    return entry
  }
}

/**
 * Configure webpack.output
 */
export function output(w: Configuration, config: ProjectConfig) {
  const { pipeline } = config.assets
  w.output = {}
  w.output.path = pipeline.resolve.output().raw()
  w.output.filename = '[name]'
  w.output.chunkFilename = '[name].chunk.js'
  w.output.publicPath = config.env.host
}

/**
 * Configure webpack-dev-server if started with it
 */
export function server(w: Configuration, config: ProjectConfig) {
  if (process.argv.join(' ').indexOf('webpack-dev-server') == -1) return

  w.devServer = {
    contentBase: w.context,
    host: "0.0.0.0",
    port: 3000,
    https: config.env.https,
    inline: config.env.reload,
    watchContentBase: config.env.watch,
    hot: false,
    watchOptions: {
      poll: true,
      ignored: [/scripts\/generated\/.+/],
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
    'app/scripts',
    'app/assets',
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