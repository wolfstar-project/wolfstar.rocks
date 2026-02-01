import { describe, expect, it } from "vitest";
import {
  createMockChannel,
  createMockCompleteGuild,
  createMockEmoji,
  createMockOauthFlattenedGuild,
  createMockPartialOauthFlattenedGuild,
  createMockRole,
} from "../../mocks/discord";

describe("discord Mocks", () => {
  describe("createMockOauthFlattenedGuild", () => {
    it("creates a guild with default values", () => {
      const guild = createMockOauthFlattenedGuild();

      expect(guild.id).toBe("123456789012345678");
      expect(guild.name).toBe("Test Guild");
      expect(guild.manageable).toBe(true);
      expect(guild.wolfstarIsIn).toBe(true);
      expect(guild.permissions).toBe(2147483647);
      expect(guild.channels).toEqual([]);
      expect(guild.roles).toEqual([]);
      expect(guild.emojis).toEqual([]);
    });

    it("allows overriding default values", () => {
      const guild = createMockOauthFlattenedGuild({
        id: "999999999999999999",
        name: "Custom Guild",
        manageable: false,
        wolfstarIsIn: false,
        permissions: 0,
      });

      expect(guild.id).toBe("999999999999999999");
      expect(guild.name).toBe("Custom Guild");
      expect(guild.manageable).toBe(false);
      expect(guild.wolfstarIsIn).toBe(false);
      expect(guild.permissions).toBe(0);
    });

    it("preserves unspecified default values when overriding", () => {
      const guild = createMockOauthFlattenedGuild({
        name: "Partial Override",
      });

      expect(guild.name).toBe("Partial Override");
      expect(guild.id).toBe("123456789012345678"); // Default
      expect(guild.manageable).toBe(true); // Default
    });
  });

  describe("createMockPartialOauthFlattenedGuild", () => {
    it("creates a partial guild without OAuth fields", () => {
      const partialGuild = createMockPartialOauthFlattenedGuild();

      expect(partialGuild.id).toBe("123456789012345678");
      expect(partialGuild.name).toBe("Test Guild");
      expect(partialGuild).not.toHaveProperty("permissions");
      expect(partialGuild).not.toHaveProperty("manageable");
      expect(partialGuild).not.toHaveProperty("wolfstarIsIn");
    });
  });

  describe("createMockRole", () => {
    it("creates a role with default values", () => {
      const role = createMockRole();

      expect(role.id).toBe("111111111111111111");
      expect(role.guildId).toBe("123456789012345678");
      expect(role.name).toBe("@everyone");
      expect(role.color).toBe(0);
      expect(role.hoist).toBe(false);
    });

    it("allows overriding role properties", () => {
      const role = createMockRole({
        name: "Admin",
        permissions: "8",
        color: 0xFF0000,
        hoist: true,
      });

      expect(role.name).toBe("Admin");
      expect(role.permissions).toBe("8");
      expect(role.color).toBe(0xFF0000);
      expect(role.hoist).toBe(true);
    });
  });

  describe("createMockEmoji", () => {
    it("creates an emoji with default values", () => {
      const emoji = createMockEmoji();

      expect(emoji.id).toBe("222222222222222222");
      expect(emoji.name).toBe("test_emoji");
      expect(emoji.animated).toBe(false);
      expect(emoji.available).toBe(true);
    });

    it("allows creating animated emojis", () => {
      const emoji = createMockEmoji({
        name: "custom_emoji",
        animated: true,
      });

      expect(emoji.name).toBe("custom_emoji");
      expect(emoji.animated).toBe(true);
    });
  });

  describe("createMockChannel", () => {
    it("creates a channel with default values", () => {
      const channel = createMockChannel();

      expect(channel.id).toBe("333333333333333333");
      expect(channel.name).toBe("general");
      expect(channel.guildId).toBe("123456789012345678");
      expect(channel.type).toBe(0); // GuildText
    });

    it("allows overriding channel properties", () => {
      const channel = createMockChannel({
        name: "announcements",
        parentId: "444444444444444444",
      });

      expect(channel.name).toBe("announcements");
      expect(channel.parentId).toBe("444444444444444444");
    });
  });

  describe("createMockCompleteGuild", () => {
    it("creates a guild with default nested entities", () => {
      const guild = createMockCompleteGuild();

      expect(guild.channels).toHaveLength(3);
      expect(guild.roles).toHaveLength(2);
      expect(guild.emojis).toHaveLength(1);
    });

    it("allows customizing the number of nested entities", () => {
      const guild = createMockCompleteGuild({
        numChannels: 5,
        numRoles: 3,
        numEmojis: 10,
      });

      expect(guild.channels).toHaveLength(5);
      expect(guild.roles).toHaveLength(3);
      expect(guild.emojis).toHaveLength(10);
    });

    it("creates nested entities with correct guild ID", () => {
      const guildId = "custom-guild-id-123";
      const guild = createMockCompleteGuild({
        guildOverrides: { id: guildId },
        numChannels: 2,
        numRoles: 2,
      });

      expect(guild.id).toBe(guildId);
      guild.channels.forEach((channel: any) => {
        expect(channel.guildId).toBe(guildId);
      });
      guild.roles.forEach((role: any) => {
        expect(role.guildId).toBe(guildId);
      });
    });

    it("allows overriding guild properties", () => {
      const guild = createMockCompleteGuild({
        guildOverrides: {
          name: "Complete Test Guild",
          manageable: false,
        },
        numChannels: 2,
      });

      expect(guild.name).toBe("Complete Test Guild");
      expect(guild.manageable).toBe(false);
      expect(guild.channels).toHaveLength(2);
    });

    it("creates channels with unique IDs and sequential positions", () => {
      const guild = createMockCompleteGuild({
        numChannels: 3,
      });

      const channelIds = guild.channels.map((c: any) => c.id);
      const uniqueIds = new Set(channelIds);
      expect(uniqueIds.size).toBe(3); // All IDs are unique

      expect(guild.channels[0].rawPosition).toBe(0);
      expect(guild.channels[1].rawPosition).toBe(1);
      expect(guild.channels[2].rawPosition).toBe(2);
    });

    it("creates roles with unique IDs and sequential positions", () => {
      const guild = createMockCompleteGuild({
        numRoles: 3,
      });

      const roleIds = guild.roles.map((r: any) => r.id);
      const uniqueIds = new Set(roleIds);
      expect(uniqueIds.size).toBe(3); // All IDs are unique

      expect(guild.roles[0].rawPosition).toBe(0);
      expect(guild.roles[1].rawPosition).toBe(1);
      expect(guild.roles[2].rawPosition).toBe(2);
    });
  });
});
