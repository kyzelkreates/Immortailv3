// ═══════════════════════════════════════════════════════════════════
// IMMORTAIL™ ENGINE — FINAL CLEAN PRODUCTION BUILD
// CONTROL CORE — NO BYPASS
// ═══════════════════════════════════════════════════════════════════

let state;
let queue   = [];
let running = false;

const DOG_DEFAULT = {
  mood:   "neutral",
  energy: 100,
  bond:   0
};

async function dispatch(action) {
  queue.push(action);
  if (!running) run();
}

async function run() {
  running = true;

  while (queue.length > 0) {
    const action = queue.shift();
    await execute(action);
  }

  running = false;
}

async function execute(action) {

  if (action.type === "INIT") {
    state = action.payload;
    return;
  }

  if (action.type === "MESSAGE") {

    state.memory.push({
      role: "user",
      text: action.text,
      time: Date.now()
    });

    updateDog("MESSAGE");

    const reply = await getAIResponse(action.text);

    state.memory.push({
      role: "ai",
      text: reply,
      time: Date.now()
    });

    // Cap memory at 300 entries
    if (state.memory.length > 300) {
      state.memory = state.memory.slice(-300);
    }

    saveState(state);
    render();
  }
}

function updateDog(event) {
  if (event === "MESSAGE") {
    state.dog.bond  += 1;
    state.dog.energy = Math.max(0, state.dog.energy - 1);

    // Mood based on bond milestones
    if (state.dog.bond >= 50) state.dog.mood = "happy";
    else if (state.dog.bond >= 20) state.dog.mood = "friendly";
    else state.dog.mood = "neutral";
  }
}

function getState() {
  return state;
}
