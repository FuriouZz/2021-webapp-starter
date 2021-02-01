import { List } from "lol/js/list"

export interface EmitterListener<K=any, V=any> {
  once: boolean,
  cb: EmitterCallback<K, V>
}

export interface EmitterEvent<K, V> {
  event: K
  value: V
}

export type EmitterCallback<K, V> = (event: EmitterEvent<K, V>) => void

export class Emitter<T> {
  private listeners: Record<string, List<EmitterListener>> = {}

  private getOrCreateListener<K extends keyof T>(name: K) {
    let n = name as string
    return this.listeners[n] = this.listeners[n] || new List<EmitterListener>()
  }

  /**
   * Listen from native
   * eg.: "WebNative.on('message', msg => console.log(msg))"
   */
  on<K extends keyof T>(name: K, cb: EmitterCallback<K, T[K]>) {
    this.getOrCreateListener(name).push({ once: false, cb })
  }

  /**
   * Listen from native, once
   * eg.: "WebNative.once('message', msg => console.log(msg))"
   */
  once<K extends keyof T>(name: K, cb: EmitterCallback<K, T[K]>) {
    this.getOrCreateListener(name).push({ once: true, cb })
  }

  /**
   * Stop listening native event
   * eg.: "WebNative.off('message', myListener)"
   */
  off<K extends keyof T>(name: K, cb: EmitterCallback<K, T[K]>) {
    const listeners = this.getOrCreateListener(name)

    for (const listener of listeners) {
      if (listener.cb == cb) {
        listeners.remove(listener)
        break
      }
    }
  }

  /**
   * Called by the native to dispatch an event
   */
  dispatch<K extends keyof T>(name: K, value?: T[K]) {
    const n = name as string
    const listeners = this.listeners[n]

    if (listeners) {
      for (const listener of listeners) {
        listener.cb({
          event: name,
          value
        })
        if (listener.once) listeners.remove(listener)
      }
    }
  }
}