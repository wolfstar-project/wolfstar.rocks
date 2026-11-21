import { CLIENT_OUTDATED_HEADER } from "#shared/utils/skew-protection";
// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("skew-protection.client plugin", () => {
	interface MockNuxtApp {
		hooks: { hook: ReturnType<typeof vi.fn> };
		runWithContext: <T>(fn: () => T) => T;
	}
	type PluginDefinition = {
		setup: (nuxtApp: MockNuxtApp) => void;
	};

	const BUILD_ID = "build-new";

	let setupPlugin: (nuxtApp: MockNuxtApp) => void;
	let mockNuxtApp: MockNuxtApp;
	let capturedHooks: Record<string, (payload?: unknown) => void>;
	let cookieRefs: Map<string, { value: string | null }>;
	let cookieOptions: Map<string, unknown>;
	let stateRefs: Map<string, { value: unknown }>;
	let checkForUpdates: ReturnType<typeof vi.fn>;
	let nativeFetch: ReturnType<typeof vi.fn>;
	let buildId: string | undefined;

	async function loadPlugin() {
		vi.resetModules();
		const mod = await import("~/plugins/skew-protection.client");
		const plugin = mod.default as unknown as PluginDefinition;
		setupPlugin = plugin.setup;
	}

	function makeResponse(status: number, headers: Record<string, string> = {}) {
		return { status, headers: new Headers(headers) } as unknown as Response;
	}

	beforeEach(async () => {
		buildId = BUILD_ID;
		capturedHooks = {};
		cookieRefs = new Map();
		cookieOptions = new Map();
		stateRefs = new Map();
		checkForUpdates = vi.fn(() => Promise.resolve());
		nativeFetch = vi.fn(() => Promise.resolve(makeResponse(200)));

		vi.stubGlobal("defineNuxtPlugin", (definition: PluginDefinition) => definition);
		vi.stubGlobal("useRuntimeConfig", () => ({
			app: { buildId },
			public: { skewProtection: { cookie: { name: "__nkpv", path: "/", sameSite: "lax" } } },
		}));
		vi.stubGlobal("useCookie", (name: string, options: unknown) => {
			cookieOptions.set(name, options);
			if (!cookieRefs.has(name)) cookieRefs.set(name, { value: null });
			return cookieRefs.get(name)!;
		});
		vi.stubGlobal("useState", (key: string, init: () => unknown) => {
			if (!stateRefs.has(key)) stateRefs.set(key, { value: init() });
			return stateRefs.get(key)!;
		});
		vi.stubGlobal("useSkewProtection", () => ({ checkForUpdates }));
		vi.stubGlobal("fetch", nativeFetch);

		mockNuxtApp = {
			hooks: {
				hook: vi.fn((name: string, fn: (payload?: unknown) => void) => {
					capturedHooks[name] = fn;
				}),
			},
			runWithContext: (fn) => fn(),
		};

		await loadPlugin();
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("pins the version cookie to the build the browser is running", () => {
		cookieRefs.set("__nkpv", { value: "build-old" });

		setupPlugin(mockNuxtApp);

		expect(cookieRefs.get("__nkpv")!.value).toBe(BUILD_ID);
		expect(cookieOptions.get("__nkpv")).toMatchObject({ path: "/", sameSite: "lax" });
	});

	it("tracks the app manifest so a mismatch is visible before the prompt mounts", () => {
		setupPlugin(mockNuxtApp);

		expect(stateRefs.get("skew-manifest")!.value).toBeUndefined();
		capturedHooks["app:manifest:update"]!({ id: "build-newer" });
		expect(stateRefs.get("skew-manifest")!.value).toEqual({ id: "build-newer" });
	});

	it("re-checks for updates when a request is rejected as outdated", async () => {
		setupPlugin(mockNuxtApp);
		nativeFetch.mockResolvedValueOnce(makeResponse(409, { [CLIENT_OUTDATED_HEADER]: "true" }));

		const response = await globalThis.fetch("/api/users");

		expect(response.status).toBe(409);
		expect(checkForUpdates).toHaveBeenCalledTimes(1);
	});

	it("leaves ordinary responses alone", async () => {
		setupPlugin(mockNuxtApp);
		nativeFetch.mockResolvedValueOnce(makeResponse(409));

		await globalThis.fetch("/api/guilds/1/settings");
		await globalThis.fetch("/api/users");

		expect(checkForUpdates).not.toHaveBeenCalled();
	});

	it("checks for updates when a hidden tab becomes visible again", () => {
		setupPlugin(mockNuxtApp);

		document.dispatchEvent(new Event("visibilitychange"));

		expect(checkForUpdates).toHaveBeenCalledTimes(1);
	});

	it("still tracks the manifest but touches nothing else without a build id", () => {
		buildId = undefined;

		setupPlugin(mockNuxtApp);

		expect(capturedHooks["app:manifest:update"]).toBeTypeOf("function");
		expect(cookieRefs.size).toBe(0);
		expect(globalThis.fetch).toBe(nativeFetch);
	});
});
