type DashboardGuild = ValuesType<NonNullable<TransformedLoginData["transformedGuilds"]>>;

const _useGuildData = () => {
	const { activeGuildId } = useActiveGuild();

	// One store for every guild the admin opened, so switching back is instant
	// and a switch never leaks another guild's data.
	const store = useState<Record<string, DashboardGuild | undefined>>("guild:data", () => ({}));

	// `undefined` until a guild is active and its data has landed. Sections only
	// render once it has, but the type keeps every reader honest about it.
	const guild = computed<DashboardGuild | undefined>(() =>
		activeGuildId.value ? store.value[activeGuildId.value] : undefined,
	);

	const setGuildData = (newGuildData: DashboardGuild) => {
		const guildId = activeGuildId.value;
		if (!guildId) {
			return;
		}
		store.value = { ...store.value, [guildId]: newGuildData };
		log.info({ tag: "guild:data", action: "set_guild_data", guildId });
	};

	return { guildData: guild, setGuildData };
};

export const useGuildData = createSharedComposable(_useGuildData);
