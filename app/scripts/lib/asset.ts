import { PAGE } from "generated/PAGE"

type Entry = { url: string, path: string }
type Keys = keyof typeof PAGE['assets']

const Assets = PAGE['assets']

export function asset_url(key: Keys | string) {
  return PAGE['assets'][key].url
}

export function asset_path(key: Keys | string) {
  return PAGE['assets'][key].path
}

export function asset_filter(predicate: ((key: string, entry: Entry) => boolean)) {
  const ret: Record<string | Keys, Entry> = {}
  const entries = Object.keys(Assets)

  for (const key of entries) {
    if (predicate(key, Assets[key])) {
      ret[key] = Assets[key]
    }
  }

  return ret
}