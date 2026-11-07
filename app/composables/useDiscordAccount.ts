import type { DisplayNameStyles } from "#shared/utils/discord-profile-styles";

/**
 * The signed-in account as Discord shows it: avatar and the frame around it,
 * the nameplate behind the name, the display name and its style. Animated
 * collectibles go still when motion is reduced.
 */
export function useDiscordAccount() {
	const { user: authUser } = useUserSession();
	// The session carries no picture of its own; the Discord account does.
	const { user: discordUser } = useUser(authUser);
	const { effectiveReduceMotion } = useReduceMotion();
	const animate = computed(() => !effectiveReduceMotion.value);

	const avatar = computed(
		() =>
			authUser.value?.image ??
			(discordUser.value ? avatarURL(discordUser.value, { size: 128 }) : undefined),
	);

	const decoration = computed(() => {
		const data = discordUser.value?.avatar_decoration_data;
		return data ? avatarDecorationURL(data, { animated: animate.value }) : null;
	});

	const nameplate = computed(() => {
		const plate = discordUser.value?.collectibles?.nameplate;
		return plate
			? {
					clip: nameplateURL(plate, { animated: true }),
					palette: plate.palette,
					still: nameplateURL(plate),
				}
			: null;
	});

	const name = computed(
		() =>
			discordUser.value?.global_name ??
			discordUser.value?.username ??
			authUser.value?.name ??
			"",
	);

	// Not in discord-api-types yet; Discord sends it on the user object.
	const nameStyles = computed<DisplayNameStyles | null>(() => {
		const user = discordUser.value as { display_name_styles?: DisplayNameStyles | null } | null;
		const styles = user?.display_name_styles;
		return styles && Array.isArray(styles.colors) ? styles : null;
	});

	return { animate, avatar, decoration, discordUser, name, nameStyles, nameplate };
}
