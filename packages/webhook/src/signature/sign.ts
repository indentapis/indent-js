import { createHmac, createHash, HexBase64Latin1Encoding } from 'crypto'
import { parse as parseQuerystring, ParsedUrlQuery } from 'querystring'

export interface SignableRequest {
  host: string
  path: string
  headers: { [key: string]: string }

  method?: string
  timestamp?: string
  body?: string | any
  signedHeaders?: { [key: string]: string }
}

export interface SigningOptions {
  date: Date
  region: string
  service: string
}

export function sign(secret: string, request: SignableRequest) {
  if (request.body && typeof request.body !== 'string') {
    request = { ...request, body: JSON.stringify(request.body) }
  }

  let datetime =
    request.timestamp ||
    request.headers['X-Indent-Timestamp'] ||
    timestampFromNow()
  let date = new Date(datetime)
  let region = request.headers['X-Indent-Region'] || 'gcp:us-west2'
  let service = request.headers['X-Indent-Service'] || 'indent.v1.alertapi'
  let key = getSignatureKey(secret, datetime, region, service)
  let options: SigningOptions = { date, region, service }
  let stringToSign = getStringToSign(options, request)

  console.log({
    key,
    options,
    request,
    sig: `1v${hmac(key, stringToSign, 'hex')}`
  })

  // Prepend Indent Version 1 signatures with  "1v" for easy identification
  return `1v${hmac(key, stringToSign, 'hex')}`
}

// Implementation inspired by AWS's Signature Version 4
//
// http://docs.amazonwebservices.com/general/latest/gr/signature-version-4.html

function hmac(key: string, str: string, encoding?: HexBase64Latin1Encoding) {
  return createHmac('sha256', key)
    .update(str, 'utf8')
    .digest(encoding || 'hex')
}

function hash(string: string, encoding?: HexBase64Latin1Encoding) {
  return createHash('sha256')
    .update(string, 'utf8')
    .digest(encoding || 'hex')
}

function encodeRfc3986(urlEncodedString: string): string {
  return urlEncodedString.replace(/[!'()*]/g, (c: string) =>
    [
      '%',
      c
        .charCodeAt(0)
        .toString(16)
        .toUpperCase()
    ].join('')
  )
}

function encodeRfc3986Full(str: string): string {
  return encodeRfc3986(encodeURIComponent(str))
}

function getCanonicalString(options: SigningOptions, request: SignableRequest) {
  let path = request.path || '/'

  // S3 doesn't always encode characters > 127 correctly and
  // all services don't encode characters > 255 correctly
  // So if there are non-reserved chars (and it's not already all % encoded), just encode them all
  if (/[^0-9A-Za-z;,/?:@&=+$\-_.!~*'()#%]/.test(path)) {
    path = encodeURI(decodeURI(path))
  }

  var queryIx = path.indexOf('?')
  let query: ParsedUrlQuery

  if (queryIx >= 0) {
    query = parseQuerystring(path.slice(queryIx + 1))
    path = path.slice(0, queryIx)
  } else {
    query = {}
  }

  let parsedPath = { query, path }
  let pathStr = parsedPath.path
  let headers = request.headers,
    queryStr = '',
    normalizePath = options.service !== 's3',
    decodePath = options.service === 's3',
    decodeSlashesInPath = options.service === 's3',
    firstValOnly = options.service === 's3',
    bodyHash

  if (options.service === 's3') {
    bodyHash = 'UNSIGNED-PAYLOAD'
  } else {
    bodyHash =
      headers['X-Indent-Content-Sha256'] ||
      headers['x-Indent-content-sha256'] ||
      hash(request.body || '', 'hex')
  }

  if (query) {
    let reducedQuery: { [key: string]: string[] | string } = Object.keys(
      query
    ).reduce(function(obj: { [key: string]: string | string[] }, key) {
      if (!key) return obj
      obj[encodeRfc3986Full(key)] = !Array.isArray(query[key])
        ? query[key]
        : firstValOnly
        ? query[key][0]
        : query[key]
      return obj
    }, {})
    let encodedQueryPieces: string[] = []
    Object.keys(reducedQuery)
      .sort()
      .forEach(function(key) {
        if (Array.isArray(reducedQuery[key])) {
          ;(reducedQuery[key] as string[])
            .map(encodeRfc3986Full)
            .sort()
            .forEach(function(val: string) {
              encodedQueryPieces.push(key + '=' + val)
            })
        } else {
          encodedQueryPieces.push(
            key + '=' + encodeRfc3986Full(reducedQuery[key] as string)
          )
        }
      })
    queryStr = encodedQueryPieces.join('&')
  }
  if (pathStr !== '/') {
    if (normalizePath) pathStr = pathStr.replace(/\/{2,}/g, '/')
    pathStr = pathStr
      .split('/')
      .reduce(function(path: string[], piece = '') {
        if (normalizePath && piece === '..') {
          path.pop()
        } else if (!normalizePath || piece !== '.') {
          if (decodePath) piece = decodeURIComponent(piece).replace(/\+/g, ' ')
          path.push(encodeRfc3986Full(piece))
        }
        return path
      }, [])
      .join('/')
    if (pathStr[0] !== '/') pathStr = '/' + pathStr
    if (decodeSlashesInPath) pathStr = pathStr.replace(/%2F/g, '/')
  }

  return [
    (request.method || 'POST').toUpperCase(),
    pathStr,
    queryStr,
    canonicalHeaders(options, request) + '\n',
    signedHeaders(options, request),
    bodyHash
  ].join('\n')
}

function canonicalHeaders(_options: SigningOptions, request: SignableRequest) {
  let headers = request.headers

  function trimAll(header: string | string[]) {
    return header
      .toString()
      .trim()
      .replace(/\s+/g, ' ')
  }

  return Object.keys(headers)
    .sort(function(a, b) {
      return a.toLowerCase() < b.toLowerCase() ? -1 : 1
    })
    .map(function(key) {
      return key.toLowerCase() + ':' + trimAll(headers[key])
    })
    .join('\n')
}

function signedHeaders(_options: SigningOptions, request: SignableRequest) {
  return Object.keys(request.headers)
    .map(function(key) {
      return key.toLowerCase()
    })
    .sort()
    .join(';')
}

function getSignatureKey(
  key: string,
  date: string,
  region: string,
  service: string
): string {
  return hmac(
    'idv1_request',
    hmac(service, hmac(region, hmac(date, 'IDV1' + key)))
  )
}

function timestampFromNow(): string {
  return new Date().toISOString()
}

function getSigningAlg() {
  return 'IDV1-HMAC-SHA256'
}

function getCredentialScope(options: SigningOptions) {
  let { date, region, service } = options

  return [
    [date.getFullYear(), date.getMonth(), date.getDate()].join(''),
    region,
    service,
    'idv1_request'
  ].join('/')
}

function getStringToSign(options: SigningOptions, request: SignableRequest) {
  return [
    getSigningAlg(),
    getSigningTime(options),
    getCredentialScope(options),
    hash(getCanonicalString(options, request), 'hex')
  ].join('\n')
}

function getSigningTime(options: SigningOptions): string {
  if (!options.date || isNaN(options.date.getTime())) {
    return ''
  }

  return options.date.toISOString().replace(/(\-|:|\.\d*)/g, '')
}
