import { z } from "zod";

/** `{ data: T }`: the envelope every single-resource endpoint returns. */
export function dataEnvelope<T extends z.ZodType>(item: T) {
  return z.object({ data: item });
}

export const paginationMetaSchema = z.object({
  page: z.number().int().min(1),
  pageSize: z.number().int().min(1),
  total: z.number().int().min(0),
  totalPages: z.number().int().min(0),
});

/** `{ data: T[], meta }`: the envelope every list endpoint returns. */
export function paginatedEnvelope<T extends z.ZodType>(item: T) {
  return z.object({ data: z.array(item), meta: paginationMetaSchema });
}

export const tokensSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
});

export type PaginationMeta = z.infer<typeof paginationMetaSchema>;
export type Tokens = z.infer<typeof tokensSchema>;
