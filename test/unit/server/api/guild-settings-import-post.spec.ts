import type { ConfigurationNotice } from "#shared/utils/settings-transfer";
import { beforeEach, describe, expect, it, vi } from "vitest";

// vi.hoisted() ensures globals are present before the route module is evaluated.
const { mocks } = vi.hoisted(() => {
	const mocks = {
		body: {} as unknown,
		notices: [] as unknown[],
		applyConfigurationImport: vi.fn(),
	};

	const globals = globalThis as Record<string, unknown>;
	globals.defineWrappedResponseHandler = (fn: unknown) => fn;
	globals.readValidatedBody = (_event: unknown, validate: (value: unknown) => unknown) =>
		Promise.resolve(validate(mocks.body));
	globals.seconds = (n: number) => n;
	globals.minutes = (n: number) => n;

	return { mocks };
});

vi.mock("#server/utils/automod/route", () => ({
	authorizeAutoModerationManager: vi.fn(),
}));
vi.mock("#server/utils/guilds/manager", () => ({
	useManagedGuild: () => ({
		guild: { id: "100000000000000009" },
		member: { user: { id: "user-1", username: "alice" } },
	}),
}));
vi.mock("#server/utils/automod/rules", () => ({
	readAutoModerationRules: vi.fn().mockResolvedValue([]),
}));
vi.mock("#server/database", () => ({ readSettings: vi.fn().mockResolvedValue({}) }));
vi.mock("#server/utils/settings-transfer/parse", () => ({
	parseConfigurationFile: () => ({ ok: true, value: { notices: mocks.notices } }),
}));
vi.mock("#server/utils/settings-transfer/apply", () => ({
	applyConfigurationImport: mocks.applyConfigurationImport,
	ConfigurationImportStaleError: class extends Error {},
}));
vi.mock("#server/utils/settings-transfer/plan", () => ({
	planConfigurationImport: vi.fn(),
	summarizeConfigurationPlan: vi.fn().mockReturnValue({ isEmpty: true }),
}));
vi.mock("evlog", async (importOriginal) => ({
	...(await importOriginal<typeof import("evlog")>()),
	useLogger: vi.fn().mockReturnValue({ set: vi.fn(), error: vi.fn() }),
	withAuditMethods: (log: object) => ({ ...log, audit: vi.fn() }),
}));

import type { H3Event } from "h3";
import postHandler from "#server/api/guilds/[guild]/settings/import.post";
import { getNoticesDigest } from "#shared/utils/settings-transfer";

const callHandler = postHandler as unknown as (event: H3Event) => Promise<unknown>;

const leftOut: ConfigurationNotice = {
	kind: "ruleFailed",
	path: "settings.selfmod.links",
	rule: "Links",
	reason: "The server already has 25 rules, which is the most it can have.",
};

describe("POST /api/guilds/:guild/settings/import", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.notices = [];
		mocks.applyConfigurationImport.mockResolvedValue({
			plan: { isEmpty: true },
			audit: { before: {}, after: {} },
			settings: {},
			rules: [],
		});
	});

	it("refuses as the server having changed an import that leaves out more than the preview showed", async () => {
		// The preview added the Links filter; read again, the server is full by now.
		mocks.notices = [leftOut];
		mocks.body = { text: "{}", apply: true, noticesDigest: getNoticesDigest([]) };

		await expect(callHandler({} as H3Event)).rejects.toMatchObject({ status: 409 });
		expect(mocks.applyConfigurationImport).not.toHaveBeenCalled();
	});

	it("takes the digest of a preview that left out a great many things", async () => {
		mocks.notices = Array.from({ length: 600 }, (_, index) => ({
			...leftOut,
			rule: `Rule ${index}`,
		}));
		mocks.body = {
			text: "{}",
			apply: true,
			noticesDigest: getNoticesDigest(mocks.notices as ConfigurationNotice[]),
		};

		await callHandler({} as H3Event);

		expect(mocks.applyConfigurationImport).toHaveBeenCalledOnce();
	});

	it("applies what the preview showed, its notices included", async () => {
		mocks.notices = [leftOut];
		mocks.body = { text: "{}", apply: true, noticesDigest: getNoticesDigest([leftOut]) };

		await callHandler({} as H3Event);

		expect(mocks.applyConfigurationImport).toHaveBeenCalledOnce();
	});
});
