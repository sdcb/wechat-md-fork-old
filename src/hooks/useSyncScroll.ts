import { useRef } from "react";
import type { RefObject } from "react";

export function useSyncScroll(textareaRef: RefObject<HTMLTextAreaElement | null>) {
  const previewRef = useRef<HTMLDivElement>(null);
  const syncingRef = useRef<HTMLElement | null>(null);

  function sync(source: HTMLElement | null, target: HTMLElement | null) {
    if (!source || !target || syncingRef.current === source) return;
    const sourceRange = source.scrollHeight - source.clientHeight;
    const targetRange = target.scrollHeight - target.clientHeight;
    syncingRef.current = target;
    target.scrollTop = (sourceRange > 0 ? source.scrollTop / sourceRange : 0) * Math.max(0, targetRange);
    requestAnimationFrame(() => {
      if (syncingRef.current === target) syncingRef.current = null;
    });
  }

  return {
    previewRef,
    onEditorScroll: () => sync(textareaRef.current, previewRef.current),
    onPreviewScroll: () => sync(previewRef.current, textareaRef.current),
  };
}
