import { MAXIMUM_COMMAND_OVERWRITES } from "#shared/utils/command-permissions";
import { ApplicationCommandPermissionType } from "discord-api-types/v10";
import {
	array,
	boolean,
	maxLength,
	minLength,
	object,
	picklist,
	pipe,
	regex,
	string,
} from "valibot";

const OverwriteSchema = object({
	id: pipe(string(), regex(/^\d{17,20}$/)),
	type: picklist([
		ApplicationCommandPermissionType.Role,
		ApplicationCommandPermissionType.User,
		ApplicationCommandPermissionType.Channel,
	]),
	permission: boolean(),
});

/**
 * The body of `PUT /api/guilds/:guild/command-permissions/:command`: the
 * command's whole set, and the snapshot of the set the page was opened on.
 */
export const CommandPermissionsPutSchema = object({
	snapshot: pipe(string(), minLength(1), maxLength(16_384)),
	permissions: pipe(array(OverwriteSchema), maxLength(MAXIMUM_COMMAND_OVERWRITES)),
});
