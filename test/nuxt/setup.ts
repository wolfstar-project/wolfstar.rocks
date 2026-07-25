import { beforeEach } from "vitest";

// App plugins do not run under the Nuxt Vitest browser env with viteEnvironmentApi off.
beforeEach(() => {
	const app = useNuxtApp();
	if (app.$authorization) return;

	app.provide("authorization", {
		resolveClientUser: () => useUserSession().user.value ?? { id: "test-user" },
	});
});
