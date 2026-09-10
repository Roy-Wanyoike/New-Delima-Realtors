<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	export let target: number;
	export let suffix = '';
	export let prefix = '';
	export let duration = 2000;
	export let label = '';

	let current = 0;
	let el: HTMLElement;
	let started = false;
	let observer: IntersectionObserver | null = null;
	let rafId: number | null = null;

	function animate() {
		if (started) return;
		started = true;
		const startTime = performance.now();

		function tick(now: number) {
			const elapsed = now - startTime;
			const progress = Math.min(elapsed / duration, 1);
			// ease-out cubic
			const eased = 1 - Math.pow(1 - progress, 3);
			current = Math.round(target * eased);
			if (progress < 1) {
				rafId = requestAnimationFrame(tick);
			} else {
				current = target;
			}
		}

		rafId = requestAnimationFrame(tick);
	}

	onMount(() => {
		if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
			animate();
			return;
		}
		observer = new IntersectionObserver(
			(entries) => {
				if (entries[0]?.isIntersecting) {
					animate();
					observer?.disconnect();
				}
			},
			{ threshold: 0.3 }
		);
		if (el) observer.observe(el);
	});

	onDestroy(() => {
		observer?.disconnect();
		if (rafId) cancelAnimationFrame(rafId);
	});
</script>

<div class="stat-counter" bind:this={el}>
	<span class="stat-value">
		{prefix}{current.toLocaleString()}{suffix}
	</span>
	{#if label}
		<span class="stat-label">{label}</span>
	{/if}
</div>

<style>
	.stat-counter {
		text-align: center;
	}

	.stat-value {
		display: block;
		font-size: clamp(2rem, 4vw, 3rem);
		font-weight: 800;
		background: linear-gradient(135deg, #d4af37 0%, #b8941f 100%);
		-webkit-background-clip: text;
		background-clip: text;
		-webkit-text-fill-color: transparent;
		line-height: 1.1;
	}

	.stat-label {
		display: block;
		font-size: 0.85rem;
		color: rgba(255, 255, 255, 0.7);
		text-transform: uppercase;
		letter-spacing: 1px;
		margin-top: 8px;
	}
</style>
