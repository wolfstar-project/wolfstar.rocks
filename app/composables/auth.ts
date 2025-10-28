import type { User, UserSession } from "#auth-utils";

export interface Auth {
  loggedIn: globalThis.ComputedRef<boolean>;
  user: globalThis.ComputedRef<User | null>;
  session: globalThis.Ref<UserSession | null>;
  redirectTo: globalThis.Ref<string>;
  clear: () => Promise<void>;
  ready: globalThis.ComputedRef<boolean>;
  fetch: () => Promise<void>;
  openInPopup: (
    route: string,
    size?: {
      width?: number;
      height?: number;
    },
  ) => void;
}

export function useAuth() {
  return useNuxtApp().$auth as Auth;
}

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
