<script lang="ts">
        import { onMount, onDestroy } from 'svelte';

        let visible = false;

        function onScroll() {
                visible = window.scrollY > 400;
        }

        function scrollToTop() {
                window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        onMount(() => {
                window.addEventListener('scroll', onScroll, { passive: true });
                onScroll();
        });

        onDestroy(() => {
                if (typeof window !== 'undefined') {
                        window.removeEventListener('scroll', onScroll);
                }
        });
</script>

{#if visible}
        <button
                type="button"
                class="scroll-top"
                on:click={scrollToTop}
                aria-label="Scroll back to top"
                title="Back to top"
        >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <polyline points="18 15 12 9 6 15" />
                </svg>
        </button>
{/if}

<style>
        .scroll-top {
                position: fixed;
                bottom: 24px;
                left: 24px;
                width: 48px;
                height: 48px;
                border-radius: 50%;
                border: none;
                background: linear-gradient(135deg, #d4af37 0%, #b8941f 100%);
                color: #1f1810;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                box-shadow: 0 4px 16px rgba(31, 24, 16, 0.25);
                z-index: 997;
                opacity: 0;
                transform: translateY(20px) scale(0.8);
                animation: pop-in 0.3s ease forwards;
                transition: transform 0.2s, box-shadow 0.2s;
        }

        .scroll-top:hover {
                transform: translateY(-2px) scale(1.05);
                box-shadow: 0 6px 20px rgba(212, 175, 55, 0.5);
        }

        .scroll-top:focus-visible {
                outline: 3px solid #d4af37;
                outline-offset: 2px;
        }

        @keyframes pop-in {
                to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                }
        }

        @media (max-width: 600px) {
                .scroll-top {
                        bottom: 80px; /* above the compare bar */
                        left: 16px;
                }
        }
</style>
