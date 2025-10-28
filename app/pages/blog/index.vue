<template>
  <div class="container mx-auto px-4 py-12">
    <h2 class="mb-12 text-center text-4xl font-extrabold">Latest articles</h2>
    <div class="mx-4 grid gap-3 md:mx-0 lg:grid-cols-2 lg:gap-10">
      <nuxt-link
        v-for="article of data"
        :key="article.path"
        :to="article.path"
        class="rounded-lg bg-zinc-100 p-4 shadow-md drop-shadow-md transition-transform hover:scale-105 dark:bg-zinc-700"
      >
        <div class="flex">
          <div>
            <img
              :src="`/images/${article.image}.png`"
              :alt="article.image"
              class="inline select-none rounded-lg shadow-lg hover:saturate-150"
              width="96"
              height="96"
            />
          </div>

          <div class="pl-4">
            <div class="mb-3 text-xl font-semibold hover:underline">
              {{ article.title }}
            </div>
            <p class="mb-6 opacity-80">
              <small>
                Published on
                <u :title="longDate.format(new Date(article.date as string))">{{ date.format(new Date(article.date as string)) }}</u> by
                <span class="opacity-90">{{ article.author }}</span></small>
            </p>
          </div>
        </div>

        <p class="pt-4 opacity-90">
          {{ article.description }}
        </p>
      </nuxt-link>
    </div>
  </div>
</template>

<script setup lang="ts">
const { data } = await useAsyncData("navigation", () => {
  return queryCollectionNavigation("content", ["title", "description", "author", "path", "image", "date"]).order("id", "DESC");
});

const date = new Intl.DateTimeFormat(["en-GB", "en-US"]);
const longDate = new Intl.DateTimeFormat(["en-GB", "en-US"], { dateStyle: "full" });

useHead({
  title: "WolfStar Blog",
});
</script>
