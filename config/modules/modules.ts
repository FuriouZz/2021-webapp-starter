/** Do not touch. This file is updated automatically. */
import { Options as EjsOptions, Hooks as EjsHooks } from "./ejs/module";
import { Options as StylusOptions, Hooks as StylusHooks } from "./stylus/module";
import { Options as VueOptions, Hooks as VueHooks } from "./vue/module";
import { Options as PreRenderSpaOptions, Hooks as PreRenderSpaHooks } from "./pre-render-spa/module";
export type ModuleOptions = EjsOptions & StylusOptions & VueOptions & PreRenderSpaOptions
export const ModuleHooks = [EjsHooks, StylusHooks, VueHooks, PreRenderSpaHooks]
