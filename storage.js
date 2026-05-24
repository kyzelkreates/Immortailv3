let db;

const DB_NAME = "immortail_db";
const STORE   = "state";

function openDB() {
  return new Promise(resolve => {
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
