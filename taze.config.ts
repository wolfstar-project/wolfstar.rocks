import { defineConfig } from "taze";

export default defineConfig({
  write: true,
  // run `npm install` or `yarn install` right after bumping
  install: true,
  packageMode: {
    "typescript": "ignore",
    // regex starts and ends with '/'
    "/vue/": "latest",
  },
  depFields: {
    overrides: false,
  },
});
