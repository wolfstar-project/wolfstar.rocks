import type { RESTPostOAuth2AccessTokenResult } from "discord-api-types/v10";
import type { User } from "#auth-utils";

// Auth.d.ts
declare module "#auth-utils" {
	export interface User {
		id: string;
		name: string;
		globalName: string | null;
		username: string;
		avatar: string | null;
	}

	export interface UserSession {
		loggedInAt: number;
	}

	export interface SecureSessionData {
		tokens: RESTPostOAuth2AccessTokenResult;
	}
}

declare module "h3" {
	interface H3EventContext {
		$authorization: {
			resolveServerUser(): Promise<User | null>;
			resolveServerTokens(): Promise<RESTPostOAuth2AccessTokenResult | null>;
		};
	}
}
