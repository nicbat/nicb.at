<script lang="ts">
    import { onMount } from "svelte";
    import type { Quote } from "$lib/types";

    let quotes: Quote[] = [];
    let currentQuote: Quote | null = null;

    onMount(async () => {
        try {
            const response = await fetch("/api/quotes");
            if (response.ok) {
                quotes = await response.json();
                setRandomQuote();
            }
        } catch (error) {
            console.error("Failed to fetch quotes", error);
        }
    });

    export function setRandomQuote() {
        if (quotes.length > 0) {
            const randomIndex = Math.floor(Math.random() * quotes.length);
            currentQuote = quotes[randomIndex];
        }
    }
</script>

<div class="font-mono text-sm text-secondary-text">
    <!-- developer, sometimes other things -->
    {#if currentQuote}
        "{currentQuote.quote}"
        {#if currentQuote.english_translation}
            ("{currentQuote.english_translation}")
        {/if}
        - {currentQuote.author}
    {:else}
        "How fleeting are all human passions compared with the massive
        continuity of ducks." - Dorothy L. Sayers
    {/if}
</div>
