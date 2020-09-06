import { WK } from "../../types";
import { Visitor } from "./transformer";
import ForkTsCheckerWebpackPlugin from "fork-ts-checker-webpack-plugin";
import { tsRule } from "./rules";

export type Options = {
  typescript: {
    build: "default" | "transpile" | "fast",
    visitors: Visitor[]
  }
}

export const Hooks: WK.ModuleHooks<Options> = {

  options() {
    return {
      typescript: {
        build: "default",
        visitors: []
      }
    }
  },

  webpack(config) {
    // Add extensions
    config.webpack.resolve!.extensions!.push(".ts", ".tsx")

    // Add plugin
    if (config.typescript.build === "fast") {
      config.webpack.plugins!.push(new ForkTsCheckerWebpackPlugin({
        typescript: {
          configFile: "../tsconfig.json",
        }
      }))
    }

    // Typescript/Javascript rule
    config.webpack.module!.rules.unshift(tsRule(config))
  }

}

