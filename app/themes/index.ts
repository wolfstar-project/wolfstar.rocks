import avatar from "./avatar";
import badge from "./badge";
import button from "./button";
import container from "./container";
import fieldGroup from "./field-group";
import footer from "./footer";
import footerColumns from "./footer-columns";
import link from "./link";
import main from "./main";
import navigationMenu from "./navigation-menu";
import select from "./select";
import selectMenu from "./select-menu";
import skeleton from "./skeleton";
import switchTheme from "./switch";
import tabs from "./tabs";
import toaster from "./toaster";

const ui = {
	avatar,
	badge,
	button,
	container,
	fieldGroup,
	footer,
	footerColumns,
	link,
	main,
	navigationMenu,
	select,
	selectMenu,
	skeleton,
	switch: switchTheme,
	tabs,
	toaster,
} as const;

export default ui;
