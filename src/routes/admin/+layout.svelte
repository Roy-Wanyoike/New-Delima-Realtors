<script>
	import { onMount } from 'svelte';
	import { adminAuth } from '$lib/stores/adminAuth';

	let isLoading = true;

	onMount(() => {
		isLoading = false;
	});
</script>

<slot />
