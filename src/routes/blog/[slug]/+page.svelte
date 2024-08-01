<script>
	export let data;
  const { title, date, Content } = data;
</script>

<span><a href="/blog">Back to Blogs</a></span>
<article>
  <h1>{title}</h1>
  <p>{date}</p>
  <Content />
</article>
