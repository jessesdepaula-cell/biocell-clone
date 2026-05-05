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
const body = document.querySelector("#cadastros-body");
const filtroCadastro = document.querySelector("#filtro-cadastro");
const filtroStatus = document.querySelector("#filtro-status");
const exportarCsv = document.querySelector("#exportar-csv");
const metricTotal = document.querySelector("#metric-total");
const metricNovos = document.querySelector("#metric-novos");
const metricContatados = document.querySelector("#metric-contatados");
const metricQualificados = document.querySelector("#metric-qualificados");

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

function updateMetrics(items) {
  metricTotal.textContent = String(items.length);
  metricNovos.textContent = String(items.filter((item) => item.status === "novo").length);
  metricContatados.textContent = String(items.filter((item) => item.status === "contatado").length);
  metricQualificados.textContent = String(items.filter((item) => item.status === "qualificado").length);
}

function renderCadastros() {
  if (!body) {
    return;
  }

  const cadastroItems = getCadastros();
  const query = (filtroCadastro?.value || "").trim().toLowerCase();
  const status = filtroStatus?.value || "todos";

  const filtered = cadastroItems.filter((item) => {
    const matchesQuery =
      !query ||
      item.nome.toLowerCase().includes(query) ||
      item.empresa.toLowerCase().includes(query) ||
      item.whatsapp.toLowerCase().includes(query);

    const matchesStatus = status === "todos" || item.status === status;
    return matchesQuery && matchesStatus;
  });

  updateMetrics(cadastroItems);

  if (!filtered.length) {
    body.innerHTML = `
      <tr class="empty-row">
        <td colspan="5">Nenhum cadastro encontrado com esse filtro.</td>
      </tr>
    `;
    return;
  }

  body.innerHTML = filtered
    .map(
      (item) => `
        <tr>
          <td>${item.nome}</td>
          <td>${item.empresa}</td>
          <td>${item.whatsapp}</td>
          <td>${formatDate(item.criadoEm)}</td>
          <td>
            <select class="status-select" data-id="${item.id}">
              <option value="novo" ${item.status === "novo" ? "selected" : ""}>Novo</option>
              <option value="contatado" ${item.status === "contatado" ? "selected" : ""}>Contatado</option>
              <option value="qualificado" ${item.status === "qualificado" ? "selected" : ""}>Qualificado</option>
              <option value="fechado" ${item.status === "fechado" ? "selected" : ""}>Fechado</option>
            </select>
          </td>
        </tr>
      `,
    )
    .join("");

  body.querySelectorAll(".status-select").forEach((select) => {
    select.addEventListener("change", (event) => {
      const items = getCadastros();
      const target = event.currentTarget;
      const current = items.find((item) => item.id === target.dataset.id);
      if (!current) {
        return;
      }
      current.status = target.value;
      saveCadastros(items);
      renderCadastros();
    });
  });
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
    renderCadastros();
  });
}

filtroCadastro?.addEventListener("input", renderCadastros);
filtroStatus?.addEventListener("change", renderCadastros);

exportarCsv?.addEventListener("click", () => {
  const items = getCadastros();
  if (!items.length) {
    if (feedback) {
      feedback.textContent = "Ainda nao ha cadastros para exportar.";
    }
    return;
  }

  const header = ["Nome", "Empresa", "WhatsApp", "Data", "Status"];
  const rows = items.map((item) => [item.nome, item.empresa, item.whatsapp, formatDate(item.criadoEm), item.status]);
  const csv = [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(";"))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "cadastros-reproboost.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
});

renderCadastros();
