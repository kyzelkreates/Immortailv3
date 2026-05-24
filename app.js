// ═══════════════════════════════════════════════════════════════════
// IMMORTAIL™ APP — UI + BOOT SEQUENCE
// UI LAYER ONLY — NO DIRECT STATE MUTATION
// ═══════════════════════════════════════════════════════════════════

async function boot() {

  await openDB();

  let saved = await loadState();

  if (!saved) {
    saved = {
      dog:    { mood: "neutral", energy: 100, bond: 0 },
      memory: []
    };
  }

  await dispatch({ type: "INIT", payload: saved });

  render();
}

function sendMessage() {
  const inputEl = document.getElementById("input");
  const text    = inputEl.value.trim();
  if (!text) return;

  dispatch({ type: "MESSAGE", text });
  inputEl.value = "";
}

// Enter key support
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("input").addEventListener("keydown", e => {
    if (e.key === "Enter") sendMessage();
  });
});

function render() {
  const s = getState();
  if (!s) return;

  const chat = document.getElementById("chat");
  chat.innerHTML = s.memory.map(m =>
    `<div class="${m.role} message">${m.text}</div>`
  ).join("");
  chat.scrollTop = chat.scrollHeight;

  document.getElementById("dogMood").innerText =
    "Mood: " + s.dog.mood;

  document.getElementById("dogStats").innerText =
    `Energy: ${s.dog.energy} | Bond: ${s.dog.bond}`;
}

boot();
