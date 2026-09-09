<script lang="ts">
        import { toasts } from '$lib/stores/toasts';
        import { browser } from '$app/environment';

        export let url: string;
        export let title: string;

        let copied = false;

        function shareUrl(): string {
                if (!browser) return '';
                return window.location.origin + url;
        }

        function shareWhatsApp() {
                const text = encodeURIComponent(`Check out this property: ${title} — ${shareUrl()}`);
                window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer');
        }

        function shareX() {
                const text = encodeURIComponent(`${title}`);
                const share = encodeURIComponent(shareUrl());
                window.open(`https://twitter.com/intent/tweet?text=${text}&url=${share}`, '_blank', 'noopener,noreferrer');
        }

        function shareFacebook() {
                const share = encodeURIComponent(shareUrl());
                const quote = encodeURIComponent(title);
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${share}&quote=${quote}`, '_blank', 'noopener,noreferrer');
        }

        function shareEmail() {
                const subject = encodeURIComponent(`Property: ${title}`);
                const body = encodeURIComponent(`I found this property on Delima Realtors and thought you might be interested:\n\n${title}\n${shareUrl()}`);
                window.location.href = `mailto:?subject=${subject}&body=${body}`;
        }

        async function copyLink() {
                try {
                        await navigator.clipboard.writeText(shareUrl());
                        copied = true;
                        toasts.success('🔗 Link copied to clipboard');
                        setTimeout(() => (copied = false), 2000);
                } catch {
                        toasts.error('Could not copy link. Please copy manually.');
                }
        }
</script>

<div class="share-bar" role="group" aria-label="Share this property">
        <span class="share-label">Share:</span>
        <button type="button" class="share-btn whatsapp" onclick={shareWhatsApp} aria-label="Share on WhatsApp" title="Share on WhatsApp">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        </button>
        <button type="button" class="share-btn x" onclick={shareX} aria-label="Share on X" title="Share on X">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
        </button>
        <button type="button" class="share-btn facebook" onclick={shareFacebook} aria-label="Share on Facebook" title="Share on Facebook">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073"/></svg>
        </button>
        <button type="button" class="share-btn email" onclick={shareEmail} aria-label="Share via email" title="Share via email">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
        </button>
        <button type="button" class="share-btn copy" class:copied onclick={copyLink} aria-label="Copy link to clipboard" title="Copy link">
                {#if copied}
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                {:else}
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                {/if}
        </button>
</div>

<style>
        .share-bar {
                display: flex;
                align-items: center;
                gap: 10px;
                flex-wrap: wrap;
                padding: 14px 18px;
                background: #fff;
                border-radius: 12px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
        }

        .share-label {
                font-size: 0.85rem;
                font-weight: 600;
                color: #666;
                margin-right: 4px;
        }

        .share-btn {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                border: 1px solid #eee;
                background: #f8f8f8;
                color: #555;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.25s ease;
                flex-shrink: 0;
        }

        .share-btn:hover {
                transform: translateY(-3px);
                box-shadow: 0 6px 14px rgba(0, 0, 0, 0.15);
        }

        .share-btn.whatsapp:hover { background: #25d366; color: #fff; border-color: #25d366; }
        .share-btn.x:hover { background: #000; color: #fff; border-color: #000; }
        .share-btn.facebook:hover { background: #1877f2; color: #fff; border-color: #1877f2; }
        .share-btn.email:hover { background: #1f1810; color: #fff; border-color: #1f1810; }
        .share-btn.copy:hover { background: #d4af37; color: #1f1810; border-color: #d4af37; }
        .share-btn.copy.copied { background: #28a745; color: #fff; border-color: #28a745; }

        .share-btn:focus-visible {
                outline: 2px solid #d4af37;
                outline-offset: 2px;
        }

        @media (max-width: 480px) {
                .share-bar {
                        justify-content: center;
                }
                .share-label {
                        width: 100%;
                        text-align: center;
                        margin-bottom: 4px;
                }
        }
</style>
