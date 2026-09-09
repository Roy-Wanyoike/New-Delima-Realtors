<script lang="ts">
        // Nairobi neighborhood data — static, curated for the marketing site.
        const neighborhoods = [
                {
                        name: 'Westlands',
                        type: 'Business Hub',
                        icon: '🏙️',
                        image: '/lib/assets/project-1.jpg',
                        avgPrice: '17.7M – 22.1M',
                        priceRange: 'KES 17.7M – 22.1M',
                        description:
                                'Nairobi’s premier business district with modern apartments, upscale malls (Sarit Centre, Westgate), and vibrant nightlife. Ideal for young professionals and executives.',
                        highlights: ['Shopping malls', 'International schools', 'Nightlife', 'Office parks'],
                        avgBeds: '2–4',
                        popularity: 95
                },
                {
                        name: 'Kilimani',
                        type: 'Vibrant',
                        icon: '🎨',
                        image: '/lib/assets/apartments-3.jpg',
                        avgPrice: '6.4M – 29.4M',
                        priceRange: 'KES 6.4M – 29.4M',
                        description:
                                'Diverse housing with strong appreciation. Yaya Centre, Adlife Plaza, and a dense restaurant scene. Popular with expats and young families.',
                        highlights: ['Restaurants', 'Gyms & wellness', 'Riara Road apartments', 'Strong ROI'],
                        avgBeds: '1–5',
                        popularity: 92
                },
                {
                        name: 'Karen',
                        type: 'Exclusive',
                        icon: '💎',
                        image: '/lib/assets/project-2.jpg',
                        avgPrice: '50M – 200M+',
                        priceRange: 'KES 50M – 200M+',
                        description:
                                'Leafy, spacious plots and luxury estates. Home to the Karen Country Club, Blixen Museum, and serene gardens. The apex of Nairobi luxury living.',
                        highlights: ['Large plots', 'Country club', 'Equestrian', 'Privacy'],
                        avgBeds: '4–6',
                        popularity: 88
                },
                {
                        name: 'Muthaiga',
                        type: 'Ultra-Premium',
                        icon: '👑',
                        image: '/lib/assets/about-img-1.jpg',
                        avgPrice: '80M – 300M+',
                        priceRange: 'KES 80M – 300M+',
                        description:
                                'Gated community with lavish homes, embassies, and diplomatic residences. The most prestigious address in Nairobi.',
                        highlights: ['Diplomatic zone', 'Heritage homes', 'Muthaiga Club', '24/7 security'],
                        avgBeds: '5–7',
                        popularity: 80
                },
                {
                        name: 'Runda',
                        type: 'Prestigious',
                        icon: '🌳',
                        image: '/lib/assets/about-img-2.jpg',
                        avgPrice: '60M – 250M',
                        priceRange: 'KES 60M – 250M',
                        description:
                                'Leafy streets, family homes, and the Runda Estate Association. Close to the UN and international schools.',
                        highlights: ['UN proximity', 'ISK / Peponi schools', 'Gated estate', 'Family-friendly'],
                        avgBeds: '4–6',
                        popularity: 85
                },
                {
                        name: 'Kileleshwa',
                        type: 'Upscale',
                        icon: '⭐',
                        image: '/lib/assets/amenities-4.jpg',
                        avgPrice: '22M – 41M',
                        priceRange: 'KES 22M – 41M',
                        description:
                                'Excellent investment returns with penthouses and DSQ apartments. Central, quiet, and well-connected.',
                        highlights: ['Penthouses', 'DSQ units', 'Central location', 'Strong rental yield'],
                        avgBeds: '3–5',
                        popularity: 78
                },
                {
                        name: 'Loresho',
                        type: 'Established',
                        icon: '🏡',
                        image: '/lib/assets/about-img-3.jpg',
                        avgPrice: '40M – 150M',
                        priceRange: 'KES 40M – 150M',
                        description:
                                'Established suburb with half-acre villas, swimming pools, and mature gardens. Peaceful, family-oriented.',
                        highlights: ['Half-acre plots', 'Villas with pools', 'Guest houses', 'Quiet'],
                        avgBeds: '4–5',
                        popularity: 72
                },
                {
                        name: 'Langata',
                        type: 'Family',
                        icon: '🦁',
                        image: '/lib/assets/amenities-1.jpg',
                        avgPrice: '15M – 40M',
                        priceRange: 'KES 15M – 40M',
                        description:
                                'Near Nairobi National Park with modern townhouses, shared pools, and playgrounds. Great for young families.',
                        highlights: ['National Park proximity', 'Townhouses', 'Playgrounds', 'Affordable luxury'],
                        avgBeds: '3–4',
                        popularity: 68
                }
        ];
</script>

<svelte:head>
        <title>Nairobi Neighborhoods Guide | Delima Realtors</title>
        <meta
                name="description"
                content="Explore Nairobi's premier real estate neighborhoods — Westlands, Kilimani, Karen, Muthaiga, Runda, Kileleshwa, Loresho, Langata. Prices, highlights, and lifestyle."
        />
</svelte:head>

<main class="neighborhoods-page">
        <!-- Hero -->
        <div class="page-hero">
                <div class="hero-overlay"></div>
                <div class="hero-content">
                        <h1>🗺️ Nairobi Neighborhood Guide</h1>
                        <p>Find the area that matches your lifestyle and budget</p>
                </div>
        </div>

        <div class="container">
                <!-- Intro -->
                <section class="intro-section">
                        <p class="intro-text">
                                Nairobi is a city of distinct neighborhoods, each with its own character, price band, and lifestyle. Our local experts have curated this guide to help you choose where to call home.
                        </p>
                </section>

                <!-- Neighborhood cards -->
                <div class="neighborhoods-grid">
                        {#each neighborhoods as n, i (n.name)}
                                <article class="neighborhood-card" style="--card-delay: {i * 60}ms">
                                        <div class="card-image">
                                                <img src={n.image} alt="{n.name} neighborhood" loading="lazy" />
                                                <div class="card-badge">
                                                        <span class="badge-icon">{n.icon}</span>
                                                        <span class="badge-type">{n.type}</span>
                                                </div>
                                        </div>

                                        <div class="card-body">
                                                <div class="card-title-row">
                                                        <h2>{n.name}</h2>
                                                        <span class="popularity" title="Popularity score">
                                                                <span class="pop-bar" style="width: {n.popularity}%"></span>
                                                                <span class="pop-label">{n.popularity}%</span>
                                                        </span>
                                                </div>

                                                <p class="description">{n.description}</p>

                                                <div class="stats-row">
                                                        <div class="stat">
                                                                <span class="stat-label">Price range</span>
                                                                <span class="stat-value">{n.priceRange}</span>
                                                        </div>
                                                        <div class="stat">
                                                                <span class="stat-label">Bedrooms</span>
                                                                <span class="stat-value">{n.avgBeds}</span>
                                                        </div>
                                                </div>

                                                <div class="highlights">
                                                        {#each n.highlights as h}
                                                                <span class="highlight-tag">{h}</span>
                                                        {/each}
                                                </div>

                                                <a href="/projects?location={encodeURIComponent(n.name)}" class="btn-explore">View properties in {n.name} →</a>
                                        </div>
                                </article>
                        {/each}
                </div>

                <!-- CTA -->
                <section class="cta-section">
                        <div class="cta-card">
                                <h3>Not sure which area is right for you?</h3>
                                <p>Our local agents know Nairobi inside-out. Book a free consultation and we'll match you to the perfect neighborhood.</p>
                                <a href="/contact" class="btn-cta">Book a Consultation</a>
                        </div>
                </section>
        </div>
</main>

<style>
        .neighborhoods-page {
                background: #f9f9f9;
        }

        .page-hero {
                position: relative;
                min-height: 320px;
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
        }

        .hero-content h1 {
                font-size: 2.5rem;
                margin: 0 0 10px;
        }

        .hero-content p {
                color: rgba(255, 255, 255, 0.75);
                font-size: 1.1rem;
                margin: 0;
        }

        .container {
                max-width: 1200px;
                margin: 0 auto;
                padding: 40px 20px 60px;
        }

        .intro-section {
                text-align: center;
                margin-bottom: 40px;
        }

        .intro-text {
                max-width: 720px;
                margin: 0 auto;
                color: #555;
                font-size: 1.05rem;
                line-height: 1.7;
        }

        .neighborhoods-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                gap: 24px;
        }

        .neighborhood-card {
                background: #fff;
                border-radius: 14px;
                overflow: hidden;
                box-shadow: 0 4px 16px rgba(31, 24, 16, 0.08);
                transition: transform 0.3s ease, box-shadow 0.3s ease;
                animation: card-fade-in 0.5s ease backwards;
                animation-delay: var(--card-delay);
        }

        @keyframes card-fade-in {
                from {
                        opacity: 0;
                        transform: translateY(20px);
                }
                to {
                        opacity: 1;
                        transform: translateY(0);
                }
        }

        .neighborhood-card:hover {
                transform: translateY(-6px);
                box-shadow: 0 12px 36px rgba(31, 24, 16, 0.15);
        }

        .card-image {
                position: relative;
                height: 200px;
                overflow: hidden;
        }

        .card-image img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                transition: transform 0.5s ease;
        }

        .neighborhood-card:hover .card-image img {
                transform: scale(1.08);
        }

        .card-badge {
                position: absolute;
                top: 12px;
                left: 12px;
                display: flex;
                align-items: center;
                gap: 6px;
                background: rgba(31, 24, 16, 0.85);
                color: #fff;
                padding: 6px 12px;
                border-radius: 20px;
                font-size: 0.8rem;
                font-weight: 600;
                backdrop-filter: blur(6px);
        }

        .badge-icon {
                font-size: 1rem;
        }

        .card-body {
                padding: 22px;
        }

        .card-title-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
        }

        .card-title-row h2 {
                font-size: 1.35rem;
                margin: 0;
                color: #1f1810;
        }

        .popularity {
                position: relative;
                display: flex;
                align-items: center;
                width: 60px;
                height: 6px;
                background: #eee;
                border-radius: 3px;
                overflow: hidden;
        }

        .pop-bar {
                position: absolute;
                left: 0;
                top: 0;
                height: 100%;
                background: linear-gradient(90deg, #d4af37, #b8941f);
                border-radius: 3px;
                transition: width 0.8s ease;
        }

        .pop-label {
                position: absolute;
                right: -36px;
                font-size: 0.7rem;
                color: #888;
                white-space: nowrap;
        }

        .description {
                color: #666;
                font-size: 0.9rem;
                line-height: 1.6;
                margin: 0 0 16px;
        }

        .stats-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 12px;
                margin-bottom: 16px;
                padding: 12px;
                background: #f8f5f0;
                border-radius: 8px;
        }

        .stat {
                display: flex;
                flex-direction: column;
                gap: 2px;
        }

        .stat-label {
                font-size: 0.7rem;
                color: #999;
                text-transform: uppercase;
                letter-spacing: 0.5px;
        }

        .stat-value {
                font-size: 0.85rem;
                font-weight: 600;
                color: #1f1810;
        }

        .highlights {
                display: flex;
                flex-wrap: wrap;
                gap: 6px;
                margin-bottom: 18px;
        }

        .highlight-tag {
                background: rgba(212, 175, 55, 0.12);
                color: #8a6d10;
                padding: 4px 10px;
                border-radius: 12px;
                font-size: 0.75rem;
                font-weight: 500;
                border: 1px solid rgba(212, 175, 55, 0.25);
        }

        .btn-explore {
                display: block;
                text-align: center;
                background: linear-gradient(135deg, #d4af37 0%, #b8941f 100%);
                color: #1f1810;
                padding: 12px;
                border-radius: 8px;
                text-decoration: none;
                font-weight: 600;
                font-size: 0.9rem;
                transition: transform 0.2s, box-shadow 0.2s;
        }

        .btn-explore:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 16px rgba(212, 175, 55, 0.4);
        }

        .cta-section {
                margin-top: 50px;
        }

        .cta-card {
                background: linear-gradient(135deg, #1f1810 0%, #3d2f25 100%);
                color: #fff;
                border-radius: 16px;
                padding: 40px;
                text-align: center;
                position: relative;
                overflow: hidden;
        }

        .cta-card::before {
                content: '';
                position: absolute;
                top: -50%;
                right: -10%;
                width: 300px;
                height: 300px;
                background: radial-gradient(circle, rgba(212, 175, 55, 0.15), transparent 70%);
                border-radius: 50%;
        }

        .cta-card h3 {
                position: relative;
                margin: 0 0 10px;
                font-size: 1.5rem;
        }

        .cta-card p {
                position: relative;
                color: rgba(255, 255, 255, 0.75);
                margin: 0 0 24px;
                line-height: 1.6;
        }

        .btn-cta {
                position: relative;
                display: inline-block;
                background: linear-gradient(135deg, #d4af37 0%, #b8941f 100%);
                color: #1f1810;
                padding: 14px 36px;
                border-radius: 8px;
                text-decoration: none;
                font-weight: 700;
                transition: transform 0.2s, box-shadow 0.2s;
        }

        .btn-cta:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(212, 175, 55, 0.5);
        }

        @media (max-width: 600px) {
                .hero-content h1 {
                        font-size: 1.8rem;
                }
                .neighborhoods-grid {
                        grid-template-columns: 1fr;
                }
                .cta-card {
                        padding: 28px 20px;
                }
        }
</style>
