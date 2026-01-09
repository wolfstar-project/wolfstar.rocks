import type { FlattenedMember } from "#shared/types/discord";
import type { APIGuild } from "discord-api-types/v10";
import { PermissionsBits } from "#shared/utils/bits";
import { hasAtLeastOneKeyInMap } from "@sapphire/utilities";
import { PermissionFlagsBits } from "discord-api-types/v10";
import { defineAbility } from "nuxt-authorization/utils";
import { readSettings, readSettingsPermissionNodes } from "~~/server/database";

function isAdmin(member: FlattenedMember, roles: readonly string[]): boolean {
  const memberRolePermissions = BigInt((member as unknown as { permissions: string }).permissions);
  return roles.length === 0
    ? PermissionsBits.has(memberRolePermissions, PermissionFlagsBits.ManageGuild)
    : hasAtLeastOneKeyInMap(new Map(roles.map(role => [role, true])), member.roles.map(r => r.id));
}

export const manageAbility = defineAbility({ allowGuest: false }, async (guild: APIGuild, member: FlattenedMember) => {
  if (!member.user || !member.user.id) {
    return false;
  }
  if (guild.owner_id === member.user.id)
    return true;

  const settings = await readSettings(guild.id);
  const nodes = readSettingsPermissionNodes(settings);

  return isAdmin(member, settings.rolesAdmin) && (await nodes.run(member, "conf") ?? true);
});
