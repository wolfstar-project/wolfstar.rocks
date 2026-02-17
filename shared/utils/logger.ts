import * as Sentry from "@sentry/nuxt";
import { consola } from "consola";

const sentryReporter = Sentry.createConsolaReporter();

export const logger = consola.addReporter(sentryReporter);
