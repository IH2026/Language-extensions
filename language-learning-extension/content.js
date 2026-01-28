// Language Learning Helper - Content Script
// This script runs on every webpage and detects text highlighting

(function() {
  'use strict';

  let tooltip = null;
  let currentSelectedText = '';
  let currentContext = '';

  // Create the tooltip element
  function createTooltip() {
    if (tooltip) return tooltip;

    tooltip = document.createElement('div');
    tooltip.id = 'lang-helper-tooltip';
    tooltip.innerHTML = `
      <div class="lang-helper-header">
        <span class="lang-helper-title">Language Helper</span>
        <button class="lang-helper-close" title="Close">&times;</button>
      </div>
      <div class="lang-helper-word"></div>
      <div class="lang-helper-content">
        <div class="lang-helper-loading">
          <div class="lang-helper-spinner"></div>
          <span>Getting explanation...</span>
        </div>
        <div class="lang-helper-explanation"></div>
      </div>
      <div class="lang-helper-actions">
        <button class="lang-helper-save-btn">
          <span class="lang-helper-save-icon">+</span> Save to Vocabulary
        </button>
        <span class="lang-helper-saved-msg">Saved!</span>
      </div>
    `;

    document.body.appendChild(tooltip);

    // Close button handler
    tooltip.querySelector('.lang-helper-close').addEventListener('click', hideTooltip);

    // Save button handler
    tooltip.querySelector('.lang-helper-save-btn').addEventListener('click', saveToVocabulary);

    return tooltip;
  }

  // Get surrounding context for better AI explanation
  function getContext(selection) {
    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer;

    // Get the parent element that contains text
    let contextElement = container;
    if (container.nodeType === Node.TEXT_NODE) {
      contextElement = container.parentElement;
    }

    // Try to get a larger context (paragraph or nearby text)
    let contextText = '';

    // Walk up to find a good container (paragraph, div, etc.)
    let parent = contextElement;
    for (let i = 0; i < 3 && parent; i++) {
      if (parent.tagName === 'P' || parent.tagName === 'DIV' ||
          parent.tagName === 'ARTICLE' || parent.tagName === 'SECTION') {
        contextText = parent.textContent;
        break;
      }
      parent = parent.parentElement;
    }

    // Fallback to immediate context
    if (!contextText || contextText.length < 20) {
      contextText = contextElement.textContent;
    }

    // Limit context length
    if (contextText.length > 500) {
      const selectedText = selection.toString();
      const index = contextText.indexOf(selectedText);
      if (index !== -1) {
        const start = Math.max(0, index - 200);
        const end = Math.min(contextText.length, index + selectedText.length + 200);
        contextText = (start > 0 ? '...' : '') +
                      contextText.substring(start, end) +
                      (end < contextText.length ? '...' : '');
      } else {
        contextText = contextText.substring(0, 500) + '...';
      }
    }

    return contextText.trim();
  }

  // Position tooltip near selection
  function positionTooltip(selection) {
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    const tooltipWidth = 350;
    const tooltipHeight = tooltip.offsetHeight || 200;

    let left = rect.left + window.scrollX + (rect.width / 2) - (tooltipWidth / 2);
    let top = rect.bottom + window.scrollY + 10;

    // Keep within viewport horizontally
    if (left < 10) left = 10;
    if (left + tooltipWidth > window.innerWidth - 10) {
      left = window.innerWidth - tooltipWidth - 10;
    }

    // If tooltip would go below viewport, show above selection
    if (rect.bottom + tooltipHeight + 20 > window.innerHeight) {
      top = rect.top + window.scrollY - tooltipHeight - 10;
    }

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
  }

  // Show tooltip with loading state
  function showTooltip(selectedText, context, selection) {
    createTooltip();

    currentSelectedText = selectedText;
    currentContext = context;

    // Reset state
    tooltip.querySelector('.lang-helper-word').textContent = `"${selectedText}"`;
    tooltip.querySelector('.lang-helper-loading').style.display = 'flex';
    tooltip.querySelector('.lang-helper-explanation').style.display = 'none';
    tooltip.querySelector('.lang-helper-explanation').textContent = '';
    tooltip.querySelector('.lang-helper-save-btn').style.display = 'inline-flex';
    tooltip.querySelector('.lang-helper-saved-msg').style.display = 'none';

    positionTooltip(selection);
    tooltip.classList.add('visible');

    // Request explanation from background script
    chrome.runtime.sendMessage({
      action: 'getExplanation',
      text: selectedText,
      context: context
    }, response => {
      if (response && response.explanation) {
        showExplanation(response.explanation);
      } else if (response && response.error) {
        showExplanation(`Error: ${response.error}\n\nPlease check your API key in the extension options.`);
      }
    });
  }

  // Display the explanation
  function showExplanation(explanation) {
    if (!tooltip) return;

    tooltip.querySelector('.lang-helper-loading').style.display = 'none';
    const explanationEl = tooltip.querySelector('.lang-helper-explanation');
    explanationEl.textContent = explanation;
    explanationEl.style.display = 'block';
  }

  // Hide tooltip
  function hideTooltip() {
    if (tooltip) {
      tooltip.classList.remove('visible');
    }
  }

  // Save word to vocabulary
  function saveToVocabulary() {
    if (!currentSelectedText) return;

    const explanation = tooltip.querySelector('.lang-helper-explanation').textContent;

    chrome.runtime.sendMessage({
      action: 'saveWord',
      word: currentSelectedText,
      context: currentContext,
      explanation: explanation,
      url: window.location.href,
      title: document.title
    }, response => {
      if (response && response.success) {
        tooltip.querySelector('.lang-helper-save-btn').style.display = 'none';
        tooltip.querySelector('.lang-helper-saved-msg').style.display = 'inline';
      }
    });
  }

  // Handle text selection
  function handleSelection() {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();

    // Only show for reasonable selections (1-50 characters typically for words/phrases)
    if (selectedText.length >= 1 && selectedText.length <= 100) {
      const context = getContext(selection);
      showTooltip(selectedText, context, selection);
    }
  }

  // Listen for mouseup to detect selection
  document.addEventListener('mouseup', (e) => {
    // Don't trigger if clicking inside our tooltip
    if (tooltip && tooltip.contains(e.target)) {
      return;
    }

    // Small delay to ensure selection is complete
    setTimeout(() => {
      const selection = window.getSelection();
      const selectedText = selection.toString().trim();

      if (selectedText.length >= 1 && selectedText.length <= 100) {
        handleSelection();
      } else {
        // Hide tooltip if clicking elsewhere with no selection
        hideTooltip();
      }
    }, 10);
  });

  // Hide tooltip on scroll (optional, can be removed if annoying)
  let scrollTimeout;
  document.addEventListener('scroll', () => {
    if (tooltip && tooltip.classList.contains('visible')) {
      tooltip.style.opacity = '0.5';
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        if (tooltip) tooltip.style.opacity = '1';
      }, 150);
    }
  });

  // Hide on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      hideTooltip();
    }
  });

})();
