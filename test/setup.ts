import { vi } from "vitest";

// mock virtual/imported drivers so the module's import-time code can run safely.
vi.stubGlobal("useStorage", () => ({ mount: () => undefined }));
vi.stubGlobal("useRuntimeConfig", () => ({
  storage: { fsBase: "." },
}));

vi.mock("#storage-config", () => ({ driver: "memory" }));
vi.mock("#server/cache-driver", () => ({ default: (x: any) => x }));
vi.mock("unstorage/drivers/memory", () => ({ default: () => ({}) }));
vi.mock("unstorage/drivers/fs", () => ({ default: () => ({}) }));
vi.mock("unstorage/drivers/cloudflare-kv-http", () => ({ default: () => ({}) }));
vi.mock("#server/utils/runtimeConfig", () => ({
  runtimeConfig: {
    discord: { botToken: "fake-token" },
    cloudflare: { accountId: "", namespaceId: "", apiToken: "" },
  },
}));
