import { DsnOrString } from '@indentapis/types'
import { Dsn } from './dsn'

export interface DsnUrlOptions {}

export function getDsnUrl(dsnOrString: DsnOrString, _?: DsnUrlOptions) {
  const dsn = new Dsn(dsnOrString)

  return dsn.toString()
}
