import { GLColorFormat, GLContext, GLMedia, GLType } from "lib/fine/gl/constants/types"
import { Texture } from "lib/fine/gl/texture"
import { ImageData, load as _loadImage, ImageOptions } from "lib/utils/image"
import { VideoData, load as _loadVideo } from "lol/js/dom/video"
import { AudioData, load as _loadAudio } from "lol/js/dom/audio"

const PromiseCache = new Map<string, Promise<any>>()
const AssetCache = new Map<string, any>()

export function loadImage(url: string, options?: Partial<ImageOptions>): Promise<ImageData> {
  return cacheLoadable<ImageData>(url, _loadImage(url, options))
}

export function loadVideo(url: string): Promise<VideoData> {
  return cacheLoadable<VideoData>(url, _loadVideo(url))
}

export function loadAudio(url: string): Promise<AudioData> {
  return cacheLoadable<AudioData>(url, _loadAudio(url))
}

export interface TextureLoadOptions {
  type?: GLType,
  format?: GLColorFormat,
  internal?: GLColorFormat
}
export function loadTexture(key: string, gl: GLContext, element: GLMedia, options?: TextureLoadOptions): Promise<Texture> {
  return cacheLoadable(key, new Promise(async resolve => {
    options = Object.assign({
      type: GLType.UNSIGNED_BYTE,
      format: GLColorFormat.RGB,
      internal: GLColorFormat.RGB
    }, options || {})
    const texture = new Texture(gl, options.type, options.format, options.internal)
    texture.fromMedia(element)
    resolve(texture)
  }))
}

export function getImage(url: string): ImageData|null {
  return AssetCache.get(url)
}

export function getVideo(url: string): VideoData|null {
  return AssetCache.get(url)
}

export function getAudio(url: string): AudioData|null {
  return AssetCache.get(url)
}

export function getTexture(url: string): Texture|null {
  return AssetCache.get(url)
}

export function getMedia(url: string): ImageData|VideoData|null {
  return AssetCache.get(url)
}

export function getLoadable<T>(url: string): T {
  return AssetCache.get(url)
}

export function cacheLoadable<T>(url: string, promise: Promise<T>): Promise<T> {
  if (PromiseCache.has(url)) return PromiseCache.get(url)
  const p = promise.then(value => {
    AssetCache.set(url, value)
    return value
  })
  PromiseCache.set(url, p)
  return p
}

let enabled = false
export function enableAudio(element: HTMLAudioElement) {
  if (enabled) return
  const volume = element.volume
  const currentTime = element.currentTime
  element.volume = 0.0
  element.play().then(() => {
    element.pause()
    element.currentTime = currentTime
    element.volume = volume
    console.log("Audio Enabled")
    enabled = true
  })
}
