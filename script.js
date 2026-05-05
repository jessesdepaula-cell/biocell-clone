const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const storageKey = "reproboost-cadastros";

if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      siteNav.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

const form = document.querySelector("#cadastro-form");
const feedback = document.querySelector("#cadastro-feedback");

function getCadastros() {
  try {
    return JSON.parse(localStorage.getItem(storageKey)) || [];
  } catch {
    return [];
  }
}

function saveCadastros(items) {
  localStorage.setItem(storageKey, JSON.stringify(items));
}

function formatDate(value) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

if (form) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const novoCadastro = {
      id: crypto.randomUUID(),
      nome: String(formData.get("nome") || "").trim(),
      empresa: String(formData.get("empresa") || "").trim(),
      whatsapp: String(formData.get("whatsapp") || "").trim(),
      criadoEm: new Date().toISOString(),
      status: "novo",
    };

    if (!novoCadastro.nome || !novoCadastro.empresa || !novoCadastro.whatsapp) {
      feedback.textContent = "Preencha todos os campos para continuar.";
      return;
    }

    const items = getCadastros();
    items.unshift(novoCadastro);
    saveCadastros(items);
    form.reset();
    feedback.textContent = "Cadastro recebido com sucesso no painel do gestor.";
  });
}
