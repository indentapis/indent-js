import { DsnOrString } from './dsn'
import { WriteEventRequest, WriteBatchRequest } from './audit'

/** Transport used sending data to Indent */
export interface Transport {
  /**
   * Sends the body to the Store endpoint in Indent.
   *
   * @param req WriteEventRequest body that should be sent to Indent.
   */
  write(req: WriteEventRequest): Promise<Response>

  /**
   * Sends the body to the Store endpoint in Indent.
   *
   * @param req WriteBatchRequest body that should be sent to Indent.
   */
  writeBatch(req: WriteBatchRequest): Promise<Response>

  /**
   * Call this function to wait until all pending requests have been sent.
   *
   * @param timeout Number time in ms to wait until the buffer is drained.
   */
  close(timeout?: number): Promise<boolean>
}

/** JSDoc */
export type TransportClass<T extends Transport> = new (
  options: TransportOptions
) => T

/** JSDoc */
export interface TransportOptions {
  /** Indent DSN */
  dsn: DsnOrString
  /** Define custom headers */
  headers?: object
  /** Set a HTTP proxy that should be used for outbound requests. */
  httpProxy?: string
  /** Set a HTTPS proxy that should be used for outbound requests. */
  httpsProxy?: string
  /** HTTPS proxy certificates path */
  caCerts?: string
}

/** JSDoc */
export interface TransportResponse {
  ok: boolean
  error: TransportResponseError
}

export interface TransportResponseError {
  code: string
  message: string
}
