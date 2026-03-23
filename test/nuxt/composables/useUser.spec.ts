import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createMockOauthFlattenedGuild, createMockUser } from "~~/test/mocks/discord";

const mockCachedFetch = vi.fn().mockResolvedValue({
	data: { transformedGuilds: [], user: null },
	isStale: false,
	cachedAt: null,
});

mockNuxtImport("useCachedFetch", () => () => mockCachedFetch);

describe("useUser", () => {
	beforeEach(() => {
		mockCachedFetch.mockClear();
		mockCachedFetch.mockResolvedValue({
			data: { transformedGuilds: [], user: null },
			isStale: false,
			cachedAt: null,
		});
	});
	it("should accept timeout option and pass to fetch", () => {
		const mockUser = createMockUser();
		expect(() => {
			useUser(mockUser, { timeout: 5000 });
		}).not.toThrow();
	});

	it("should accept retry options and pass to fetch", () => {
		const mockUser = createMockUser();
		expect(() => {
			useUser(mockUser, { retry: 3, retryDelay: 1000 });
		}).not.toThrow();
	});

	it("should handle null user gracefully", () => {
		expect(() => {
			useUser(null);
		}).not.toThrow();
	});

	it("should work without options parameter (backwards compatibility)", () => {
		const mockUser = createMockUser();
		expect(() => {
			useUser(mockUser);
		}).not.toThrow();
	});

	it("should accept partial fetch options", () => {
		const mockUser = createMockUser();

		expect(() => {
			useUser(mockUser, { timeout: 10_000 });
		}).not.toThrow();

		expect(() => {
			useUser(mockUser, { retry: 2 });
		}).not.toThrow();
	});

	it("should return guilds as empty array when data is null", () => {
		const mockUser = createMockUser();
		const result = useUser(mockUser);
		expect(result.guilds.value).toStrictEqual([]);
	});

	it("should return filteredGuilds as empty array when data is null", () => {
		const mockUser = createMockUser();
		const result = useUser(mockUser);
		expect(result.filteredGuilds.value).toStrictEqual([]);
	});

	it("should transform data to include transformedGuilds after fetch", async () => {
		const mockUser = createMockUser();
		const mockTransformedGuilds = [
			createMockOauthFlattenedGuild({ id: "1", name: "Guild 1" }),
			createMockOauthFlattenedGuild({ id: "2", name: "Guild 2" }),
		];

		mockCachedFetch.mockResolvedValueOnce({
			data: { transformedGuilds: mockTransformedGuilds, user: mockUser },
			isStale: false,
			cachedAt: null,
		});

		const result = useUser(mockUser);
		await result.execute();

		expect(result.data.value).toBeDefined();
		expect(result.data.value?.transformedGuilds).toStrictEqual(mockTransformedGuilds);
		expect(result.guilds.value).toHaveLength(2);
	});

	it("should sort filteredGuilds by manageable > wolfstarIsIn > alphabetical", async () => {
		const mockUser = createMockUser();
		const guilds = [
			createMockOauthFlattenedGuild({
				id: "1",
				name: "Zebra",
				manageable: false,
				wolfstarIsIn: false,
			}),
			createMockOauthFlattenedGuild({
				id: "2",
				name: "Alpha",
				manageable: true,
				wolfstarIsIn: true,
			}),
			createMockOauthFlattenedGuild({
				id: "3",
				name: "Beta",
				manageable: true,
				wolfstarIsIn: false,
			}),
			createMockOauthFlattenedGuild({
				id: "4",
				name: "Gamma",
				manageable: false,
				wolfstarIsIn: true,
			}),
		];

		mockCachedFetch.mockResolvedValueOnce({
			data: { transformedGuilds: guilds, user: mockUser },
			isStale: false,
			cachedAt: null,
		});

		const result = useUser(mockUser);
		await result.execute();

		const sorted = result.filteredGuilds.value;
		expect(sorted.map((g) => g.name)).toStrictEqual(["Alpha", "Beta", "Gamma", "Zebra"]);
	});

	it("should pass fetch options through to cachedFetch", async () => {
		const mockUser = createMockUser();

		mockCachedFetch.mockResolvedValueOnce({
			data: { transformedGuilds: [], user: mockUser },
			isStale: false,
			cachedAt: null,
		});

		const result = useUser(mockUser, { timeout: 5000 });
		await result.execute();

		expect(mockCachedFetch).toHaveBeenCalledWith(
			"/api/users",
			expect.objectContaining({ timeout: 5000 }),
		);
	});

	it("should expose guilds computed separately from data", async () => {
		const mockUser = createMockUser();
		const mockGuilds = [createMockOauthFlattenedGuild({ id: "1", name: "Test" })];

		mockCachedFetch.mockResolvedValueOnce({
			data: { transformedGuilds: mockGuilds, user: mockUser },
			isStale: false,
			cachedAt: null,
		});

		const result = useUser(mockUser);
		await result.execute();

		expect(result.guilds.value).toStrictEqual(mockGuilds);
		expect(result.data.value?.transformedGuilds).toStrictEqual(mockGuilds);
	});
});
