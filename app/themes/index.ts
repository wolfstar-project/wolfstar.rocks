import avatar from "./avatar";
import badge from "./badge";
import button from "./button";
import container from "./container";
import dropdownMenu from "./dropdown-menu";
import fieldGroup from "./field-group";
import footer from "./footer";
import footerColumns from "./footer-columns";
import input from "./input";
import inputNumber from "./input-number";
import inputTags from "./input-tags";
import link from "./link";
import main from "./main";
import modal from "./modal";
import navigationMenu from "./navigation-menu";
import select from "./select";
import selectMenu from "./select-menu";
import skeleton from "./skeleton";
import switchTheme from "./switch";
import tabs from "./tabs";
import textarea from "./textarea";
import toast from "./toast";
import toaster from "./toaster";

const ui = {
	avatar,
	badge,
	button,
	container,
	fieldGroup,
	dropdownMenu,
	footer,
	footerColumns,
	input,
	inputNumber,
	inputTags,
	link,
	main,
	modal,
	navigationMenu,
	select,
	selectMenu,
	skeleton,
	switch: switchTheme,
	tabs,
	textarea,
	toast,
	toaster,
} as const;

export default ui;
