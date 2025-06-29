import type { APIGuild, APIGuildMember } from 'discord-api-types/v10'
import { hasAtLeastOneKeyInMap } from '@sapphire/utilities'
import { PermissionFlagsBits } from 'discord-api-types/v10'
import { readSettings } from '~~/server/database'

function isAdmin(member: APIGuildMember, roles: readonly string[]): boolean {
  const memberRolePermissions = BigInt((member as unknown as { permissions: string }).permissions)
  return roles.length === 0
    ? PermissionsBits.has(memberRolePermissions, PermissionFlagsBits.ManageGuild)
    : hasAtLeastOneKeyInMap(new Map(roles.map(role => [role, true])), member.roles)
}

export const manageAbility = defineAbility({ allowGuest: false }, async (_user: any, guild: APIGuild, member: APIGuildMember) => {
  if (guild.owner_id === member.user.id)
    return true

  const settings = await readSettings(guild.id)
  return isAdmin(member, settings.rolesAdmin)
})
