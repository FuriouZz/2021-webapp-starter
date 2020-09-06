import { WK } from "../../types"
import HTMLWebpackPlugin from "html-webpack-plugin"

export type Options = {
  html: {
    configure?: (input: string, options: HTMLWebpackPlugin.Options) => HTMLWebpackPlugin.Options
  }
}

export const Hooks: WK.ModuleHooks = {

  options() {
    return {
      html: {}
    }
  },

  webpack(config) {
    config.assets.pipeline.manifest
      .export("asset")
      .filter(asset => asset.tag === "html")
      .forEach(asset => {
        const source = config.assets.pipeline.source.get(asset.source.uuid)
        const template = source.fullpath.join(asset.input).raw()

        let options: HTMLWebpackPlugin.Options = {
          filename: asset.cache,
          template,
          inject: true
        }

        if (config.html.configure) {
          options = config.html.configure(asset.input, options)
        }

        const plugin = new HTMLWebpackPlugin(options)

        // @ts-ignore
        config.webpack.plugins.push(plugin)
      })
  }

}