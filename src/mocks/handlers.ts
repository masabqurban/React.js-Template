import { delay, http, HttpResponse } from "msw";

import { db, DEMO_CREDENTIALS, nextUserId, type MockUser } from "./db";

/*
 * A small REST API, shaped like a real backend:
 *   POST /auth/login · POST /auth/refresh · POST /auth/logout
 *   GET/PATCH /me · GET /dashboard/summary
 *   GET/POST /users · GET/PATCH/DELETE /users/:id
 *
 * Handlers match any origin (`*\/api/...`), so they work in the browser, in
 * Vitest and against whatever VITE_API_URL is set to.
 */
const api = (path: string) => `*/api${path}`;

/** Simulated network latency, so loading states are visible in development. */
const latency = () => delay(import.meta.env.MODE === "test" ? 0 : 250);

const ACCESS_TTL_MS = 5 * 60_000;

// MOCK TOKENS ONLY. A real API issues signed tokens (e.g. JWTs) and stores refresh tokens server-side.
const issueTokens = (userId: string) => ({
  accessToken: `mock-access.${userId}.${Date.now() + ACCESS_TTL_MS}`,
  refreshToken: `mock-refresh.${userId}`,
});

function userFromAccessToken(request: Request): MockUser | undefined {
  const [kind, userId, expiresAt] =
    request.headers
      .get("Authorization")
      ?.replace(/^Bearer /, "")
      .split(".") ?? [];
  if (kind !== "mock-access" || Number(expiresAt) < Date.now())
    return undefined;
  return db.users.find(
    (user) => user.id === userId && user.status !== "suspended",
  );
}

const error = (
  status: number,
  code: string,
  message: string,
  details?: unknown,
) => HttpResponse.json({ error: { code, message, details } }, { status });

const unauthorized = () =>
  error(401, "UNAUTHORIZED", "Your session has expired.");

type UserInput = Pick<MockUser, "name" | "email" | "role" | "status">;

function emailTaken(email: string, exceptId?: string) {
  return db.users.some(
    (user) =>
      user.email.toLowerCase() === email.toLowerCase() && user.id !== exceptId,
  );
}

export const handlers = [
  // ── Auth ────────────────────────────────────────────────────────────────
  http.post(api("/auth/login"), async ({ request }) => {
    await latency();
    const body = (await request.json()) as {
      email?: string;
      password?: string;
    };
    const user = db.users.find((u) => u.email === body.email?.toLowerCase());
    if (!user || body.password !== DEMO_CREDENTIALS.password) {
      return error(401, "INVALID_CREDENTIALS", "Incorrect email or password.");
    }
    if (user.status !== "active") {
      return error(403, "ACCOUNT_INACTIVE", "This account is not active.");
    }
    return HttpResponse.json({ data: { ...issueTokens(user.id), user } });
  }),

  http.post(api("/auth/refresh"), async ({ request }) => {
    await latency();
    const body = (await request.json()) as { refreshToken?: string };
    const [kind, userId] = body.refreshToken?.split(".") ?? [];
    const user = db.users.find((u) => u.id === userId && u.status === "active");
    if (kind !== "mock-refresh" || !user) return unauthorized();
    return HttpResponse.json({ data: issueTokens(user.id) });
  }),

  http.post(api("/auth/logout"), () => new HttpResponse(null, { status: 204 })),

  http.get(api("/me"), async ({ request }) => {
    await latency();
    const user = userFromAccessToken(request);
    return user ? HttpResponse.json({ data: user }) : unauthorized();
  }),

  http.patch(api("/me"), async ({ request }) => {
    await latency();
    const user = userFromAccessToken(request);
    if (!user) return unauthorized();
    const body = (await request.json()) as Partial<
      Pick<MockUser, "name" | "email">
    >;
    if (body.email && emailTaken(body.email, user.id)) {
      return error(
        409,
        "EMAIL_TAKEN",
        "Another account already uses this email.",
      );
    }
    Object.assign(user, body);
    return HttpResponse.json({ data: user });
  }),

  // ── Dashboard ───────────────────────────────────────────────────────────
  http.get(api("/dashboard/summary"), async ({ request }) => {
    await latency();
    if (!userFromAccessToken(request)) return unauthorized();
    const active = db.users.filter((u) => u.status === "active").length;
    return HttpResponse.json({
      data: {
        stats: [
          {
            key: "users",
            label: "Total users",
            value: db.users.length,
            change: 0.124,
          },
          {
            key: "active",
            label: "Active users",
            value: active,
            change: 0.052,
          },
          {
            key: "revenue",
            label: "Monthly revenue",
            value: 48_250,
            change: 0.087,
            unit: "currency",
          },
          {
            key: "churn",
            label: "Churn rate",
            value: 2.4,
            change: -0.013,
            unit: "percent",
          },
        ],
        signups: [
          { month: "May", count: 42 },
          { month: "Jun", count: 58 },
          { month: "Jul", count: 51 },
          { month: "Aug", count: 73 },
          { month: "Sep", count: 88 },
          { month: "Oct", count: 96 },
        ],
      },
    });
  }),

  // ── Users ───────────────────────────────────────────────────────────────
  http.get(api("/users"), async ({ request }) => {
    await latency();
    if (!userFromAccessToken(request)) return unauthorized();
    const url = new URL(request.url);
    const q = url.searchParams.get("q")?.toLowerCase().trim();
    const role = url.searchParams.get("role");
    const status = url.searchParams.get("status");
    const pageSize = Math.min(
      Number(url.searchParams.get("pageSize") ?? 10),
      100,
    );
    const page = Math.max(Number(url.searchParams.get("page") ?? 1), 1);

    const filtered = db.users
      .filter(
        (u) => !q || u.name.toLowerCase().includes(q) || u.email.includes(q),
      )
      .filter((u) => !role || u.role === role)
      .filter((u) => !status || u.status === status)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    return HttpResponse.json({
      data: filtered.slice((page - 1) * pageSize, page * pageSize),
      meta: {
        page,
        pageSize,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / pageSize),
      },
    });
  }),

  http.get(api("/users/:id"), async ({ request, params }) => {
    await latency();
    if (!userFromAccessToken(request)) return unauthorized();
    const user = db.users.find((u) => u.id === params.id);
    return user
      ? HttpResponse.json({ data: user })
      : error(404, "NOT_FOUND", "User not found.");
  }),

  http.post(api("/users"), async ({ request }) => {
    await latency();
    if (!userFromAccessToken(request)) return unauthorized();
    const body = (await request.json()) as UserInput;
    if (emailTaken(body.email)) {
      return error(
        409,
        "EMAIL_TAKEN",
        "Another account already uses this email.",
        {
          field: "email",
        },
      );
    }
    const user: MockUser = {
      ...body,
      email: body.email.toLowerCase(),
      id: nextUserId(),
      createdAt: new Date().toISOString(),
      lastActiveAt: null,
    };
    db.users.unshift(user);
    return HttpResponse.json({ data: user }, { status: 201 });
  }),

  http.patch(api("/users/:id"), async ({ request, params }) => {
    await latency();
    if (!userFromAccessToken(request)) return unauthorized();
    const user = db.users.find((u) => u.id === params.id);
    if (!user) return error(404, "NOT_FOUND", "User not found.");
    const body = (await request.json()) as Partial<UserInput>;
    if (body.email && emailTaken(body.email, user.id)) {
      return error(
        409,
        "EMAIL_TAKEN",
        "Another account already uses this email.",
        {
          field: "email",
        },
      );
    }
    Object.assign(user, body);
    return HttpResponse.json({ data: user });
  }),

  http.delete(api("/users/:id"), async ({ request, params }) => {
    await latency();
    const actor = userFromAccessToken(request);
    if (!actor) return unauthorized();
    if (actor.id === params.id) {
      return error(
        422,
        "CANNOT_DELETE_SELF",
        "You can't delete your own account.",
      );
    }
    const before = db.users.length;
    db.users = db.users.filter((u) => u.id !== params.id);
    return db.users.length < before
      ? new HttpResponse(null, { status: 204 })
      : error(404, "NOT_FOUND", "User not found.");
  }),
];
