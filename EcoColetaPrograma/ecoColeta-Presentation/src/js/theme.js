function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
  // Salva preferência no localStorage
  if (document.body.classList.contains("dark-mode")) {
    localStorage.setItem("theme", "dark");
  } else {
    localStorage.setItem("theme", "light");
  }
}

// Aplica tema salvo ao carregar
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark-mode");
}
