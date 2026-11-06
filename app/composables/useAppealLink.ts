/**
 * What the bot's link `/appeal/<server>` does: it opens the Home on the
 * member's appeals, with that server listed.
 */
export function useAppealLink() {
	const { openAppeals } = useDirectMessages();
	const { goToGuild } = useDashboardNavigation();
	const { isPhone, openPage } = usePhoneScreen();

	/**
	 * Chooses the Home's page before leaving the open server: when staged
	 * changes of that server hold the switch for the "unsaved changes" dialog,
	 * confirming it lands on the appeals.
	 */
	function open(linkedGuild: unknown) {
		openAppeals(
			typeof linkedGuild === "string" && isValidGuildId(linkedGuild)
				? linkedGuild
				: undefined,
		);
		goToGuild(null);
	}

	/** A phone shows one screen at a time: the link is for the page, not the list. */
	function showPage() {
		if (isPhone.value) void openPage();
	}

	return { open, showPage };
}
