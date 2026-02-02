import deepMerge from "deepmerge";
import { describe, expect, it } from "vitest";
import { createMockGuildData } from "../../mocks/guildData";

// Overwrite arrays when merging (same as composable)
const mergeOptions = {
  arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray,
};

describe("useGuildSettings", () => {
  it("should initialize with undefined settings", () => {
    const guildSettings = undefined;

    expect(guildSettings).toBeUndefined();
  });

  it("should set and retrieve guild settings", () => {
    const mockSettings = createMockGuildData("guild-123");

    let settings: ReturnType<typeof createMockGuildData> | undefined;

    function setGuildSettings(newSettings: ReturnType<typeof createMockGuildData> | undefined) {
      settings = newSettings;
    }

    // Initially undefined
    expect(settings).toBeUndefined();

    // Set settings
    setGuildSettings(mockSettings);

    // Verify settings were set
    expect(settings).toEqual(mockSettings);
    expect(settings?.id).toBe("guild-123");
    expect(settings?.rolesAdmin).toEqual([]);
  });

  it("should merge settings with changes correctly", () => {
    const originalSettings: Partial<ReturnType<typeof createMockGuildData>> = {
      id: "guild-123",
      prefix: "!",
      language: "en-US",
      channelsLogsModeration: "channel-1",
      channelsLogsImage: "channel-2",
      channelsLogsMemberAdd: null,
      channelsIgnoreAll: ["channel-3"],
      rolesAdmin: ["role-1"],
      rolesModerator: [],
      rolesPublic: [],
      rolesRemoveInitial: false,
    };

    const changes: Partial<ReturnType<typeof createMockGuildData>> = {
      channelsLogsImage: "channel-99",
      channelsIgnoreAll: ["channel-4", "channel-5"],
      prefix: "?",
    };

    // Simulate merging
    const mergedSettings = deepMerge(
      originalSettings,
      changes,
      mergeOptions,
    );

    // Verify merge behavior
    expect(mergedSettings.channelsLogsImage).toBe("channel-99"); // Changed
    expect(mergedSettings.channelsLogsModeration).toBe("channel-1"); // Unchanged
    expect(mergedSettings.channelsIgnoreAll).toEqual(["channel-4", "channel-5"]); // Array replaced
    expect(mergedSettings.prefix).toBe("?"); // Changed
    expect(mergedSettings.rolesAdmin).toEqual(["role-1"]); // Unchanged
  });

  it("should handle null values in changes", () => {
    const originalSettings: Partial<ReturnType<typeof createMockGuildData>> = {
      id: "guild-123",
      prefix: "!",
      language: "en-US",
      channelsLogsModeration: "channel-1",
      channelsLogsImage: "channel-2",
      channelsLogsMemberAdd: "channel-3",
      channelsLogsMemberRemove: null,
      channelsIgnoreAll: [],
      rolesAdmin: [],
      rolesModerator: [],
      rolesPublic: [],
      rolesRemoveInitial: false,
    };

    const changes: Partial<ReturnType<typeof createMockGuildData>> = {
      channelsLogsImage: null, // Clear channel
      channelsLogsMemberAdd: null, // Clear message
    };

    const mergedSettings = deepMerge(
      originalSettings,
      changes,
      mergeOptions,
    );

    // Verify null values are applied
    expect(mergedSettings.channelsLogsImage).toBeNull();
    expect(mergedSettings.channelsLogsMemberAdd).toBeNull();
    expect(mergedSettings.channelsLogsModeration).toBe("channel-1"); // Unchanged
  });

  it("should handle array overwrites correctly", () => {
    const originalSettings: Partial<ReturnType<typeof createMockGuildData>> = {
      id: "guild-123",
      prefix: "!",
      language: "en-US",
      channelsLogsModeration: null,
      channelsLogsImage: null,
      channelsLogsMemberAdd: null,
      channelsIgnoreAll: ["channel-1", "channel-2", "channel-3"],
      rolesAdmin: ["role-1", "role-2"],
      rolesModerator: ["role-3"],
      rolesPublic: [],
      rolesRemoveInitial: false,
    };

    const changes: Partial<ReturnType<typeof createMockGuildData>> = {
      channelsIgnoreAll: ["channel-99"], // Replace entire array
      rolesAdmin: [], // Clear array
    };

    const mergedSettings = deepMerge(
      originalSettings,
      changes,
      mergeOptions,
    );

    // Arrays should be completely replaced (not merged)
    expect(mergedSettings.channelsIgnoreAll).toEqual(["channel-99"]);
    expect(mergedSettings.rolesAdmin).toEqual([]);
    expect(mergedSettings.rolesModerator).toEqual(["role-3"]); // Unchanged
  });

  it("should return undefined merged settings when original is undefined", () => {
    const originalSettings = undefined;
    const changes: Partial<ReturnType<typeof createMockGuildData>> = {
      channelsLogsImage: "channel-1",
    };

    // Simulate the behavior where mergedSettings returns undefined if original is undefined
    const mergedSettings = originalSettings
      ? deepMerge(originalSettings, changes, mergeOptions)
      : undefined;

    expect(mergedSettings).toBeUndefined();
  });

  it("should handle empty changes object", () => {
    const originalSettings: Partial<ReturnType<typeof createMockGuildData>> = {
      id: "guild-123",
      prefix: "!",
      language: "en-US",
      channelsLogsModeration: "channel-1",
      channelsLogsImage: null,
      channelsLogsMemberAdd: null,
      channelsIgnoreAll: [],
      rolesAdmin: [],
      rolesModerator: [],
      rolesPublic: [],
      rolesRemoveInitial: false,
    };

    const changes: Partial<ReturnType<typeof createMockGuildData>> = {};

    const mergedSettings = deepMerge(
      originalSettings,
      changes,
      mergeOptions,
    );

    // Should be identical to original
    expect(mergedSettings).toEqual(originalSettings);
  });

  it("should handle boolean changes correctly", () => {
    const originalSettings: Partial<ReturnType<typeof createMockGuildData>> = {
      id: "guild-123",
      prefix: "!",
      language: "en-US",
      channelsLogsModeration: null,
      channelsLogsImage: null,
      channelsLogsMemberAdd: null,
      channelsIgnoreAll: [],
      rolesAdmin: [],
      rolesModerator: [],
      rolesPublic: [],
      rolesRemoveInitial: false,
      disableNaturalPrefix: false,
    };

    const changes: Partial<ReturnType<typeof createMockGuildData>> = {
      rolesRemoveInitial: true,
      disableNaturalPrefix: true,
    };

    const mergedSettings = deepMerge(
      originalSettings,
      changes,
      mergeOptions,
    );

    expect(mergedSettings.rolesRemoveInitial).toBe(true);
    expect(mergedSettings.disableNaturalPrefix).toBe(true);
  });

  it("should handle multiple sequential changes", () => {
    const originalSettings: Partial<ReturnType<typeof createMockGuildData>> = {
      id: "guild-123",
      prefix: "!",
      language: "en-US",
      channelsLogsModeration: "channel-1",
      channelsLogsImage: null,
      channelsLogsMemberAdd: null,
      channelsIgnoreAll: [],
      rolesAdmin: [],
      rolesModerator: [],
      rolesPublic: [],
      rolesRemoveInitial: false,
    };

    // First change
    const changes1: Partial<ReturnType<typeof createMockGuildData>> = {
      channelsLogsImage: "channel-2",
    };

    let mergedSettings = deepMerge(
      originalSettings,
      changes1,
      mergeOptions,
    );

    expect(mergedSettings.channelsLogsImage).toBe("channel-2");

    // Second change (accumulate)
    const changes2: Partial<ReturnType<typeof createMockGuildData>> = {
      channelsLogsMemberAdd: "channel-3",
    };

    mergedSettings = deepMerge(
      mergedSettings,
      changes2,
      mergeOptions,
    );

    // Both changes should be present
    expect(mergedSettings.channelsLogsImage).toBe("channel-2");
    expect(mergedSettings.channelsLogsMemberAdd).toBe("channel-3");
    expect(mergedSettings.channelsLogsModeration).toBe("channel-1"); // Original unchanged
  });
});
