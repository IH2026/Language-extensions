# Language Learning Helper - Installation Guide

A browser extension that helps you learn languages by explaining highlighted text using AI.

---

## What This Extension Does

- **Highlight any text** on a webpage to get an AI-powered explanation
- **Save words** to your personal vocabulary list
- **Review and export** your saved vocabulary anytime

---

## Step-by-Step Installation Instructions

### Step 1: Get an OpenAI API Key (Required for AI explanations)

1. Go to [platform.openai.com](https://platform.openai.com/signup)
2. Click **"Sign up"** and create a free account (or sign in if you have one)
3. Once logged in, click on **"API keys"** in the left sidebar
4. Click the green **"+ Create new secret key"** button
5. Give it a name like "Language Helper" and click **"Create secret key"**
6. **IMPORTANT:** Copy the key that appears (it starts with `sk-`)
7. Save this key somewhere safe - you'll need it in Step 3

> **Cost Note:** OpenAI charges a small fee for API usage (typically $0.001-0.002 per explanation). New accounts often get $5-18 in free credits.

---

### Step 2: Install the Extension in Chrome

1. Open Google Chrome browser
2. Type `chrome://extensions` in the address bar and press Enter
3. In the top-right corner, turn ON **"Developer mode"** (toggle switch)
4. Click the **"Load unpacked"** button that appears
5. Navigate to the `language-learning-extension` folder and select it
6. Click **"Select Folder"** (or "Open" on Mac)
7. The extension should now appear in your extensions list!

You should see a purple/gradient icon appear in your browser toolbar (top-right area). If you don't see it, click the puzzle piece icon and pin "Language Learning Helper".

---

### Step 3: Add Your API Key

1. Click the **Language Learning Helper icon** in your browser toolbar
2. Click the **gear/settings icon** (⚙️) in the top-right of the popup
3. Paste your OpenAI API key in the "API Key" field
4. Click **"Save Settings"**
5. You should see a green "Settings saved successfully!" message

---

## How to Use the Extension

### Getting Word Explanations

1. Go to any webpage (news article, blog, etc.)
2. **Highlight any word or phrase** by clicking and dragging your mouse over it
3. A popup will appear with an AI-generated explanation
4. The explanation includes:
   - The word's meaning
   - How it's used in context
   - Grammar notes and related expressions

### Saving Words to Your Vocabulary

1. After highlighting text and seeing the explanation
2. Click the **"+ Save to Vocabulary"** button in the popup
3. The word is now saved!

### Reviewing Your Vocabulary

1. Click the **Language Learning Helper icon** in your toolbar
2. You'll see all your saved words
3. Use the **search box** to find specific words
4. Click on any word card to expand the full explanation

### Exporting Your Vocabulary

1. Click the extension icon
2. Click the **download icon** (↓) in the stats bar
3. A JSON file with all your vocabulary will download
4. You can use this to backup your words or import them elsewhere

---

## Troubleshooting

### "No API key configured" error
- Go to Settings (gear icon) and make sure you've entered your API key
- Make sure the key starts with `sk-`

### "Invalid API key" error
- Double-check that you copied the entire API key
- Try creating a new API key on platform.openai.com

### "Rate limit exceeded" error
- Wait a minute and try again
- This happens if you make too many requests quickly

### Extension not working on a page
- Try refreshing the page
- Some pages (like Chrome's internal pages) don't allow extensions

### Tooltip not appearing
- Make sure you're selecting text (click and drag)
- Try selecting a shorter phrase (under 100 characters)

---

## For Microsoft Edge Users

The installation process is almost identical:

1. Type `edge://extensions` in the address bar
2. Turn on **"Developer mode"** in the left sidebar
3. Click **"Load unpacked"**
4. Select the `language-learning-extension` folder
5. Follow Steps 3 onwards from above

---

## For Firefox Users

Firefox requires a slightly different manifest format. This extension is currently designed for Chrome/Edge. A Firefox version would need modifications.

---

## Privacy & Security

- Your API key is stored locally in your browser only
- Your vocabulary list is stored locally in your browser only
- No data is sent anywhere except to OpenAI for generating explanations
- The extension only reads text you highlight - nothing else

---

## Need Help?

If something isn't working:
1. Make sure Developer mode is enabled in Chrome
2. Try removing and re-adding the extension
3. Check that your API key is valid and has credits
4. Refresh the webpage you're trying to use it on

Enjoy learning new words!
