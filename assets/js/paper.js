// paper.js — loads a markdown paper from /papers/<file> and renders it
document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const fileParam = params.get('file');
  const slugParam = params.get('slug');
  const titleParam = params.get('title');

  const titleEl = document.getElementById('paper-title');
  const contentEl = document.getElementById('paper-content');

  function showError(title, msg) {
    if (titleEl) titleEl.textContent = title || 'Paper';
    if (contentEl) contentEl.textContent = msg || 'Unable to load content.';
  }

  // Try to find metadata in PAPERS
  let meta;
  if (window.PAPERS && window.PAPERS.length) {
    if (slugParam) meta = window.PAPERS.find(p => p.slug === slugParam);
    if (!meta && fileParam) meta = window.PAPERS.find(p => p.file === fileParam);
  }

  // Decide file to fetch and title to show
  const fileToFetch = fileParam || (meta && meta.file);
  const titleToShow = (meta && meta.title) || titleParam || (fileToFetch ? decodeURIComponent(fileToFetch).replace(/\.md$/i, '') : '');

  if (!fileToFetch) {
    showError('Paper not found', 'No file specified.');
    return;
  }

  // Basic sanitization: disallow path traversal or extra path separators.
  if (fileToFetch.includes('..') || /[\/\\]/.test(fileToFetch)) {
    showError('Invalid path', 'The requested file path is invalid.');
    return;
  }

  if (titleEl) titleEl.textContent = titleToShow;

  fetch('papers/' + fileToFetch)
    .then(res => {
      if (!res.ok) throw new Error('Network response not ok');
      return res.text();
    })
    .then(md => {
      // parseMarkdown is defined in markdown.js
      contentEl.innerHTML = parseMarkdown(md || '');
      if (window.hljs && typeof hljs.highlightAll === 'function') {
        hljs.highlightAll();
      }
    })
    .catch(err => {
      console.error(err);
      showError('Error loading paper', 'There was an error fetching the paper. Check the filename and that it exists in /papers.');
    });
});
