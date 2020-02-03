import { Plugins as CorePlugins } from '@indentapis/core'
import { getGlobalScope } from './utils/global'
import * as Transports from './transports'

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
  ...CorePlugins
  // ...BrowserPlugins
}

export { PLUGINS as Plugins, Transports }
