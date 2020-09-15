import { Options as PageOptions, Hooks as PageHooks } from "./page/module"
import { Options as HTMLOptions, Hooks as HTMLHooks } from "./html/module"
import { Options as TypescriptOptions, Hooks as TypescriptHooks } from "./typescript/module"
import { Options as AssetPipelineOptions, Hooks as AssetPipelineHooks } from "./asset-pipeline/module"
import { Options as FileGenerationOptions, Hooks as FileGeneratorHooks } from "./file-generator/module"
export type ModuleOptions = TypescriptOptions & AssetPipelineOptions & HTMLOptions & PageOptions & FileGenerationOptions
export const ModuleHooks = [TypescriptHooks, AssetPipelineHooks, HTMLHooks, PageHooks, FileGeneratorHooks]