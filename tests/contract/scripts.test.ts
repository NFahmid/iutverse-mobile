// Tests of the contract tooling itself (scripts/contract/*): release sync with checksum verification, tamper and drift detection.
// Everything runs against temp directories and a local fake "release" server; the real pin in contracts/ is never modified.
import { execFile } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { json, startServer, type TestServer } from "../helpers/server";

const run = promisify(execFile);
const root = path.resolve(__dirname, "../..");
const script = (name: string) => path.join(root, "scripts/contract", name);
const pinned = fs.readFileSync(path.join(root, "contracts/openapi.yaml"), "utf8");
const sha = (text: string) => crypto.createHash("sha256").update(text).digest("hex");

const exec = async (file: string, args: string[], env: Record<string, string> = {}) => {
  try {
    const { stdout, stderr } = await run(process.execPath, [script(file), ...args], { cwd: root, env: { ...process.env, ...env } });
    return { code: 0, stdout, stderr };
  } catch (error) {
    const e = error as { code: number; stdout: string; stderr: string };
    return { code: e.code, stdout: e.stdout, stderr: e.stderr };
  }
};

const tmp: string[] = [];
const tempDir = () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "contract-test-"));
  tmp.push(dir);
  return dir;
};
afterAll(() => tmp.forEach((dir) => fs.rmSync(dir, { recursive: true, force: true })));

describe("contract:sync from a published release", () => {
  let server: TestServer;
  const SOURCE_COMMIT = "0123456789abcdef0123456789abcdef01234567";
  const publish = (assets: Record<string, string | undefined>) =>
    server.respond((req, res) => {
      const name = decodeURIComponent((req.url ?? "").split("/").pop() ?? "");
      const body = assets[name];
      if (body === undefined) return json(res, 404, { message: "not found" });
      res.writeHead(200, { "content-type": "application/octet-stream" });
      res.end(body);
    });
  const good = () => ({
    "openapi.yaml": pinned,
    "openapi.yaml.sha256": `${sha(pinned)}  openapi.yaml\n`,
    "contract-metadata.json": JSON.stringify({ contract: "iutverse-api", version: "1.0.0", sha256: sha(pinned), sourceCommit: SOURCE_COMMIT }),
  });
  const sync = (dir: string) => exec("sync.mjs", ["1.0.0"], { CONTRACT_DIR: dir, CONTRACT_RELEASE_BASE_URL: server.url });

  beforeAll(async () => {
    server = await startServer();
  });
  afterEach(() => server.seen.splice(0));
  afterAll(() => server.close());

  it("pins a verified release and records where it came from", async () => {
    publish(good());
    const dir = tempDir();
    const result = await sync(dir);
    expect(result.code).toBe(0);
    const lock = JSON.parse(fs.readFileSync(path.join(dir, "contract-lock.json"), "utf8"));
    expect(lock).toMatchObject({ version: "1.0.0", provisional: false, sha256: sha(pinned), source: { tag: "api-contract-v1.0.0", commit: SOURCE_COMMIT } });
    expect(fs.readFileSync(path.join(dir, "openapi.yaml"), "utf8")).toBe(pinned);
    expect((await exec("check.mjs", ["--require-release"], { CONTRACT_DIR: dir })).code).toBe(0);
  });

  it("refuses a download whose checksum does not match, and writes nothing", async () => {
    publish({ ...good(), "openapi.yaml": `${pinned}\n# tampered\n` });
    const dir = tempDir();
    const result = await sync(dir);
    expect(result.code).toBe(1);
    expect(result.stderr).toContain("checksum mismatch");
    expect(fs.readdirSync(dir)).toEqual([]);
  });

  it("refuses metadata that disagrees with the file or the requested version", async () => {
    publish({ ...good(), "contract-metadata.json": JSON.stringify({ version: "1.0.0", sha256: "0".repeat(64), sourceCommit: SOURCE_COMMIT }) });
    expect((await sync(tempDir())).code).toBe(1);
    publish({ ...good(), "contract-metadata.json": JSON.stringify({ version: "2.0.0", sha256: sha(pinned), sourceCommit: SOURCE_COMMIT }) });
    expect((await sync(tempDir())).stderr).toContain("not version 1.0.0");
    publish({ ...good(), "contract-metadata.json": JSON.stringify({ version: "1.0.0", sha256: sha(pinned) }) });
    expect((await sync(tempDir())).stderr).toContain("sourceCommit");
  });

  it("fails clearly when the release does not exist", async () => {
    publish({});
    const result = await sync(tempDir());
    expect(result.code).toBe(1);
    expect(result.stderr).toContain("Is api-contract-v1.0.0 published?");
  });

  it("rejects a malformed version argument", async () => {
    expect((await exec("sync.mjs", ["latest"], { CONTRACT_DIR: tempDir() })).code).toBe(1);
  });
});

describe("contract:check", () => {
  const lockFor = (text: string, extra: object = {}) => ({ contract: "iutverse-api", version: "1.0.0", provisional: false, source: {}, sha256: sha(text), ...extra });
  const setup = (text = pinned, lock: object = lockFor(text)) => {
    const dir = tempDir();
    fs.writeFileSync(path.join(dir, "openapi.yaml"), text);
    fs.writeFileSync(path.join(dir, "contract-lock.json"), JSON.stringify(lock));
    return dir;
  };

  it("passes for an intact pin", async () => {
    expect((await exec("check.mjs", [], { CONTRACT_DIR: setup() })).code).toBe(0);
  });

  it("fails when the pinned contract was edited by hand", async () => {
    const dir = setup();
    fs.appendFileSync(path.join(dir, "openapi.yaml"), "# hand edit\n");
    const result = await exec("check.mjs", [], { CONTRACT_DIR: dir });
    expect(result.code).toBe(1);
    expect(result.stderr).toContain("does not match the lock");
  });

  it("fails when the lock version differs from the contract's version", async () => {
    const result = await exec("check.mjs", [], { CONTRACT_DIR: setup(pinned, lockFor(pinned, { version: "9.9.9" })) });
    expect(result.code).toBe(1);
    expect(result.stderr).toContain("differs from the contract");
  });

  it("fails when GET /api/auth/me is missing from the contract", async () => {
    const without = pinned.replace("/api/auth/me:", "/api/auth/me-renamed:");
    const result = await exec("check.mjs", [], { CONTRACT_DIR: setup(without) });
    expect(result.code).toBe(1);
    expect(result.stderr).toContain("GET /api/auth/me");
  });

  it("warns about a provisional pin, and rejects it for releases", async () => {
    const dir = setup(pinned, lockFor(pinned, { provisional: true }));
    const warn = await exec("check.mjs", [], { CONTRACT_DIR: dir });
    expect(warn.code).toBe(0);
    expect(warn.stderr).toContain("PROVISIONAL");
    const release = await exec("check.mjs", ["--require-release"], { CONTRACT_DIR: dir });
    expect(release.code).toBe(1);
  });

  it("fails when files are missing", async () => {
    expect((await exec("check.mjs", [], { CONTRACT_DIR: tempDir() })).code).toBe(1);
  });
});

describe("generated client drift detection", () => {
  const committed = path.join(root, "src/services/api/generated/schema.d.ts");

  it("regenerates the committed file byte for byte (deterministic)", async () => {
    const out = path.join(tempDir(), "schema.d.ts");
    const result = await exec("generate.mjs", [], { GENERATED_FILE: out });
    expect(result.code).toBe(0);
    expect(fs.readFileSync(out, "utf8").replace(/\r\n/g, "\n")).toBe(fs.readFileSync(committed, "utf8").replace(/\r\n/g, "\n"));
  });

  it("--check passes on a fresh file and fails on a stale or hand-edited one", async () => {
    const out = path.join(tempDir(), "schema.d.ts");
    await exec("generate.mjs", [], { GENERATED_FILE: out });
    expect((await exec("generate.mjs", ["--check"], { GENERATED_FILE: out })).code).toBe(0);
    fs.appendFileSync(out, "\nexport type Edited = true;\n");
    const stale = await exec("generate.mjs", ["--check"], { GENERATED_FILE: out });
    expect(stale.code).toBe(1);
    expect(stale.stderr).toContain("stale");
    fs.rmSync(out);
    expect((await exec("generate.mjs", ["--check"], { GENERATED_FILE: out })).code).toBe(1);
  });
});
