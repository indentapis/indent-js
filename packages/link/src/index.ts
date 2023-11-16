const accessHost = 'https://indent.com'

export function getAccessHref({
  search,
  reason,
  duration,
}: {
  search: string // resource display name or id
  reason?: string // optional: reason for the request
  duration?: string // optional: string of Go duration `1h30m`
}) {
  let formQueryParams: Record<string, string> = {}
  formQueryParams['form[$q]'] = search
  if (reason) {
    formQueryParams['form[reason]'] = reason
  }
  if (duration) {
    formQueryParams['form[duration]'] = duration
  }
  const accessPath = '/access?' + new URLSearchParams(formQueryParams)
  return `${accessHost}${accessPath}`
}

export default { getAccessHref }
