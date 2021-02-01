// import { CursorState } from "components/cursor/lib/cursor";

import { Emitter, EmitterCallback, EmitterEvent } from "./utils/emitter"

interface NCEvents {
  "compile": any
  "compiled": any
}

export type NCEvent<K extends keyof NCEvents=any> = EmitterEvent<K, NCEvents[K]>
export type NCEventCallback<K extends keyof NCEvents=any> = EmitterCallback<K, NCEvents[K]>

export const NC = new Emitter<NCEvents>()