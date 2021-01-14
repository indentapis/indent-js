const assert = require('assert')
const axios = require('axios')
const fs = require('fs').promises
const path = require('path')

const OKTA_TENANT = process.env.OKTA_TENANT
const OKTA_TOKEN = process.env.OKTA_TOKEN

assert(OKTA_TENANT, 'required env var missing: `OKTA_TENANT`')
assert(OKTA_TOKEN, 'required env var missing: `OKTA_TOKEN`')

const header = 'kind,displayName,id,email,labels__description'

function toCSV(resources) {
  return [header, ...resources.map(toLine)].join('\n')
}

function toLine(r) {
  return [r.kind, r.displayName, r.id, r.email, r.labels.description]
    .map(v => v || '')
    .join(',')
}

async function loadFromOkta({ path = '', transform = r => r }) {
  const results = await axios({
    method: 'get',
    url: `https://${OKTA_TENANT}/api/v1${path}`,
    headers: {
      Accept: 'application/json',
      Authorization: `SSWS ${OKTA_TOKEN}`,
      'Content-Type': 'application/json'
    }
  }).then(r => r.data)

  return results.map(transform)
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
      labels: { description: r.profile.description }
    })
  })

  const csv = toCSV([...groups, ...users])
  const datadir = path.resolve(__dirname, '../data')

  try {
    await fs.mkdir(datadir)
  } catch (err) {
    console.warn(`WARN: data directory "${datadir}" already exists`)
  }

  await fs.writeFile(datadir + '/resources.csv', csv)
  console.log(`completed writing to "${datadir}/resources.csv"`)
}

load().catch(err => {
  console.error(err)
  process.exit(1)
})
