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
    host: string
    https: boolean
    cache: boolean
    server: boolean
    output: string
  }

  export type ProjectConfig = ModuleConfig & {
    env: EnvConfig,
    webpack: Configuration,
  }

  export type ModuleHooks<T={}> = {
    options?: () => T,
    onModulesUpdate?: (config: Pick<ProjectConfig, "env" | keyof ModuleConfig> & T) => void,
    afterModulesUpdate?: (config: Pick<ProjectConfig, "env" | keyof ModuleConfig> & T) => void,
    onEnvUpdate?: (config: Pick<ProjectConfig, "env" | keyof ModuleConfig> & T) => void,
    afterEnvUpdate?: (config: Pick<ProjectConfig, "env" | keyof ModuleConfig> & T) => void,
    onAssetsUpdate?: (config: Pick<ProjectConfig, "env" | keyof ModuleConfig> & T) => void,
    afterAssetsUpdate?: (config: Pick<ProjectConfig, "env" | keyof ModuleConfig> & T) => void,
    onWebpackUpdate?: (config: Pick<ProjectConfig, "env" | keyof ModuleConfig | "webpack"> & T) => void,
    afterWebpackUpdate?: (config: Pick<ProjectConfig, "env" | keyof ModuleConfig | "webpack"> & T) => void,
  }

}