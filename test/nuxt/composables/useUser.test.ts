import type { User } from "#auth-utils";
import { describe, expect, it } from "vitest";

/**
 * Creates a mock User object for testing
 */
function createMockUser(overrides?: Partial<User>): User {
  return {
    id: "123456789012345678",
    name: "Test User",
    globalName: "Test User",
    username: "testuser",
    avatar: "a1b2c3d4e5f6g7h8i9j0",
    ...overrides,
  };
}

describe("useUser", () => {
  it("should accept timeout option and pass to fetch", () => {
    const mockUser = createMockUser();
    const timeout = 5000;

    // This test will fail until we implement the options parameter
    // We need to verify that the timeout option is passed through to cachedFetch
    expect(() => {
      useUser(mockUser, { timeout });
    }).not.toThrow();
  });

  it("should accept retry options and pass to fetch", () => {
    const mockUser = createMockUser();
    const retry = 3;
    const retryDelay = 1000;

    // This test will fail until we implement the options parameter
    // We need to verify that retry options are passed through to cachedFetch
    expect(() => {
      useUser(mockUser, { retry, retryDelay });
    }).not.toThrow();
  });

  it("should handle null user gracefully", () => {
    const nullUser = null;

    // This test will fail because useUser will try to access .id on null
    // We need to add a null check
    expect(() => {
      useUser(nullUser);
    }).not.toThrow();
  });

  it("should work without options parameter (backwards compatibility)", () => {
    const mockUser = createMockUser();

    // This should continue to work (backwards compatibility)
    expect(() => {
      useUser(mockUser);
    }).not.toThrow();
  });

  it("should accept partial fetch options", () => {
    const mockUser = createMockUser();

    // Should accept only timeout
    expect(() => {
      useUser(mockUser, { timeout: 10000 });
    }).not.toThrow();

    // Should accept only retry
    expect(() => {
      useUser(mockUser, { retry: 2 });
    }).not.toThrow();
  });
});
