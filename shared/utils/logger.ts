import type { ConsolaOptions } from "consola";
import * as Sentry from "@sentry/nuxt";
import { consola } from "consola";

const sentryReporter = Sentry.createConsolaReporter();

export const logger = consola.addReporter(sentryReporter);

export function useLogger(tag?: string, options: Partial<ConsolaOptions> = {}) {
  return tag ? logger.create(options).withTag(tag) : logger;
}
