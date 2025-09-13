// Minimal Markdown parser (basic headers, bold, italic, links)
function parseMarkdown(md) {
  return md
    .replace(/^### (.*$)/gim, "<h3>$1</h3>")
    .replace(/^## (.*$)/gim, "<h2>$1</h2>")
    .replace(/^# (.*$)/gim, "<h1>$1</h1>")
    .replace(/\*\*(.*)\*\*/gim, "<b>$1</b>")
    .replace(/\*(.*)\*/gim, "<i>$1</i>")
    .replace(/\[(.*?)\]\((.*?)\)/gim, "<a href='$2' target='_blank'>$1</a>")
    .replace(/\n$/gim, "<br>");
}
