export type TimerListener = (dt: number, time: number) => void

export class Timer {

  FPS = 60
  private paused = true
  private id = -1
  private _now = 0
  private _time = 0
  private _dt = 0
  timeScale = 1

  listeners = new Map<string, TimerListener>()

  constructor() {
    this.update = this.update.bind(this)
  }

  get time() {
    return this._time
  }

  get dt() {
    return this._dt
  }

  start() {
    if (!this.paused) return
    this.stop()
    this.paused = false
    this._time = 0
    this._now = performance.now()
    this.update()
  }

  resume() {
    if (!this.paused) return
    this.pause()
    this.paused = false
    this.update()
  }

  pause() {
    if (this.paused) return
    this.paused = true
    clearTimeout(this.id)
    this.id = -1
  }

  stop() {
    if (this.paused) return
    this.pause()
    this._time = 0
  }

  update() {
    if (this.paused) return

    const time = performance.now()
    this._dt = (time - this._now) * this.timeScale
    this._now = time
    this._time += this._dt

    for (const listener of this.listeners.values()) {
      listener(this._dt, this._time)
    }

    this.id = setTimeout(this.update, (1 / this.FPS) * 1000) as unknown as number
  }

  private static timer: Timer
  static shared() {
    if (!Timer.timer) {
      Timer.timer = new Timer()
    }
    return Timer.timer
  }

}

export class Timeout {
  private static ID = 0
  private static fns = new Map<number, (() => void)>()

  static set(cb: () => any, milliseconds: number) {
    const id = ++Timeout.ID
    let start = performance.now()
    function f() {
      const now = performance.now()
      const t = now - start

      if (t < milliseconds) {
        if (Timeout.fns.has(id)) {
          window.requestAnimationFrame(f)
        }
      } else {
        cb()
      }
    }
    Timeout.fns.set(id, f)
    window.requestAnimationFrame(f)
    return id
  }

  static clear(id: number) {
    Timeout.fns.delete(id)
  }
}
