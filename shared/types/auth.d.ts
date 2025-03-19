import type { RESTPostOAuth2AccessTokenResult } from 'discord-api-types/v10';

// auth.d.ts
declare module '#auth-utils' {
	interface User {
		id: string;
		name: string;
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
