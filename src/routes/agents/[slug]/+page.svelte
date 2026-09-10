<script lang="ts">
        import { page } from '$app/stores';
        import { agents, getAgentBySlug } from '$lib/data/agents';

        let slug = $page.params.slug ?? '';
        let agent = getAgentBySlug(slug);

        $: slug = $page.params.slug ?? '';
        $: agent = getAgentBySlug(slug);

        // Other agents to suggest at the bottom.
        $: others = agents.filter((a) => a.slug !== slug).slice(0, 3);
</script>

<svelte:head>
        <title>{agent ? `${agent.name} — ${agent.role} | Delima Realtors` : 'Agent Not Found'}</title>
        <meta name="description" content={agent ? agent.bio.slice(0, 155) : 'Agent not found'} />
</svelte:head>

{#if agent}
        <main class="agent-profile">
                <!-- Hero with photo + name + role -->
                <section class="profile-hero">
                        <div class="hero-overlay"></div>
                        <div class="container hero-grid">
                                <div class="hero-photo">
                                        <img src={agent.image} alt={agent.name} />
                                        <div class="rating-pill">
                                                <span class="stars">★★★★★</span>
                                                <span class="rating-num">{agent.rating}</span>
                                                <span class="rating-label">client rating</span>
                                        </div>
                                </div>
                                <div class="hero-info">
                                        <p class="eyebrow">Delima Realtors Agent</p>
                                        <h1>{agent.name}</h1>
                                        <p class="role">{agent.role}</p>
                                        <p class="bio">{agent.bio}</p>

                                        <div class="hero-cta">
                                                <a href="tel:{agent.phone}" class="btn-primary">
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                                                        Call {agent.phone}
                                                </a>
                                                <a href="mailto:{agent.email}" class="btn-secondary">
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                                                        Email
                                                </a>
                                        </div>
                                </div>
                        </div>
                </section>

                <div class="container body-grid">
                        <!-- Main column -->
                        <div class="main-col">
                                <!-- Stats -->
                                <section class="stats-strip">
                                        <div class="stat-box">
                                                <span class="stat-num">{agent.experience}</span>
                                                <span class="stat-label">Experience</span>
                                        </div>
                                        {#if agent.listingsSold > 0}
                                                <div class="stat-box">
                                                        <span class="stat-num">{agent.listingsSold}+</span>
                                                        <span class="stat-label">Sales Closed</span>
                                                </div>
                                        {:else}
                                                <div class="stat-box">
                                                        <span class="stat-num">60+</span>
                                                        <span class="stat-label">Units Managed</span>
                                                </div>
                                        {/if}
                                        <div class="stat-box">
                                                <span class="stat-num">{agent.rating}</span>
                                                <span class="stat-label">Rating</span>
                                        </div>
                                </section>

                                <!-- Specialties -->
                                <section class="profile-section">
                                        <h2>Specialties</h2>
                                        <div class="specialties-grid">
                                                {#each agent.specialties as s}
                                                        <div class="specialty-card">
                                                                <span class="specialty-icon">✓</span>
                                                                <span>{s}</span>
                                                        </div>
                                                {/each}
                                        </div>
                                </section>

                                <!-- Languages + Certifications -->
                                <section class="profile-section two-col">
                                        <div>
                                                <h2>Languages</h2>
                                                <ul class="info-list">
                                                        {#each agent.languages as lang}
                                                                <li>{lang}</li>
                                                        {/each}
                                                </ul>
                                        </div>
                                        <div>
                                                <h2>Certifications</h2>
                                                <ul class="info-list">
                                                        {#each agent.certifications as cert}
                                                                <li>{cert}</li>
                                                        {/each}
                                                </ul>
                                        </div>
                                </section>

                                <!-- Contact CTA -->
                                <section class="contact-cta">
                                        <h2>Work with {agent.name.split(' ')[0]}</h2>
                                        <p>Reach out directly for a free, no-obligation consultation about buying, selling, or investing in Nairobi real estate.</p>
                                        <div class="cta-buttons">
                                                <a href="tel:{agent.phone}" class="btn-primary">Call now</a>
                                                <a href="/contact" class="btn-secondary">Send a message</a>
                                        </div>
                                </section>
                        </div>

                        <!-- Sidebar -->
                        <aside class="sidebar">
                                <div class="contact-card">
                                        <h3>Contact {agent.name.split(' ')[0]}</h3>
                                        <a href="tel:{agent.phone}" class="contact-line">
                                                <span class="cl-icon">📞</span>
                                                <span>{agent.phone}</span>
                                        </a>
                                        <a href="mailto:{agent.email}" class="contact-line">
                                                <span class="cl-icon">✉️</span>
                                                <span>{agent.email}</span>
                                        </a>
                                        <a href="/contact" class="btn-full">Inquire now</a>
                                </div>

                                <div class="hours-card">
                                        <h3>Office hours</h3>
                                        <p>Mon – Fri: 8:00 AM – 6:00 PM</p>
                                        <p>Sat: 9:00 AM – 2:00 PM</p>
                                        <p>Sun: Closed</p>
                                </div>
                        </aside>
                </div>

                <!-- Other agents -->
                <section class="others-section">
                        <div class="container">
                                <h2>Meet our other agents</h2>
                                <div class="others-grid">
                                        {#each others as other (other.slug)}
                                                <a href="/agents/{other.slug}" class="other-card">
                                                        <img src={other.image} alt={other.name} loading="lazy" />
                                                        <div class="other-body">
                                                                <h3>{other.name}</h3>
                                                                <p>{other.role}</p>
                                                        </div>
                                                </a>
                                        {/each}
                                </div>
                        </div>
                </section>
        </main>
{:else}
        <main class="not-found">
                <div class="container">
                        <h1>Agent not found</h1>
                        <p>We couldn’t find an agent with that profile.</p>
                        <a href="/agents" class="btn-primary">← Back to all agents</a>
                </div>
        </main>
{/if}

<style>
        .agent-profile {
                background: #f9f9f9;
        }

        .profile-hero {
                position: relative;
                background: linear-gradient(135deg, #1f1810 0%, #3d2f25 100%);
                color: #fff;
                padding: 60px 0;
                overflow: hidden;
        }

        .hero-overlay {
                position: absolute;
                inset: 0;
                background: radial-gradient(ellipse at top right, rgba(212, 175, 55, 0.18), transparent 60%);
        }

        .container {
                max-width: 1200px;
                margin: 0 auto;
                padding: 0 20px;
                position: relative;
        }

        .hero-grid {
                display: grid;
                grid-template-columns: 320px 1fr;
                gap: 40px;
                align-items: center;
        }

        .hero-photo {
                position: relative;
        }

        .hero-photo img {
                width: 100%;
                border-radius: 16px;
                box-shadow: 0 12px 36px rgba(0, 0, 0, 0.4);
                display: block;
        }

        .rating-pill {
                position: absolute;
                bottom: -16px;
                left: 50%;
                transform: translateX(-50%);
                background: #fff;
                color: #1f1810;
                padding: 10px 18px;
                border-radius: 24px;
                display: flex;
                align-items: center;
                gap: 6px;
                box-shadow: 0 6px 18px rgba(0, 0, 0, 0.2);
                white-space: nowrap;
        }

        .stars {
                color: #d4af37;
                font-size: 0.85rem;
        }

        .rating-num {
                font-weight: 700;
                font-size: 1rem;
        }

        .rating-label {
                font-size: 0.72rem;
                color: #888;
        }

        .hero-info .eyebrow {
                color: #d4af37;
                text-transform: uppercase;
                letter-spacing: 2px;
                font-size: 0.8rem;
                font-weight: 600;
                margin: 0 0 8px;
        }

        .hero-info h1 {
                font-size: 2.6rem;
                margin: 0 0 6px;
                line-height: 1.1;
        }

        .hero-info .role {
                color: rgba(255, 255, 255, 0.7);
                font-size: 1.15rem;
                margin: 0 0 18px;
        }

        .hero-info .bio {
                color: rgba(255, 255, 255, 0.82);
                line-height: 1.7;
                font-size: 1rem;
                margin: 0 0 24px;
                max-width: 560px;
        }

        .hero-cta {
                display: flex;
                gap: 12px;
                flex-wrap: wrap;
        }

        .btn-primary,
        .btn-secondary {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 12px 24px;
                border-radius: 8px;
                text-decoration: none;
                font-weight: 600;
                font-size: 0.92rem;
                transition: transform 0.2s, box-shadow 0.2s;
        }

        .btn-primary {
                background: linear-gradient(135deg, #d4af37 0%, #b8941f 100%);
                color: #1f1810;
        }

        .btn-primary:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 18px rgba(212, 175, 55, 0.5);
        }

        .btn-secondary {
                background: transparent;
                color: #fff;
                border: 2px solid rgba(255, 255, 255, 0.4);
        }

        .btn-secondary:hover {
                border-color: #d4af37;
                color: #d4af37;
        }

        .body-grid {
                display: grid;
                grid-template-columns: 1fr 300px;
                gap: 32px;
                padding-top: 50px;
                padding-bottom: 50px;
        }

        .stats-strip {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 16px;
                margin-bottom: 36px;
        }

        .stat-box {
                background: #fff;
                border-radius: 12px;
                padding: 24px 16px;
                text-align: center;
                box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
        }

        .stat-num {
                display: block;
                font-size: 1.8rem;
                font-weight: 800;
                color: #d4af37;
                line-height: 1.1;
        }

        .stat-label {
                display: block;
                font-size: 0.75rem;
                color: #888;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-top: 4px;
        }

        .profile-section {
                background: #fff;
                border-radius: 12px;
                padding: 28px;
                margin-bottom: 24px;
                box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
        }

        .profile-section h2 {
                font-size: 1.3rem;
                margin: 0 0 18px;
                color: #1f1810;
        }

        .specialties-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                gap: 12px;
        }

        .specialty-card {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 12px 16px;
                background: rgba(212, 175, 55, 0.08);
                border: 1px solid rgba(212, 175, 55, 0.2);
                border-radius: 8px;
                font-size: 0.9rem;
                color: #1f1810;
        }

        .specialty-icon {
                width: 22px;
                height: 22px;
                border-radius: 50%;
                background: #d4af37;
                color: #1f1810;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 0.75rem;
                font-weight: 700;
                flex-shrink: 0;
        }

        .two-col {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 24px;
        }

        .two-col > div h2 {
                font-size: 1.1rem;
        }

        .info-list {
                list-style: none;
                padding: 0;
                margin: 0;
        }

        .info-list li {
                padding: 8px 0;
                border-bottom: 1px solid #f0f0f0;
                color: #555;
                font-size: 0.92rem;
        }

        .info-list li:last-child {
                border-bottom: none;
        }

        .contact-cta {
                background: linear-gradient(135deg, #1f1810 0%, #3d2f25 100%);
                color: #fff;
                border-radius: 14px;
                padding: 36px;
                text-align: center;
                position: relative;
                overflow: hidden;
        }

        .contact-cta::before {
                content: '';
                position: absolute;
                top: -40%;
                right: -10%;
                width: 260px;
                height: 260px;
                background: radial-gradient(circle, rgba(212, 175, 55, 0.15), transparent 70%);
                border-radius: 50%;
        }

        .contact-cta h2 {
                position: relative;
                margin: 0 0 10px;
                font-size: 1.5rem;
        }

        .contact-cta p {
                position: relative;
                color: rgba(255, 255, 255, 0.75);
                margin: 0 0 22px;
                line-height: 1.6;
        }

        .cta-buttons {
                position: relative;
                display: flex;
                gap: 12px;
                justify-content: center;
                flex-wrap: wrap;
        }

        .sidebar {
                display: flex;
                flex-direction: column;
                gap: 20px;
        }

        .contact-card,
        .hours-card {
                background: #fff;
                border-radius: 12px;
                padding: 24px;
                box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
        }

        .contact-card h3,
        .hours-card h3 {
                margin: 0 0 16px;
                font-size: 1.1rem;
                color: #1f1810;
        }

        .contact-line {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 10px 0;
                color: #555;
                text-decoration: none;
                font-size: 0.9rem;
                border-bottom: 1px solid #f0f0f0;
                transition: color 0.2s;
        }

        .contact-line:last-of-type {
                border-bottom: none;
        }

        .contact-line:hover {
                color: #d4af37;
        }

        .cl-icon {
                font-size: 1.1rem;
        }

        .btn-full {
                display: block;
                text-align: center;
                background: linear-gradient(135deg, #d4af37 0%, #b8941f 100%);
                color: #1f1810;
                padding: 12px;
                border-radius: 8px;
                text-decoration: none;
                font-weight: 600;
                margin-top: 16px;
                transition: transform 0.2s, box-shadow 0.2s;
        }

        .btn-full:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(212, 175, 55, 0.4);
        }

        .hours-card p {
                margin: 6px 0;
                color: #555;
                font-size: 0.9rem;
        }

        .others-section {
                background: #fff;
                padding: 50px 0;
        }

        .others-section h2 {
                text-align: center;
                font-size: 1.6rem;
                margin: 0 0 32px;
                color: #1f1810;
        }

        .others-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
                gap: 20px;
        }

        .other-card {
                display: block;
                background: #f9f9f9;
                border-radius: 12px;
                overflow: hidden;
                text-decoration: none;
                color: inherit;
                transition: transform 0.3s, box-shadow 0.3s;
        }

        .other-card:hover {
                transform: translateY(-4px);
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
        }

        .other-card img {
                width: 100%;
                height: 180px;
                object-fit: cover;
        }

        .other-body {
                padding: 16px;
        }

        .other-body h3 {
                margin: 0 0 4px;
                font-size: 1.05rem;
                color: #1f1810;
        }

        .other-body p {
                margin: 0;
                color: #888;
                font-size: 0.85rem;
        }

        .not-found {
                min-height: 60vh;
                display: flex;
                align-items: center;
                justify-content: center;
                text-align: center;
        }

        .not-found h1 {
                color: #1f1810;
        }

        .not-found p {
                color: #666;
                margin: 10px 0 24px;
        }

        @media (max-width: 768px) {
                .hero-grid {
                        grid-template-columns: 1fr;
                        gap: 50px;
                        text-align: center;
                }
                .hero-photo {
                        max-width: 240px;
                        margin: 0 auto;
                }
                .hero-cta {
                        justify-content: center;
                }
                .body-grid {
                        grid-template-columns: 1fr;
                }
                .two-col {
                        grid-template-columns: 1fr;
                }
                .hero-info h1 {
                        font-size: 2rem;
                }
        }

        @media (max-width: 480px) {
                .stats-strip {
                        grid-template-columns: 1fr;
                }
        }
</style>
