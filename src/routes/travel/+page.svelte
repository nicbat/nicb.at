<script lang="ts">
  import type { TripSummary } from "$lib/types";
  import { formatTripDateRange } from "$lib/dates";

  let { data }: { data: { trips: TripSummary[] } } = $props();
</script>

<div class="flex-1 mx-auto w-full px-5 flex flex-col max-w-3xl">
  <h1 class="mb-4">Travel</h1>
  <p class="mb-6 text-secondary-text">
    Some of my trips from the past few years. Still adding in some old photos!
  </p>
</div>

<div class="flex-1 mx-auto w-full px-5 flex flex-col max-w-5xl">
  {#if data.trips.length === 0}
    <p class="text-secondary-text">No trips yet — check back soon.</p>
  {:else}
    <div
      class="grid gap-x-[22px] gap-y-7 grid-cols-[repeat(auto-fill,minmax(220px,1fr))] pb-8"
    >
      {#each data.trips as trip (trip.slug)}
        {@const dates = formatTripDateRange(trip.startDate, trip.endDate)}
        <a
          href="/travel/{trip.slug}"
          class="group block no-underline hover:no-underline"
        >
          {#if trip.cover}
            <img
              class="aspect-[1/1] w-full rounded-[10px] object-cover transition-opacity duration-200 group-hover:opacity-90"
              src={trip.cover.src}
              alt={trip.cover.alt}
              loading="lazy"
            />
          {:else}
            <div class="aspect-[1/1] w-full rounded-[10px] bg-overlay"></div>
          {/if}
          <div class="mt-2 font-semibold text-primary-text">{trip.name}</div>
          {#if dates}
            <div class="text-sm text-muted">{dates}</div>
          {/if}
        </a>
      {/each}
    </div>
  {/if}
</div>
