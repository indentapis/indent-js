import { DsnOrString, DsnOptions } from '@indentapis/types'
import { IndentError } from './error'

/** Regular expression used to parse a Dsn. */
const DSN_REGEX = /^(?:(\w+):)\/\/(?:(\w+)(?::(\w+))?@)([\w\.-]+)(?::(\d+))?\/(.+)/

/** Error message */
const ERROR_MESSAGE = 'Invalid Dsn'

/** The Indent Dsn, identifying a Indent instance and project. */
export class Dsn implements DsnOptions {
  /** Protocol used to connect to Indent. */
  public protocol!: string
  /** Public authorization key. */
  public user!: string
  /** private _authorization key (deprecated, optional). */
  public pass!: string
  /** Hostname of the Indent instance. */
  public host!: string
  /** Port of the Indent instance. */
  public port!: string
  /** Path */
  public path!: string

  /** Creates a new Dsn component */
  public constructor(from: DsnOrString) {
    if (typeof from === 'string') {
      this._fromString(from)
    } else {
      this._fromOptions(from)
    }

    this._validate()
  }

  /**
   * Renders the string representation of this Dsn.
   *
   * By default, this will render the public representation without the password
   * component. To get the deprecated private _representation, set `withPassword`
   * to true.
   *
   * @param withPassword When set to true, the password will be included.
   */
  public toString(withPassword: boolean = false): string {
    const host = this.host
    const pass = this.pass
    const port = this.port
    const user = this.user
    const path = this.path
    const protocol = this.protocol

    return (
      `${protocol}://${user}${withPassword && pass ? `:${pass}` : ''}` +
      `@${host}${port ? `:${port}` : ''}/${path ? `${path}/` : path}`
    )
  }

  /** Parses a string into this Dsn. */
  private _fromString(str: string): void {
    const match = DSN_REGEX.exec(str)

    if (!match) {
      throw new IndentError(ERROR_MESSAGE)
    }

    // @ts-ignore
    const [
      protocol = '',
      user = '',
      pass = '',
      host = '',
      port = '',
      path = ''
    ] = match.slice(1)

    this._fromOptions({
      host,
      pass,
      path,
      port,
      user,
      protocol
    })
  }

  /** Maps Dsn options into this instance. */
  private _fromOptions(options: DsnOptions): void {
    this.protocol = options.protocol
    this.user = options.user
    this.pass = options.pass || ''
    this.host = options.host
    this.port = options.port || ''
    this.path = options.path || ''
  }

  /** Validates this Dsn and throws on error. */
  private _validate(): void {
    ;['protocol', 'user', 'host', 'projectId'].forEach(component => {
      if (!this[component as keyof DsnOptions]) {
        throw new IndentError(ERROR_MESSAGE)
      }
    })

    if (this.protocol !== 'http' && this.protocol !== 'https') {
      throw new IndentError(ERROR_MESSAGE)
    }

    if (this.port && isNaN(parseInt(this.port, 10))) {
      throw new IndentError(ERROR_MESSAGE)
    }
  }
}
