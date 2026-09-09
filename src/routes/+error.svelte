<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	const status = $page.status;
	const message = $page.error?.message ?? 'Something went wrong';

	const errorCopy: Record<number, { title: string; body: string }> = {
		400: { title: 'Bad Request', body: 'Your request could not be understood by the server.' },
		401: { title: 'Unauthorized', body: 'Please sign in to access this page.' },
		403: { title: 'Forbidden', body: 'You do not have permission to view this page.' },
		404: { title: 'Page Not Found', body: 'The page you are looking for does not exist or has moved.' },
		405: { title: 'Method Not Allowed', body: 'This action is not permitted on this resource.' },
		500: { title: 'Server Error', body: 'Something went wrong on our end. Our team has been notified.' },
		502: { title: 'Bad Gateway', body: 'A downstream service is unavailable. Please try again shortly.' },
		503: { title: 'Service Unavailable', body: 'We are briefly offline for maintenance. Back soon.' }
	};

	const copy = errorCopy[status] ?? { title: 'Unexpected Error', body: message };
</script>

<svelte:head>
	<title>{status} — {copy.title} | Delima Realtors</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<section class="error-page">
	<div class="container">
		<div class="error-content">
			<div class="error-code" aria-hidden="true">{status}</div>
			<h1>{copy.title}</h1>
			<p class="error-body">{copy.body}</p>

			{#if status >= 500}
				<p class="error-hint">
					If the problem persists, please call
					<a href="tel:+254727523752">+254 727 523 752</a>
					or email <a href="mailto:info@delimarealtors.com">info@delimarealtors.com</a>.
				</p>
			{/if}

			<div class="error-actions">
				<button type="button" class="btn-primary" on:click={() => goto('/')}>
					← Back to Home
				</button>
				<a href="/projects" class="btn-secondary">Browse Properties</a>
				<a href="/contact" class="btn-secondary">Contact Us</a>
			</div>
		</div>
	</div>
</section>

<style>
	.error-page {
		min-height: 70vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 60px 20px;
		background: linear-gradient(135deg, #1f1810 0%, #2a2115 100%);
		color: #fff;
	}

	.error-content {
		text-align: center;
		max-width: 640px;
	}

	.error-code {
		font-size: clamp(5rem, 15vw, 9rem);
		font-weight: 800;
		line-height: 1;
		background: linear-gradient(135deg, #d4af37 0%, #b8941f 100%);
		-webkit-background-clip: text;
		background-clip: text;
		-webkit-text-fill-color: transparent;
		margin-bottom: 16px;
	}

	.error-content h1 {
		font-size: 1.75rem;
		margin: 0 0 12px;
		color: #fff;
	}

	.error-body {
		color: rgba(255, 255, 255, 0.8);
		font-size: 1.05rem;
		line-height: 1.6;
		margin: 0 0 24px;
	}

	.error-hint {
		color: rgba(255, 255, 255, 0.65);
		font-size: 0.95rem;
		margin: 0 0 28px;
	}

	.error-hint a,
	.error-content a {
		color: #d4af37;
		text-decoration: none;
	}

	.error-hint a:hover,
	.error-content a:hover {
		text-decoration: underline;
	}

	.error-actions {
		display: flex;
		gap: 12px;
		flex-wrap: wrap;
		justify-content: center;
	}

	.btn-primary,
	.btn-secondary {
		padding: 12px 24px;
		border-radius: 6px;
		font-weight: 600;
		font-size: 0.95rem;
		cursor: pointer;
		text-decoration: none;
		display: inline-block;
		border: none;
		font-family: inherit;
	}

	.btn-primary {
		background: linear-gradient(135deg, #d4af37 0%, #b8941f 100%);
		color: #1f1810;
	}

	.btn-primary:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 16px rgba(212, 175, 55, 0.35);
	}

	.btn-secondary {
		background: transparent;
		color: #fff;
		border: 1px solid rgba(255, 255, 255, 0.4);
	}

	.btn-secondary:hover {
		border-color: #d4af37;
		color: #d4af37;
	}

	@media (max-width: 480px) {
		.error-actions {
			flex-direction: column;
		}

		.error-actions .btn-primary,
		.error-actions .btn-secondary {
			width: 100%;
		}
	}
</style>
