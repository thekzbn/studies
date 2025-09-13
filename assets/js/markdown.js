// Configure marked.js
marked.setOptions({
  gfm: true,
  breaks: true,
  headerIds: true,
  highlight: function(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value;
    }
    return hljs.highlightAuto(code).value;
  }
});

// Wrapper function
function parseMarkdown(md) {
  return marked.parse(md);
}
