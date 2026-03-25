import { initLog, log } from "evlog/client";

export default defineNuxtPlugin(() => {
	initLog({ service: "wolfstar" });

	log.info({ action: "app_init", path: window.location.pathname });
});
