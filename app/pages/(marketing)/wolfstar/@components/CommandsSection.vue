<template>
	<Section labelled-by="home-commands-heading" spacing="none" class="pb-24">
		<SectionHeader
			eyebrow="Commands"
			title="Moderation at your fingertips."
			description="Slash commands with autocomplete, rich options, and instant feedback — right in Discord."
			heading-id="home-commands-heading"
			class="mb-10"
		/>

		<ClientOnly>
			<LazyCommandsShowcase />
			<template #fallback>
				<div class="mx-auto min-h-100 w-full max-w-250" aria-hidden="true" />
			</template>
		</ClientOnly>
	</Section>
</template>
