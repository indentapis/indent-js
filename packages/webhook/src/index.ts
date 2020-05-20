import * as CryptoJS from 'crypto-js'

export type VerifyOptions = {
  secret: string
  timestamp: string
  signature: string
  body: string | any
  throwError?: boolean
}

export async function sign({ secret = '', payload = '' }): Promise<string> {
  return CryptoJS.HmacSHA256(payload, secret).toString(CryptoJS.enc.Hex)
}

export function getSignaturePayload(opts: {
  timestamp: string
  body: string | any
}) {
  let { timestamp } = opts
  let bodyString = ''

  if (typeof opts.body === 'string') {
    bodyString = opts.body
  } else {
    bodyString = JSON.stringify(opts.body)
  }

  return `v0:${timestamp}:${bodyString}`
}

export async function verify(options: VerifyOptions): Promise<boolean> {
  if (!options.secret) {
    throw new Error('@indent/webhook: verify(): missing options.secret')
  }

  if (!options.timestamp) {
    throw new Error('@indent/webhook: verify(): missing options.timestamp')
  }

  if (!options.signature) {
    throw new Error('@indent/webhook: verify(): missing options.signature')
  }

  if (!options.body) {
    throw new Error('@indent/webhook: verify(): missing options.body')
  }

  const { secret, body, signature, timestamp, throwError } = options
  const payload = getSignaturePayload({ body, timestamp })
  const generatedSignature = await sign({ secret, payload })
  const isValidSignature = generatedSignature === signature

  if (typeof throwError === 'undefined' || throwError) {
    if (!isValidSignature) {
      throw new Error('@indent/webhook: verify(): invalid signature')
    }
  }

  return isValidSignature
}

export default { sign, verify }
