<script lang="ts">
	import { page } from '$app/stores';
	import { blogPosts, getPostBySlug } from '$lib/data/blog';
	import { onMount, onDestroy } from 'svelte';

	let slug = $page.params.slug ?? '';
	let post = getPostBySlug(slug);
	let progress = 0;

	$: slug = $page.params.slug ?? '';
	$: post = getPostBySlug(slug);

	$: others = blogPosts.filter((p) => p.slug !== slug).slice(0, 2);

	function onScroll() {
		if (typeof document === 'undefined') return;
		const article = document.querySelector('.article-content');
		if (!article) return;
		const rect = article.getBoundingClientRect();
		const total = rect.height - window.innerHeight + rect.top;
		const scrolled = Math.min(100, Math.max(0, (window.scrollY / total) * 100));
		progress = scrolled;
	}

	onMount(() => {
		window.addEventListener('scroll', onScroll, { passive: true });
		onScroll();
	});

	onDestroy(() => {
		if (typeof window !== 'undefined') {
			window.removeEventListener('scroll', onScroll);
		}
	});
</script>

<svelte:head>
	<title>{post ? `${post.title} | Delima Realtors Blog` : 'Post Not Found'}</title>
	<meta name="description" content={post ? post.excerpt : 'Post not found'} />
</svelte:head>

{#if post}
	<main class="article-page">
		<!-- Reading progress bar -->
		<div class="reading-progress" style="width: {progress}%" aria-hidden="true"></div>

		<!-- Hero -->
		<div class="article-hero">
			<div class="hero-overlay"></div>
			<img src={post.image} alt="" class="hero-bg" />
			<div class="hero-content">
				<span class="hero-category">{post.category}</span>
				<h1>{post.title}</h1>
				<div class="hero-meta">
					<span>✍️ {post.author}</span>
					<span>·</span>
					<span>{post.date}</span>
					<span>·</span>
					<span>{post.readTime}</span>
				</div>
			</div>
		</div>

		<div class="container">
			<div class="article-layout">
				<article class="article-content">
					<p class="excerpt">{post.excerpt}</p>

					{#each post.content as para}
						{#if para.startsWith('**')}
							<!-- Bold lead-in paragraph -->
							<p>
								<strong>{para.replace(/\*\*(.*?)\*\*/g, '$1').split(' — ')[0]}</strong>
								{para.replace(/\*\*(.*?)\*\*/g, '$1').split(' — ').slice(1).join(' — ')}
							</p>
						{:else}
							<p>{para}</p>
						{/if}
					{/each}

					<!-- Tags -->
					<div class="tags">
						{#each post.tags as tag}
							<span class="tag">#{tag}</span>
						{/each}
					</div>

					<!-- Author box -->
					<div class="author-box">
						<div class="author-avatar">✍️</div>
						<div>
							<strong>{post.author}</strong>
							<p>{post.authorRole} · Delima Realtors</p>
						</div>
					</div>

					<!-- CTA -->
					<div class="article-cta">
						<h3>Have questions about this topic?</h3>
						<p>Our agents are happy to walk you through the specifics for your situation.</p>
						<a href="/contact" class="btn-primary">Get in touch</a>
					</div>
				</article>

				<!-- Sidebar -->
				<aside class="sidebar">
					<div class="sidebar-card">
						<h3>More articles</h3>
						{#each others as other (other.slug)}
							<a href="/blog/{other.slug}" class="sidebar-post">
								<img src={other.image} alt={other.title} loading="lazy" />
								<div>
									<strong>{other.title}</strong>
									<span>{other.readTime}</span>
								</div>
							</a>
						{/each}
					</div>
				</aside>
			</div>
		</div>
	</main>
{:else}
	<main class="not-found">
		<div class="container">
			<h1>Post not found</h1>
			<p>We couldn’t find that article.</p>
			<a href="/blog" class="btn-primary">← Back to blog</a>
		</div>
	</main>
{/if}

<style>
	.article-page {
		background: #f9f9f9;
		position: relative;
	}

	.reading-progress {
		position: fixed;
		top: 0;
		left: 0;
		height: 4px;
		background: linear-gradient(90deg, #d4af37, #b8941f);
		z-index: 100;
		transition: width 0.1s linear;
	}

	.article-hero {
		position: relative;
		min-height: 340px;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		color: #fff;
	}

	.hero-bg {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.hero-overlay {
		position: absolute;
		inset: 0;
		background: linear-gradient(135deg, rgba(31, 24, 16, 0.88) 0%, rgba(31, 24, 16, 0.6) 100%);
	}

	.hero-content {
		position: relative;
		z-index: 1;
		text-align: center;
		padding: 30px 20px;
		max-width: 720px;
	}

	.hero-category {
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
		margin: 0 0 16px;
		line-height: 1.2;
	}

	.hero-meta {
		display: flex;
		gap: 8px;
		justify-content: center;
		flex-wrap: wrap;
		font-size: 0.85rem;
		color: rgba(255, 255, 255, 0.75);
	}

	.container {
		max-width: 1100px;
		margin: 0 auto;
		padding: 40px 20px 60px;
	}

	.article-layout {
		display: grid;
		grid-template-columns: 1fr 300px;
		gap: 36px;
		align-items: start;
	}

	.article-content {
		background: #fff;
		border-radius: 14px;
		padding: 40px;
		box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
	}

	.excerpt {
		font-size: 1.15rem;
		color: #555;
		line-height: 1.7;
		font-style: italic;
		border-left: 3px solid #d4af37;
		padding-left: 18px;
		margin: 0 0 28px;
	}

	.article-content p {
		color: #333;
		font-size: 1rem;
		line-height: 1.8;
		margin: 0 0 20px;
	}

	.article-content p strong {
		color: #1f1810;
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin: 30px 0;
		padding-top: 24px;
		border-top: 1px solid #f0f0f0;
	}

	.tag {
		background: rgba(212, 175, 55, 0.1);
		color: #8a6d10;
		padding: 5px 12px;
		border-radius: 14px;
		font-size: 0.8rem;
		font-weight: 500;
	}

	.author-box {
		display: flex;
		align-items: center;
		gap: 14px;
		padding: 20px;
		background: #f8f5f0;
		border-radius: 12px;
		margin: 24px 0;
	}

	.author-avatar {
		width: 50px;
		height: 50px;
		border-radius: 50%;
		background: #d4af37;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.4rem;
		flex-shrink: 0;
	}

	.author-box strong {
		display: block;
		color: #1f1810;
	}

	.author-box p {
		margin: 2px 0 0;
		color: #888;
		font-size: 0.85rem;
	}

	.article-cta {
		background: linear-gradient(135deg, #1f1810 0%, #3d2f25 100%);
		color: #fff;
		border-radius: 12px;
		padding: 30px;
		text-align: center;
		margin-top: 24px;
		position: relative;
		overflow: hidden;
	}

	.article-cta::before {
		content: '';
		position: absolute;
		top: -40%;
		right: -10%;
		width: 240px;
		height: 240px;
		background: radial-gradient(circle, rgba(212, 175, 55, 0.15), transparent 70%);
		border-radius: 50%;
	}

	.article-cta h3 {
		position: relative;
		margin: 0 0 8px;
		font-size: 1.3rem;
	}

	.article-cta p {
		position: relative;
		color: rgba(255, 255, 255, 0.7);
		margin: 0 0 20px;
	}

	.btn-primary {
		position: relative;
		display: inline-block;
		background: linear-gradient(135deg, #d4af37 0%, #b8941f 100%);
		color: #1f1810;
		padding: 12px 30px;
		border-radius: 8px;
		text-decoration: none;
		font-weight: 700;
		transition: transform 0.2s, box-shadow 0.2s;
	}

	.btn-primary:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 18px rgba(212, 175, 55, 0.5);
	}

	.sidebar {
		position: sticky;
		top: 20px;
	}

	.sidebar-card {
		background: #fff;
		border-radius: 12px;
		padding: 22px;
		box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
	}

	.sidebar-card h3 {
		margin: 0 0 16px;
		font-size: 1.1rem;
		color: #1f1810;
	}

	.sidebar-post {
		display: flex;
		gap: 12px;
		padding: 12px 0;
		text-decoration: none;
		color: inherit;
		border-bottom: 1px solid #f0f0f0;
		transition: transform 0.2s;
	}

	.sidebar-post:last-child {
		border-bottom: none;
	}

	.sidebar-post:hover {
		transform: translateX(4px);
	}

	.sidebar-post img {
		width: 70px;
		height: 56px;
		object-fit: cover;
		border-radius: 6px;
		flex-shrink: 0;
	}

	.sidebar-post strong {
		display: block;
		font-size: 0.85rem;
		color: #1f1810;
		line-height: 1.3;
		margin-bottom: 4px;
	}

	.sidebar-post span {
		font-size: 0.75rem;
		color: #999;
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
		.article-layout {
			grid-template-columns: 1fr;
		}
		.article-content {
			padding: 24px;
		}
		.hero-content h1 {
			font-size: 1.6rem;
		}
		.sidebar {
			position: static;
		}
	}
</style>
