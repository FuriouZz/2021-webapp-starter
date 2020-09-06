import { WK } from "../../workflow/types";
import ExtractCssChunks from "extract-css-chunks-webpack-plugin";

export type Options = {}

export const Hooks: WK.ModuleHooks<Options> = {

  onWebpackUpdate(config) {
    const { webpack, assets } = config

    webpack.plugins.push(new ExtractCssChunks({
      filename: "[name].css",
      chunkFilename: '[id].css',
      moduleFilename: ({ name }) => {
        return name.replace(".js", ".css")
      }
    }))

    // CSS loader
    webpack.module!.rules.unshift({
      test: /\.css$/i,
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
          }
        }
      ]
    })

  }

}
