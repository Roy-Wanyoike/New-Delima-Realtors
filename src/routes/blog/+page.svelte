<script lang="ts">
	import { blogPosts } from '$lib/data/blog';

	let selectedCategory = '';
	$: categories = Array.from(new Set(blogPosts.map((p) => p.category)));
	$: filteredPosts = selectedCategory
		? blogPosts.filter((p) => p.category === selectedCategory)
		: blogPosts;
</script>

<svelte:head>
	<title>Blog & Guides | Delima Realtors</title>
	<meta
		name="description"
		content="Delima Realtors blog — buying guides, market analysis, and Nairobi real estate insights from our agents."
	/>
</svelte:head>

<main class="blog-page">
	<!-- Hero -->
	<div class="page-hero">
		<div class="hero-overlay"></div>
		<div class="hero-content">
			<h1>📖 Blog & Guides</h1>
			<p>Insights, market analysis, and buying guides from our Nairobi real estate experts</p>
		</div>
	</div>

	<div class="container">
		<!-- Category filter -->
		<div class="filter-bar">
			<button
				type="button"
				class="filter-chip"
				class:active={selectedCategory === ''}
				on:click={() => (selectedCategory = '')}
			>
				All
			</button>
			{#each categories as cat}
				<button
					type="button"
					class="filter-chip"
					class:active={selectedCategory === cat}
					on:click={() => (selectedCategory = cat)}
				>
					{cat}
				</button>
			{/each}
		</div>

		<!-- Posts grid -->
		<div class="posts-grid">
			{#each filteredPosts as post, i (post.slug)}
				<article class="post-card" style="--delay: {i * 70}ms">
					<a href="/blog/{post.slug}" class="post-image-link">
						<div class="post-image">
							<img src={post.image} alt={post.title} loading="lazy" />
							<span class="post-category">{post.category}</span>
						</div>
					</a>
					<div class="post-body">
						<a href="/blog/{post.slug}" class="post-title-link">
							<h2>{post.title}</h2>
						</a>
						<p class="post-excerpt">{post.excerpt}</p>
						<div class="post-meta">
							<span class="meta-author">✍️ {post.author}</span>
							<span class="meta-dot">·</span>
							<span class="meta-date">{post.date}</span>
							<span class="meta-dot">·</span>
							<span class="meta-read">{post.readTime}</span>
						</div>
						<a href="/blog/{post.slug}" class="read-more">Read article →</a>
					</div>
				</article>
			{/each}
		</div>

		{#if filteredPosts.length === 0}
			<div class="empty">
				<p>No posts in this category yet.</p>
			</div>
		{/if}
	</div>
</main>

<style>
	.blog-page {
		background: #f9f9f9;
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
	}

	.hero-content h1 {
		font-size: 2.4rem;
		margin: 0 0 10px;
	}

	.hero-content p {
		color: rgba(255, 255, 255, 0.75);
		font-size: 1.05rem;
		margin: 0;
		max-width: 600px;
	}

	.container {
		max-width: 1100px;
		margin: 0 auto;
		padding: 40px 20px 60px;
	}

	.filter-bar {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		margin-bottom: 36px;
		justify-content: center;
	}

	.filter-chip {
		padding: 8px 18px;
		border-radius: 20px;
		border: 1px solid #e0e0e0;
		background: #fff;
		color: #666;
		cursor: pointer;
		font-size: 0.85rem;
		font-weight: 600;
		transition: all 0.2s;
		font-family: inherit;
	}

	.filter-chip:hover {
		border-color: #d4af37;
		color: #d4af37;
	}

	.filter-chip.active {
		background: linear-gradient(135deg, #d4af37 0%, #b8941f 100%);
		color: #1f1810;
		border-color: #d4af37;
	}

	.posts-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
		gap: 28px;
	}

	.post-card {
		background: #fff;
		border-radius: 14px;
		overflow: hidden;
		box-shadow: 0 4px 16px rgba(31, 24, 16, 0.08);
		transition: transform 0.3s, box-shadow 0.3s;
		animation: card-in 0.5s ease backwards;
		animation-delay: var(--delay);
		display: flex;
		flex-direction: column;
	}

	@keyframes card-in {
		from { opacity: 0; transform: translateY(20px); }
		to { opacity: 1; transform: translateY(0); }
	}

	.post-card:hover {
		transform: translateY(-6px);
		box-shadow: 0 12px 36px rgba(31, 24, 16, 0.15);
	}

	.post-image-link {
		display: block;
		text-decoration: none;
	}

	.post-image {
		position: relative;
		height: 200px;
		overflow: hidden;
	}

	.post-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.5s ease;
	}

	.post-card:hover .post-image img {
		transform: scale(1.06);
	}

	.post-category {
		position: absolute;
		top: 12px;
		left: 12px;
		background: rgba(31, 24, 16, 0.85);
		color: #d4af37;
		padding: 5px 12px;
		border-radius: 16px;
		font-size: 0.72rem;
		font-weight: 600;
		backdrop-filter: blur(6px);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.post-body {
		padding: 22px;
		display: flex;
		flex-direction: column;
		flex: 1;
	}

	.post-title-link {
		text-decoration: none;
	}

	.post-body h2 {
		font-size: 1.15rem;
		margin: 0 0 10px;
		color: #1f1810;
		line-height: 1.3;
		transition: color 0.2s;
	}

	.post-title-link:hover h2 {
		color: #d4af37;
	}

	.post-excerpt {
		color: #666;
		font-size: 0.9rem;
		line-height: 1.6;
		margin: 0 0 16px;
		flex: 1;
	}

	.post-meta {
		display: flex;
		align-items: center;
		gap: 6px;
		flex-wrap: wrap;
		font-size: 0.78rem;
		color: #999;
		margin-bottom: 14px;
	}

	.meta-dot {
		color: #ddd;
	}

	.read-more {
		color: #d4af37;
		text-decoration: none;
		font-weight: 600;
		font-size: 0.88rem;
		transition: gap 0.2s;
	}

	.read-more:hover {
		text-decoration: underline;
	}

	.empty {
		text-align: center;
		padding: 60px 20px;
		color: #999;
	}

	@media (max-width: 600px) {
		.hero-content h1 { font-size: 1.8rem; }
		.posts-grid { grid-template-columns: 1fr; }
	}
</style>
