<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { adminAuth, logoutAdmin } from '$lib/stores/adminAuth';
	import { supabase } from '$lib/supabase';

	let isLoggedIn = false;
	let projects: any[] = [];
	let loading = false;
	let showForm = false;
	let editingId: string | null = null;
	let uploading = false;
	let imageFile: File | null = null;
	let imagePreview = '';

	// Form data
	let formData = {
		title: '',
		description: '',
		location: '',
		price: '',
		bedrooms: '',
		bathrooms: '',
		imageUrl: '',
		category: 'Residential',
		status: 'published',
		featured: false,
		amenities: ''
	};

	let error = '';
	let success = '';

	// Filter and sort
	let filterLocation = '';
	let sortBy = 'recent';

	onMount(() => {
		adminAuth.subscribe((auth) => {
			isLoggedIn = auth.isLoggedIn;
			if (!isLoggedIn) {
				goto('/admin/login');
			}
		});

		loadProjects();
	});

	async function loadProjects() {
		try {
			let query = supabase.from('projects').select('*');
			
			const { data, error: err } = await query;
			if (err) throw err;
			
			// Filter and sort
			let filtered = data || [];
			if (filterLocation) {
				filtered = filtered.filter(p => 
					p.location.toLowerCase().includes(filterLocation.toLowerCase())
				);
			}
			
			if (sortBy === 'recent') {
				filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
			} else if (sortBy === 'featured') {
				filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
			}
			
			projects = filtered;
		} catch (err) {
			console.error('Error loading projects:', err);
			error = 'Failed to load projects';
		}
	}

	function openEditForm(project: any) {
		editingId = project.id;
		formData = { ...project };
		imagePreview = project.imageUrl;
		showForm = true;
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	function resetForm() {
		editingId = null;
		formData = {
			title: '',
			description: '',
			location: '',
			price: '',
			bedrooms: '',
			bathrooms: '',
			imageUrl: '',
			category: 'Residential',
			status: 'published',
			featured: false,
			amenities: ''
		};
		imageFile = null;
		imagePreview = '';
		error = '';
	}

	async function handleImageUpload(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		imageFile = file;
		imagePreview = URL.createObjectURL(file);
	}

	async function uploadImageToSupabase(file: File): Promise<string> {
		const fileName = `${Date.now()}-${file.name}`;
		const { data, error: err } = await supabase.storage
			.from('project-images')
			.upload(fileName, file);

		if (err) throw new Error(`Upload failed: ${err.message}`);

		const { data: publicData } = supabase.storage
			.from('project-images')
			.getPublicUrl(fileName);

		return publicData.publicUrl;
	}

	async function handleSubmit() {
		error = '';
		success = '';
		loading = true;

		if (!formData.title || !formData.description || !formData.location || !formData.price) {
			error = 'Please fill in all required fields';
			loading = false;
			return;
		}

		try {
			let imageUrl = formData.imageUrl;

			// Upload image if a new one was selected
			if (imageFile) {
				uploading = true;
				imageUrl = await uploadImageToSupabase(imageFile);
				uploading = false;
			}

			const dataToSubmit = {
				...formData,
				imageUrl,
				updated_at: new Date().toISOString()
			};

			if (editingId) {
				// Update existing project
				const { error: err } = await supabase
					.from('projects')
					.update(dataToSubmit)
					.eq('id', editingId);

				if (err) throw err;
				success = 'Project updated successfully!';
			} else {
				// Create new project
				const { error: err } = await supabase.from('projects').insert([dataToSubmit]);
				if (err) throw err;
				success = 'Project added successfully!';
			}

			resetForm();
			showForm = false;
			await loadProjects();
		} catch (err: any) {
			error = `Error: ${err?.message || 'Unknown error'}`;
		} finally {
			loading = false;
			uploading = false;
		}
	}

	async function deleteProject(id: string) {
		if (!confirm('Are you sure you want to delete this project?')) return;

		try {
			const { error: err } = await supabase.from('projects').delete().eq('id', id);
			if (err) throw err;
			success = 'Project deleted successfully!';
			await loadProjects();
		} catch (err: any) {
			error = `Error: ${err?.message || 'Unknown error'}`;
		}
	}

	async function toggleFeatured(project: any) {
		try {
			const { error: err } = await supabase
				.from('projects')
				.update({ featured: !project.featured })
				.eq('id', project.id);

			if (err) throw err;
			project.featured = !project.featured;
			success = `Project ${project.featured ? 'marked as' : 'unmarked as'} featured!`;
			await loadProjects();
		} catch (err: any) {
			error = `Error: ${err?.message || 'Unknown error'}`;
		}
	}

	async function updateStatus(id: string, newStatus: string) {
		try {
			const { error: err } = await supabase
				.from('projects')
				.update({ status: newStatus })
				.eq('id', id);

			if (err) throw err;
			await loadProjects();
		} catch (err: any) {
			error = `Error: ${err?.message || 'Unknown error'}`;
		}
	}

	async function loadDummyData() {
		if (!confirm('This will add 6 sample properties to the database. Continue?')) return;
		
		loading = true;
		error = '';
		success = '';
		
		const dummyProjects = [
			{
				title: '2, 3 & 4 Bedroom Apartments - Westlands',
				description: 'Modern apartments in the heart of Westlands with excellent finishes, spacious balconies, and proximity to shopping centers.',
				location: 'Westlands, Nairobi',
				price: '17700000',
				bedrooms: '3',
				bathrooms: '2',
				imageUrl: '/lib/assets/project-1.jpg',
				category: 'Apartment',
				status: 'published',
				featured: true,
				amenities: 'Parking, Lift, Generator, Borehole, Gym, CCTV'
			},
			{
				title: '3, 4 & 5 Bedroom Apartments with DSQs',
				description: 'Luxury apartments in Kilimani featuring servant quarters, high-end finishes, and rooftop terrace with city views.',
				location: 'Kilimani, Nairobi',
				price: '29400000',
				bedrooms: '4',
				bathrooms: '3',
				imageUrl: '/lib/assets/apartments-3.jpg',
				category: 'Apartment',
				status: 'published',
				featured: true,
				amenities: 'DSQ, Swimming Pool, Gym, Parking, Solar'
			},
			{
				title: '5 Bedroom Villa - Loresho',
				description: 'Magnificent 5-bedroom villa sitting on half-acre land. Features swimming pool, mature garden, and guest house.',
				location: 'Loresho, Nairobi',
				price: '150000000',
				bedrooms: '5',
				bathrooms: '6',
				imageUrl: '/lib/assets/project-2.jpg',
				category: 'Villa',
				status: 'published',
				featured: true,
				amenities: 'Swimming Pool, Garden, Guest House, Parking, Security'
			},
			{
				title: '4 Bedroom Villa - Kitisuru',
				description: 'Elegant 4-bedroom villa with panoramic views. Open-plan living, modern kitchen, and expansive garden.',
				location: 'Kitisuru, Nairobi',
				price: '85000000',
				bedrooms: '4',
				bathrooms: '5',
				imageUrl: '/lib/assets/project-3.jpg',
				category: 'Villa',
				status: 'published',
				featured: true,
				amenities: 'Garden, Parking, Staff Quarters, Security, View'
			},
			{
				title: '4 Bedroom Townhouses - Langata',
				description: 'Modern townhouses with shared swimming pool and playground. Perfect for families.',
				location: 'Langata, Nairobi',
				price: '35900000',
				bedrooms: '4',
				bathrooms: '4',
				imageUrl: '/lib/assets/amenities-1.jpg',
				category: 'Townhouse',
				status: 'published',
				featured: false,
				amenities: 'Swimming Pool, Garden, Parking, Playground'
			},
			{
				title: '5 Bedroom Penthouse - Kileleshwa',
				description: 'Luxurious penthouse with panoramic views, private lift, and rooftop terrace.',
				location: 'Kileleshwa, Nairobi',
				price: '41000000',
				bedrooms: '5',
				bathrooms: '6',
				imageUrl: '/lib/assets/amenities-4.jpg',
				category: 'Penthouse',
				status: 'published',
				featured: true,
				amenities: 'DSQ, Private Lift, Rooftop Terrace, Parking, Gym'
			}
		];
		
		try {
			const { error: err } = await supabase.from('projects').insert(dummyProjects);
			if (err) throw err;
			success = 'Sample properties added successfully!';
			await loadProjects();
		} catch (err: any) {
			error = `Error adding dummy data: ${err?.message || 'Unknown error'}`;
		} finally {
			loading = false;
		}
	}

	function handleLogout() {
		logoutAdmin();
		goto('/admin/login');
	}
</script>

{#if isLoggedIn}
	<div class="admin-dashboard">
		<header class="admin-header">
			<div class="header-content">
				<h1>📊 Project Management</h1>
				<button on:click={handleLogout} class="logout-btn">Logout</button>
			</div>
		</header>

		<main class="dashboard-main">
			<div class="dashboard-container">
				<div class="controls">
					<div class="controls-left">
						<h2>Projects</h2>
						<div class="filters">
							<input
								type="text"
								placeholder="Filter by location..."
								bind:value={filterLocation}
								on:change={loadProjects}
								class="filter-input"
							/>
							<select bind:value={sortBy} on:change={loadProjects} class="sort-select">
								<option value="recent">Most Recent</option>
								<option value="featured">Featured First</option>
							</select>
						</div>
					</div>
					<div class="controls-right">
						<button on:click={loadDummyData} class="btn-secondary" disabled={loading}>
							📥 Load Sample Data
						</button>
						<button on:click={() => { resetForm(); showForm = !showForm; }} class="btn-primary">
							{showForm ? '✕ Cancel' : '+ Add New Project'}
						</button>
					</div>
				</div>

				{#if success}
					<div class="alert alert-success">{success}</div>
				{/if}

				{#if error}
					<div class="alert alert-error">{error}</div>
				{/if}

				{#if showForm}
					<div class="form-section">
						<h3>{editingId ? '✏️ Edit Project' : '➕ Add New Project'}</h3>
						<form on:submit|preventDefault={handleSubmit}>
							<div class="form-row">
								<div class="form-group">
									<label for="title">Title *</label>
									<input
										id="title"
										type="text"
										bind:value={formData.title}
										placeholder="Project name"
									/>
								</div>
								<div class="form-group">
									<label for="category">Category</label>
									<select id="category" bind:value={formData.category}>
										<option value="Residential">Residential</option>
										<option value="Commercial">Commercial</option>
										<option value="Land">Land</option>
										<option value="Luxury">Luxury</option>
										<option value="Investment">Investment</option>
									</select>
								</div>
							</div>

							<div class="form-group">
								<label for="description">Description *</label>
								<textarea
									id="description"
									bind:value={formData.description}
									placeholder="Detailed description of the property"
									rows="4"
								></textarea>
							</div>

							<div class="form-row">
								<div class="form-group">
									<label for="location">Location *</label>
									<input
										id="location"
										type="text"
										bind:value={formData.location}
										placeholder="e.g., Westlands, Nairobi"
									/>
								</div>
								<div class="form-group">
									<label for="price">Price (KES) *</label>
									<input
										id="price"
										type="number"
										bind:value={formData.price}
										placeholder="e.g., 5000000"
									/>
								</div>
							</div>

							<div class="form-row">
								<div class="form-group">
									<label for="bedrooms">Bedrooms</label>
									<input
										id="bedrooms"
										type="number"
										bind:value={formData.bedrooms}
										placeholder="e.g., 3"
									/>
								</div>
								<div class="form-group">
									<label for="bathrooms">Bathrooms</label>
									<input
										id="bathrooms"
										type="number"
										bind:value={formData.bathrooms}
										placeholder="e.g., 2"
									/>
								</div>
							</div>

							<div class="form-group">
								<label for="imageFile">Property Image</label>
								<input
									id="imageFile"
									type="file"
									accept="image/*"
									on:change={handleImageUpload}
									class="file-input"
									disabled={uploading}
								/>
								{#if imagePreview}
									<div class="image-preview">
										<img src={imagePreview} alt="Preview" />
									</div>
								{/if}
							</div>

							<div class="form-group">
								<label for="amenities">Amenities</label>
								<input
									id="amenities"
									type="text"
									bind:value={formData.amenities}
									placeholder="e.g., Swimming Pool, Gym, Garden, Parking"
								/>
							</div>

							<div class="form-row">
								<div class="form-group">
									<label for="status">Status</label>
									<select id="status" bind:value={formData.status}>
										<option value="published">Published</option>
										<option value="draft">Draft</option>
										<option value="sold">Sold</option>
									</select>
								</div>
								<div class="form-group checkbox-group">
									<label for="featured">
										<input
											id="featured"
											type="checkbox"
											bind:checked={formData.featured}
										/>
										<span>Mark as Featured ⭐</span>
									</label>
								</div>
							</div>

							<button type="submit" class="btn-submit" disabled={loading || uploading}>
								{loading ? 'Saving...' : uploading ? 'Uploading...' : editingId ? 'Save Changes' : 'Add Project'}
							</button>
						</form>
					</div>
				{/if}

				<div class="projects-list">
					<h3>All Projects ({projects.length})</h3>

					{#if projects.length === 0}
						<p class="no-projects">
							{filterLocation ? 'No projects found in that location.' : 'No projects added yet.'}
							Click "Add New Project" to get started.
						</p>
					{:else}
						<div class="projects-grid">
							{#each projects as project (project.id)}
								<div class="project-card" class:featured={project.featured} class:sold={project.status === 'sold'}>
									{#if project.featured}
										<div class="featured-badge">⭐ Featured</div>
									{/if}
									{#if project.status === 'sold'}
										<div class="sold-badge">SOLD</div>
									{/if}
									<img src={project.imageUrl} alt={project.title} class="project-image" />
									<div class="project-info">
										<h4>{project.title}</h4>
										<p class="category">{project.category}</p>
										<p class="location">📍 {project.location}</p>
										<p class="price">KES {parseInt(project.price).toLocaleString()}</p>
										{#if project.bedrooms || project.bathrooms}
											<p class="specs">
												🛏️ {project.bedrooms || '-'} Beds | 🚿 {project.bathrooms || '-'} Baths
											</p>
										{/if}
										{#if project.amenities}
											<p class="amenities" title={project.amenities}>🏠 {project.amenities}</p>
										{/if}
										<div class="status-select">
											<select 
												value={project.status} 
												on:change={(e) => updateStatus(project.id, e.currentTarget.value)}
												class="status-dropdown"
											>
												<option value="published">Published</option>
												<option value="draft">Draft</option>
												<option value="sold">Sold</option>
											</select>
										</div>
										<div class="action-buttons">
											<button
												on:click={() => openEditForm(project)}
												class="btn-edit"
												title="Edit project"
											>
												✏️ Edit
											</button>
											<button
												on:click={() => toggleFeatured(project)}
												class="btn-featured"
												class:active={project.featured}
												title={project.featured ? 'Remove from featured' : 'Mark as featured'}
											>
												⭐
											</button>
											<button
												on:click={() => deleteProject(project.id)}
												class="btn-delete"
												title="Delete project"
											>
												🗑️
											</button>
										</div>
									</div>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			</div>
		</main>
	</div>
{/if}

<style>
	.admin-dashboard {
		background: #f5f5f5;
		min-height: 100vh;
	}

	.admin-header {
		background: linear-gradient(135deg, #1f1810 0%, #3d2f25 100%);
		color: white;
		padding: 20px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
	}

	.header-content {
		max-width: 1400px;
		margin: 0 auto;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.header-content h1 {
		margin: 0;
		font-size: 28px;
	}

	.logout-btn {
		background: #d4af37;
		color: #1f1810;
		padding: 10px 20px;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-weight: 600;
		transition: all 0.3s;
	}

	.logout-btn:hover {
		background: #efbe5c;
		transform: translateY(-2px);
	}

	.dashboard-main {
		padding: 30px 20px;
	}

	.dashboard-container {
		max-width: 1400px;
		margin: 0 auto;
	}

	.controls {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 30px;
		gap: 20px;
	}

	.controls-left {
		flex: 1;
	}

	.controls-left h2 {
		margin: 0 0 15px 0;
		color: #1f1810;
	}

	.filters {
		display: flex;
		gap: 10px;
	}

	.filter-input,
	.sort-select {
		padding: 10px;
		border: 1px solid #ddd;
		border-radius: 4px;
		font-size: 14px;
		background: white;
	}

	.filter-input {
		flex: 1;
		max-width: 300px;
	}

	.filter-input:focus,
	.sort-select:focus {
		outline: none;
		border-color: #0066cc;
		box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
	}

	.controls-right {
		display: flex;
		gap: 10px;
	}

	.btn-secondary {
		background: linear-gradient(135deg, #6c757d, #5a6268);
		color: white;
		padding: 12px 24px;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-weight: 600;
		transition: all 0.3s;
		white-space: nowrap;
	}

	.btn-secondary:hover:not(:disabled) {
		background: linear-gradient(135deg, #5a6268, #495057);
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
	}

	.btn-secondary:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.btn-primary {
		background: linear-gradient(135deg, #0066cc, #0052a3);
		color: white;
		padding: 12px 24px;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-weight: 600;
		transition: all 0.3s;
		white-space: nowrap;
	}

	.btn-primary:hover {
		background: linear-gradient(135deg, #0052a3, #003d7a);
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 102, 204, 0.3);
	}

	.alert {
		padding: 15px;
		border-radius: 4px;
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

	.form-section {
		background: white;
		padding: 30px;
		border-radius: 8px;
		margin-bottom: 30px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		border-left: 4px solid #0066cc;
	}

	.form-section h3 {
		color: #1f1810;
		margin-top: 0;
	}

	.form-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 20px;
	}

	.form-group {
		margin-bottom: 20px;
	}

	.form-group label {
		display: block;
		margin-bottom: 8px;
		color: #1f1810;
		font-weight: 600;
		font-size: 14px;
	}

	.form-group input,
	.form-group select,
	.form-group textarea {
		width: 100%;
		padding: 10px;
		border: 1px solid #ddd;
		border-radius: 4px;
		font-size: 14px;
		font-family: inherit;
	}

	.form-group input:focus,
	.form-group select:focus,
	.form-group textarea:focus {
		outline: none;
		border-color: #0066cc;
		box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
	}

	.file-input {
		padding: 8px !important;
		cursor: pointer;
	}

	.file-input:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.image-preview {
		margin-top: 15px;
		max-width: 250px;
		border-radius: 4px;
		overflow: hidden;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.image-preview img {
		width: 100%;
		height: auto;
		display: block;
	}

	.checkbox-group {
		display: flex;
		align-items: center;
	}

	.checkbox-group label {
		display: flex;
		align-items: center;
		gap: 8px;
		margin: 0;
		cursor: pointer;
		font-weight: 600;
	}

	.checkbox-group input[type="checkbox"] {
		width: auto;
		cursor: pointer;
	}

	.btn-submit {
		background: linear-gradient(135deg, #0066cc, #0052a3);
		color: white;
		padding: 12px 32px;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-weight: 600;
		font-size: 16px;
		transition: all 0.3s;
	}

	.btn-submit:hover:not(:disabled) {
		background: linear-gradient(135deg, #0052a3, #003d7a);
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 102, 204, 0.3);
	}

	.btn-submit:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.projects-list {
		background: white;
		padding: 30px;
		border-radius: 8px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.projects-list h3 {
		color: #1f1810;
		margin-top: 0;
	}

	.no-projects {
		text-align: center;
		color: #999;
		padding: 40px 20px;
		font-style: italic;
	}

	.projects-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 20px;
	}

	.project-card {
		border: 1px solid #ddd;
		border-radius: 8px;
		overflow: hidden;
		transition: all 0.3s;
		position: relative;
		background: white;
	}

	.project-card:hover {
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
		transform: translateY(-4px);
	}

	.project-card.featured {
		border-color: #d4af37;
		border-width: 2px;
	}

	.project-card.sold {
		opacity: 0.75;
	}

	.featured-badge {
		position: absolute;
		top: 10px;
		left: 10px;
		background: rgba(212, 175, 55, 0.95);
		color: white;
		padding: 6px 12px;
		border-radius: 20px;
		font-size: 12px;
		font-weight: 600;
		z-index: 10;
	}

	.sold-badge {
		position: absolute;
		top: 10px;
		right: 10px;
		background: rgba(220, 53, 69, 0.95);
		color: white;
		padding: 8px 12px;
		border-radius: 4px;
		font-size: 11px;
		font-weight: 700;
		z-index: 10;
	}

	.project-image {
		width: 100%;
		height: 220px;
		object-fit: cover;
	}

	.project-info {
		padding: 15px;
	}

	.project-info h4 {
		margin: 0 0 8px 0;
		color: #1f1810;
		font-size: 16px;
	}

	.category {
		display: inline-block;
		background: #d4af37;
		color: #1f1810;
		padding: 4px 10px;
		border-radius: 4px;
		font-size: 12px;
		font-weight: 600;
		margin-bottom: 8px;
	}

	.location,
	.price,
	.specs {
		margin: 5px 0;
		font-size: 13px;
		color: #555;
	}

	.price {
		font-weight: 700;
		color: #0066cc;
		font-size: 16px;
	}

	.amenities {
		font-size: 12px;
		color: #666;
		margin: 8px 0;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.status-select {
		margin: 10px 0;
	}

	.status-dropdown {
		width: 100%;
		padding: 6px;
		border: 1px solid #ddd;
		border-radius: 4px;
		font-size: 12px;
		cursor: pointer;
	}

	.status-dropdown:focus {
		outline: none;
		border-color: #0066cc;
	}

	.action-buttons {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
		gap: 8px;
		margin-top: 12px;
	}

	.btn-edit,
	.btn-featured,
	.btn-delete {
		padding: 8px;
		border: 1px solid #ddd;
		border-radius: 4px;
		cursor: pointer;
		font-weight: 600;
		font-size: 12px;
		transition: all 0.3s;
	}

	.btn-edit {
		background: #e8f4f8;
		color: #0066cc;
		border-color: #0066cc;
	}

	.btn-edit:hover {
		background: #0066cc;
		color: white;
	}

	.btn-featured {
		background: white;
		color: #d4af37;
		border-color: #d4af37;
	}

	.btn-featured.active {
		background: #d4af37;
		color: white;
	}

	.btn-featured:hover {
		background: #d4af37;
		color: white;
	}

	.btn-delete {
		background: #ffebee;
		color: #dc3545;
		border-color: #dc3545;
	}

	.btn-delete:hover {
		background: #dc3545;
		color: white;
	}

	@media (max-width: 768px) {
		.form-row {
			grid-template-columns: 1fr;
		}

		.filters {
			flex-direction: column;
		}

		.controls {
			flex-direction: column;
			align-items: stretch;
		}

		.projects-grid {
			grid-template-columns: 1fr;
		}

		.header-content {
			flex-direction: column;
			gap: 15px;
			text-align: center;
		}

		.header-content h1 {
			font-size: 22px;
		}

		.btn-primary {
			width: 100%;
		}

		.action-buttons {
			grid-template-columns: 1fr 1fr;
		}

		.btn-delete {
			grid-column: 1 / -1;
		}
	}
</style>
