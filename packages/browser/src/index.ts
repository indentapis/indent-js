import { Plugins as CorePlugins, processEventWithPlugins } from '@indent/core'
import { IAuditAPI, IWriteOptions, Event } from '@indent/types'
import { getGlobalScope } from './utils/global'
import * as BrowserPlugins from './plugins'

let windowPlugins = {}

// This block is needed to add compatibility with the plugins packages when used with a CDN
// tslint:disable: no-unsafe-any
const _global = getGlobalScope<Window>()

if (_global.Indent && _global.Indent.Plugins) {
  windowPlugins = _global.Indent.Plugins
}
// tslint:enable: no-unsafe-any

const PLUGINS = {
  ...windowPlugins,
  ...CorePlugins,
  ...BrowserPlugins
}

let config = { dsn: '', debug: false }
let flushTimeout = setTimeout(() => {}, 0)
let queue: Event[] = []

const BATCH_SIZE = 1000

function flush() {
  const { dsn, debug } = config

  if (!dsn) {
    throw new Error(
      `‣ missing: audit.init({ dsn }) - https://indent.fyi/indent-js/audit/missing-dsn`
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
  init: ({ dsn = '', debug = false }) => {
    config.dsn = dsn
    config.debug = debug
  },
  write: (event: Event, options: IWriteOptions) => {
    queue.push(event)

    if (options.flushImmediately || queue.length === BATCH_SIZE) {
      clearTimeout(flushTimeout)
      flush()
    } else {
      flushTimeout = setTimeout(flush, 500) // flush every 500ms
    }
  }
}

export { audit, PLUGINS as Plugins }

export default { audit }
