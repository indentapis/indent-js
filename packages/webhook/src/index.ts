import * as CryptoJS from 'crypto-js'

export type VerifyOptions = {
  secret: string
  timestamp: string
  signature: string
  body: string | any
}

export async function sign({
  alg = 'SHA256',
  secret = '',
  payload = '',
  encoding = 'Hex'
}): Promise<string> {
  return CryptoJS.algo.HMAC.create(CryptoJS.algo[alg], secret)
    .update(payload)
    .finalize()
    .toString(CryptoJS.enc[encoding])
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

  const { secret, body, signature, timestamp } = options
  const payload = getSignaturePayload({ body, timestamp })

  const generatedSignature = await sign({ secret, payload })

  return generatedSignature === signature
}

export default { sign, verify }
