/** Do not touch. This file is updated automatically. */
import { Options as AssetPipelineOptions, Hooks as AssetPipelineHooks } from "./asset-pipeline/module";
import { Options as FileGeneratorOptions, Hooks as FileGeneratorHooks } from "./file-generator/module";
import { Options as HtmlOptions, Hooks as HtmlHooks } from "./html/module-resolver";
import { Options as PageOptions, Hooks as PageHooks } from "./page/module";
import { Options as TypescriptOptions, Hooks as TypescriptHooks } from "./typescript/module";
import { Options as EjsOptions, Hooks as EjsHooks } from "./ejs/module";
import { Options as StylusOptions, Hooks as StylusHooks } from "./stylus/module";
import { Options as VueOptions, Hooks as VueHooks } from "./vue/module";
import { Options as PreRenderSpaOptions, Hooks as PreRenderSpaHooks } from "./pre-render-spa/module";
import { Options as AssetPipelineEjsHelpersOptions, Hooks as AssetPipelineEjsHelpersHooks } from "./asset-pipeline/submodules/ejs";
import { Options as AssetPipelineStylusHelpersOptions, Hooks as AssetPipelineStylusHelpersHooks } from "./asset-pipeline/submodules/stylus";
export type ModuleOptions = AssetPipelineOptions & FileGeneratorOptions & HtmlOptions & PageOptions & TypescriptOptions & EjsOptions & StylusOptions & VueOptions & PreRenderSpaOptions & AssetPipelineEjsHelpersOptions & AssetPipelineStylusHelpersOptions
export const ModuleHooks = [AssetPipelineHooks, FileGeneratorHooks, HtmlHooks, PageHooks, TypescriptHooks, EjsHooks, StylusHooks, VueHooks, PreRenderSpaHooks, AssetPipelineEjsHelpersHooks, AssetPipelineStylusHelpersHooks]
