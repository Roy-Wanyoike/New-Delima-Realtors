<script lang="ts">
	import { onMount } from 'svelte';
	import { favorites } from '$lib/stores/favorites';
	import type { Project } from '$lib/types';

	let loading = true;
	let favProjects: Project[] = [];

	const demoProjects: Project[] = [
		{ id: 'koch-1', title: '2, 3 & 4 Bedroom Apartments', description: 'Modern apartments in the heart of Westlands.', location: 'Westlands, Nairobi', price: '17700000', bedrooms: '3', bathrooms: '2', imageUrl: '/lib/assets/project-1.jpg', category: 'Apartment', status: 'published', featured: true, amenities: 'Parking, Lift, Generator, Borehole, Gym, CCTV' },
		{ id: 'koch-2', title: '2, 3, 4 & 5 Bedroom Apartments', description: 'Spacious family apartments on Riara Road.', location: 'Riara Road, Nairobi', price: '10700000', bedrooms: '3', bathrooms: '2', imageUrl: '/lib/assets/apartments-2.jpg', category: 'Apartment', status: 'published', featured: false, amenities: 'DSQ, Parking, Garden, Security, Play Area' },
		{ id: 'koch-3', title: '3, 4 & 5 Bedroom Apartments with DSQs', description: 'Luxury apartments in Kilimani.', location: 'Kilimani, Nairobi', price: '29400000', bedrooms: '4', bathrooms: '3', imageUrl: '/lib/assets/apartments-3.jpg', category: 'Apartment', status: 'published', featured: true, amenities: 'DSQ, Swimming Pool, Gym, Parking, Solar' },
		{ id: 'koch-4', title: '1, 2 & 3 Bedroom Apartment', description: 'Affordable apartments in Kilimani.', location: 'Kilimani, Nairobi', price: '5900000', bedrooms: '2', bathrooms: '1', imageUrl: '/lib/assets/apartments-1.jpg', category: 'Apartment', status: 'published', featured: false, amenities: 'Parking, Security, Water Storage' },
		{ id: 'koch-5', title: '1 Bedroom Apartment', description: 'Stylish 1-bedroom apartment in Westlands.', location: 'Westlands, Nairobi', price: '21900000', bedrooms: '1', bathrooms: '1', imageUrl: '/lib/assets/apartments-4.jpg', category: 'Apartment', status: 'published', featured: false, amenities: 'Gym, Parking, Rooftop Terrace, Security' },
		{ id: 'koch-6', title: '5 Bedroom Villa', description: 'Magnificent villa in Loresho.', location: 'Loresho, Nairobi', price: '150000000', bedrooms: '5', bathrooms: '6', imageUrl: '/lib/assets/project-2.jpg', category: 'Villa', status: 'published', featured: true, amenities: 'Swimming Pool, Garden, Guest House, Parking, Security' },
		{ id: 'koch-7', title: '4 Bedroom Villa', description: 'Elegant villa in Kitisuru.', location: 'Kitisuru, Nairobi', price: '85000000', bedrooms: '4', bathrooms: '5', imageUrl: '/lib/assets/project-3.jpg', category: 'Villa', status: 'published', featured: true, amenities: 'Garden, Parking, Staff Quarters, Security, View' },
		{ id: 'koch-8', title: '4 Bedroom Townhouses', description: 'Modern townhouses in Langata.', location: 'Langata, Nairobi', price: '35900000', bedrooms: '4', bathrooms: '4', imageUrl: '/lib/assets/amenities-1.jpg', category: 'Townhouse', status: 'published', featured: false, amenities: 'Swimming Pool, Garden, Parking, Playground' },
		{ id: 'koch-9', title: '3 Bedroom Apartment With DSQ', description: 'Executive apartment in Westlands.', location: 'Westlands, Nairobi', price: '22100000', bedrooms: '3', bathrooms: '3', imageUrl: '/lib/assets/amenities-2.jpg', category: 'Apartment', status: 'published', featured: false, amenities: 'DSQ, Parking, Lift, Generator, Security' },
		{ id: 'koch-10', title: '4 Bedroom Apartment with DSQ', description: 'Spacious apartment in Kileleshwa.', location: 'Kileleshwa, Nairobi', price: '22000000', bedrooms: '4', bathrooms: '4', imageUrl: '/lib/assets/amenities-3.jpg', category: 'Apartment', status: 'published', featured: false, amenities: 'DSQ, Parking, Gym, Lift, Security' },
		{ id: 'koch-11', title: '5 Bedroom Apartment With DSQ', description: 'Luxurious penthouse in Kileleshwa.', location: 'Kileleshwa, Nairobi', price: '41000000', bedrooms: '5', bathrooms: '6', imageUrl: '/lib/assets/amenities-4.jpg', category: 'Penthouse', status: 'published', featured: true, amenities: 'DSQ, Private Lift, Rooftop Terrace, Parking, Gym' },
		{ id: 'koch-12', title: 'Studio And 1 Bedroom Apartment', description: 'Compact units in Kilimani.', location: 'Kilimani, Nairobi', price: '6400000', bedrooms: '1', bathrooms: '1', imageUrl: '/lib/assets/amenities-5.jpg', category: 'Studio', status: 'published', featured: false, amenities: 'Parking, Security, Internet Ready' }
	];

	onMount(async () => {
		favorites.hydrate();
		await loadFavorites();
	});

	async function loadFavorites() {
		loading = true;
		try {
			const { supabase } = await import('$lib/supabase');
			const ids = $favorites;
			if (ids.length === 0) {
				favProjects = [];
				loading = false;
				return;
			}
			if (supabase) {
				const { data, error } = await supabase
					.from('projects')
					.select('*')
					.in('id', ids)
					.eq('status', 'published');
				if (!error && data && data.length > 0) {
					favProjects = data;
					loading = false;
					return;
				}
			}
			favProjects = demoProjects.filter((p) => ids.includes(p.id));
		} catch {
			favProjects = demoProjects.filter((p) => $favorites.includes(p.id));
		} finally {
			loading = false;
		}
	}

	function formatPrice(price: string) {
		return parseInt(price).toLocaleString();
	}

	function clearAll() {
		favorites.clear();
		favProjects = [];
	}

	$: if (!loading && $favorites.length !== favProjects.length) {
		loadFavorites();
	}
</script>

<svelte:head>
	<title>Saved Properties | Delima Realtors</title>
	<meta name="description" content="Your saved and favorited properties on Delima Realtors." />
</svelte:head>

<main class="favorites-page">
	<div class="page-header">
		<div class="header-content">
			<h1>❤️ Your Saved Properties</h1>
			<p>Properties you've hearted for later review</p>
		</div>
	</div>

	<div class="container">
		{#if loading}
			<div class="state-message">Loading your favorites…</div>
		{:else if favProjects.length === 0}
			<div class="empty-state">
				<div class="empty-icon">💔</div>
				<h2>No saved properties yet</h2>
				<p>Tap the heart icon on any property to save it here for quick access.</p>
				<a href="/projects" class="btn-primary">Browse Properties</a>
			</div>
		{:else}
			<div class="favorites-toolbar">
				<p class="count">{favProjects.length} saved {favProjects.length === 1 ? 'property' : 'properties'}</p>
				<button type="button" class="btn-clear-all" on:click={clearAll}>Clear All</button>
			</div>

			<div class="favorites-grid">
				{#each favProjects as project (project.id)}
					<div class="fav-card">
						<div class="card-image">
							<a href="/projects/{project.id}">
								<img src={project.imageUrl} alt={project.title} />
							</a>
							<button
								type="button"
								class="fav-remove"
								aria-label="Remove from favorites"
								on:click={() => favorites.toggle(project.id)}
							>
								<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
							</button>
							{#if project.featured}
								<div class="featured-badge">⭐ Featured</div>
							{/if}
						</div>
						<a href="/projects/{project.id}" class="card-body">
							<h3>{project.title}</h3>
							<p class="location">📍 {project.location}</p>
							<div class="specs">
								{#if project.bedrooms}<span>🛏️ {project.bedrooms}</span>{/if}
								{#if project.bathrooms}<span>🚿 {project.bathrooms}</span>{/if}
							</div>
							<p class="price">KES {formatPrice(project.price)}</p>
						</a>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</main>

<style>
	.favorites-page {
		min-height: 70vh;
		background: #f9f9f9;
		padding-bottom: 60px;
	}

	.page-header {
		background: linear-gradient(135deg, #1f1810 0%, #3d2f25 100%);
		color: #fff;
		padding: 50px 20px;
		text-align: center;
	}

	.page-header h1 {
		margin: 0 0 8px;
		font-size: 2rem;
	}

	.page-header p {
		color: rgba(255, 255, 255, 0.7);
		margin: 0;
	}

	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 30px 20px;
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
		background: #fff;
		border-radius: 12px;
		box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
	}

	.empty-icon {
		font-size: 4rem;
		margin-bottom: 16px;
	}

	.empty-state h2 {
		color: #1f1810;
		margin: 0 0 8px;
	}

	.empty-state p {
		color: #666;
		margin: 0 0 24px;
	}

	.btn-primary {
		display: inline-block;
		background: linear-gradient(135deg, #d4af37 0%, #b8941f 100%);
		color: #1f1810;
		padding: 12px 32px;
		border-radius: 8px;
		text-decoration: none;
		font-weight: 600;
		transition: transform 0.2s, box-shadow 0.2s;
	}

	.btn-primary:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 16px rgba(212, 175, 55, 0.4);
	}

	.favorites-toolbar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 24px;
	}

	.count {
		color: #1f1810;
		font-weight: 600;
		margin: 0;
	}

	.btn-clear-all {
		background: #fee;
		color: #c33;
		border: 1px solid #fcc;
		padding: 8px 16px;
		border-radius: 6px;
		cursor: pointer;
		font-size: 0.85rem;
		font-weight: 600;
		transition: all 0.2s;
	}

	.btn-clear-all:hover {
		background: #dc3545;
		color: #fff;
		border-color: #dc3545;
	}

	.favorites-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 20px;
	}

	.fav-card {
		background: #fff;
		border-radius: 10px;
		overflow: hidden;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
		transition: transform 0.3s, box-shadow 0.3s;
	}

	.fav-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
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
		transition: transform 0.4s;
	}

	.fav-card:hover .card-image img {
		transform: scale(1.05);
	}

	.fav-remove {
		position: absolute;
		top: 10px;
		right: 10px;
		width: 34px;
		height: 34px;
		border-radius: 50%;
		border: none;
		background: #dc3545;
		color: #fff;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.2s;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
	}

	.fav-remove:hover {
		background: #c82333;
		transform: scale(1.1);
	}

	.featured-badge {
		position: absolute;
		top: 10px;
		left: 10px;
		background: rgba(212, 175, 55, 0.95);
		color: #1f1810;
		padding: 4px 10px;
		border-radius: 4px;
		font-size: 11px;
		font-weight: 600;
	}

	.card-body {
		display: block;
		padding: 16px;
		text-decoration: none;
		color: inherit;
	}

	.card-body h3 {
		font-size: 1rem;
		margin: 0 0 6px;
		color: #1f1810;
		line-height: 1.3;
	}

	.location {
		color: #666;
		font-size: 0.85rem;
		margin: 0 0 8px;
	}

	.specs {
		display: flex;
		gap: 12px;
		font-size: 0.85rem;
		color: #555;
		margin-bottom: 10px;
	}

	.price {
		font-weight: 700;
		color: #d4af37;
		font-size: 1.1rem;
		margin: 0;
	}

	@media (max-width: 600px) {
		.favorites-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
