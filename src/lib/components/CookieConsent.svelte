<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	const COOKIE_KEY = 'delima_cookie_consent';
	let visible = false;

	onMount(() => {
		if (!browser) return;
		try {
			const consent = localStorage.getItem(COOKIE_KEY);
			if (!consent) {
				// Small delay so it slides in after page load
				setTimeout(() => (visible = true), 1200);
			}
		} catch {
			// ignore
		}
	});

	function accept() {
		try {
			localStorage.setItem(COOKIE_KEY, 'accepted');
		} catch {
			// ignore
		}
		visible = false;
	}

	function decline() {
		try {
			localStorage.setItem(COOKIE_KEY, 'declined');
		} catch {
			// ignore
		}
		visible = false;
	}
</script>

{#if visible}
	<div class="cookie-banner" role="dialog" aria-label="Cookie consent" aria-live="polite">
		<div class="cookie-content">
			<span class="cookie-icon" aria-hidden="true">🍪</span>
			<div class="cookie-text">
				<strong>We use cookies</strong>
				<p>
					We use cookies to improve your experience and analyze site traffic. By continuing to browse, you agree to our use of cookies.
					<a href="/contact" class="cookie-link">Learn more</a>
				</p>
			</div>
			<div class="cookie-actions">
				<button type="button" class="btn-decline" on:click={decline}>Decline</button>
				<button type="button" class="btn-accept" on:click={accept}>Accept all</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.cookie-banner {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		background: linear-gradient(135deg, #1f1810 0%, #2d2418 100%);
		color: #fff;
		z-index: 999;
		box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.25);
		animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1);
	}

	@keyframes slide-up {
		from { transform: translateY(100%); }
		to { transform: translateY(0); }
	}

	.cookie-content {
		max-width: 1100px;
		margin: 0 auto;
		padding: 16px 24px;
		display: flex;
		align-items: center;
		gap: 16px;
	}

	.cookie-icon {
		font-size: 1.8rem;
		flex-shrink: 0;
	}

	.cookie-text {
		flex: 1;
	}

	.cookie-text strong {
		display: block;
		font-size: 0.95rem;
		margin-bottom: 2px;
	}

	.cookie-text p {
		margin: 0;
		font-size: 0.85rem;
		color: rgba(255, 255, 255, 0.7);
		line-height: 1.5;
	}

	.cookie-link {
		color: #d4af37;
		text-decoration: none;
	}

	.cookie-link:hover {
		text-decoration: underline;
	}

	.cookie-actions {
		display: flex;
		gap: 10px;
		flex-shrink: 0;
	}

	.btn-accept,
	.btn-decline {
		padding: 10px 20px;
		border-radius: 8px;
		font-size: 0.85rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
		font-family: inherit;
		border: none;
	}

	.btn-accept {
		background: linear-gradient(135deg, #d4af37 0%, #b8941f 100%);
		color: #1f1810;
	}

	.btn-accept:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(212, 175, 55, 0.5);
	}

	.btn-decline {
		background: transparent;
		color: rgba(255, 255, 255, 0.7);
		border: 1px solid rgba(255, 255, 255, 0.3);
	}

	.btn-decline:hover {
		color: #fff;
		border-color: rgba(255, 255, 255, 0.6);
	}

	@media (max-width: 600px) {
		.cookie-content {
			flex-direction: column;
			text-align: center;
			gap: 12px;
			padding: 18px 20px;
		}

		.cookie-actions {
			width: 100%;
			justify-content: center;
		}

		.btn-accept,
		.btn-decline {
			flex: 1;
			max-width: 140px;
		}
	}
</style>
