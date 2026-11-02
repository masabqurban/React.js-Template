import type { z } from "zod";

import { ApiError } from "./api-error";

type QueryValue = string | number | boolean | null | undefined;
type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type RequestOptions<TSchema extends z.ZodType> = {
  /**
   * Every response is validated, so a backend contract change fails loudly
   * here instead of deep inside the UI as `undefined is not a function`.
   */
  schema: TSchema;
  query?: Record<string, QueryValue>;
  body?: unknown;
  signal?: AbortSignal;
  timeoutMs?: number;
};

export type HttpClientConfig = {
  baseUrl: string | undefined;
  /** Resolved per request, e.g. to attach the access token. */
  getHeaders?: () => Record<string, string>;
  /**
   * Called once when a request returns 401. Return true to retry with fresh
   * headers (e.g. after refreshing the access token).
   */
  onUnauthorized?: () => Promise<boolean>;
  defaultTimeoutMs?: number;
};

const DEFAULT_TIMEOUT_MS = 15_000;

export function buildUrl(
  baseUrl: string,
  path: string,
  query?: Record<string, QueryValue>,
) {
  const url = new URL(
    path.replace(/^\//, ""),
    baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`,
  );
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }
  return url;
}

async function readBody(response: Response): Promise<unknown> {
  if (response.status === 204) return undefined;
  const text = await response.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

/** Accepts `{ message, code }` and `{ error: { message, code, details } }` error bodies. */
function toApiError(response: Response, body: unknown): ApiError {
  const envelope = (
    typeof body === "object" && body !== null && "error" in body
      ? body.error
      : body
  ) as { message?: unknown; code?: unknown; details?: unknown } | undefined;

  return new ApiError(
    typeof envelope?.message === "string"
      ? envelope.message
      : response.statusText || "Request failed",
    response.status,
    typeof envelope?.code === "string"
      ? envelope.code
      : `HTTP_${response.status}`,
    envelope?.details,
  );
}

/** A small, typed fetch wrapper: timeouts, error normalisation and response validation. */
export function createHttpClient(config: HttpClientConfig) {
  async function request<TSchema extends z.ZodType>(
    method: HttpMethod,
    path: string,
    options: RequestOptions<TSchema>,
    retried = false,
  ): Promise<z.infer<TSchema>> {
    if (!config.baseUrl) {
      throw new ApiError("API base URL is not configured", 0, "NOT_CONFIGURED");
    }

    const timeoutMs =
      options.timeoutMs ?? config.defaultTimeoutMs ?? DEFAULT_TIMEOUT_MS;
    const signal = options.signal
      ? AbortSignal.any([options.signal, AbortSignal.timeout(timeoutMs)])
      : AbortSignal.timeout(timeoutMs);

    const headers = new Headers({
      Accept: "application/json",
      ...config.getHeaders?.(),
    });
    let body: BodyInit | undefined;
    if (options.body !== undefined) {
      headers.set("Content-Type", "application/json");
      body = JSON.stringify(options.body);
    }

    let response: Response;
    try {
      response = await fetch(buildUrl(config.baseUrl, path, options.query), {
        method,
        headers,
        body,
        signal,
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === "TimeoutError") {
        throw new ApiError(
          `Request timed out after ${timeoutMs}ms`,
          0,
          "TIMEOUT",
        );
      }
      // Caller-initiated aborts (TanStack Query cancelling a stale request) propagate untouched.
      if (error instanceof DOMException && error.name === "AbortError")
        throw error;
      throw new ApiError("Network request failed", 0, "NETWORK_ERROR", error);
    }

    const data = await readBody(response);

    if (!response.ok) {
      if (response.status === 401 && config.onUnauthorized && !retried) {
        if (await config.onUnauthorized())
          return request(method, path, options, true);
      }
      throw toApiError(response, data);
    }

    const result = options.schema.safeParse(data);
    if (!result.success) {
      throw new ApiError(
        `Unexpected response shape from ${method} ${path}`,
        response.status,
        "INVALID_RESPONSE",
        result.error.issues,
      );
    }
    return result.data;
  }

  return {
    get: <T extends z.ZodType>(path: string, options: RequestOptions<T>) =>
      request("GET", path, options),
    post: <T extends z.ZodType>(path: string, options: RequestOptions<T>) =>
      request("POST", path, options),
    put: <T extends z.ZodType>(path: string, options: RequestOptions<T>) =>
      request("PUT", path, options),
    patch: <T extends z.ZodType>(path: string, options: RequestOptions<T>) =>
      request("PATCH", path, options),
    delete: <T extends z.ZodType>(path: string, options: RequestOptions<T>) =>
      request("DELETE", path, options),
  };
}

export type HttpClient = ReturnType<typeof createHttpClient>;
