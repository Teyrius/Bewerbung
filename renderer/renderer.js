const form = document.getElementById("application-form");
const newButton = document.getElementById("new-btn");
const resetButton = document.getElementById("reset-btn");
const deleteButton = document.getElementById("delete-btn");
const searchInput = document.getElementById("search");
const themeSelect = document.getElementById("theme-select");

const countOpen = document.getElementById("count-open");
const countPositive = document.getElementById("count-positive");
const countNegative = document.getElementById("count-negative");

const companyInput = document.getElementById("company");
const applicationDateInput = document.getElementById("applicationDate");
const sentViaInput = document.getElementById("sentVia");
const responseStatusInput = document.getElementById("responseStatus");
const reminderAtInput = document.getElementById("reminderAt");
const coverLetterInput = document.getElementById("coverLetter");
const companyResponseInput = document.getElementById("companyResponse");

const tableBody = document.getElementById("applications-body");

const THEME_STORAGE_KEY = "bewerbungsapp-theme";
const THEMES = ["dark", "light", "midnight"];

let applications = [];
let selectedId = null;

function applyTheme(theme) {
  document.body.dataset.theme = theme;
}

function initTheme() {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  const activeTheme = THEMES.includes(savedTheme) ? savedTheme : "dark";
  applyTheme(activeTheme);
  if (themeSelect) {
    themeSelect.value = activeTheme;
  }
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  return new Intl.DateTimeFormat("de-DE").format(date);
}

function formatDateTime(value) {
  if (!value) return "–";
  const date = new Date(value);
  return new Intl.DateTimeFormat("de-DE", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

function updateCounts() {
  const open = applications.filter((item) => item.response_status === "offen").length;
  const positive = applications.filter((item) => item.response_status === "positiv").length;
  const negative = applications.filter((item) => item.response_status === "negativ").length;

  countOpen.textContent = open;
  countPositive.textContent = positive;
  countNegative.textContent = negative;
}

function renderTable(filter = "") {
  const query = filter.trim().toLowerCase();
  const filtered = query
    ? applications.filter((item) => item.company.toLowerCase().includes(query))
    : applications;

  tableBody.innerHTML = "";

  if (filtered.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="5" class="empty">Noch keine Bewerbungen gespeichert.</td>`;
    tableBody.appendChild(row);
    return;
  }

  filtered.forEach((item) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>
        <div class="company-cell">
          <strong>${item.company}</strong>
          <span>${item.cover_letter ? item.cover_letter.slice(0, 60) : ""}</span>
        </div>
      </td>
      <td>${formatDate(item.application_date)}</td>
      <td><span class="status ${item.response_status}">${item.response_status}</span></td>
      <td>${formatDateTime(item.reminder_at)}</td>
      <td>${item.sent_via === "email" ? "E-Mail" : "Website"}</td>
    `;

    row.addEventListener("click", () => {
      selectApplication(item.id);
    });

    tableBody.appendChild(row);
  });
}

function clearForm() {
  form.reset();
  selectedId = null;
  deleteButton.disabled = true;
  responseStatusInput.value = "offen";
  sentViaInput.value = "email";
}

function startNewApplication() {
  clearForm();
  applicationDateInput.value = new Date().toISOString().slice(0, 10);
  companyInput.focus();
}

function fillForm(item) {
  companyInput.value = item.company;
  applicationDateInput.value = item.application_date;
  sentViaInput.value = item.sent_via;
  responseStatusInput.value = item.response_status;
  reminderAtInput.value = item.reminder_at ? item.reminder_at.slice(0, 16) : "";
  coverLetterInput.value = item.cover_letter || "";
  companyResponseInput.value = item.company_response || "";
}

async function loadApplications() {
  applications = await window.api.listApplications();
  updateCounts();
  renderTable(searchInput.value);
}

function selectApplication(id) {
  const item = applications.find((entry) => entry.id === id);
  if (!item) return;
  selectedId = id;
  deleteButton.disabled = false;
  fillForm(item);
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const payload = {
    id: selectedId,
    company: companyInput.value.trim(),
    application_date: applicationDateInput.value,
    sent_via: sentViaInput.value,
    response_status: responseStatusInput.value,
    reminder_at: reminderAtInput.value ? new Date(reminderAtInput.value).toISOString() : null,
    cover_letter: coverLetterInput.value.trim(),
    company_response: companyResponseInput.value.trim()
  };

  if (!payload.company || !payload.application_date) {
    return;
  }

  if (selectedId) {
    await window.api.updateApplication(payload);
  } else {
    await window.api.addApplication(payload);
  }

  await loadApplications();
  clearForm();
});

newButton.addEventListener("click", () => {
  startNewApplication();
});

resetButton.addEventListener("click", () => {
  clearForm();
});

deleteButton.addEventListener("click", async () => {
  if (!selectedId) return;
  await window.api.deleteApplication(selectedId);
  await loadApplications();
  clearForm();
});

searchInput.addEventListener("input", (event) => {
  renderTable(event.target.value);
});

if (themeSelect) {
  themeSelect.addEventListener("change", (event) => {
    const nextTheme = THEMES.includes(event.target.value) ? event.target.value : "dark";
    applyTheme(nextTheme);
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  });
}

initTheme();
loadApplications();
