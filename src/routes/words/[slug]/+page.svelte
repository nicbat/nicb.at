<script>
    import { mount } from "svelte";
    import CopyButton from "$lib/components/CopyButton.svelte";

    let { data } = $props();
    const { title, date, Content } = data;

    let contentContainer;

    $effect(() => {
        if (!contentContainer) return;

        const preElements = contentContainer.querySelectorAll("pre");

        preElements.forEach((pre) => {
            // Ensure pre has relative positioning for absolute button placement
            if (getComputedStyle(pre).position === "static") {
                pre.style.position = "relative";
            }

            // check if button already exists to avoid duplicates
            if (pre.querySelector(".copy-btn-container")) return;

            const codeElement = pre.querySelector("code");
            if (!codeElement) return;

            const content = codeElement.innerText;
            const btnContainer = document.createElement("div");
            btnContainer.className = "copy-btn-container";
            pre.appendChild(btnContainer);

            mount(CopyButton, {
                target: btnContainer,
                props: { content },
            });
        });
    });
</script>

<!-- <span><a href="/words">Back to Blogs</a></span> -->
<article
    class="prose dark:prose-invert max-w-none"
    bind:this={contentContainer}
>
    <h1>{title}</h1>
    <!-- <p>{date}</p> -->
    <Content />
</article>
