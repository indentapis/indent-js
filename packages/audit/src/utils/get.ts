export const get = (obj: any, path: string, defaultValue?: any): any => {
  const travel = (regexp: RegExp) =>
    String.prototype.split
      .call(path, regexp)
      .filter(Boolean)
      .reduce(
        (res: any, key: string) =>
          res !== null && res !== undefined ? res[key] : res,
        obj
      )

  const result = travel(/[,[\]]+?/) || travel(/[,[\].]+?/)

  return result === undefined || result === obj ? defaultValue : result
}
