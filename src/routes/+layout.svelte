<script lang="ts">
	import Header from '$lib/components/header.svelte';
	import Footer from '$lib/components/footer.svelte';
	import Chatbot from '$lib/components/Chatbot.svelte';
	import CompareBar from '$lib/components/CompareBar.svelte';
	import ScrollToTop from '$lib/components/ScrollToTop.svelte';
	import Toaster from '$lib/components/Toaster.svelte';
</script>

<div class="app-shell">
	<Header />
	<main class="app-main">
		<slot />
	</main>
	<Footer />
	<Chatbot />
	<CompareBar />
	<ScrollToTop />
	<Toaster />
</div>

<style>
	.app-shell {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	.app-main {
		flex: 1;
		padding-top: 0;
	}
</style>
