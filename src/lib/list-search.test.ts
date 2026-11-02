import { enumFilter, listSearchSchema, mergeSearch } from "./list-search";

describe("listSearchSchema", () => {
  it("drops invalid values instead of failing the route", () => {
    expect(listSearchSchema.parse({ page: -3, q: 42 })).toEqual({});
    expect(listSearchSchema.parse({ page: 2, q: "jane" })).toEqual({
      page: 2,
      q: "jane",
    });
  });

  it("ignores unknown enum filter values", () => {
    const schema = listSearchSchema.extend({
      role: enumFilter(["admin", "viewer"]),
    });
    expect(schema.parse({ role: "root" })).toEqual({});
  });
});

describe("mergeSearch", () => {
  it("resets to page 1 when a filter changes", () => {
    expect(mergeSearch({ page: 3, q: "a" }, { q: "b" })).toEqual({ q: "b" });
  });

  it("keeps filters when only the page changes", () => {
    expect(mergeSearch({ page: 3, q: "a" }, { page: 4 })).toEqual({
      page: 4,
      q: "a",
    });
  });

  it("drops empty values to keep URLs clean", () => {
    expect(mergeSearch({ q: "a" }, { q: "" })).toEqual({});
  });
});
