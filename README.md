# 🧠 Unified AI Support Workflow (n8n)

This repository contains an **n8n workflow** that acts as a **unified AI-powered support system**, capable of handling messages from **Telegram**, **Website Webhooks**, and **Gmail**, processing them through a common logic layer, and responding via the appropriate channel.

The workflow is designed to be **simple, modular, and hackathon-friendly**.

---

## 🚀 Features

- ✅ Accepts input from **multiple sources**
  - Telegram Bot
  - Website (Webhook)
  - Gmail Trigger
- 🧩 Normalizes all incoming data into a single format
- 🤖 Processes messages using AI / custom JavaScript logic
- 🔀 Routes responses dynamically based on message source
- 📩 Sends replies back to:
  - Telegram
  - Gmail
  - Website (Webhook response)

---

## 🏗️ Workflow Architecture

### 1. Input Triggers
The workflow starts with **three parallel triggers**:

- **Webhook**
  - Used for website chatbot or external API calls
- **Telegram Trigger**
  - Receives user messages sent to the Telegram bot
- **Gmail Trigger**
  - Listens for new emails

---

### 2. Edit Fields (Normalization Layer)

Each trigger passes through an **Edit Fields** node to normalize data into a common structure:

```json
{
  "source": "telegram | gmail | webhook",
  "message": "user message text",
  "sender": "user identifier"
}

This ensures all messages are processed uniformly.

3. Message a Model (AI Processing)

All normalized inputs are sent to a Message a Model node, where:

The user message is analyzed

An AI-generated response is created

This can be connected to:

OpenAI

Local LLM

Any supported AI provider in n8n

4. JavaScript Logic

The Code in JavaScript node is used to:

Add metadata

Modify AI responses

Prepare routing flags

Perform custom logic if required

5. Conditional Routing (IF + Switch)

IF Node

Checks whether the request expects a reply

Switch Node

Routes the response based on the source:

telegram

gmail

webhook

6. Output Responses

Depending on the source:

📲 Telegram

Sends message back to the Telegram user

📧 Gmail

Sends a reply email using Gmail

🌐 Website

Returns data via Respond to Webhook

📂 Nodes Used

Webhook

Telegram Trigger

Gmail Trigger

Edit Fields

Message a Model

Code (JavaScript)

IF

Switch

HTTP Request (optional)

Send Message (Telegram / Gmail)

Respond to Webhook

⚙️ Setup Instructions
1. Prerequisites

n8n (local or cloud)

Telegram Bot Token

Gmail OAuth credentials

AI model credentials (OpenAI or equivalent)

2. Import Workflow

Open n8n

Click Import workflow

Paste the workflow JSON

Save

3. Configure Credentials

Telegram Bot Token

Gmail OAuth

AI Model API key

4. Activate Workflow

Enable all required triggers

Test each input channel independently

🧪 Use Cases

Website chatbot + Telegram bot using same brain

AI email auto-responder

Hackathon demo for smart automation

Customer support automation

Multi-channel conversational AI

🏆 Hackathon Ready

⏱️ Fast to build

🔧 Easy to extend

💡 Clean architecture

🔄 Reusable logic

📌 Notes

Some webhook response nodes may be disabled intentionally

Workflow can be extended to WhatsApp, Slack, Discord, etc.

Edit Fields nodes are critical for data consistency