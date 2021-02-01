import { readFileSync } from 'fs';

export function readEnvFile(global = true) {
  const result: Record<string, string> = {}
  const _env = process.env['NODE_ENV']
  let filename = `.env`
  if (_env) filename += `.${_env}`
  try {
    const lines = readFileSync(filename, { encoding: "utf-8" }).split(/\r?\n/)
    for (const line of lines) {
      let [key, value] = line.split(/=/)
      key = key.trim()
      value = value.trim()
      if (key[0] === "#") continue
      if (global) process.env[key] = value
      result[key] = value
    }
  } catch (e) {}
  return result
}

function _merge(options: { concat: boolean }, obj0: any, obj1: any) {
  for (var key in obj1) {

    // Duplicate array and concat
    if (Array.isArray(obj1[key])) {
      if (options.concat) {
        obj0[key] = Array.isArray(obj0[key]) ? obj0[key] : []
        obj0[key] = (obj0[key] as any[]).concat(obj1[key].slice(0))
      } else {
        obj0[key] = obj1[key].slice(0)
      }
    }

    // Merge object
    else if (typeof obj1[key] === 'object' && obj1[key] !== null) {
      if (typeof obj0[key] === 'object' && obj0[key] !== null) {
        obj0[key] = merge(options, obj0[key], obj1[key])
      } else {
        obj0[key] = obj1[key]
      }
    }

    // Number / String / Boolean
    else if (typeof obj1[key] === "number" || typeof obj1[key] === "string" || typeof obj1[key] === "boolean") {
      obj0[key] = obj1[key]
    }

  }

  return obj0
}

/**
 * Merge objects
 */
export function merge<T>(options: { concat: boolean }, obj: any, ...objs: any[]): T {
  var i = 0
  var len = objs.length

  for (i = 0; i < len; i++) {
    obj = _merge(options, obj, objs[i])
  }

  return obj
}