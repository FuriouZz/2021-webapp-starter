import { join } from 'path';
import { isFile } from 'lol/js/node/fs';
import { readFileSync } from 'fs';

export function overrideProcessEnv() {
  const env = process.env['NODE_ENV']
  let path = join(process.cwd(), '.env')
  if (isFile(`${path}.${env}`)) {
    path = `${path}.${env}`
  }

  try {
    const content = readFileSync(path, { encoding: 'utf-8' }).trim()
    content.split(/\r?\n/).forEach(line => {
      const [key, value] = line.split(/=/)
      if (!!key && !!value && !/^#/.test(key)) {
        process.env[key.trim()] = value.trim()
      }
    })
  } catch (e) {}
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
        obj0[key] = merge(obj0[key], obj1[key])
      } else {
        obj0[key] = obj1[key]
      }
    }

    // Number / String / Boolean
    else {
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