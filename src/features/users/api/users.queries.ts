import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";

import { api, dataEnvelope, paginatedEnvelope } from "@/lib/api";

import {
  userSchema,
  type User,
  type UserFormValues,
  type UsersSearch,
} from "../schemas/user.schema";

export const USERS_PAGE_SIZE = 10;

/** Query keys in one place, so invalidation can target exactly the right data. */
export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (search: UsersSearch) => [...userKeys.lists(), search] as const,
  detail: (id: string) => [...userKeys.all, "detail", id] as const,
};

/** `GET /users?page&pageSize&q&role&status` */
export function usersQueryOptions(
  search: UsersSearch,
  pageSize = USERS_PAGE_SIZE,
) {
  return queryOptions({
    queryKey: [...userKeys.list(search), pageSize],
    queryFn: ({ signal }) =>
      api.get("/users", {
        schema: paginatedEnvelope(userSchema),
        query: { ...search, page: search.page ?? 1, pageSize },
        signal,
      }),
  });
}

/** `GET /users/:id` */
export function userQueryOptions(id: string) {
  return queryOptions({
    queryKey: userKeys.detail(id),
    queryFn: async ({ signal }) =>
      (
        await api.get(`/users/${encodeURIComponent(id)}`, {
          schema: dataEnvelope(userSchema),
          signal,
        })
      ).data,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (values: UserFormValues) =>
      (
        await api.post("/users", {
          schema: dataEnvelope(userSchema),
          body: values,
        })
      ).data,
    onSuccess: async (user) => {
      await queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      toast.success(`${user.name} was added.`);
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      values,
    }: {
      id: string;
      values: UserFormValues;
    }) =>
      (
        await api.patch(`/users/${encodeURIComponent(id)}`, {
          schema: dataEnvelope(userSchema),
          body: values,
        })
      ).data,
    onSuccess: async (user) => {
      // Write the fresh record straight into the detail cache, then refresh lists.
      queryClient.setQueryData(userKeys.detail(user.id), user);
      await queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      toast.success("Changes saved.");
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (user: User) =>
      api.delete(`/users/${encodeURIComponent(user.id)}`, {
        schema: z.undefined(),
      }),
    onSuccess: async (_data, user) => {
      // Mark the record stale without refetching: the detail page may still be
      // mounted for a moment, and refetching a deleted user would flash a 404.
      void queryClient.invalidateQueries({
        queryKey: userKeys.detail(user.id),
        refetchType: "none",
      });
      await queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      toast.success(`${user.name} was deleted.`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}
