// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from "vitest";
import { starterMarkdown } from "../app/starter";
import { draftStorageKey, loadDraft } from "./useDraft";

describe("loadDraft", () => {
  beforeEach(() => window.localStorage.clear());

  it("returns the saved draft, even when empty", () => {
    window.localStorage.setItem(draftStorageKey, "");
    expect(loadDraft(window.localStorage)).toBe("");
  });

  it("migrates the most recently updated article from the legacy library", () => {
    window.localStorage.setItem(
      "wechat-publisher-articles",
      JSON.stringify([
        { id: "a", markdown: "# 旧", updatedAt: "2026-01-01T00:00:00Z" },
        { id: "b", markdown: "# 新", updatedAt: "2026-05-01T00:00:00Z" },
        { id: "c", markdown: "# 无日期", updatedAt: "刚刚" },
      ]),
    );
    expect(loadDraft(window.localStorage)).toBe("# 新");
  });

  it("falls back to the starter article for missing or corrupt data", () => {
    expect(loadDraft(window.localStorage)).toBe(starterMarkdown);
    window.localStorage.setItem("wechat-publisher-articles", "{oops");
    expect(loadDraft(window.localStorage)).toBe(starterMarkdown);
  });
});
