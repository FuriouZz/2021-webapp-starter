/** Do not touch. This file is updated automatically. */
import { Options as EjsOptions, Hooks as EjsHooks } from "./ejs/module";
import { Options as CssOptions, Hooks as CssHooks } from "./css/module";
export type ModuleOptions = EjsOptions & CssOptions
export const ModuleHooks = [EjsHooks, CssHooks]
