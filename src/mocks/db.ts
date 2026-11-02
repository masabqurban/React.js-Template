/**
 * In-memory database behind the mock API. PLACEHOLDER DATA: every name and
 * email below is generated and fictional. Changes last until the page reloads
 * (or `resetDb()` in tests).
 *
 * These types describe the *backend's* records on purpose: the frontend never
 * imports them. It validates responses with its own Zod schemas, exactly as it
 * would against a real API.
 */
export type MockRole = "admin" | "editor" | "viewer";
export type MockStatus = "active" | "invited" | "suspended";

export type MockUser = {
  id: string;
  name: string;
  email: string;
  role: MockRole;
  status: MockStatus;
  createdAt: string;
  lastActiveAt: string | null;
};

export const DEMO_CREDENTIALS = {
  email: "demo@example.com",
  password: "password123",
};

const firstNames = [
  "Ava",
  "Liam",
  "Mia",
  "Noah",
  "Zoe",
  "Ethan",
  "Ivy",
  "Lucas",
  "Nora",
  "Owen",
  "Ruby",
  "Leo",
  "Isla",
  "Mason",
  "Chloe",
  "Elias",
  "Hazel",
  "Caleb",
  "Lena",
  "Felix",
];
const lastNames = [
  "Turner",
  "Brooks",
  "Hayes",
  "Price",
  "Bennett",
  "Foster",
  "Reed",
  "Coleman",
  "Ward",
  "Hughes",
  "Perry",
  "Long",
  "Barnes",
  "Ross",
  "Hayden",
  "Sutton",
];
const roles: MockRole[] = [
  "viewer",
  "editor",
  "viewer",
  "admin",
  "viewer",
  "editor",
];
const statuses: MockStatus[] = [
  "active",
  "active",
  "active",
  "invited",
  "active",
  "suspended",
];

const BASE_DATE = Date.UTC(2026, 9, 1); // 2026-10-01: fixed, so the seed is deterministic.
const DAY = 86_400_000;

function seedUsers(): MockUser[] {
  const demo: MockUser = {
    id: "usr_0001",
    name: "Demo Admin",
    email: DEMO_CREDENTIALS.email,
    role: "admin",
    status: "active",
    createdAt: new Date(BASE_DATE - 400 * DAY).toISOString(),
    lastActiveAt: new Date(BASE_DATE).toISOString(),
  };

  const generated = Array.from({ length: 47 }, (_, index): MockUser => {
    const i = index + 2;
    const first = firstNames[(index * 7) % firstNames.length] ?? "Alex";
    const last = lastNames[(index * 5) % lastNames.length] ?? "Doe";
    const status = statuses[index % statuses.length] ?? "active";
    return {
      id: `usr_${String(i).padStart(4, "0")}`,
      name: `${first} ${last}`,
      email: `${first}.${last}${i}@example.com`.toLowerCase(),
      role: roles[index % roles.length] ?? "viewer",
      status,
      createdAt: new Date(BASE_DATE - (index * 6 + 3) * DAY).toISOString(),
      lastActiveAt:
        status === "invited"
          ? null
          : new Date(BASE_DATE - (index % 9) * DAY).toISOString(),
    };
  });

  return [demo, ...generated];
}

export const db = { users: seedUsers() };

/** Restores the seed data. Called between tests so they don't affect each other. */
export function resetDb() {
  db.users = seedUsers();
}

let sequence = 1000;
export function nextUserId() {
  sequence += 1;
  return `usr_${sequence}`;
}
