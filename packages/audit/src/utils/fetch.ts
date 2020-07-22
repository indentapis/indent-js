import isofetch from 'isomorphic-fetch'

const fetch = isofetch.bind(typeof window === 'undefined' ? null : window)

export { fetch }
