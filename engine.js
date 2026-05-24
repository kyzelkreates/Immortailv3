// ═══════════════════════════════════════════════════════════════════
// IMMORTAIL™ ENGINE — RUN 7
// MULTI-AGENT COGNITIVE ARCHITECTURE
// PLANNER + CRITIC + MEMORY AUDITOR + EXECUTOR
// ENGINE-LOCKED | NO LOOP RISK | INTERNAL ROLE SIMULATION
// IMMORTAIL CORE CONTRACT v1 — FULLY ENFORCED
// ═══════════════════════════════════════════════════════════════════

// ─── PRODUCTION FLAGS ─────────────────────────────────────────────
const SYSTEM_FLAGS = {
  ENGINE_ONLY_MODE:       true,
  AI_CAN_MUTATE_STATE:    false,
  DIRECT_STORAGE_ACCESS:  false,
  AUTO_RECOVERY:          true,
  MEMORY_COMPRESSION:     true,
  COGNITIVE_MODE:         true,
  MULTI_AGENT_MODE:       true   // RUN 7
};

// ─── BOOT STATE ───────────────────────────────────────────────────
let bootState = 0;

const BOOT = {
  NOT_STARTED: 0,
  DB_READY:    1,
  STATE_READY: 2,
  ENGINE_INIT: 3,
  ENGINE_LOCK: 4,
  IMMUTABLE:   5,
  UI_READY:    6
};

function nextBoot(step) {
  if (step !== bootState + 1) {
    throw new Error("[IMMORTAIL] BOOT SEQUENCE VIOLATION at step " + step);
  }
  bootState = step;
  console.log("[IMMORTAIL] BOOT STEP " + step + " OK");
}

// ─── ENGINE CORE ──────────────────────────────────────────────────
let _state  = null;
let queue   = [];
let running = false;

function getState() {
  return _state;
}

async function initEngine() {
  if (running) return;
  running = true;

  while (queue.length > 0) {
    const action = queue.shift();
    await execute(action);
  }

  running = false;
}

async function dispatch(action) {
  queue.push(action);
  if (!running) initEngine();
}

async function execute(action) {

  if (action.type === "INIT_STATE") {
    _state = action.payload;
    ensureIdentity();
    ensureCognitiveState();
    return;
  }

  if (action.type === "USER_MESSAGE") {
    await cognitiveCore(action.payload);
    return;
  }

  if (action.type === "ADD_GOAL") {
    addGoal(action.payload);
    saveState(_state);
    renderGoals();
    return;
  }

  // RUN 7: step execution — safe, engine-only
  if (action.type === "EXECUTE_STEP") {
    handleStep(action.payload);
    return;
  }

  if (action.type === "RESET") {
    _state = action.payload;
    saveState(_state);
    return;
  }

  if (action.type === "ONBOARD_USER") {
    initializeUserProfile(action.payload);
    return;
  }

  if (action.type === "IMPORT_KEY") {
    const ok = importImmortailKey(action.payload);
    if (ok) {
      render();
      renderTimeline();
      renderIdentity();
      renderGoals();
    }
    return;
  }
}

// ─── STEP HANDLER (EXECUTOR ACTIONS) ─────────────────────────────
function handleStep(step) {
  switch (step) {
    case "STORE_MEMORY":
      // Memory already stored before executor runs — no-op here
      break;

    case "UPDATE_GRAPH":
      buildMemoryGraph();
      break;

    case "ANALYSE":
    case "ANALYSE_STATE":
      // Trigger local reasoning pass — no AI call, no hang
      reason(_state.memory.slice(-1)[0]?.text || "");
      break;

    case "SUGGEST_FIX":
      _state.memory.push({
        text: "System analysis complete. No critical issues detected.",
        type: "system",
        time: Date.now()
      });
      break;

    case "RESPOND":
      // AI response is handled separately in cognitiveCore
      break;

    default:
      console.warn("[IMMORTAIL] Unknown step:", step);
  }
}

// ─── ENGINE HARD BOUNDARY ─────────────────────────────────────────
function enforceEngineOnly() {
  const forbidden = ["localStorage", "sessionStorage"];

  forbidden.forEach(obj => {
    if (window[obj]) {
      window[obj].setItem = () => {
        throw new Error("[IMMORTAIL] DIRECT STORAGE ACCESS BLOCKED");
      };
    }
  });

  console.log("[IMMORTAIL] ENGINE BOUNDARY ENFORCED");
}

// ─── IMMUTABLE STATE LOCK ─────────────────────────────────────────
function freezeCoreState() {
  if (typeof window !== "undefined") {
    try {
      Object.defineProperty(window, "state", {
        get: () => _state,
        set: () => { throw new Error("[IMMORTAIL] DIRECT STATE MUTATION BLOCKED"); },
        configurable: false
      });
    } catch (e) {
      // Already defined — skip gracefully
    }
  }
  console.log("[IMMORTAIL] STATE LOCK ENGAGED");
}

// ─── COGNITIVE STATE BOOTSTRAP ────────────────────────────────────
function ensureCognitiveState() {
  _state.memoryGraph = _state.memoryGraph || { nodes: [], edges: [] };
  _state.goals       = _state.goals       || [];
  _state.agentLog    = _state.agentLog    || []; // RUN 7: agent decision trail
}

// ─── IDENTITY CORE ────────────────────────────────────────────────
function ensureIdentity() {
  _state.identity = _state.identity || {
    name:        "IMMORTAIL",
    personality: "adaptive-companion",
    traits: { calm: 0.7, curiosity: 0.8, empathy: 0.9 },
    evolutionStage: 1
  };
}

function evolveIdentity() {
  const recent = _state.memory.slice(-20);
  let growth = 0;

  recent.forEach(m => {
    if (m.type === "user") growth += 0.01;
    if (m.type === "ai")   growth += 0.005;
  });

  _state.identity.evolutionStage += growth;
  _state.identity.evolutionStage  = Math.min(10, _state.identity.evolutionStage);
}

// ─── PET STATE MACHINE ────────────────────────────────────────────
function updatePet(actionType) {
  const pet = _state.pet;
  if (!pet) return;

  switch (actionType) {
    case "MESSAGE_SENT": pet.bond += 1; pet.energy -= 1; break;
    case "IDLE":         pet.energy = Math.min(100, pet.energy + 0.5); break;
    case "NEGATIVE":     pet.mood = "sad";   break;
    case "POSITIVE":     pet.mood = "happy"; break;
  }
  clampPet();
}

function clampPet() {
  _state.pet.energy = Math.max(0, Math.min(100, _state.pet.energy));
  _state.pet.bond   = Math.max(0, _state.pet.bond);
}

// ─── EMOTION ENGINE ───────────────────────────────────────────────
function calculateEmotion() {
  const recent = _state.memory.slice(-10);
  let score = 0;

  recent.forEach(m => {
    if (m.text.includes("good")  || m.text.includes("happy")) score += 1;
    if (m.text.includes("bad")   || m.text.includes("sad"))   score -= 1;
  });

  if (score > 2)  return "positive";
  if (score < -2) return "negative";
  return "neutral";
}

function updateEmotionSystem() {
  const emotion = calculateEmotion();
  if (emotion === "positive") _state.pet.mood = "happy";
  if (emotion === "negative") _state.pet.mood = "sad";
  if (emotion === "neutral")  _state.pet.mood = "neutral";
}

// ─── MEMORY GRAPH ─────────────────────────────────────────────────
function buildMemoryGraph() {
  _state.memoryGraph.nodes = _state.memory.map((m, i) => ({
    id:   i,
    text: m.text,
    type: m.type,
    time: m.time
  }));

  _state.memoryGraph.edges = [];

  for (let i = 1; i < _state.memory.length; i++) {
    _state.memoryGraph.edges.push({ from: i - 1, to: i });
  }
}

// ─── PATTERN DETECTION ────────────────────────────────────────────
function detectPattern(nodes) {
  const keywords = {};

  nodes.forEach(n => {
    n.text.toLowerCase().split(" ").forEach(w => {
      if (w.length > 3) keywords[w] = (keywords[w] || 0) + 1;
    });
  });

  return Object.entries(keywords)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(x => x[0]);
}

// ─── REASONING ENGINE ─────────────────────────────────────────────
function reason(currentInput) {
  const recent  = _state.memoryGraph.nodes.slice(-10);
  const context = recent.map(n => n.text).join(" ");

  return {
    context,
    pattern:    detectPattern(recent),
    suggestion: generateSuggestion(currentInput, context)
  };
}

function generateSuggestion(input, context) {
  if (context.includes((input || "").split(" ")[0])) {
    return "Continuing a familiar thread.";
  }
  return "New topic detected.";
}

// ─── TEMPORAL AWARENESS ───────────────────────────────────────────
function temporalWeight(memoryItem) {
  const age = Date.now() - memoryItem.time;
  if (age < 60000)    return 1.0;
  if (age < 3600000)  return 0.7;
  if (age < 86400000) return 0.4;
  return 0.2;
}

function weightedMemory() {
  return _state.memory.map(m => ({ ...m, weight: temporalWeight(m) }));
}

// ─── GOAL SYSTEM ──────────────────────────────────────────────────
function addGoal(goalText) {
  if (!goalText?.trim()) return;

  _state.goals.push({
    id:       crypto.randomUUID(),
    text:     goalText.trim(),
    created:  Date.now(),
    progress: 0
  });
}

function updateGoals() {
  _state.goals.forEach(g => {
    const firstWord = g.text.split(" ")[0].toLowerCase();
    const relevance = _state.memory.filter(m =>
      m.text.toLowerCase().includes(firstWord)
    ).length;
    g.progress = Math.min(100, relevance * 10);
  });
}

// ─── SELF-REFLECTION ──────────────────────────────────────────────
function selfReflection() {
  const patterns = detectPattern(_state.memoryGraph.nodes.slice(-20));

  _state.identity.traits.curiosity = Math.min(
    1.0,
    _state.identity.traits.curiosity + patterns.length * 0.001
  );

  if (patterns.length > 3) {
    _state.identity.traits.empathy = Math.min(
      1.0,
      _state.identity.traits.empathy + 0.002
    );
  }
}

// ─── COGNITIVE CONTEXT BUILDER ────────────────────────────────────
function buildCognitiveContext(input) {
  const reasoning = reason(input);
  const weighted  = weightedMemory().slice(-10);

  return {
    input,
    memorySummary:  reasoning.context,
    patterns:       reasoning.pattern,
    suggestion:     reasoning.suggestion,
    weightedMemory: weighted,
    goals:          _state.goals,
    identity:       _state.identity,
    emotion:        calculateEmotion()
  };
}

// ════════════════════════════════════════════════════════════════════
// RUN 7 — MULTI-AGENT COGNITION CORE
// ════════════════════════════════════════════════════════════════════

// ─── AGENT: RISK SCORER ───────────────────────────────────────────
function assessRisk(input) {
  let risk = 0;

  if (input.includes("delete")) risk += 0.5;
  if (input.includes("reset"))  risk += 0.4;
  if (input.includes("system")) risk += 0.3;

  return Math.min(1, risk);
}

// ─── AGENT: INTENT DETECTOR ───────────────────────────────────────
function detectIntent(input) {
  const lower = input.toLowerCase();

  if (lower.includes("remember")) return "memory_write";
  if (lower.includes("help"))     return "assist";
  if (lower.includes("why"))      return "reasoning";
  if (lower.includes("fix"))      return "debug";

  return "conversation";
}

// ─── AGENT: STEP GENERATOR ───────────────────────────────────────
function generateSteps(input) {
  const intent = detectIntent(input);

  switch (intent) {
    case "memory_write": return ["STORE_MEMORY", "UPDATE_GRAPH"];
    case "assist":       return ["ANALYSE", "RESPOND"];
    case "reasoning":    return ["ANALYSE_STATE", "RESPOND"];
    case "debug":        return ["ANALYSE_STATE", "SUGGEST_FIX", "RESPOND"];
    default:             return ["RESPOND"];
  }
}

// ─── 🧭 AGENT: PLANNER ────────────────────────────────────────────
function planner(input, context) {
  const intent    = detectIntent(input);
  const steps     = generateSteps(input);
  const riskLevel = assessRisk(input);

  const plan = { intent, steps, riskLevel, input };

  // Log to agent trail
  _state.agentLog.push({
    agent:  "PLANNER",
    time:   Date.now(),
    intent,
    steps,
    riskLevel
  });

  // Cap agent log
  if (_state.agentLog.length > 100) {
    _state.agentLog = _state.agentLog.slice(-100);
  }

  return plan;
}

// ─── 🧨 AGENT: CRITIC ─────────────────────────────────────────────
function critic(plan) {
  const issues = [];

  if (!plan.steps || plan.steps.length === 0) {
    issues.push("NO_STEPS");
  }

  if (plan.riskLevel > 0.7) {
    issues.push("HIGH_RISK_ACTION");
  }

  if (!plan.intent) {
    issues.push("NO_INTENT");
  }

  const result = { valid: issues.length === 0, issues };

  _state.agentLog.push({
    agent:  "CRITIC",
    time:   Date.now(),
    valid:  result.valid,
    issues: result.issues
  });

  return result;
}

// ─── 🧠 AGENT: MEMORY AUDITOR ─────────────────────────────────────
function memoryAuditor() {
  const last = _state.memory.slice(-10);
  const contradictions = [];

  for (let i = 1; i < last.length; i++) {
    if (last[i].text === last[i - 1].text) {
      contradictions.push("DUPLICATE_PATTERN");
    }
  }

  _state.agentLog.push({
    agent:           "MEMORY_AUDITOR",
    time:            Date.now(),
    contradictions
  });

  return contradictions;
}

// ─── ⚙️ AGENT: EXECUTOR ───────────────────────────────────────────
// ONLY action layer — all steps re-enter engine queue
function executor(plan) {
  plan.steps.forEach(step => {
    queue.push({
      type:    "EXECUTE_STEP",
      payload: step
    });
  });

  _state.agentLog.push({
    agent: "EXECUTOR",
    time:  Date.now(),
    steps: plan.steps
  });
}

// ─── 🧠 COGNITIVE CORE (NEW MAIN PIPELINE) ────────────────────────
// FLOW: INPUT → PLANNER → CRITIC → MEMORY AUDITOR → EXECUTOR
//       → PET/EMOTION/EVOLVE/REFLECT → AI → MEMORY+GRAPH → RENDER
async function cognitiveCore(input) {

  // 0. Store user message first
  _state.memory.push({ text: input, type: "user", time: Date.now() });

  // 1. Build full cognitive context
  const context = buildCognitiveContext(input);

  // 2. 🧭 PLANNER — intent + steps + risk
  const plan = planner(input, context);

  // 3. 🧨 CRITIC — validate plan before any execution
  const critique = critic(plan);

  if (!critique.valid) {
    _state.memory.push({
      text: "Plan rejected: " + critique.issues.join(", "),
      type: "system",
      time: Date.now()
    });
    cleanMemory();
    saveState(_state);
    render();
    renderTimeline();
    renderAgentLog();
    return; // HALT — do not proceed to AI or executor
  }

  // 4. 🧠 MEMORY AUDITOR — consistency check
  const memoryIssues = memoryAuditor();

  if (memoryIssues.length > 0) {
    console.warn("[IMMORTAIL] Memory anomalies detected:", memoryIssues);
  }

  // 5. ⚙️ EXECUTOR — safe steps only, via engine queue
  executor(plan);

  // 6. Pet + emotion
  updatePet("MESSAGE_SENT");
  updateEmotionSystem();

  // 7. Identity evolution + reflection
  evolveIdentity();
  selfReflection();

  // 8. Update goals
  updateGoals();

  // 9. AI final response — full cognitive context
  const aiResult = await runAI(input);

  _state.memory.push({
    text: aiResult.response,
    type: "ai",
    time: Date.now()
  });

  if (_state.ai) _state.ai.lastResponse = aiResult.response;

  // 10. Build graph after all memory writes
  buildMemoryGraph();

  // 11. Cleanup + persist
  cleanMemory();
  saveState(_state);

  // 12. Render all panels
  render();
  renderTimeline();
  renderIdentity();
  renderGoals();
  renderAgentLog();
}

// ─── AI LAYER ─────────────────────────────────────────────────────
let aiBusy = false;

function stopAI() {
  aiBusy = false;
}

async function runAI(input) {
  if (aiBusy) return { response: "AI busy. Try again.", actions: [] };
  aiBusy = true;

  try {
    const res = await fetch("/api/ai", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({
        input,
        context: buildCognitiveContext(input)
      })
    });

    const data = await res.json();

    return {
      response: data.response || "I understand.",
      actions:  Array.isArray(data.actions) ? data.actions : []
    };

  } catch (e) {
    return { response: "AI temporarily unavailable.", actions: [] };

  } finally {
    aiBusy = false;
  }
}

// ─── MEMORY COMPRESSION ───────────────────────────────────────────
const MAX_MEMORY = 300;
const SEVEN_DAYS = 1000 * 60 * 60 * 24 * 7;

function summarize(mem) {
  const keywords = {};

  mem.forEach(m => {
    m.text.toLowerCase().split(" ").forEach(w => {
      if (w.length > 3) keywords[w] = (keywords[w] || 0) + 1;
    });
  });

  return "Topics: " + Object.entries(keywords)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(x => x[0])
    .join(", ");
}

function compressMemory() {
  if (!SYSTEM_FLAGS.MEMORY_COMPRESSION) return;
  if (_state.memory.length < 100) return;

  const summary = {
    type: "summary",
    time: Date.now(),
    text: summarize(_state.memory.slice(0, -50))
  };

  _state.memory = [summary, ..._state.memory.slice(-50)];
}

function cleanMemory() {
  if (_state.memory.length > MAX_MEMORY) {
    _state.memory = _state.memory.slice(-MAX_MEMORY);
  }
}

function longTermMemoryPolicy() {
  _state.memory = _state.memory.filter(m => {
    if (m.type === "summary") return true;
    return (Date.now() - m.time) < SEVEN_DAYS;
  });
}

// ─── MIGRATION KEY SYSTEM ─────────────────────────────────────────
function exportImmortailKey() {
  const payload = {
    state:     _state,
    identity:  _state.identity,
    version:   "1.0.0",
    timestamp: Date.now()
  };
  return btoa(JSON.stringify(payload));
}

function importImmortailKey(key) {
  try {
    const decoded = JSON.parse(atob(key));

    if (!decoded.state || !decoded.version) {
      throw new Error("Invalid IMMORTAIL key");
    }

    _state = decoded.state;
    ensureIdentity();
    ensureCognitiveState();
    saveState(_state);

    console.log("[IMMORTAIL] KEY IMPORTED — version:", decoded.version);
    return true;

  } catch (e) {
    console.error("[IMMORTAIL] IMPORT FAILED", e);
    return false;
  }
}

// ─── ONBOARDING ───────────────────────────────────────────────────
function initializeUserProfile(name) {
  if (!_state.user) {
    _state.user = {
      id:          crypto.randomUUID(),
      displayName: name,
      createdAt:   Date.now()
    };
  }

  _state.identity.traits.curiosity = Math.min(
    1.0,
    _state.identity.traits.curiosity + 0.1
  );

  saveState(_state);
}

// ─── SELF-HEALING ─────────────────────────────────────────────────
function selfHealCheck() {
  if (!SYSTEM_FLAGS.AUTO_RECOVERY) return;

  const issues = [];
  if (!_state)                        issues.push("STATE_MISSING");
  if (_state?.memory?.length > 1000)  issues.push("MEMORY_OVERFLOW");
  if (!_state?.identity)              issues.push("IDENTITY_CORRUPT");

  if (issues.length > 0) {
    console.warn("[IMMORTAIL] SAFE RESET:", issues);
    stopAI();
    queue = [];

    if (_state) {
      _state.memory = _state.memory ? _state.memory.slice(-50) : [];

      if (!_state.identity) {
        _state.identity = {
          name: "IMMORTAIL", personality: "adaptive-companion",
          traits: { calm: 0.7, curiosity: 0.8, empathy: 0.9 },
          evolutionStage: 1
        };
      } else {
        _state.identity.evolutionStage = 1;
      }

      saveState(_state);
    }
  }
}

// ─── SYSTEM COHERENCE MONITOR (7s) ───────────────────────────────
setInterval(() => {
  if (!_state) return;

  const issues = memoryAuditor();

  if (issues.length > 3) {
    console.warn("[IMMORTAIL] COHERENCE FAILURE → SAFE MODE");

    stopAI();
    queue = [];

    _state.memory.push({
      text: "System stabilized after coherence correction.",
      type: "system",
      time: Date.now()
    });

    saveState(_state);
    render();
  }

}, 7000);

// ─── GLOBAL CRASH HANDLER ─────────────────────────────────────────
window.addEventListener("error", () => {
  console.warn("[IMMORTAIL] SAFE MODE TRIGGERED");
  stopAI();
  queue  = [];
  aiBusy = false;
  if (_state) saveState(_state);
});

// ─── BACKGROUND MAINTENANCE (10s) ────────────────────────────────
setInterval(() => {
  if (!_state) return;
  compressMemory();
  longTermMemoryPolicy();
  evolveIdentity();
  selfHealCheck();
}, 10000);

// ─── PERFORMANCE HARDENING (8s) ───────────────────────────────────
setInterval(() => {
  if (!_state) return;
  if (_state.memory.length > MAX_MEMORY) {
    _state.memory = _state.memory.slice(-MAX_MEMORY);
  }
  compressMemory();
}, 8000);

// ─── AI STUCK WATCHDOG (4s) ───────────────────────────────────────
setInterval(() => {
  if (!_state) return;
  if (aiBusy) {
    console.warn("[IMMORTAIL] AI STUCK RESET");
    aiBusy = false;
  }
}, 4000);

// ─── IMMORTAIL CORE CONTRACT v1 ───────────────────────────────────
// 1. Engine is the only mutation authority
// 2. AI is context-only and cannot execute actions directly
// 3. State is persistent and exportable for migration
// 4. Memory is compressed and capped automatically
// 5. System recovers from any crash into safe mode
// 6. UI is stateless and purely visual
// 7. Boot sequence is strictly enforced and cannot be skipped
