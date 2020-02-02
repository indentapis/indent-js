import {
  Transport,
  TransportOptions,
  TransportResponse,
  WriteBatchRequest,
  WriteEventRequest
} from '@indentapis/types'

/** Noop transport */
export class FetchTransport implements Transport {
  /** JSDoc */
  private readonly _options: TransportOptions

  /**
   * @inheritDoc
   */
  public constructor(options: TransportOptions) {
    this._options = options
  }

  /**
   * @inheritDoc
   */
  public write(req: WriteEventRequest): Promise<TransportResponse> {
    return fetch(getDsnUrl(this._options.dsn), {
      method: 'POST',
      body: JSON.stringify(req.event)
    }).then(res => ({ ok: true }))
  }

  /**
   * @inheritDoc
   */
  public writeBatch(_: WriteBatchRequest): Promise<TransportResponse> {
    return fetch(getDsnUrl(this._options.dsn, { batch: true }), {
      method: 'POST',
      body: JSON.stringify(req.events)
    }).then(res => ({ ok: true }))
  }

  /**
   * @inheritDoc
   */
  public close(_?: number): Promise<boolean> {
    return Promise.resolve(true)
  }
}
