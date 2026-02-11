<script>
    export let data;
    const { title, date, Content } = data;
</script>

<!-- <span><a href="/words">Back to Blogs</a></span> -->
<article class="prose dark:prose-invert max-w-none">
    <h1>{title}</h1>
    <!-- <p>{date}</p> -->
    <Content />
</article>
