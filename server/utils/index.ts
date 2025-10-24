import type { H3Error } from "h3";

export function omit<T, K extends keyof T>(keys: K[], obj: T): Omit<T, K> {
  if (!keys.length)
    return obj;
  const key = keys.pop()!;
  const { [key]: omitted, ...rest } = obj;
  return omit(keys, rest as T) as Omit<T, K>;
}

export function isH3Error(error: unknown): error is H3Error {
  return (
    typeof error === "object"
    && error !== null
    && "statusCode" in error
    && "statusMessage" in error
    && "fatal" in error
    && "unhandled" in error
  );
}

export function guildNameToAcronym(name: string) {
  return name
    .replace(/'s /g, " ")
    .replace(/\w+/g, (e) => e[0])
    .replace(/\s/g, "");
}
