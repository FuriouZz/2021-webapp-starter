import { Configuration } from "webpack";
import { ModuleOptions as CustomOptions } from "../modules/modules"
import { ModuleOptions as DefaultOptions } from "./modules/modules";

export namespace WK {

  export type ModuleConfig = DefaultOptions & CustomOptions

  export type EnvConfig = {
    target: string
    watch: boolean
    reload: boolean
    compress: boolean
    copyAssets: boolean
    host: string
    https: boolean
    cache: boolean
    server: boolean
  }

  export type ProjectConfig = ModuleConfig & {
    env: EnvConfig,
    webpack: Configuration,
  }

  export type ModuleHooks<T=any> = {
    options?: () => T,
    modules?: (config: Pick<ProjectConfig, "env" | keyof ModuleConfig | keyof T> & T) => void,
    env?: (config: Pick<ProjectConfig, "env" | keyof ModuleConfig | keyof T> & T) => void,
    assets?: (config: Pick<ProjectConfig, "env" | keyof ModuleConfig | keyof T> & T) => void,
    webpack?: (config: Pick<ProjectConfig, "env" | keyof ModuleConfig | keyof T  & T| "webpack">) => void,
  }

}