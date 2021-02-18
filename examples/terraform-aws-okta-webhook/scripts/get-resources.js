const assert = require('assert')
const axios = require('axios')
const fs = require('fs').promises
const path = require('path')

const OKTA_TENANT = process.env.OKTA_TENANT
const OKTA_TOKEN = process.env.OKTA_TOKEN

assert(OKTA_TENANT, 'required env var missing: `OKTA_TENANT`')
assert(OKTA_TOKEN, 'required env var missing: `OKTA_TOKEN`')

const header = 'kind,displayName,id,email,labels__managerId,labels__description'

function toCSV(resources) {
  return [header, ...resources.map(toLine)].join('\n')
}

function toLine(r) {
  return [
    r.kind,
    r.displayName,
    r.id,
    r.email,
    r.labels.managerId,
    r.labels.description
  ]
    .map(v => v || '')
    .join(',')
}

async function loadFromOkta({ path = '', limit = 200, transform = r => r }) {
  console.log(`Loading data from Okta: { path: ${path}, limit: ${limit} }`)
  const response = await axios({
    method: 'get',
    url: /http/.test(path)
      ? path
      : `https://${OKTA_TENANT}/api/v1${path}?limit=${limit}`,
    headers: {
      Accept: 'application/json',
      Authorization: `SSWS ${OKTA_TOKEN}`,
      'Content-Type': 'application/json'
    }
  })
  const { headers, data: results } = response
  const linkInfo = parseLinkHeader(headers.link)
  return results
    .concat(linkInfo.next ? await loadFromOkta({ path: linkInfo.next }) : [])
    .map(transform)
}

async function load() {
  const groups = await loadFromOkta({
    path: '/groups',
    transform: r => ({
      id: r.id,
      kind: 'okta.v1.group',
      displayName: r.profile.name,
      labels: { description: r.profile.description }
    })
  })
  const users = await loadFromOkta({
    path: '/users',
    transform: r => ({
      id: r.id,
      kind: 'okta.v1.user',
      email: r.profile.email,
      displayName: [r.profile.firstName, r.profile.lastName]
        .filter(Boolean)
        .join(' '),
      labels: {
        managerId: r.profile.managerId,
        description: r.profile.description
      }
    })
  })

  const csv = toCSV([...groups, ...users])
  const datadir = path.resolve(__dirname, '../data')

  try {
    await fs.mkdir(datadir)
  } catch (err) {
    if (/EEXIST/.test(err.message)) {
      // ignore directory already exists error
    } else {
      throw err
    }
  }

  await fs.writeFile(datadir + '/resources.csv', csv)
  console.log(`Completed writing to: "${datadir}/resources.csv"`)
}

function parseLinkHeader(s) {
  const output = {}
  const regex = /<([^>]+)>; rel="([^"]+)"/g
  let m
  while ((m = regex.exec(s))) {
    const [_, v, k] = m
    output[k] = v
  }
  return output
}

load().catch(err => {
  console.error(err)
  process.exit(1)
})
