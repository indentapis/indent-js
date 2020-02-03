import {
  Transport,
  TransportResponse,
  WriteBatchRequest,
  WriteEventRequest
} from '@indentapis/types'

/** HttpTransport */
export class HttpTransport implements Transport {
  /**
   * @inheritDoc
   */
  public write(_: WriteEventRequest): Promise<TransportResponse> {
    return Promise.resolve({
      error: {
        code: 'noop',
        message: `HttpTransport: did nothing.`
      }
    } as TransportResponse)
  }

  /**
   * @inheritDoc
   */
  public writeBatch(_: WriteBatchRequest): Promise<TransportResponse> {
    return Promise.resolve({
      error: {
        code: 'noop',
        message: `HttpTransport: did nothing.`
      }
    } as TransportResponse)
  }

  /**
   * @inheritDoc
   */
  public close(_?: number): Promise<boolean> {
    return Promise.resolve(true)
  }
}
