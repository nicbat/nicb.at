<script>
</script>

<style>
    nav {
        display: flex;
        justify-content: space-around;
        background-color: lightblue;
        padding: 1em;
        margin: 0;
    }
    a {
        text-decoration: none;
        color: black;
        border: 1px solid black;
        padding: 0.5em 1em;
        border-radius: 8px;
        /* on hover change background color */
        background-color: lightgray;
    }
    a:hover {
        background-color: lightgreen;
    }
</style>

<nav>
    <a href="/">Home</a>
    <a href='/photos'>Photos</a>
    <a href="/blog">Blog</a>
    <!-- <a href="/contact">Contact</a> -->
</nav>

<slot></slot>