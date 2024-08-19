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

export function invert<T>(comp: Comparer<T>): Comparer<T> {
  return (a, b) => -comp(a, b)
}
