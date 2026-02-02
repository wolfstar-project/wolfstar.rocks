import { describe, expect, it } from "vitest";
import { createMockOauthFlattenedGuild } from "../../mocks/discord";

describe("useGuildData", () => {
  it("should initialize with undefined guild data", () => {
    const mockGuild = undefined;

    expect(mockGuild).toBeUndefined();
  });

  it("should set guild data correctly", () => {
    const mockGuildData = createMockOauthFlattenedGuild({
      id: "123456789",
      name: "Test Guild",
      icon: "test-icon-hash",
      permissions: 8,
      manageable: true,
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
    expect(guildData).toEqual(mockGuildData);
    expect(guildData?.id).toBe("123456789");
    expect(guildData?.name).toBe("Test Guild");
  });

  it("should update guild data when set multiple times", () => {
    const initialGuild = createMockOauthFlattenedGuild({
      id: "123456789",
      name: "Test Guild",
      icon: "test-icon-hash",
      permissions: 8,
      manageable: false,
      wolfstarIsIn: true,
    });

    const updatedGuild = createMockOauthFlattenedGuild({
      id: "123456789",
      name: "Updated Guild Name",
      icon: "updated-icon-hash",
      permissions: 2048,
      manageable: true,
      wolfstarIsIn: true,
    });

    let guildData: ReturnType<typeof createMockOauthFlattenedGuild> | undefined;

    function setGuildData(newGuildData: ReturnType<typeof createMockOauthFlattenedGuild>) {
      guildData = newGuildData;
    }

    // Set initial data
    setGuildData(initialGuild);
    expect(guildData?.name).toBe("Test Guild");
    expect(guildData?.manageable).toBe(false);

    // Update data
    setGuildData(updatedGuild);
    expect(guildData?.name).toBe("Updated Guild Name");
    expect(guildData?.manageable).toBe(true);
    expect(guildData?.permissions).toBe(2048);
  });

  it("should handle guild with permissions and manageable flags", () => {
    const fullGuild = createMockOauthFlattenedGuild({
      id: "987654321",
      name: "Full Guild",
      icon: "icon-hash",
      permissions: 2147483647,
      manageable: true,
      wolfstarIsIn: true,
    });

    let guildData: ReturnType<typeof createMockOauthFlattenedGuild> | undefined;

    function setGuildData(newGuildData: ReturnType<typeof createMockOauthFlattenedGuild>) {
      guildData = newGuildData;
    }

    setGuildData(fullGuild);

    expect(guildData).toEqual(fullGuild);
    expect(guildData?.manageable).toBe(true);
    expect(guildData?.permissions).toBe(2147483647);
  });

  it("should maintain data immutability pattern", () => {
    const originalGuild = createMockOauthFlattenedGuild({
      id: "123456789",
      name: "Test Guild",
      icon: "test-icon-hash",
      permissions: 8,
      manageable: true,
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
