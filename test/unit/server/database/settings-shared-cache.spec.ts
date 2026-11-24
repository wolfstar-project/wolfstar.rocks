import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { mockFetchGuildData, mockWriteGuildData } = vi.hoisted(() => ({
	mockFetchGuildData: vi.fn(),
	mockWriteGuildData: vi.fn(),
}));

vi.mock("#server/database/prisma", () => ({ db: { orm: {} } }));
vi.mock("#server/database/settings/storage", () => ({
	fetchGuildData: mockFetchGuildData,
	writeGuildData: mockWriteGuildData,
}));
vi.mock("#server/database/settings/context/functions", () => ({
	getSettingsContext: vi.fn(),
	updateSettingsContext: vi.fn(),
}));
vi.mock("#server/database/settings/notify", () => ({
	notifyGuildSettingsUpdate: vi.fn(),
}));

import {
	isGuildUnconfigured,
	readSettings,
	writeSettingsTransaction,
} from "#server/database/settings/functions";

// The module keeps what it read, so each test takes a guild of its own.
let nextGuild = 300_000_000_000_000_000n;
function guildId() {
	nextGuild += 1n;
	return String(nextGuild);
}

const settingsKey = (id: string) => `settings:guild:${id}`;

describe("readSettings on Cloudflare Workers", () => {
	const stored = new Map<string, unknown>();

	beforeEach(() => {
		vi.clearAllMocks();
		stored.clear();
		vi.stubGlobal("navigator", { userAgent: "Cloudflare-Workers" });
		vi.stubGlobal("useStorage", () => ({
			getItem: async (key: string) => stored.get(key) ?? null,
			setItem: async (key: string, value: unknown) => {
				stored.set(key, structuredClone(value));
			},
		}));
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("serves the copy another isolate read within the window, without the database", async () => {
		const id = guildId();
		stored.set(settingsKey(id), {
			at: Date.now() - 5_000,
			value: { data: { id, language: "it-IT" }, unconfigured: true },
		});

		const settings = await readSettings(id);

		expect(mockFetchGuildData).not.toHaveBeenCalled();
		expect(settings.language).toBe("it-IT");
		expect(isGuildUnconfigured(id)).toBe(true);
	});

	it("reads the database once the shared copy is older than the window, and shares it", async () => {
		const id = guildId();
		stored.set(settingsKey(id), {
			at: Date.now() - 16_000,
			value: { data: { id, language: "it-IT" }, unconfigured: false },
		});
		mockFetchGuildData.mockResolvedValue({ id, language: "de" });

		const settings = await readSettings(id);

		expect(mockFetchGuildData).toHaveBeenCalledOnce();
		expect(settings.language).toBe("de");
		await vi.waitFor(() =>
			expect(stored.get(settingsKey(id))).toMatchObject({
				value: { data: { language: "de" }, unconfigured: false },
			}),
		);
	});

	it("shares that a guild has no rows", async () => {
		const id = guildId();
		mockFetchGuildData.mockResolvedValue(null);

		await readSettings(id);

		await vi.waitFor(() =>
			expect(stored.get(settingsKey(id))).toMatchObject({ value: { unconfigured: true } }),
		);
	});

	it("shares what a write wrote", async () => {
		const id = guildId();
		mockFetchGuildData.mockResolvedValue({ id, language: "it-IT" });
		mockWriteGuildData.mockResolvedValue(undefined);

		const transaction = await writeSettingsTransaction(id);
		await transaction.write({ language: "fr" }).submit();
		transaction.dispose();

		await vi.waitFor(() =>
			expect(stored.get(settingsKey(id))).toMatchObject({
				value: { data: { language: "fr" } },
			}),
		);
	});

	it("answers the written settings when a write overtook the shared read", async () => {
		const id = guildId();
		mockFetchGuildData.mockResolvedValue({ id, language: "it-IT" });
		mockWriteGuildData.mockResolvedValue(undefined);
		let release: (value: unknown) => void = () => {};
		vi.stubGlobal("useStorage", () => ({
			getItem: () =>
				new Promise((resolve) => {
					release = resolve;
				}),
			setItem: async () => undefined,
		}));

		const reading = readSettings(id);
		const transaction = await writeSettingsTransaction(id);
		await transaction.write({ language: "fr" }).submit();
		transaction.dispose();
		release({ at: Date.now(), value: { data: { id, language: "de" }, unconfigured: false } });

		expect((await reading).language).toBe("fr");
	});

	it("reads the database when the storage fails", async () => {
		const id = guildId();
		vi.stubGlobal("useStorage", () => ({
			getItem: () => Promise.reject(new Error("KV down")),
			setItem: () => Promise.reject(new Error("KV down")),
		}));
		mockFetchGuildData.mockResolvedValue({ id, language: "es-ES" });

		const settings = await readSettings(id);

		expect(settings.language).toBe("es-ES");
	});
});
