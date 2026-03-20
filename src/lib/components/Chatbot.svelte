<script lang="ts">
	import { onMount } from 'svelte';

	let isOpen = false;
	let messages: Array<{ role: 'user' | 'bot'; text: string }> = [
		{ role: 'bot', text: 'Hello! Welcome to Delima Realtors. How can I help you find your dream property today?' }
	];
	let inputValue = '';
	let isTyping = false;

	const faqResponses: Record<string, string> = {
		'price': 'Our properties range from KES 6M for studios to KES 150M+ for luxury villas. What budget range are you looking at?',
		'location': 'We have properties in Westlands, Kilimani, Kileleshwa, Langata, Loresho, Kitisuru, and more prime Nairobi locations.',
		'bedroom': 'We offer studios, 1-5 bedroom apartments, and 4-5 bedroom villas with DSQs. How many bedrooms do you need?',
		'bedrooms': 'We offer studios, 1-5 bedroom apartments, and 4-5 bedroom villas with DSQs. How many bedrooms do you need?',
		'contact': 'You can reach us at +254 727 523 752 or visit our office. Would you like to book an appointment?',
		'amenities': 'Our properties feature swimming pools, gyms, parking, security, lifts, gardens, and more.',
		'viewing': 'To book a viewing, please call us at +254 727 523 752 or use our contact form.',
		'buy': 'We have excellent properties for sale! Tell me your budget and preferred location to see options.',
		'rent': 'Currently we focus on property sales. For rentals, contact us directly for available options.',
		'hello': 'Hello! How can I help you today?',
		'hi': 'Hi there! Looking for a property? I can help!',
		'help': 'I can help you find properties, answer questions about locations, prices, amenities, or book viewings. What do you need?'
	};

	function toggleChat() {
		isOpen = !isOpen;
	}

	function sendMessage() {
		if (!inputValue.trim()) return;

		const userText = inputValue.trim();
		messages = [...messages, { role: 'user', text: userText }];
		inputValue = '';
		isTyping = true;

		// Simulate bot response
		setTimeout(() => {
			const response = generateResponse(userText);
			messages = [...messages, { role: 'bot', text: response }];
			isTyping = false;
		}, 800);
	}

	function generateResponse(userText: string): string {
		const lowerText = userText.toLowerCase();
		
		// Check for FAQ matches
		for (const [keyword, response] of Object.entries(faqResponses)) {
			if (lowerText.includes(keyword)) {
				return response;
			}
		}

		// Default responses
		if (lowerText.includes('westlands')) {
			return 'Great choice! Westlands has excellent 1-4 bedroom apartments from KES 17.7M to KES 22.1M. Would you like details on specific units?';
		}
		if (lowerText.includes('kilimani')) {
			return 'Kilimani is a prime location! We have properties from KES 6.4M studios to KES 29.4M luxury apartments with DSQs. Interested in viewing?';
		}
		if (lowerText.includes('villa')) {
			return 'Our villas are stunning! We have 4-bed in Kitisuru (KES 85M) and 5-bed in Loresho (KES 150M) with pools and gardens. Want more details?';
		}
		if (lowerText.includes('penthouse')) {
			return 'Our Kileleshwa penthouse (KES 41M) features 5 bedrooms, private lift, and rooftop terrace with city views. Shall we arrange a viewing?';
		}
		if (lowerText.includes('dsq') || lowerText.includes('servant')) {
			return 'Many of our properties include DSQs (Domestic Servant Quarters). We have options in Kilimani, Kileleshwa, and Westlands from KES 10.5M to KES 41M.';
		}
		if (lowerText.includes('pool') || lowerText.includes('swimming')) {
			return 'Several properties have swimming pools! Our Loresho Villa and Langata Townhouses feature shared pools. Prices from KES 35.9M.';
		}
		if (lowerText.includes('thank')) {
			return "You're welcome! Feel free to ask if you have more questions. Have a great day!";
		}
		if (lowerText.includes('bye') || lowerText.includes('goodbye')) {
			return 'Thank you for chatting with Delima Realtors! Contact us at +254 727 523 752 to book viewings. Have a wonderful day!';
		}

		// Default response
		return "I can help you find properties in Nairobi's best neighborhoods. Tell me your budget, preferred location (Westlands, Kilimani, Kileleshwa, etc.), or property type (apartment, villa, penthouse) and I'll suggest options!";
	}

	function handleKeyPress(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			sendMessage();
		}
	}

	// Auto-open after 5 seconds
	onMount(() => {
		setTimeout(() => {
			if (!isOpen) {
				isOpen = true;
			}
		}, 5000);
	});
</script>

<div class="chatbot-container">
	<!-- Toggle Button -->
	<button class="chat-toggle" on:click={toggleChat}>
		{#if isOpen}
			✕
		{:else}
			💬
		{/if}
	</button>

	<!-- Chat Window -->
	{#if isOpen}
		<div class="chat-window">
			<div class="chat-header">
				<div class="header-info">
					<span class="avatar">🏠</span>
					<div>
						<h4>Delima Realtors</h4>
						<span class="status">Online</span>
					</div>
				</div>
			</div>

			<div class="chat-messages">
				{#each messages as msg}
					<div class="message {msg.role}">
						<div class="message-bubble">
							{msg.text}
						</div>
					</div>
				{/each}
				{#if isTyping}
					<div class="message bot">
						<div class="typing-indicator">
							<span></span>
							<span></span>
							<span></span>
						</div>
					</div>
				{/if}
			</div>

			<div class="chat-input">
				<input
					type="text"
					placeholder="Type your message..."
					bind:value={inputValue}
					on:keypress={handleKeyPress}
				/>
				<button on:click={sendMessage}>Send</button>
			</div>
		</div>
	{/if}
</div>

<style>
	.chatbot-container {
		position: fixed;
		bottom: 20px;
		right: 20px;
		z-index: 9999;
		font-family: 'Jost', sans-serif;
	}

	.chat-toggle {
		width: 60px;
		height: 60px;
		border-radius: 50%;
		background: linear-gradient(135deg, #d4af37 0%, #b8941f 100%);
		color: white;
		border: none;
		font-size: 24px;
		cursor: pointer;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
		transition: all 0.3s ease;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.chat-toggle:hover {
		transform: scale(1.1);
		box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
	}

	.chat-window {
		position: absolute;
		bottom: 80px;
		right: 0;
		width: 350px;
		max-height: 500px;
		background: white;
		border-radius: 12px;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
		display: flex;
		flex-direction: column;
		overflow: hidden;
		animation: slideIn 0.3s ease;
	}

	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.chat-header {
		background: linear-gradient(135deg, #1f1810 0%, #3d2f25 100%);
		color: white;
		padding: 16px;
	}

	.header-info {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.avatar {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		background: #d4af37;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 20px;
	}

	.header-info h4 {
		margin: 0;
		font-size: 16px;
		font-weight: 600;
	}

	.status {
		font-size: 12px;
		color: #4ade80;
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.status::before {
		content: '';
		width: 8px;
		height: 8px;
		background: #4ade80;
		border-radius: 50%;
	}

	.chat-messages {
		flex: 1;
		padding: 16px;
		overflow-y: auto;
		background: #f8f9fa;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.message {
		display: flex;
	}

	.message.user {
		justify-content: flex-end;
	}

	.message-bubble {
		max-width: 80%;
		padding: 12px 16px;
		border-radius: 16px;
		font-size: 14px;
		line-height: 1.5;
	}

	.message.bot .message-bubble {
		background: white;
		color: #1f1810;
		border-bottom-left-radius: 4px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.message.user .message-bubble {
		background: linear-gradient(135deg, #d4af37 0%, #b8941f 100%);
		color: white;
		border-bottom-right-radius: 4px;
	}

	.typing-indicator {
		display: flex;
		gap: 4px;
		padding: 16px;
		background: white;
		border-radius: 16px;
		border-bottom-left-radius: 4px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.typing-indicator span {
		width: 8px;
		height: 8px;
		background: #d4af37;
		border-radius: 50%;
		animation: bounce 1.4s infinite ease-in-out;
	}

	.typing-indicator span:nth-child(1) { animation-delay: 0s; }
	.typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
	.typing-indicator span:nth-child(3) { animation-delay: 0.4s; }

	@keyframes bounce {
		0%, 80%, 100% { transform: scale(0.6); }
		40% { transform: scale(1); }
	}

	.chat-input {
		display: flex;
		padding: 12px;
		background: white;
		border-top: 1px solid #e5e7eb;
		gap: 8px;
	}

	.chat-input input {
		flex: 1;
		padding: 12px 16px;
		border: 1px solid #e5e7eb;
		border-radius: 24px;
		font-size: 14px;
		outline: none;
		font-family: inherit;
	}

	.chat-input input:focus {
		border-color: #d4af37;
	}

	.chat-input button {
		padding: 12px 20px;
		background: linear-gradient(135deg, #d4af37 0%, #b8941f 100%);
		color: white;
		border: none;
		border-radius: 24px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s;
	}

	.chat-input button:hover {
		transform: scale(1.05);
		box-shadow: 0 4px 12px rgba(212, 175, 55, 0.4);
	}

	/* Mobile Responsive */
	@media (max-width: 480px) {
		.chat-window {
			width: calc(100vw - 40px);
			max-height: 70vh;
		}
	}
</style>
