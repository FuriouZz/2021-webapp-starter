import { Options as PageDataOptions, Hooks as PageDataHooks } from "./page-data/module"
import { Options as TypescriptOptions, Hooks as TypescriptHooks } from "./typescript/module"
import { Options as AssetPipelineOptions, Hooks as AssetPipelineHooks } from "./asset-pipeline/module"
import { Options as FileGenerationOptions, Hooks as FileGeneratorHooks } from "./file-generator/module"
export type ModuleOptions = TypescriptOptions & AssetPipelineOptions & PageDataOptions & FileGenerationOptions
export const ModuleHooks = [TypescriptHooks, AssetPipelineHooks, PageDataHooks, FileGeneratorHooks]