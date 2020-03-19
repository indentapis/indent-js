import { getGlobalScope } from './utils/global'
import * as BrowserPlugins from './plugins/browser'
import { fetch as fetchFromUtils } from './utils/fetch'
import {
  IAuditAPI,
  IWriteOptions,
  Event,
  IAuditAPIOptions
} from '@indent/types'
import { TimestampPlugin, processEventWithPlugins } from './plugins'

const CorePlugins = {
  TimestampPlugin
}

let windowPlugins = {}
let isBrowser = typeof window !== 'undefined'

// This block is needed to add compatibility with the plugins packages when used with a CDN
// tslint:disable: no-unsafe-any
const _global = getGlobalScope<Window>()

if (_global.Indent && _global.Indent.Plugins) {
  windowPlugins = _global.Indent.Plugins
}
// tslint:enable: no-unsafe-any

let PLUGINS = {
  ...windowPlugins,
  ...CorePlugins
}

if (isBrowser) {
  PLUGINS = {
    ...PLUGINS,
    ...BrowserPlugins
  }
}

let config: IAuditAPIOptions = { dsn: '', debug: false }
let flushTimeout: NodeJS.Timeout
let queue: Event[] = []

const BATCH_SIZE = 1000

function flush() {
  const { dsn, debug, fetch: fetchFromConfig } = config
  let fetch = fetchFromConfig || fetchFromUtils

  if (!dsn) {
    throw new Error(
      `‣ missing: audit.init({ dsn }) - https://indent.fyi/indent-js/audit-missing-dsn`
    )
  }

  if (debug) {
    console.log(`‣ flush: ${queue.length} events`)
  }

  let events = queue
    .splice(0, BATCH_SIZE)
    .map(processEventWithPlugins(Object.values(PLUGINS)))

  fetch(dsn, {
    method: 'POST',
    body: JSON.stringify({ events })
  })
    .then(() => {
      if (debug) {
        console.log(`‣ flush: write: success`)
      }
    })
    .catch((err: Error) => {
      if (debug) {
        console.error(`‣ flush: write: error`)
        console.error(err)
      }
    })

  clearTimeout(flushTimeout)
}

const audit: IAuditAPI = {
  init: ({ dsn = '', debug = false, fetch }) => {
    config.dsn = dsn
    config.debug = debug
    config.fetch = fetch
  },
  write: (event: Event, options?: IWriteOptions) => {
    queue.push(event)

    if ((options && options.flushImmediately) || queue.length === BATCH_SIZE) {
      clearTimeout(flushTimeout)
      flush()
    } else {
      flushTimeout = setTimeout(flush, 500) // flush every 500ms
    }
  }
}

if (isBrowser && typeof document !== 'undefined') {
  // Loaded via CDN or <script />
  if (document.currentScript) {
    let dsn = document.currentScript.getAttribute('data-input-dsn') || ''
    let debug = document.currentScript.getAttribute('data-debug') === 'true'

    audit.init({ dsn, debug })
  }
}

export { audit, PLUGINS as Plugins }

export default { audit }
