import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const loadWorker = async () => (await import("../../../config/cloudflare")).WORKER;

/** The production Worker's configuration, which the default env of these tests builds. */
const loadProductionWorker = async () => {
	const { DEPLOYED_WORKER } = await import("../../../config/cloudflare");
	if (!DEPLOYED_WORKER) throw new Error("The build wrote no Worker configuration.");
	return DEPLOYED_WORKER;
};

describe("the Worker a build deploys to", () => {
	beforeEach(() => {
		vi.resetModules();
		vi.stubEnv("NITRO_PRESET", "cloudflare_module");
		vi.stubEnv("CLOUDFLARE_WORKER", "production");
		vi.stubEnv("CLOUDFLARE_HYPERDRIVE_ID", "hyperdrive-id");
		vi.stubEnv("NUXT_OAUTH_DISCORD_CLIENT_ID", "client-id");
	});

	afterEach(() => {
		vi.unstubAllEnvs();
	});

	it.each([undefined, "alpha"])(
		"fails a Workers build whose target is %s, since no Worker is a safe default",
		async (target) => {
			vi.stubEnv("CLOUDFLARE_WORKER", target);

			await expect(loadWorker()).rejects.toThrow("CLOUDFLARE_WORKER");
		},
	);

	it("writes no Worker configuration for a build that is not for Workers", async () => {
		vi.stubEnv("NITRO_PRESET", "node-server");
		vi.stubEnv("CLOUDFLARE_WORKER", undefined);

		expect(await loadWorker()).toBeUndefined();
	});

	it("takes production's Hyperdrive and Discord application from the env", async () => {
		const worker = await loadProductionWorker();

		expect(worker.name).toBe("wolfstar-rocks");
		expect(worker.hyperdrive[0]?.id).toBe("hyperdrive-id");
		expect(worker.vars.NUXT_OAUTH_DISCORD_CLIENT_ID).toBe("client-id");
	});

	it("serves the production Worker on wolfstar.rocks only", async () => {
		expect((await loadProductionWorker()).routes).toEqual([
			{ custom_domain: true, pattern: "wolfstar.rocks" },
		]);
	});

	it("builds beta as the beta environment of the production Worker", async () => {
		vi.stubEnv("CLOUDFLARE_WORKER", "beta");
		const config = await import("../../../config/cloudflare");

		expect(config.WORKER?.name).toBe("wolfstar-rocks");
		expect(config.WORKER_DEPLOY_ENV).toBe("beta");
		expect(config.DEPLOYED_WORKER?.routes).toEqual([
			{ custom_domain: true, pattern: "beta.wolfstar.rocks" },
		]);
		expect(config.DEPLOYED_WORKER?.vars).toMatchObject({
			NUXT_OAUTH_DISCORD_CLIENT_ID: "1288560050184650802",
			NUXT_PUBLIC_SITE_URL: "https://beta.wolfstar.rocks",
		});
	});

	// Production's bindings and domains belong to production builds only.
	it("leaves production's bindings and domains out of the beta build", async () => {
		vi.stubEnv("CLOUDFLARE_WORKER", "beta");
		const worker = await loadWorker();

		expect(worker).toBeDefined();
		expect(worker).not.toHaveProperty("routes");
		expect(worker).not.toHaveProperty("hyperdrive");
		expect(worker).not.toHaveProperty("kv_namespaces");
	});

	it("finds the skew protection namespace of the environment it deploys", async () => {
		vi.stubEnv("CLOUDFLARE_WORKER", "beta");
		const config = await import("../../../config/cloudflare");

		expect(config.SKEW_PROTECTION_NAMESPACE_ID).toBe("68a50da1ca7b4f2985b874440ed258a9");
	});

	// Production's cookies cover the whole domain, so beta reaches them too.
	it("names beta's cookies apart from production's", async () => {
		vi.stubEnv("CLOUDFLARE_WORKER", "beta");

		const { DEPLOYED_WORKER } = await import("../../../config/cloudflare");
		expect(DEPLOYED_WORKER?.vars).toMatchObject({
			NUXT_BOT_API_OAUTH_COOKIE: "WOLFSTAR_BETA_AUTH",
			NUXT_SESSION_COOKIE_NAME: "wolfstar-session-beta",
		});
	});

	it("needs no production variable to build the beta Worker", async () => {
		vi.stubEnv("CLOUDFLARE_WORKER", "beta");
		vi.stubEnv("CLOUDFLARE_HYPERDRIVE_ID", "");
		vi.stubEnv("NUXT_OAUTH_DISCORD_CLIENT_ID", "");

		const { DEPLOYED_WORKER } = await import("../../../config/cloudflare");
		expect(DEPLOYED_WORKER?.hyperdrive[0]?.id).toBe("e8347aa5f2f2420d81eebe933ec98cb7");
	});

	it.each(["production", "beta"])(
		"keeps the Turnstile site key in the vars of the %s Worker, so a deploy does not drop it",
		async (worker) => {
			vi.stubEnv("CLOUDFLARE_WORKER", worker);
			vi.stubEnv("NUXT_PUBLIC_TURNSTILE_SITE_KEY", "site-key");

			const { DEPLOYED_WORKER } = await import("../../../config/cloudflare");
			expect(DEPLOYED_WORKER?.vars).toMatchObject({
				NUXT_PUBLIC_TURNSTILE_SITE_KEY: "site-key",
			});
		},
	);

	it("lists no Turnstile site key when the build was given none", async () => {
		vi.stubEnv("NUXT_PUBLIC_TURNSTILE_SITE_KEY", "");

		expect((await loadProductionWorker()).vars).not.toHaveProperty(
			"NUXT_PUBLIC_TURNSTILE_SITE_KEY",
		);
	});

	it.each(["CLOUDFLARE_HYPERDRIVE_ID", "NUXT_OAUTH_DISCORD_CLIENT_ID"])(
		"fails the production build when %s is missing",
		async (name) => {
			vi.stubEnv(name, "");

			await expect(loadWorker()).rejects.toThrow(name);
		},
	);
});
