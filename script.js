// Global Variables
let currentTheme = 'matrix';
let audioEnabled = false;
let audioContext = null;
let oscillators = [];
let commandHistory = [];
let historyIndex = -1;
let isHacking = false;

// DOM Elements
const commandInput = document.getElementById('command-input');
const terminalOutput = document.getElementById('terminal-output');
const pageContainer = document.getElementById('page-container');
const pageContent = document.getElementById('page-content');
const hackingOverlay = document.getElementById('hacking-overlay');
const themeToggle = document.getElementById('theme-toggle');
const themeTogglePage = document.getElementById('theme-toggle-page');
const audioToggle = document.getElementById('audio-toggle');
const audioTogglePage = document.getElementById('audio-toggle-page');
const backToTerminal = document.getElementById('back-to-terminal');

// Available Commands
const commands = {
    help: {
        description: 'Display available commands',
        execute: () => {
            return `Available commands:

chat          - Start AI assistant chat mode(anything about me)
about         - Display information about the hacker
skills        - Show technical capabilities and expertise
projects      - Browse portfolio of completed missions
contact       - Establish secure communication channel
help          - Display available commands
clear         - Clear terminal output
whoami        - Display current user information
ls            - List available directories
pwd           - Print working directory
sudo          - Execute commands with elevated privileges

Type a command and press Enter to execute.`;
        }
    },
    about: {
        description: 'Display information about the hacker',
        execute: () => showPage('about')
    },
    skills: {
        description: 'Show technical capabilities and expertise',
        execute: () => showPage('skills')
    },
    projects: {
        description: 'Browse portfolio of completed missions',
        execute: () => showPage('projects')
    },
    contact: {
        description: 'Establish secure communication channel',
        execute: () => showPage('contact')
    },
    blog: {
        description: 'Access encrypted log entries',
        execute: () => showPage('blog')
    },
    clear: {
        description: 'Clear terminal output',
        execute: () => {
            terminalOutput.innerHTML = '';
            return '';
        }
    },
    whoami: {
        description: 'Display current user information',
        execute: () => {
            return `root
User: The Hacker
Security Level: ADMIN
Access Level: UNLIMITED
Status: Online and ready to hack the planet`;
        }
    },
    ls: {
        description: 'List available directories',
        execute: () => {
            return `total 6
drwxr-xr-x 2 root root 4096 ${new Date().toLocaleDateString()} about/
drwxr-xr-x 2 root root 4096 ${new Date().toLocaleDateString()} skills/
drwxr-xr-x 2 root root 4096 ${new Date().toLocaleDateString()} projects/
drwxr-xr-x 2 root root 4096 ${new Date().toLocaleDateString()} contact/
drwxr-xr-x 2 root root 4096 ${new Date().toLocaleDateString()} blog/
-rw-r--r-- 1 root root 1337 ${new Date().toLocaleDateString()} resume.pdf`;
        }
    },
    pwd: {
        description: 'Print working directory',
        execute: () => '/home/hacker/portfolio'
    },
    sudo: {
        description: 'Execute commands with elevated privileges',
        execute: (args) => {
            if (args.includes('reveal') && args.includes('resume')) {
                return `[SUDO] Access granted. Resume download initiated...
[OK] File transfer complete: hacker_resume.pdf
[INFO] Resume successfully downloaded to your system.`;
            }
            return `[SUDO] Access granted. Command executed with elevated privileges.`;
        }
    }
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    initializeMatrix();
    initializeTerminal();
    initializeEventListeners();
    startTypewriterEffect();
});

// Matrix Rain Effect
function initializeMatrix() {
    const canvas = document.getElementById('matrix-canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const matrix = "ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()*&^%+-/~{[|`]}";
    const matrixArray = matrix.split("");
    
    const fontSize = 10;
    const columns = canvas.width / fontSize;
    
    const drops = [];
    for (let x = 0; x < columns; x++) {
        drops[x] = 1;
    }
    
    function drawMatrix() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--primary-color');
        ctx.font = fontSize + 'px monospace';
        
        for (let i = 0; i < drops.length; i++) {
            const text = matrixArray[Math.floor(Math.random() * matrixArray.length)];
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);
            
            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }
    
    setInterval(drawMatrix, 35);
    
    // Resize canvas on window resize
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// Terminal Initialization
function initializeTerminal() {
    commandInput.focus();
    
    // Auto-focus input when clicking anywhere in terminal
    document.addEventListener('click', (e) => {
        if (!pageContainer.classList.contains('hidden')) return;
        commandInput.focus();
    });
}

// Event Listeners
function initializeEventListeners() {
    // Command input
    commandInput.addEventListener('keydown', handleKeyDown);
    
    // Theme toggles
    themeToggle.addEventListener('click', toggleTheme);
    themeTogglePage.addEventListener('click', toggleTheme);
    
    // Audio toggles
    audioToggle.addEventListener('click', toggleAudio);
    audioTogglePage.addEventListener('click', toggleAudio);
    
    // Back to terminal
    backToTerminal.addEventListener('click', () => {
        pageContainer.classList.add('hidden');
        commandInput.focus();
    });
    
    // Konami code detection
    let konamiCode = [];
    const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
    
    document.addEventListener('keydown', (e) => {
        konamiCode.push(e.code);
        if (konamiCode.length > konamiSequence.length) {
            konamiCode.shift();
        }
        
        if (konamiCode.join(',') === konamiSequence.join(',')) {
            activateDarkestMode();
            konamiCode = [];
        }
    });
}

// Typewriter Effect for Welcome Message
function startTypewriterEffect() {
    const typewriterElements = document.querySelectorAll('.typewriter-text');
    typewriterElements.forEach((element, index) => {
        setTimeout(() => {
            element.style.opacity = '1';
            typewriterText(element, element.textContent, 50);
        }, index * 1000);
    });
}

function typewriterText(element, text, speed) {
    element.textContent = '';
    let i = 0;
    
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Command Handling
function handleKeyDown(e) {
    if (isHacking) return;
    
    switch (e.key) {
        case 'Enter':
            e.preventDefault();
            executeCommand();
            break;
        case 'ArrowUp':
            e.preventDefault();
            navigateHistory(-1);
            break;
        case 'ArrowDown':
            e.preventDefault();
            navigateHistory(1);
            break;
        case 'Tab':
            e.preventDefault();
            autoComplete();
            break;
    }
}

function executeCommand() {
    const input = commandInput.value.trim();
    if (!input) return;
    
    // Add to history
    commandHistory.push(input);
    historyIndex = commandHistory.length;
    
    // Echo command
    addOutput(`root@ach0-portfolio:~$ ${input}`, 'command-echo');
    
    // Parse command
    const parts = input.split(' ');
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);
    
    // Execute command
    if (commands[command]) {
        const result = commands[command].execute(args);
        if (result && typeof result === 'string') {
            addOutput(result, 'success-text');
        }
    } else {
        addOutput(`Command not found: ${command}. Ngoma ra ya? Type help.`, 'error-text');
    }
    
    // Clear input
    commandInput.value = '';
    
    // Scroll to bottom
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

function addOutput(text, className = '') {
    const outputLine = document.createElement('div');
    outputLine.className = `output-line ${className}`;
    outputLine.textContent = text;
    terminalOutput.appendChild(outputLine);
}

function navigateHistory(direction) {
    if (commandHistory.length === 0) return;
    
    historyIndex += direction;
    
    if (historyIndex < 0) {
        historyIndex = 0;
    } else if (historyIndex >= commandHistory.length) {
        historyIndex = commandHistory.length;
        commandInput.value = '';
        return;
    }
    
    commandInput.value = commandHistory[historyIndex] || '';
}

function autoComplete() {
    const input = commandInput.value.toLowerCase();
    const matches = Object.keys(commands).filter(cmd => cmd.startsWith(input));
    
    if (matches.length === 1) {
        commandInput.value = matches[0];
    } else if (matches.length > 1) {
        addOutput(`Possible completions: ${matches.join(', ')}`, 'success-text');
    }
}

// Hacking Animation
function showHackingAnimation(callback) {
    if (isHacking) return;
    
    isHacking = true;
    hackingOverlay.classList.remove('hidden');
    
    const progressFill = document.querySelector('.progress-fill');
    const progressText = document.querySelector('.progress-text');
    const logLines = document.querySelectorAll('.log-line');
    
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 100) progress = 100;
        
        progressFill.style.width = progress + '%';
        progressText.textContent = Math.floor(progress) + '%';
        
        // Show log lines progressively
        const lineIndex = Math.floor((progress / 100) * logLines.length);
        if (logLines[lineIndex] && !logLines[lineIndex].classList.contains('visible')) {
            logLines[lineIndex].classList.add('visible');
        }
        
        if (progress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                hackingOverlay.classList.add('hidden');
                isHacking = false;
                
                // Reset animation
                progressFill.style.width = '0%';
                progressText.textContent = '0%';
                logLines.forEach(line => line.classList.remove('visible'));
                
                if (callback) callback();
            }, 1000);
        }
    }, 100);
}

// Page Navigation
function showPage(pageName) {
    showHackingAnimation(() => {
        pageContainer.classList.remove('hidden');
        loadPageContent(pageName);
    });
}

function loadPageContent(pageName) {
    let content = '';
    
    switch (pageName) {
        case 'about':
            content = `
                <div class="page-section">
                    <h1 class="page-heading">THE HACKER</h1>
                    <div class="ascii-art">
    ████████╗██╗  ██╗███████╗    ██╗  ██╗ █████╗  ██████╗██╗  ██╗███████╗██████╗ 
    ╚══██╔══╝██║  ██║██╔════╝    ██║  ██║██╔══██╗██╔════╝██║ ██╔╝██╔════╝██╔══██╗
       ██║   ███████║█████╗      ███████║███████║██║     █████╔╝ █████╗  ██████╔╝
       ██║   ██╔══██║██╔══╝      ██╔══██║██╔══██║██║     ██╔═██╗ ██╔══╝  ██╔══██╗
       ██║   ██║  ██║███████╗    ██║  ██║██║  ██║╚██████╗██║  ██╗███████╗██║  ██║
       ╚═╝   ╚═╝  ╚═╝╚══════╝    ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝
                    </div>
                    
                    <h2>> whoami</h2>
<p><strong>Name:</strong> Chencho Wangdi (the guy behind the screen)</p>
<p><strong>Location:</strong> Somewhere in Cyberspace (probably planning something)</p>
<p><strong>Specialization:</strong> AI guru & Cybersecurity ninja</p>
<p><strong>Status:</strong> Alive, caffeinated, and ready to debug</p>

<h3>Mission Statement</h3>
<p>
I’m a cybersecurity specialist and AI/ML developer who loves breaking stuff (ethically, of course) and then fixing it before the bad guys even notice. My mission? Build apps so tough, even hackers think twice. Because someone’s gotta keep you safe.
</p>
                    <h3>System Stats</h3>
                    <div class="stats-grid">
                        <div class="stat-box">
                            <div class="stat-number">6</div>
                            <div class="stat-label">Systems Compromised</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-number">∞</div>
                            <div class="stat-label">Lines of Code</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-number">9,001L</div>
                            <div class="stat-label">Coffee Consumed</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-number">99.9%</div>
                            <div class="stat-label">Uptime</div>
                        </div>
                    </div>
                    
                    <h3>Commit History</h3>
                   <ul class="achievement-list">
    <li>$ [2025-06-27] Survived college, 3rd Year somehow</li>
    <li>$ [2025-07-09] Did something stupid (don’t ask)</li>
    <li>$ [2025-07-13] Learned swimming like a pro</li>
    <li>$ [2025-07-29] Surviving Gelephu heat like a champ</li>
    <li>$ [2025-07-29] Hacking my last 2 weeks of college vacation like a boss</li>


</ul>
                    
                    <blockquote>"The best way to predict the future is to hack it." - Anonymous</blockquote>
                    
                    <p><strong>Security clearance:</strong> TOP SECRET // Access level: ADMIN</p>
                </div>
            `;
            break;
            
        case 'skills':
            content = `
                <div class="page-section">
                    <h1 class="page-heading">TECHNICAL CAPABILITIES</h1>
                    <p class="section-subtitle">Scanning skill database... Expertise levels retrieved.</p>
                    
                    <div class="skills-category">
                        <h3>Programming Languages</h3>
                        <div class="skill-item">
                            <span class="skill-name">Python</span>
                            <div class="skill-bar"><div class="skill-fill" data-level="95"></div></div>
                            <span class="skill-level">95%</span>
                        </div>
                        <div class="skill-item">
                            <span class="skill-name">JavaScript</span>
                            <div class="skill-bar"><div class="skill-fill" data-level="90"></div></div>
                            <span class="skill-level">90%</span>
                        </div>
                        <div class="skill-item">
                            <span class="skill-name">C++</span>
                            <div class="skill-bar"><div class="skill-fill" data-level="46"></div></div>
                            <span class="skill-level">46%</span>
                        </div>
                        <div class="skill-item">
                            <span class="skill-name">Go</span>
                            <div class="skill-bar"><div class="skill-fill" data-level="80"></div></div>
                            <span class="skill-level">80%</span>
                        </div>
                    </div>
                    
                    
                    <div class="skills-category">
                        <h3>Web Development</h3>
                        <div class="skill-item">
                            <span class="skill-name">React/Vue.js</span>
                            <div class="skill-bar"><div class="skill-fill" data-level="42"></div></div>
                            <span class="skill-level">42%</span>
                        </div>
                        <div class="skill-item">
                            <span class="skill-name">Node.js</span>
                            <div class="skill-bar"><div class="skill-fill" data-level="88"></div></div>
                            <span class="skill-level">88%</span>
                        </div>
                        <div class="skill-item">
                            <span class="skill-name">Database Design</span>
                            <div class="skill-bar"><div class="skill-fill" data-level="85"></div></div>
                            <span class="skill-level">85%</span>
                        </div>
                        <div class="skill-item">
                            <span class="skill-name">DevOps</span>
                            <div class="skill-bar"><div class="skill-fill" data-level="82"></div></div>
                            <span class="skill-level">82%</span>
                        </div>
                    </div>
                    
                    <div class="skills-category">
                        <h3>Tools & Frameworks</h3>
                        <div class="tool-grid">
                            <span class="tool-tag">Metasploit</span>
                            <span class="tool-tag">Burp Suite</span>
                            <span class="tool-tag">Wireshark</span>
                            <span class="tool-tag">Nmap</span>
                            <span class="tool-tag">Docker</span>
                            <span class="tool-tag">AWS</span>
                            <span class="tool-tag">Linux</span>
                            <span class="tool-tag">Git</span>
                        </div>
                    </div>
                </div>
            `;
            break;
            
        case 'projects':
            content = `
                    <div class="page-section">
        <h1 class="page-heading">project.db</h1>
        <!-- Changed from "Access granted." to "Access denied." -->
        <p class="section-subtitle">Decrypting log entries... Access denied.</p>
        
        <!-- Replace the posts list with a denial message -->
        <div class="access-denied">
            <p>You do not have permission to view this content.</p>
        </div>
    </div>
            `;
            break;
            
        case 'contact':
            content = `
                    <div class="page-section">
        <h1 class="page-heading">Contact.db</h1>
        <!-- Changed from "Access granted." to "Access denied." -->
        <p class="section-subtitle">Decrypting log entries... Access denied.</p>
        
        <!-- Replace the posts list with a denial message -->
        <div class="access-denied">
            <p>You do not have permission to view this content.</p>
        </div>
    </div>
            `;
            break;
            
        case 'blog':
            content = `
    <div class="page-section">
        <h1 class="page-heading">blog.db</h1>
        <!-- Changed from "Access granted." to "Access denied." -->
        <p class="section-subtitle">Decrypting log entries... Access denied.</p>
        
        <!-- Replace the posts list with a denial message -->
        <div class="access-denied">
            <p>You do not have permission to view this content.</p>
        </div>
    </div>

            `;
            break;
    }
    
    pageContent.innerHTML = content;
    
    // Animate skill bars if on skills page
    if (pageName === 'skills') {
        setTimeout(() => {
            animateSkillBars();
        }, 500);
    }
}

// Theme Toggle
function toggleTheme() {
    currentTheme = currentTheme === 'matrix' ? 'cyberpunk' : 'matrix';
    document.body.className = currentTheme === 'cyberpunk' ? 'cyberpunk' : '';
    
    // Update button text
    const themeText = currentTheme === 'matrix' ? 'Matrix' : 'Cyberpunk';
    themeToggle.textContent = themeText;
    themeTogglePage.textContent = themeText;
}

// Audio Toggle
function toggleAudio() {
    audioEnabled = !audioEnabled;
    
    const audioText = audioEnabled ? '🔊' : '🔇';
    const audioTitle = audioEnabled ? 'Disable Audio' : 'Enable Audio';
    
    audioToggle.textContent = audioText;
    audioToggle.title = audioTitle;
    audioTogglePage.textContent = audioText;
    audioTogglePage.title = audioTitle;
    
    if (audioEnabled) {
        startAmbientAudio();
    } else {
        stopAmbientAudio();
    }
}

// Audio Functions
function startAmbientAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    
    // Create ambient sound
    const oscillator1 = audioContext.createOscillator();
    const oscillator2 = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator1.type = 'sine';
    oscillator1.frequency.setValueAtTime(60, audioContext.currentTime);
    
    oscillator2.type = 'triangle';
    oscillator2.frequency.setValueAtTime(80, audioContext.currentTime);
    
    // ↑ increase this value to make it louder ↓
    gainNode.gain.setValueAtTime(1.2, audioContext.currentTime);
    
    oscillator1.connect(gainNode);
    oscillator2.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator1.start();
    oscillator2.start();
    
    oscillators = [oscillator1, oscillator2];
    
    // Add frequency variation
    setInterval(() => {
        if (audioEnabled && oscillators.length > 0) {
            oscillator1.frequency.setValueAtTime(
                60 + Math.random() * 10,
                audioContext.currentTime
            );
            oscillator2.frequency.setValueAtTime(
                80 + Math.random() * 15,
                audioContext.currentTime
            );
        }
    }, 5000);
}


function stopAmbientAudio() {
    oscillators.forEach(oscillator => {
        try {
            oscillator.stop();
        } catch (e) {
            // Oscillator already stopped
        }
    });
    oscillators = [];
    
    if (audioContext) {
        audioContext.close();
        audioContext = null;
    }
}

// Skill Bar Animation
function animateSkillBars() {
    const skillFills = document.querySelectorAll('.skill-fill');
    skillFills.forEach((fill, index) => {
        setTimeout(() => {
            const level = fill.getAttribute('data-level');
            fill.style.width = level + '%';
        }, index * 200);
    });
}

// Contact Form
function submitContactForm() {
    const name = document.getElementById('contact-name').value;
    const email = document.getElementById('contact-email').value;
    const subject = document.getElementById('contact-subject').value;
    const message = document.getElementById('contact-message').value;
    
    if (!name || !email || !message) {
        alert('Please fill in all required fields.');
        return;
    }
    
    // Simulate form submission
    alert('Message transmitted successfully! Expect a response within 24 hours.');
    
    // Clear form
    document.getElementById('contact-name').value = '';
    document.getElementById('contact-email').value = '';
    document.getElementById('contact-subject').value = '';
    document.getElementById('contact-message').value = '';
}

// Konami Code Easter Egg
function activateDarkestMode() {
    document.body.style.setProperty('--primary-color', '#ff0000');
    document.body.style.setProperty('--secondary-color', '#8f0000');
    document.body.style.setProperty('--border-color', '#ff0000');
    document.body.style.setProperty('--text-color', '#ff0000');
    
    addOutput('🔴 DARKEST MODE ACTIVATED 🔴', 'error-text');
    addOutput('Welcome to the dark side of the matrix...', 'error-text');
    
    // Reset after 10 seconds
    setTimeout(() => {
        location.reload();
    }, 10000);
}

