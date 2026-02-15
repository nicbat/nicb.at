<script lang="ts">
    import { Copy, Check } from "lucide-svelte";

    let copied = false;
    export let content = "";

    async function copy() {
        try {
            if (content) {
                await navigator.clipboard.writeText(content);
                copied = true;
                setTimeout(() => {
                    copied = false;
                }, 2000);
            }
        } catch (err) {
            console.error("Failed to copy text: ", err);
        }
    }
</script>

<button
    class="absolute top-2 right-2 p-2 rounded-md bg-surface text-primary transition-opacity duration-200 hover:bg-overlay z-10 border border-primary/20 copy-button"
    on:click={copy}
    aria-label="Copy code"
>
    {#if copied}
        <Check size={16} />
    {:else}
        <Copy size={16} />
    {/if}
</button>

<style>
    .copy-button {
        opacity: 0;
    }

    :global(pre:hover) .copy-button {
        opacity: 1;
    }
</style>
