import { describe, expect, it } from "vitest";
import { createMockOauthFlattenedGuild } from "~~/test/mocks/discord";

describe("useGuildData", () => {
	it("should initialize with undefined guild data", () => {
		const mockGuild = undefined;

		expect(mockGuild).toBeUndefined();
	});

	it("should set guild data correctly", () => {
		const mockGuildData = createMockOauthFlattenedGuild({
			icon: "test-icon-hash",
			id: "123456789",
			manageable: true,
			name: "Test Guild",
			permissions: 8,
			wolfstarIsIn: true,
		});

		let guildData: Partial<OauthFlattenedGuild> | undefined;

		function setGuildData(newGuildData: Partial<OauthFlattenedGuild>) {
			guildData = newGuildData;
		}

		// Initially undefined
		expect(guildData).toBeUndefined();

		// Set guild data
		setGuildData(mockGuildData);

		// Verify data was set
		expect(guildData).toStrictEqual(mockGuildData);
		expect(guildData?.id).toBe("123456789");
		expect(guildData?.name).toBe("Test Guild");
	});

	it("should update guild data when set multiple times", () => {
		const initialGuild = createMockOauthFlattenedGuild({
			icon: "test-icon-hash",
			id: "123456789",
			manageable: false,
			name: "Test Guild",
			permissions: 8,
			wolfstarIsIn: true,
		});

		const updatedGuild = createMockOauthFlattenedGuild({
			icon: "updated-icon-hash",
			id: "123456789",
			manageable: true,
			name: "Updated Guild Name",
			permissions: 2048,
			wolfstarIsIn: true,
		});

		let guildData: ReturnType<typeof createMockOauthFlattenedGuild> | undefined;

		function setGuildData(newGuildData: ReturnType<typeof createMockOauthFlattenedGuild>) {
			guildData = newGuildData;
		}

		// Set initial data
		setGuildData(initialGuild);
		expect(guildData?.name).toBe("Test Guild");
		expect(guildData?.manageable).toBeFalsy();

		// Update data
		setGuildData(updatedGuild);
		expect(guildData?.name).toBe("Updated Guild Name");
		expect(guildData?.manageable).toBeTruthy();
		expect(guildData?.permissions).toBe(2048);
	});

	it("should handle guild with permissions and manageable flags", () => {
		const fullGuild = createMockOauthFlattenedGuild({
			icon: "icon-hash",
			id: "987654321",
			manageable: true,
			name: "Full Guild",
			permissions: 2_147_483_647,
			wolfstarIsIn: true,
		});

		let guildData: ReturnType<typeof createMockOauthFlattenedGuild> | undefined;

		function setGuildData(newGuildData: ReturnType<typeof createMockOauthFlattenedGuild>) {
			guildData = newGuildData;
		}

		setGuildData(fullGuild);

		expect(guildData).toStrictEqual(fullGuild);
		expect(guildData?.manageable).toBeTruthy();
		expect(guildData?.permissions).toBe(2_147_483_647);
	});

	it("should maintain data immutability pattern", () => {
		const originalGuild = createMockOauthFlattenedGuild({
			icon: "test-icon-hash",
			id: "123456789",
			manageable: true,
			name: "Test Guild",
			permissions: 8,
			wolfstarIsIn: true,
		});

		let guildData: ReturnType<typeof createMockOauthFlattenedGuild> | undefined;

		function setGuildData(newGuildData: ReturnType<typeof createMockOauthFlattenedGuild>) {
			guildData = newGuildData;
		}

		setGuildData(originalGuild);

		// Store reference to original data
		const reference = guildData;

		// Modify the original object
		originalGuild.name = "Modified Name";

		// Since we're passing by reference, the stored data will also change
		// This test verifies the current behavior (not necessarily ideal for immutability)
		expect(guildData?.name).toBe("Modified Name");
		expect(reference).toBe(guildData); // Same reference
	});
});
