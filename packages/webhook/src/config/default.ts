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
          event: 'access/grant',
          actor: {
            kind: 'slack/user',
            id: 'TL0Q0MJR7/U9G03MX',
            altIds: ['mary-manager']
          },
          labels: {
            'indent.com/expires': '2020-04-07T19:23:42.335Z'
          },
          reason: 'debug jira ticket APP-123',
          resources: [
            {
              kind: 'slack/user',
              id: 'TL0Q0MJR7/U822olY',
              altIds: ['dennis-developer'],
              labels: {
                arn: 'dennis-developer',
                cognitoId: 'd697483b81d0b72a37bf'
              }
            },
            {
              kind: 'aws:iam:group',
              id: 'example-inc',
              labels: {
                arn: 's3-read'
              }
            }
          ]
        }
      ]
    },
    {
      delay: 1000,
      events: [
        {
          event: 'access/revoke',
          actor: {
            kind: 'slack/user',
            id: 'TL0Q0MJR7/U9G03MX',
            altIds: ['mary-manager']
          },
          reason: 'access grant expired',
          resources: [
            {
              kind: 'slack/user',
              id: 'TL0Q0MJR7/U822olY',
              altIds: ['dennis-developer'],
              labels: {
                arn: 'dennis-developer',
                cognitoId: 'd697483b81d0b72a37bf'
              }
            },
            {
              kind: 'aws:iam:group',
              id: 'example-inc',
              labels: {
                arn: 's3-read'
              }
            }
          ]
        }
      ]
    }
  ]
}

export default DEFAULT_TEST_CONFIG
