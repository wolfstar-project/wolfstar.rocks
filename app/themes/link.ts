import { colors } from "@/utils/constants";

export default {
	base: "link",
	variants: {
		active: {
			false: "link hover:link-hover",
			true: "link-primary",
		},
		color: Object.fromEntries(colors.map((color) => [color, `link-${color}`])),
		disabled: {
			true: "cursor-not-allowed opacity-75",
		},
	},
};
