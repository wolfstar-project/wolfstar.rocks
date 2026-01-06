export function guildAddURL(guildID: string) {
  const DiscordOauthURL = `https://discord.com/oauth2/authorize`;
  const guildAuthURL = new URL(DiscordOauthURL);
  guildAuthURL.search = new URLSearchParams([
    ["redirect_uri", `${getOrigin()}/oauth/guild`],
    ["response_type", "code"],
    ["scope", "bot"],
    ["client_id", getClientId()],
    ["permissions", "491121748"],
    ["guild_id", guildID],
  ]).toString();
  return guildAuthURL.toString();
}
