import type { OauthFlattenedGuild } from '~~/shared/types/discord';

function useGuild() {
    const guildData = useState<NonNullable<OauthFlattenedGuild> | null>(() => null);

    return guildData;
}
export default useGuild;
