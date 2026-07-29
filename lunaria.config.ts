import type { LunariaUserConfig } from "@lunariajs/core/config";
import configJson from "./lunaria.config.json" with { type: "json" };

/**
 * Typed Lunaria config shared with `lunaria/lunaria.ts`.
 * The JSON file is the source of truth for the Lunaria CLI / GitHub Action
 * (stable `@lunariajs/core` only loads `.json` configs).
 *
 * Keep `locales` in sync with `config/i18n.ts` when adding languages.
 */
const config = configJson as LunariaUserConfig;

export default config;
