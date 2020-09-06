import { Options as TypescriptOptions, Hooks as TypescriptHooks } from "./typescript/module"
import { Options as HTMLOptions, Hooks as HTMLHooks } from "./html/module"
import { Options as AssetPipelineOptions, Hooks as AssetPipelineHooks } from "./asset-pipeline/module"
import { Options as PageDataOptions, Hooks as PageDataHooks } from "./page-data/module"
import { Options as FileGenerationOptions, Hooks as FileGeneratorHooks } from "./file-generator/module"
export type ModuleOptions = TypescriptOptions & HTMLOptions & AssetPipelineOptions & PageDataOptions & FileGenerationOptions
export const ModuleHooks = [TypescriptHooks, HTMLHooks, AssetPipelineHooks, PageDataHooks, FileGeneratorHooks]