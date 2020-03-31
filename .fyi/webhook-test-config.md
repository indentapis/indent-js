# Indent Webhook Test Config

#### What is this?

You can define a custom configuration for testing your webhook while in development. The default config can be [found here](../packages/webhook/src/config/default.ts).

#### Usage

```
indent-webhook-test -c ./custom.json http://localhost:3000
```

#### Webhook Config Type

```ts
import * as types from '@indent/types'

export type WebhookTestConfig = {
  entries: WebhookTestConfigEntry[]
}

export type WebhookTestConfigEntry = {
  events: types.Event[]
  delay?: number
}
```

#### Webhook Config Example

```json
{
  "entries": [
    {
      "events": [
        {
          "event": "access/request/approved",
          "actor": {
            "id": "dennis-developer",
            "email": "dennis@example.com",
            "labels": {
              "ip": "8.8.8.8"
            }
          },
          "resources": [
            {
              "kind": "database/table",
              "id": "app_users"
            },
            {
              "kind": "access/request#approver",
              "id": "mary-manager"
            }
          ]
        }
      ]
    },
    {
      "delay": 1000,
      "events": [
        {
          "event": "access/grant/revoked",
          "actor": {
            "id": "dennis-developer",
            "email": "dennis@example.com",
            "labels": {
              "ip": "8.8.8.8"
            }
          },
          "resources": [
            {
              "kind": "database/table",
              "id": "app_users"
            }
          ]
        }
      ]
    }
  ]
}
```
