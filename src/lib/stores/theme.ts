import { writable } from 'svelte/store';
import { browser } from '$app/environment';

type Theme = 'light' | 'dark';

const prefersDarkMode = browser && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
const storedTheme = browser && localStorage.getItem('theme') as Theme | null;

const defaultTheme: Theme = storedTheme || (prefersDarkMode ? 'dark' : 'light');

export const theme = writable<Theme>(defaultTheme);

theme.subscribe((value) => {
  if (browser) {
    localStorage.setItem('theme', value);
    document.documentElement.setAttribute('data-theme', value);
  }
});

// This script will be inlined in the HTML
export const themeScript = `
  (function() {
    const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'dark' || (!storedTheme && prefersDarkMode)) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  })();
`;
