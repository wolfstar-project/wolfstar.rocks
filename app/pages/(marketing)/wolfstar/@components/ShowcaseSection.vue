<template>
	<Section labelled-by="home-showcase-heading">
		<SectionHeader
			eyebrow="In Action"
			title="Moderation that shows its work."
			description="Every action WolfStar takes is visible in the channel, and logged for later."
			heading-id="home-showcase-heading"
			class="mb-10"
		/>

		<SurfaceCard padding="none" class="mx-auto max-w-4xl overflow-hidden">
			<div class="flex items-center gap-2.5 border-b border-default px-5 py-3.5">
				<UIcon name="ph:hash-bold" class="h-4 w-4 text-muted" aria-hidden="true" />
				<span class="text-sm font-semibold text-base-content">mod-log</span>
				<span class="text-xs text-muted">— WolfStar HQ</span>
			</div>

			<DiscordMessages class="rounded-none bg-transparent p-2 text-left drop-shadow-none">
				<DiscordMessage name="baddie">
					JOIN NOW FOR FREE NITRO discord.gg/totally-legit-i-swear
				</DiscordMessage>

				<div
					class="flex items-center gap-2 px-2 py-1.5 text-sm text-muted italic sm:px-4"
					role="note"
				>
					<UIcon name="ph:trash-simple" class="h-4 w-4 shrink-0" aria-hidden="true" />
					Message from Baddie deleted by AutoMod — matched invite-link filter
				</div>

				<DiscordMessage name="wolfstar">
					<DiscordEmbed title="Member Timed Out" color="var(--color-primary)">
						<dl class="mt-1 grid grid-cols-2 gap-x-5 gap-y-2.5">
							<div>
								<dt
									class="text-[11px] font-bold tracking-wide text-muted uppercase"
								>
									Member
								</dt>
								<dd class="mt-0.5 text-sm text-base-content/80">@baddie</dd>
							</div>
							<div>
								<dt
									class="text-[11px] font-bold tracking-wide text-muted uppercase"
								>
									Duration
								</dt>
								<dd class="mt-0.5 font-mono text-sm text-base-content/80">10m</dd>
							</div>
							<div>
								<dt
									class="text-[11px] font-bold tracking-wide text-muted uppercase"
								>
									Reason
								</dt>
								<dd class="mt-0.5 text-sm text-base-content/80">
									AutoMod: invite link
								</dd>
							</div>
							<div>
								<dt
									class="text-[11px] font-bold tracking-wide text-muted uppercase"
								>
									Moderator
								</dt>
								<dd class="mt-0.5 text-sm text-base-content/80">AutoMod</dd>
							</div>
						</dl>
					</DiscordEmbed>
				</DiscordMessage>

				<DiscordMessage name="stella">
					<span class="font-mono text-base-content/80">
						/warn user:@baddie reason:repeat offender
					</span>
				</DiscordMessage>
			</DiscordMessages>
		</SurfaceCard>
	</Section>
</template>

<script setup lang="ts">
// Static Discord mod-log mockup mirroring the "In Action" panel from the
// WolfStar home redesign — an offender's message caught and actioned by AutoMod.
</script>
