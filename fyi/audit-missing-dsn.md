# Audit API: Missing DSN

#### Why This Error Occurred

When using `audit` from `@indent/node` or `@indent/browser`, you have to call `audit.init({ dsn })` with the DSN (data source name) for your **Input** which you can find in the Indent Dashboard.

#### Possible Ways to Fix It

Go to your Indent Dashboard, select the **Input** you want to write events to and copy the DSN. In your code, add this:

```js
audit.init({ dsn: 'REPLACE_ME_WITH_DSN' })
```
