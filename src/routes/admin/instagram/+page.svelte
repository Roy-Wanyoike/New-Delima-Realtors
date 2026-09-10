<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { extractHashtags } from '$lib/data/instagram';

	$: isLoggedIn = $page.data?.isAdmin ?? false;

	let posts: any[] = [];
	let loading = true;
	let error = '';
	let success = '';

	// Form state for manual upload
	let form = {
		caption: '',
		imageUrl: '',
		permalink: 'https://www.instagram.com/p/'
	};
	let submitting = false;

	onMount(async () => {
		if (!isLoggedIn) return;
		await loadPosts();
	});

	async function loadPosts() {
		loading = true;
		try {
			const { supabase } = await import('$lib/supabase');
			if (!supabase) {
				error = 'Database not available';
				loading = false;
				return;
			}
			const { data, error: err } = await supabase
				.from('instagram_posts')
				.select('*')
				.order('posted_at', { ascending: false })
				.limit(20);
			if (err) throw err;
			posts = data ?? [];
		} catch (err: any) {
			error = err?.message ?? 'Failed to load posts';
		} finally {
			loading = false;
		}
	}

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		error = '';
		success = '';

		if (!form.caption || !form.imageUrl) {
			error = 'Caption and image URL are required';
			return;
		}

		submitting = true;
		try {
			const { supabase } = await import('$lib/supabase');
			if (!supabase) {
				error = 'Database not available';
				submitting = false;
				return;
			}
			const { error: err } = await supabase.from('instagram_posts').insert([
				{
					instagram_id: `manual-${Date.now()}`,
					caption: form.caption,
					media_url: form.imageUrl,
					permalink: form.permalink,
					posted_at: new Date().toISOString(),
					tags: extractHashtags(form.caption)
				}
			]);
			if (err) throw err;
			success = 'Post added to the feed!';
			form = { caption: '', imageUrl: '', permalink: 'https://www.instagram.com/p/' };
			await loadPosts();
		} catch (err: any) {
			error = err?.message ?? 'Failed to add post';
		} finally {
			submitting = false;
		}
	}

	async function deletePost(id: string) {
		if (!confirm('Delete this post from the feed?')) return;
		try {
			const { supabase } = await import('$lib/supabase');
			if (!supabase) return;
			const { error: err } = await supabase.from('instagram_posts').delete().eq('id', id);
			if (err) throw err;
			posts = posts.filter((p) => p.id !== id);
			success = 'Post deleted';
		} catch (err: any) {
			error = err?.message ?? 'Failed to delete';
		}
	}

	function formatDate(iso: string) {
		return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
	}
</script>

{#if isLoggedIn}
	<div class="admin-instagram">
		<div class="page-header">
			<h1>📸 Instagram Feed Manager</h1>
			<p>Add posts manually or sync from the Instagram Graph API</p>
		</div>

		<div class="container">
			<!-- Info banner -->
			<div class="info-banner">
				<h3>📋 Instagram Graph API Setup</h3>
				<p>To enable automatic sync from Instagram:</p>
				<ol>
					<li>Convert <strong>@delima_realtors</strong> to a Business or Creator account.</li>
					<li>Create a Meta Developer App at <a href="https://developers.facebook.com/apps/" target="_blank" rel="noopener noreferrer">developers.facebook.com</a>.</li>
					<li>Add the "Instagram Graph API" product and get your access token.</li>
					<li>Set <code>INSTAGRAM_USER_ID</code> and <code>INSTAGRAM_ACCESS_TOKEN</code> env vars.</li>
					<li>The sync endpoint (<code>/api/instagram/sync</code>) will auto-run via Vercel Cron.</li>
				</ol>
				<p><strong>Until then:</strong> use the manual upload form below to add posts to the feed.</p>
			</div>

			{#if success}
				<div class="alert alert-success">{success}</div>
			{/if}
			{#if error}
				<div class="alert alert-error">{error}</div>
			{/if}

			<!-- Manual upload form -->
			<div class="form-card">
				<h3>Add a post manually</h3>
				<form on:submit|preventDefault={handleSubmit}>
					<div class="form-group">
						<label for="caption">Caption *</label>
						<textarea id="caption" bind:value={form.caption} rows="3" placeholder="Paste the Instagram caption here (hashtags will be auto-extracted)"></textarea>
					</div>
					<div class="form-group">
						<label for="imageUrl">Image URL *</label>
						<input id="imageUrl" type="url" bind:value={form.imageUrl} placeholder="https://... or /lib/assets/..." />
					</div>
					<div class="form-group">
						<label for="permalink">Instagram permalink</label>
						<input id="permalink" type="url" bind:value={form.permalink} placeholder="https://www.instagram.com/p/XXXXX" />
					</div>
					{#if form.imageUrl}
						<div class="preview">
							<img src={form.imageUrl} alt="Preview" />
						</div>
					{/if}
					<button type="submit" class="btn-submit" disabled={submitting}>
						{submitting ? 'Adding…' : 'Add to feed'}
					</button>
				</form>
			</div>

			<!-- Existing posts -->
			<div class="posts-list">
				<h3>Feed posts ({posts.length})</h3>
				{#if loading}
					<p class="loading">Loading…</p>
				{:else if posts.length === 0}
					<p class="empty">No posts in the database yet. Add one above or enable the Graph API sync.</p>
				{:else}
					<div class="posts-table">
						{#each posts as post (post.id)}
							<div class="post-row">
								<img src={post.media_url} alt="" class="post-thumb" />
								<div class="post-info">
									<p class="post-caption">{post.caption?.slice(0, 100) ?? ''}{post.caption?.length > 100 ? '…' : ''}</p>
									<span class="post-date">{formatDate(post.posted_at)}</span>
									{#if post.tags && post.tags.length > 0}
										<div class="post-tags">
											{#each post.tags.slice(0, 3) as tag}
												<span class="tag">#{tag}</span>
											{/each}
										</div>
									{/if}
								</div>
								<button type="button" class="btn-delete" on:click={() => deletePost(post.id)}>🗑️</button>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	.admin-instagram {
		background: #f5f5f5;
		min-height: 100vh;
	}

	.page-header {
		background: linear-gradient(135deg, #1f1810 0%, #3d2f25 100%);
		color: white;
		padding: 40px 20px;
		text-align: center;
	}

	.page-header h1 {
		margin: 0;
		font-size: 28px;
	}

	.page-header p {
		margin: 10px 0 0;
		color: rgba(255, 255, 255, 0.8);
	}

	.container {
		max-width: 800px;
		margin: 0 auto;
		padding: 30px 20px;
	}

	.info-banner {
		background: #e7f4ff;
		border: 1px solid #b8daff;
		border-radius: 10px;
		padding: 20px;
		margin-bottom: 30px;
	}

	.info-banner h3 {
		margin: 0 0 10px;
		color: #004085;
	}

	.info-banner p {
		margin: 8px 0;
		color: #004085;
		font-size: 0.9rem;
		line-height: 1.5;
	}

	.info-banner ol {
		margin: 8px 0;
		padding-left: 20px;
		color: #004085;
		font-size: 0.88rem;
		line-height: 1.6;
	}

	.info-banner code {
		background: #d0e4ff;
		padding: 2px 6px;
		border-radius: 3px;
		font-family: monospace;
		font-size: 0.85rem;
	}

	.info-banner a {
		color: #0066cc;
	}

	.alert {
		padding: 12px 18px;
		border-radius: 8px;
		margin-bottom: 20px;
		font-weight: 500;
	}

	.alert-success {
		background: #d4edda;
		color: #155724;
		border: 1px solid #c3e6cb;
	}

	.alert-error {
		background: #f8d7da;
		color: #721c24;
		border: 1px solid #f5c6cb;
	}

	.form-card {
		background: white;
		padding: 28px;
		border-radius: 12px;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
		margin-bottom: 30px;
		border-left: 4px solid #d4af37;
	}

	.form-card h3 {
		margin: 0 0 20px;
		color: #1f1810;
	}

	.form-group {
		margin-bottom: 18px;
	}

	.form-group label {
		display: block;
		margin-bottom: 6px;
		font-weight: 600;
		color: #1f1810;
		font-size: 0.88rem;
	}

	.form-group input,
	.form-group textarea {
		width: 100%;
		padding: 10px 12px;
		border: 1px solid #ddd;
		border-radius: 6px;
		font-size: 0.9rem;
		font-family: inherit;
	}

	.form-group input:focus,
	.form-group textarea:focus {
		outline: none;
		border-color: #d4af37;
		box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.15);
	}

	.preview {
		margin-top: 12px;
		max-width: 200px;
		border-radius: 6px;
		overflow: hidden;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.preview img {
		width: 100%;
		height: auto;
		display: block;
	}

	.btn-submit {
		background: linear-gradient(135deg, #d4af37, #b8941f);
		color: #1f1810;
		border: none;
		padding: 12px 28px;
		border-radius: 8px;
		font-weight: 700;
		cursor: pointer;
		font-family: inherit;
		font-size: 0.9rem;
		transition: transform 0.2s, box-shadow 0.2s;
	}

	.btn-submit:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(212, 175, 55, 0.4);
	}

	.btn-submit:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.posts-list {
		background: white;
		padding: 28px;
		border-radius: 12px;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
	}

	.posts-list h3 {
		margin: 0 0 18px;
		color: #1f1810;
	}

	.loading, .empty {
		text-align: center;
		padding: 30px;
		color: #999;
	}

	.posts-table {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.post-row {
		display: flex;
		align-items: center;
		gap: 14px;
		padding: 12px;
		background: #f9f9f9;
		border-radius: 8px;
		border: 1px solid #eee;
	}

	.post-thumb {
		width: 60px;
		height: 60px;
		object-fit: cover;
		border-radius: 6px;
		flex-shrink: 0;
	}

	.post-info {
		flex: 1;
		min-width: 0;
	}

	.post-caption {
		margin: 0 0 4px;
		font-size: 0.85rem;
		color: #333;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.post-date {
		font-size: 0.78rem;
		color: #999;
	}

	.post-tags {
		display: flex;
		gap: 4px;
		margin-top: 4px;
	}

	.tag {
		background: rgba(212, 175, 55, 0.12);
		color: #8a6d10;
		padding: 2px 8px;
		border-radius: 8px;
		font-size: 0.7rem;
	}

	.btn-delete {
		background: #ffebee;
		border: 1px solid #ffcdd2;
		border-radius: 6px;
		padding: 8px 12px;
		cursor: pointer;
		font-size: 1rem;
		flex-shrink: 0;
	}

	.btn-delete:hover {
		background: #ef5350;
	}
</style>
