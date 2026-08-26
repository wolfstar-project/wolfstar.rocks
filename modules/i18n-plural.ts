import { defineNuxtModule } from "nuxt/kit";
import { plural } from "../config/i18n-plural";

/**
 * Nuxt I18n Micro turns its `plural` option into `.nuxt/i18n.plural.mjs` by
 * calling `.toString()` on the configured function. Passing the function
 * through `nuxt.config.ts` is not reliable here: the Nuxt build @nuxt/test-utils
 * runs for Vitest hands module options a cloned config whose function values
 * stringify to `function () { [native code] }`, so every browser test then fails
 * to import `#build/i18n.plural.mjs` with a syntax error.
 *
 * Writing the template from a direct import sidesteps that entirely — a module's
 * own imports are never cloned — and keeps one implementation for dev, build and
 * test. `config/i18n-plural.ts` must therefore stay self-contained (no imports,
 * no module-scope references), exactly as the option itself requires.
 */
const MODULE_NAME = "wolfstar:i18n-plural";
const TEMPLATE_FILENAME = "i18n.plural.mjs";

export default defineNuxtModule({
	meta: {
		name: MODULE_NAME,
	},
	setup(_, nuxt) {
		nuxt.hook("app:templates", (app) => {
			const template = app.templates.find((entry) => entry.filename === TEMPLATE_FILENAME);
			if (!template) {
				throw new Error(
					`[${MODULE_NAME}] nuxt-i18n-micro registered no ${TEMPLATE_FILENAME} template; the app would fall back to the built-in pluralization rules.`,
				);
			}

			template.getContents = () => `export const plural = ${plural.toString()};\n`;
		});
	},
});
