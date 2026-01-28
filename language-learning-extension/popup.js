// Language Learning Helper - Popup Script

document.addEventListener('DOMContentLoaded', () => {
  loadVocabulary();
  setupEventListeners();
});

let allWords = [];

// Load vocabulary from storage
function loadVocabulary() {
  chrome.runtime.sendMessage({ action: 'getVocabulary' }, response => {
    if (response && response.vocabulary) {
      allWords = response.vocabulary;
      renderVocabulary(allWords);
      updateWordCount(allWords.length);
    }
  });
}

// Render vocabulary list
function renderVocabulary(words) {
  const listEl = document.getElementById('vocabularyList');
  const emptyState = document.getElementById('emptyState');

  if (words.length === 0) {
    listEl.innerHTML = '';
    emptyState.classList.add('visible');
    return;
  }

  emptyState.classList.remove('visible');

  listEl.innerHTML = words.map(word => `
    <div class="word-card" data-id="${word.id}">
      <div class="word-header">
        <span class="word-text">${escapeHtml(word.word)}</span>
        <span class="word-date">${formatDate(word.dateAdded)}</span>
      </div>
      <div class="word-explanation">${escapeHtml(word.explanation)}</div>
      <button class="expand-btn" data-id="${word.id}">Show more</button>
      ${word.context ? `<div class="word-context">"${escapeHtml(truncate(word.context, 150))}"</div>` : ''}
      <div class="word-actions">
        ${word.url ? `<a href="${escapeHtml(word.url)}" target="_blank" class="word-source" title="${escapeHtml(word.title || word.url)}">${escapeHtml(word.title || 'Source')}</a>` : '<span></span>'}
        <button class="delete-btn" data-id="${word.id}">Delete</button>
      </div>
    </div>
  `).join('');

  // Add event listeners to delete buttons
  listEl.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.dataset.id;
      deleteWord(id);
    });
  });

  // Add event listeners to expand buttons
  listEl.querySelectorAll('.expand-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('.word-card');
      const explanation = card.querySelector('.word-explanation');
      const isExpanded = explanation.classList.contains('expanded');

      explanation.classList.toggle('expanded');
      e.target.textContent = isExpanded ? 'Show more' : 'Show less';
    });
  });
}

// Update word count display
function updateWordCount(count) {
  document.getElementById('wordCount').textContent = count;
}

// Delete a word
function deleteWord(id) {
  if (confirm('Are you sure you want to delete this word?')) {
    chrome.runtime.sendMessage({ action: 'deleteWord', id }, response => {
      if (response && response.success) {
        allWords = allWords.filter(w => w.id !== id);
        renderVocabulary(filterWords(document.getElementById('searchInput').value));
        updateWordCount(allWords.length);
      }
    });
  }
}

// Filter words based on search
function filterWords(query) {
  if (!query) return allWords;

  const lowerQuery = query.toLowerCase();
  return allWords.filter(word =>
    word.word.toLowerCase().includes(lowerQuery) ||
    word.explanation.toLowerCase().includes(lowerQuery) ||
    (word.context && word.context.toLowerCase().includes(lowerQuery))
  );
}

// Setup event listeners
function setupEventListeners() {
  // Search input
  const searchInput = document.getElementById('searchInput');
  searchInput.addEventListener('input', (e) => {
    const filtered = filterWords(e.target.value);
    renderVocabulary(filtered);
  });

  // Export button
  document.getElementById('exportBtn').addEventListener('click', exportVocabulary);

  // Settings button
  document.getElementById('settingsBtn').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
}

// Export vocabulary
function exportVocabulary() {
  chrome.runtime.sendMessage({ action: 'exportVocabulary' }, response => {
    if (response && response.data) {
      const blob = new Blob([response.data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vocabulary-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  });
}

// Helper functions
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
}

function truncate(text, maxLength) {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}
