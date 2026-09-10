<script lang="ts">
        import Header from '$lib/components/header.svelte';
        import Footer from '$lib/components/footer.svelte';
        import Chatbot from '$lib/components/Chatbot.svelte';
        import CompareBar from '$lib/components/CompareBar.svelte';
        import ScrollToTop from '$lib/components/ScrollToTop.svelte';
        import Toaster from '$lib/components/Toaster.svelte';
        import CookieConsent from '$lib/components/CookieConsent.svelte';
        import SearchModal from '$lib/components/SearchModal.svelte';
        import { onMount } from 'svelte';
        import { theme } from '$lib/stores/theme';

        onMount(() => {
                theme.hydrate();
        });
</script>

<div class="app-shell">
        <Header />
        <main class="app-main">
                <slot />
        </main>
        <Footer />
        <Chatbot />
        <CompareBar />
        <ScrollToTop />
        <Toaster />
        <CookieConsent />
        <SearchModal />
</div>

<style>
        .app-shell {
                min-height: 100vh;
                display: flex;
                flex-direction: column;
        }

        .app-main {
                flex: 1;
                padding-top: 0;
        }

        /* Dark mode overrides — applied via [data-theme='dark'] on <html>. */
        :global([data-theme='dark']) {
                --dm-bg: #15120e;
                --dm-surface: #1f1a14;
                --dm-text: #f0e6d0;
                --dm-text-muted: #a89c80;
                --dm-border: #2d2620;
        }

        :global([data-theme='dark'] body) {
                background: #15120e !important;
                color: #f0e6d0;
        }

        :global([data-theme='dark'] .preloader) {
                background: #15120e;
        }
</style>
