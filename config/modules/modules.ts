/** Do not touch. This file is updated automatically. */
import { Options as AssetPipelineOptions, Hooks as AssetPipelineHooks } from "./asset-pipeline/module";
import { Options as FileGeneratorOptions, Hooks as FileGeneratorHooks } from "./file-generator/module";
import { Options as HtmlOptions, Hooks as HtmlHooks } from "./html/module-resolver";
import { Options as PageOptions, Hooks as PageHooks } from "./page/module";
import { Options as TypescriptOptions, Hooks as TypescriptHooks } from "./typescript/module";
import { Options as EjsOptions, Hooks as EjsHooks } from "./ejs/module";
import { Options as CssOptions, Hooks as CssHooks } from "./css/module";
import { Options as AssetPipelineEjsHelpersOptions, Hooks as AssetPipelineEjsHelpersHooks } from "./asset-pipeline/submodules/ejs";
export type ModuleOptions = AssetPipelineOptions & FileGeneratorOptions & HtmlOptions & PageOptions & TypescriptOptions & EjsOptions & CssOptions & AssetPipelineEjsHelpersOptions
export const ModuleHooks = [AssetPipelineHooks, FileGeneratorHooks, HtmlHooks, PageHooks, TypescriptHooks, EjsHooks, CssHooks, AssetPipelineEjsHelpersHooks]
