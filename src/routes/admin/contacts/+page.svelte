<script lang="ts">
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabase';

	let contacts: any[] = [];
	let loading = true;
	let error = '';

	let filterStatus = 'all';
	let filterSort = 'newest';
	let deleteConfirm: string | null = null;

	onMount(async () => {
		// Check authentication
		const adminAuth = localStorage.getItem('adminAuth');
		if (!adminAuth) {
			error = 'Please log in to access this page';
			loading = false;
			return;
		}

		await loadContacts();
	});

	async function loadContacts() {
		try {
			let query = supabase.from('contacts').select('*');

			// Apply status filter
			if (filterStatus !== 'all') {
				query = query.eq('status', filterStatus);
			}

			// Apply sort
			if (filterSort === 'newest') {
				query = query.order('created_at', { ascending: false });
			} else if (filterSort === 'oldest') {
				query = query.order('created_at', { ascending: true });
			} else if (filterSort === 'unread') {
				query = query.eq('status', 'new').order('created_at', { ascending: false });
			}

			const { data, error: err } = await query;
			if (err) throw err;

			contacts = data || [];
		} catch (err) {
			console.error('Error loading contacts:', err);
			error = 'Failed to load contacts';
		} finally {
			loading = false;
		}
	}

	async function updateStatus(id: string, newStatus: string) {
		try {
			const { error: err } = await supabase
				.from('contacts')
				.update({ status: newStatus })
				.eq('id', id);

			if (err) throw err;

			// Update local list
			contacts = contacts.map(c => (c.id === id ? { ...c, status: newStatus } : c));
		} catch (err) {
			console.error('Error updating status:', err);
			alert('Failed to update status');
		}
	}

	async function deleteContact(id: string) {
		try {
			const { error: err } = await supabase.from('contacts').delete().eq('id', id);

			if (err) throw err;

			contacts = contacts.filter(c => c.id !== id);
			deleteConfirm = null;
		} catch (err) {
			console.error('Error deleting contact:', err);
			alert('Failed to delete contact');
		}
	}

	function getStatusBadgeClass(status: string) {
		switch (status) {
			case 'new':
				return 'status-new';
			case 'contacted':
				return 'status-contacted';
			case 'closed':
				return 'status-closed';
			default:
				return '';
		}
	}

	function formatDate(dateStr: string) {
		return new Date(dateStr).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}

	function formatTime(dateStr: string) {
		return new Date(dateStr).toLocaleTimeString('en-US', {
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<main class="contacts-admin">
	<div class="page-header">
		<h1>📧 Contact Inquiries</h1>
		<p>Manage property inquiries and customer messages</p>
	</div>

	{#if error}
		<div class="error-message">{error}</div>
	{:else if loading}
		<div class="loading-state">Loading inquiries...</div>
	{:else}
		<div class="contacts-container">
			<!-- Filters -->
			<div class="filters">
				<div class="filter-group">
					<label for="status">Status:</label>
					<select
						id="status"
						bind:value={filterStatus}
						on:change={loadContacts}
					>
						<option value="all">All Inquiries</option>
						<option value="new">New</option>
						<option value="contacted">Contacted</option>
						<option value="closed">Closed</option>
					</select>
				</div>

				<div class="filter-group">
					<label for="sort">Sort:</label>
					<select
						id="sort"
						bind:value={filterSort}
						on:change={loadContacts}
					>
						<option value="newest">Newest First</option>
						<option value="oldest">Oldest First</option>
						<option value="unread">Unread First</option>
					</select>
				</div>

				<div class="filter-info">
					<span class="badge">{contacts.length} inquiries</span>
				</div>
			</div>

			<!-- Contacts Table -->
			{#if contacts.length === 0}
				<div class="no-results">
					<p>📭 No inquiries found</p>
				</div>
			{:else}
				<div class="table-wrapper">
					<table class="contacts-table">
						<thead>
							<tr>
								<th>Name</th>
								<th>Email</th>
								<th>Phone</th>
								<th>Property</th>
								<th>Message</th>
								<th>Date</th>
								<th>Status</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{#each contacts as contact (contact.id)}
								<tr class="contact-row">
									<td class="name-cell">
										<strong>{contact.name}</strong>
									</td>
									<td>
										<a href="mailto:{contact.email}">{contact.email}</a>
									</td>
									<td>
										{#if contact.phone}
											<a href="tel:{contact.phone}">{contact.phone}</a>
										{:else}
											<span class="text-muted">—</span>
										{/if}
									</td>
									<td class="property-cell">
										{#if contact.interested_in}
											<span class="property-name">{contact.interested_in}</span>
										{:else}
											<span class="text-muted">—</span>
										{/if}
									</td>
									<td class="message-cell">
										<span class="message-preview">{contact.message.substring(0, 50)}...</span>
										<button
											class="btn-view"
											on:click={() => {
												alert(`Full Message:\n\n${contact.message}`);
											}}
										>
											View
										</button>
									</td>
									<td class="date-cell">
										<div class="date">{formatDate(contact.created_at)}</div>
										<div class="time">{formatTime(contact.created_at)}</div>
									</td>
									<td>
										<select
											class="status-select {getStatusBadgeClass(contact.status)}"
											value={contact.status}
											on:change={(e) =>
												updateStatus(contact.id, e.currentTarget.value)}
										>
											<option value="new">New</option>
											<option value="contacted">Contacted</option>
											<option value="closed">Closed</option>
										</select>
									</td>
									<td class="actions-cell">
										<button
											class="btn-delete"
											on:click={() => (deleteConfirm = contact.id)}
											title="Delete inquiry"
										>
											🗑️
										</button>

										{#if deleteConfirm === contact.id}
											<div class="delete-confirm">
												<p>Delete this inquiry?</p>
												<button
													class="btn-confirm"
													on:click={() => deleteContact(contact.id)}
												>
													Yes
												</button>
												<button
													class="btn-cancel"
													on:click={() => (deleteConfirm = null)}
												>
													No
												</button>
											</div>
										{/if}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</div>
	{/if}
</main>

<style>
	.contacts-admin {
		padding: 0;
		background: #f5f5f5;
		min-height: 100vh;
	}

	.page-header {
		background: linear-gradient(135deg, #1f1810 0%, #3d3628 100%);
		color: white;
		padding: 40px 20px;
		text-align: center;
	}

	.page-header h1 {
		margin: 0;
		font-size: 32px;
	}

	.page-header p {
		margin: 10px 0 0 0;
		color: rgba(255, 255, 255, 0.8);
	}

	.contacts-container {
		max-width: 1400px;
		margin: 0 auto;
		padding: 30px 20px;
	}

	.error-message {
		background: #f8d7da;
		color: #721c24;
		padding: 15px 20px;
		border-radius: 4px;
		margin-bottom: 20px;
		border: 1px solid #f5c6cb;
	}

	.loading-state {
		text-align: center;
		padding: 60px 20px;
		color: #666;
		font-size: 16px;
	}

	/* Filters */
	.filters {
		display: flex;
		gap: 20px;
		margin-bottom: 30px;
		background: white;
		padding: 20px;
		border-radius: 8px;
		align-items: center;
		flex-wrap: wrap;
	}

	.filter-group {
		display: flex;
		gap: 10px;
		align-items: center;
	}

	.filter-group label {
		font-weight: 600;
		color: #1f1810;
		white-space: nowrap;
	}

	.filter-group select {
		padding: 8px 12px;
		border: 1px solid #ddd;
		border-radius: 4px;
		background: white;
		cursor: pointer;
		font-size: 14px;
	}

	.filter-group select:focus {
		outline: none;
		border-color: #0066cc;
		box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
	}

	.filter-info {
		margin-left: auto;
	}

	.badge {
		background: #d4af37;
		color: #1f1810;
		padding: 6px 14px;
		border-radius: 20px;
		font-weight: 600;
		font-size: 13px;
	}

	/* Table */
	.table-wrapper {
		background: white;
		border-radius: 8px;
		overflow: hidden;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		overflow-x: auto;
	}

	.contacts-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 14px;
	}

	.contacts-table thead {
		background: #f5f5f5;
		border-bottom: 2px solid #ddd;
	}

	.contacts-table th {
		padding: 15px;
		text-align: left;
		font-weight: 600;
		color: #1f1810;
		white-space: nowrap;
	}

	.contacts-table td {
		padding: 15px;
		border-bottom: 1px solid #eee;
	}

	.contact-row:hover {
		background: #fafafa;
	}

	.name-cell {
		font-weight: 600;
		color: #1f1810;
	}

	.contacts-table a {
		color: #0066cc;
		text-decoration: none;
	}

	.contacts-table a:hover {
		text-decoration: underline;
	}

	.text-muted {
		color: #999;
	}

	.property-cell {
		max-width: 150px;
	}

	.property-name {
		display: block;
		color: #1f1810;
		font-weight: 500;
	}

	.message-cell {
		max-width: 250px;
	}

	.message-preview {
		display: block;
		color: #666;
		margin-bottom: 5px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.btn-view {
		background: none;
		border: none;
		color: #0066cc;
		cursor: pointer;
		padding: 0;
		font-size: 12px;
		text-decoration: underline;
	}

	.btn-view:hover {
		color: #0052a3;
	}

	.date-cell {
		font-size: 13px;
	}

	.date {
		color: #1f1810;
		font-weight: 500;
	}

	.time {
		color: #999;
		margin-top: 3px;
	}

	.status-select {
		padding: 6px 10px;
		border: 1px solid #ddd;
		border-radius: 4px;
		font-size: 13px;
		font-weight: 600;
		cursor: pointer;
		background: white;
		color: #1f1810;
	}

	.status-select.status-new {
		border-color: #ff9800;
		color: #ff9800;
	}

	.status-select.status-contacted {
		border-color: #2196f3;
		color: #2196f3;
	}

	.status-select.status-closed {
		border-color: #4caf50;
		color: #4caf50;
	}

	.status-select:focus {
		outline: none;
		box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
	}

	.actions-cell {
		position: relative;
		text-align: center;
	}

	.btn-delete {
		background: none;
		border: none;
		cursor: pointer;
		font-size: 18px;
		padding: 5px 10px;
		border-radius: 4px;
		transition: all 0.2s;
	}

	.btn-delete:hover {
		background: #f5f5f5;
		transform: scale(1.1);
	}

	.delete-confirm {
		position: absolute;
		top: 100%;
		right: 0;
		background: white;
		border: 1px solid #ddd;
		border-radius: 4px;
		padding: 10px;
		margin-top: 5px;
		z-index: 100;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		white-space: nowrap;
	}

	.delete-confirm p {
		margin: 0 0 10px 0;
		font-size: 13px;
	}

	.btn-confirm,
	.btn-cancel {
		padding: 6px 10px;
		margin-right: 5px;
		border: none;
		border-radius: 3px;
		cursor: pointer;
		font-size: 12px;
		font-weight: 600;
	}

	.btn-confirm {
		background: #d32f2f;
		color: white;
	}

	.btn-confirm:hover {
		background: #b71c1c;
	}

	.btn-cancel {
		background: #f0f0f0;
		color: #1f1810;
	}

	.btn-cancel:hover {
		background: #ddd;
	}

	.no-results {
		background: white;
		padding: 60px 20px;
		text-align: center;
		border-radius: 8px;
		color: #999;
		font-size: 16px;
	}

	@media (max-width: 768px) {
		.filters {
			flex-direction: column;
			align-items: flex-start;
		}

		.filter-info {
			margin-left: 0;
			align-self: flex-start;
		}

		.page-header h1 {
			font-size: 24px;
		}

		.table-wrapper {
			overflow-x: auto;
		}

		.contacts-table {
			font-size: 12px;
		}

		.contacts-table th,
		.contacts-table td {
			padding: 10px;
		}

		.message-cell {
			display: none;
		}

		.property-cell {
			display: none;
		}
	}
</style>
