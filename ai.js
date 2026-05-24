// ═══════════════════════════════════════════════════════════════════
// IMMORTAIL™ AI — SIMPLE SAFE AI LAYER
// Context-only. Cannot mutate state directly.
// ═══════════════════════════════════════════════════════════════════

let aiBusy = false;

async function getAIResponse(input) {

  if (aiBusy) return "I'm thinking...";

  aiBusy = true;

  try {
    const res = await fetch("/api/ai", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({
        input,
        memory: getState().memory.slice(-10),
        dog:    getState().dog
      })
    });

    const data = await res.json();
    return data.response || "I understand.";

  } catch (e) {
    return "I had trouble responding.";

  } finally {
    aiBusy = false;
  }
}
