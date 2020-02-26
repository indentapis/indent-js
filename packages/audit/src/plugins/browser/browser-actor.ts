import {
  getGlobalScope as _getGlobalScope,
  GlobalScope
} from '../../utils/global'
import { Event, Plugin } from '@indent/types'
import { default as get } from 'lodash.get'

interface BrowserActorOptions {
  idLookupKeys?: string[]
  emailLookupKeys?: string[]
  getGlobalScope?: () => GlobalScope
}

export class BrowserActorPlugin implements Plugin {
  /**
   * @inheritDoc
   */
  public name: string = BrowserActorPlugin.id

  /**
   * @inheritDoc
   */
  public static id: string = 'BrowserActor'

  /** JSDoc */
  private readonly _options: BrowserActorOptions

  /**
   * @inheritDoc
   */
  public constructor(options?: BrowserActorOptions) {
    this._options = {
      idLookupKeys: [
        'localStorage.INDENT_ACTOR_ID',
        'localStorage.ajs_user_id$',
        'localStorage.ajs_anonymous_id$'
      ],
      emailLookupKeys: [
        'localStorage.INDENT_ACTOR_EMAIL',
        'localStorage.ajs_user_traits$email'
      ],
      getGlobalScope: _getGlobalScope,
      ...options
    }
  }

  processEvent(event: Event) {
    if (!event.actor) {
      event.actor = {}
    }

    if (!event.actor.id) {
      const { idLookupKeys = [''], getGlobalScope } = this._options

      if (getGlobalScope) {
        event.actor.id = String(
          findIdByLookup(idLookupKeys, getGlobalScope()) ||
            'irn:indent:id:anonymous'
        )
      }
    }

    return event
  }
}

function findIdByLookup(lookupKeys: string[], scope: GlobalScope) {
  return lookupKeys.reduce((id, key) => {
    if (id) {
      return id
    }

    if (!key) {
      return id
    }

    let lookupParts = key.split('$')

    if (lookupParts.length > 1) {
      try {
        let value = JSON.parse(get(scope, lookupParts[0]))

        // Check if the second value is falsey (e.g. empty string)
        // and if so, just return the value
        if (!lookupParts[1]) {
          return value
        }

        return value[lookupParts[1]]
      } catch (err) {
        return id
      }
    }

    return id
  }, '')
}
