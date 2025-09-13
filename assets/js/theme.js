const toggleBtn = document.getElementById("theme-toggle");
const body = document.body;

// Load saved theme
if (localStorage.getItem("theme") === "dark") {
  body.classList.add("dark");
  toggleBtn.innerHTML = `<i class="fa-solid fa-sun"></i>`;
}

toggleBtn.addEventListener("click", () => {
  body.classList.toggle("dark");
  const isDark = body.classList.contains("dark");
  toggleBtn.innerHTML = isDark
    ? `<i class="fa-solid fa-sun"></i>`
    : `<i class="fa-solid fa-moon"></i>`;
  localStorage.setItem("theme", isDark ? "dark" : "light");
});
