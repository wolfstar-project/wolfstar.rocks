import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const loadWorker = async () => (await import("../../../config/cloudflare")).WORKER;

describe("the Worker a build deploys to", () => {
	beforeEach(() => {
		vi.resetModules();
		vi.stubEnv("CLOUDFLARE_WORKER", "production");
		vi.stubEnv("CLOUDFLARE_HYPERDRIVE_ID", "hyperdrive-id");
		vi.stubEnv("NUXT_OAUTH_DISCORD_CLIENT_ID", "client-id");
	});

	afterEach(() => {
		vi.unstubAllEnvs();
	});

	it("is alpha unless production is asked for", async () => {
		vi.stubEnv("CLOUDFLARE_WORKER", undefined);

		expect((await loadWorker()).name).toBe("wolfstar-alpha");
	});

	it("takes production's Hyperdrive and Discord application from the env", async () => {
		const worker = await loadWorker();

		expect(worker.name).toBe("wolfstar-rocks");
		expect(worker.hyperdrive[0]?.id).toBe("hyperdrive-id");
		expect(worker.vars.NUXT_OAUTH_DISCORD_CLIENT_ID).toBe("client-id");
	});

	it.each(["CLOUDFLARE_HYPERDRIVE_ID", "NUXT_OAUTH_DISCORD_CLIENT_ID"])(
		"fails the production build when %s is missing",
		async (name) => {
			vi.stubEnv(name, "");

			await expect(loadWorker()).rejects.toThrow(name);
		},
	);
});
