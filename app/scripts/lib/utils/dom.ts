const PARSER = new DOMParser()

export function create_element<T extends ChildNode=ChildNode>(template: string): T {
  let is_text_node = false
  template = template.trim()
  if (template.length === 0) {
    is_text_node = true
    template = '.'
  }

  const doc = PARSER.parseFromString(template, 'text/html')
  const $node = doc.body.childNodes[0] as T

  if (is_text_node) {
    $node.textContent = ''
  }

  return $node
}

export function create_elements<T extends Array<ChildNode> = Array<ChildNode>>(template: string): T {
  template = template.trim()

  const doc = PARSER.parseFromString(template, 'text/html')
  const $nodes = Array.from(doc.body.childNodes) as T

  return $nodes
}

export function create_document(template: string) {
  template = template.trim()
  const doc = PARSER.parseFromString(template, 'text/html')
  return doc
}

export function remove_children($el: Element) {
  while ($el.firstChild) {
    if ($el.lastChild == null) {
      break
    }
    $el.lastChild.remove()
  }
}