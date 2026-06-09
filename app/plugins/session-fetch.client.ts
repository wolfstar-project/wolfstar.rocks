import { isMarketingPath } from "~/utils/marketing-routes";

/**
 * Fetches the user session on non-marketing routes when auth is required.
 * Marketing pages defer session work to HeaderAuth (idle) to keep TBT low.
 */
export default defineNuxtPlugin(() => {
	const route = useRoute();
	const auth = route.meta?.auth as { required?: boolean } | undefined;

	const isMarketingLanding =
		isMarketingPath(route.path) &&
		!auth?.required &&
		route.path !== "/profile" &&
		!route.path.startsWith("/account");

	if (isMarketingLanding) {
		return;
	}

	const { fetch } = useUserSession();
	void fetch();
});
