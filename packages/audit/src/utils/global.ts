/** Indent-aware Global Scope */
export interface GlobalScope {
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

const fallbackGlobalScope = {
  Indent: { Plugins: [] }
} as GlobalScope

/**
 * Get the global scope.
 *
 * @returns Global scope
 */
export function getGlobalScope<T>(): T & GlobalScope {
  return (isNodeEnv()
    ? global
    : typeof window !== 'undefined'
    ? window
    : typeof self !== 'undefined'
    ? self
    : fallbackGlobalScope) as T & GlobalScope
}

/**
 * Check if currently in a Node environment.
 *
 * @returns Boolean, true if in Node environment
 */
export function isNodeEnv(): boolean {
  return (
    Object.prototype.toString.call(
      typeof process !== 'undefined' ? process : 0
    ) === '[object process]'
  )
}
