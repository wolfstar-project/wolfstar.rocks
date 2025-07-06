import type { CommandAutoDelete, DisabledCommandChannel, PermissionsNode, ReactionRole, StickyRole, UniqueRoleSet } from '~~/server/database'

declare global {
  // eslint-disable-next-line ts/no-namespace
  namespace PrismaJson {
    export type PermissionNodeEntries = PermissionsNode[]
    export type CommandAutoDeleteEntries = CommandAutoDelete[]
    export type DisabledCommandChannelEntries = DisabledCommandChannel[]
    export type StickyRoleEntries = StickyRole[]
    export type ReactionRoleEntries = ReactionRole[]
    export type UniqueRoleSetEntries = UniqueRoleSet[]
  }
}


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
