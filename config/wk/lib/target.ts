import YAML from 'js-yaml';
import { expose } from 'lol/js/object';
import template from "lodash.template";
import { readFileSync } from "fs";
import { join } from "path";
import { isFile } from "lol/js/node/fs";
import { merge } from "./utils/env";

export interface TargetOptions {
  path: string
  target: string
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

export function loadTarget(data: any, options: TargetOptions) {
  // const options = config.options<TargetOptions>("targets")

  const target = process.env["NODE_ENV"] || options.target
  const path = join(options.path, `${target}.yml`)
  data.env.target = target

  if (!isFile(path)) {
    // console.log(`[warn] "${path}" is missing!`)
    return data
  }

  let yml = loadYML(path)
  if (typeof yml.extend === 'string') yml = merge({ concat: false }, loadYML(join(options.path, yml.extend)), yml)

  yml = expose(yml, ...Object.keys(data))

  // // Merge once
  // merge({ concat: false }, config, yml)

  // Merge with fields updated
  const res = JSON.parse(template(JSON.stringify(yml))({
    ENV: { ...process.env },
    ...data
  }))
  merge({ concat: false }, data, res)

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

  return data
}