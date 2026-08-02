import { readFile } from "node:fs/promises";

const state = JSON.parse(await readFile(new URL("./canary-state.json", import.meta.url), "utf8"));

const expected = {
  schemaVersion: 1,
  service: "mendpoint-canary",
  generation: 1,
  status: "healthy",
  recoveryMarker: "baseline-2026-08-01",
};

for (const [key, value] of Object.entries(expected)) {
  if (state[key] !== value) {
    throw new Error(`Canary verification failed for ${key}`);
  }
}

console.log("Canary verification passed");
