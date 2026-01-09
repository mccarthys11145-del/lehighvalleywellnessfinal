# Custom Copilot Agent Setup Guide

This guide walks you through creating a custom AI assistant (Copilot) trained specifically for managing the Lehigh Valley Wellness website. The Copilot can help with content updates, CRM management, and maintaining compliance with medical marketing guidelines.

## Overview

A custom Copilot is an AI assistant that has been given specific knowledge about your business, codebase, and operational requirements. Unlike a general-purpose AI, it understands your exact setup and can provide targeted, accurate assistance.

## Training Files Included

This package contains four training documents:

| File | Purpose |
|------|---------|
| `knowledge-base.md` | Business context, services, pricing, and operational details |
| `system-prompt.md` | Instructions defining the Copilot's behavior and boundaries |
| `example-conversations.md` | Sample interactions demonstrating proper responses |
| `codebase-reference.md` | Technical documentation of the website architecture |

---

## Option 1: Using ChatGPT Custom GPT

ChatGPT Plus subscribers can create a Custom GPT that serves as your dedicated assistant.

### Step 1: Access GPT Builder

Navigate to [chat.openai.com](https://chat.openai.com), click your profile icon, and select "My GPTs". Then click "Create a GPT".

### Step 2: Configure Basic Settings

In the "Create" tab, provide the following:

**Name**: Lehigh Valley Wellness Assistant

**Description**: A specialized assistant for managing the Lehigh Valley Wellness medical practice website, CRM, and content.

**Instructions**: Copy the entire contents of `system-prompt.md` into the Instructions field.

### Step 3: Upload Knowledge Files

In the "Configure" tab, scroll to "Knowledge" and upload these files:
- `knowledge-base.md`
- `codebase-reference.md`
- `example-conversations.md`

### Step 4: Set Capabilities

Enable the following capabilities:
- ✅ Web Browsing (for researching medical guidelines)
- ✅ Code Interpreter (for analyzing code snippets)
- ❌ DALL-E (not needed)

### Step 5: Save and Test

Click "Save" and select "Only me" for privacy. Test the GPT by asking questions like:
- "How do I update the weight loss program pricing?"
- "Write a compliant social media post about HRT"
- "What's the process for marking a lead as contacted?"

---

## Option 2: Using Claude Projects

Anthropic's Claude offers Projects for organizing context around specific tasks.

### Step 1: Create a New Project

Go to [claude.ai](https://claude.ai), click "Projects" in the sidebar, then "New Project".

**Name**: Lehigh Valley Wellness Management

### Step 2: Add Project Instructions

In the project settings, paste the contents of `system-prompt.md` into the "Project Instructions" field.

### Step 3: Upload Knowledge Documents

Click "Add Content" and upload:
- `knowledge-base.md`
- `codebase-reference.md`
- `example-conversations.md`

### Step 4: Start Conversations

Open a new conversation within the project. Claude will automatically have access to all uploaded documents and follow the system instructions.

---

## Option 3: Using Microsoft Copilot Studio

For enterprise deployments, Microsoft Copilot Studio provides more control and integration options.

### Step 1: Access Copilot Studio

Navigate to [copilotstudio.microsoft.com](https://copilotstudio.microsoft.com) and sign in with your Microsoft 365 account.

### Step 2: Create New Copilot

Click "Create" and select "New copilot". Choose "Skip to configure" for manual setup.

**Name**: LVW Website Assistant

**Description**: Manages Lehigh Valley Wellness website and CRM

### Step 3: Configure Knowledge Sources

In the "Knowledge" section:
1. Click "Add knowledge"
2. Select "Files"
3. Upload all four training documents

### Step 4: Customize System Message

Navigate to "Settings" > "Generative AI" and paste the `system-prompt.md` content into the system message field.

### Step 5: Add Topics (Optional)

Create specific topics for common tasks:
- "Update Pricing" - triggers pricing modification guidance
- "Write Marketing Copy" - initiates compliant content creation
- "CRM Help" - provides lead management assistance

### Step 6: Publish

Test thoroughly in the Test pane, then publish to your desired channels (Teams, website widget, etc.).

---

## Option 4: API-Based Implementation

For developers who want to integrate the Copilot into custom applications.

### Using OpenAI API

```python
import openai

# Load training content
with open('system-prompt.md', 'r') as f:
    system_prompt = f.read()

with open('knowledge-base.md', 'r') as f:
    knowledge = f.read()

client = openai.OpenAI()

response = client.chat.completions.create(
    model="gpt-4-turbo",
    messages=[
        {
            "role": "system",
            "content": f"{system_prompt}\n\n## Knowledge Base\n\n{knowledge}"
        },
        {
            "role": "user",
            "content": "How do I add a new FAQ question?"
        }
    ]
)

print(response.choices[0].message.content)
```

### Using Anthropic API

```python
import anthropic

# Load training content
with open('system-prompt.md', 'r') as f:
    system_prompt = f.read()

with open('knowledge-base.md', 'r') as f:
    knowledge = f.read()

client = anthropic.Anthropic()

response = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=4096,
    system=f"{system_prompt}\n\n## Knowledge Base\n\n{knowledge}",
    messages=[
        {
            "role": "user",
            "content": "How do I add a new FAQ question?"
        }
    ]
)

print(response.content[0].text)
```

---

## Best Practices

### Keep Training Data Updated

When you make significant changes to the website (new features, pricing changes, service modifications), update the training files and re-upload them to your Copilot platform.

### Test Compliance Responses

Periodically test that the Copilot correctly handles compliance-sensitive queries:
- Requests for guaranteed outcomes (should refuse)
- PHI collection suggestions (should advise against)
- Emergency medical questions (should redirect to 911)

### Monitor Usage

Review Copilot conversations periodically to ensure responses remain accurate and compliant. Update the example conversations file with new edge cases as they arise.

### Limit Access

Only share access to the Copilot with authorized staff members who understand HIPAA requirements and medical marketing regulations.

---

## Troubleshooting

**Copilot gives outdated information**: Re-upload the latest training files after making website changes.

**Responses are too generic**: Add more specific examples to `example-conversations.md` covering the exact scenarios you need help with.

**Copilot suggests non-compliant content**: Review and strengthen the compliance rules in `system-prompt.md`.

**Technical answers are incorrect**: Update `codebase-reference.md` with any architectural changes made since initial setup.

---

## Support

For questions about the website codebase or CRM system, refer to the technical documentation in this training package. For questions about Copilot platform features, consult the respective platform's documentation (OpenAI, Anthropic, or Microsoft).
