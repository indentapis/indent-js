import unfetch from 'unfetch'

const fetch = unfetch.bind(typeof window === 'undefined' ? null : window)

export { fetch }
