// Language Learning Helper - Background Script
// Handles API calls and vocabulary storage

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getExplanation') {
    getExplanation(request.text, request.context)
      .then(explanation => sendResponse({ explanation }))
      .catch(error => sendResponse({ error: error.message }));
    return true; // Keep message channel open for async response
  }

  if (request.action === 'saveWord') {
    saveWord(request)
      .then(() => sendResponse({ success: true }))
      .catch(error => sendResponse({ error: error.message }));
    return true;
  }

  if (request.action === 'getVocabulary') {
    getVocabulary()
      .then(vocabulary => sendResponse({ vocabulary }))
      .catch(error => sendResponse({ error: error.message }));
    return true;
  }

  if (request.action === 'deleteWord') {
    deleteWord(request.id)
      .then(() => sendResponse({ success: true }))
      .catch(error => sendResponse({ error: error.message }));
    return true;
  }

  if (request.action === 'exportVocabulary') {
    exportVocabulary()
      .then(data => sendResponse({ data }))
      .catch(error => sendResponse({ error: error.message }));
    return true;
  }
});

// Get explanation from OpenAI API
async function getExplanation(text, context) {
  // Get API key from storage
  const result = await chrome.storage.sync.get(['openaiApiKey']);
  const apiKey = result.openaiApiKey;

  if (!apiKey) {
    throw new Error('No API key configured. Please set your OpenAI API key in the extension options.');
  }

  const prompt = `You are a helpful language learning assistant. A user has highlighted the following text while reading:

Highlighted text: "${text}"

Surrounding context: "${context}"

Please provide a helpful explanation that includes:
1. The meaning/definition of the highlighted word or phrase
2. How it's being used in this specific context
3. Any relevant grammar notes, common usage patterns, or related expressions
4. If it's an idiom, slang, or technical term, explain that

Keep your explanation concise but informative (around 100-150 words). Format it in a clear, easy-to-read way.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful language learning assistant that explains words and phrases in context.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 300,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (response.status === 401) {
      throw new Error('Invalid API key. Please check your OpenAI API key in the extension options.');
    }
    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please try again in a moment.');
    }
    throw new Error(errorData.error?.message || `API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}

// Save word to vocabulary
async function saveWord({ word, context, explanation, url, title }) {
  const result = await chrome.storage.local.get(['vocabulary']);
  const vocabulary = result.vocabulary || [];

  const newEntry = {
    id: Date.now().toString(),
    word: word,
    context: context,
    explanation: explanation,
    url: url,
    title: title,
    dateAdded: new Date().toISOString()
  };

  vocabulary.unshift(newEntry); // Add to beginning of list

  await chrome.storage.local.set({ vocabulary });
  return newEntry;
}

// Get all vocabulary
async function getVocabulary() {
  const result = await chrome.storage.local.get(['vocabulary']);
  return result.vocabulary || [];
}

// Delete a word from vocabulary
async function deleteWord(id) {
  const result = await chrome.storage.local.get(['vocabulary']);
  const vocabulary = result.vocabulary || [];

  const filtered = vocabulary.filter(entry => entry.id !== id);

  await chrome.storage.local.set({ vocabulary: filtered });
}

// Export vocabulary as JSON
async function exportVocabulary() {
  const vocabulary = await getVocabulary();
  return JSON.stringify(vocabulary, null, 2);
}
