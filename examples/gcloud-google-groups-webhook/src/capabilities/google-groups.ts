import * as fs from 'fs'
import { promisify } from 'util'
import { google } from 'googleapis'
import { authorize } from '../auth/google'
import { Event, Resource } from '@indent/types'

const readFile = promisify(fs.readFile).bind(fs)

export function matchEvent(event: Event) {
  return event.resources.filter(r => r.kind?.includes('group')).length > 0
}

export async function grantPermission(auditEvent: Event) {
  const { resources } = auditEvent
  const user = getEmailFromResources(resources, 'user')
  const group = getEmailFromResources(resources, 'group')

  return await addUserToGroup({ user, group })
}

export async function revokePermission(auditEvent: Event) {
  const { resources } = auditEvent
  const user = getEmailFromResources(resources, 'user')
  const group = getEmailFromResources(resources, 'group')

  return await removeUserFromGroup({ user, group })
}

export async function addUserToGroup({ user, group }) {
  const auth = await getAuth()
  const service = google.admin({ version: 'directory_v1', auth })

  return await service.members.insert({
    groupKey: group,
    requestBody: {
      email: user,
      role: 'MEMBER'
    }
  })
}

export async function removeUserFromGroup({ user, group }) {
  const auth = await getAuth()
  const service = google.admin({ version: 'directory_v1', auth })

  return await service.members.delete({
    groupKey: group,
    memberKey: user
  })
}

function getEmailFromResources(resources: Resource[], kind: string) {
  return resources
    .filter(r => r.kind?.toLowerCase().includes(kind.toLowerCase()))
    .map(r => r.email || r.id)[0]
}

export async function getAuth() {
  try {
    // Load client secrets from a local file.
    let content = await readFile('credentials.json')
    return await authorize(JSON.parse(content.toString()))
  } catch (err) {
    console.error('Error loading client secret file', err)
    throw err
  }
}
