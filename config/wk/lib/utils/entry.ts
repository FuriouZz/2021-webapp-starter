const ENTRY_TAG_PREFIX = "entry:"
const ENTRY_GROUP_PREFIX = "@entry-"

export const ANY_ENTRY_TAG_REGEX = /^entry:[a-z]+$/
export const ANY_ENTRY_REGEX = /@entry-[a-z]+$/

export function removeEntryGroup(s: string) {
  return s.replace(ANY_ENTRY_REGEX, "")
}

export function toEntryGroup(tag: string) {
  return tag.replace(ENTRY_TAG_PREFIX, ENTRY_GROUP_PREFIX)
}