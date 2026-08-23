import ui from "./themes/index";

export default defineAppConfig({
	ui: {
		...ui,
		colors: {
			primary: "primary",
			secondary: "secondary",
			success: "success",
			error: "error",
			info: "info",
			warning: "warning",
			neutral: "neutral",
		},
	},
});
