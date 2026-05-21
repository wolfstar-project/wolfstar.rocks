import { fileURLToPath } from "node:url";

export const ROOT_DIR = fileURLToPath(new URL("../..", import.meta.url));

export const TEST_SESSION_PASSWORD = "auth-e2e-test-session-pwd-min-32-chars!";

export const TEST_NUXT_CONFIG = {
	runtimeConfig: {
		session: {
			password: TEST_SESSION_PASSWORD,
		},
		oauth: {
			discord: {
				clientId: "test-client-id",
				clientSecret: "test-client-secret",
			},
		},
	},
};
