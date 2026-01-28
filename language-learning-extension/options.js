// Language Learning Helper - Options Script

document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  setupEventListeners();
});

// Load saved settings
function loadSettings() {
  chrome.storage.sync.get(['openaiApiKey'], result => {
    if (result.openaiApiKey) {
      document.getElementById('apiKey').value = result.openaiApiKey;
    }
  });
}

// Setup event listeners
function setupEventListeners() {
  // Save button
  document.getElementById('saveBtn').addEventListener('click', saveSettings);

  // Toggle password visibility
  document.getElementById('toggleVisibility').addEventListener('click', toggleApiKeyVisibility);

  // Export data
  document.getElementById('exportDataBtn').addEventListener('click', exportData);

  // Clear data
  document.getElementById('clearDataBtn').addEventListener('click', clearData);

  // Save on Enter key
  document.getElementById('apiKey').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      saveSettings();
    }
  });
}

// Save settings
function saveSettings() {
  const apiKey = document.getElementById('apiKey').value.trim();

  if (!apiKey) {
    showStatus('Please enter an API key', 'error');
    return;
  }

  if (!apiKey.startsWith('sk-')) {
    showStatus('API key should start with "sk-"', 'error');
    return;
  }

  chrome.storage.sync.set({ openaiApiKey: apiKey }, () => {
    showStatus('Settings saved successfully!', 'success');
  });
}

// Toggle API key visibility
function toggleApiKeyVisibility() {
  const input = document.getElementById('apiKey');
  const eyeIcon = document.getElementById('eyeIcon');

  if (input.type === 'password') {
    input.type = 'text';
    eyeIcon.innerHTML = `
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    `;
  } else {
    input.type = 'password';
    eyeIcon.innerHTML = `
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    `;
  }
}

// Export all data
function exportData() {
  chrome.storage.local.get(['vocabulary'], result => {
    const data = {
      vocabulary: result.vocabulary || [],
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `language-helper-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showStatus('Data exported successfully!', 'success');
  });
}

// Clear all vocabulary data
function clearData() {
  if (confirm('Are you sure you want to delete all saved vocabulary? This cannot be undone.')) {
    if (confirm('This will permanently delete ALL your saved words. Continue?')) {
      chrome.storage.local.set({ vocabulary: [] }, () => {
        showStatus('All vocabulary data has been cleared.', 'success');
      });
    }
  }
}

// Show status message
function showStatus(message, type) {
  const statusEl = document.getElementById('statusMessage');
  statusEl.textContent = message;
  statusEl.className = `status-message ${type}`;

  // Auto-hide after 3 seconds
  setTimeout(() => {
    statusEl.className = 'status-message';
  }, 3000);
}
