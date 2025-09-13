// Add your research papers manually here:
const papers = [
    { title: "Examination Malpractice and Literacy in Nigeria: A Crisis of Educational Integrity", file: "_MConverter.eu_Examination Malpractice and Literacy in Nigeria A Crisis of Educational Integrity.edited.md" },
    { title: "Quantum Systems for Youth Research", file: "paper2.md" }
];

const listEl = document.getElementById("paper-list");

papers.forEach(paper => {
    const li = document.createElement("li");
    li.innerHTML = `<a href="paper.html?file=${encodeURIComponent(paper.file)}">${paper.title}</a>`;
    listEl.appendChild(li);
});
