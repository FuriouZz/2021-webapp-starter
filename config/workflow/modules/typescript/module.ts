import { WK } from "../../types";
import { Visitor } from "./transformer";
import ForkTsCheckerWebpackPlugin from "fork-ts-checker-webpack-plugin";
import { tsRule } from "./rules";
import { join } from "path";

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

  onWebpackUpdate(config) {
    // Add extensions
    config.webpack.resolve!.extensions!.push(".ts", ".tsx")

    // Add plugin
    if (config.typescript.build === "fast") {
      config.webpack.plugins!.push(new ForkTsCheckerWebpackPlugin({
        typescript: {
          configFile: join(process.cwd(), "tsconfig.json"),
        }
      }))
    }

    // Typescript/Javascript rule
    config.webpack.module!.rules.unshift(tsRule(config))
  }

}

