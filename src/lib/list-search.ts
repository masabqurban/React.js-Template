import { z } from "zod";

/**
 * URL state shared by list screens: `?page=2&q=jane`. Routes extend it with
 * their own filters and pass it to `validateSearch`, so table state lives in
 * the URL and can be shared, bookmarked and restored with the back button.
 * `.catch()` turns a hand-edited, invalid value into the default instead of
 * an error page.
 */
export const listSearchSchema = z.object({
  page: z.number().int().min(1).optional().catch(undefined),
  q: z.string().max(100).optional().catch(undefined),
});

export type ListSearch = z.infer<typeof listSearchSchema>;

/** An optional enum filter that ignores unknown values instead of failing the route. */
export function enumFilter<const T extends readonly [string, ...string[]]>(
  values: T,
) {
  return z.enum(values).optional().catch(undefined);
}

/**
 * Merges a filter change into the current search. Changing anything other
 * than the page goes back to page 1, and empty values are dropped so URLs
 * stay clean.
 */
export function mergeSearch<S extends ListSearch>(
  current: S,
  patch: Partial<S>,
): S {
  const next: S = { ...current, ...patch };
  if (!("page" in patch)) next.page = undefined;
  for (const key of Object.keys(next) as (keyof S)[]) {
    if (next[key] === "" || next[key] === undefined)
      Reflect.deleteProperty(next, key);
  }
  return next;
}
