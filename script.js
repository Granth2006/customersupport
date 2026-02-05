/**
 * Customer Helper - AI Customer Support Platform
 * Frontend JavaScript
 * 
 * This script handles:
 * - Chatbot functionality (sending messages to webhook)
 * - Mobile navigation menu
 * - Contact form handling
 * - Smooth scrolling and UI interactions
 */

// =========================================
// CONFIGURATION
// =========================================

/**
 * WEBHOOK CONFIGURATION
 * Replace this URL with your n8n webhook URL
 * Example: 'https://your-n8n-instance.com/webhook/customer-helper'
 */
const WEBHOOK_URL = 'YOUR_N8N_WEBHOOK_URL_HERE';

// Check if webhook is configured
const isWebhookConfigured = WEBHOOK_URL !== 'YOUR_N8N_WEBHOOK_URL_HERE' && WEBHOOK_URL.startsWith('http');

// =========================================
// DOM ELEMENTS
// =========================================

const chatInput = document.getElementById('chatInput');
const chatMessages = document.getElementById('chatMessages');
const contactForm = document.getElementById('contactForm');
const navLinks = document.querySelector('.nav-links');
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const floatingChatBtn = document.getElementById('floatingChatBtn');

// =========================================
// CHATBOT FUNCTIONALITY
// =========================================

/**
 * Sends a message to the chatbot
 * Handles both UI updates and webhook integration
 */
async function sendMessage() {
    const message = chatInput.value.trim();
    
    if (!message) return;
    
    // Add user message to chat
    addMessage(message, 'user');
    
    // Clear input
    chatInput.value = '';
    
    // Show typing indicator
    showTypingIndicator();
    
    try {
        // Send message to webhook
        const response = await sendToWebhook(message);
        
        // Remove typing indicator
        removeTypingIndicator();
        
        // Add bot response
        if (response && response.reply) {
            addMessage(response.reply, 'bot');
        } else {
            // Fallback response if webhook returns no data
            addMessage(getLocalResponse(message), 'bot');
        }
    } catch (error) {
        console.error('Error sending message:', error);
        removeTypingIndicator();
        
        // Use local response as fallback
        addMessage(getLocalResponse(message), 'bot');
    }
}

/**
 * Sends message to the configured webhook
 * @param {string} message - The user's message
 * @returns {Promise<Object>} - The webhook response
 */
async function sendToWebhook(message) {
    // If webhook is not configured, return null to trigger fallback
    if (!isWebhookConfigured) {
        console.log('Webhook not configured. Using local responses.');
        console.log('To integrate with n8n, replace WEBHOOK_URL in script.js');
        return null;
    }
    
    const payload = {
        message: message,
        timestamp: new Date().toISOString(),
        source: 'web_chat',
        userId: getUserId()
    };
    
    const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
        throw new Error(`Webhook error: ${response.status}`);
    }
    
    return await response.json();
}

/**
 * Adds a message to the chat window
 * @param {string} text - The message text
 * @param {string} sender - 'user' or 'bot'
 */
function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}`;
    messageDiv.setAttribute('data-testid', `chat-message-${sender}`);
    
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    messageDiv.innerHTML = `
        <div class="message-avatar"></div>
        <div class="message-content">
            <p>${escapeHtml(text)}</p>
            <span class="message-time">${currentTime}</span>
        </div>
    `;
    
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

/**
 * Shows typing indicator while waiting for response
 */
function showTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'typingIndicator';
    indicator.className = 'chat-message bot';
    indicator.innerHTML = `
        <div class="message-avatar"></div>
        <div class="message-content">
            <p class="typing-dots">
                <span></span><span></span><span></span>
            </p>
        </div>
    `;
    chatMessages.appendChild(indicator);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

/**
 * Removes the typing indicator
 */
function removeTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) {
        indicator.remove();
    }
}

/**
 * Generates a local response when webhook is not available
 * This provides demo functionality without backend integration
 * @param {string} message - The user's message
 * @returns {string} - A contextual response
 */
function getLocalResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    // Business hours related
    if (lowerMessage.includes('hour') || lowerMessage.includes('open') || lowerMessage.includes('time')) {
        return "Our support team is available 24/7! Our AI assistant (that's me!) never sleeps, and human agents are available Monday-Friday, 9 AM - 6 PM PST.";
    }
    
    // Order related
    if (lowerMessage.includes('order') || lowerMessage.includes('shipping') || lowerMessage.includes('delivery')) {
        return "I'd be happy to help with your order! Could you please provide your order number (e.g., #12345)? I can look up the status, shipping details, and expected delivery date for you.";
    }
    
    // Human agent
    if (lowerMessage.includes('human') || lowerMessage.includes('agent') || lowerMessage.includes('person') || lowerMessage.includes('speak')) {
        return "I understand you'd like to speak with a human agent. I'm routing your request now. A support specialist will be with you shortly. Average wait time is under 2 minutes.";
    }
    
    // Payment related
    if (lowerMessage.includes('payment') || lowerMessage.includes('pay') || lowerMessage.includes('card') || lowerMessage.includes('refund')) {
        return "We accept all major credit cards (Visa, MasterCard, AmEx), PayPal, and Apple Pay. For refunds, they're typically processed within 5-7 business days. Is there a specific payment issue I can help with?";
    }
    
    // Pricing
    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('pricing')) {
        return "Our pricing is flexible to meet your needs! We offer: Starter ($29/mo), Professional ($79/mo), and Enterprise (custom). Would you like me to explain what's included in each plan?";
    }
    
    // Technical issues
    if (lowerMessage.includes('not working') || lowerMessage.includes('error') || lowerMessage.includes('bug') || lowerMessage.includes('issue')) {
        return "I'm sorry you're experiencing issues. Let me help troubleshoot! Could you describe what's happening? Include any error messages you see, and I'll do my best to resolve it quickly.";
    }
    
    // Greeting
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
        return "Hello! Welcome to Customer Helper. I'm here to assist you with any questions about our services. What can I help you with today?";
    }
    
    // Thank you
    if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
        return "You're welcome! Is there anything else I can help you with? I'm here 24/7 to assist you.";
    }
    
    // Demo/test
    if (lowerMessage.includes('demo') || lowerMessage.includes('test')) {
        return "You're currently using our live demo! This showcases how our AI understands and responds to customer queries. In production, I connect to your knowledge base and can handle specific questions about your products and services.";
    }
    
    // Default response
    return "Thanks for your message! I'm analyzing your query to provide the best assistance. Could you provide a bit more detail? For example:\n• What product or service does this relate to?\n• What specific outcome are you looking for?";
}

/**
 * Inserts a pre-defined prompt into the chat input
 * Used by the quick test buttons
 * @param {string} text - The prompt text
 */
function insertPrompt(text) {
    chatInput.value = text;
    chatInput.focus();
}

/**
 * Opens/focuses the chatbot
 * Scrolls to demo section and focuses input
 */
function openChatbot() {
    const demoSection = document.getElementById('demo');
    if (demoSection) {
        demoSection.scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => {
            chatInput.focus();
        }, 500);
    }
}

/**
 * Toggles chatbot visibility (placeholder for future modal implementation)
 */
function toggleChatbot() {
    // For the embedded demo, this could minimize/expand the chat
    // Currently just scrolls to top of page
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// =========================================
// MOBILE NAVIGATION
// =========================================

/**
 * Toggles the mobile navigation menu
 */
function toggleMobileMenu() {
    navLinks.classList.toggle('active');
    mobileMenuBtn.classList.toggle('active');
}

// =========================================
// CONTACT FORM
// =========================================

/**
 * Handles contact form submission
 * @param {Event} event - The form submit event
 */
function handleContactSubmit(event) {
    event.preventDefault();
    
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        message: document.getElementById('message').value,
        timestamp: new Date().toISOString()
    };
    
    // Log form data (in production, this would send to a backend)
    console.log('Contact Form Submitted:', formData);
    
    // Show success message
    showFormSuccess();
    
    // Reset form
    contactForm.reset();
}

/**
 * Shows success message after form submission
 */
function showFormSuccess() {
    const submitBtn = contactForm.querySelector('.submit-btn');
    const originalContent = submitBtn.innerHTML;
    
    submitBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"/>
        </svg>
        <span>Message Sent!</span>
    `;
    submitBtn.style.background = '#10B981';
    
    setTimeout(() => {
        submitBtn.innerHTML = originalContent;
        submitBtn.style.background = '';
    }, 3000);
}

// =========================================
// UTILITY FUNCTIONS
// =========================================

/**
 * Generates or retrieves a user ID for tracking
 * @returns {string} - User ID
 */
function getUserId() {
    let userId = localStorage.getItem('customerHelper_userId');
    if (!userId) {
        userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('customerHelper_userId', userId);
    }
    return userId;
}

/**
 * Escapes HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Handles smooth scrolling for anchor links
 */
function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
                // Close mobile menu if open
                navLinks.classList.remove('active');
            }
        });
    });
}

/**
 * Updates header style on scroll
 */
function handleHeaderScroll() {
    const header = document.getElementById('header');
    if (window.scrollY > 100) {
        header.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
    } else {
        header.style.boxShadow = 'none';
    }
}

// =========================================
// EVENT LISTENERS
// =========================================

// Chat input enter key
chatInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Mobile menu toggle
mobileMenuBtn.addEventListener('click', toggleMobileMenu);

// Contact form submit
contactForm.addEventListener('submit', handleContactSubmit);

// Scroll events
window.addEventListener('scroll', handleHeaderScroll);

// Initialize smooth scrolling
document.addEventListener('DOMContentLoaded', function() {
    setupSmoothScrolling();
    
    // Log webhook status for developers
    if (!isWebhookConfigured) {
        console.log('%c[Customer Helper]', 'color: #0EA5E9; font-weight: bold;');
        console.log('Webhook URL not configured. Using demo mode with local responses.');
        console.log('To integrate with n8n:');
        console.log('1. Open script.js');
        console.log('2. Replace WEBHOOK_URL with your n8n webhook URL');
        console.log('3. Refresh the page');
    }
});

// =========================================
// TYPING INDICATOR ANIMATION STYLES
// =========================================

// Add dynamic styles for typing indicator
const style = document.createElement('style');
style.textContent = `
    .typing-dots {
        display: flex;
        gap: 4px;
        padding: 8px 0;
    }
    
    .typing-dots span {
        width: 8px;
        height: 8px;
        background: #94A3B8;
        border-radius: 50%;
        animation: typing 1.4s infinite;
    }
    
    .typing-dots span:nth-child(2) {
        animation-delay: 0.2s;
    }
    
    .typing-dots span:nth-child(3) {
        animation-delay: 0.4s;
    }
    
    @keyframes typing {
        0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.4;
        }
        30% {
            transform: translateY(-8px);
            opacity: 1;
        }
    }
    
    .mobile-menu-btn.active span:nth-child(1) {
        transform: rotate(45deg) translate(5px, 5px);
    }
    
    .mobile-menu-btn.active span:nth-child(2) {
        opacity: 0;
    }
    
    .mobile-menu-btn.active span:nth-child(3) {
        transform: rotate(-45deg) translate(5px, -5px);
    }
`;
document.head.appendChild(style);
