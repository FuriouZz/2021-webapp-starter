/** Do not touch. This file is updated automatically. */
import { Options as CssOptions, Hooks as CssHooks } from "./css/module";
import { Options as TargetsOptions, Hooks as TargetsHooks } from "./targets/module";
export type ModuleOptions = CssOptions & TargetsOptions
export const ModuleHooks = [CssHooks, TargetsHooks]
