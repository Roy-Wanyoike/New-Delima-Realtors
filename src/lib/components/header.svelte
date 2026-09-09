<script lang="ts">
	import { onMount } from 'svelte';
	import { favorites } from '$lib/stores/favorites';
	import { compare } from '$lib/stores/compare';

	let favCount = 0;
	let compareCount = 0;

	onMount(() => {
		favorites.hydrate();
	});

	// reactively track counts
	$: favCount = $favorites.length;
	$: compareCount = $compare.length;
</script>

<!-- Preloader Start -->
<div class="preloader">
	<div class="loading-container">
		<div class="loading"></div>
		<div id="loading-icon">
			<img src="/lib/assets/logo/delima-logo.svg" alt="Delima Realtors Logo" />
		</div>
	</div>
</div>
<!-- Preloader End -->

<!-- Header Start -->
<header class="main-header">
	<div class="header-sticky">
		<nav class="navbar navbar-expand-lg">
			<div class="container">
				<!-- Logo Start -->
				<a class="navbar-brand" href="/">
					<img src="/lib/assets/logo/delima-logo.svg" alt="Delima Realtors Logo" />
				</a>
				<!-- Logo End -->

				<!-- Main Menu Start -->
				<div class="collapse navbar-collapse main-menu">
					<div class="nav-menu-wrapper">
						<ul class="navbar-nav mr-auto" id="menu">
							<li class="nav-item"><a class="nav-link" href="/">Home</a></li>
							<li class="nav-item"><a class="nav-link" href="/about">About</a></li>
							<li class="nav-item"><a class="nav-link" href="/services">Services</a></li>
							<li class="nav-item"><a class="nav-link" href="/projects">Properties</a></li>
							<li class="nav-item"><a class="nav-link" href="/contact">Contact</a></li>
						</ul>
					</div>

					<!-- Header Actions: Favorites + Compare + Phone -->
					<div class="header-actions">
						<a href="/favorites" class="header-action-btn" aria-label="View saved properties">
							<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
								<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
							</svg>
							{#if favCount > 0}
								<span class="action-badge">{favCount}</span>
							{/if}
						</a>
						<a href="/compare" class="header-action-btn" aria-label="Compare selected properties">
							<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
								<rect x="3" y="3" width="7" height="18" rx="1" />
								<rect x="14" y="3" width="7" height="18" rx="1" />
							</svg>
							{#if compareCount > 0}
								<span class="action-badge">{compareCount}</span>
							{/if}
						</a>
						<!-- Header Contact Box Start -->
						<div class="header-contact-box">
							<div class="icon-box">
								<img src="/lib/assets/icon-white-phone.svg" alt="Phone" />
							</div>
							<div class="header-contact-box-content">
								<h3><a href="tel:+254727523752">+254 727 523 752</a></h3>
							</div>
						</div>
						<!-- Header Contact Box End -->
					</div>
				</div>
				<!-- Main Menu End -->
				<div class="navbar-toggle"></div>
			</div>
		</nav>
		<div class="responsive-menu"></div>
	</div>
</header>
<!-- Header End -->

<style>
	.header-actions {
		display: flex;
		align-items: center;
		gap: 16px;
	}

	.header-action-btn {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		border-radius: 50%;
		background: rgba(212, 175, 55, 0.12);
		border: 1px solid rgba(212, 175, 55, 0.3);
		color: #d4af37;
		text-decoration: none;
		transition: all 0.3s ease;
		cursor: pointer;
	}

	.header-action-btn:hover {
		background: #d4af37;
		color: #1f1810;
		border-color: #d4af37;
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(212, 175, 55, 0.4);
	}

	.action-badge {
		position: absolute;
		top: -4px;
		right: -4px;
		background: #dc3545;
		color: white;
		font-size: 10px;
		font-weight: 700;
		min-width: 18px;
		height: 18px;
		border-radius: 9px;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0 5px;
		border: 2px solid #1f1810;
		animation: badge-pop 0.3s ease;
	}

	@keyframes badge-pop {
		0% {
			transform: scale(0);
		}
		60% {
			transform: scale(1.2);
		}
		100% {
			transform: scale(1);
		}
	}

	@media (max-width: 991px) {
		.header-actions {
			margin-top: 12px;
			padding-top: 12px;
			border-top: 1px solid rgba(255, 255, 255, 0.1);
		}
	}
</style>
