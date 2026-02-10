import { withQuery } from "ufo";

export function guildAddURL(guildID: string) {
	return withQuery("https://discord.com/oauth2/authorize", {
		client_id: getClientId(),
		guild_id: guildID,
		permissions: "491121748",
		prompt: "none",
		redirect_uri: `${getOrigin()}/oauth/guild`,
		response_type: "code",
		scope: "bot",
	});
}

export function resolveClientUser() {
	const { $authorization } = useNuxtApp();
	return $authorization.resolveClientUser();
}
