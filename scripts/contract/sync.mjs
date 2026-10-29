// Pins the backend API contract that this app builds against.
//
//   npm run contract:sync -- 1.0.0
//       Downloads api-contract-v1.0.0 from the backend's GitHub Releases (openapi.yaml, openapi.yaml.sha256,
//       contract-metadata.json), verifies the checksum and the metadata, then writes contracts/openapi.yaml and
//       contracts/contract-lock.json.
//
//   npm run contract:sync -- --from-file ../IUTverse/docs/api/openapi.yaml
//       Provisional pin from a local build of the backend, for use before the version is released. The lock is
//       marked "provisional": true and `contract:check -- --require-release` rejects it.
//
// Then run `npm run contract:generate` and commit contracts/ and src/services/api/generated/.
import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";
import { contractFile, DEFAULT_REPOSITORY, lockFile, normalizedContract, releaseBaseUrl, sha256 } from "./lib.mjs";

const args = process.argv.slice(2);
const repository = process.env.CONTRACT_REPO || DEFAULT_REPOSITORY;
// Failures throw and are reported once at the bottom. Calling process.exit() while other downloads are in flight
// aborts the process abnormally on Windows, so the exit code is set instead.
class SyncError extends Error {}
const fail = (message) => {
  throw new SyncError(message);
};

const writeLock = (lock) => {
  fs.mkdirSync(path.dirname(lockFile), { recursive: true });
  fs.writeFileSync(lockFile, `${JSON.stringify(lock, null, 2)}\n`);
};

const main = async () => {
  if (args[0] === "--from-file") {
    const source = args[1];
    if (!source || !fs.existsSync(source)) fail("--from-file needs the path of a built openapi.yaml");
    const text = normalizedContract(source);
    const version = YAML.parse(text.toString("utf8")).info.version;
    fs.mkdirSync(path.dirname(contractFile), { recursive: true });
    fs.writeFileSync(contractFile, text);
    writeLock({
      contract: "iutverse-api",
      version,
      provisional: true,
      source: { repository, tag: `api-contract-v${version}`, commit: null, asset: null },
      sha256: sha256(text),
      note: "Pinned from an unreleased local build of the backend. Replace with `npm run contract:sync -- <version>` once the backend publishes this version; the sha256 should match.",
    });
    console.log(`pinned ${version} (provisional) sha256 ${sha256(text)}`);
  } else {
    const version = args[0];
    if (!/^\d+\.\d+\.\d+$/.test(version ?? "")) fail("usage: contract:sync <MAJOR.MINOR.PATCH> | --from-file <openapi.yaml>");
    const tag = `api-contract-v${version}`;
    const base = `${releaseBaseUrl ?? `https://github.com/${repository}/releases/download`}/${tag}`;
    const download = async (name) => {
      const response = await fetch(`${base}/${name}`, { redirect: "follow" });
      if (!response.ok) fail(`${base}/${name} answered ${response.status}. Is ${tag} published?`);
      return Buffer.from(await response.arrayBuffer());
    };

    const [specBytes, sumText, metadataText] = await Promise.all([download("openapi.yaml"), download("openapi.yaml.sha256"), download("contract-metadata.json")]);
    const text = Buffer.from(specBytes.toString("utf8").replace(/\r\n/g, "\n"));
    const digest = sha256(text);
    const published = sumText.toString("utf8").trim().split(/\s+/)[0];
    const metadata = JSON.parse(metadataText.toString("utf8"));
    if (digest !== published) fail(`checksum mismatch: downloaded ${digest}, published ${published}`);
    if (metadata.sha256 !== digest) fail("contract-metadata.json does not match the downloaded file");
    if (metadata.version !== version || YAML.parse(text.toString("utf8")).info.version !== version) fail(`the asset is not version ${version}`);
    if (!/^[0-9a-f]{40}$/.test(metadata.sourceCommit ?? "")) fail("contract-metadata.json has no valid sourceCommit");

    fs.mkdirSync(path.dirname(contractFile), { recursive: true });
    fs.writeFileSync(contractFile, text);
    writeLock({
      contract: "iutverse-api",
      version,
      provisional: false,
      source: { repository, tag, commit: metadata.sourceCommit, asset: `${base}/openapi.yaml` },
      sha256: digest,
    });
    console.log(`pinned ${version} from ${tag} (commit ${metadata.sourceCommit.slice(0, 7)}), sha256 ${digest}`);
  }
  console.log("Next: npm run contract:generate");
};

try {
  await main();
} catch (error) {
  if (!(error instanceof SyncError)) throw error;
  console.error(`contract:sync failed: ${error.message}`);
  process.exitCode = 1;
}
