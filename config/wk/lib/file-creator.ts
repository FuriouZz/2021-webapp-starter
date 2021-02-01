import { writeFileSync } from "fs"
import { isAbsolute, join } from "path"

export interface FileCreatorEntry {
  filename: string
  content: () => Promise<string> | string
  write: boolean
}

export interface FileCreatorEntryInfo {
  path: string
  content: string
  lastUpdate: number
  lastWrite: number
}

export interface FileCreatorOptions {
  files: FileCreatorEntry[]
}

export class FileCreator {
  files = new Map<string, FileCreatorEntryInfo>()

  constructor(private options: FileCreatorOptions) { }

  async fetch({ filename, content }: FileCreatorEntry) {
    let data: string
    const result = content()

    if (typeof result === "string") {
      data = result
    } else {
      data = await result
    }

    let path = filename
    if (!isAbsolute(filename)) {
      path = join(process.cwd(), filename)
    }

    if (!this.files.has(path)) {
      this.files.set(path, {
        path,
        content: "",
        lastUpdate: 0,
        lastWrite: 0
      })
    }

    const current = this.files.get(path)

    if (current.content !== data) {
      current.content = data
      current.lastUpdate = Date.now()
    }

    return current
  }

  async write(data: FileCreatorEntry) {
    const info = await this.fetch(data)
    if (info.lastUpdate > info.lastWrite) {
      info.lastWrite = Date.now()
      writeFileSync(info.path, info.content)
    }
  }

  async fetchAll() {
    return Promise.all(
      this.options.files
        .map(this.fetch, this)
    )
  }

  writeAll() {
    return Promise.all(
      this.options.files
        .map(this.write, this)
    )
  }
}
