/**
 * Customer Helper - AI Customer Support Platform
 * Chat now ONLY uses the <form> action attribute to talk to n8n
 */

const chatInput = document.getElementById('chatInput');
const chatMessages = document.getElementById('chatMessages');
const chatForm = document.getElementById('chatForm');
const contactForm = document.getElementById('contactForm');
const navLinks = document.querySelector('.nav-links');
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');

// =========================================
// CHAT → n8n (form action only)
// =========================================

chatForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    const message = chatInput.value.trim();
    if (!message) return;

    addMessage(message, 'user');
    chatForm.reset();
    showTypingIndicator();

    try {
        const payload = {
            message: message,
            timestamp: new Date().toISOString(),
            source: 'web_chat',
            userId: getUserId()
        };

        const response = await fetch(chatForm.action, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error('Webhook error');

        const data = await response.json();
        removeTypingIndicator();

        if (data.reply) {
            addMessage(data.reply, 'bot');
        } else {
            addMessage("I received your message but didn't get a proper reply.", 'bot');
        }
    } catch (error) {
        console.error('Chat error:', error);
        removeTypingIndicator();
        addMessage("Sorry, can't reach the AI right now. Please try again.", 'bot');
    }

    chatInput.focus();
});

// =========================================
// UI HELPERS
// =========================================

function addMessage(text, sender) {
    const div = document.createElement('div');
    div.className = `chat-message ${sender}`;
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    div.innerHTML = `
        <div class="message-avatar"></div>
        <div class="message-content">
            <p>${escapeHtml(text)}</p>
            <span class="message-time">${time}</span>
        </div>
    `;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'typingIndicator';
    indicator.className = 'chat-message bot';
    indicator.innerHTML = `
        <div class="message-avatar"></div>
        <div class="message-content">
            <p class="typing-dots"><span></span><span></span><span></span></p>
        </div>
    `;
    chatMessages.appendChild(indicator);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeTypingIndicator() {
    const el = document.getElementById('typingIndicator');
    if (el) el.remove();
}

function insertPrompt(text) {
    chatInput.value = text;
    chatInput.focus();
}

// =========================================
// CONTACT FORM SUCCESS ANIMATION
// =========================================

function handleContactSubmit(e) {
    e.preventDefault();
    const btn = contactForm.querySelector('.submit-btn');
    const original = btn.innerHTML;

    btn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"/>
        </svg>
        <span>Message Sent!</span>
    `;
    btn.style.background = '#10B981';

    setTimeout(() => {
        btn.innerHTML = original;
        btn.style.background = '';
        contactForm.reset();
    }, 3000);
}

// =========================================
// UTILITIES
// =========================================

function getUserId() {
    let id = localStorage.getItem('customerHelper_userId');
    if (!id) {
        id = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('customerHelper_userId', id);
    }
    return id;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// =========================================
// MOBILE MENU + SMOOTH SCROLL + HEADER SCROLL
// =========================================

function toggleMobileMenu() {
    navLinks.classList.toggle('active');
    mobileMenuBtn.classList.toggle('active');
}

function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
            e.preventDefault();
            document.querySelector(a.getAttribute('href'))?.scrollIntoView({ behavior: 'smooth' });
            navLinks.classList.remove('active');
        });
    });
}

function handleHeaderScroll() {
    const header = document.getElementById('header');
    header.style.boxShadow = window.scrollY > 100 ? '0 4px 6px -1px rgba(0,0,0,0.1)' : 'none';
}

function openChatbot() {
    document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => chatInput.focus(), 600);
}

function toggleChatbot() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// =========================================
// EVENT LISTENERS
// =========================================

mobileMenuBtn.addEventListener('click', toggleMobileMenu);
contactForm.addEventListener('submit', handleContactSubmit);
window.addEventListener('scroll', handleHeaderScroll);

document.addEventListener('DOMContentLoaded', () => {
    setupSmoothScrolling();
});

// Typing animation styles
const style = document.createElement('style');
style.textContent = `
    .typing-dots { display:flex; gap:4px; }
    .typing-dots span { width:8px; height:8px; background:#94A3B8; border-radius:50%; animation:typing 1.4s infinite; }
    .typing-dots span:nth-child(2) { animation-delay:0.2s; }
    .typing-dots span:nth-child(3) { animation-delay:0.4s; }
    @keyframes typing { 0%,60%,100%{transform:translateY(0);opacity:0.4} 30%{transform:translateY(-8px);opacity:1} }
`;
document.head.appendChild(style);