<template>
	<GuildSettingsDisabledCommands :commands />
	<GuildCommandsDiscordPermissions />
</template>

<script setup lang="ts">
import type { FlattenedCommand } from "#shared/types/discord";

const { commands } = defineProps<{ commands: FlattenedCommand[] }>();
</script>
