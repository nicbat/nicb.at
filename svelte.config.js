//import adapter from '@sveltejs/adapter-static';
//import adapter from 'svelte-adapter-github';
import adapter from "@sveltejs/adapter-vercel";
//import { vitePreprocess } from '@sveltejs/kit/vite';
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { mdsvex, escapeSvelte } from "mdsvex";
import { createHighlighter } from "shiki";

const theme = "catppuccin-mocha";

const highlighter = await createHighlighter({
  themes: [theme],
  langs: ["javascript", "typescript", "python", "c", "bash"],
});

/** @type {import('mdsvex').MdsvexOptions} */
const mdsvexOptions = {
  extensions: [".md"],
  highlight: {
    highlighter: async (code, lang = "text") => {
      const html = escapeSvelte(highlighter.codeToHtml(code, { lang, theme }));
      return `{@html \`${html}\` }`;
    },
    smartypants: true,
  },
};

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://kit.svelte.dev/docs/integrations#preprocessors
  // for more information about preprocessors
  extensions: [".svelte", ".md"],
  preprocess: [vitePreprocess(), mdsvex(mdsvexOptions)],
  //preprocess: vitePreprocess(),

  kit: {
    // adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
    // If your environment is not supported or you settled on a specific environment, switch out the adapter.
    // See https://kit.svelte.dev/docs/adapters for more information about adapters.
    appDir: "app",
    adapter: adapter({
      runtime: "nodejs20.x", // TODO update this? - required for vercel
    }),
    outDir: "build",

    alias: {
      $components: "./src/lib/components",
      $lib: "./src/lib",
      $assets: "./src/assets",
    },
  },
};

export default config;
