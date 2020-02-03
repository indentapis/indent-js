import {
  Transport,
  TransportResponse,
  WriteBatchRequest,
  WriteEventRequest
} from '@indentapis/types'

/** Noop transport */
export class NoopTransport implements Transport {
  /**
   * @inheritDoc
   */
  public write(_: WriteEventRequest): Promise<TransportResponse> {
    return Promise.resolve({
      error: {
        code: 'noop',
        message: `NoopTransport: did nothing.`
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
        message: `NoopTransport: did nothing.`
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
