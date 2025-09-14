// main.js — builds the paper list from window.PAPERS
document.addEventListener('DOMContentLoaded', () => {
  const listEl = document.getElementById('paper-list');
  if (!listEl) return;

  if (!window.PAPERS || window.PAPERS.length === 0) {
    listEl.innerHTML = '<li>No papers yet — add some to assets/js/papers.js</li>';
    return;
  }

  window.PAPERS.forEach(paper => {
    const li = document.createElement('li');
    li.className = 'paper-item';

    const a = document.createElement('a');
    const href = `paper.html?file=${encodeURIComponent(paper.file)}&slug=${encodeURIComponent(paper.slug)}`;
    a.href = href;
    a.textContent = paper.title;
    a.setAttribute('title', paper.title);
    a.className = 'paper-link';

    li.appendChild(a);

    const meta = document.createElement('div');
    meta.className = 'paper-meta';
    meta.textContent = [paper.authors, paper.year].filter(Boolean).join(' · ');
    li.appendChild(meta);

    listEl.appendChild(li);
  });
});
