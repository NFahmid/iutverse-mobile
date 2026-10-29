// Generates the TypeScript types for the pinned contract with openapi-typescript.
//   node scripts/contract/generate.mjs          write src/services/api/generated/schema.d.ts
//   node scripts/contract/generate.mjs --check  fail when the committed file differs from a fresh generation (CI drift check)
//
// The output depends only on contracts/openapi.yaml, the locked version and the pinned generator version, so it is
// reproducible. Never edit the generated file; regenerate it.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import openapiTS, { astToString } from "openapi-typescript";
import { contractFile, generatedFile, readLock, root } from "./lib.mjs";

const lock = readLock();
const generatorVersion = JSON.parse(fs.readFileSync(path.join(root, "node_modules/openapi-typescript/package.json"), "utf8")).version;

const ast = await openapiTS(pathToFileURL(contractFile), { alphabetize: false });
const banner = [
  "/**",
  " * GENERATED FILE. DO NOT EDIT.",
  ` * Contract: ${lock.contract} ${lock.version}${lock.provisional ? " (provisional pin)" : ""}`,
  ` * Source:   ${lock.source?.commit ? `${lock.source.repository}@${lock.source.commit}` : `${lock.source?.repository ?? "unknown"} (unreleased build)`}`,
  ` * sha256:   ${lock.sha256}`,
  ` * Generator: openapi-typescript ${generatorVersion}`,
  " * Regenerate with `npm run contract:generate`.",
  " */",
  "",
].join("\n");
const output = `${banner}${astToString(ast).replace(/\r\n/g, "\n")}`;

if (process.argv.includes("--check")) {
  const committed = fs.existsSync(generatedFile) ? fs.readFileSync(generatedFile, "utf8").replace(/\r\n/g, "\n") : null;
  if (committed !== output) {
    console.error("src/services/api/generated/schema.d.ts is stale. Run `npm run contract:generate` and commit the result.");
    process.exit(1);
  }
  console.log("generated client types are up to date");
} else {
  fs.mkdirSync(path.dirname(generatedFile), { recursive: true });
  fs.writeFileSync(generatedFile, output);
  console.log(`wrote ${path.relative(process.cwd(), generatedFile)}`);
}
