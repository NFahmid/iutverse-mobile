// Verifies that the pinned contract is intact and consistent with its lock file.
//   node scripts/contract/check.mjs                    warns when the pin is provisional
//   node scripts/contract/check.mjs --require-release  fails when the pin is provisional (use for releases)
// Generated-client drift is checked by `scripts/contract/generate.mjs --check`.
import fs from "node:fs";
import YAML from "yaml";
import { contractFile, lockFile, normalizedContract, readLock, sha256 } from "./lib.mjs";

const problems = [];
if (!fs.existsSync(contractFile) || !fs.existsSync(lockFile)) {
  console.error("contracts/openapi.yaml or contracts/contract-lock.json is missing. Run `npm run contract:sync`.");
  process.exit(1);
}

const lock = readLock();
const text = normalizedContract();
const spec = YAML.parse(text.toString("utf8"));

if (sha256(text) !== lock.sha256) problems.push(`contracts/openapi.yaml does not match the lock (sha256 ${sha256(text)} vs ${lock.sha256}). The pinned contract must not be edited by hand.`);
if (spec.info?.version !== lock.version) problems.push(`lock version ${lock.version} differs from the contract's info.version ${spec.info?.version}`);
if (!String(spec.openapi).startsWith("3.0.")) problems.push(`expected OpenAPI 3.0.x, found ${spec.openapi}`);
if (!spec.paths?.["/api/auth/me"]?.get) problems.push("the pinned contract does not define GET /api/auth/me, which the app needs");
if (!spec.components?.securitySchemes?.bearerAuth) problems.push("the pinned contract has no bearerAuth security scheme");

const ids = new Set();
for (const [route, item] of Object.entries(spec.paths ?? {})) {
  for (const method of ["get", "post", "put", "patch", "delete"]) {
    const op = item[method];
    if (!op) continue;
    if (!op.operationId) problems.push(`${method.toUpperCase()} ${route} has no operationId`);
    else if (ids.has(op.operationId)) problems.push(`duplicate operationId ${op.operationId}`);
    ids.add(op.operationId);
  }
}

if (lock.provisional) {
  const message = `the pinned contract ${lock.version} is PROVISIONAL (built locally, not a published release). Run \`npm run contract:sync -- ${lock.version}\` once the backend publishes it.`;
  if (process.argv.includes("--require-release")) problems.push(message);
  else console.warn(`warning: ${message}`);
}

if (problems.length) {
  console.error(`Contract check failed:\n- ${problems.join("\n- ")}`);
  process.exit(1);
}
console.log(`contract ${lock.version}${lock.provisional ? " (provisional)" : ""}: ${ids.size} operations, lock and file agree`);
