import { describe, expect, it, vi } from "vitest";
import { createI18n } from "vue-i18n";
import {
	prioritizeVueI18nResourceTransform,
	stripEmptyI18nMessagesPlugin,
	stripEmptyMessages,
} from "../../../config/i18n-empty-placeholders";

type TransformHook = (
	this: unknown,
	code: string,
	id: string,
) => { code: string; map: null } | null;

function transform(code: string, id: string): { code: string; map: null } | null {
	const plugin = stripEmptyI18nMessagesPlugin();
	const transform = plugin.transform;
	const hook = (typeof transform === "function"
		? transform
		: transform?.handler) as unknown as TransformHook;
	return hook.call({}, code, id);
}

describe("stripEmptyMessages", () => {
	it("drops empty-string leaves and keeps translated ones", () => {
		expect(stripEmptyMessages({ a: "Ciao", b: "", c: "Mondo" })).toEqual({
			a: "Ciao",
			c: "Mondo",
		});
	});

	it("prunes objects left empty by the removal", () => {
		expect(
			stripEmptyMessages({ nav: { blog: "", commands: "" }, footer: { legal: "Legale" } }),
		).toEqual({ footer: { legal: "Legale" } });
	});

	it("returns undefined for a fully untranslated file", () => {
		expect(stripEmptyMessages({ nav: { blog: "", nested: { deep: "" } } })).toBeUndefined();
	});

	it("keeps non-string values untouched", () => {
		expect(stripEmptyMessages({ count: 0, enabled: false, list: ["", "x"] })).toEqual({
			count: 0,
			enabled: false,
			list: ["", "x"],
		});
	});
});

describe("stripEmptyI18nMessagesPlugin", () => {
	it("runs before Vite's JSON transform", () => {
		const plugin = stripEmptyI18nMessagesPlugin();
		expect(plugin.enforce).toBe("pre");
		expect(plugin.transform).toMatchObject({ order: "pre" });
	});

	it("prioritizes and deduplicates wrapped vue-i18n resource transforms", async () => {
		const resourceTransform = vi.fn((code: string) => ({ code, map: null }));
		const resourcePlugin = {
			name: "unplugin-vue-i18n:resource",
			transform: resourceTransform,
		};
		const wrapperPlugin = {
			name: "unplugin-vue-i18n:resource:wrapper",
			applyToEnvironment: vi.fn(() => [resourcePlugin]),
		};

		prioritizeVueI18nResourceTransform([wrapperPlugin]);
		await wrapperPlugin.applyToEnvironment();

		expect(resourcePlugin.transform).toMatchObject({ order: "pre" });
		const hook = resourcePlugin.transform as unknown as {
			handler: TransformHook;
		};
		const id = "/repo/i18n/locales/en/common.json";

		expect(await hook.handler.call({}, "{}", id)).toEqual({ code: "{}", map: null });
		expect(await hook.handler.call({}, "export default {}", id)).toBeNull();
		expect(resourceTransform).toHaveBeenCalledTimes(1);
	});

	it("prioritizes plugins returned from an async applyToEnvironment wrapper", async () => {
		const resourcePlugin = {
			name: "unplugin-vue-i18n:resource",
			transform: vi.fn((code: string) => ({ code, map: null })),
		};
		const wrapperPlugin = {
			name: "unplugin-vue-i18n:resource:wrapper",
			applyToEnvironment: vi.fn(() => Promise.resolve(resourcePlugin)),
		};

		prioritizeVueI18nResourceTransform([wrapperPlugin]);
		await wrapperPlugin.applyToEnvironment();
		await Promise.resolve();

		expect(resourcePlugin.transform).toMatchObject({ order: "pre" });
	});

	it("still prioritizes the transform of a gating applyToEnvironment plugin", async () => {
		const resourceTransform = vi.fn((code: string) => ({ code, map: null }));
		const resourcePlugin = {
			name: "unplugin-vue-i18n:resource",
			applyToEnvironment: vi.fn(() => true),
			transform: resourceTransform,
		};

		prioritizeVueI18nResourceTransform([[resourcePlugin]]);

		expect(resourcePlugin.applyToEnvironment()).toBe(true);
		expect(resourcePlugin.transform).toMatchObject({ order: "pre" });
		const hook = resourcePlugin.transform as unknown as { handler: TransformHook };
		const id = "/repo/i18n/locales/en/common.json";

		expect(await hook.handler.call({}, "export default {}", id)).toBeNull();
		expect(await hook.handler.call({}, "{}", id)).toEqual({ code: "{}", map: null });
		expect(resourceTransform).toHaveBeenCalledTimes(1);
	});

	it("strips empty placeholders and the $schema pointer from locale files", () => {
		const result = transform(
			JSON.stringify({
				$schema: "../../schemas/common.schema.json",
				nav: { blog: "", commands: "Befehle" },
			}),
			"/repo/i18n/locales/de-DE/common.json",
		);

		expect(result?.code).toBe(JSON.stringify({ nav: { commands: "Befehle" } }));
	});

	it("emits an empty object for a fully untranslated file", () => {
		const result = transform(
			JSON.stringify({ nav: { blog: "" } }),
			"/repo/i18n/locales/uk-UA/common.json",
		);

		expect(result?.code).toBe("{}");
	});

	it("handles ids carrying a query string", () => {
		const result = transform(
			JSON.stringify({ nav: { blog: "", commands: "Команди" } }),
			"/repo/i18n/locales/uk-UA/common.json?import",
		);

		expect(result?.code).toBe(JSON.stringify({ nav: { commands: "Команди" } }));
	});

	it("ignores JSON outside i18n/locales and non-JSON files", () => {
		expect(transform(JSON.stringify({ a: "" }), "/repo/package.json")).toBeNull();
		expect(transform("export default {}", "/repo/i18n/locales/de-DE/common.ts")).toBeNull();
	});
});

describe("vue-i18n fallback for stripped placeholders", () => {
	const messages = {
		"en-US": { nav: { blog: "Blog", commands: "Commands" } },
		"de-DE": { nav: { blog: "", commands: "Befehle" } },
	};

	it("renders the empty placeholder verbatim when it is not stripped", () => {
		const { t } = createI18n({
			legacy: false,
			locale: "de-DE",
			fallbackLocale: "en-US",
			messages,
		}).global;

		expect(t("nav.blog")).toBe("");
	});

	it("falls back to English once the placeholder is stripped", () => {
		const { t } = createI18n({
			legacy: false,
			locale: "de-DE",
			fallbackLocale: "en-US",
			messages: {
				"en-US": messages["en-US"],
				"de-DE": stripEmptyMessages(messages["de-DE"]) as (typeof messages)["en-US"],
			},
		}).global;

		expect(t("nav.blog")).toBe("Blog");
		expect(t("nav.commands")).toBe("Befehle");
	});
});
