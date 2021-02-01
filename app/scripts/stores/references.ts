import BrowserDetect from "vendors/BrowserDetect"

export const Metrics = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: 2,//window.devicePixelRatio,
  aspectRatio: window.innerWidth / window.innerHeight
}

export const Timer = {
  deltaTime: 0,
  time: performance.now(),
}

export const Mouse = {
  x: 0,
  y: 0
}

export const System = {
  isDesktop: BrowserDetect.isDesktop
}