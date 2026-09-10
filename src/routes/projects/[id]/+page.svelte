<script lang="ts">
        import { page } from '$app/stores';
        import { onMount } from 'svelte';
        import MortgageCalculator from '$lib/components/MortgageCalculator.svelte';
        import { favorites } from '$lib/stores/favorites';
        import { compare } from '$lib/stores/compare';

        let project: any = null;
        let loading = true;
        let error = '';

        // Gallery state
        let galleryImages: string[] = [];
        let activeImage = '';
        let lightboxOpen = false;
        let lightboxIndex = 0;

        // Contact form
        let contactForm = {
                name: '',
                email: '',
                phone: '',
                message: ''
        };
        let submitting = false;
        let submitted = false;

        onMount(async () => {
                const projectId = $page.params.id;
                if (!projectId) {
                        error = 'Project not found';
                        loading = false;
                        return;
                }

                try {
                        const { supabase } = await import('$lib/supabase');

                        // Demo-data fallback for offline mode / when Supabase is unavailable.
                        // Matches the IDs used by /projects (koch-1 .. koch-12).
                        const demoProjects: any[] = [
                                { id: 'koch-1', title: '2, 3 & 4 Bedroom Apartments', description: 'Modern apartments in the heart of Westlands with excellent finishes, spacious balconies, and proximity to shopping centers.', location: 'Westlands, Nairobi', price: '17700000', bedrooms: '3', bathrooms: '2', imageUrl: '/lib/assets/project-1.jpg', category: 'Apartment', status: 'published', featured: true, amenities: 'Parking, Lift, Generator, Borehole, Gym, CCTV' },
                                { id: 'koch-2', title: '2, 3, 4 & 5 Bedroom Apartments', description: 'Spacious family apartments on Riara Road with DSQs, modern kitchen fittings, and secure gated community.', location: 'Riara Road, Nairobi', price: '10700000', bedrooms: '3', bathrooms: '2', imageUrl: '/lib/assets/apartments-2.jpg', category: 'Apartment', status: 'published', featured: false, amenities: 'DSQ, Parking, Garden, Security, Play Area' },
                                { id: 'koch-3', title: '3, 4 & 5 Bedroom Apartments with DSQs', description: 'Luxury apartments in Kilimani featuring servant quarters, high-end finishes, and rooftop terrace with city views.', location: 'Kilimani, Nairobi', price: '29400000', bedrooms: '4', bathrooms: '3', imageUrl: '/lib/assets/apartments-3.jpg', category: 'Apartment', status: 'published', featured: true, amenities: 'DSQ, Swimming Pool, Gym, Parking, Solar' },
                                { id: 'koch-4', title: '1, 2 & 3 Bedroom Apartment', description: 'Affordable apartments in Kilimani suitable for young professionals and small families. Close to schools and hospitals.', location: 'Kilimani, Nairobi', price: '5900000', bedrooms: '2', bathrooms: '1', imageUrl: '/lib/assets/apartments-1.jpg', category: 'Apartment', status: 'published', featured: false, amenities: 'Parking, Security, Water Storage' },
                                { id: 'koch-5', title: '1 Bedroom Apartment', description: 'Stylish 1-bedroom apartment in Westlands perfect for singles. Modern finishes with balcony and city views.', location: 'Westlands, Nairobi', price: '21900000', bedrooms: '1', bathrooms: '1', imageUrl: '/lib/assets/apartments-4.jpg', category: 'Apartment', status: 'published', featured: false, amenities: 'Gym, Parking, Rooftop Terrace, Security' },
                                { id: 'koch-6', title: '5 Bedroom Villa', description: 'Magnificent 5-bedroom villa in Loresho sitting on half-acre land. Features swimming pool, mature garden, and guest house.', location: 'Loresho, Nairobi', price: '150000000', bedrooms: '5', bathrooms: '6', imageUrl: '/lib/assets/project-2.jpg', category: 'Villa', status: 'published', featured: true, amenities: 'Swimming Pool, Garden, Guest House, Parking, Security' },
                                { id: 'koch-7', title: '4 Bedroom Villa', description: 'Elegant 4-bedroom villa in Kitisuru with panoramic views. Open-plan living, modern kitchen, and expansive garden.', location: 'Kitisuru, Nairobi', price: '85000000', bedrooms: '4', bathrooms: '5', imageUrl: '/lib/assets/project-3.jpg', category: 'Villa', status: 'published', featured: true, amenities: 'Garden, Parking, Staff Quarters, Security, View' },
                                { id: 'koch-8', title: '4 Bedroom Townhouses', description: 'Modern townhouses in Langata with shared swimming pool and playground. Perfect for families.', location: 'Langata, Nairobi', price: '35900000', bedrooms: '4', bathrooms: '4', imageUrl: '/lib/assets/amenities-1.jpg', category: 'Townhouse', status: 'published', featured: false, amenities: 'Swimming Pool, Garden, Parking, Playground' },
                                { id: 'koch-9', title: '3 Bedroom Apartment With DSQ', description: 'Executive 3-bedroom apartment in Westlands with servant quarters. Close to Sarit Centre and international schools.', location: 'Westlands, Nairobi', price: '22100000', bedrooms: '3', bathrooms: '3', imageUrl: '/lib/assets/amenities-2.jpg', category: 'Apartment', status: 'published', featured: false, amenities: 'DSQ, Parking, Lift, Generator, Security' },
                                { id: 'koch-10', title: '4 Bedroom Apartment with DSQ', description: 'Spacious 4-bedroom apartment in Kileleshwa with DSQ, master ensuite, and modern finishes throughout.', location: 'Kileleshwa, Nairobi', price: '22000000', bedrooms: '4', bathrooms: '4', imageUrl: '/lib/assets/amenities-3.jpg', category: 'Apartment', status: 'published', featured: false, amenities: 'DSQ, Parking, Gym, Lift, Security' },
                                { id: 'koch-11', title: '5 Bedroom Apartment With DSQ', description: 'Luxurious 5-bedroom penthouse in Kileleshwa with panoramic views, private lift, and rooftop terrace.', location: 'Kileleshwa, Nairobi', price: '41000000', bedrooms: '5', bathrooms: '6', imageUrl: '/lib/assets/amenities-4.jpg', category: 'Penthouse', status: 'published', featured: true, amenities: 'DSQ, Private Lift, Rooftop Terrace, Parking, Gym' },
                                { id: 'koch-12', title: 'Studio And 1 Bedroom Apartment', description: 'Compact studio and 1-bedroom units in Kilimani ideal for students and young professionals.', location: 'Kilimani, Nairobi', price: '6400000', bedrooms: '1', bathrooms: '1', imageUrl: '/lib/assets/amenities-5.jpg', category: 'Studio', status: 'published', featured: false, amenities: 'Parking, Security, Internet Ready' }
                        ];

                        if (!supabase) {
                                // Offline mode: fall back to demo data so the page is still usable.
                                const demo = demoProjects.find((p) => p.id === projectId);
                                if (demo && demo.status === 'published') {
                                        project = demo;
                                        const complement = ['/lib/assets/project-1.jpg', '/lib/assets/project-2.jpg', '/lib/assets/project-3.jpg', '/lib/assets/apartments-1.jpg', '/lib/assets/apartments-2.jpg', '/lib/assets/apartments-3.jpg', '/lib/assets/apartments-4.jpg', '/lib/assets/amenities-1.jpg', '/lib/assets/amenities-2.jpg', '/lib/assets/amenities-3.jpg', '/lib/assets/amenities-4.jpg', '/lib/assets/amenities-5.jpg'];
                                        galleryImages = [project.imageUrl, ...complement.filter((c) => c !== project.imageUrl)].slice(0, 6);
                                        activeImage = galleryImages[0] ?? '';
                                        favorites.hydrate();
                                } else {
                                        error = 'Project not found or not published';
                                }
                                loading = false;
                                return;
                        }

                        const { data, error: err } = await supabase
                                .from('projects')
                                .select('*')
                                .eq('id', projectId)
                                .single();

                        if (err) throw err;
                        if (!data || data.status !== 'published') {
                                error = 'Project not found or not published';
                        } else {
                                project = data;
                                // Build gallery: primary image + a few complementary stock images
                                // (in production these would come from a project_images table).
                                const complement = [
                                        '/lib/assets/project-1.jpg',
                                        '/lib/assets/project-2.jpg',
                                        '/lib/assets/project-3.jpg',
                                        '/lib/assets/apartments-1.jpg',
                                        '/lib/assets/apartments-2.jpg',
                                        '/lib/assets/apartments-3.jpg',
                                        '/lib/assets/apartments-4.jpg',
                                        '/lib/assets/amenities-1.jpg',
                                        '/lib/assets/amenities-2.jpg',
                                        '/lib/assets/amenities-3.jpg',
                                        '/lib/assets/amenities-4.jpg',
                                        '/lib/assets/amenities-5.jpg'
                                ];
                                galleryImages = [project.imageUrl, ...complement.filter((c) => c !== project.imageUrl)].slice(0, 6);
                                activeImage = galleryImages[0] ?? '';
                                favorites.hydrate();
                        }
                } catch (err) {
                        console.error('Error loading project:', err);
                        error = 'Failed to load project details';
                } finally {
                        loading = false;
                }
        });

        function openLightbox(idx: number) {
                lightboxIndex = idx;
                activeImage = galleryImages[idx];
                lightboxOpen = true;
        }

        function closeLightbox() {
                lightboxOpen = false;
        }

        function nextImage() {
                lightboxIndex = (lightboxIndex + 1) % galleryImages.length;
                activeImage = galleryImages[lightboxIndex];
        }

        function prevImage() {
                lightboxIndex = (lightboxIndex - 1 + galleryImages.length) % galleryImages.length;
                activeImage = galleryImages[lightboxIndex];
        }

        function handleLightboxKey(e: KeyboardEvent) {
                if (!lightboxOpen) return;
                if (e.key === 'Escape') closeLightbox();
                if (e.key === 'ArrowRight') nextImage();
                if (e.key === 'ArrowLeft') prevImage();
        }

        async function submitContactForm() {
                if (!contactForm.name || !contactForm.email || !contactForm.message) {
                        alert('Please fill in all required fields');
                        return;
                }

                submitting = true;
                try {
                        const { supabase } = await import('$lib/supabase');
                        if (!supabase) {
                                alert('Contact form is currently unavailable. Please try again later.');
                                submitting = false;
                                return;
                        }

                        const { error: err } = await supabase.from('contacts').insert([
                                {
                                        name: contactForm.name,
                                        email: contactForm.email,
                                        phone: contactForm.phone,
                                        property_id: project.id,
                                        message: contactForm.message,
                                        interested_in: project.title,
                                        status: 'new'
                                }
                        ]);

                        if (err) throw err;

                        submitted = true;
                        contactForm = { name: '', email: '', phone: '', message: '' };
                        setTimeout(() => (submitted = false), 5000);
                } catch (err) {
                        console.error('Error submitting form:', err);
                        alert('Failed to submit inquiry. Please try again.');
                } finally {
                        submitting = false;
                }
        }

        function formatPrice(price: string) {
                return parseInt(price).toLocaleString();
        }
</script>

<svelte:window on:keydown={handleLightboxKey} />

{#if loading}
        <main class="loading-container">
                <div class="loading">Loading property details...</div>
        </main>
{:else if error}
        <main class="error-container">
                <div class="error-message">
                        <h2>⚠️ {error}</h2>
                        <p><a href="/projects">← Back to All Properties</a></p>
                </div>
        </main>
{:else if project}
        <main class="project-detail">
                <!-- Gallery Section -->
                <div class="gallery-section">
                        <div class="gallery-main" on:click={() => openLightbox(galleryImages.indexOf(activeImage))} role="button" tabindex="0" aria-label="Open image in lightbox" on:keypress={(e) => e.key === 'Enter' && openLightbox(galleryImages.indexOf(activeImage))}>
                                <img src={activeImage} alt={project.title} class="main-image" />
                                {#if project.featured}
                                        <div class="featured-badge">⭐ Featured Property</div>
                                {/if}
                                <div class="zoom-hint" aria-hidden="true">🔍 Click to zoom</div>
                                {#if galleryImages.length > 1}
                                        <button type="button" class="gallery-nav prev" aria-label="Previous image" on:click|stopPropagation={prevImage}>‹</button>
                                        <button type="button" class="gallery-nav next" aria-label="Next image" on:click|stopPropagation={nextImage}>›</button>
                                {/if}
                        </div>

                        {#if galleryImages.length > 1}
                                <div class="gallery-thumbs">
                                        {#each galleryImages as img, i (img)}
                                                <button
                                                        type="button"
                                                        class="gallery-thumb"
                                                        class:active={img === activeImage}
                                                        on:click={() => { activeImage = img; lightboxIndex = i; }}
                                                        aria-label="View image {i + 1}"
                                                        aria-pressed={img === activeImage}
                                                >
                                                        <img src={img} alt="" />
                                                </button>
                                        {/each}
                                </div>
                        {/if}
                </div>

                <!-- Favorite + Compare actions -->
                <div class="container">
                        <div class="detail-actions">
                                <button
                                        type="button"
                                        class="action-btn fav"
                                        class:active={$favorites.includes(project.id)}
                                        on:click={() => favorites.toggle(project.id)}
                                        aria-pressed={$favorites.includes(project.id)}
                                >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill={$favorites.includes(project.id) ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
                                        {$favorites.includes(project.id) ? 'Saved' : 'Save'}
                                </button>
                                <button
                                        type="button"
                                        class="action-btn cmp"
                                        class:active={$compare.some((p) => p.id === project.id)}
                                        on:click={() => compare.toggle(project)}
                                        aria-pressed={$compare.some((p) => p.id === project.id)}
                                >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="7" height="18" rx="1" /><rect x="14" y="3" width="7" height="18" rx="1" /></svg>
                                        {$compare.some((p) => p.id === project.id) ? 'In compare' : 'Compare'}
                                </button>
                        </div>
                </div>

                <div class="container">
                        <div class="detail-grid">
                                <!-- Left Column -->
                                <article class="detail-content">
                                        <div class="breadcrumb">
                                                <a href="/">Home</a> / <a href="/projects">Properties</a> / <span>{project.title}</span>
                                        </div>

                                        <h1>{project.title}</h1>
                                        <div class="meta-info">
                                                <span class="category-badge">{project.category}</span>
                                                <p class="location">📍 {project.location}</p>
                                        </div>

                                        <div class="price-section">
                                                <h2 class="price">KES {formatPrice(project.price)}</h2>
                                                {#if project.bedrooms || project.bathrooms}
                                                        <p class="specs">
                                                                🛏️ {project.bedrooms || 'N/A'} Bedrooms | 🚿 {project.bathrooms || 'N/A'} Bathrooms
                                                        </p>
                                                {/if}
                                        </div>

                                        <!-- Description -->
                                        <section class="section">
                                                <h3>About This Property</h3>
                                                <p>{project.description}</p>
                                        </section>

                                        <!-- Amenities -->
                                        {#if project.amenities}
                                                <section class="section">
                                                        <h3>Amenities & Features</h3>
                                                        <ul class="amenities-list">
                                                                {#each project.amenities.split(',') as amenity}
                                                                        <li>✓ {amenity.trim()}</li>
                                                                {/each}
                                                        </ul>
                                                </section>
                                        {/if}

                                        <!-- Quick Facts -->
                                        <section class="section">
                                                <h3>Property Information</h3>
                                                <div class="facts-grid">
                                                        <div class="fact">
                                                                <span class="label">Category</span>
                                                                <span class="value">{project.category}</span>
                                                        </div>
                                                        <div class="fact">
                                                                <span class="label">Location</span>
                                                                <span class="value">{project.location}</span>
                                                        </div>
                                                        {#if project.bedrooms}
                                                                <div class="fact">
                                                                        <span class="label">Bedrooms</span>
                                                                        <span class="value">{project.bedrooms}</span>
                                                                </div>
                                                        {/if}
                                                        {#if project.bathrooms}
                                                                <div class="fact">
                                                                        <span class="label">Bathrooms</span>
                                                                        <span class="value">{project.bathrooms}</span>
                                                                </div>
                                                        {/if}
                                                        <div class="fact">
                                                                <span class="label">Price</span>
                                                                <span class="value">KES {formatPrice(project.price)}</span>
                                                        </div>
                                                        <div class="fact">
                                                                <span class="label">Listed</span>
                                                                <span class="value">{new Date(project.created_at).toLocaleDateString()}</span>
                                                        </div>
                                                </div>
                                        </section>
                                </article>

                        <!-- Mortgage Calculator -->
                        {#if project?.price}
                                <section class="mortgage-section" style="margin: 40px 0;">
                                        <MortgageCalculator price={parseInt(project.price)} />
                                </section>
                        {/if}

                        <!-- Right Column - Sidebar --> - Sidebar -->
                                <aside class="detail-sidebar">
                                        <div class="contact-card">
                                                <h3>Interested in this property?</h3>
                                                <p>Fill out the form below and our team will contact you within 24 hours.</p>

                                                {#if submitted}
                                                        <div class="success-message">✓ Your inquiry has been submitted! We'll contact you soon.</div>
                                                {:else}
                                                        <form on:submit|preventDefault={submitContactForm}>
                                                                <div class="form-group">
                                                                        <label for="name">Full Name *</label>
                                                                        <input
                                                                                id="name"
                                                                                type="text"
                                                                                bind:value={contactForm.name}
                                                                                placeholder="Your full name"
                                                                                required
                                                                        />
                                                                </div>

                                                                <div class="form-group">
                                                                        <label for="email">Email *</label>
                                                                        <input
                                                                                id="email"
                                                                                type="email"
                                                                                bind:value={contactForm.email}
                                                                                placeholder="your@email.com"
                                                                                required
                                                                        />
                                                                </div>

                                                                <div class="form-group">
                                                                        <label for="phone">Phone Number</label>
                                                                        <input
                                                                                id="phone"
                                                                                type="tel"
                                                                                bind:value={contactForm.phone}
                                                                                placeholder="+254 700 000 000"
                                                                        />
                                                                </div>

                                                                <div class="form-group">
                                                                        <label for="message">Message *</label>
                                                                        <textarea
                                                                                id="message"
                                                                                bind:value={contactForm.message}
                                                                                placeholder="Tell us more about your interest..."
                                                                                rows="5"
                                                                                required
                                                                        ></textarea>
                                                                </div>

                                                                <button type="submit" class="btn-submit" disabled={submitting}>
                                                                        {submitting ? 'Sending...' : 'Send Inquiry'}
                                                                </button>
                                                        </form>
                                                {/if}
                                        </div>

                                        <!-- Info Card -->
                                        <div class="info-card">
                                                <h4>💡 Delima Realtors</h4>
                                                <p>Visit our website for more properties and professional real estate services.</p>
                                                <div class="contact-info">
                                                        <p>📞 <a href="tel:+254700000000">+254 700 000 000</a></p>
                                                        <p>📧 <a href="mailto:info@delimarealtors.com">info@delimarealtors.com</a></p>
                                                </div>
                                        </div>
                                </aside>
                        </div>

                        <!-- Related Properties -->
                        <section class="related-section">
                                <h3>Similar Properties</h3>
                                <p class="coming-soon">More properties coming soon...</p>
                        </section>
                </div>
        
{#if lightboxOpen}
        <!-- svelte-ignore a11y-click-events-have-key-events, a11y-no-noninteractive-element-interactions -->
        <div class="lightbox" on:click={closeLightbox} role="dialog" aria-modal="true" aria-label="Image gallery" tabindex="-1">
                <button type="button" class="lightbox-close" on:click|stopPropagation={closeLightbox} aria-label="Close gallery">✕</button>
                <button type="button" class="lightbox-nav prev" on:click|stopPropagation={prevImage} aria-label="Previous image">‹</button>
                <img src={activeImage} alt={project.title} />
                <button type="button" class="lightbox-nav next" on:click|stopPropagation={nextImage} aria-label="Next image">›</button>
                <div class="lightbox-counter">{lightboxIndex + 1} / {galleryImages.length}</div>
        </div>
{/if}

<style>
        .gallery-section { margin: 0 auto 24px; max-width: 1200px; padding: 0 20px; }

        .gallery-main {
                position: relative;
                border-radius: 14px;
                overflow: hidden;
                cursor: zoom-in;
                box-shadow: 0 8px 28px rgba(31, 24, 16, 0.15);
                background: #1f1810;
        }

        .gallery-main .main-image {
                width: 100%;
                height: 480px;
                object-fit: cover;
                display: block;
                transition: transform 0.4s ease;
        }

        .gallery-main:hover .main-image { transform: scale(1.02); }
        .gallery-main:focus-visible { outline: 3px solid #d4af37; outline-offset: 3px; }

        .gallery-main .featured-badge {
                position: absolute;
                top: 16px;
                left: 16px;
                background: rgba(212, 175, 55, 0.95);
                color: #1f1810;
                padding: 8px 16px;
                border-radius: 20px;
                font-size: 0.85rem;
                font-weight: 600;
                z-index: 2;
        }

        .zoom-hint {
                position: absolute;
                bottom: 16px;
                right: 16px;
                background: rgba(0,0,0,0.6);
                color: #fff;
                padding: 6px 12px;
                border-radius: 16px;
                font-size: 0.75rem;
                opacity: 0;
                transition: opacity 0.3s;
        }

        .gallery-main:hover .zoom-hint { opacity: 1; }

        .gallery-nav {
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                width: 44px;
                height: 44px;
                border-radius: 50%;
                border: none;
                background: rgba(0,0,0,0.5);
                color: #fff;
                font-size: 24px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background 0.2s;
                z-index: 3;
        }

        .gallery-nav:hover { background: rgba(0,0,0,0.8); }
        .gallery-nav.prev { left: 16px; }
        .gallery-nav.next { right: 16px; }

        .gallery-thumbs {
                display: flex;
                gap: 10px;
                margin-top: 12px;
                overflow-x: auto;
                padding-bottom: 4px;
        }

        .gallery-thumb {
                flex-shrink: 0;
                width: 90px;
                height: 70px;
                border-radius: 8px;
                overflow: hidden;
                border: 3px solid transparent;
                cursor: pointer;
                padding: 0;
                background: none;
                transition: border-color 0.2s, transform 0.2s;
        }

        .gallery-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .gallery-thumb:hover { transform: translateY(-2px); }
        .gallery-thumb.active { border-color: #d4af37; }
        .gallery-thumb:focus-visible { outline: 2px solid #d4af37; outline-offset: 2px; }

        .detail-actions {
                display: flex;
                gap: 12px;
                margin: 20px 0;
        }

        .action-btn {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 10px 20px;
                border-radius: 24px;
                border: 2px solid #eee;
                background: #fff;
                color: #1f1810;
                cursor: pointer;
                font-size: 0.9rem;
                font-weight: 600;
                transition: all 0.2s;
        }

        .action-btn:hover { border-color: #d4af37; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(212,175,55,0.2); }
        .action-btn.fav.active { background: #dc3545; color: #fff; border-color: #dc3545; }
        .action-btn.cmp.active { background: linear-gradient(135deg, #d4af37, #b8941f); color: #1f1810; border-color: #d4af37; }

        .lightbox {
                position: fixed;
                inset: 0;
                background: rgba(0,0,0,0.92);
                z-index: 9999;
                display: flex;
                align-items: center;
                justify-content: center;
                animation: lb-fade 0.25s ease;
        }

        @keyframes lb-fade { from { opacity: 0; } to { opacity: 1; } }

        .lightbox img {
                max-width: 90vw;
                max-height: 80vh;
                border-radius: 8px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.5);
        }

        .lightbox-close, .lightbox-nav {
                position: absolute;
                border: none;
                background: rgba(255,255,255,0.15);
                color: #fff;
                cursor: pointer;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background 0.2s;
        }

        .lightbox-close { top: 24px; right: 24px; width: 44px; height: 44px; font-size: 18px; }
        .lightbox-nav { top: 50%; transform: translateY(-50%); width: 52px; height: 52px; font-size: 32px; }
        .lightbox-nav.prev { left: 24px; }
        .lightbox-nav.next { right: 24px; }
        .lightbox-close:hover, .lightbox-nav:hover { background: rgba(255,255,255,0.3); }

        .lightbox-counter {
                position: absolute;
                bottom: 24px;
                left: 50%;
                transform: translateX(-50%);
                color: #fff;
                font-size: 0.9rem;
                background: rgba(0,0,0,0.4);
                padding: 6px 16px;
                border-radius: 16px;
        }

        @media (max-width: 600px) {
                .gallery-main .main-image { height: 280px; }
                .gallery-thumb { width: 64px; height: 50px; }
                .detail-actions { flex-wrap: wrap; }
                .action-btn { flex: 1; justify-content: center; }
        }
</style>

</main>
{/if}

<style>
        .loading-container,
        .error-container {
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 60vh;
                background: #f9f9f9;
        }

        .loading,
        .error-message {
                text-align: center;
                color: #666;
        }

        .error-message h2 {
                color: #d32f2f;
                margin-bottom: 20px;
        }

        .error-message a {
                color: #0066cc;
                text-decoration: none;
                font-weight: 600;
        }

        .project-detail {
                background: #f9f9f9;
                padding-top: 0;
        }

        .featured-badge {
                position: absolute;
                top: 20px;
                left: 20px;
                background: rgba(212, 175, 55, 0.95);
                color: white;
                padding: 10px 20px;
                border-radius: 20px;
                font-weight: 600;
                z-index: 10;
        }

        .container {
                max-width: 1200px;
                margin: 0 auto;
                padding: 40px 20px;
        }

        .detail-grid {
                display: grid;
                grid-template-columns: 2fr 1fr;
                gap: 40px;
                margin-bottom: 60px;
        }

        .breadcrumb {
                font-size: 14px;
                color: #666;
                margin-bottom: 20px;
        }

        .breadcrumb a {
                color: #0066cc;
                text-decoration: none;
        }

        .breadcrumb a:hover {
                text-decoration: underline;
        }

        .detail-content h1 {
                font-size: 42px;
                color: #1f1810;
                margin-bottom: 15px;
        }

        .meta-info {
                margin-bottom: 30px;
        }

        .category-badge {
                display: inline-block;
                background: #d4af37;
                color: #1f1810;
                padding: 6px 14px;
                border-radius: 4px;
                font-size: 13px;
                font-weight: 600;
                margin-right: 15px;
        }

        .location {
                color: #666;
                margin: 10px 0 0 0;
        }

        .price-section {
                background: white;
                padding: 25px;
                border-radius: 8px;
                margin-bottom: 30px;
                border-left: 4px solid #0066cc;
        }

        .price {
                font-size: 36px;
                color: #0066cc;
                margin: 0;
                font-weight: 700;
        }

        .specs {
                color: #666;
                margin: 10px 0 0 0;
                font-size: 14px;
        }

        .section {
                background: white;
                padding: 30px;
                margin-bottom: 20px;
                border-radius: 8px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .section h3 {
                color: #1f1810;
                margin-top: 0;
                margin-bottom: 15px;
                font-size: 22px;
        }

        .section p {
                color: #666;
                line-height: 1.6;
                margin: 0;
        }

        .amenities-list {
                list-style: none;
                padding: 0;
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 12px;
        }

        .amenities-list li {
                color: #666;
                padding: 10px;
                background: #f5f5f5;
                border-radius: 4px;
        }

        .facts-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 20px;
        }

        .fact {
                padding: 15px;
                background: #f9f9f9;
                border-radius: 4px;
                border-left: 3px solid #d4af37;
        }

        .fact .label {
                display: block;
                color: #999;
                font-size: 12px;
                text-transform: uppercase;
                font-weight: 600;
                margin-bottom: 5px;
        }

        .fact .value {
                display: block;
                color: #1f1810;
                font-size: 16px;
                font-weight: 600;
        }

        /* Sidebar */
        .detail-sidebar {
                display: flex;
                flex-direction: column;
                gap: 20px;
        }

        .contact-card,
        .info-card {
                background: white;
                padding: 30px;
                border-radius: 8px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .contact-card h3 {
                color: #1f1810;
                margin-top: 0;
                margin-bottom: 10px;
        }

        .contact-card > p {
                color: #666;
                font-size: 14px;
                margin-bottom: 20px;
        }

        .success-message {
                background: #d4edda;
                color: #155724;
                padding: 15px;
                border-radius: 4px;
                margin-bottom: 20px;
                border: 1px solid #c3e6cb;
        }

        .form-group {
                margin-bottom: 15px;
        }

        .form-group label {
                display: block;
                color: #1f1810;
                font-weight: 600;
                margin-bottom: 6px;
                font-size: 14px;
        }

        .form-group input,
        .form-group textarea {
                width: 100%;
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-size: 14px;
                font-family: inherit;
        }

        .form-group input:focus,
        .form-group textarea:focus {
                outline: none;
                border-color: #0066cc;
                box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
        }

        .btn-submit {
                width: 100%;
                background: linear-gradient(135deg, #0066cc, #0052a3);
                color: white;
                padding: 12px;
                border: none;
                border-radius: 4px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s;
        }

        .btn-submit:hover:not(:disabled) {
                background: linear-gradient(135deg, #0052a3, #003d7a);
                transform: translateY(-2px);
        }

        .btn-submit:disabled {
                opacity: 0.6;
                cursor: not-allowed;
        }

        .info-card h4 {
                color: #1f1810;
                margin-top: 0;
                margin-bottom: 10px;
        }

        .info-card p {
                color: #666;
                font-size: 14px;
                margin: 10px 0;
        }

        .contact-info {
                margin-top: 15px;
                padding-top: 15px;
                border-top: 1px solid #eee;
        }

        .contact-info a {
                color: #0066cc;
                text-decoration: none;
                font-weight: 600;
        }

        .contact-info a:hover {
                text-decoration: underline;
        }

        /* Related Section */
        .related-section {
                margin-top: 60px;
        }

        .related-section h3 {
                color: #1f1810;
                margin-bottom: 20px;
                font-size: 24px;
        }

        .coming-soon {
                color: #999;
                font-style: italic;
                padding: 40px;
                text-align: center;
                background: white;
                border-radius: 8px;
        }

        @media (max-width: 768px) {
                .detail-grid {
                        grid-template-columns: 1fr;
                        gap: 20px;
                }

                .detail-content h1 {
                        font-size: 28px;
                }

                .price {
                        font-size: 28px;
                }

                .amenities-list {
                        grid-template-columns: 1fr;
                }

                .facts-grid {
                        grid-template-columns: 1fr;
                }

                .detail-sidebar {
                        order: -1;
                }
        }
</style>
