<script lang="ts">
  import Gallery from "$lib/components/Gallery.svelte";
  import type { Trip } from "$lib/types";
  import { formatDayMonthYear } from "$lib/dates";

  let { data }: { data: { trip: Trip } } = $props();

  let trip = $derived(data.trip);
  // const dateRange = formatTripDateRange(trip.startDate, trip.endDate);
  let dateRange = $derived(
    formatDayMonthYear(trip.startDate) +
      " - " +
      formatDayMonthYear(trip.endDate),
  );
</script>

<div class="flex-1 mx-auto w-full px-5 flex flex-col max-w-3xl">
  <a
    href="/travel"
    class="text-sm text-primary hover:underline mb-2 no-underline"
  >
    ← Travel
  </a>
  <h1 class="mb-1">{trip.name}</h1>
  {#if dateRange}
    <p class="text-muted text-sm mb-3">{dateRange}</p>
  {/if}
  {#if trip.description}
    <p class="mb-6 text-secondary-text">{trip.description}</p>
  {/if}
</div>

<div class="flex-1 mx-auto w-full px-5 flex flex-col max-w-5xl">
  {#if trip.photos.length === 0}
    <p class="text-secondary-text px-4">
      Photos from this trip are coming soon.
    </p>
  {:else}
    <Gallery images={trip.photos} />
  {/if}
</div>
