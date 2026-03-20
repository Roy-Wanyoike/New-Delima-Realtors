<script>
import Header from '$lib/components/header.svelte';   
import Footer from '$lib/components/footer.svelte';
import Chatbot from '$lib/components/Chatbot.svelte';
</script>

<Header></Header>
<main style="padding-top: 0;">
	<slot/>
</main>
<Footer/>
<Chatbot />