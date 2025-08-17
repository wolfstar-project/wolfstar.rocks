export function omit<T, K extends keyof T>(keys: K[], obj: T): Omit<T, K> {
  if (!keys.length)
    return obj;
  const key = keys.pop()!;
  const { [key]: omitted, ...rest } = obj;
  return omit(keys, rest as T) as Omit<T, K>;
}
