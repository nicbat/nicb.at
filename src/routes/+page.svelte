<script>
    import AboutMe from "../lib/components/AboutMe.svelte"; // components are capitalized
    let name = 'Nicholas'
    let count = 0;
    $: doubled = count * 2;
    let m = {x: 0, y:0};

    function handleClick() {
        count += 1;
    }
    let warning = '';
    $: if (count >= 10) {
        warning = 'Careful now!!';
    }

    /**
     * @param {MouseEvent} event
     */
    function handleMove(event) {
        m.x = event.clientX;
        m.y = event.clientY;
    }
</script>

<style>
    /* h1 {
        color: red;
    } */
    p {
        color: goldenrod;
    }
    button {
        background-color: lightblue;
        color: black;
    }
    .centered {
        display: flex;
        justify-content: center;
    }
</style>

<!-- centered div -->
<div class="centered">
    <AboutMe/>
</div>

<div on:pointermove={handleMove}>Your mouse is at ({m.x}, {m.y})</div>
<!-- pointermove only works inside the bounds of the div -->

<button on:click={handleClick}>
    Clicked {count} {count === 1 ? 'time' : 'times'} so far doubled {doubled}
</button>

<p>{warning}</p>
<!-- <a href="/blog">Blog</a> -->