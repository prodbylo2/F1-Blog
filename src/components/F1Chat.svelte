<script>
    import { processChatQuery } from '../api/f1chat';
    import { onMount, afterUpdate } from 'svelte';
    import * as echarts from 'echarts';
    
    let messages = [];
    let newMessage = '';
    let loading = false;
    let charts = new Map();

    afterUpdate(() => {
        messages.forEach((message, index) => {
            if (message.role === 'assistant' && message.chartOptions && !charts.has(index)) {
                const container = document.getElementById(`chart-${index}`);
                if (container) {
                    const chart = echarts.init(container, 'dark');
                    chart.setOption(message.chartOptions);
                    charts.set(index, chart);
                }
            }
        });
    });

    onMount(() => {
        return () => {
            charts.forEach(chart => chart.dispose());
            charts.clear();
        };
    });

    function handleResize() {
        charts.forEach(chart => chart.resize());
    }

    async function handleSubmit() {
        if (!newMessage.trim()) return;
        
        // Add user message
        messages = [...messages, { role: 'user', content: newMessage }];
        const userInput = newMessage;
        newMessage = '';
        loading = true;

        try {
            // Process the query and get response
            const response = await processChatQuery(userInput);
            messages = [...messages, { 
                role: 'assistant', 
                content: response.text,
                chartOptions: response.chartOptions
            }];

        } catch (error) {
            messages = [...messages, { 
                role: 'assistant', 
                content: 'Sorry, I encountered an error processing your request. Please try again.'
            }];
        } finally {
            loading = false;
        }
    }
</script>

<svelte:window on:resize={handleResize}/>

<div class="chat-container">
    <div class="messages-container">
        {#if messages.length === 0}
            <div class="welcome-message">
                <h2>Welcome to F1 Chat! 🏎️</h2>
                <p>Ask me about driver stints during any race! For example:</p>
                <ul>
                    <li>"What were Max Verstappen's stints in Brazil 2023?"</li>
                    <li>"Show me Lewis Hamilton's stints in Monaco 2023"</li>
                    <li>"Get Charles Leclerc's stints from Saudi Arabia 2023"</li>
                </ul>
            </div>
        {/if}
        {#each messages as message, i}
            <div class="message {message.role}">
                <div class="message-content">
                    {#if message.role === 'assistant'}
                        {#if message.chartOptions}
                            <div class="chart-container" id="chart-{i}"></div>
                        {/if}
                        <pre>{message.content}</pre>
                    {:else}
                        {message.content}
                    {/if}
                </div>
            </div>
        {/each}
        {#if loading}
            <div class="message assistant">
                <div class="message-content loading">
                    <div class="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            </div>
        {/if}
    </div>
    
    <form class="input-container" on:submit|preventDefault={handleSubmit}>
        <input
            type="text"
            bind:value={newMessage}
            placeholder="Ask about driver stints (e.g., 'What were Max Verstappen's stints in Brazil 2023?')"
            class="message-input"
        />
        <button type="submit" class="send-button" disabled={!newMessage.trim()} aria-label="Send message">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
        </button>
    </form>
</div>

<style>
    .chat-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        background-color: #1a1a1a;
        border-radius: 8px;
        overflow: hidden;
    }

    .messages-container {
        flex-grow: 1;
        overflow-y: auto;
        padding: 1rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .welcome-message {
        text-align: center;
        padding: 2rem;
        color: #ffffff;
    }

    .welcome-message h2 {
        color: #E10600;
        margin-bottom: 1rem;
    }

    .welcome-message ul {
        list-style: none;
        padding: 0;
        margin: 1rem 0;
    }

    .welcome-message li {
        margin: 0.5rem 0;
        color: #888;
    }

    .message {
        display: flex;
        padding: 1rem;
        border-radius: 8px;
        max-width: 80%;
    }

    .message.user {
        background-color: #2d2d2d;
        margin-left: auto;
    }

    .message.assistant {
        background-color: #E10600;
        margin-right: auto;
        color: white;
        width: 100%;
    }

    .message-content {
        line-height: 1.5;
        width: 100%;
    }

    .message-content pre {
        white-space: pre-wrap;
        word-wrap: break-word;
        margin: 0;
        font-family: monospace;
    }

    .chart-container {
        width: 100%;
        height: 400px;
        margin-bottom: 1rem;
        background-color: #1a1a1a;
        border-radius: 4px;
    }

    .input-container {
        display: flex;
        padding: 1rem;
        gap: 0.5rem;
        background-color: #2d2d2d;
    }

    .message-input {
        flex-grow: 1;
        padding: 0.75rem;
        border: none;
        border-radius: 4px;
        background-color: #3d3d3d;
        color: white;
    }

    .message-input:focus {
        outline: none;
        box-shadow: 0 0 0 2px #E10600;
    }

    .send-button {
        padding: 0.75rem;
        border: none;
        border-radius: 4px;
        background-color: #E10600;
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .send-button:disabled {
        background-color: #666;
        cursor: not-allowed;
    }

    .loading .typing-indicator {
        display: flex;
        gap: 0.5rem;
        padding: 1rem 0;
    }

    .typing-indicator span {
        width: 8px;
        height: 8px;
        background-color: white;
        border-radius: 50%;
        animation: bounce 1.4s infinite ease-in-out;
    }

    .typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
    .typing-indicator span:nth-child(2) { animation-delay: -0.16s; }

    @keyframes bounce {
        0%, 80%, 100% { transform: scale(0); }
        40% { transform: scale(1); }
    }
</style>
