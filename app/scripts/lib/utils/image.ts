import { metadata, ImageData } from "lol/js/dom/image"
export { ImageData } from "lol/js/dom/image"

export interface ImageOptions {
  crossOrigin: string
}

export function load(url: string, options?: Partial<ImageOptions>) {
  options = options || {}
  return new Promise<ImageData>((resolve, reject) => {
    const $img = new Image()
    if (options.crossOrigin) $img.crossOrigin = options.crossOrigin
    $img.onload = () => {
      resolve({
        element: $img,
        ...metadata($img)
      })
    }
    $img.onerror = (e) => {
      reject(e)
    }
    $img.src = url
  })
}