// ═══════════════════════════════════════════════════════════════════
// IMMORTAIL™ APP — RUN 7
// UI LAYER — STATELESS DISPLAY ONLY (CORE CONTRACT RULE 6)
// ═══════════════════════════════════════════════════════════════════

// ─── BOOT ─────────────────────────────────────────────────────────
async function IMMORTAIL_BOOT() {

  document.getElementById("status").innerText = "Booting...";

  // STEP 1 — DB
  await openDB();
  nextBoot(1);

  // STEP 2 — Load + migrate state
  let saved = await loadState();

  if (!saved) {
    saved = defaultState();
  } else {
    saved.version = "7.0.0";
    saved.memory  = saved.memory || [];

    if (!saved.pet)         saved.pet         = { name: "Immortail", mood: "neutral", energy: 100, bond: 0 };
    if (!saved.ai)          saved.ai          = { enabled: true, lastResponse: null };
    if (!saved.identity)    saved.identity    = {
      name: "IMMORTAIL", personality: "adaptive-companion",
      traits: { calm: 0.7, curiosity: 0.8, empathy: 0.9 }, evolutionStage: 1
    };
    if (!saved.memoryGraph) saved.memoryGraph = { nodes: [], edges: [] };
    if (!saved.goals)       saved.goals       = [];
    if (!saved.agentLog)    saved.agentLog    = []; // RUN 7
  }

  nextBoot(2);

  // STEP 3 — Engine init
  dispatch({ type: "INIT_STATE", payload: saved });
  nextBoot(3);

  // STEP 4 — Engine boundary lock
  enforceEngineOnly();
  nextBoot(4);

  // STEP 5 — State immutability lock
  freezeCoreState();
  nextBoot(5);

  // STEP 6 — UI ready
  document.getElementById("status").innerText = "Ready";
  render();
  renderTimeline();
  renderIdentity();
  renderGoals();
  renderAgentLog();
  nextBoot(6);

  console.log("[IMMORTAIL] FULLY BOOTED ✓ (RUN 7 — MULTI-AGENT COGNITION)");

  startIdleTick();
  checkOnboarding();
}

// ─── ONBOARDING ───────────────────────────────────────────────────
function checkOnboarding() {
  const s = getState();
  if (!s || s.user) return;

  const name = prompt("Welcome to IMMORTAIL. What's your name?");
  if (name?.trim()) {
    dispatch({ type: "ONBOARD_USER", payload: name.trim() });
  }
}

// ─── INPUT HANDLER ────────────────────────────────────────────────
function send() {
  const inputEl = document.getElementById("input");
  const input   = inputEl.value.trim();
  if (!input) return;

  dispatch({ type: "USER_MESSAGE", payload: input });
  inputEl.value = "";
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("input").addEventListener("keydown", e => {
    if (e.key === "Enter") send();
  });
});

// ─── GOAL INPUT ───────────────────────────────────────────────────
function addGoalFromUI() {
  const inputEl = document.getElementById("goal-input");
  const text    = inputEl?.value?.trim();
  if (!text) return;

  dispatch({ type: "ADD_GOAL", payload: text });
  inputEl.value = "";
}

document.addEventListener("DOMContentLoaded", () => {
  const goalInput = document.getElementById("goal-input");
  if (goalInput) {
    goalInput.addEventListener("keydown", e => {
      if (e.key === "Enter") addGoalFromUI();
    });
  }
});

// ─── MIGRATION ────────────────────────────────────────────────────
function handleExportKey() {
  const key = exportImmortailKey();
  const out  = document.getElementById("migration-output");
  if (out) {
    out.value = key;
    out.select();
    try { document.execCommand("copy"); } catch (_) {}
    out.value = "✓ Copied to clipboard!";
    setTimeout(() => { out.value = key; }, 2000);
  }
}

function handleImportKey() {
  const input = document.getElementById("migration-input");
  if (!input?.value?.trim()) return;

  dispatch({ type: "IMPORT_KEY", payload: input.value.trim() });
  input.value = "";
  document.getElementById("status").innerText = "State imported ✓";
}

// ─── RENDER — CHAT ────────────────────────────────────────────────
function render() {
  const s = getState();
  if (!s) return;

  const output = document.getElementById("output");
  if (!output) return;

  output.innerHTML = s.memory.map(m => {
    const isSummary = m.type === "summary";
    const isSystem  = m.type === "system";
    const label = m.type === "ai" ? "🐾 Immortail"
                : isSummary      ? "📦 Summary"
                : isSystem       ? "⚙️ System"
                : "You";
    const cls = isSummary ? "msg msg-summary"
              : isSystem  ? "msg msg-system"
              : `msg msg-${m.type || "user"}`;
    return `<div class="${cls}"><span class="msg-label">${label}:</span> ${m.text}</div>`;
  }).join("");

  output.scrollTop = output.scrollHeight;
  renderPet(s.pet);
}

// ─── RENDER — PET ─────────────────────────────────────────────────
function renderPet(pet) {
  const el = document.getElementById("pet-status");
  if (!el || !pet) return;

  const moodEmoji = { happy: "😊", neutral: "😐", sad: "😢" }[pet.mood] || "😐";
  el.innerHTML = `
    <span>${moodEmoji} ${pet.name}</span>
    <span>⚡ ${Math.round(pet.energy)}</span>
    <span>❤️ Bond: ${pet.bond}</span>
  `;
}

// ─── RENDER — MEMORY TIMELINE ─────────────────────────────────────
function renderTimeline() {
  const timeline = document.getElementById("timeline");
  if (!timeline) return;

  const s = getState();
  if (!s) return;

  timeline.innerHTML = s.memory.slice(-50).map(m => `
    <div class="memory-item ${m.type || "user"}">
      <span class="mem-weight">${typeof temporalWeight === "function" ? (temporalWeight(m) * 100).toFixed(0) + "%" : ""}</span>
      <span>${m.text}</span>
    </div>
  `).join("");

  timeline.scrollTop = timeline.scrollHeight;
}

// ─── RENDER — IDENTITY PANEL ──────────────────────────────────────
function renderIdentity() {
  const el = document.getElementById("identity-panel");
  if (!el) return;

  const s = getState();
  if (!s?.identity) return;

  const id    = s.identity;
  const stage = id.evolutionStage.toFixed(2);
  const bar   = Math.round((id.evolutionStage / 10) * 20);
  const fill  = "█".repeat(bar) + "░".repeat(20 - bar);

  el.innerHTML = `
    <div class="identity-row">
      <span>🧬 ${id.name}</span>
      <span>${id.personality}</span>
    </div>
    <div class="identity-row traits">
      <span>calm <b>${id.traits.calm.toFixed(2)}</b></span>
      <span>curiosity <b>${id.traits.curiosity.toFixed(2)}</b></span>
      <span>empathy <b>${id.traits.empathy.toFixed(2)}</b></span>
    </div>
    <div class="identity-row">
      <span>Stage ${stage}/10</span>
      <span class="evo-bar">${fill}</span>
    </div>
    ${s.user ? `<div class="identity-row user-row">👤 ${s.user.displayName}</div>` : ""}
  `;
}

// ─── RENDER — GOALS ───────────────────────────────────────────────
function renderGoals() {
  const el = document.getElementById("goals-panel");
  if (!el) return;

  const s = getState();
  if (!s?.goals || s.goals.length === 0) {
    el.innerHTML = `<div class="goal-empty">No goals yet. Add one below.</div>`;
    return;
  }

  el.innerHTML = s.goals.map(g => {
    const bar  = Math.round(g.progress / 5);
    const fill = "█".repeat(bar) + "░".repeat(20 - bar);
    return `
      <div class="goal-item">
        <div class="goal-text">🎯 ${g.text}</div>
        <div class="goal-bar">
          <span class="goal-progress-bar">${fill}</span>
          <span class="goal-pct">${g.progress}%</span>
        </div>
      </div>
    `;
  }).join("");
}

// ─── RENDER — AGENT LOG (RUN 7) ───────────────────────────────────
function renderAgentLog() {
  const el = document.getElementById("agent-log");
  if (!el) return;

  const s = getState();
  if (!s?.agentLog || s.agentLog.length === 0) {
    el.innerHTML = `<div class="agent-empty">No agent activity yet.</div>`;
    return;
  }

  const agentEmoji = {
    PLANNER:        "🧭",
    CRITIC:         "🧨",
    MEMORY_AUDITOR: "🧠",
    EXECUTOR:       "⚙️"
  };

  el.innerHTML = s.agentLog.slice(-20).reverse().map(entry => {
    const emoji = agentEmoji[entry.agent] || "🤖";
    const time  = new Date(entry.time).toLocaleTimeString();

    let detail = "";

    if (entry.agent === "PLANNER") {
      detail = `intent: <b>${entry.intent}</b> · risk: <b>${entry.riskLevel?.toFixed(2)}</b> · steps: ${entry.steps?.join(" → ")}`;
    } else if (entry.agent === "CRITIC") {
      detail = entry.valid
        ? `<span class="agent-ok">✓ valid</span>`
        : `<span class="agent-fail">✗ ${entry.issues?.join(", ")}</span>`;
    } else if (entry.agent === "MEMORY_AUDITOR") {
      detail = entry.contradictions?.length > 0
        ? `<span class="agent-warn">${entry.contradictions.join(", ")}</span>`
        : `<span class="agent-ok">✓ clean</span>`;
    } else if (entry.agent === "EXECUTOR") {
      detail = `dispatched: ${entry.steps?.join(", ")}`;
    }

    return `
      <div class="agent-entry">
        <span class="agent-label">${emoji} ${entry.agent}</span>
        <span class="agent-time">${time}</span>
        <span class="agent-detail">${detail}</span>
      </div>
    `;
  }).join("");
}

// ─── IDLE TICK ────────────────────────────────────────────────────
function startIdleTick() {
  setInterval(() => {
    const s = getState();
    if (!s?.pet) return;

    if (s.pet.energy < 100) {
      updatePet("IDLE");
      saveState(s);
      renderPet(s.pet);
    }
  }, 10000);
}

IMMORTAIL_BOOT();
