<script lang="ts">
        import { onMount } from 'svelte';
        import { page } from '$app/stores';
        import { goto } from '$app/navigation';
        import { favorites } from '$lib/stores/favorites';
        import { compare } from '$lib/stores/compare';

        let projects: any[] = [];
        let filteredProjects: any[] = [];
        let loading = true;
        let error = '';

        // Read ?location= from the URL to pre-filter (set by /neighborhoods cards).
        let locationFilter = $page.url.searchParams.get('location') ?? '';
        $: locationFilter = $page.url.searchParams.get('location') ?? '';

        // Demo projects - Koch Properties Listings
        const demoProjects = [
                {
                        id: 'koch-1',
                        title: '2, 3 & 4 Bedroom Apartments',
                        description: 'Modern apartments in the heart of Westlands with excellent finishes, spacious balconies, and proximity to shopping centers.',
                        location: 'Westlands, Nairobi',
                        price: '17700000',
                        bedrooms: '3',
                        bathrooms: '2',
                        imageUrl: '/lib/assets/project-1.jpg',
                        category: 'Apartment',
                        status: 'published',
                        featured: true,
                        amenities: 'Parking, Lift, Generator, Borehole, Gym, CCTV'
                },
                {
                        id: 'koch-2',
                        title: '2, 3, 4 & 5 Bedroom Apartments',
                        description: 'Spacious family apartments on Riara Road with DSQs, modern kitchen fittings, and secure gated community.',
                        location: 'Riara Road, Nairobi',
                        price: '10700000',
                        bedrooms: '3',
                        bathrooms: '2',
                        imageUrl: '/lib/assets/apartments-2.jpg',
                        category: 'Apartment',
                        status: 'published',
                        featured: false,
                        amenities: 'DSQ, Parking, Garden, Security, Play Area'
                },
                {
                        id: 'koch-3',
                        title: '3, 4 & 5 Bedroom Apartments with DSQs',
                        description: 'Luxury apartments in Kilimani featuring servant quarters, high-end finishes, and rooftop terrace with city views.',
                        location: 'Kilimani, Nairobi',
                        price: '29400000',
                        bedrooms: '4',
                        bathrooms: '3',
                        imageUrl: '/lib/assets/apartments-3.jpg',
                        category: 'Apartment',
                        status: 'published',
                        featured: true,
                        amenities: 'DSQ, Swimming Pool, Gym, Parking, Solar'
                },
                {
                        id: 'koch-4',
                        title: '1, 2 & 3 Bedroom Apartment',
                        description: 'Affordable apartments in Kilimani suitable for young professionals and small families. Close to schools and hospitals.',
                        location: 'Kilimani, Nairobi',
                        price: '5900000',
                        bedrooms: '2',
                        bathrooms: '1',
                        imageUrl: '/lib/assets/apartments-1.jpg',
                        category: 'Apartment',
                        status: 'published',
                        featured: false,
                        amenities: 'Parking, Security, Water Storage'
                },
                {
                        id: 'koch-5',
                        title: '1 Bedroom Apartment',
                        description: 'Stylish 1-bedroom apartment in Westlands perfect for singles. Modern finishes with balcony and city views.',
                        location: 'Westlands, Nairobi',
                        price: '21900000',
                        bedrooms: '1',
                        bathrooms: '1',
                        imageUrl: '/lib/assets/apartments-4.jpg',
                        category: 'Apartment',
                        status: 'published',
                        featured: false,
                        amenities: 'Gym, Parking, Rooftop Terrace, Security'
                },
                {
                        id: 'koch-6',
                        title: '5 Bedroom Villa',
                        description: 'Magnificent 5-bedroom villa in Loresho sitting on half-acre land. Features swimming pool, mature garden, and guest house.',
                        location: 'Loresho, Nairobi',
                        price: '150000000',
                        bedrooms: '5',
                        bathrooms: '6',
                        imageUrl: '/lib/assets/project-2.jpg',
                        category: 'Villa',
                        status: 'published',
                        featured: true,
                        amenities: 'Swimming Pool, Garden, Guest House, Parking, Security'
                },
                {
                        id: 'koch-7',
                        title: '4 Bedroom Villa',
                        description: 'Elegant 4-bedroom villa in Kitisuru with panoramic views. Open-plan living, modern kitchen, and expansive garden.',
                        location: 'Kitisuru, Nairobi',
                        price: '85000000',
                        bedrooms: '4',
                        bathrooms: '5',
                        imageUrl: '/lib/assets/project-3.jpg',
                        category: 'Villa',
                        status: 'published',
                        featured: true,
                        amenities: 'Garden, Parking, Staff Quarters, Security, View'
                },
                {
                        id: 'koch-8',
                        title: '4 Bedroom Townhouses',
                        description: 'Modern townhouses in Langata with shared swimming pool and playground. Perfect for families.',
                        location: 'Langata, Nairobi',
                        price: '35900000',
                        bedrooms: '4',
                        bathrooms: '4',
                        imageUrl: '/lib/assets/amenities-1.jpg',
                        category: 'Townhouse',
                        status: 'published',
                        featured: false,
                        amenities: 'Swimming Pool, Garden, Parking, Playground'
                },
                {
                        id: 'koch-9',
                        title: '3 Bedroom Apartment With DSQ',
                        description: 'Executive 3-bedroom apartment in Westlands with servant quarters. Close to Sarit Centre and international schools.',
                        location: 'Westlands, Nairobi',
                        price: '22100000',
                        bedrooms: '3',
                        bathrooms: '3',
                        imageUrl: '/lib/assets/amenities-2.jpg',
                        category: 'Apartment',
                        status: 'published',
                        featured: false,
                        amenities: 'DSQ, Parking, Lift, Generator, Security'
                },
                {
                        id: 'koch-10',
                        title: '4 Bedroom Apartment with DSQ',
                        description: 'Spacious 4-bedroom apartment in Kileleshwa with DSQ, master ensuite, and modern finishes throughout.',
                        location: 'Kileleshwa, Nairobi',
                        price: '22000000',
                        bedrooms: '4',
                        bathrooms: '4',
                        imageUrl: '/lib/assets/amenities-3.jpg',
                        category: 'Apartment',
                        status: 'published',
                        featured: false,
                        amenities: 'DSQ, Parking, Gym, Lift, Security'
                },
                {
                        id: 'koch-11',
                        title: '5 Bedroom Apartment With DSQ',
                        description: 'Luxurious 5-bedroom penthouse in Kileleshwa with panoramic views, private lift, and rooftop terrace.',
                        location: 'Kileleshwa, Nairobi',
                        price: '41000000',
                        bedrooms: '5',
                        bathrooms: '6',
                        imageUrl: '/lib/assets/amenities-4.jpg',
                        category: 'Penthouse',
                        status: 'published',
                        featured: true,
                        amenities: 'DSQ, Private Lift, Rooftop Terrace, Parking, Gym'
                },
                {
                        id: 'koch-12',
                        title: 'Studio And 1 Bedroom Apartment',
                        description: 'Compact studio and 1-bedroom units in Kilimani ideal for students and young professionals.',
                        location: 'Kilimani, Nairobi',
                        price: '6400000',
                        bedrooms: '1',
                        bathrooms: '1',
                        imageUrl: '/lib/assets/amenities-5.jpg',
                        category: 'Studio',
                        status: 'published',
                        featured: false,
                        amenities: 'Parking, Security, Internet Ready'
                }
        ];

        // Filter state
        let searchTerm = '';
        let selectedCategory = '';
        let minPrice = '';
        let maxPrice = '';
        let minBeds = '';
        let sortBy = 'featured'; // 'featured' | 'price-asc' | 'price-desc' | 'beds-desc'
        let featuredOnly = false;

        // Categories from projects
        let categories: string[] = [];
        let locations = new Set<string>();

        onMount(async () => {
                favorites.hydrate();
                compare.hydrate();
                await loadProjects();
        });

        async function loadProjects() {
                try {
                        // Check if Supabase is available
                        const { supabase } = await import('$lib/supabase');
                        if (!supabase) {
                                console.log('Supabase not available, using demo data');
                                projects = demoProjects;
                                applyFilters();
                                return;
                        }

                        const { data, error: err } = await supabase
                                .from('projects')
                                .select('*')
                                .eq('status', 'published')
                                .order('featured', { ascending: false })
                                .order('created_at', { ascending: false });

                        if (err) throw err;

                        // Use demo data if no projects in database
                        projects = (data && data.length > 0) ? data : demoProjects;

                        // Extract unique categories and locations
                        const cats = new Set<string>();
                        projects.forEach(p => {
                                if (p.category) cats.add(p.category);
                                if (p.location) locations.add(p.location);
                        });
                        categories = Array.from(cats).sort();

                        applyFilters();
                } catch (err) {
                        console.error('Error loading projects:', err);
                        // Load demo data on error
                        projects = demoProjects;

                        // Extract categories from demo data
                        const cats = new Set<string>();
                        projects.forEach(p => {
                                if (p.category) cats.add(p.category);
                                if (p.location) locations.add(p.location);
                        });
                        categories = Array.from(cats).sort();

                        applyFilters();
                } finally {
                        loading = false;
                }
        }

        function applyFilters() {
                filteredProjects = projects.filter(project => {
                        const matchesSearch = !searchTerm ||
                                project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                project.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                project.description.toLowerCase().includes(searchTerm.toLowerCase());

                        // Location filter from ?location= query param (set by /neighborhoods).
                        const matchesLocation = !locationFilter ||
                                project.location.toLowerCase().includes(locationFilter.toLowerCase());

                        const matchesCategory = !selectedCategory || project.category === selectedCategory;

                        const price = parseInt(project.price) || 0;
                        const matchesMinPrice = !minPrice || price >= parseInt(minPrice);
                        const matchesMaxPrice = !maxPrice || price <= parseInt(maxPrice);

                        const beds = parseInt(project.bedrooms) || 0;
                        const matchesBeds = !minBeds || beds >= parseInt(minBeds);

                        const matchesFeatured = !featuredOnly || project.featured === true;

                        return matchesSearch && matchesLocation && matchesCategory && matchesMinPrice && matchesMaxPrice && matchesBeds && matchesFeatured;
                });

                // Sort the filtered results
                filteredProjects = [...filteredProjects].sort((a, b) => {
                        const pa = parseInt(a.price) || 0;
                        const pb = parseInt(b.price) || 0;
                        const ba = parseInt(a.bedrooms) || 0;
                        const bb = parseInt(b.bedrooms) || 0;
                        switch (sortBy) {
                                case 'price-asc': return pa - pb;
                                case 'price-desc': return pb - pa;
                                case 'beds-desc': return bb - ba;
                                case 'featured':
                                default:
                                        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
                        }
                });
        }

        function resetFilters() {
                searchTerm = '';
                selectedCategory = '';
                minPrice = '';
                maxPrice = '';
                minBeds = '';
                sortBy = 'featured';
                featuredOnly = false;
                applyFilters();
        }

        function formatPrice(price: string) {
                return parseInt(price).toLocaleString();
        }

        // Re-apply filters whenever the URL ?location= changes (locationFilter is
        // referenced explicitly so Svelte tracks it as a reactive dependency).
        $: if (projects.length > 0 && locationFilter !== undefined) {
                applyFilters();
        }

        function clearLocationFilter() {
                // Use goto with replaceState so SvelteKit's $page store updates and
                // the reactive locationFilter re-derives (history.replaceState alone
                // wouldn't trigger the store).
                const url = new URL(window.location.href);
                url.searchParams.delete('location');
                goto(url.pathname + url.search, { replaceState: true, keepFocus: true, noScroll: true });
        }
</script>

<main class="projects-page">
        <!-- Page Header -->
        <div class="page-header">
                <div class="header-content">
                        <h1>Explore Our Properties</h1>
                        <p>Discover premium real estate opportunities across Nairobi</p>
                </div>
        </div>

        <div class="container">
                <div class="detail-grid">
                        <!-- Sidebar Filters -->
                        <aside class="filters-sidebar">
                                <div class="filters">
                                        <h3>🔍 Search & Filter</h3>

                                        <!-- Search -->
                                        <div class="filter-group">
                                                <label for="search">Search by title or location</label>
                                                <input
                                                        id="search"
                                                        type="text"
                                                        bind:value={searchTerm}
                                                        on:change={applyFilters}
                                                        placeholder="Enter keyword..."
                                                />
                                        </div>

                                        <!-- Category -->
                                        {#if categories.length > 0}
                                                <div class="filter-group">
                                                        <label for="category">Category</label>
                                                        <select
                                                                id="category"
                                                                bind:value={selectedCategory}
                                                                on:change={applyFilters}
                                                        >
                                                                <option value="">All Categories</option>
                                                                {#each categories as cat}
                                                                        <option value={cat}>{cat}</option>
                                                                {/each}
                                                        </select>
                                                </div>
                                        {/if}

                                        <!-- Min Bedrooms -->
                                        <div class="filter-group">
                                                <label for="bedrooms">Minimum Bedrooms</label>
                                                <select
                                                        id="bedrooms"
                                                        bind:value={minBeds}
                                                        on:change={applyFilters}
                                                >
                                                        <option value="">All</option>
                                                        <option value="1">1+</option>
                                                        <option value="2">2+</option>
                                                        <option value="3">3+</option>
                                                        <option value="4">4+</option>
                                                        <option value="5">5+</option>
                                                </select>
                                        </div>

                                        <!-- Min Price -->
                                        <div class="filter-group">
                                                <label for="minPrice">Min Price (KES)</label>
                                                <input
                                                        id="minPrice"
                                                        type="number"
                                                        bind:value={minPrice}
                                                        on:change={applyFilters}
                                                        placeholder="0"
                                                />
                                        </div>

                                        <!-- Max Price -->
                                        <div class="filter-group">
                                                <label for="maxPrice">Max Price (KES)</label>
                                                <input
                                                        id="maxPrice"
                                                        type="number"
                                                        bind:value={maxPrice}
                                                        on:change={applyFilters}
                                                        placeholder="0"
                                                />
                                        </div>

                                        <!-- Sort -->


                                        <div class="filter-group">


                                                <label for="sort">Sort by</label>


                                                <select id="sort" bind:value={sortBy} on:change={applyFilters}>


                                                        <option value="featured">Featured first</option>


                                                        <option value="price-asc">Price: Low to High</option>


                                                        <option value="price-desc">Price: High to Low</option>


                                                        <option value="beds-desc">Most Bedrooms</option>


                                                </select>


                                        </div>



                                        <!-- Featured-only toggle -->


                                        <div class="filter-group toggle-group">


                                                <label for="featured-only" class="toggle-label">


                                                        <input id="featured-only" type="checkbox" bind:checked={featuredOnly} on:change={applyFilters} />


                                                        <span class="toggle-switch" aria-hidden="true"></span>


                                                        <span>Featured only ⭐</span>


                                                </label>


                                        </div>



                                        <!-- Clear Filters -->


                                        {#if searchTerm || selectedCategory || minPrice || maxPrice || minBeds || featuredOnly}


                                                <button class="btn-clear" on:click={resetFilters}>Clear Filters</button>


                                        {/if}
                                </div>
                        </aside>

                        <!-- Main Content -->
                        <section class="projects-content">
                                {#if loading}
                                        <!-- Skeleton loader shimmer -->
                                        <div class="results-header">
                                                <p class="results-info">Loading properties…</p>
                                        </div>
                                        <div class="projects-grid">
                                                {#each Array(6) as _, i}
                                                        <div class="project-card skeleton-card" aria-hidden="true">
                                                                <div class="card-image skeleton-shimmer"></div>
                                                                <div class="card-content">
                                                                        <div class="skeleton-line w-70"></div>
                                                                        <div class="skeleton-line w-50"></div>
                                                                        <div class="skeleton-line w-90"></div>
                                                                        <div class="skeleton-line w-40"></div>
                                                                </div>
                                                        </div>
                                                {/each}
                                        </div>
                                {:else if error}
                                        <div class="error-message">{error}</div>
                                {:else}
                                        <div class="results-header">
                                                <p class="results-info">
                                                        Showing <span class="badge">{filteredProjects.length}</span> of
                                                        <span class="badge">{projects.length}</span> properties
                                                </p>
                                        </div>

                                {#if locationFilter}

                                        <div class="location-banner" role="status">

                                                <span>📍 Filtering by area: <strong>{locationFilter}</strong></span>

                                                <button type="button" class="location-clear" on:click={clearLocationFilter}>✕ Clear</button>

                                        </div>

                                {/if}

                                        {#if filteredProjects.length === 0}
                                                <div class="no-results">
                                                        <p>📭 No properties match your search criteria</p>
                                                        <button class="btn-reset" on:click={resetFilters}>Clear Filters</button>
                                                </div>
                                        {:else}
                                                <div class="projects-grid">
                                                                                                                {#each filteredProjects as project (project.id)}
                                                                                                                        <div class="project-card">
                                                                                                                                <div class="card-image">
                                                                                                                                        <a href="/projects/{project.id}" class="card-link">
                                                                                                                                                <img src={project.imageUrl} alt={project.title} />
                                                                                                                                        </a>
                                                                                                                                        {#if project.featured}
                                                                                                                                                <div class="featured-badge">⭐ Featured</div>
                                                                                                                                        {/if}
                                                                                                                                        <button type="button" class="card-fav-btn" class:active={$favorites.includes(project.id)} aria-label={$favorites.includes(project.id) ? 'Remove from favorites' : 'Add to favorites'} aria-pressed={$favorites.includes(project.id)} on:click|stopPropagation={() => favorites.toggle(project.id)}>
                                                                                                                                                <svg width="18" height="18" viewBox="0 0 24 24" fill={$favorites.includes(project.id) ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
                                                                                                                                        </button>
                                                                                                                                        <button type="button" class="card-compare-btn" class:active={$compare.some((p) => p.id === project.id)} class:disabled={$compare.length >= 3 && !$compare.some((p) => p.id === project.id)} aria-label={$compare.some((p) => p.id === project.id) ? 'Remove from comparison' : 'Add to comparison'} aria-pressed={$compare.some((p) => p.id === project.id)} on:click|stopPropagation={() => compare.toggle(project)}>
                                                                                                                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="18" rx="1" /><rect x="14" y="3" width="7" height="18" rx="1" /></svg>
                                                                                                                                        </button>
                                                                                                                                </div>
                                                                                                                                <a href="/projects/{project.id}" class="card-link">
                                                                                                                                        <div class="card-content">
                                                                                                                                                <div class="card-header">
                                                                                                                                                        <h3>{project.title}</h3>
                                                                                                                                                        <span class="category">{project.category}</span>
                                                                                                                                                </div>
                                                                                                                                                <p class="location">📍 {project.location}</p>
                                                                                                                                                <div class="card-specs">
                                                                                                                                                        {#if project.bedrooms}<span>🛏️ {project.bedrooms} Beds</span>{/if}
                                                                                                                                                        {#if project.bathrooms}<span>🚿 {project.bathrooms} Baths</span>{/if}
                                                                                                                                                </div>
                                                                                                                                                {#if project.amenities}<p class="amenities">{project.amenities.split(',').slice(0, 2).join(', ')}...</p>{/if}
                                                                                                                                                <div class="card-footer">
                                                                                                                                                        <span class="price">KES {formatPrice(project.price)}</span>
                                                                                                                                                        <span class="view-btn">View Details →</span>
                                                                                                                                                </div>
                                                                                                                                        </div>
                                                                                                                                </a>
                                                                                                                        </div>
                                                                                                                {/each}
                                                                                                        </div>
                                        {/if}
                                {/if}
                        </section>
                </div>
        </div>
</main>

<style>
        :global(body) {
                background: #f9f9f9;
        }

        .projects-page {
                padding-top: 0;
        }

        .page-header {
                background: linear-gradient(135deg, #1f1810 0%, #3d3628 100%);
                color: white;
                padding: 60px 20px;
                text-align: center;
        }

        .header-content h1 {
                font-size: 48px;
                margin: 0;
                margin-bottom: 15px;
                font-weight: 700;
        }

        .header-content p {
                font-size: 18px;
                margin: 0;
                color: rgba(255, 255, 255, 0.8);
        }

        .container {
                max-width: 1400px;
                margin: 0 auto;
                padding: 40px 20px;
        }

        .detail-grid {
                display: grid;
                grid-template-columns: 280px 1fr;
                gap: 40px;
        }

        /* Sidebar Filters */
        .filters-sidebar {
                position: sticky;
                top: 20px;
        }

        .filters {
                background: white;
                padding: 25px;
                border-radius: 8px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
                border-top: 4px solid #d4af37;
        }

        .filters h3 {
                margin-top: 0;
                margin-bottom: 20px;
                color: #1f1810;
                font-size: 18px;
        }

        .filter-group {
                margin-bottom: 18px;
        }

        .filter-group label {
                display: block;
                color: #1f1810;
                font-size: 14px;
                font-weight: 600;
                margin-bottom: 6px;
        }

        .filter-group input,
        .filter-group select {
                width: 100%;
                padding: 8px 10px;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-size: 14px;
                background: white;
        }

        .filter-group input:focus,
        .filter-group select:focus {
                outline: none;
                border-color: #0066cc;
                box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
        }

        .btn-clear {
                width: 100%;
                background: #d4af37;
                color: #1f1810;
                padding: 10px;
                border: none;
                border-radius: 4px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
                margin-top: 10px;
        }

        .btn-clear:hover {
                background: #c4991c;
                transform: translateY(-1px);
        }

        /* Toggle switch (featured-only) */
        .toggle-group {
                margin-top: 8px;
        }

        .toggle-label {
                display: flex;
                align-items: center;
                gap: 10px;
                cursor: pointer;
                font-size: 0.9rem;
                color: #1f1810;
                user-select: none;
        }

        .toggle-label input[type='checkbox'] {
                position: absolute;
                opacity: 0;
                width: 0;
                height: 0;
        }

        .toggle-switch {
                position: relative;
                width: 42px;
                height: 24px;
                background: #ccc;
                border-radius: 12px;
                transition: background 0.25s ease;
                flex-shrink: 0;
        }

        .toggle-switch::before {
                content: '';
                position: absolute;
                top: 3px;
                left: 3px;
                width: 18px;
                height: 18px;
                background: #fff;
                border-radius: 50%;
                transition: transform 0.25s ease;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
        }

        .toggle-label input:checked ~ .toggle-switch {
                background: linear-gradient(135deg, #d4af37 0%, #b8941f 100%);
        }

        .toggle-label input:checked ~ .toggle-switch::before {
                transform: translateX(18px);
        }

        .toggle-label input:focus-visible ~ .toggle-switch {
                outline: 2px solid #d4af37;
                outline-offset: 2px;
        }

        /* Main Content */
        .projects-content {
                padding: 0;
        }

        .results-header {
                margin-bottom: 30px;
                display: flex;
                align-items: center;
                justify-content: space-between;
        }

        .results-info {
                color: #666;
                font-size: 14px;
                margin: 0;
        }

        .location-banner {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 12px;
                background: linear-gradient(135deg, rgba(212, 175, 55, 0.12), rgba(212, 175, 55, 0.06));
                border: 1px solid rgba(212, 175, 55, 0.35);
                color: #1f1810;
                padding: 12px 18px;
                border-radius: 10px;
                margin-bottom: 20px;
                font-size: 0.9rem;
                animation: banner-slide 0.3s ease;
        }

        @keyframes banner-slide {
                from { opacity: 0; transform: translateY(-8px); }
                to { opacity: 1; transform: translateY(0); }
        }

        .location-banner strong {
                color: #8a6d10;
        }

        .location-clear {
                background: rgba(31, 24, 16, 0.08);
                color: #1f1810;
                border: none;
                padding: 6px 14px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 0.8rem;
                font-weight: 600;
                transition: all 0.2s;
                flex-shrink: 0;
        }

        .location-clear:hover {
                background: #1f1810;
                color: #fff;
        }

        .badge {
                background: #d4af37;
                color: #1f1810;
                padding: 2px 8px;
                border-radius: 3px;
                font-weight: 600;
        }

        .error-message {
                background: #f8d7da;
                color: #721c24;
                padding: 15px 20px;
                border-radius: 4px;
                border: 1px solid #f5c6cb;
                margin-bottom: 20px;
        }

        .no-results {
                text-align: center;
                padding: 80px 20px;
                background: white;
                border-radius: 8px;
                color: #999;
        }

        .no-results p {
                font-size: 18px;
                margin-bottom: 20px;
        }

        .btn-reset {
                background: #0066cc;
                color: white;
                padding: 10px 20px;
                border: none;
                border-radius: 4px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
        }

        .btn-reset:hover {
                background: #0052a3;
                transform: translateY(-2px);
        }

        /* Projects Grid */
        .projects-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                gap: 25px;
        }

        .project-card {
                background: white;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
                transition: all 0.3s;
        }

        .project-card:hover {
                transform: translateY(-8px);
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        }

        .card-link {
                text-decoration: none;
                color: inherit;
                display: block;
        }

        .card-image {
                position: relative;
                height: 220px;
                overflow: hidden;
                background: #ddd;
        }

        .card-image img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                transition: transform 0.3s;
        }

        .project-card:hover .card-image img {
                transform: scale(1.08);
        }

        .featured-badge {
                position: absolute;
                top: 10px;
                left: 10px;
                background: rgba(212, 175, 55, 0.95);
                color: white;
                padding: 6px 12px;
                border-radius: 4px;
                font-size: 13px;
                font-weight: 600;
                z-index: 10;
        }

        .card-content {
                padding: 20px;
        }

        .card-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 10px;
                gap: 10px;
        }

        .card-header h3 {
                margin: 0;
                color: #1f1810;
                font-size: 18px;
                flex: 1;
        }

        .category {
                background: #d4af37;
                color: #1f1810;
                padding: 4px 10px;
                border-radius: 3px;
                font-size: 12px;
                font-weight: 600;
                white-space: nowrap;
        }

        .location {
                color: #666;
                font-size: 13px;
                margin: 8px 0;
        }

        .card-specs {
                display: flex;
                gap: 15px;
                margin: 12px 0;
                font-size: 13px;
                color: #666;
        }

        .amenities {
                color: #999;
                font-size: 12px;
                margin: 10px 0;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
        }

        .card-footer {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-top: 15px;
                padding-top: 15px;
                border-top: 1px solid #eee;
        }

        .price {
                font-weight: 700;
                color: #0066cc;
                font-size: 16px;
        }

        .view-btn {
                color: #0066cc;
                font-weight: 600;
                font-size: 13px;
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
                .page-header {
                        padding: 40px 20px;
                }

                .header-content h1 {
                        font-size: 32px;
                }

                .header-content p {
                        font-size: 16px;
                }

                .detail-grid {
                        grid-template-columns: 1fr;
                        gap: 20px;
                }

                .filters-sidebar {
                        position: static;
                        order: -1;
                }

                .filters {
                        margin-bottom: 20px;
                }

                .projects-grid {
                        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                }

                .card-header h3 {
                        font-size: 16px;
                }
        }

        /* ---- Favorite + Compare card buttons ---- */
        .card-image {
                position: relative;
        }

        .card-fav-btn,
        .card-compare-btn {
                position: absolute;
                top: 12px;
                width: 38px;
                height: 38px;
                border-radius: 50%;
                border: none;
                background: rgba(255, 255, 255, 0.92);
                color: #1f1810;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.25s ease;
                backdrop-filter: blur(4px);
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
                z-index: 5;
        }

        .card-fav-btn {
                right: 12px;
        }

        .card-compare-btn {
                right: 56px;
        }

        .card-fav-btn:hover,
        .card-compare-btn:hover {
                background: #fff;
                transform: scale(1.12);
                box-shadow: 0 4px 14px rgba(0, 0, 0, 0.22);
        }

        .card-fav-btn.active {
                background: #dc3545;
                color: #fff;
        }

        .card-fav-btn.active:hover {
                background: #c82333;
        }

        .card-compare-btn.active {
                background: #d4af37;
                color: #1f1810;
        }

        .card-compare-btn.disabled {
                opacity: 0.4;
                cursor: not-allowed;
        }

        .card-compare-btn.disabled:hover {
                transform: none;
        }

        /* ---- Skeleton shimmer loaders ---- */
        .skeleton-card {
                pointer-events: none;
        }

        .skeleton-shimmer,
        .skeleton-line {
                background: linear-gradient(90deg, #eee 25%, #f5f5f5 50%, #eee 75%);
                background-size: 200% 100%;
                animation: shimmer 1.4s infinite linear;
                border-radius: 4px;
        }

        .skeleton-shimmer {
                width: 100%;
                height: 200px;
                border-radius: 0;
        }

        .skeleton-line {
                height: 14px;
                margin-bottom: 10px;
        }

        .skeleton-line.w-40 { width: 40%; }
        .skeleton-line.w-50 { width: 50%; }
        .skeleton-line.w-70 { width: 70%; }
        .skeleton-line.w-90 { width: 90%; }

        @keyframes shimmer {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
        }

        /* ---- Card hover micro-interaction ---- */
        .project-card {
                transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .project-card:hover {
                transform: translateY(-6px);
                box-shadow: 0 12px 32px rgba(31, 24, 16, 0.15);
        }

        .project-card:hover .card-image img {
                transform: scale(1.05);
        }

        .card-image img {
                transition: transform 0.4s ease;
        }
</style>
