import { StylusPluginFactory } from "./plugin";
import { WK } from "../../workflow/types";
import ExtractCssChunks from "extract-css-chunks-webpack-plugin";

export type Options = {
  stylus: {
    // Enable css-modules (doc: https://github.com/css-modules/css-modules)
    modules: boolean | ModuleMode | ModuleOptions
  }
}

type ModuleMode = "local" | "global" | "pure"

type ModuleOptions = {
  compileType: "module" | "icss", // (Default: "module")
  mode: ModuleMode,
  auto: boolean,
  exportGlobals: boolean,
  localIdentName: string, // (eg.: "[path][name]__[local]--[hash:base64:5]")
  context: string,
  localIdentHashPrefix: string, // (eg.: "my-custom-hash")
  namedExport: boolean,
  exportLocalsConvention: "camelCase" | "asIs" | "camelCaseOnly" | "dashes" | "dashesOnly",
  exportOnlyLocals: boolean,
}

export const Hooks: WK.ModuleHooks<Options> = {

  options() {
    return {
      stylus: {
        modules: false
      }
    }
  },

  onWebpackUpdate(config) {
    const { webpack, env, assets } = config

    webpack.plugins.push(new ExtractCssChunks({
      moduleFilename: ({ name }) => {
        return name.replace(".js", ".css").replace(/@entry-css$/, "")
      }
    }))

    // Stylus loader
    webpack.module!.rules.unshift({
      test: /\.styl(us)?$/i,
      include: webpack.context,
      use: [
        {
          loader: ExtractCssChunks.loader,
          options: {
            esModule: false,
            publicPath(resourcePath: string, context: string) {
              const path = assets.pipeline.resolve.parse(resourcePath)
              return path.key ? assets.pipeline.resolve.getUrl(path.key) : path.key
            }
          }
        },
        {
          loader: 'css-loader',
          options: {
            esModule: false,
            modules: config.stylus.modules
          }
        },
        {
          loader: 'stylus-loader',
          options: {
            use: [StylusPluginFactory(assets.pipeline)],
            set: {
              "include css": true,
              "compress": env.compress
            }
          }
        }
      ]
    })

  }

}
