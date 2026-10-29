/**
 * Base URL handling. The URL comes from configuration per environment (`EXPO_PUBLIC_API_BASE_URL`, wired in Phase 2.1);
 * nothing in this repo hardcodes a deployment. Paths in the contract already include `/api`, so the base URL is an origin.
 */
export type AppEnvironment = "development" | "staging" | "production";

export interface BaseUrlOptions {
  /** Only for development builds talking to a local Docker stack over plain HTTP. Never allowed in staging or production. */
  allowInsecureHttp?: boolean;
  environment?: AppEnvironment;
}

export class ApiConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiConfigError";
  }
}

/** Validates and normalizes the API origin: absolute, https (unless explicitly allowed in development), no path, no trailing slash. */
export const normalizeBaseUrl = (value: string | undefined | null, options: BaseUrlOptions = {}): string => {
  if (!value?.trim()) throw new ApiConfigError("API base URL is not configured (EXPO_PUBLIC_API_BASE_URL).");
  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    throw new ApiConfigError(`API base URL must be an absolute URL, got "${value}". A relative URL or "localhost" without a scheme cannot work on a phone.`);
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") throw new ApiConfigError(`API base URL must use https, got ${url.protocol}`);
  if (url.protocol === "http:") {
    const environment = options.environment ?? "development";
    if (!options.allowInsecureHttp || environment !== "development") {
      throw new ApiConfigError("API base URL must use https. Plain http is only allowed for development builds with allowInsecureHttp.");
    }
  }
  if (url.search || url.hash) throw new ApiConfigError("API base URL must not contain a query or fragment.");
  if (url.pathname.replace(/\/+$/, "")) throw new ApiConfigError("API base URL must be an origin (scheme, host, port); contract paths already start with /api.");
  return url.origin;
};

/** Reads the base URL from an environment-like object, for example `process.env` or Expo's public env. */
export const resolveApiBaseUrl = (env: Record<string, string | undefined>, options: Pick<BaseUrlOptions, "allowInsecureHttp"> = {}): string => {
  const environment = (env.EXPO_PUBLIC_APP_ENV ?? "development") as AppEnvironment;
  if (!["development", "staging", "production"].includes(environment)) throw new ApiConfigError(`Unknown EXPO_PUBLIC_APP_ENV "${environment}"`);
  return normalizeBaseUrl(env.EXPO_PUBLIC_API_BASE_URL, { ...options, environment });
};
