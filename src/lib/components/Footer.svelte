<script lang="ts">
  import { Mail, Github, Linkedin, Icon, type IconNode } from "lucide-svelte";
  import { theme } from "$lib/stores/theme";

  function toggleTheme() {
    theme.update((value) => (value === "light" ? "dark" : "light"));
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const currentDate = new Date(2026, 10);
  const currentMonth = currentDate.toLocaleString("default", { month: "long" });
  const currentYear = currentDate.getFullYear();

  const robloxIcon: IconNode = [
    [
      "path",
      {
        d: "M41.2648,12.6719,14.7123,5.5572a1.666,1.666,0,0,0-2.04,1.178L5.5572,33.2877a1.666,1.666,0,0,0,1.178,2.04l26.5525,7.1147a1.666,1.666,0,0,0,2.04-1.178l7.1147-26.5525a1.666,1.666,0,0,0-1.178-2.04Z",
      },
    ],
    [
      "path",
      {
        d: "M29.3193,20.51l-8.1808-2.192a.5133.5133,0,0,0-.6287.3629l-2.192,8.1808a.5133.5133,0,0,0,.3629.6287l8.1808,2.192a.5133.5133,0,0,0,.6287-.3629l2.192-8.1808A.5133.5133,0,0,0,29.3193,20.51Z",
      },
    ],
  ];

  const contacts = [
    { label: "Email", href: "mailto:nicbatnicko@gmail.com", external: false },
    { label: "GitHub", href: "https://github.com/nicbat", external: true },
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/nicholasbatchelder/",
      external: true,
    },
    {
      label: "Roblox",
      href: "https://www.roblox.com/users/35677096/profile",
      external: true,
    },
  ] as const;
</script>

<footer
  class="mt-auto relative z-10 bg-surface border-t border-primary py-6 px-6"
>
  <div
    class="footer-grid max-w-5xl mx-auto text-sm text-secondary-text font-mono"
  >
    <!-- left: contact links -->
    <ul class="flex items-center -ml-3" aria-label="Contact">
      {#each contacts as contact (contact.label)}
        <li>
          <a
            href={contact.href}
            target={contact.external ? "_blank" : undefined}
            rel={contact.external ? "noopener noreferrer" : undefined}
            aria-label={contact.label}
            title={contact.label}
            class="contact-link"
          >
            {#if contact.label === "Email"}
              <Mail size={18} />
            {:else if contact.label === "GitHub"}
              <Github size={18} />
            {:else if contact.label === "LinkedIn"}
              <Linkedin size={18} />
            {:else}
              <Icon
                iconNode={robloxIcon}
                viewBox="0 0 48 48"
                strokeWidth={4}
                size={18}
              />
            {/if}
          </a>
        </li>
      {/each}
    </ul>

    <!-- center -->
    <div class="footer-updated">Last updated: {currentMonth} {currentYear}</div>

    <!-- right -->
    <div class="footer-actions flex flex-wrap items-center gap-x-6 gap-y-3">
      <button
        onclick={toggleTheme}
        class="hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 transition-colors cursor-pointer"
      >
        {$theme === "light" ? "dark mode" : "light mode"}
      </button>
      <button
        onclick={scrollToTop}
        class="hover:text-primary transition-colors cursor-pointer"
      >
        back to top ↑
      </button>
    </div>
  </div>
</footer>

<style>
  /* Phone: contacts, then "last updated", then actions, stacked left.
     sm+: three columns — contacts left, "last updated" centered, actions right. */
  .footer-grid {
    display: grid;
    gap: 0.75rem;
    align-items: center;
  }

  @media (min-width: 640px) {
    .footer-grid {
      grid-template-columns: 1fr auto 1fr;
      gap: 1.5rem;
    }
    .footer-updated {
      text-align: center;
    }
    .footer-actions {
      justify-self: end;
    }
  }

  /* 44px tap targets; color follows the text so hover just recolors the stroke. */
  .contact-link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2.75rem;
    height: 2.75rem;
    border-radius: 9999px;
    color: var(--color-text-secondary);
    transition: color 150ms;
  }

  .contact-link:hover,
  .contact-link:focus-visible {
    color: var(--color-primary);
  }
</style>
