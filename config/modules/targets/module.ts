import { WK } from "../../workflow/types";
import YAML from 'js-yaml';
import { deep_clone, expose } from 'lol/js/object';
import template from "lodash.template";
import { readFileSync } from "fs";
import { join } from "path";
import { isFile } from "lol/js/node/fs";
import { merge } from "../../workflow/utils";

export type Options = {
  targets: {
    path: string
  }
}

export const Hooks: WK.ModuleHooks<Options> = {

  options() {
    return {
      targets: {
        path: "config/targets"
      }
    }
  },

  afterEnvUpdate(config) {
    const { targets, env } = config

    const target = process.env["NODE_ENV"] || "development"
    const path = join(targets.path, `${target}.yml`)
    env.target = target

    if (!isFile(path)) {
      console.log(`[warn] "${path}" is missing!`)
      return
    }

    let yml = loadYML(path)
    if (typeof yml.extend === 'string') yml = merge({ concat: false }, loadYML(join(targets.path, yml.extend)), yml)

    yml = expose(yml, ...Object.keys(config))

    // // Merge once
    // merge({ concat: false }, config, yml)

    // Merge with fields updated
    merge({ concat: false }, config, JSON.parse(template(JSON.stringify(yml))({
      ENV: { ...process.env },
      ...config
    })))

    // // CLI env first, then .yml
    // merge({ concat: true }, env, yml, deep_clone(env))

    // merge({ concat: true }, env, JSON.parse(template(JSON.stringify(env))({
    //   ENV: { ...process.env },
    //   ...env
    // })))

    // if ("modules" in env) {
    //   // @ts-ignore
    //   merge({ concat: false }, modules, env.modules || {})
    //   // @ts-ignore
    //   delete env.modules
    // }
  }

}

function loadYML(path: string) {
  try {
    let content = readFileSync(path, 'utf-8')
    return YAML.safeLoad(content) || {}
  } catch (e) {
    console.log(`[warn] An error occured with "${path}"`);
  }

  return {}
}