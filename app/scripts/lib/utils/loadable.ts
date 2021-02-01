export type LoadableData = (() => Promise<any>) | (() => any) | Promise<any>

export class Loadable {

  private _promises: Promise<any>[] = []
  private _all: Promise<any[]> = null

  clone() {
    const l = new Loadable()
    l._promises = this._promises.slice(0)
    return l
  }

  add(data: LoadableData) {
    if (this._all) return
    if (typeof data === "function") {
      const p = data()

      if (typeof p.then === "function") {
        this._promises.push(p)
      } else {
        this._promises.push(Promise.resolve(p))
      }
    } else if (typeof data === "object" && typeof data.then === "function") {
      this._promises.push(data)
    }
  }

  push(data: LoadableData) {
    return this.add(data)
  }

  finish() {
    if (this._all) return this._all
    return this._all = Promise.all(this._promises)
  }

}