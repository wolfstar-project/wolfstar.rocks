<template>
	<Section labelled-by="staryl-cta-heading" spacing="none" class="pb-28">
		<div class="staryl-cta relative overflow-hidden rounded-2xl px-6 py-14 sm:px-14 sm:py-16">
			<NuxtImg
				src="/avatars/staryl.png"
				width="320"
				height="320"
				alt=""
				aria-hidden="true"
				loading="lazy"
				class="staryl-cta-watermark"
			/>
			<div class="relative flex flex-col items-center text-center">
				<p class="mb-4 font-mono text-sm font-medium text-primary">
					{{ ts("marketing.staryl.cta.eyebrow") }}
				</p>
				<h2
					id="staryl-cta-heading"
					class="max-w-190 text-4xl leading-[1.05] font-bold tracking-(--home-ls-tight) text-base-content md:text-5xl"
				>
					{{ ts("marketing.staryl.cta.title") }}
				</h2>
				<p class="mt-5 max-w-140 text-base leading-relaxed text-base-content/65">
					{{
						inviteUrl === "#"
							? ts("marketing.staryl.cta.subtitle_no_invite")
							: ts("marketing.staryl.cta.subtitle")
					}}
				</p>
				<div class="mt-7 flex flex-col gap-3 sm:flex-row">
					<UButton
						v-if="inviteUrl !== '#'"
						:to="inviteUrl"
						color="primary"
						size="lg"
						class="justify-center sm:min-w-48"
						icon="ph:plus-circle-fill"
					>
						{{ ts("marketing.staryl.cta.invite") }}
					</UButton>
					<UButton
						to="https://join.wolfstar.rocks"
						:color="inviteUrl === '#' ? 'primary' : 'neutral'"
						:variant="inviteUrl === '#' ? 'solid' : 'outline'"
						size="lg"
						:class="[
							'justify-center sm:min-w-48',
							inviteUrl === '#' ? undefined : 'staryl-cta-outline',
						]"
					>
						{{ ts("marketing.staryl.cta.ask_in_support") }}
					</UButton>
				</div>
			</div>
		</div>
	</Section>
</template>

<script setup lang="ts">
const { inviteUrl } = defineProps<{
	inviteUrl: string;
}>();

const { ts } = useI18n();
</script>

<style scoped>
@reference "@/assets/css/main.css";

.staryl-cta {
	background-color: var(--color-base-300);
	border: 1px solid var(--home-border-subtle);
	border-top: 3px solid var(--color-primary);
}

.staryl-cta-watermark {
	@apply pointer-events-none absolute -right-10 -bottom-16 size-80 opacity-[0.06];
}

.staryl-cta-outline {
	border-color: oklch(from var(--color-base-content) l c h / 0.2);
	color: var(--color-base-content);
}
</style>
