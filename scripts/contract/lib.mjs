// Shared helpers for the contract scripts.
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
// The overrides exist for the tests of these scripts; normal use never sets them.
const contractDir = process.env.CONTRACT_DIR ? path.resolve(process.env.CONTRACT_DIR) : path.join(root, "contracts");
export const contractFile = path.join(contractDir, "openapi.yaml");
export const lockFile = path.join(contractDir, "contract-lock.json");
export const generatedFile = process.env.GENERATED_FILE ? path.resolve(process.env.GENERATED_FILE) : path.join(root, "src/services/api/generated/schema.d.ts");
export const releaseBaseUrl = process.env.CONTRACT_RELEASE_BASE_URL;
export const DEFAULT_REPOSITORY = "A-Piyas-04/IUTverse";

export const sha256 = (buffer) => crypto.createHash("sha256").update(buffer).digest("hex");
export const readLock = () => JSON.parse(fs.readFileSync(lockFile, "utf8"));
/** The contract is hashed with LF line endings so Windows and Linux checkouts agree. */
export const normalizedContract = (file = contractFile) => Buffer.from(fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n"));
