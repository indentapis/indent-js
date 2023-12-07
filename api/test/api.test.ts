import { IndentAPI } from '../src'

const apiToken =
  'eyJraWQiOiI2dkZXUzNrTnd2YVpxaFFVWjJDeVBkRVZnQ3V4bmg1YTMtZklFNHVyWFowIiwiYWxnIjoiUlMyNTYifQ.eyJ2ZXIiOjEsImp0aSI6IkFULnBJdWFhUmFDcmh2QlZTX2FWbUhOVUg4dXQ2VEJWaEktbDh0WXNOR1lmLTQiLCJpc3MiOiJodHRwczovL2luZGVudC5va3RhLmNvbS9vYXV0aDIvZGVmYXVsdCIsImF1ZCI6ImFwaTovL2RlZmF1bHQiLCJpYXQiOjE3MDE5MjAzNzMsImV4cCI6MTcwMjAwNjc3MywiY2lkIjoiMG9hcWxrMjhqdjlmWmo3T2kzNTYiLCJ1aWQiOiIwMHVxbG52NW9vbjh0VGRsWDM1NiIsInNjcCI6WyJlbWFpbCIsIm9wZW5pZCJdLCJhdXRoX3RpbWUiOjE3MDE5MjAzNzIsInN1YiI6ImZvdWFkQGluZGVudC5jb20iLCJmaXJzdE5hbWUiOiJGb3VhZCIsImxhc3ROYW1lIjoiTWF0aW4iLCJvcmdhbml6YXRpb24iOiJJbmRlbnQiLCJva3RhX29yZyI6ImluZGVudCJ9.GRdcTPNJZlOzXT_cSuVnn8NdfaPKhCcqBffTVdiWElxIl3HzE2Iric3Ysp1YX5ivVwivQtPTVFrDeYBkwTK-jIDhAXnsutaP7MkRsTGTKUYSBRZyuD4P5RSQyxP_o5u3iZukcX2ZwY6v_bdqIJcXXlvG3I-6rLVh3n81J3m1zt8kjUPDt8eI8_voWSwwMKgGmB4iXoJ-IXfcCYvcteWn5d0U7Mz0Ec_gkYCRHmxm9S_iBLKT0YOwxMCpHFtj-F6XCUQKgxT5x1XtRukqQfjleTa_xa5O2RdzWz5GfnVvDZdH1dV9geRB-_iboVnfrbPUBCPF9WFcAYv_tEhJVVNWcQ'
const spaceName = 'api-sdk-test-363972'

describe('@indent/api', () => {
  describe('IndentAPI', () => {
    test('init', () => {
      const client = new IndentAPI({
        apiToken: 'test-key',
      })

      return expect(client).not.toBeUndefined()
    })

    test('list resources', async () => {
      const indent = new IndentAPI({
        apiToken,
        spaceName,
      })

      return expect(await indent.resource.list()).toBeTruthy()
    })

    test.concurrent('create petition + cancel (self-revoke)', async () => {
      const indent = new IndentAPI({
        apiToken,
        spaceName,
      })

      let pet = await indent.petition.create({
        reason: 'testing',
      })
      expect(pet).not.toBeUndefined()

      await indent.petition.review({
        petitionName: pet.name,
        claim: {
          event: 'access/deny',
          reason: 'testing',
          resources: [pet?.petitioners?.[0], pet?.resources?.[0]],
        },
      })

      const updated = await indent.petition.waitFor({
        petitionName: pet.name,
      })

      return expect(updated.state?.status?.phase).toBe('closed')
    })

    test.concurrent('create petition + approve + revoke', async () => {
      const indent = new IndentAPI({
        apiToken,
        spaceName,
      })

      let pet = await indent.petition.create({
        reason: 'testing',
      })
      expect(pet).not.toBeUndefined()

      const petitionName = pet.name

      await indent.petition.review({
        petitionName,
        claim: {
          event: 'access/approve',
          reason: 'testing',
          resources: [pet?.petitioners?.[0], pet?.resources?.[0]],
          meta: { labels: { 'indent.com/time/duration': '3h0m0s' } },
        },
      })

      let updated = await indent.petition.waitFor({ petitionName })

      expect(updated.state?.status?.phase).toBe('granted')

      await indent.petition.review({
        petitionName,
        claim: {
          event: 'access/revoke',
          reason: 'expired',
          resources: [pet?.petitioners?.[0], pet?.resources?.[0]],
        },
      })

      await new Promise(r => setTimeout(r, 1000))

      updated = await indent.petition.get({ petitionName })

      expect(updated.state?.status?.phase).toBe('closed')
    }, 10000)

    test('list petitions', async () => {
      const indent = new IndentAPI({
        apiToken,
        spaceName,
      })
      return expect(await indent.petition.list()).toBeTruthy()
    })
  })
})
