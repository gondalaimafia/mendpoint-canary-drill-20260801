import { readFile } from "node:fs/promises";

const state = JSON.parse(await readFile(new URL("./canary-state.json", import.meta.url), "utf8"));
const packageJson = JSON.parse(await readFile(new URL("./package.json", import.meta.url), "utf8"));
const nodeVersion = (await readFile(new URL("./.node-version", import.meta.url), "utf8")).trim();
const nvmVersion = (await readFile(new URL("./.nvmrc", import.meta.url), "utf8")).trim();
const dockerfile = await readFile(new URL("./Dockerfile", import.meta.url), "utf8");

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

const major = Number(nodeVersion.replace(/^v/, "").split(".")[0]);
if (!Number.isSafeInteger(major) || major < 1) {
  throw new Error("Canary Node runtime declaration is invalid");
}
if (nvmVersion.replace(/^v/, "").split(".")[0] !== String(major)) {
  throw new Error("Canary Node runtime declarations disagree");
}
if (packageJson.engines?.node !== `>=${major} <${major + 1}`) {
  throw new Error("Canary package engine does not match the runtime declaration");
}
if (!new RegExp(`^FROM node:${major}(?:[.\\-@\\s]|$)`, "m").test(dockerfile)) {
  throw new Error("Canary container runtime does not match the runtime declaration");
}

console.log("Canary verification passed");
