

let chatMode = false;
let chatHistory = [];


// Chat typing animation parameters
const TYPING_SPEED = 20; // milliseconds per character

// Utility: type text into an element with animation
function typeText(element, text, callback) {
    let i = 0;
    element.textContent = '';
    const timer = setInterval(() => {
        element.textContent += text.charAt(i);
        i++;
        if (i >= text.length) {
            clearInterval(timer);
            if (callback) callback();
        }
    }, TYPING_SPEED);
}

// Override addOutput for chat messages to support typing effect
function addChatOutput(message, className = '') {
    const line = document.createElement('div');
    line.className = `output-line ${className}`;
    terminalOutput.appendChild(line);
    typeText(line, message, () => {
        // Scroll after complete
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
    });
}

// Add chat command to existing commands object
if (typeof commands !== 'undefined') {
    commands.chat = {
        description: 'Start AI assistant chat mode',
        execute: () => {
            chatMode = true;
            addOutput('🤖 AI Assistant activated. Type your questions or "exit" to return to terminal.', 'success-text');
            addOutput('💡 I know all about Chencho Wangdi background, skills, and projects. Ask me anything!(Beta-Version)', 'success-text');
            updatePrompt();
            return '';
        }
    };

    commands.ai = {
        description: 'Start AI assistant chat mode (alias for chat)',
        execute: () => commands.chat.execute()
    };

    const originalExecuteCommand = window.executeCommand;
    window.executeCommand = function() {
        const input = commandInput.value.trim();
        if (!input) return;
        if (chatMode) {
            if (input.toLowerCase() === 'exit') {
                chatMode = false;
                chatHistory = [];
                addOutput('🤖 AI Assistant deactivated. Returning to terminal mode.', 'success-text');
                updatePrompt();
                commandInput.value = '';
                return;
            }
            handleChatInput(input);
            commandInput.value = '';
            return;
        }
        originalExecuteCommand();
    };

    const originalHelpExecute = commands.help.execute;
    commands.help.execute = function() {
        const originalHelp = originalHelpExecute();
        return originalHelp + `\n\nchat          - Start AI assistant chat mode\nai            - Start AI assistant chat mode (alias for chat)\n\nChat Mode Commands:\nexit          - Exit chat mode and return to terminal\n\n💡 The AI assistant knows all about The Hacker's background, skills, and projects!`;
    };
} else {
    console.error("Error: `commands` object not found. Ensure chatbot.js is loaded after script.js.");
}

// Update prompt display based on mode
function updatePrompt() {
    const promptElement = document.querySelector('.prompt');
    if (chatMode) {
        promptElement.textContent = 'chat@ach0-ai:~$ ';
        promptElement.style.color = '#ff6b35';
    } else {
        promptElement.textContent = 'root@ach0-portfolio:~$ ';
        promptElement.style.color = 'var(--primary-color)';
    }
}

// Handle chat input and API communication
async function handleChatInput(userMessage) {
    // Echo user message
    addOutput(`👤 You: ${userMessage}`, 'command-echo');
    chatHistory.push({ role: 'user', content: userMessage });

    // Typing indicator
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'output-line typing-indicator';
    typingIndicator.textContent = 'Diasy is thinking...';
    terminalOutput.appendChild(typingIndicator);
    terminalOutput.scrollTop = terminalOutput.scrollHeight;

    window.CHATBOT_API_URL = 'https://portfolio-45hr.onrender.com/api/chat';

    try {
        const response = await fetch(window.CHATBOT_API_URL || '/api/chat', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ message: userMessage, history: chatHistory })
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();

        // Remove typing indicator
        typingIndicator.remove();

        // Animated AI response
        addChatOutput(`Diasy: ${data.response}`, 'success-text');
        chatHistory.push({ role: 'assistant', content: data.response });

    } catch (error) {
        typingIndicator.remove();
        addOutput('Diasy: Sorry, I\'m having trouble connecting...', 'error-text');
        // ... fallback messages
    }
}

// Animate typing dots (optional for indicator)
function animateTypingDots(dotsElement) {
    let dotCount = 0;
    const interval = setInterval(() => {
        dotCount = (dotCount + 1) % 4;
        dotsElement.textContent = '.'.repeat(dotCount);
        if (!document.contains(dotsElement)) clearInterval(interval);
    }, 500);
}

// Add CSS for typing animation
const chatStyles = `
.typing-indicator {
    color: var(--primary-color);
    font-style: italic;
    opacity: 0.8;
}
`;
document.head.appendChild(Object.assign(document.createElement('style'), { textContent: chatStyles }));


