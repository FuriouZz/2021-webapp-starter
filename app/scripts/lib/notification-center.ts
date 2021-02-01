// import { CursorState } from "components/cursor/lib/cursor";

import { Emitter, EmitterCallback, EmitterEvent } from "./utils/emitter"

interface NCEvents {
  "resize": {
    width: number,
    height: number,
    pixelRatio: number,
    aspectRatio: number,
  }
  "raf": {
    deltaTime: number,
    time: number,
  }
  "mouse": {
    x: number,
    y: number,
  }
  "card:cannon": any
  "card:complete": any
}

export type NCEvent<K extends keyof NCEvents=any> = EmitterEvent<K, NCEvents[K]>
export type NCEventCallback<K extends keyof NCEvents=any> = EmitterCallback<K, NCEvents[K]>

export const NC = new Emitter<NCEvents>()