import * as types from '@indent/types'

export type WebhookTestConfig = {
  apiSecret?: string
  verifySecret?: string
  entries: WebhookTestConfigEntry[]
}

export type WebhookTestConfigEntry = {
  events: types.Event[]
  delay?: number
}

const DEFAULT_TEST_CONFIG: WebhookTestConfig = {
  entries: [
    {
      events: [
        {
          event: 'access/request/approved',
          actor: {
            id: 'dennis-developer',
            email: 'dennis@example.com',
            labels: {
              arn: 'arn:aws:iam::000000000000:user/dennis-developer',
              cognitoId: 'd697483b81d0b72a37bf'
            }
          },
          resources: [
            {
              kind: 'tenant',
              id: 'example-inc',
              labels: {
                expireTime: new Date().toISOString()
              }
            },
            {
              kind: 'access/request#approver',
              id: 'mary-manager'
            }
          ]
        }
      ]
    },
    {
      delay: 1000,
      events: [
        {
          event: 'access/grant/revoked',
          actor: {
            id: 'dennis-developer',
            email: 'dennis@example.com',
            labels: {
              arn: 'arn:aws:iam::000000000000:user/dennis-developer',
              cognitoId: 'd697483b81d0b72a37bf'
            }
          },
          resources: [
            {
              kind: 'tenant',
              id: 'example-inc'
            }
          ]
        }
      ]
    }
  ]
}

export default DEFAULT_TEST_CONFIG
