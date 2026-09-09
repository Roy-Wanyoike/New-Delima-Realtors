<script lang="ts">
	import { toasts } from '$lib/stores/toasts';
	import { fly } from 'svelte/transition';
</script>

<div class="toast-container" role="region" aria-label="Notifications" aria-live="polite">
	{#each $toasts as toast (toast.id)}
		<div
			class="toast toast-{toast.type}"
			transition:fly={{ y: 20, duration: 250 }}
			role="alert"
		>
			<span class="toast-icon" aria-hidden="true">
				{#if toast.type === 'success'}✓{:else if toast.type === 'error'}⚠{:else}ℹ{/if}
			</span>
			<span class="toast-message">{toast.message}</span>
			<button type="button" class="toast-close" aria-label="Dismiss notification" on:click={() => toasts.remove(toast.id)}>✕</button>
		</div>
	{/each}
</div>

<style>
	.toast-container {
		position: fixed;
		top: 24px;
		right: 24px;
		z-index: 10000;
		display: flex;
		flex-direction: column;
		gap: 10px;
		max-width: 360px;
		pointer-events: none;
	}

	.toast {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 14px 16px;
		border-radius: 10px;
		background: #fff;
		box-shadow: 0 8px 28px rgba(0, 0, 0, 0.18);
		border-left: 4px solid #ccc;
		pointer-events: auto;
		animation: slide-in 0.3s ease;
	}

	@keyframes slide-in {
		from { transform: translateX(100%); opacity: 0; }
		to { transform: translateX(0); opacity: 1; }
	}

	.toast-success { border-left-color: #28a745; }
	.toast-error { border-left-color: #dc3545; }
	.toast-info { border-left-color: #d4af37; }

	.toast-icon {
		font-size: 1.2rem;
		flex-shrink: 0;
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		font-weight: 700;
	}

	.toast-success .toast-icon { background: #d4edda; color: #155724; }
	.toast-error .toast-icon { background: #f8d7da; color: #721c24; }
	.toast-info .toast-icon { background: rgba(212, 175, 55, 0.15); color: #8a6d10; }

	.toast-message {
		flex: 1;
		font-size: 0.9rem;
		color: #1f1810;
		line-height: 1.4;
	}

	.toast-close {
		background: none;
		border: none;
		color: #999;
		cursor: pointer;
		font-size: 0.85rem;
		padding: 4px;
		border-radius: 4px;
		transition: color 0.2s, background 0.2s;
	}

	.toast-close:hover {
		color: #1f1810;
		background: #f0f0f0;
	}

	@media (max-width: 480px) {
		.toast-container {
			top: 16px;
			right: 16px;
			left: 16px;
			max-width: none;
		}
	}
</style>
