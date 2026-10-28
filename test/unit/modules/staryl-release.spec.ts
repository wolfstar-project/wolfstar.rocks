import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ fetchStarylRelease: vi.fn(), warn: vi.fn() }));

// Vitest sets `isTest`; the module is exercised as a build would run it.
vi.mock("std-env", async (importOriginal) => ({
	...(await importOriginal<typeof import("std-env")>()),
	isTest: false,
}));
vi.mock("nuxt/kit", async (importOriginal) => ({
	...(await importOriginal<typeof import("nuxt/kit")>()),
	useLogger: () => ({ warn: mocks.warn }),
}));
vi.mock("../../../config/staryl-release.ts", () => ({
	fetchStarylRelease: mocks.fetchStarylRelease,
}));

const { default: starylReleaseModule } = await import("../../../modules/staryl-release");

interface FakeNuxt {
	options: { dev: boolean; test: boolean; _prepare: boolean; appConfig: Record<string, unknown> };
}

function createNuxt(overrides: Partial<FakeNuxt["options"]> = {}): FakeNuxt {
	return { options: { dev: false, test: false, _prepare: false, appConfig: {}, ...overrides } };
}

// The module is only ever called by Nuxt with a real instance; the fake carries
// the fields `setup()` touches.
async function runModule(nuxt: FakeNuxt): Promise<void> {
	await (starylReleaseModule as unknown as (options: object, nuxt: FakeNuxt) => Promise<void>)(
		{},
		nuxt,
	);
}

describe("the staryl-release module", () => {
	beforeEach(() => {
		mocks.fetchStarylRelease.mockReset();
		mocks.warn.mockReset();
	});

	it("reads Staryl's release from GitHub for a build", async () => {
		const release = { version: "1.2.0", time: Date.parse("2026-11-02T10:00:00Z") };
		mocks.fetchStarylRelease.mockResolvedValue(release);
		const nuxt = createNuxt();

		await runModule(nuxt);

		expect(nuxt.options.appConfig.starylRelease).toStrictEqual(release);
		expect(mocks.warn).not.toHaveBeenCalled();
	});

	it("says so in the build log when GitHub cannot be read", async () => {
		mocks.fetchStarylRelease.mockResolvedValue(null);
		const nuxt = createNuxt();

		await runModule(nuxt);

		expect(nuxt.options.appConfig.starylRelease).toBeNull();
		expect(mocks.warn).toHaveBeenCalledOnce();
	});

	// `nuxt prepare` runs on every install and typecheck, and neither ships the page.
	it.each([
		["the dev server", { dev: true }],
		["nuxt prepare", { _prepare: true }],
	])("leaves GitHub alone for %s", async (_label, options) => {
		const nuxt = createNuxt(options);

		await runModule(nuxt);

		expect(mocks.fetchStarylRelease).not.toHaveBeenCalled();
		expect(nuxt.options.appConfig.starylRelease).toMatchObject({ version: expect.any(String) });
	});
});
