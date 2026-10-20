import { useEffect, useState } from "react";
import { starterMarkdown } from "../app/starter";

export const draftStorageKey = "wechat-md-draft";
const legacyArticlesKey = "wechat-publisher-articles";
export type SaveState = "saved" | "pending" | "error";

function readLegacyDraft(storage: Storage) {
  try {
    const articles = JSON.parse(storage.getItem(legacyArticlesKey) ?? "null") as unknown;
    if (!Array.isArray(articles)) return null;
    const candidates = articles.filter(
      (item): item is { markdown: string; updatedAt?: string } => typeof item?.markdown === "string" && item.markdown.trim() !== "",
    );
    if (!candidates.length) return null;
    const timeOf = (value?: string) => {
      const time = Date.parse(value ?? "");
      return Number.isNaN(time) ? 0 : time;
    };
    return candidates.reduce((latest, item) => (timeOf(item.updatedAt) > timeOf(latest.updatedAt) ? item : latest)).markdown;
  } catch {
    return null;
  }
}

export function loadDraft(storage: Storage) {
  try {
    const saved = storage.getItem(draftStorageKey);
    if (saved !== null) return saved;
    return readLegacyDraft(storage) ?? starterMarkdown;
  } catch {
    return starterMarkdown;
  }
}

export function useDraft() {
  const [markdown, setMarkdown] = useState(() => loadDraft(window.localStorage));
  const [saveState, setSaveState] = useState<SaveState>("saved");

  useEffect(() => {
    setSaveState("pending");
    const timer = window.setTimeout(() => {
      try {
        window.localStorage.setItem(draftStorageKey, markdown);
        setSaveState("saved");
      } catch {
        setSaveState("error");
      }
    }, 400);
    return () => window.clearTimeout(timer);
  }, [markdown]);

  return { markdown, setMarkdown, saveState };
}
