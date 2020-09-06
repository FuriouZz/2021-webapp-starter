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

    // Create config object
    Hooks.call("options", project)

    // Update modules options
    Hooks.call("modules", project)

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
      host: "",
      cache: false,
      compress: false,
      copyAssets: true,
      server: (() => {
        const cmd = process.argv.join(' ')
        const reg = /webpack-dev-server/
        return reg.test(cmd)
      })()
    } as WK.EnvConfig, cliEnv)

    // Update env
    Hooks.call("env", project)

    // Update assets
    Hooks.call("assets", project)

    // Fetch assets
    project.assets.pipeline.fetch(true)

    await project.assets.pipeline.copy()

    const webpack = project.webpack = Webpack(project)

    // Update webpack
    Hooks.call("webpack", project)
    // console.log(JSON.stringify(webpack.module.rules, null, 2));

    return webpack
  }
}