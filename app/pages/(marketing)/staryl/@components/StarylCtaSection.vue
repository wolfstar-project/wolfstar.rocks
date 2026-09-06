<template>
	<Section labelled-by="staryl-cta-heading" spacing="none" class="pb-28">
		<div
			class="staryl-cta grid overflow-hidden bg-neutral p-8 text-neutral-content sm:p-12 lg:grid-cols-[1fr_auto] lg:items-end lg:p-16"
		>
			<div>
				<div class="mb-8 flex items-center gap-4">
					<NuxtImg
						src="/avatars/staryl.png"
						width="48"
						height="48"
						alt=""
						aria-hidden="true"
						class="size-12 rounded-lg"
					/>
					<span
						class="font-mono text-xs tracking-(--home-ls-label) text-neutral-content/60 uppercase"
					>
						{{ ts("marketing.staryl.cta.eyebrow") }}
					</span>
				</div>
				<h2
					id="staryl-cta-heading"
					class="max-w-180 text-4xl leading-[1.02] font-bold tracking-(--home-ls-tight) md:text-5xl"
				>
					{{ ts("marketing.staryl.cta.title") }}
				</h2>
				<p class="mt-5 max-w-145 text-base leading-relaxed text-neutral-content/70">
					{{
						inviteUrl === "#"
							? ts("marketing.staryl.cta.subtitle_no_invite")
							: ts("marketing.staryl.cta.subtitle")
					}}
				</p>
			</div>
			<div class="mt-9 flex flex-col gap-3 sm:flex-row lg:mt-0 lg:flex-col">
				<UButton
					v-if="inviteUrl !== '#'"
					:to="inviteUrl"
					color="primary"
					size="xl"
					class="justify-center lg:min-w-52"
					icon="ph:plus-circle-fill"
				>
					{{ ts("marketing.staryl.cta.invite") }}
				</UButton>
				<UButton
					to="https://join.wolfstar.rocks"
					color="neutral"
					variant="outline"
					size="xl"
					class="staryl-cta-outline justify-center lg:min-w-52"
				>
					{{ ts("marketing.staryl.cta.ask_in_support") }}
				</UButton>
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

.staryl-cta-outline {
	border-color: oklch(from var(--color-neutral-content) l c h / 0.3);
	background-color: transparent;
	color: var(--color-neutral-content);
}
</style>
