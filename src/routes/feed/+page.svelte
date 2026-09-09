<script lang="ts">
        import { onMount } from 'svelte';
        import { extractHashtags, formatInstagramDate, truncateCaption } from '$lib/data/instagram';

        let posts: any[] = [];
        let loading = true;
        let error = '';

        // Demo posts (shown when Supabase is unavailable or the table is empty).
        const demoPosts = [
                {
                        id: 'demo-1',
                        instagram_id: 'demo-1',
                        caption: '🏙️ Luxury living in Westlands. Spacious 3BR apartment with panoramic city views, DSQ, and rooftop terrace. PM us for a viewing!',
                        media_url: '/lib/assets/project-1.jpg',
                        permalink: 'https://www.instagram.com/p/DbYLU5YNbyA',
                        posted_at: '2026-07-29T10:00:00Z',
                        tags: ['Nairobi', 'Westlands', 'LuxuryLiving']
                },
                {
                        id: 'demo-2',
                        instagram_id: 'demo-2',
                        caption: '🏡 BUILD YOUR DREAM LUXURY HAVEN ON KIAMBU ROAD. Half-acre plots available with ready title deeds. #RealEstate #Kenya #Investment',
                        media_url: '/lib/assets/project-2.jpg',
                        permalink: 'https://www.instagram.com/p/DbbPDIZlojl',
                        posted_at: '2026-07-30T14:00:00Z',
                        tags: ['RealEstate', 'Kenya', 'Investment', 'KiambuRoad']
                },
                {
                        id: 'demo-3',
                        instagram_id: 'demo-3',
                        caption: '✨ Modern sanctuary awaits. Axiom Heights — where contemporary design meets everyday comfort. #Kilimani #ApartmentForSale',
                        media_url: '/lib/assets/apartments-3.jpg',
                        permalink: 'https://www.instagram.com/',
                        posted_at: '2026-07-16T09:00:00Z',
                        tags: ['Kilimani', 'ApartmentForSale']
                },
                {
                        id: 'demo-4',
                        instagram_id: 'demo-4',
                        caption: '🏙️ Luxury Apartments in Kileleshwa, Kilimani, Westlands & Lavington. Spacious 3BR + DSQ + Study. DM for pricing and viewing schedules.',
                        media_url: '/lib/assets/amenities-4.jpg',
                        permalink: 'https://www.instagram.com/',
                        posted_at: '2026-07-10T12:00:00Z',
                        tags: ['Kileleshwa', 'Kilimani', 'Westlands', 'Lavington']
                },
                {
                        id: 'demo-5',
                        instagram_id: 'demo-5',
                        caption: '🌿 Serene living in Karen. 5-bedroom villa on half-acre with mature gardens, swimming pool, and guest house. #Karen #LuxuryVilla #Nairobi',
                        media_url: '/lib/assets/about-img-1.jpg',
                        permalink: 'https://www.instagram.com/',
                        posted_at: '2026-07-05T08:00:00Z',
                        tags: ['Karen', 'LuxuryVilla', 'Nairobi']
                },
                {
                        id: 'demo-6',
                        instagram_id: 'demo-6',
                        caption: '🔑 New listing in Kitisuru! Elegant 4BR villa with panoramic views. Open-plan living, modern kitchen. Schedule your viewing today.',
                        media_url: '/lib/assets/project-3.jpg',
                        permalink: 'https://www.instagram.com/',
                        posted_at: '2026-06-28T15:00:00Z',
                        tags: ['Kitisuru', 'Villa', 'NewListing']
                }
        ];

        onMount(async () => {
                await loadPosts();
        });

        async function loadPosts() {
                loading = true;
                try {
                        const { supabase } = await import('$lib/supabase');
                        if (!supabase) {
                                posts = demoPosts;
                                loading = false;
                                return;
                        }
                        const { data, error: err } = await supabase
                                .from('instagram_posts')
                                .select('*')
                                .order('posted_at', { ascending: false })
                                .limit(12);

                        if (err) throw err;
                        posts = (data && data.length > 0) ? data : demoPosts;
                } catch {
                        posts = demoPosts;
                } finally {
                        loading = false;
                }
        }
</script>

<svelte:head>
        <title>Social Feed | Delima Realtors</title>
        <meta name="description" content="Latest Instagram posts from Delima Realtors — property listings, neighborhood highlights, and real estate insights from Nairobi." />
</svelte:head>

<main class="feed-page">
        <div class="page-hero">
                <div class="hero-overlay"></div>
                <div class="hero-content">
                        <h1>📸 Social Feed</h1>
                        <p>Latest from our Instagram — new listings, neighborhood highlights, and market insights</p>
                        <a href="https://www.instagram.com/delima_realtors" target="_blank" rel="noopener noreferrer" class="follow-btn">
                                Follow @delima_realtors
                        </a>
                </div>
        </div>

        <div class="container">
                {#if loading}
                        <div class="state-message">Loading feed…</div>
                {:else if posts.length === 0}
                        <div class="empty-state">
                                <p>No posts yet. Follow us on Instagram for the latest!</p>
                        </div>
                {:else}
                        <div class="feed-grid">
                                {#each posts as post (post.id)}
                                        <article class="feed-card">
                                                <a href={post.permalink} target="_blank" rel="noopener noreferrer" class="feed-image-link">
                                                        <img src={post.media_url} alt={post.caption.slice(0, 80)} loading="lazy" />
                                                        <span class="ig-badge" aria-hidden="true">
                                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                                                        </span>
                                                </a>
                                                <div class="feed-body">
                                                        <p class="caption">{truncateCaption(post.caption)}</p>
                                                        {#if post.tags && post.tags.length > 0}
                                                                <div class="tags">
                                                                        {#each post.tags.slice(0, 4) as tag}
                                                                                <span class="tag">#{tag}</span>
                                                                        {/each}
                                                                </div>
                                                        {/if}
                                                        <div class="feed-meta">
                                                                <span class="date">{formatInstagramDate(post.posted_at)}</span>
                                                                <a href={post.permalink} target="_blank" rel="noopener noreferrer" class="view-on-ig">View on Instagram →</a>
                                                        </div>
                                                </div>
                                        </article>
                                {/each}
                        </div>
                {/if}
        </div>
</main>

<style>
        .feed-page {
                background: #f9f9f9;
                min-height: 100vh;
        }

        .page-hero {
                position: relative;
                min-height: 300px;
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
                font-size: 2.4rem;
                margin: 0 0 10px;
        }

        .hero-content p {
                color: rgba(255, 255, 255, 0.7);
                margin: 0 0 20px;
        }

        .follow-btn {
                display: inline-block;
                background: linear-gradient(135deg, #d4af37 0%, #b8941f 100%);
                color: #1f1810;
                padding: 12px 32px;
                border-radius: 8px;
                text-decoration: none;
                font-weight: 700;
                font-size: 0.9rem;
                transition: transform 0.2s, box-shadow 0.2s;
        }

        .follow-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 18px rgba(212, 175, 55, 0.5);
        }

        .container {
                max-width: 1100px;
                margin: 0 auto;
                padding: 40px 20px 60px;
        }

        .state-message {
                text-align: center;
                padding: 60px;
                color: #666;
                font-size: 1.1rem;
        }

        .empty-state {
                text-align: center;
                padding: 60px 20px;
                color: #999;
        }

        .feed-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                gap: 24px;
        }

        .feed-card {
                background: #fff;
                border-radius: 14px;
                overflow: hidden;
                box-shadow: 0 4px 16px rgba(31, 24, 16, 0.08);
                transition: transform 0.3s, box-shadow 0.3s;
        }

        .feed-card:hover {
                transform: translateY(-6px);
                box-shadow: 0 12px 36px rgba(31, 24, 16, 0.15);
        }

        .feed-image-link {
                display: block;
                position: relative;
        }

        .feed-card img {
                width: 100%;
                height: 280px;
                object-fit: cover;
                display: block;
                transition: transform 0.4s;
        }

        .feed-card:hover img {
                transform: scale(1.05);
        }

        .ig-badge {
                position: absolute;
                top: 12px;
                right: 12px;
                width: 32px;
                height: 32px;
                border-radius: 50%;
                background: rgba(0, 0, 0, 0.6);
                backdrop-filter: blur(6px);
                color: #fff;
                display: flex;
                align-items: center;
                justify-content: center;
        }

        .feed-body {
                padding: 18px;
        }

        .caption {
                color: #333;
                font-size: 0.88rem;
                line-height: 1.6;
                margin: 0 0 12px;
        }

        .tags {
                display: flex;
                flex-wrap: wrap;
                gap: 6px;
                margin-bottom: 14px;
        }

        .tag {
                background: rgba(212, 175, 55, 0.1);
                color: #8a6d10;
                padding: 3px 10px;
                border-radius: 12px;
                font-size: 0.72rem;
                font-weight: 500;
        }

        .feed-meta {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 8px;
        }

        .date {
                font-size: 0.78rem;
                color: #999;
        }

        .view-on-ig {
                font-size: 0.78rem;
                color: #d4af37;
                text-decoration: none;
                font-weight: 600;
                white-space: nowrap;
        }

        .view-on-ig:hover {
                text-decoration: underline;
        }

        @media (max-width: 600px) {
                .hero-content h1 {
                        font-size: 1.7rem;
                }
                .feed-grid {
                        grid-template-columns: 1fr;
                }
        }
</style>
