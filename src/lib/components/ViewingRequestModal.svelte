<script lang="ts">
        import { toasts } from '$lib/stores/toasts';

        let { open = $bindable(false), projectId = '', projectTitle = '', projectLocation = '' } = $props();

        let form = $state({
                name: '',
                email: '',
                phone: '',
                preferredDate: '',
                preferredTime: '',
                message: ''
        });
        let submitting = $state(false);

        function close() {
                open = false;
        }

        function handleSubmit(e: SubmitEvent) {
                e.preventDefault();
                if (!form.name || !form.email || !form.phone) {
                        toasts.error('Please fill in your name, email, and phone.');
                        return;
                }
                submitting = true;
                setTimeout(async () => {
                        try {
                                const { supabase } = await import('$lib/supabase');
                                if (!supabase) {
                                        throw new Error('Our system is temporarily unavailable. Please call +254 727 523 752.');
                                }
                                const { error: insertError } = await supabase.from('contacts').insert([
                                        {
                                                name: form.name,
                                                email: form.email,
                                                phone: form.phone,
                                                property_id: projectId,
                                                interested_in: `Viewing request: ${projectTitle}`,
                                                message: `Preferred date: ${form.preferredDate || 'Any'}\nPreferred time: ${form.preferredTime || 'Any'}\n${form.message || ''}`,
                                                status: 'new'
                                        }
                                ]);
                                if (insertError) throw insertError;
                                toasts.success('📅 Viewing request submitted! We\'ll confirm your slot within 24 hours.');
                                open = false;
                                form = { name: '', email: '', phone: '', preferredDate: '', preferredTime: '', message: '' };
                        } catch (err: any) {
                                toasts.error(err?.message || 'Failed to submit. Please try again.');
                        } finally {
                                submitting = false;
                        }
                }, 100);
        }

        const timeSlots = ['Morning (9-12)', 'Afternoon (12-3)', 'Evening (3-6)'];
</script>

{#if open}
        <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
        <div class="modal-overlay" onclick={close} role="dialog" aria-modal="true" aria-label="Request a viewing" tabindex="-1">
                <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
                <div class="modal-card" onclick={(e) => e.stopPropagation()}>
                        <div class="modal-header">
                                <div>
                                        <h2>📅 Request a Viewing</h2>
                                        <p class="modal-subtitle">{projectTitle}</p>
                                        <p class="modal-location">📍 {projectLocation}</p>
                                </div>
                                <button type="button" class="close-btn" onclick={close} aria-label="Close">✕</button>
                        </div>

                        <form onsubmit={handleSubmit} class="viewing-form">
                                <div class="form-row">
                                        <div class="form-group">
                                                <label for="vr-name">Full Name *</label>
                                                <input id="vr-name" type="text" bind:value={form.name} placeholder="Your name" required />
                                        </div>
                                        <div class="form-group">
                                                <label for="vr-phone">Phone *</label>
                                                <input id="vr-phone" type="tel" bind:value={form.phone} placeholder="+254 7XX XXX XXX" required />
                                        </div>
                                </div>

                                <div class="form-group">
                                        <label for="vr-email">Email *</label>
                                        <input id="vr-email" type="email" bind:value={form.email} placeholder="you@example.com" required />
                                </div>

                                <div class="form-row">
                                        <div class="form-group">
                                                <label for="vr-date">Preferred Date</label>
                                                <input id="vr-date" type="date" bind:value={form.preferredDate} />
                                        </div>
                                        <div class="form-group">
                                                <label for="vr-time">Preferred Time</label>
                                                <select id="vr-time" bind:value={form.preferredTime}>
                                                        <option value="">Any time</option>
                                                        {#each timeSlots as slot}
                                                                <option value={slot}>{slot}</option>
                                                        {/each}
                                                </select>
                                        </div>
                                </div>

                                <div class="form-group">
                                        <label for="vr-message">Message (optional)</label>
                                        <textarea id="vr-message" bind:value={form.message} rows="2" placeholder="Any specific questions or requirements?"></textarea>
                                </div>

                                <button type="submit" class="btn-submit" disabled={submitting}>
                                        {#if submitting}
                                                Submitting…
                                        {:else}
                                                Submit Viewing Request
                                        {/if}
                                </button>
                                <p class="form-disclaimer">We'll contact you within 24 hours to confirm your viewing slot.</p>
                        </form>
                </div>
        </div>
{/if}

<style>
        .modal-overlay {
                position: fixed;
                inset: 0;
                background: rgba(31, 24, 16, 0.75);
                backdrop-filter: blur(4px);
                z-index: 10001;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
                animation: fade-in 0.2s ease;
        }

        @keyframes fade-in {
                from { opacity: 0; }
                to { opacity: 1; }
        }

        .modal-card {
                background: #fff;
                border-radius: 16px;
                width: 100%;
                max-width: 520px;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                animation: modal-in 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes modal-in {
                from { opacity: 0; transform: translateY(-20px) scale(0.96); }
                to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                padding: 24px 28px;
                border-bottom: 1px solid #f0f0f0;
                background: linear-gradient(135deg, #1f1810 0%, #3d2f25 100%);
                color: #fff;
                border-radius: 16px 16px 0 0;
        }

        .modal-header h2 {
                margin: 0 0 4px;
                font-size: 1.3rem;
        }

        .modal-subtitle {
                margin: 0 0 2px;
                color: rgba(255, 255, 255, 0.85);
                font-size: 0.9rem;
        }

        .modal-location {
                margin: 0;
                color: rgba(255, 255, 255, 0.55);
                font-size: 0.8rem;
        }

        .close-btn {
                background: rgba(255, 255, 255, 0.15);
                border: none;
                color: #fff;
                width: 34px;
                height: 34px;
                border-radius: 50%;
                cursor: pointer;
                font-size: 1rem;
                flex-shrink: 0;
                transition: background 0.2s;
        }

        .close-btn:hover {
                background: rgba(255, 255, 255, 0.3);
        }

        .viewing-form {
                padding: 24px 28px;
        }

        .form-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 14px;
        }

        .form-group {
                margin-bottom: 16px;
        }

        .form-group label {
                display: block;
                margin-bottom: 5px;
                font-weight: 600;
                color: #1f1810;
                font-size: 0.85rem;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
                width: 100%;
                padding: 10px 12px;
                border: 1px solid #ddd;
                border-radius: 8px;
                font-size: 0.9rem;
                font-family: inherit;
                transition: border-color 0.2s, box-shadow 0.2s;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
                outline: none;
                border-color: #d4af37;
                box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.15);
        }

        .btn-submit {
                width: 100%;
                background: linear-gradient(135deg, #d4af37 0%, #b8941f 100%);
                color: #1f1810;
                border: none;
                padding: 14px;
                border-radius: 8px;
                font-weight: 700;
                font-size: 0.95rem;
                cursor: pointer;
                font-family: inherit;
                transition: transform 0.2s, box-shadow 0.2s;
        }

        .btn-submit:hover:not(:disabled) {
                transform: translateY(-2px);
                box-shadow: 0 6px 16px rgba(212, 175, 55, 0.4);
        }

        .btn-submit:disabled {
                opacity: 0.7;
                cursor: not-allowed;
        }

        .form-disclaimer {
                text-align: center;
                color: #999;
                font-size: 0.78rem;
                margin: 12px 0 0;
        }

        @media (max-width: 480px) {
                .form-row {
                        grid-template-columns: 1fr;
                }
                .modal-header {
                        padding: 20px;
                }
                .viewing-form {
                        padding: 20px;
                }
        }
</style>
