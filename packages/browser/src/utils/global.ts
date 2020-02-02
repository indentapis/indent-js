/** Indent-aware Global Scope */
interface GlobalScope {
  Indent?: { Plugins?: Plugin[] }
  INDENT_REL?: { id?: string }
  INDENT_ENV?: string
  INDENT_DSN?: string
  __INDENT__?: {
    processors: any
    logger: any
    hub: any
  }
}

/**
 * Get the global scope.
 *
 * @returns Global scope
 */
export function getGlobalObject<T>(): T & GlobalScope {
  return (isNodeEnv()
    ? global
    : typeof window !== 'undefined'
    ? window
    : typeof self !== 'undefined'
    ? self
    : fallbackGlobalObject) as T & GlobalScope
}
