import { withQuery } from "ufo";

export function guildAddURL(guildID: string) {
  return withQuery("https://discord.com/oauth2/authorize", {
    response_type: "code",
    client_id: getClientId(),
    redirect_uri: `${getOrigin()}/oauth/guild`,
    scope: "bot",
    prompt: "none",
    guild_id: guildID,
    permissions: "491121748",
  });
}

export function resolveClientUser() {
  const { $authorization } = useNuxtApp();
  return $authorization.resolveClientUser();
}
