<script lang="ts">
    import { Mail, Github, Linkedin } from "lucide-svelte";

    let emailHover = false;
    let githubHover = false;
    let linkedinHover = false;
</script>

<div class="flex flex-col gap-8 w-full">
    <!-- Header Section -->
    <div
        class="flex flex-col-reverse md:flex-row justify-between items-start md:items-center gap-8 md:gap-12"
    >
        <div class="flex flex-col gap-4">
            <h1 class="text-5xl font-medium">Hey, it's Nicholas</h1>

            <div class="font-mono text-sm text-secondary-text">
                <!-- developer, sometimes other things -->
                "How fleeting are all human passions compared with the massive continuity
                of ducks." - Dorothy L. Sayers
            </div>

            <div class="flex gap-4 items-center">
                <!-- Email -->
                <a
                    href="mailto:nicbatnicko@gmail.com"
                    class="transition-transform hover:scale-110"
                    aria-label="Email"
                    onmouseover={() => (emailHover = true)}
                    onfocus={() => (emailHover = true)}
                    onmouseout={() => (emailHover = false)}
                    onblur={() => (emailHover = false)}
                >
                    <Mail
                        size={20}
                        color={emailHover
                            ? "var(--color-primary)"
                            : "var(--color-text-secondary)"}
                    />
                </a>

                <!-- Github -->
                <a
                    href="https://github.com/nicbat"
                    target="_blank"
                    class="transition-transform hover:scale-110"
                    aria-label="Github"
                    onmouseover={() => (githubHover = true)}
                    onfocus={() => (githubHover = true)}
                    onmouseout={() => (githubHover = false)}
                    onblur={() => (githubHover = false)}
                >
                    <Github
                        size={20}
                        color={githubHover
                            ? "var(--color-primary)"
                            : "var(--color-text-secondary)"}
                    />
                </a>

                <!-- LinkedIn -->
                <a
                    href="https://www.linkedin.com/in/nicholasbatchelder/"
                    target="_blank"
                    class="transition-transform hover:scale-110"
                    aria-label="LinkedIn"
                    onmouseover={() => (linkedinHover = true)}
                    onfocus={() => (linkedinHover = true)}
                    onmouseout={() => (linkedinHover = false)}
                    onblur={() => (linkedinHover = false)}
                >
                    <Linkedin
                        size={20}
                        color={linkedinHover
                            ? "var(--color-primary)"
                            : "var(--color-text-secondary)"}
                    />
                </a>
            </div>
        </div>

        <img
            src="home_photo.png"
            alt="Nicholas Batchelder"
            class="w-32 h-32 md:w-48 md:h-48 rounded-full object-cover shadow-lg transition-all duration-500"
        />
    </div>

    <!-- Content Section -->
    <div class="mt-8 text-lg leading-relaxed text-primary-text space-y-6">
        <p>
            I'm a Master's Student at the <a
                href="https://www.washington.edu/"
                class="underline decoration-1 underline-offset-4 hover:decoration-2"
                >University of Washington</a
            >
            studying Computer Science. I'm currently working with
            <a
                href="https://www.appesteem.com/"
                class="underline decoration-1 underline-offset-4 hover:decoration-2"
                >AppEsteem</a
            >
            to build an Android app for
            <a
                href="https://shamcheck.com/"
                class="underline decoration-1 underline-offset-4 hover:decoration-2"
                >Sham Check</a
            >, as well as TAing for
            <a
                href="https://courses.cs.washington.edu/courses/cse461/26wi/"
                class="underline decoration-1 underline-offset-4 hover:decoration-2"
                >CSE 461: Networks</a
            >. At the end of August I'll be working fulltime at
            <a
                href="https://careers.roblox.com/"
                target="_blank"
                class="underline decoration-1 underline-offset-4 hover:decoration-2"
                >Roblox</a
            >!
        </p>

        <p>
            Outside of programming, I've recently been spending my time studying
            languages, snowboarding, bouldering, listening to audiobooks, and
            exploring the west coast.
        </p>
    </div>
</div>
