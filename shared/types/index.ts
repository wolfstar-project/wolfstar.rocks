export interface BuildInfo {
  version: string
  commit: string
  shortCommit: string
  time: number
  branch: string
  env: Env.Canary | Env.Dev | Env.Release | Env.Prod
}

export enum Env {
  Canary = 'canary',
  Dev = 'development',
  Release = 'release',
  Prod = 'production',
}

export {}

declare module 'h3' {
  interface H3EventContext {
    errorHandled: boolean
  }
}
