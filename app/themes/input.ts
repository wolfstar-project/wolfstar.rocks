import { inputVariants as variant } from "./shared-variants";

export default {
	slots: {
		root: "relative inline-flex items-center",
		base: [
			"w-full rounded-md border-0 appearance-none placeholder:text-dimmed focus:outline-none disabled:cursor-not-allowed disabled:opacity-75",
			"transition-colors",
		],
		leading: "absolute inset-y-0 start-0 flex items-center",
		leadingIcon: "shrink-0 text-dimmed",
		leadingAvatar: "shrink-0",
		leadingAvatarSize: "",
		trailing: "absolute inset-y-0 end-0 flex items-center",
		trailingIcon: "shrink-0 text-dimmed",
	},
	variants: {
		variant,
	},
	compoundVariants: [
		{
			color: "primary",
			variant: ["outline", "subtle"],
			class: "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary",
		},
		{
			color: "primary",
			highlight: true,
			class: "ring ring-inset ring-primary",
		},
		{
			color: "neutral",
			variant: ["outline", "subtle"],
			class: "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-inverted",
		},
		{
			color: "neutral",
			highlight: true,
			class: "ring ring-inset ring-inverted",
		},
		{
			leading: true,
			size: "xs",
			class: "ps-7",
		},
		{
			leading: true,
			size: "sm",
			class: "ps-8",
		},
		{
			leading: true,
			size: "md",
			class: "ps-9",
		},
		{
			leading: true,
			size: "lg",
			class: "ps-10",
		},
		{
			leading: true,
			size: "xl",
			class: "ps-11",
		},
		{
			trailing: true,
			size: "xs",
			class: "pe-7",
		},
		{
			trailing: true,
			size: "sm",
			class: "pe-8",
		},
		{
			trailing: true,
			size: "md",
			class: "pe-9",
		},
		{
			trailing: true,
			size: "lg",
			class: "pe-10",
		},
		{
			trailing: true,
			size: "xl",
			class: "pe-11",
		},
		{
			loading: true,
			leading: true,
			class: {
				leadingIcon: "animate-spin",
			},
		},
		{
			loading: true,
			leading: false,
			trailing: true,
			class: {
				trailingIcon: "animate-spin",
			},
		},
		{
			fixed: false,
			size: "xs",
			class: "md:text-xs",
		},
		{
			fixed: false,
			size: "sm",
			class: "md:text-xs",
		},
		{
			fixed: false,
			size: "md",
			class: "md:text-sm",
		},
		{
			fixed: false,
			size: "lg",
			class: "md:text-sm",
		},
	],
	defaultVariants: {
		size: "md",
		color: "primary",
		variant: "outline",
	},
};
