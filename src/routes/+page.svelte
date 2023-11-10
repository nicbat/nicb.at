<script>
    import AboutMe from "../components/AboutMe.svelte"; // components are capitalized
    let name = 'Nicholas'
    let count = 0;
    $: doubled = count * 2;

    function handleClick() {
        count += 1;
    }
    let warning = '';
    $: if (count >= 10) {
        warning = 'Careful now!!';
    }
</script>

<style>
    h1 {
        color: red;
    }
    p {
        color: goldenrod;
    }
    button {
        background-color: lightblue;
        color: black;
    }
</style>

<h1>Welcome to my place</h1>
<!-- <p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p> -->
<!-- <input type="file" id="file-selector"> -->
<p>It's time to finally get started on this site</p>
<p>Welcome to {name.toUpperCase()}'s site!</p>
<AboutMe />

<button on:click={handleClick}>
    Clicked {count} {count === 1 ? 'time' : 'times'} so far doubled {doubled}
</button>

<p>{warning}</p>