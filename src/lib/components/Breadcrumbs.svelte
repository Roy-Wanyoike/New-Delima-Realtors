<script lang="ts">
	interface Crumb {
		label: string;
		href?: string;
	}

	export let items: Crumb[];
</script>

<nav class="breadcrumbs" aria-label="Breadcrumb">
	<ol>
		{#each items as crumb, i (i)}
			<li>
				{#if crumb.href && i < items.length - 1}
					<a href={crumb.href}>{crumb.label}</a>
				{:else}
					<span aria-current="page">{crumb.label}</span>
				{/if}
				{#if i < items.length - 1}
					<span class="sep" aria-hidden="true">›</span>
				{/if}
			</li>
		{/each}
	</ol>
</nav>

<style>
	.breadcrumbs {
		padding: 14px 0;
		font-size: 0.85rem;
	}

	.breadcrumbs ol {
		list-style: none;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0;
		margin: 0;
		padding: 0;
	}

	.breadcrumbs li {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.breadcrumbs a {
		color: #888;
		text-decoration: none;
		transition: color 0.2s;
	}

	.breadcrumbs a:hover {
		color: #d4af37;
	}

	.breadcrumbs span[aria-current='page'] {
		color: #1f1810;
		font-weight: 600;
		max-width: 300px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.sep {
		color: #ccc;
		font-size: 1rem;
		margin: 0 2px;
	}

	@media (max-width: 480px) {
		.breadcrumbs span[aria-current='page'] {
			max-width: 180px;
		}
	}
</style>
