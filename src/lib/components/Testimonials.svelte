<script lang="ts">
	import { testimonials } from '$lib/data/testimonials';
	import { onMount, onDestroy } from 'svelte';

	let active = $state(0);
	let autoplay: ReturnType<typeof setInterval>;

	function next() {
		active = (active + 1) % testimonials.length;
	}

	function prev() {
		active = (active - 1 + testimonials.length) % testimonials.length;
	}

	function goTo(i: number) {
		active = i;
	}

	function startAutoplay() {
		stopAutoplay();
		autoplay = setInterval(next, 6000);
	}

	function stopAutoplay() {
		if (autoplay) clearInterval(autoplay);
	}

	const current = $derived(testimonials[active]);

	onMount(() => startAutoplay());
	onDestroy(() => stopAutoplay());
</script>

<svelte:head></svelte:head>

<section
	class="testimonials"
	onmouseenter={stopAutoplay}
	onmouseleave={startAutoplay}
	aria-label="Client testimonials"
>
	<div class="container">
		<div class="section-header">
			<h2>What Our Clients Say</h2>
			<p>Real stories from buyers, sellers, and tenants we’ve helped across Nairobi</p>
		</div>

		<div class="carousel" role="region" aria-roledescription="carousel">
			<button type="button" class="nav-btn prev" onclick={prev} aria-label="Previous testimonial">‹</button>

			{#key active}
				<div class="testimonial-card">
					<div class="stars" aria-label="{current.rating} out of 5 stars">
						{#each Array(5) as _, i}
							<span class="star" class:filled={i < current.rating}>★</span>
						{/each}
					</div>

					<blockquote class="quote">“{current.quote}”</blockquote>

					<div class="author">
						<img src={current.avatar} alt={current.name} class="avatar" loading="lazy" />
						<div class="author-info">
							<strong>{current.name}</strong>
							<span class="author-role">{current.role} · {current.location}</span>
							<span class="author-date">{current.date}</span>
						</div>
					</div>
				</div>
			{/key}

			<button type="button" class="nav-btn next" onclick={next} aria-label="Next testimonial">›</button>
		</div>

		<div class="dots" role="tablist">
			{#each testimonials as t, i}
				<button
					type="button"
					class="dot"
					class:active={i === active}
					onclick={() => goTo(i)}
					aria-label="Go to testimonial {i + 1}"
					aria-selected={i === active}
					role="tab"
				></button>
			{/each}
		</div>
	</div>
</section>

<style>
	.testimonials {
		background: linear-gradient(135deg, #1f1810 0%, #2d2418 100%);
		color: #fff;
		padding: 70px 0;
		position: relative;
		overflow: hidden;
	}

	.testimonials::before {
		content: '';
		position: absolute;
		top: -30%;
		left: -10%;
		width: 400px;
		height: 400px;
		background: radial-gradient(circle, rgba(212, 175, 55, 0.1), transparent 70%);
		border-radius: 50%;
	}

	.testimonials::after {
		content: '';
		position: absolute;
		bottom: -30%;
		right: -10%;
		width: 400px;
		height: 400px;
		background: radial-gradient(circle, rgba(212, 175, 55, 0.08), transparent 70%);
		border-radius: 50%;
	}

	.container {
		max-width: 900px;
		margin: 0 auto;
		padding: 0 20px;
		position: relative;
		z-index: 1;
	}

	.section-header {
		text-align: center;
		margin-bottom: 40px;
	}

	.section-header h2 {
		font-size: 2rem;
		margin: 0 0 8px;
	}

	.section-header p {
		color: rgba(255, 255, 255, 0.65);
		margin: 0;
	}

	.carousel {
		display: flex;
		align-items: center;
		gap: 20px;
	}

	.testimonial-card {
		flex: 1;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 16px;
		padding: 36px;
		text-align: center;
		backdrop-filter: blur(8px);
		animation: card-in 0.4s ease;
	}

	@keyframes card-in {
		from { opacity: 0; transform: translateY(12px); }
		to { opacity: 1; transform: translateY(0); }
	}

	.stars {
		margin-bottom: 18px;
	}

	.star {
		font-size: 1.3rem;
		color: rgba(255, 255, 255, 0.2);
		margin: 0 1px;
	}

	.star.filled {
		color: #d4af37;
	}

	.quote {
		font-size: 1.15rem;
		line-height: 1.7;
		color: rgba(255, 255, 255, 0.92);
		margin: 0 0 24px;
		font-style: italic;
	}

	.author {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 14px;
	}

	.avatar {
		width: 56px;
		height: 56px;
		border-radius: 50%;
		object-fit: cover;
		border: 2px solid #d4af37;
	}

	.author-info {
		text-align: left;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.author-info strong {
		color: #fff;
		font-size: 1rem;
	}

	.author-role {
		color: rgba(255, 255, 255, 0.6);
		font-size: 0.82rem;
	}

	.author-date {
		color: rgba(255, 255, 255, 0.4);
		font-size: 0.75rem;
	}

	.nav-btn {
		flex-shrink: 0;
		width: 44px;
		height: 44px;
		border-radius: 50%;
		border: 1px solid rgba(255, 255, 255, 0.2);
		background: rgba(255, 255, 255, 0.05);
		color: #fff;
		font-size: 24px;
		cursor: pointer;
		transition: all 0.2s;
	}

	.nav-btn:hover {
		background: #d4af37;
		color: #1f1810;
		border-color: #d4af37;
		transform: scale(1.05);
	}

	.dots {
		display: flex;
		justify-content: center;
		gap: 8px;
		margin-top: 24px;
	}

	.dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		border: none;
		background: rgba(255, 255, 255, 0.25);
		cursor: pointer;
		transition: all 0.25s;
		padding: 0;
	}

	.dot.active {
		background: #d4af37;
		width: 28px;
		border-radius: 5px;
	}

	@media (max-width: 600px) {
		.testimonial-card {
			padding: 24px 18px;
		}
		.quote {
			font-size: 1rem;
		}
		.nav-btn {
			width: 36px;
			height: 36px;
			font-size: 18px;
		}
		.author {
			flex-direction: column;
			text-align: center;
		}
		.author-info {
			text-align: center;
			align-items: center;
		}
	}
</style>
