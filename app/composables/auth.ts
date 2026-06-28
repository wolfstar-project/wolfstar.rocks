import { withQuery } from "ufo";

export function guildAddURL(guildID: string) {
	return withQuery("https://discord.com/oauth2/authorize", {
		client_id: getClientId(),
		disable_guild_select: "true",
		guild_id: guildID,
		integration_type: "0",
		permissions: "491121748",
		scope: "bot applications.commands",
	});
}

export function resolveClientUser() {
	const { $authorization } = useNuxtApp();
	return $authorization.resolveClientUser();
}
