export type Comparer<T> = (a: T, b: T) => number

export const compareStrings: Comparer<string> = (a, b) =>
  a.localeCompare(b, undefined, { numeric: true })

export function compareBy<T, S>(fn: (t: T) => S, comp: Comparer<S>): Comparer<T> {
  return (a, b) => comp(fn(a), fn(b))
}

export function compareOrdered<T>(compareFns: Comparer<T>[]): Comparer<T> {
  return (a, b) => {
    for (const comp of compareFns) {
      const result = comp(a, b)
      if (result != 0) {
        return result
      }
    }

    return 0
  }
}

export const compareBooleans: Comparer<boolean> = (a, b) => Number(a) - Number(b)

export const compareNumbers: Comparer<number> = (a, b) => a - b

export function invert<T>(comp: Comparer<T>): Comparer<T> {
  return (a, b) => -comp(a, b)
}

export function compareIfDefined<T>(
  comp: Comparer<T>,
  opts?: { undefinedIsLarger?: boolean }
): Comparer<T | undefined> {
  return (a, b) => {
    if (a == undefined || b == undefined) {
      if (a != undefined) {
        return opts?.undefinedIsLarger ? -1 : 1
      }
      if (b != undefined) {
        return opts?.undefinedIsLarger ? 1 : -1
      }

      return 0
    }

    return comp(a, b)
  }
}
