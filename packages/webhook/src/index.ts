import crypto, { HexBase64Latin1Encoding } from 'crypto'

export type VerifyOptions = {
  secret: string
  timestamp: string
  signature: string
  body: string | any
}

export async function sign({
  alg = 'sha256',
  secret = '',
  payload = '',
  encoding = 'base64' as HexBase64Latin1Encoding
}): Promise<string> {
  return crypto
    .createHmac(alg, secret)
    .update(payload)
    .digest(encoding)
}

function getSignaturePayload(opts: { timestamp: string; body: string | any }) {
  let { timestamp } = opts
  let bodyString = ''

  if (typeof opts.body === 'string') {
    bodyString = opts.body
  } else {
    bodyString = JSON.stringify(opts.body)
  }

  return `v1:${timestamp}:${bodyString}`
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
