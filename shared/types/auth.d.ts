import type { AuthUser } from "#nuxt-better-auth";

declare module "h3" {
	interface H3EventContext {
		$authorization: {
			resolveServerUser(): Promise<AuthUser | null>;
			resolveServerTokens(): Promise<{ access_token: string } | null>;
		};
	}
}
