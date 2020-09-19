import { Configuration } from "webpack";
import { WK } from "./types";
import { Webpack } from "./webpack";
import { Hooks } from "./hooks"
import { overrideProcessEnv } from "./utils";
import { deep_clone } from "lol/js/object";

export function CreateWebpackConfig<T={}>(user: WK.ModuleHooks<T>): (env: WK.EnvConfig) => Promise<Configuration> {
  return async function (cliEnv: WK.EnvConfig = {} as any) {
    Hooks.add(user)

    // Read .env or .env.${target} files
    overrideProcessEnv()

    // @ts-ignore
    const project: WK.ProjectConfig = {
      env: deep_clone(cliEnv),
    }

    /**
     * Merge environment options
     * To pass an environment variables, you have to write like this:
     *   "webpack --env.watch=true --env.compress --env.environment='production'"
     */
    project.env = Object.assign({
      target: process.env["NODE_ENV"] || "development",
      watch: false,
      reload: true,
      https: false,
      host: "/",
      cache: false,
      compress: false,
      output: "public",
      server: (() => {
        const cmd = process.argv.join(' ')
        const reg = /webpack-dev-server/
        return reg.test(cmd)
      })(),
      esModule: false,
    } as WK.EnvConfig, cliEnv)

    // Create config object
    Hooks.call("options", project)

    // Update env
    Hooks.call("onEnvUpdate", project)
    Hooks.call("afterEnvUpdate", project)

    // Update modules options
    Hooks.call("onModulesUpdate", project)
    Hooks.call("afterModulesUpdate", project)

    // Update assets
    Hooks.call("onAssetsUpdate", project)
    Hooks.call("afterAssetsUpdate", project)

    // Fetch assets
    project.assets.pipeline.fetch(true)

    await project.assets.pipeline.copy()

    const webpack = project.webpack = Webpack(project)

    // Update webpack
    Hooks.call("onWebpackUpdate", project)
    Hooks.call("afterWebpackUpdate", project)
    // console.log(JSON.stringify(webpack.module.rules, null, 2));

    return webpack
  }
}