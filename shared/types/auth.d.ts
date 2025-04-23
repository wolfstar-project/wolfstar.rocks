import type { RESTPostOAuth2AccessTokenResult } from 'discord-api-types/v10';

// auth.d.ts
declare module '#auth-utils' {
	interface User {
		id: string;
		name: string;
		globalName: string;
		username: string;
		avatar: string | null;
	}

	interface UserSession {
		loggedAt: number;
	}

	interface SecureSessionData {
		tokens: RESTPostOAuth2AccessTokenResult;
	}
}

export {};

declare module 'h3' {
	interface H3EventContext {
		$authorization: {
			resolveServerUser(): Promise<{
				id: string;
				name: string;
				avatar: string | null;
			} | null>;
			resolveServerTokens(): Promise<RESTPostOAuth2AccessTokenResult | null>;
		};
	}
}
