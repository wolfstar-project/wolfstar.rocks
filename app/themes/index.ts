import container from "./container";
import fieldGroup from "./field-group";
import footer from "./footer";
import footerColumns from "./footer-columns";
import header from "./header";
import main from "./main";
import navigationMenu from "./navigation-menu";
import toaster from "./toaster";

const ui = {
	container,
	fieldGroup,
	footer,
	footerColumns,
	header,
	main,
	navigationMenu,
	toaster,
} as const;

export default ui;
