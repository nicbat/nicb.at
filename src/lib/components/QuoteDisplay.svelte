<script lang="ts">
    import { onMount } from "svelte";
    import type { Quote } from "$lib/types";

    let quotes: Quote[] = [];
    let currentQuote: Quote | null = null;
    let shuffledIndices: number[] = [];
    let currentIndex = 0;

    onMount(async () => {
        try {
            const response = await fetch("/api/quotes");
            if (response.ok) {
                quotes = await response.json();
                initializeQuotes();
            }
        } catch (error) {
            console.error("Failed to fetch quotes", error);
        }
    });

    function shuffleArray(array: number[]): number[] {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function generateShuffledIndices(
        length: number,
        lastIndex: number | null = null,
    ): number[] {
        let indices = Array.from({ length }, (_, i) => i);
        indices = shuffleArray(indices);

        // Ensure the first element isn't the same as the last element of the previous list
        if (lastIndex !== null && length > 1 && indices[0] === lastIndex) {
            // Swap first element with a random other element
            const swapIndex = Math.floor(Math.random() * (length - 1)) + 1;
            [indices[0], indices[swapIndex]] = [indices[swapIndex], indices[0]];
        }

        return indices;
    }

    function initializeQuotes() {
        if (quotes.length > 0) {
            shuffledIndices = generateShuffledIndices(quotes.length);
            currentIndex = 0;
            currentQuote = quotes[shuffledIndices[currentIndex]];
        }
    }

    export function setRandomQuote() {
        if (quotes.length === 0) return;

        currentIndex++;

        if (currentIndex >= shuffledIndices.length) {
            const lastIndex = shuffledIndices[shuffledIndices.length - 1];
            shuffledIndices = generateShuffledIndices(quotes.length, lastIndex);
            currentIndex = 0;
        }

        currentQuote = quotes[shuffledIndices[currentIndex]];
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
