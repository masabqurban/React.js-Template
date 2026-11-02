import { z } from "zod";

import { enumFilter, listSearchSchema } from "@/lib/list-search";

export const userRoles = ["admin", "editor", "viewer"] as const;
export const userStatuses = ["active", "invited", "suspended"] as const;

/** Contract for a user as the API returns it. */
export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
  role: z.enum(userRoles),
  status: z.enum(userStatuses),
  createdAt: z.iso.datetime(),
  lastActiveAt: z.iso.datetime().nullable(),
});

/** Create / edit form. The same schema validates the form and types the request body. */
export const userFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters.")
    .max(100),
  email: z.email("Enter a valid email address.").trim().toLowerCase(),
  role: z.enum(userRoles, "Choose a role."),
  status: z.enum(userStatuses, "Choose a status."),
});

/** `/users?page=2&q=jane&role=admin&status=active`: validated URL state. */
export const usersSearchSchema = listSearchSchema.extend({
  role: enumFilter(userRoles),
  status: enumFilter(userStatuses),
});

export type User = z.infer<typeof userSchema>;
export type UserRole = (typeof userRoles)[number];
export type UserStatus = (typeof userStatuses)[number];
export type UserFormInput = z.input<typeof userFormSchema>;
export type UserFormValues = z.output<typeof userFormSchema>;
export type UsersSearch = z.infer<typeof usersSearchSchema>;
