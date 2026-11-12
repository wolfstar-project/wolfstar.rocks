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

		expect(worker.name).toBe("wolfstar-site");
		expect(worker.hyperdrive[0]?.id).toBe("hyperdrive-id");
		expect(worker.vars.NUXT_OAUTH_DISCORD_CLIENT_ID).toBe("client-id");
	});

	it("serves the production Worker on wolfstar.rocks and alpha, not beta", async () => {
		expect((await loadWorker()).routes).toEqual([
			{ custom_domain: true, pattern: "wolfstar.rocks" },
			{ custom_domain: true, pattern: "alpha.wolfstar.rocks" },
		]);
	});

	it("serves beta.wolfstar.rocks from the beta Worker, with the WolfStar Beta application", async () => {
		vi.stubEnv("CLOUDFLARE_WORKER", "beta");
		const worker = await loadWorker();

		expect(worker.name).toBe("wolfstar-beta");
		expect(worker.routes).toEqual([{ custom_domain: true, pattern: "beta.wolfstar.rocks" }]);
		expect(worker.vars).toMatchObject({
			NUXT_OAUTH_DISCORD_CLIENT_ID: "1288560050184650802",
			NUXT_PUBLIC_SITE_URL: "https://beta.wolfstar.rocks",
		});
	});

	// Production's cookies cover the whole domain, so beta reaches them too.
	it("names beta's cookies apart from production's", async () => {
		vi.stubEnv("CLOUDFLARE_WORKER", "beta");

		expect((await loadWorker()).vars).toMatchObject({
			NUXT_BOT_API_OAUTH_COOKIE: "WOLFSTAR_BETA_AUTH",
			NUXT_SESSION_COOKIE_NAME: "wolfstar-session-beta",
		});
	});

	it("needs no production variable to build the beta Worker", async () => {
		vi.stubEnv("CLOUDFLARE_WORKER", "beta");
		vi.stubEnv("CLOUDFLARE_HYPERDRIVE_ID", "");
		vi.stubEnv("NUXT_OAUTH_DISCORD_CLIENT_ID", "");

		expect((await loadWorker()).hyperdrive[0]?.id).toBe("e8347aa5f2f2420d81eebe933ec98cb7");
	});

	it.each(["production", "beta", undefined])(
		"keeps the Turnstile site key in the vars of the %s Worker, so a deploy does not drop it",
		async (worker) => {
			vi.stubEnv("CLOUDFLARE_WORKER", worker);
			vi.stubEnv("NUXT_PUBLIC_TURNSTILE_SITE_KEY", "site-key");

			expect((await loadWorker()).vars).toMatchObject({
				NUXT_PUBLIC_TURNSTILE_SITE_KEY: "site-key",
			});
		},
	);

	it("lists no Turnstile site key when the build was given none", async () => {
		vi.stubEnv("NUXT_PUBLIC_TURNSTILE_SITE_KEY", "");

		expect((await loadWorker()).vars).not.toHaveProperty("NUXT_PUBLIC_TURNSTILE_SITE_KEY");
	});

	it.each(["CLOUDFLARE_HYPERDRIVE_ID", "NUXT_OAUTH_DISCORD_CLIENT_ID"])(
		"fails the production build when %s is missing",
		async (name) => {
			vi.stubEnv(name, "");

			await expect(loadWorker()).rejects.toThrow(name);
		},
	);
});
