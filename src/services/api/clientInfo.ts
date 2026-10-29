import { ApiConfigError } from "./config";

/**
 * Optional diagnostic headers the backend logs (`X-Client-Platform`, `X-Client-Version`). They are for observability
 * only: the server never uses them for authorization, and a value outside the documented format is ignored by it.
 * Validating here turns a typo in app configuration into an immediate error instead of silently missing telemetry.
 */
export type ClientPlatform = "web" | "android" | "ios";

export interface ClientInfo {
  platform: ClientPlatform;
  /** `MAJOR.MINOR.PATCH`, the app version (for example expo-constants `expoConfig.version`). */
  version: string;
  /** Store build number (Android versionCode, iOS CFBundleVersion). Sent as `+BUILD`. */
  build?: number | string;
}

export const CLIENT_PLATFORM_HEADER = "X-Client-Platform";
export const CLIENT_VERSION_HEADER = "X-Client-Version";

const VERSION = /^\d{1,4}\.\d{1,4}\.\d{1,4}$/;
const BUILD = /^\d{1,9}$/;

/** Returns the two header values, throwing ApiConfigError for a value the backend would not accept. */
export const clientInfoHeaders = (info: ClientInfo): Record<string, string> => {
  if (!["web", "android", "ios"].includes(info.platform)) throw new ApiConfigError(`clientInfo.platform must be web, android or ios, got "${String(info.platform)}"`);
  if (!VERSION.test(info.version)) throw new ApiConfigError(`clientInfo.version must look like 1.4.0, got "${info.version}"`);
  const build = info.build === undefined ? "" : String(info.build);
  if (build && !BUILD.test(build)) throw new ApiConfigError(`clientInfo.build must be 1 to 9 digits, got "${build}"`);
  return { [CLIENT_PLATFORM_HEADER]: info.platform, [CLIENT_VERSION_HEADER]: build ? `${info.version}+${build}` : info.version };
};
