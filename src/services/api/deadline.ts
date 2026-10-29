import { ApiError, messageFor, type ApiErrorKind } from "./errors";

export interface DeadlineContext {
  method: string;
  /** Path only. Never a query string: signed URLs keep their token there. */
  path: string;
  requestId?: string;
}

/**
 * Runs `run` with a signal that aborts when the caller cancels or the time limit passes, and reports which happened
 * first (the same first-cause-wins rule as the JSON transport). Always clears its timer and listener. Used by the
 * file transfers, which do not go through the JSON client.
 */
export async function withDeadline<T>(
  options: { signal?: AbortSignal; timeoutMs: number } & DeadlineContext,
  run: (signal: AbortSignal) => Promise<T>
): Promise<T> {
  const fail = (kind: ApiErrorKind, cause?: unknown) =>
    new ApiError({ kind, message: messageFor(kind, undefined), method: options.method, path: options.path, requestId: options.requestId, cause });

  const caller = options.signal;
  const controller = new AbortController();
  let cause: "timeout" | "cancelled" | undefined;
  const fromCaller = () => {
    cause ??= (caller?.reason as { name?: string } | undefined)?.name === "TimeoutError" ? "timeout" : "cancelled";
    controller.abort();
  };
  if (caller?.aborted) {
    fromCaller();
    throw fail(cause === "timeout" ? "timeout" : "cancelled");
  }
  caller?.addEventListener("abort", fromCaller, { once: true });
  const timer = setTimeout(() => {
    cause ??= "timeout";
    controller.abort();
  }, options.timeoutMs);

  try {
    return await run(controller.signal);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (cause) throw fail(cause, cause);
    throw fail("network", error);
  } finally {
    clearTimeout(timer);
    caller?.removeEventListener("abort", fromCaller);
  }
}
