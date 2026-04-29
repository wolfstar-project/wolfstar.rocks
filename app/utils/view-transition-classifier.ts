export interface ClassifyInput {
	toPath: string;
	fromPath: string;
	isPopstate: boolean;
	hasUAVisualTransition?: boolean;
}

const MARKETING_PATHS = [
	"/",
	"/wolfstar",
	"/staryl",
	"/privacy",
	"/terms",
	"/commands",
	"/profile",
];

export function classifyNavigation(input: ClassifyInput): string[] {
	const isMarketing = MARKETING_PATHS.some(
		(p) => input.toPath === p || input.toPath.startsWith(p + "/"),
	);
	const isDashboard = input.toPath.startsWith("/guilds/");

	if (!isMarketing && !isDashboard) return [];

	const types: string[] = [];

	if (input.isPopstate && !input.hasUAVisualTransition) {
		types.push("nav-back");
	} else if (!input.isPopstate && input.toPath !== input.fromPath) {
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
