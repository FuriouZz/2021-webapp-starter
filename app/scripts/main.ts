import { Suzanne } from "components/background";
import { NC } from "lib/notification-center";
import { RAF } from "lol/js/dom/raf";
import { Metrics, Mouse, Timer } from "stores/references";

function bind() {
  window.addEventListener("resize", () => {
    Metrics.width = window.innerWidth
    Metrics.height = window.innerHeight
    Metrics.pixelRatio = window.devicePixelRatio
    Metrics.aspectRatio = Metrics.width / Metrics.height
    NC.dispatch("resize", Metrics)
  })

  window.addEventListener("mousemove", e => {
    Mouse.x = e.clientX
    Mouse.y = e.clientY
    NC.dispatch("mouse", Mouse)
  })

  window.addEventListener("touchmove", e => {
    Mouse.x = e.touches[0].clientX
    Mouse.y = e.touches[0].clientY
    NC.dispatch("mouse", Mouse)
  })

  RAF.start()
  RAF.subscribe("raf", (dt, now) => {
    Timer.deltaTime = dt
    Timer.time = now
    NC.dispatch("raf", Timer)
  })
}

async function main() {
  bind()

  const bg = new Suzanne()
  await bg.load()
  bg.enable()
}

window.addEventListener('DOMContentLoaded', main)