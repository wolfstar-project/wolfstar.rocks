import type { User } from "#auth-utils";
import type { APIGuild, APIGuildMember } from "discord-api-types/v10";
import { useApi } from "#shared/utils";
import { PermissionsBits } from "#shared/utils/bits";
import { hasAtLeastOneKeyInMap } from "@sapphire/utilities";
import { PermissionFlagsBits } from "discord-api-types/v10";
import { defineAbility } from "nuxt-authorization/utils";
import { readSettings } from "~~/server/database";

function isAdmin(member: APIGuildMember, roles: readonly string[]): boolean {
  const memberRolePermissions = BigInt((member as unknown as { permissions: string }).permissions);
  return roles.length === 0
    ? PermissionsBits.has(memberRolePermissions, PermissionFlagsBits.ManageGuild)
    : hasAtLeastOneKeyInMap(new Map(roles.map(role => [role, true])), member.roles);
}

export const manageAbility = defineAbility({ allowGuest: false }, async (user: User, guild: APIGuild) => {
  const api = useApi();
  const member = await api.guilds.getMember(guild.id, user.id).catch(() => null);
  if (!member)
    return false;

  if (guild.owner_id === member.user.id)
    return true;

  const settings = await readSettings(guild.id);
  return isAdmin(member, settings.rolesAdmin);
});
