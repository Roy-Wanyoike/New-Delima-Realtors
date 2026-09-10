<script lang="ts">
        import { toasts } from '$lib/stores/toasts';

        let email = '';
        let submitting = false;

        async function handleSubmit(e: SubmitEvent) {
                e.preventDefault();
                if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                        toasts.error('Please enter a valid email address.');
                        return;
                }
                submitting = true;
                try {
                        const { supabase } = await import('$lib/supabase');
                        if (!supabase) {
                                throw new Error('Newsletter is temporarily unavailable. Please try again later.');
                        }
                        const { error: insertError } = await supabase.from('newsletter_subscribers').insert([
                                { email: email.trim() }
                        ]);
                        if (insertError) {
                                // Handle duplicate email gracefully
                                if (insertError.message.includes('duplicate') || insertError.code === '23505') {
                                        toasts.info('You\'re already subscribed! Thank you.');
                                } else {
                                        throw insertError;
                                }
                        } else {
                                toasts.success('🎉 Subscribed! Check your inbox to confirm.');
                        }
                        email = '';
                } catch (err: any) {
                        toasts.error(err?.message || 'Failed to subscribe. Please try again.');
                } finally {
                        submitting = false;
                }
        }
</script>

<section class="newsletter" aria-label="Newsletter signup">
        <div class="container">
                <div class="newsletter-card">
                        <div class="newsletter-content">
                                <h2>Stay in the Nairobi market</h2>
                                <p>Get new listings, market insights, and buying guides delivered weekly. No spam, unsubscribe anytime.</p>
                        </div>
                        <form class="newsletter-form" onsubmit={handleSubmit}>
                                <div class="input-group">
                                        <input
                                                type="email"
                                                bind:value={email}
                                                placeholder="you@example.com"
                                                aria-label="Email address"
                                                required
                                                disabled={submitting}
                                        />
                                        <button type="submit" class="subscribe-btn" disabled={submitting}>
                                                {#if submitting}
                                                        <span class="spinner" aria-hidden="true"></span>
                                                        Subscribing…
                                                {:else}
                                                        Subscribe
                                                {/if}
                                        </button>
                                </div>
                                <p class="form-hint">Join 2,000+ Nairobi property buyers and investors.</p>
                        </form>
                </div>
        </div>
</section>

<style>
        .newsletter {
                padding: 50px 0;
                background: #f9f9f9;
        }

        .container {
                max-width: 1100px;
                margin: 0 auto;
                padding: 0 20px;
        }

        .newsletter-card {
                background: linear-gradient(135deg, #1f1810 0%, #3d2f25 100%);
                border-radius: 18px;
                padding: 44px;
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 36px;
                align-items: center;
                position: relative;
                overflow: hidden;
        }

        .newsletter-card::before {
                content: '';
                position: absolute;
                top: -40%;
                right: -10%;
                width: 320px;
                height: 320px;
                background: radial-gradient(circle, rgba(212, 175, 55, 0.18), transparent 70%);
                border-radius: 50%;
        }

        .newsletter-card::after {
                content: '✉️';
                position: absolute;
                bottom: -20px;
                right: 30px;
                font-size: 8rem;
                opacity: 0.06;
                color: #d4af37;
        }

        .newsletter-content {
                position: relative;
                z-index: 1;
        }

        .newsletter-content h2 {
                color: #fff;
                font-size: 1.7rem;
                margin: 0 0 10px;
                line-height: 1.2;
        }

        .newsletter-content p {
                color: rgba(255, 255, 255, 0.7);
                margin: 0;
                line-height: 1.6;
        }

        .newsletter-form {
                position: relative;
                z-index: 1;
        }

        .input-group {
                display: flex;
                gap: 0;
                background: #fff;
                border-radius: 10px;
                padding: 6px;
                box-shadow: 0 6px 20px rgba(0, 0, 0, 0.18);
        }

        .input-group input {
                flex: 1;
                border: none;
                padding: 12px 16px;
                font-size: 0.95rem;
                background: transparent;
                outline: none;
                font-family: inherit;
                color: #1f1810;
                min-width: 0;
        }

        .input-group input::placeholder {
                color: #999;
        }

        .subscribe-btn {
                background: linear-gradient(135deg, #d4af37 0%, #b8941f 100%);
                color: #1f1810;
                border: none;
                padding: 12px 24px;
                border-radius: 7px;
                font-weight: 700;
                font-size: 0.9rem;
                cursor: pointer;
                transition: transform 0.2s, box-shadow 0.2s;
                display: inline-flex;
                align-items: center;
                gap: 8px;
                white-space: nowrap;
                font-family: inherit;
        }

        .subscribe-btn:hover:not(:disabled) {
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(212, 175, 55, 0.5);
        }

        .subscribe-btn:disabled {
                opacity: 0.7;
                cursor: not-allowed;
        }

        .spinner {
                width: 14px;
                height: 14px;
                border: 2px solid rgba(31, 24, 16, 0.3);
                border-top-color: #1f1810;
                border-radius: 50%;
                animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
                to { transform: rotate(360deg); }
        }

        .form-hint {
                color: rgba(255, 255, 255, 0.5);
                font-size: 0.78rem;
                margin: 10px 0 0;
        }

        @media (max-width: 768px) {
                .newsletter-card {
                        grid-template-columns: 1fr;
                        padding: 32px 24px;
                        gap: 24px;
                }
                .newsletter-content h2 {
                        font-size: 1.4rem;
                }
                .input-group {
                        flex-direction: column;
                        gap: 8px;
                }
                .subscribe-btn {
                        width: 100%;
                        justify-content: center;
                }
        }
</style>
