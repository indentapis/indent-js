import * as Core from './core'
import * as Errors from './error'
import { PetitionAPI, ResourceAPI } from './indent-api';

export interface ClientOptions {
  /**
   * Defaults to process.env['INDENT_API_TOKEN'].
   */
  apiToken?: string;

  /**
   * Defaults to process.env['INDENT_SPACE'].
   */
  spaceName?: string | null;

  /**
   * Override the default base URL for the API, e.g., "https://platform.indent.apis.com/v1"
   */
  baseURL?: string;

  /**
   * The maximum amount of time (in milliseconds) that the client should wait for a response
   * from the server before timing out a single request.
   *
   * Note that request timeouts are retried by default, so in a worst-case scenario you may wait
   * much longer than this timeout before the promise succeeds or fails.
   */
  timeout?: number;

  /**
   * An HTTP agent used to manage HTTP(S) connections.
   *
   * If not provided, an agent will be constructed by default in the Node.js environment,
   * otherwise no agent is used.
   */
  httpAgent?: any;

  /**
   * Specify a custom `fetch` function implementation.
   *
   * If not provided, we use `node-fetch` on Node.js and otherwise expect that `fetch` is
   * defined globally.
   */
  fetch?: Core.Fetch | undefined;

  /**
   * The maximum number of times that the client will retry a request in case of a
   * temporary failure, like a network error or a 5XX error from the server.
   *
   * @default 2
   */
  maxRetries?: number;

  /**
   * Default headers to include with every request to the API.
   *
   * These can be removed in individual requests by explicitly setting the
   * header to `undefined` or `null` in request options.
   */
  defaultHeaders?: Core.Headers;

  /**
   * Default query parameters to include with every request to the API.
   *
   * These can be removed in individual requests by explicitly setting the
   * param to `undefined` in request options.
   */
  defaultQuery?: Core.DefaultQuery;

  /**
   * By default, client-side use of this library is not allowed, as it risks exposing your secret API credentials to attackers.
   * Only set this option to `true` if you understand the risks and have appropriate mitigations in place.
   */
  dangerouslyAllowBrowser?: boolean;
}

/** API Client for interfacing with the Indent API. */
export class IndentAPI extends Core.APIClient {
  apiToken: string;
  spaceName: string | null;

  private _accessToken: string = '';
  private _options: ClientOptions;

  /**
   * API Client for interfacing with the Indent API.
   *
   * @param {string} [opts.apiToken==process.env['INDENT_API_TOKEN'] ?? undefined]
   * @param {string | null} [opts.spaceName==process.env['INDENT_SPACE'] ?? null]
   * @param {string} [opts.baseURL] - Override the default base URL for the API.
   * @param {number} [opts.timeout=10 minutes] - The maximum amount of time (in milliseconds) the client will wait for a response before timing out.
   * @param {number} [opts.httpAgent] - An HTTP agent used to manage HTTP(s) connections.
   * @param {Core.Fetch} [opts.fetch] - Specify a custom `fetch` function implementation.
   * @param {number} [opts.maxRetries=2] - The maximum number of times the client will retry a request.
   * @param {Core.Headers} opts.defaultHeaders - Default headers to include with every request to the API.
   * @param {Core.DefaultQuery} opts.defaultQuery - Default query parameters to include with every request to the API.
   * @param {boolean} [opts.dangerouslyAllowBrowser=false] - By default, client-side use of this library is not allowed, as it risks exposing your secret API credentials to attackers.
   */
  constructor({
    apiToken = Core.readEnv('INDENT_API_TOKEN'),
    spaceName = Core.readEnv('INDENT_SPACE') ?? null,
    ...opts
  }: ClientOptions = {}) {
    if (apiToken === undefined) {
      throw new Errors.IndentError(
        "The INDENT_API_TOKEN environment variable is missing or empty; either provide it, or instantiate the IndentAPI client with an apiToken option, like new IndentAPI({ apiToken: 'idkey-api-123' }).",
      );
    }

    const options: ClientOptions = {
      apiToken,
      spaceName,
      ...opts,
      baseURL: opts.baseURL ?? `https://platform.indentapis.com/v1`,
    };

    if (!options.dangerouslyAllowBrowser && Core.isRunningInBrowser()) {
      throw new Errors.IndentError(
        "It looks like you're running in a browser-like environment.\n\nThis is disabled by default, as it risks exposing your secret API credentials to attackers.\nIf you understand the risks and have appropriate mitigations in place,\nyou can set the `dangerouslyAllowBrowser` option to `true`, e.g.,\n\nnew IndentAPI({ apiToken, dangerouslyAllowBrowser: true });\n\nhttps://indent.com/docs/api/quickstart/js#browser\n",
      );
    }

    super({
      baseURL: options.baseURL!,
      timeout: options.timeout ?? 600000 /* 10 minutes */,
      httpAgent: options.httpAgent,
      maxRetries: options.maxRetries,
      fetch: options.fetch,
    });
    this._options = options;

    this.apiToken = apiToken;
    this.spaceName = spaceName;
  }

  resource: ResourceAPI = new ResourceAPI(this);
  petition: PetitionAPI = new PetitionAPI(this);

  protected override defaultQuery(): Core.DefaultQuery | undefined {
    return this._options.defaultQuery;
  }

  protected override async defaultHeaders(opts: Core.FinalRequestOptions): Promise<Core.Headers> {
    return {
      ...(await super.defaultHeaders(opts)),
      'Indent-Space': this.spaceName,
      ...this._options.defaultHeaders,
    };
  }

  protected override async authHeaders(opts: Core.FinalRequestOptions): Promise<Core.Headers> {
    let accessToken = this._accessToken;

    // TODO
    function hasExpired(t: string) { return false }
    function isRefreshToken(t: string) { return false }

    if (!isRefreshToken(this.apiToken)) {
      accessToken = this.apiToken;
    } else if (!accessToken || hasExpired(accessToken)) {
      // fetch token using apiToken as refresh token
      const data = await this.fetchWithTimeout(this._options.baseURL + '/auth/token', {
        headers: {
          'Authorization': `Bearer ${this.apiToken}`
        },
      }, 5000).then(r => r.json())

      accessToken = data.access_token
    } else {
      throw new Errors.IndentError(
        'Your API key is invalid for the provided space. Please check your API key and try again.',
      );
    }

    return { Authorization: `Bearer ${accessToken}` };
  }

  static IndentAPI = this;

  static IndentError = Errors.IndentError;
  static APIError = Errors.APIError;
  static APIConnectionError = Errors.APIConnectionError;
  static APIConnectionTimeoutError = Errors.APIConnectionTimeoutError;
  static APIUserAbortError = Errors.APIUserAbortError;
  static NotFoundError = Errors.NotFoundError;
  static ConflictError = Errors.ConflictError;
  static RateLimitError = Errors.RateLimitError;
  static BadRequestError = Errors.BadRequestError;
  static AuthenticationError = Errors.AuthenticationError;
  static InternalServerError = Errors.InternalServerError;
  static PermissionDeniedError = Errors.PermissionDeniedError;
  static UnprocessableEntityError = Errors.UnprocessableEntityError;
}

export const {
  IndentError,
  APIError,
  APIConnectionError,
  APIConnectionTimeoutError,
  APIUserAbortError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  BadRequestError,
  AuthenticationError,
  InternalServerError,
  PermissionDeniedError,
  UnprocessableEntityError,
} = Errors;

export namespace IndentAPI {
  // Re-export types from the core package.
}

export default IndentAPI;