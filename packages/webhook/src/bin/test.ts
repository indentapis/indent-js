import DEFAULT_CONFIG, {
  WebhookTestConfig,
  WebhookTestConfigEntry
} from '../config/default'
import * as types from '@indent/types'
import { getSignaturePayload, sign } from '../index'
import fetch from 'node-fetch'
import path from 'path'
import arg from 'arg'
import fs from 'fs'

// indent-webhook-test
const args = arg({
  '-c': String,
  '--url': String,
  '--config': String,
  '--help': Boolean,
  '-h': Boolean
})

const showHelp = () =>
  console.log(
    `
Usage: indent-webhook-test --url=[url] --config,-c=[config] <url>

--url        <url>     URL to work with for testing
--config, -c <config>  File path of test config, https://indent.fyi/indent-js/webhook-test-config
`.trim()
  )

let [url = ''] = args._

if (!url) {
  url = args['--url'] || ''
}

if (args['--help'] || args['-h'] || url === 'help') {
  showHelp()
  process.exit(0)
}

let configPath = args['--config'] || args['-c'] || ''
let config = DEFAULT_CONFIG

if (configPath) {
  try {
    config = JSON.parse(
      fs.readFileSync(path.resolve(process.cwd(), configPath)).toString()
    ) as WebhookTestConfig
  } catch (_err) {}
}

if (!url) {
  showHelp()

  process.exit(1)
}

let hook = config.hook
let timestamp = () => new Date().toISOString()
let sleep = (d: number) => new Promise(resolve => setTimeout(resolve, d))

let complete = Promise.all(
  config.entries.map(async (cfg: WebhookTestConfigEntry) => {
    let body = JSON.stringify({
      events: cfg.events as types.Event[]
    })

    await sleep(cfg.delay || 0)

    let ts = timestamp()
    let signature = await sign({
      secret: hook.secret,
      payload: getSignaturePayload({
        timestamp: ts,
        body
      })
    })

    try {
      await fetch(hook.url, {
        method: hook.method || 'post',
        headers: {
          ...hook.headers,
          'X-Indent-Timestamp': ts,
          'X-Indent-Signature': signature
        },
        body
      })

      return null
    } catch (err) {
      throw err
    }
  })
)

complete
  .then(() => console.log('done!'))
  .catch(err => {
    console.error(err)
  })
