import { z } from "zod";

import { api, dataEnvelope, tokenStore } from "@/lib/api";

import {
  loginResultSchema,
  sessionUserSchema,
  type LoginValues,
  type ProfileValues,
} from "../schemas/auth.schema";

/** `POST /auth/login`: email + password → tokens + user. */
export async function login(values: LoginValues) {
  const { data } = await api.post("/auth/login", {
    schema: dataEnvelope(loginResultSchema),
    body: values,
  });
  tokenStore.setTokens(data);
  return data.user;
}

/** `GET /me`: the current user. */
export async function fetchMe() {
  const { data } = await api.get("/me", {
    schema: dataEnvelope(sessionUserSchema),
  });
  return data;
}

/** `PATCH /me`: update the signed-in user's own profile. */
export async function updateMe(values: ProfileValues) {
  const { data } = await api.patch("/me", {
    schema: dataEnvelope(sessionUserSchema),
    body: values,
  });
  return data;
}

/** `POST /auth/logout`: revoke the refresh token on the server. */
export async function logout(refreshToken: string) {
  await api.post("/auth/logout", {
    schema: z.undefined(),
    body: { refreshToken },
  });
}
