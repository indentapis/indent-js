/** Primitive components of a Dsn. */
export interface DsnOptions {
  /** Protocol used to connect to Indent. */
  protocol: 'http' | 'https'
  /** Public authorization key. */
  user: string
  /** private _authorization key (deprecated, optional). */
  pass?: string
  /** Hostname of the Indent instance. */
  host: string
  /** Port of the Indent instance. */
  port?: string
  /** Sub path, includes `base58([spaceName]/[providerName]/[inputName])`. */
  path?: string
}

/** The Indent Dsn, identifying a Indent Write API instance and input. */
export interface Dsn extends DsnOptions {
  /**
   * Renders the string representation of this Dsn.
   *
   * By default, this will render the public representation without the password
   * component. To get the deprecated private _representation, set `withPassword`
   * to true.
   *
   * @param withPassword When set to true, the password will be included.
   */
  toString(withPassword: boolean): string
}

export type DsnOrString = Dsn | string
