let db;

const DB_NAME = "immortail_db";
const STORE   = "state";

function openDB() {
  return new Promise((resolve) => {
    const req = indexedDB.open(DB_NAME, 1);

    req.onupgradeneeded = e => {
      e.target.result.createObjectStore(STORE);
    };

    req.onsuccess = e => {
      db = e.target.result;
      resolve();
    };
  });
}

function saveState(state) {
  if (!db) return;
  const tx = db.transaction(STORE, "readwrite");
  tx.objectStore(STORE).put(state, "root");
}

function loadState() {
  return new Promise(resolve => {
    const tx  = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get("root");
    req.onsuccess = () => resolve(req.result);
  });
}

// RUN 7: agentLog added to default state
function defaultState() {
  return {
    version: "7.0.0",
    memory:  [],
    memoryGraph: { nodes: [], edges: [] },
    goals:    [],
    agentLog: [],
    pet: {
      name:   "Immortail",
      mood:   "neutral",
      energy: 100,
      bond:   0
    },
    ai: {
      enabled:      true,
      lastResponse: null
    },
    identity: {
      name:        "IMMORTAIL",
      personality: "adaptive-companion",
      traits: {
        calm:      0.7,
        curiosity: 0.8,
        empathy:   0.9
      },
      evolutionStage: 1
    },
    user: null
  };
}
