<script lang="ts">
        import { onMount, onDestroy } from 'svelte';
        import { goto } from '$app/navigation';
        import { buildSearchIndex, search, type SearchResult } from '$lib/data/search';

        let open = $state(false);
        let query = $state('');
        let activeIndex = $state(0);
        let inputEl = $state<HTMLInputElement | null>(null);

        const index = buildSearchIndex();

        const results = $derived(query ? search(query, index) : []);

        // Reset activeIndex when query changes
        $effect(() => {
                query; // track query
                activeIndex = 0;
        });

        function openModal() {
                open = true;
                setTimeout(() => inputEl?.focus(), 50);
        }

        function closeModal() {
                open = false;
                query = '';
        }

        function selectResult(r: SearchResult) {
                goto(r.href);
                closeModal();
        }

        function handleKeydown(e: KeyboardEvent) {
                if (!open) {
                        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                                e.preventDefault();
                                openModal();
                        }
                        return;
                }
                if (e.key === 'Escape') {
                        closeModal();
                } else if (e.key === 'ArrowDown' && results.length > 0) {
                        e.preventDefault();
                        activeIndex = (activeIndex + 1) % results.length;
                } else if (e.key === 'ArrowUp' && results.length > 0) {
                        e.preventDefault();
                        activeIndex = (activeIndex - 1 + results.length) % results.length;
                } else if (e.key === 'Enter' && results[activeIndex]) {
                        e.preventDefault();
                        selectResult(results[activeIndex]);
                }
        }

        function typeLabel(t: SearchResult['type']): string {
                switch (t) {
                        case 'property': return 'Property';
                        case 'blog': return 'Article';
                        case 'agent': return 'Agent';
                        case 'page': return 'Page';
                }
        }

        onMount(() => {
                window.addEventListener('keydown', handleKeydown);
                window.addEventListener('open-search', openModal as EventListener);
        });

        onDestroy(() => {
                if (typeof window !== 'undefined') {
                        window.removeEventListener('keydown', handleKeydown);
                        window.removeEventListener('open-search', openModal as EventListener);
                }
        });
</script>

{#if open}
        <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
        <div
                class="search-overlay"
                onclick={closeModal}
                role="dialog"
                aria-modal="true"
                aria-label="Search"
                tabindex="-1"
                onkeydown={(e) => e.key === 'Escape' && closeModal()}
        >
                <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions, a11y_no_noninteractive_element_interactions -->
                <div class="search-modal" onclick={(e) => e.stopPropagation()} role="document">
                        <div class="search-input-wrap">
                                <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                                <input
                                        bind:this={inputEl}
                                        bind:value={query}
                                        type="text"
                                        placeholder="Search properties, articles, agents…"
                                        aria-label="Search query"
                                        autocomplete="off"
                                />
                                <button type="button" class="close-btn" onclick={closeModal} aria-label="Close search">✕</button>
                        </div>

                        <div class="search-results">
                                {#if query && results.length === 0}
                                        <div class="no-results">
                                                <span class="no-results-icon">🔍</span>
                                                <p>No results for "{query}"</p>
                                                <span>Try a neighborhood, property type, or agent name.</span>
                                        </div>
                                {:else if results.length > 0}
                                        <ul role="listbox">
                                                {#each results as r, i (r.href + r.title)}
                                                        <li>
                                                                <button
                                                                        type="button"
                                                                        class="result-item"
                                                                        class:active={i === activeIndex}
                                                                        onclick={() => selectResult(r)}
                                                                        onmouseenter={() => (activeIndex = i)}
                                                                        role="option"
                                                                        aria-selected={i === activeIndex}
                                                                >
                                                                        <span class="result-icon">{r.icon}</span>
                                                                        <span class="result-text">
                                                                                <span class="result-title">{r.title}</span>
                                                                                {#if r.subtitle}
                                                                                        <span class="result-subtitle">{r.subtitle}</span>
                                                                                {/if}
                                                                        </span>
                                                                        <span class="result-type">{typeLabel(r.type)}</span>
                                                                </button>
                                                        </li>
                                                {/each}
                                        </ul>
                                {:else}
                                        <div class="search-hints">
                                                <p class="hints-title">Quick links</p>
                                                <div class="hints-grid">
                                                        {#each index.filter((r) => r.type === 'page').slice(0, 6) as r (r.href)}
                                                                <button type="button" class="hint-chip" onclick={() => selectResult(r)}>
                                                                        <span>{r.icon}</span> {r.title}
                                                                </button>
                                                        {/each}
                                                </div>
                                                <p class="hints-footer">Press <kbd>↑</kbd><kbd>↓</kbd> to navigate · <kbd>↵</kbd> to select · <kbd>esc</kbd> to close</p>
                                        </div>
                                {/if}
                        </div>
                </div>
        </div>
{/if}

<style>
        .search-overlay {
                position: fixed;
                inset: 0;
                background: rgba(31, 24, 16, 0.7);
                backdrop-filter: blur(4px);
                z-index: 10000;
                display: flex;
                align-items: flex-start;
                justify-content: center;
                padding-top: 12vh;
                animation: fade-in 0.2s ease;
        }

        @keyframes fade-in {
                from { opacity: 0; }
                to { opacity: 1; }
        }

        .search-modal {
                width: 90%;
                max-width: 640px;
                background: #fff;
                border-radius: 14px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                overflow: hidden;
                animation: modal-in 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes modal-in {
                from { opacity: 0; transform: translateY(-20px) scale(0.96); }
                to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .search-input-wrap {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 16px 20px;
                border-bottom: 1px solid #eee;
        }

        .search-icon {
                color: #999;
                flex-shrink: 0;
        }

        .search-input-wrap input {
                flex: 1;
                border: none;
                outline: none;
                font-size: 1.05rem;
                font-family: inherit;
                color: #1f1810;
                background: transparent;
        }

        .search-input-wrap input::placeholder {
                color: #aaa;
        }

        .close-btn {
                background: #f0f0f0;
                border: none;
                width: 30px;
                height: 30px;
                border-radius: 50%;
                cursor: pointer;
                color: #666;
                font-size: 0.85rem;
                transition: all 0.2s;
                flex-shrink: 0;
        }

        .close-btn:hover {
                background: #1f1810;
                color: #fff;
        }

        .search-results {
                max-height: 60vh;
                overflow-y: auto;
        }

        .search-results ul {
                list-style: none;
                margin: 0;
                padding: 8px;
        }

        .result-item {
                width: 100%;
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px 14px;
                background: none;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                text-align: left;
                font-family: inherit;
                transition: background 0.15s;
        }

        .result-item.active,
        .result-item:hover {
                background: #f8f5f0;
        }

        .result-item.active {
                box-shadow: inset 3px 0 0 #d4af37;
        }

        .result-icon {
                font-size: 1.3rem;
                flex-shrink: 0;
                width: 32px;
                text-align: center;
        }

        .result-text {
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: 2px;
                min-width: 0;
        }

        .result-title {
                font-size: 0.92rem;
                font-weight: 600;
                color: #1f1810;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
        }

        .result-subtitle {
                font-size: 0.78rem;
                color: #888;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
        }

        .result-type {
                font-size: 0.68rem;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                color: #d4af37;
                background: rgba(212, 175, 55, 0.12);
                padding: 3px 8px;
                border-radius: 10px;
                flex-shrink: 0;
        }

        .no-results {
                text-align: center;
                padding: 50px 20px;
                color: #999;
        }

        .no-results-icon {
                font-size: 2.5rem;
                display: block;
                margin-bottom: 12px;
        }

        .no-results p {
                margin: 0 0 6px;
                color: #1f1810;
                font-weight: 600;
        }

        .no-results span {
                font-size: 0.85rem;
        }

        .search-hints {
                padding: 20px;
        }

        .hints-title {
                font-size: 0.78rem;
                text-transform: uppercase;
                letter-spacing: 1px;
                color: #888;
                margin: 0 0 14px;
                font-weight: 600;
        }

        .hints-grid {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                margin-bottom: 20px;
        }

        .hint-chip {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 8px 14px;
                background: #f8f5f0;
                border: 1px solid #eee;
                border-radius: 20px;
                cursor: pointer;
                font-family: inherit;
                font-size: 0.85rem;
                color: #1f1810;
                transition: all 0.2s;
        }

        .hint-chip:hover {
                background: #d4af37;
                color: #1f1810;
                border-color: #d4af37;
                transform: translateY(-1px);
        }

        .hints-footer {
                font-size: 0.75rem;
                color: #aaa;
                margin: 0;
                text-align: center;
        }

        kbd {
                background: #f0f0f0;
                border: 1px solid #ddd;
                border-radius: 4px;
                padding: 2px 6px;
                font-size: 0.7rem;
                font-family: monospace;
                margin: 0 2px;
        }

        @media (max-width: 600px) {
                .search-overlay {
                        padding-top: 0;
                        align-items: stretch;
                }
                .search-modal {
                        width: 100%;
                        max-width: none;
                        min-height: 100vh;
                        border-radius: 0;
                }
                .result-type {
                        display: none;
                }
        }
</style>
