import { isMarketingPath } from "./marketing-routes";

export interface ClassifyInput {
	toPath: string;
	fromPath: string;
	isPopstate: boolean;
	hasUAVisualTransition?: boolean;
}

export function classifyNavigation(input: ClassifyInput): string[] {
	const isMarketing = isMarketingPath(input.toPath);
	const isDashboard = input.toPath === "/app" || input.toPath.startsWith("/guilds/");

	if (!isMarketing && !isDashboard) return [];
	// A navigation that keeps the path keeps the page, which then emits no
	// `page:finish` to end the transition: going back from the phone's
	// `/app?screen=page` to the list froze the screen until the browser gave up.
	if (input.toPath === input.fromPath) return [];

	const types: string[] = [];

	if (input.isPopstate && !input.hasUAVisualTransition) {
		types.push("nav-back");
	} else if (!input.isPopstate) {
		types.push("nav-forward");
	}

	if (types.length === 0) return types;

	if (isDashboard) {
		types.push("route-dashboard");
	} else if (isMarketing) {
		types.push("route-marketing");
	}

	return types;
}
