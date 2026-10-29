import { joinURL, withQuery } from "ufo";

/**
 * Where Discord sends the admin after the bot joined: `/oauth/guild` reads the
 * `guild_id` it appends and opens that server in the dashboard. The URL has to
 * be registered in the Discord Developer Portal, and needs `response_type=code`
 * next to it (the code is not used, the bot scope grants nothing to exchange).
 */
export function guildRedirectURI() {
	return joinURL(useSiteConfig().url, "/oauth/guild");
}

export function guildAddURL(guildID: string) {
	return withQuery("https://discord.com/oauth2/authorize", {
		client_id: getClientId(),
		disable_guild_select: "true",
		guild_id: guildID,
		integration_type: "0",
		permissions: "491121748",
		redirect_uri: guildRedirectURI(),
		response_type: "code",
		scope: "bot applications.commands",
	});
}

export function resolveClientUser() {
	const { $authorization } = useNuxtApp();
	return $authorization.resolveClientUser();
}
