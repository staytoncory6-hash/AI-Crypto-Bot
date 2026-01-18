function log(msg) {
  const el = document.getElementById("log");
  el.textContent = `[${new Date().toLocaleTimeString()}] ${msg}\n` + el.textContent;
}

function getApiBase() {
  const v = document.getElementById("apiUrl").value.trim();
  if (!v) throw new Error("Set Backend API URL first.");
  return v.replace(/\/+$/, "");
}

async function callApi(path, opts = {}) {
  const base = getApiBase();
  const res = await fetch(base + path, {
    ...opts,
    headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
    credentials: "include" // lets cookies work if you choose cookie auth
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

// Opens Coinbase OAuth (backend builds the Coinbase auth URL)
async function connect() {
  try {
    log("Requesting Coinbase connect link...");
    const data = await callApi("/auth/start");
    if (!data.url) throw new Error("No auth URL returned.");
    log("Opening Coinbase authorization...");
    window.location.href = data.url; // backend should redirect back to /auth/callback
  } catch (e) {
    log("Connect error: " + e.message);
  }
}

async function startBot() {
  try {
    log("Starting bot...");
    const data = await callApi("/bot/start", { method: "POST", body: JSON.stringify({ mode: "paper" }) });
    log("Bot started: " + JSON.stringify(data));
  } catch (e) {
    log("Start error: " + e.message);
  }
}

async function stopBot() {
  try {
    log("Stopping bot...");
    const data = await callApi("/bot/stop", { method: "POST" });
    log("Bot stopped: " + JSON.stringify(data));
  } catch (e) {
    log("Stop error: " + e.message);
  }
}

async function getStatus() {
  try {
    log("Fetching status...");
    const data = await callApi("/bot/status");
    log("Status: " + JSON.stringify(data, null, 2));
  } catch (e) {
    log("Status error: " + e.message);
  }
}
