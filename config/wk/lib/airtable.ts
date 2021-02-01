import Airtable from 'airtable';
import { omit, flat } from 'lol/js/object';
import * as Fs from 'fs';
import { template2 } from 'lol/js/string/template';
import * as kramed from 'kramed';
import { html } from './airtable-utils';

export interface FetchOptions {
  apiKey: string,
  tables: Record<string, Table>
}

export interface LoadOptions extends FetchOptions {
  fetch: boolean
}

export interface Data {
  [key: string]: Record<string, string>
}

export interface Table {
  appId: string,
  tabs: string[],
  view: string,
  output?: string,
  key?: string,
  category?: string,
  ignoreColumns?: string[],
  flatten?: boolean
}

const TemplateOptions = {
  open: '#{',
  body: '[a-z@$#-_?!]+',
  close: '}'
}

function format(data: any, flatten: boolean) {
  const flat_data: Data = {}

  // Iterate over locales
  Object.keys(data).forEach((locale) => {

    const locale_data = data[locale]

    // Iterate over categories
    Object.keys(locale_data).forEach((category) => {
      const category_data = locale_data[category]

      // Iterate over keys
      Object.keys(category_data).forEach((key) => {
        // Replace #{} variables with data of the same category
        category_data[key] = template2(category_data[key], category_data, TemplateOptions)
        // Replace markdown to HTML tags
        category_data[key] = kramed.inlineLexer(category_data[key], [], { gfm: false })
        // unescape special chars
        category_data[key] = html.unescape(category_data[key])
      })
    })

    flat_data[locale] = flatten ? flat(data[locale]) : data[locale]
  })

  return flat_data
}

async function fetch_tab(table: Airtable.Table<any>, options: Table) {
  const result = await table.select({ view: options.view })
    .all()
    .then(records => {
      const locales = Object.keys(omit(records[0].fields, ...options.ignoreColumns))
      const data: any = {}

      locales.forEach((locale) => {
        records.forEach((record: any) => {
          const key = record.get(options.key)
          const category = record.get(options.category)

          const localeObj = data[locale] = data[locale] || {}
          const categoryObj = localeObj[category] = localeObj[category] || {}

          categoryObj[key] = record.get(locale) || `${locale}.${category}.${key}`
          categoryObj[key] = categoryObj[key].trim()
        })
      })

      const flat_data: Data = format(data, options.flatten)

      if (options.output) {
        Fs.writeFileSync(options.output, JSON.stringify(flat_data, null, 2))
      }

      return flat_data
    }).catch(console.log)

  console.log('[i18n] Locales loaded')
  return result ? result : {}
}

/**
 * Fetch locales to Airtables grouped by locale
 */
export async function fetch(apiKey: string, options: Table): Promise<Data> {
  const table = new Airtable({ apiKey: apiKey }).base(options.appId)

  options = Object.assign({
    ignoreColumns: ['ID', 'description'],
    key: "key",
    category: "category",
    flatten: true,
  }, options)

  options.ignoreColumns.push(options.key, options.category)

  let result = {} as Data

  const promises = options.tabs.map(async tab => {
    const res = await fetch_tab(table(tab), options)
    result = { ...result, ...res }
  })

  await Promise.all(promises)

  return result
}

/**
 * Load locales
 *
 * If no output file found or the fetch option is true, a call to airtable is done
 */
export async function load(options: LoadOptions) {
  const result: Record<string, Data> = {}

  if (!options.fetch) {
    for (const [id, table] of Object.entries(options.tables)) {
      try {
        console.log(`[i18n] Reading "${table.output || id}" ...`)
        const flat_data = Fs.readFileSync(table.output, 'utf-8')
        result[id] = JSON.parse(flat_data)
      } catch (e) {
        console.log(`[i18n] Can't parse "${table.output || id}"`)
      }
    }

    return result
  }

  console.log('[i18n] Load locales from Airtable')
  for (const [id, table] of Object.entries(options.tables)) {
    result[id] = await fetch(options.apiKey, table)
  }

  return result
}