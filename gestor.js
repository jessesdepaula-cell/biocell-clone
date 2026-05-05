const storageKey = "reproboost-cadastros";
const loginKey = "reproboost-gestor-session";
const gestorEmail = "gestor@reproboost.com";
const gestorSenha = "reproboost123";

const loginSection = document.querySelector("#login-gestor");
const dashboardSection = document.querySelector("#gestor-dashboard");
const loginForm = document.querySelector("#gestor-login-form");
const loginFeedback = document.querySelector("#gestor-login-feedback");
const body = document.querySelector("#cadastros-body");
const filtroCadastro = document.querySelector("#filtro-cadastro");
const filtroStatus = document.querySelector("#filtro-status");
const exportarCsv = document.querySelector("#exportar-csv");
const sairGestor = document.querySelector("#sair-gestor");
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

function showDashboard() {
  loginSection?.classList.add("hidden");
  dashboardSection?.classList.remove("hidden");
  renderCadastros();
}

function showLogin() {
  dashboardSection?.classList.add("hidden");
  loginSection?.classList.remove("hidden");
}

if (localStorage.getItem(loginKey) === "on") {
  showDashboard();
} else {
  showLogin();
}

loginForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(loginForm);
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const senha = String(formData.get("senha") || "").trim();

  if (email === gestorEmail && senha === gestorSenha) {
    localStorage.setItem(loginKey, "on");
    loginFeedback.textContent = "";
    loginForm.reset();
    showDashboard();
    return;
  }

  loginFeedback.textContent = "E-mail ou senha invalidos.";
});

filtroCadastro?.addEventListener("input", renderCadastros);
filtroStatus?.addEventListener("change", renderCadastros);

exportarCsv?.addEventListener("click", () => {
  const items = getCadastros();
  if (!items.length) {
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

sairGestor?.addEventListener("click", () => {
  localStorage.removeItem(loginKey);
  showLogin();
});
