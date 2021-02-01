export type PageDataFunction = (data: Record<string, any>) => any | Promise<any>

export async function generatePageData(fetchs: PageDataFunction[]) {
  const data: Record<string, any> = {}

  const ps = fetchs.map(async fetch => {
    const res = fetch(data)
    if (typeof res === "object" && typeof res.then === "function") {
      await res
    }
  })

  await Promise.all(ps)

  return `export const PAGE = ${JSON.stringify(data, null, 2)}`
}