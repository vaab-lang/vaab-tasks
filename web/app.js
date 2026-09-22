const API = "http://127.0.0.1:8090";
const TOKEN_KEY = "vaab-tasks-token";

const tokenInput = document.querySelector("#token");
const tasksEl = document.querySelector("#tasks");
const statusEl = document.querySelector("#status");
const quoteFeed = document.querySelector("#quote-feed");
const quoteFlight = document.querySelector("#quote-flight");
let quotesInFlight = 0;
let quoteSeq = 0;

tokenInput.value = localStorage.getItem(TOKEN_KEY) || "";

function setFlight(delta) {
  quotesInFlight = Math.max(0, quotesInFlight + delta);
  if (quotesInFlight === 0) {
    quoteFlight.hidden = true;
    quoteFlight.textContent = "";
    return;
  }
  quoteFlight.hidden = false;
  quoteFlight.textContent = `${quotesInFlight} in flight`;
}

function pushQuote(quote, elapsedMs) {
  quoteFeed.hidden = false;
  const item = document.createElement("li");
  item.innerHTML = `<strong></strong><span></span>`;
  item.querySelector("strong").textContent = quote.text;
  item.querySelector("span").textContent = `${quote.source} · ${elapsedMs}ms`;
  quoteFeed.prepend(item);
  while (quoteFeed.children.length > 12) {
    quoteFeed.lastElementChild.remove();
  }
}

document.querySelector("#quote").addEventListener("click", () => {
  const seq = ++quoteSeq;
  const t0 = performance.now();
  setFlight(1);
  api("/api/quote")
    .then((quote) => {
      const elapsed = Math.round(performance.now() - t0);
      pushQuote(quote, quote.ms ?? elapsed);
      setStatus(`Quote #${seq} in ${elapsed}ms — spam away.`);
    })
    .catch((error) => setStatus(error.message, "error"))
    .finally(() => setFlight(-1));
});

function setStatus(message, kind = "info") {
  statusEl.textContent = message;
  statusEl.dataset.kind = kind;
}

function authHeaders() {
  const token = tokenInput.value.trim();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function api(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "content-type": "application/json",
      ...authHeaders(),
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = { raw: text };
  }
  if (!response.ok) {
    const detail = body?.Unauthorized
      ? "unauthorized"
      : body?.BadRequest?.message || body?.Database?.message || body?.Upstream?.message || text;
    throw new Error(detail || `HTTP ${response.status}`);
  }
  return body;
}

function renderTasks(rows) {
  tasksEl.innerHTML = "";
  for (const row of rows) {
    const item = document.createElement("li");
    item.innerHTML = `<strong></strong><span></span>`;
    item.querySelector("strong").textContent = row.title;
    item.querySelector("span").textContent = `${row.id} · ${row.owner}`;
    tasksEl.appendChild(item);
  }
  if (!rows.length) {
    setStatus("No tasks yet — add one above.");
  }
}

async function refresh() {
  const rows = await api("/api/tasks");
  renderTasks(rows);
  setStatus(`Loaded ${rows.length} task${rows.length === 1 ? "" : "s"}.`);
}

document.querySelector("#use-demo").addEventListener("click", async () => {
  try {
    const minted = await fetch("./demo-token.txt").then((r) => (r.ok ? r.text() : ""));
    if (!minted.trim()) {
      throw new Error("Run ./scripts/mint-token.sh first");
    }
    tokenInput.value = minted.trim();
  } catch (error) {
    setStatus(error.message, "error");
    return;
  }
  localStorage.setItem(TOKEN_KEY, tokenInput.value);
  setStatus("Demo token applied.");
  refresh().catch((error) => setStatus(error.message, "error"));
});

tokenInput.addEventListener("change", () => {
  localStorage.setItem(TOKEN_KEY, tokenInput.value.trim());
});

document.querySelector("#create").addEventListener("submit", async (event) => {
  event.preventDefault();
  const title = document.querySelector("#title").value.trim();
  try {
    await api("/api/tasks", { method: "POST", body: JSON.stringify({ title }) });
    document.querySelector("#title").value = "";
    await refresh();
  } catch (error) {
    setStatus(error.message, "error");
  }
});

if (tokenInput.value) {
  refresh().catch((error) => setStatus(error.message, "error"));
} else {
  setStatus("Paste a token or use the demo token to load tasks.");
}
