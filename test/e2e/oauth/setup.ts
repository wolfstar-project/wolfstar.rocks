import { fileURLToPath } from "node:url";

export const ROOT_DIR = fileURLToPath(new URL("../../..", import.meta.url));

export const TEST_NUXT_CONFIG = {
	runtimeConfig: {
		public: {
			clientId: "test-client-id",
		},
	},
};
