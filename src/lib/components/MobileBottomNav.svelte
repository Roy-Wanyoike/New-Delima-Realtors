<script lang="ts">
	import { page } from '$app/stores';
	import { favorites } from '$lib/stores/favorites';

	$: currentPath = $page.url.pathname;
	$: favCount = $favorites.length;

	function isActive(path: string): boolean {
		if (path === '/') return currentPath === '/';
		return currentPath.startsWith(path);
	}

	function openSearch() {
		window.dispatchEvent(new CustomEvent('open-search'));
	}
</script>

<nav class="mobile-bottom-nav" aria-label="Mobile navigation">
	<a href="/" class="nav-item" class:active={isActive('/')} aria-label="Home">
		<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
		<span>Home</span>
	</a>
	<a href="/projects" class="nav-item" class:active={isActive('/projects')} aria-label="Properties">
		<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><line x1="9" y1="22" x2="9" y2="12" /><line x1="15" y1="22" x2="15" y2="12" /></svg>
		<span>Properties</span>
	</a>
	<button type="button" class="nav-item search-item" onclick={openSearch} aria-label="Search">
		<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
		<span>Search</span>
	</button>
	<a href="/favorites" class="nav-item" class:active={isActive('/favorites')} aria-label="Favorites">
		<span class="icon-wrap">
			<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
			{#if favCount > 0}
				<span class="nav-badge">{favCount}</span>
			{/if}
		</span>
		<span>Saved</span>
	</a>
</nav>

<style>
	.mobile-bottom-nav {
		display: none;
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		background: rgba(255, 255, 255, 0.97);
		backdrop-filter: blur(12px);
		border-top: 1px solid #eee;
		z-index: 996;
		padding: 6px 0 env(safe-area-inset-bottom, 6px);
		justify-content: space-around;
		box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.06);
	}

	.nav-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 3px;
		padding: 6px 12px;
		text-decoration: none;
		color: #999;
		font-size: 0.68rem;
		font-weight: 600;
		transition: color 0.2s;
		background: none;
		border: none;
		cursor: pointer;
		font-family: inherit;
		flex: 1;
		max-width: 90px;
	}

	.nav-item.active {
		color: #d4af37;
	}

	.nav-item svg {
		transition: transform 0.2s;
	}

	.nav-item.active svg {
		transform: translateY(-1px);
	}

	.icon-wrap {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.nav-badge {
		position: absolute;
		top: -4px;
		right: -8px;
		background: #dc3545;
		color: #fff;
		font-size: 9px;
		font-weight: 700;
		min-width: 16px;
		height: 16px;
		border-radius: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0 4px;
	}

	@media (max-width: 768px) {
		.mobile-bottom-nav {
			display: flex;
		}
	}
</style>
