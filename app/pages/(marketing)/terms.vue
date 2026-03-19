<template>
	<UContainer class="bg-base-100">
		<article class="mx-auto max-w-3xl px-4 py-8 sm:py-12">
			<!-- Header -->
			<header class="mt-8 mb-12">
				<div class="mb-6 flex items-baseline justify-between gap-4">
					<h1 class="text-4xl font-bold text-base-content/80 sm:text-5xl">
						WolfStar Terms of Service
					</h1>
				</div>
				<p class="mb-4 text-lg text-base-content/70">
					Last updated and effective:
					<NuxtTime
						locale="en-US"
						:datetime="buildInfo.termsDate"
						date-style="long"
						time-style="medium"
					/>
				</p>
				<div class="space-y-2 text-sm text-base-content/60">
					<p>
						<span class="font-semibold">Owner and data controller:</span> WolfStar
						Project
					</p>
					<p>
						<span class="font-semibold">Contact email: </span>
						<NuxtLink
							to="mailto:contact@wolfstar.rocks"
							class="underline hover:opacity-80"
						>
							contact@wolfstar.rocks
						</NuxtLink>
					</p>
				</div>
			</header>

			<!-- Content Sections -->
			<div class="prose prose-lg max-w-none space-y-12">
				<!-- Terms -->
				<section>
					<h2 class="mb-4 text-lg tracking-wider text-base-content/60 uppercase">
						Terms
					</h2>
					<p class="leading-relaxed text-base-content">
						By accessing this service, accessible through the
						<NuxtLink
							to="https://discord.com/privacy"
							target="_blank"
							class="underline hover:opacity-70"
						>
							Discord
						</NuxtLink>
						chat platform, you are agreeing to be bound by these WolfStar Terms of
						Service and agree that you are responsible for the agreement with any
						applicable local laws. If you disagree with any of these terms, you are
						prohibited from accessing this service. The materials contained in the
						Service are protected by copyright and trade mark law.
					</p>
				</section>

				<!-- Use License -->
				<section>
					<h2 class="mb-4 text-lg tracking-wider text-base-content/60 uppercase">
						Use License
					</h2>
					<p class="mb-3 leading-relaxed text-base-content">
						To view what license applies to the Service please consult their respective
						LICENSE documents:
					</p>
					<ul class="list-disc space-y-2 pl-6 text-base-content">
						<li>
							<NuxtLink
								to="https://github.com/wolfstar-project/wolfstar/blob/main/LICENSE"
								target="_blank"
								class="underline hover:opacity-70"
							>
								WolfStar
							</NuxtLink>
						</li>
					</ul>
				</section>

				<!-- Disclaimer -->
				<section>
					<h2 class="mb-4 text-lg tracking-wider text-base-content/60 uppercase">
						Disclaimer
					</h2>
					<p class="leading-relaxed text-base-content">
						All the materials in the Service is provided "as is". WolfStar Project makes
						no warranties, may it be expressed or implied, therefore negates all other
						warranties. Furthermore, WolfStar Project does not make any representations
						concerning the accuracy or reliability of the use of the materials on its
						Service or otherwise relating to such materials or any sites linked to this
						Service.
					</p>
				</section>

				<!-- Limitations -->
				<section>
					<h2 class="mb-4 text-lg tracking-wider text-base-content/60 uppercase">
						Limitations
					</h2>
					<p class="leading-relaxed text-base-content">
						WolfStar Project or its suppliers will not be hold accountable for any
						damages that will arise with the use or inability to use the materials on
						the Service, even if WolfStar Project or an authorize representative of this
						Service has been notified, orally or written, of the possibility of such
						damage. Some jurisdiction does not allow limitations on implied warranties
						or limitations of liability for incidental damages, these limitations may
						not apply to you.
					</p>
				</section>

				<!-- Revisions and Errata -->
				<section>
					<h2 class="mb-4 text-lg tracking-wider text-base-content/60 uppercase">
						Revisions and errata
					</h2>
					<p class="leading-relaxed text-base-content">
						The materials appearing on the Service may include technical, typographical,
						or photographic errors. WolfStar Project will not promise that any of the
						materials in this Service are accurate, complete, or current. WolfStar
						Project may change the materials contained on its Service at any time
						without notice. WolfStar Project does not make any commitment to update the
						materials.
					</p>
				</section>

				<!-- Links -->
				<section>
					<h2 class="mb-4 text-lg tracking-wider text-base-content/60 uppercase">
						Links
					</h2>
					<p class="leading-relaxed text-base-content">
						WolfStar Project has not reviewed all of the sites linked to its Service and
						is not responsible for the contents of any such linked site. The presence of
						any link does not imply endorsement by WolfStar Project of the site. The use
						of any linked website is at the user's own risk.
					</p>
				</section>

				<!-- Terms of Service Modifications -->
				<section>
					<h2 class="mb-4 text-lg tracking-wider text-base-content/60 uppercase">
						Terms of Service modifications
					</h2>
					<p class="leading-relaxed text-base-content">
						WolfStar Project may revise these Terms of Service for its Service at any
						time without prior notice. By using this Service, you are agreeing to be
						bound by the current version of these Terms of Service.
					</p>
				</section>

				<!-- Your Privacy -->
				<section>
					<h2 class="mb-4 text-lg tracking-wider text-base-content/60 uppercase">
						Your Privacy
					</h2>
					<p class="leading-relaxed text-base-content">
						Please read our Privacy Policy, found
						<NuxtLink to="/privacy" class="underline hover:opacity-70">here</NuxtLink>.
					</p>
				</section>

				<!-- Governing Law -->
				<section>
					<h2 class="mb-4 text-lg tracking-wider text-base-content/60 uppercase">
						Governing law
					</h2>
					<p class="leading-relaxed text-base-content">
						Any claim related to WolfStar Project's Service shall be governed by the
						laws of Italy without regards to its conflict of law provisions.
					</p>
				</section>
			</div>
		</article>
	</UContainer>
</template>

<script setup lang="ts">
useSeoMetadata({
	description:
		"WolfStar Project's Terms of Service - Learn about the terms and conditions for using our services",
	shouldOgImage: true,
	title: "Terms of Service",
});

const { buildInfo } = useAppConfig();
</script>
