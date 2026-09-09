<script lang="ts">
	import { compare } from '$lib/stores/compare';
	import { goto } from '$app/navigation';

	let count = 0;
	$: count = $compare.length;

	let isVisible = false;
	$: isVisible = count > 0;

	function viewCompare() {
		goto('/compare');
	}

	function clearCompare() {
		compare.clear();
	}
</script>

{#if isVisible}
	<div class="compare-bar" role="region" aria-label="Comparison tray">
		<div class="compare-bar-inner">
			<div class="compare-info">
				<span class="compare-icon">⚖️</span>
				<div class="compare-text">
					<strong>{count} of {compare.max}</strong>
					<span>properties selected</span>
				</div>
			</div>

			<div class="compare-thumbs">
				{#each $compare as p (p.id)}
					<div class="thumb" title={p.title}>
						<img src={p.imageUrl} alt={p.title} />
						<button type="button" class="thumb-remove" aria-label="Remove {p.title}" on:click={() => compare.remove(p.id)}>✕</button>
					</div>
				{/each}
				{#if count < compare.max}
					<a href="/projects" class="thumb-add" aria-label="Add another property">
						<span>+</span>
					</a>
				{/if}
			</div>

			<div class="compare-actions">
				<button type="button" class="btn-clear" on:click={clearCompare}>Clear</button>
				<button type="button" class="btn-compare" on:click={viewCompare}>
					Compare Now →
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.compare-bar {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		background: linear-gradient(135deg, #1f1810 0%, #2d2418 100%);
		color: #fff;
		box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.25);
		z-index: 998;
		animation: slide-up 0.35s cubic-bezier(0.16, 1, 0.3, 1);
	}

	@keyframes slide-up {
		from {
			transform: translateY(100%);
		}
		to {
			transform: translateY(0);
		}
	}

	.compare-bar-inner {
		max-width: 1200px;
		margin: 0 auto;
		padding: 14px 20px;
		display: flex;
		align-items: center;
		gap: 20px;
	}

	.compare-info {
		display: flex;
		align-items: center;
		gap: 10px;
		flex-shrink: 0;
	}

	.compare-icon {
		font-size: 1.5rem;
	}

	.compare-text {
		display: flex;
		flex-direction: column;
		font-size: 0.85rem;
		line-height: 1.2;
	}

	.compare-text strong {
		color: #d4af37;
		font-size: 1rem;
	}

	.compare-text span {
		color: rgba(255, 255, 255, 0.6);
		font-size: 0.75rem;
	}

	.compare-thumbs {
		display: flex;
		align-items: center;
		gap: 10px;
		flex: 1;
		overflow-x: auto;
		padding: 4px 0;
	}

	.thumb {
		position: relative;
		width: 56px;
		height: 56px;
		border-radius: 8px;
		overflow: hidden;
		flex-shrink: 0;
		border: 2px solid #d4af37;
	}

	.thumb img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.thumb-remove {
		position: absolute;
		top: 2px;
		right: 2px;
		width: 18px;
		height: 18px;
		border-radius: 50%;
		border: none;
		background: rgba(220, 53, 69, 0.95);
		color: #fff;
		font-size: 9px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		opacity: 0;
		transition: opacity 0.2s;
	}

	.thumb:hover .thumb-remove {
		opacity: 1;
	}

	.thumb-add {
		width: 56px;
		height: 56px;
		border-radius: 8px;
		border: 2px dashed rgba(255, 255, 255, 0.3);
		display: flex;
		align-items: center;
		justify-content: center;
		text-decoration: none;
		color: rgba(255, 255, 255, 0.5);
		font-size: 1.5rem;
		flex-shrink: 0;
		transition: all 0.2s;
	}

	.thumb-add:hover {
		border-color: #d4af37;
		color: #d4af37;
	}

	.compare-actions {
		display: flex;
		gap: 10px;
		flex-shrink: 0;
	}

	.btn-clear {
		background: transparent;
		color: rgba(255, 255, 255, 0.7);
		border: 1px solid rgba(255, 255, 255, 0.2);
		padding: 10px 18px;
		border-radius: 6px;
		cursor: pointer;
		font-size: 0.85rem;
		font-weight: 600;
		transition: all 0.2s;
	}

	.btn-clear:hover {
		color: #fff;
		border-color: rgba(255, 255, 255, 0.5);
	}

	.btn-compare {
		background: linear-gradient(135deg, #d4af37 0%, #b8941f 100%);
		color: #1f1810;
		border: none;
		padding: 10px 24px;
		border-radius: 6px;
		cursor: pointer;
		font-size: 0.85rem;
		font-weight: 700;
		transition: transform 0.2s, box-shadow 0.2s;
	}

	.btn-compare:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 14px rgba(212, 175, 55, 0.5);
	}

	@media (max-width: 768px) {
		.compare-bar-inner {
			flex-wrap: wrap;
			gap: 12px;
		}

		.compare-info {
			flex: 1;
		}

		.compare-thumbs {
			order: 3;
			width: 100%;
		}

		.compare-actions {
			flex: 1;
			justify-content: flex-end;
		}

		.btn-clear {
			display: none;
		}
	}
</style>
