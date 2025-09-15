// main.js — enhanced paper list with search and animations
document.addEventListener('DOMContentLoaded', () => {
  const listEl = document.getElementById('paper-list');
  const searchBar = document.getElementById('search-papers');
  if (!listEl) return;

  let allPapers = [];

  function createPaperElement(paper, index) {
    const li = document.createElement('li');
    li.className = 'paper-item animate-fadeInUp';
    li.style.animationDelay = `${index * 0.1}s`;
    li.dataset.searchContent = `${paper.title} ${paper.authors} ${paper.year}`.toLowerCase();

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

    return li;
  }

  function renderPapers(papers) {
    listEl.innerHTML = '';
    if (papers.length === 0) {
      listEl.innerHTML = '<li class="no-results">No publications found matching your search.</li>';
      return;
    }

    papers.forEach((paper, index) => {
      listEl.appendChild(createPaperElement(paper, index));
    });
  }

  function searchPapers(query) {
    if (!query.trim()) {
      renderPapers(allPapers);
      return;
    }

    const filtered = allPapers.filter(paper => {
      const searchContent = `${paper.title} ${paper.authors} ${paper.year}`.toLowerCase();
      return searchContent.includes(query.toLowerCase());
    });
    renderPapers(filtered);
  }

  // Initialize papers
  if (!window.PAPERS || window.PAPERS.length === 0) {
    listEl.innerHTML = '<li>No papers yet — add some to assets/js/papers.js</li>';
    return;
  }

  allPapers = window.PAPERS;
  renderPapers(allPapers);

  // Search functionality
  if (searchBar) {
    searchBar.addEventListener('input', (e) => {
      searchPapers(e.target.value);
    });

    // Clear search on escape
    searchBar.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        searchBar.value = '';
        searchPapers('');
      }
    });
  }

  // Add scroll animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-slideInLeft');
      }
    });
  }, observerOptions);

  document.querySelectorAll('.section-title').forEach(el => {
    observer.observe(el);
  });
});