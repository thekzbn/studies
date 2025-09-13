const params = new URLSearchParams(window.location.search);
const file = params.get("file");

if (file) {
  document.getElementById("paper-title").textContent = file.replace(".md", "");

  fetch("papers/" + file)
    .then(res => res.text())
    .then(md => {
      document.getElementById("paper-content").innerHTML = parseMarkdown(md);
      hljs.highlightAll();
    })
    .catch(err => {
      document.getElementById("paper-content").textContent = "Error loading paper.";
    });
}
