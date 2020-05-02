import { sign, SignableRequest } from './signature'

export interface VerifyOptions extends SignableRequest {
  signature?: string
  secret: string
}

export { sign }

export async function verify(options: VerifyOptions): Promise<boolean> {
  let validationError

  if (!options.secret) {
    validationError = new Error(
      '@indent/webhook: verify(): missing options.secret'
    )
  }

  if (
    !options.headers ||
    !options.headers['X-Indent-Timestamp'] ||
    !options.headers['X-Indent-Signature']
  ) {
    if (!options.timestamp) {
      validationError = new Error(
        '@indent/webhook: verify(): missing options.timestamp'
      )
    } else if (!options.signature) {
      validationError = new Error(
        '@indent/webhook: verify(): missing options.signature'
      )
    } else if (!options.body) {
      validationError = new Error(
        '@indent/webhook: verify(): missing options.body'
      )
    }
  }

  if (validationError) {
    throw validationError
  }

  let { secret, signature, ...rest } = options
  let request = rest as SignableRequest
  let sigFromHeader = request.headers
    ? request.headers['X-Indent-Signature']
    : ''

  if (sigFromHeader && !signature) {
    signature = sigFromHeader
  }

  return signature === sign(secret, request)
}

export default { sign, verify }
