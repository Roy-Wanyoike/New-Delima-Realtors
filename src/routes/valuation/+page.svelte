<script lang="ts">
        import { toasts } from '$lib/stores/toasts';

        let step = $state(1);
        let submitting = $state(false);
        let submitted = $state(false);

        let form = $state({
                // Step 1: Property details
                propertyType: '',
                bedrooms: '',
                bathrooms: '',
                size: '',
                // Step 2: Location
                location: '',
                neighborhood: '',
                // Step 3: Contact
                name: '',
                email: '',
                phone: '',
                condition: 'good',
                additionalNotes: ''
        });

        const propertyTypes = ['Apartment', 'Villa', 'Townhouse', 'Penthouse', 'Studio', 'Land', 'Commercial'];
        const conditions = [
                { value: 'excellent', label: 'Excellent — recently renovated', icon: '✨' },
                { value: 'good', label: 'Good — well maintained', icon: '👍' },
                { value: 'fair', label: 'Fair — needs some work', icon: '🔧' },
                { value: 'poor', label: 'Poor — major renovation needed', icon: '🏗️' }
        ];

        const totalSteps = 3;

        function next() {
                if (step === 1) {
                        if (!form.propertyType) {
                                toasts.error('Please select a property type.');
                                return;
                        }
                }
                if (step === 2) {
                        if (!form.location) {
                                toasts.error('Please enter the property location.');
                                return;
                        }
                }
                if (step < totalSteps) step++;
        }

        function prev() {
                if (step > 1) step--;
        }

        function jumpTo(s: number) {
                if (s < step) step = s;
        }

        function handleSubmit() {
                if (!form.name || !form.email || !form.phone) {
                        toasts.error('Please fill in all contact fields.');
                        return;
                }
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
                        toasts.error('Please enter a valid email address.');
                        return;
                }

                submitting = true;
                // Simulate submission (in production: insert into a 'valuations' table).
                setTimeout(() => {
                        submitting = false;
                        submitted = true;
                        toasts.success('🎉 Valuation request submitted! We\'ll contact you within 48 hours.');
                }, 1000);
        }

        function resetForm() {
                step = 1;
                submitted = false;
                form = {
                        propertyType: '',
                        bedrooms: '',
                        bathrooms: '',
                        size: '',
                        location: '',
                        neighborhood: '',
                        name: '',
                        email: '',
                        phone: '',
                        condition: 'good',
                        additionalNotes: ''
                };
        }
</script>

<svelte:head>
        <title>Free Property Valuation | Delima Realtors</title>
        <meta
                name="description"
                content="Get a free, no-obligation property valuation from Delima Realtors. Our Nairobi market experts will assess your property and provide a fair market estimate within 48 hours."
        />
</svelte:head>

<main class="valuation-page">
        <!-- Hero -->
        <div class="page-hero">
                <div class="hero-overlay"></div>
                <div class="hero-content">
                        <span class="hero-eyebrow">Free · No obligation · 48-hour turnaround</span>
                        <h1>🏠 Property Valuation Request</h1>
                        <p>Find out what your Nairobi property is worth. Our licensed valuers will assess your property and provide a fair market estimate.</p>
                </div>
        </div>

        <div class="container">
                {#if submitted}
                        <div class="success-state">
                                <div class="success-icon">✓</div>
                                <h2>Request received!</h2>
                                <p>Thank you, {form.name}. One of our valuers will review your property details and contact you at <strong>{form.phone}</strong> or <strong>{form.email}</strong> within 48 hours.</p>
                                <div class="success-summary">
                                        <h3>What you requested</h3>
                                        <dl>
                                                <dt>Property type</dt><dd>{form.propertyType}</dd>
                                                <dt>Location</dt><dd>{form.location}{form.neighborhood ? `, ${form.neighborhood}` : ''}</dd>
                                                <dt>Condition</dt><dd>{conditions.find((c) => c.value === form.condition)?.label ?? form.condition}</dd>
                                        </dl>
                                </div>
                                <div class="success-actions">
                                        <a href="/" class="btn-primary">Back to home</a>
                                        <button type="button" class="btn-secondary" onclick={resetForm}>Request another valuation</button>
                                </div>
                        </div>
                {:else}
                        <div class="wizard">
                                <!-- Progress indicator -->
                                <div class="progress-bar">
                                        {#each Array(totalSteps) as _, i}
                                                <button
                                                        type="button"
                                                        class="progress-step"
                                                        class:active={step === i + 1}
                                                        class:done={step > i + 1}
                                                        onclick={() => jumpTo(i + 1)}
                                                        aria-label="Go to step {i + 1}"
                                                >
                                                        <span class="step-num">{step > i + 1 ? '✓' : i + 1}</span>
                                                        <span class="step-label">{['Property', 'Location', 'Contact'][i]}</span>
                                                </button>
                                                {#if i < totalSteps - 1}
                                                        <span class="progress-line" class:filled={step > i + 1}></span>
                                                {/if}
                                        {/each}
                                </div>

                                <form class="wizard-form" onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                                        <!-- Step 1: Property details -->
                                        {#if step === 1}
                                                <fieldset class="step-fieldset">
                                                        <legend><h2>Tell us about your property</h2></legend>

                                                        <div class="form-group">
                                                                <label for="propertyType">Property type *</label>
                                                                <div class="type-grid">
                                                                        {#each propertyTypes as pt}
                                                                                <button
                                                                                        type="button"
                                                                                        class="type-option"
                                                                                        class:active={form.propertyType === pt}
                                                                                        onclick={() => (form.propertyType = pt)}
                                                                                >
                                                                                        {pt}
                                                                                </button>
                                                                        {/each}
                                                                </div>
                                                        </div>

                                                        <div class="form-row">
                                                                <div class="form-group">
                                                                        <label for="bedrooms">Bedrooms</label>
                                                                        <input id="bedrooms" type="number" min="0" bind:value={form.bedrooms} placeholder="e.g. 3" />
                                                                </div>
                                                                <div class="form-group">
                                                                        <label for="bathrooms">Bathrooms</label>
                                                                        <input id="bathrooms" type="number" min="0" bind:value={form.bathrooms} placeholder="e.g. 2" />
                                                                </div>
                                                        </div>

                                                        <div class="form-group">
                                                                <label for="size">Size (sqm)</label>
                                                                <input id="size" type="number" min="0" bind:value={form.size} placeholder="e.g. 150" />
                                                        </div>

                                                        <div class="form-group">
                                                                <span class="label-text">Condition</span>
                                                                <div class="condition-grid">
                                                                        {#each conditions as c}
                                                                                <button
                                                                                        type="button"
                                                                                        class="condition-option"
                                                                                        class:active={form.condition === c.value}
                                                                                        onclick={() => (form.condition = c.value)}
                                                                                >
                                                                                        <span class="cond-icon">{c.icon}</span>
                                                                                        <span>{c.label}</span>
                                                                                </button>
                                                                        {/each}
                                                                </div>
                                                        </div>
                                                </fieldset>
                                        {/if}

                                        <!-- Step 2: Location -->
                                        {#if step === 2}
                                                <fieldset class="step-fieldset">
                                                        <legend><h2>Where is the property?</h2></legend>

                                                        <div class="form-group">
                                                                <label for="location">Location / Area *</label>
                                                                <input id="location" type="text" bind:value={form.location} placeholder="e.g. Westlands, Nairobi" required />
                                                        </div>

                                                        <div class="form-group">
                                                                <label for="neighborhood">Neighborhood / Estate</label>
                                                                <input id="neighborhood" type="text" bind:value={form.neighborhood} placeholder="e.g. Riara Road" />
                                                        </div>

                                                        <div class="form-group">
                                                                <label for="notes">Additional notes (optional)</label>
                                                                <textarea id="notes" bind:value={form.additionalNotes} rows="4" placeholder="Any features that may affect value — pool, DSQ, recent renovations, view, etc."></textarea>
                                                        </div>
                                                </fieldset>
                                        {/if}

                                        <!-- Step 3: Contact -->
                                        {#if step === 3}
                                                <fieldset class="step-fieldset">
                                                        <legend><h2>How can we reach you?</h2></legend>

                                                        <div class="form-group">
                                                                <label for="name">Full name *</label>
                                                                <input id="name" type="text" bind:value={form.name} placeholder="Your full name" required />
                                                        </div>

                                                        <div class="form-row">
                                                                <div class="form-group">
                                                                        <label for="email">Email *</label>
                                                                        <input id="email" type="email" bind:value={form.email} placeholder="you@example.com" required />
                                                                </div>
                                                                <div class="form-group">
                                                                        <label for="phone">Phone *</label>
                                                                        <input id="phone" type="tel" bind:value={form.phone} placeholder="+254 7XX XXX XXX" required />
                                                                </div>
                                                        </div>

                                                        <div class="summary-card">
                                                                <h3>Valuation summary</h3>
                                                                <dl>
                                                                        <dt>Type</dt><dd>{form.propertyType || '—'}</dd>
                                                                        <dt>Beds / Baths</dt><dd>{form.bedrooms || '—'} / {form.bathrooms || '—'}</dd>
                                                                        <dt>Size</dt><dd>{form.size ? `${form.size} sqm` : '—'}</dd>
                                                                        <dt>Location</dt><dd>{form.location || '—'}{form.neighborhood ? `, ${form.neighborhood}` : ''}</dd>
                                                                        <dt>Condition</dt><dd>{conditions.find((c) => c.value === form.condition)?.label ?? '—'}</dd>
                                                                </dl>
                                                        </div>
                                                </fieldset>
                                        {/if}

                                        <!-- Nav buttons -->
                                        <div class="wizard-actions">
                                                {#if step > 1}
                                                        <button type="button" class="btn-back" onclick={prev}>← Back</button>
                                                {/if}
                                                {#if step < totalSteps}
                                                        <button type="button" class="btn-next" onclick={next}>Continue →</button>
                                                {:else}
                                                        <button type="submit" class="btn-submit" disabled={submitting}>
                                                                {#if submitting}
                                                                        <span class="spinner" aria-hidden="true"></span>
                                                                        Submitting…
                                                                {:else}
                                                                        Submit valuation request
                                                                {/if}
                                                        </button>
                                                {/if}
                                        </div>
                                </form>
                        </div>
                {/if}
        </div>
</main>

<style>
        .valuation-page {
                background: #f9f9f9;
                min-height: 100vh;
        }

        .page-hero {
                position: relative;
                min-height: 280px;
                background: linear-gradient(135deg, #1f1810 0%, #3d2f25 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: hidden;
        }

        .hero-overlay {
                position: absolute;
                inset: 0;
                background: radial-gradient(ellipse at top, rgba(212, 175, 55, 0.15), transparent 70%);
        }

        .hero-content {
                position: relative;
                text-align: center;
                color: #fff;
                padding: 20px;
                z-index: 1;
                max-width: 640px;
        }

        .hero-eyebrow {
                display: inline-block;
                background: rgba(212, 175, 55, 0.2);
                color: #d4af37;
                padding: 5px 14px;
                border-radius: 16px;
                font-size: 0.75rem;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 1px;
                margin-bottom: 16px;
                border: 1px solid rgba(212, 175, 55, 0.4);
        }

        .hero-content h1 {
                font-size: 2.2rem;
                margin: 0 0 12px;
        }

        .hero-content p {
                color: rgba(255, 255, 255, 0.75);
                font-size: 1.05rem;
                line-height: 1.6;
                margin: 0;
        }

        .container {
                max-width: 720px;
                margin: 0 auto;
                padding: 40px 20px 60px;
        }

        .wizard {
                background: #fff;
                border-radius: 16px;
                padding: 36px;
                box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
        }

        /* Progress bar */
        .progress-bar {
                display: flex;
                align-items: center;
                margin-bottom: 36px;
        }

        .progress-step {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 4px;
                background: none;
                border: none;
                cursor: pointer;
                font-family: inherit;
                flex-shrink: 0;
        }

        .step-num {
                width: 36px;
                height: 36px;
                border-radius: 50%;
                background: #f0f0f0;
                color: #999;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 700;
                font-size: 0.9rem;
                transition: all 0.25s;
                border: 2px solid transparent;
        }

        .progress-step.active .step-num {
                background: linear-gradient(135deg, #d4af37, #b8941f);
                color: #1f1810;
                border-color: #d4af37;
                box-shadow: 0 2px 8px rgba(212, 175, 55, 0.4);
        }

        .progress-step.done .step-num {
                background: #28a745;
                color: #fff;
        }

        .step-label {
                font-size: 0.75rem;
                color: #999;
                font-weight: 600;
        }

        .progress-step.active .step-label {
                color: #1f1810;
        }

        .progress-line {
                flex: 1;
                height: 3px;
                background: #eee;
                margin: 0 8px;
                border-radius: 2px;
                position: relative;
                top: -10px;
                transition: background 0.3s;
        }

        .progress-line.filled {
                background: linear-gradient(90deg, #28a745, #d4af37);
        }

        /* Form */
        .step-fieldset {
                border: none;
                padding: 0;
                margin: 0;
        }

        .step-fieldset legend h2 {
                font-size: 1.4rem;
                color: #1f1810;
                margin: 0 0 24px;
        }

        .form-group {
                margin-bottom: 20px;
        }

        .form-group label,
        .form-group .label-text {
                display: block;
                margin-bottom: 8px;
                color: #1f1810;
                font-weight: 600;
                font-size: 0.9rem;
        }

        .form-group input,
        .form-group textarea {
                width: 100%;
                padding: 12px 14px;
                border: 1px solid #ddd;
                border-radius: 8px;
                font-size: 0.95rem;
                font-family: inherit;
                transition: border-color 0.2s, box-shadow 0.2s;
                background: #fff;
        }

        .form-group input:focus,
        .form-group textarea:focus {
                outline: none;
                border-color: #d4af37;
                box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.15);
        }

        .form-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 16px;
        }

        .type-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
                gap: 10px;
        }

        .type-option {
                padding: 12px;
                border: 2px solid #eee;
                border-radius: 10px;
                background: #fff;
                cursor: pointer;
                font-size: 0.9rem;
                font-weight: 600;
                color: #666;
                transition: all 0.2s;
                font-family: inherit;
        }

        .type-option:hover {
                border-color: #d4af37;
                color: #d4af37;
        }

        .type-option.active {
                background: linear-gradient(135deg, #d4af37, #b8941f);
                color: #1f1810;
                border-color: #d4af37;
        }

        .condition-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                gap: 10px;
        }

        .condition-option {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 12px 14px;
                border: 2px solid #eee;
                border-radius: 10px;
                background: #fff;
                cursor: pointer;
                font-size: 0.85rem;
                color: #666;
                transition: all 0.2s;
                font-family: inherit;
                text-align: left;
        }

        .condition-option:hover {
                border-color: #d4af37;
        }

        .condition-option.active {
                border-color: #d4af37;
                background: rgba(212, 175, 55, 0.08);
                color: #1f1810;
        }

        .cond-icon {
                font-size: 1.2rem;
                flex-shrink: 0;
        }

        /* Summary card */
        .summary-card {
                background: #f8f5f0;
                border-radius: 10px;
                padding: 20px;
                margin-top: 8px;
        }

        .summary-card h3 {
                margin: 0 0 14px;
                font-size: 1rem;
                color: #1f1810;
        }

        .summary-card dl {
                display: grid;
                grid-template-columns: 130px 1fr;
                gap: 8px 12px;
                margin: 0;
        }

        .summary-card dt {
                color: #999;
                font-size: 0.85rem;
        }

        .summary-card dd {
                margin: 0;
                color: #1f1810;
                font-size: 0.9rem;
                font-weight: 500;
        }

        /* Actions */
        .wizard-actions {
                display: flex;
                justify-content: space-between;
                margin-top: 32px;
                padding-top: 24px;
                border-top: 1px solid #f0f0f0;
        }

        .btn-back {
                background: transparent;
                color: #666;
                border: 1px solid #ddd;
                padding: 12px 24px;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 600;
                font-size: 0.9rem;
                font-family: inherit;
                transition: all 0.2s;
        }

        .btn-back:hover {
                border-color: #1f1810;
                color: #1f1810;
        }

        .btn-next,
        .btn-submit {
                background: linear-gradient(135deg, #d4af37, #b8941f);
                color: #1f1810;
                border: none;
                padding: 12px 28px;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 700;
                font-size: 0.9rem;
                font-family: inherit;
                transition: transform 0.2s, box-shadow 0.2s;
                margin-left: auto;
                display: inline-flex;
                align-items: center;
                gap: 8px;
        }

        .btn-next:hover:not(:disabled),
        .btn-submit:hover:not(:disabled) {
                transform: translateY(-2px);
                box-shadow: 0 6px 16px rgba(212, 175, 55, 0.4);
        }

        .btn-next:disabled,
        .btn-submit:disabled {
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

        /* Success state */
        .success-state {
                text-align: center;
                background: #fff;
                border-radius: 16px;
                padding: 48px 36px;
                box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
        }

        .success-icon {
                width: 70px;
                height: 70px;
                margin: 0 auto 20px;
                background: linear-gradient(135deg, #28a745, #20a840);
                color: #fff;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 2rem;
                font-weight: 700;
                box-shadow: 0 6px 20px rgba(40, 167, 69, 0.35);
                animation: pop 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes pop {
                from { transform: scale(0); }
                to { transform: scale(1); }
        }

        .success-state h2 {
                color: #1f1810;
                margin: 0 0 10px;
                font-size: 1.5rem;
        }

        .success-state > p {
                color: #666;
                margin: 0 0 24px;
                line-height: 1.6;
        }

        .success-summary {
                background: #f8f5f0;
                border-radius: 10px;
                padding: 20px;
                margin-bottom: 24px;
                text-align: left;
        }

        .success-summary h3 {
                margin: 0 0 14px;
                font-size: 1rem;
                color: #1f1810;
        }

        .success-summary dl {
                display: grid;
                grid-template-columns: 130px 1fr;
                gap: 8px 12px;
                margin: 0;
        }

        .success-summary dt {
                color: #999;
                font-size: 0.85rem;
        }

        .success-summary dd {
                margin: 0;
                color: #1f1810;
                font-size: 0.9rem;
                font-weight: 500;
        }

        .success-actions {
                display: flex;
                gap: 12px;
                justify-content: center;
                flex-wrap: wrap;
        }

        .btn-primary {
                background: linear-gradient(135deg, #d4af37, #b8941f);
                color: #1f1810;
                padding: 12px 28px;
                border-radius: 8px;
                text-decoration: none;
                font-weight: 700;
                font-size: 0.9rem;
                transition: transform 0.2s, box-shadow 0.2s;
        }

        .btn-primary:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 16px rgba(212, 175, 55, 0.4);
        }

        .btn-secondary {
                background: transparent;
                color: #1f1810;
                border: 1px solid #ddd;
                padding: 12px 28px;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 600;
                font-size: 0.9rem;
                font-family: inherit;
                transition: all 0.2s;
        }

        .btn-secondary:hover {
                border-color: #1f1810;
        }

        @media (max-width: 600px) {
                .wizard {
                        padding: 24px 20px;
                }
                .form-row {
                        grid-template-columns: 1fr;
                }
                .hero-content h1 {
                        font-size: 1.6rem;
                }
                .step-label {
                        display: none;
                }
                .wizard-actions {
                        flex-direction: column-reverse;
                        gap: 10px;
                }
                .btn-back, .btn-next, .btn-submit {
                        width: 100%;
                        justify-content: center;
                        margin-left: 0;
                }
        }
</style>
