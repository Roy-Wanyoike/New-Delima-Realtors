<script lang="ts">
	import { compare } from '$lib/stores/compare';
	import type { Project } from '$lib/types';

	let items: Project[] = [];
	$: items = $compare;

	function formatPrice(price: string) {
		return parseInt(price).toLocaleString();
	}

	function pricePerSqm(p: Project): string {
		// Rough heuristic: price / (bedrooms * 50) — purely illustrative
		const beds = parseInt(p.bedrooms) || 1;
		const val = Math.round(parseInt(p.price) / (beds * 50));
		return val.toLocaleString();
	}

	function clearAll() {
		compare.clear();
	}
</script>

<svelte:head>
	<title>Compare Properties | Delima Realtors</title>
	<meta name="description" content="Compare selected properties side by side." />
</svelte:head>

<main class="compare-page">
	<div class="page-header">
		<div class="header-content">
			<h1>⚖️ Compare Properties</h1>
			<p>Side-by-side comparison of up to 3 properties</p>
		</div>
	</div>

	<div class="container">
		{#if items.length === 0}
			<div class="empty-state">
				<div class="empty-icon">⚖️</div>
				<h2>Nothing to compare yet</h2>
				<p>Add properties to the comparison using the compare icon on any property card. You can compare up to 3 at once.</p>
				<a href="/projects" class="btn-primary">Browse Properties</a>
			</div>
		{:else}
			<div class="compare-toolbar">
				<p class="count">{items.length} of {compare.max} properties selected</p>
				<button type="button" class="btn-clear" on:click={clearAll}>Clear All</button>
			</div>

			<div class="compare-table-wrapper">
				<table class="compare-table">
					<thead>
						<tr>
							<th class="feature-col">Feature</th>
							{#each items as p (p.id)}
								<th class="property-col">
									<img src={p.imageUrl} alt={p.title} />
									<button type="button" class="remove-btn" aria-label="Remove {p.title} from comparison" on:click={() => compare.remove(p.id)}>✕</button>
								</th>
							{/each}
							{#if items.length < 3}
								<th class="add-col">
									<a href="/projects" class="add-slot" aria-label="Add another property">
										<span class="add-plus">+</span>
										<span class="add-text">Add property</span>
									</a>
								</th>
							{/if}
						</tr>
					</thead>
					<tbody>
						<tr>
							<td class="feature-col">Title</td>
							{#each items as p (p.id)}<td><a href="/projects/{p.id}" class="prop-link">{p.title}</a></td>{/each}
							{#if items.length < 3}<td class="add-col"></td>{/if}
						</tr>
						<tr class="alt">
							<td class="feature-col">Price</td>
							{#each items as p (p.id)}<td><strong class="price">KES {formatPrice(p.price)}</strong></td>{/each}
							{#if items.length < 3}<td class="add-col"></td>{/if}
						</tr>
						<tr>
							<td class="feature-col">Category</td>
							{#each items as p (p.id)}<td>{p.category}</td>{/each}
							{#if items.length < 3}<td class="add-col"></td>{/if}
						</tr>
						<tr class="alt">
							<td class="feature-col">Location</td>
							{#each items as p (p.id)}<td>{p.location}</td>{/each}
							{#if items.length < 3}<td class="add-col"></td>{/if}
						</tr>
						<tr>
							<td class="feature-col">Bedrooms</td>
							{#each items as p (p.id)}<td>{p.bedrooms || '—'}</td>{/each}
							{#if items.length < 3}<td class="add-col"></td>{/if}
						</tr>
						<tr class="alt">
							<td class="feature-col">Bathrooms</td>
							{#each items as p (p.id)}<td>{p.bathrooms || '—'}</td>{/each}
							{#if items.length < 3}<td class="add-col"></td>{/if}
						</tr>
						<tr>
							<td class="feature-col">Featured</td>
							{#each items as p (p.id)}<td>{p.featured ? '⭐ Yes' : '—'}</td>{/each}
							{#if items.length < 3}<td class="add-col"></td>{/if}
						</tr>
						<tr class="alt">
							<td class="feature-col">Status</td>
							{#each items as p (p.id)}<td><span class="status-badge status-{p.status}">{p.status}</span></td>{/each}
							{#if items.length < 3}<td class="add-col"></td>{/if}
						</tr>
						<tr>
							<td class="feature-col">Amenities</td>
							{#each items as p (p.id)}<td class="amenities-cell">{p.amenities || '—'}</td>{/each}
							{#if items.length < 3}<td class="add-col"></td>{/if}
						</tr>
						<tr class="alt">
							<td class="feature-col">Description</td>
							{#each items as p (p.id)}<td class="desc-cell">{p.description}</td>{/each}
							{#if items.length < 3}<td class="add-col"></td>{/if}
						</tr>
						<tr>
							<td class="feature-col">Est. KES/m²</td>
							{#each items as p (p.id)}<td>{pricePerSqm(p)}</td>{/each}
							{#if items.length < 3}<td class="add-col"></td>{/if}
						</tr>
						<tr class="cta-row">
							<td class="feature-col"></td>
							{#each items as p (p.id)}
								<td><a href="/projects/{p.id}" class="btn-view">View Details →</a></td>
							{/each}
							{#if items.length < 3}<td class="add-col"></td>{/if}
						</tr>
					</tbody>
				</table>
			</div>
		{/if}
	</div>
</main>

<style>
	.compare-page {
		min-height: 70vh;
		background: #f9f9f9;
		padding-bottom: 60px;
	}

	.page-header {
		background: linear-gradient(135deg, #1f1810 0%, #3d2f25 100%);
		color: #fff;
		padding: 50px 20px;
		text-align: center;
	}

	.page-header h1 {
		margin: 0 0 8px;
		font-size: 2rem;
	}

	.page-header p {
		color: rgba(255, 255, 255, 0.7);
		margin: 0;
	}

	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 30px 20px;
	}

	.empty-state {
		text-align: center;
		padding: 60px 20px;
		background: #fff;
		border-radius: 12px;
		box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
	}

	.empty-icon {
		font-size: 4rem;
		margin-bottom: 16px;
	}

	.empty-state h2 {
		color: #1f1810;
		margin: 0 0 8px;
	}

	.empty-state p {
		color: #666;
		margin: 0 0 24px;
		line-height: 1.6;
	}

	.btn-primary {
		display: inline-block;
		background: linear-gradient(135deg, #d4af37 0%, #b8941f 100%);
		color: #1f1810;
		padding: 12px 32px;
		border-radius: 8px;
		text-decoration: none;
		font-weight: 600;
		transition: transform 0.2s, box-shadow 0.2s;
	}

	.btn-primary:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 16px rgba(212, 175, 55, 0.4);
	}

	.compare-toolbar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20px;
	}

	.count {
		color: #1f1810;
		font-weight: 600;
		margin: 0;
	}

	.btn-clear {
		background: #fee;
		color: #c33;
		border: 1px solid #fcc;
		padding: 8px 16px;
		border-radius: 6px;
		cursor: pointer;
		font-size: 0.85rem;
		font-weight: 600;
	}

	.btn-clear:hover {
		background: #dc3545;
		color: #fff;
		border-color: #dc3545;
	}

	.compare-table-wrapper {
		overflow-x: auto;
		background: #fff;
		border-radius: 12px;
		box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
	}

	.compare-table {
		width: 100%;
		border-collapse: collapse;
		min-width: 600px;
	}

	.compare-table th,
	.compare-table td {
		padding: 16px;
		text-align: left;
		border-bottom: 1px solid #eee;
		vertical-align: top;
	}

	.compare-table th {
		background: #f8f5f0;
		font-weight: 600;
		color: #1f1810;
	}

	.feature-col {
		width: 140px;
		font-weight: 600;
		color: #666;
		background: #f8f5f0;
		white-space: nowrap;
	}

	.property-col {
		position: relative;
		min-width: 200px;
		text-align: center;
	}

	.property-col img {
		width: 100%;
		height: 140px;
		object-fit: cover;
		border-radius: 8px;
		margin-bottom: 8px;
	}

	.remove-btn {
		position: absolute;
		top: 10px;
		right: 10px;
		width: 28px;
		height: 28px;
		border-radius: 50%;
		border: none;
		background: rgba(220, 53, 69, 0.9);
		color: #fff;
		cursor: pointer;
		font-size: 14px;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s;
	}

	.remove-btn:hover {
		background: #dc3545;
		transform: scale(1.1);
	}

	.add-col {
		text-align: center;
		min-width: 160px;
	}

	.add-slot {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 8px;
		padding: 40px 20px;
		text-decoration: none;
		color: #999;
		border: 2px dashed #ddd;
		border-radius: 8px;
		transition: all 0.3s;
	}

	.add-slot:hover {
		border-color: #d4af37;
		color: #d4af37;
		background: rgba(212, 175, 55, 0.05);
	}

	.add-plus {
		font-size: 2rem;
		font-weight: 300;
		line-height: 1;
	}

	.add-text {
		font-size: 0.85rem;
	}

	.alt {
		background: #fcfaf7;
	}

	.price {
		color: #d4af37;
		font-size: 1.05rem;
	}

	.prop-link {
		color: #1f1810;
		text-decoration: none;
		font-weight: 600;
	}

	.prop-link:hover {
		color: #d4af37;
	}

	.status-badge {
		display: inline-block;
		padding: 3px 10px;
		border-radius: 12px;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: capitalize;
	}

	.status-published { background: #d4edda; color: #155724; }
	.status-draft { background: #fff3cd; color: #856404; }
	.status-sold { background: #f8d7da; color: #721c24; }

	.amenities-cell {
		font-size: 0.85rem;
		color: #555;
		line-height: 1.5;
	}

	.desc-cell {
		font-size: 0.85rem;
		color: #555;
		line-height: 1.6;
		max-width: 250px;
	}

	.cta-row td {
		border-bottom: none;
		padding-top: 24px;
	}

	.btn-view {
		display: inline-block;
		padding: 10px 20px;
		background: linear-gradient(135deg, #d4af37 0%, #b8941f 100%);
		color: #1f1810;
		border-radius: 6px;
		text-decoration: none;
		font-weight: 600;
		font-size: 0.85rem;
		transition: transform 0.2s, box-shadow 0.2s;
	}

	.btn-view:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(212, 175, 55, 0.35);
	}

	@media (max-width: 768px) {
		.compare-table {
			font-size: 0.85rem;
		}

		.compare-table th,
		.compare-table td {
			padding: 10px;
		}

		.desc-cell {
			max-width: 150px;
		}
	}
</style>
