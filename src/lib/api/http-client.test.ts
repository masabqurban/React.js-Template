import { http, HttpResponse } from "msw";
import { z } from "zod";

import { server } from "@/mocks/node";

import { isApiError } from "./api-error";
import { buildUrl, createHttpClient } from "./http-client";

const BASE = "http://test.local/api";
const client = createHttpClient({ baseUrl: BASE });
const itemSchema = z.object({ id: z.number() });

describe("buildUrl", () => {
  it("joins paths and skips empty query values", () => {
    expect(
      buildUrl(BASE, "/users", { page: 2, q: "", role: undefined }).toString(),
    ).toBe("http://test.local/api/users?page=2");
  });
});

describe("createHttpClient", () => {
  it("returns validated data", async () => {
    server.use(http.get(`${BASE}/item`, () => HttpResponse.json({ id: 1 })));
    await expect(client.get("/item", { schema: itemSchema })).resolves.toEqual({
      id: 1,
    });
  });

  it("rejects a response that breaks the contract", async () => {
    server.use(http.get(`${BASE}/item`, () => HttpResponse.json({ id: "1" })));
    const error: unknown = await client
      .get("/item", { schema: itemSchema })
      .catch((e: unknown) => e);
    expect(isApiError(error) && error.code).toBe("INVALID_RESPONSE");
  });

  it("normalises error envelopes into ApiError", async () => {
    server.use(
      http.get(`${BASE}/item`, () =>
        HttpResponse.json(
          { error: { code: "NOT_FOUND", message: "Gone" } },
          { status: 404 },
        ),
      ),
    );
    const error: unknown = await client
      .get("/item", { schema: itemSchema })
      .catch((e: unknown) => e);
    expect(error).toMatchObject({
      status: 404,
      code: "NOT_FOUND",
      message: "Gone",
    });
    expect(isApiError(error) && error.isNotFound).toBe(true);
  });

  it("retries once after a successful token refresh", async () => {
    let token = "expired";
    const onUnauthorized = vi.fn(() => {
      token = "fresh";
      return Promise.resolve(true);
    });
    const authed = createHttpClient({
      baseUrl: BASE,
      getHeaders: () => ({ Authorization: `Bearer ${token}` }),
      onUnauthorized,
    });
    server.use(
      http.get(`${BASE}/item`, ({ request }) =>
        request.headers.get("Authorization") === "Bearer fresh"
          ? HttpResponse.json({ id: 7 })
          : new HttpResponse(null, { status: 401 }),
      ),
    );

    await expect(authed.get("/item", { schema: itemSchema })).resolves.toEqual({
      id: 7,
    });
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });

  it("fails fast when no base URL is configured", async () => {
    const unconfigured = createHttpClient({ baseUrl: undefined });
    await expect(
      unconfigured.get("/item", { schema: itemSchema }),
    ).rejects.toMatchObject({
      code: "NOT_CONFIGURED",
    });
  });
});
