import { fileURLToPath } from "node:url";
import { defineVitestProject } from "@nuxt/test-utils/config";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

const rootDir = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  define: {
    "process.test": "true",
  },
  test: {
    projects: [
      {
        resolve: {
          alias: {
            "#shared": `${rootDir}/shared`,
            "#server": `${rootDir}/server`,
            "#storage-config": `${rootDir}/test/mocks/storage-config.ts`,
          },
        },
        test: {
          name: "unit",
          include: ["test/unit/*.{test,spec}.ts"],
          environment: "node",
          setupFiles: ["./test/setup.ts"],
          globals: true,
        },
      },
      await defineVitestProject({
        test: {
          name: "nuxt",
          include: ["test/nuxt/*.{test,spec}.ts"],
          environment: "nuxt",
          globals: true,
          environmentOptions: {
            nuxt: {
              rootDir: fileURLToPath(new URL(".", import.meta.url)),
              overrides: {
                ogImage: { enabled: false },
                sitemap: { enabled: false },
                sentry: { enabled: false },
              },
            },
            setupFiles: [
              "./test/setup.ts",
            ],

          },
          browser: {
            enabled: true,
            provider: playwright(),
            instances: [{ browser: "chromium" }],
          },
        },
      }),
    ],
    coverage: {
      enabled: true,
      provider: "v8",
      exclude: [
        "**/node_modules/**",
      ],
    },
  },
});
