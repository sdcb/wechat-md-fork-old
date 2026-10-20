import { useState } from "react";
import type { ClipboardEvent as ReactClipboardEvent, Dispatch, SetStateAction } from "react";
import { findCodeBlockAtPosition } from "../markdown/codeBlock";
import { convertPastedHtml } from "../markdown/pasteConverter";
import { detectPasteContent } from "../markdown/pasteDetector";
import type { Notify } from "./useToast";

type UseClipboardOptions = {
  markdown: string;
  setMarkdown: Dispatch<SetStateAction<string>>;
  copyHtml: string;
  copyPlainText: string;
  localImageCount: number;
  addImageFiles: (files: File[]) => Promise<void>;
  notify: Notify;
};

export type CopyState = "idle" | "copied";

export function useClipboard({
  markdown,
  setMarkdown,
  copyHtml,
  copyPlainText,
  localImageCount,
  addImageFiles,
  notify,
}: UseClipboardOptions) {
  const [copyState, setCopyState] = useState<CopyState>("idle");

  function replaceSelection(textarea: HTMLTextAreaElement, content: string, separateBlocks: boolean) {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const leading = separateBlocks && start > 0 && markdown[start - 1] !== "\n" ? "\n\n" : "";
    const trailing = separateBlocks && end < markdown.length && markdown[end] !== "\n" ? "\n\n" : "";
    const insertion = `${leading}${content}${trailing}`;
    setMarkdown(`${markdown.slice(0, start)}${insertion}${markdown.slice(end)}`);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + insertion.length - trailing.length;
    });
  }

  async function copyForWechat() {
    try {
      if (typeof ClipboardItem !== "undefined" && navigator.clipboard.write) {
        await navigator.clipboard.write([
          new ClipboardItem({
            "text/html": new Blob([copyHtml], { type: "text/html" }),
            "text/plain": new Blob([copyPlainText], { type: "text/plain" }),
          }),
        ]);
      } else {
        await navigator.clipboard.writeText(copyPlainText);
      }
    } catch {
      try {
        await navigator.clipboard.writeText(copyPlainText);
        notify("浏览器不允许写入富文本，已复制为纯文本", "warning");
      } catch {
        notify("复制失败：浏览器拒绝访问剪贴板", "error");
        return;
      }
    }
    setCopyState("copied");
    window.setTimeout(() => setCopyState("idle"), 1800);
    if (localImageCount)
      notify(
        `已复制。其中 ${localImageCount} 张本地图片以 ID 占位，请在公众号里手动上传替换（可在左下角「图片」中下载）。`,
        "warning",
        8000,
      );
    else notify("已复制，去公众号编辑器粘贴即可", "success");
  }

  function handleEditorPaste(event: ReactClipboardEvent<HTMLTextAreaElement>) {
    const textarea = event.currentTarget;
    const plainText = event.clipboardData.getData("text/plain");
    const html = event.clipboardData.getData("text/html");
    const imageFiles = Array.from(event.clipboardData.items)
      .filter((item) => item.kind === "file" && item.type.startsWith("image/"))
      .map((item) => item.getAsFile())
      .filter((file): file is File => Boolean(file));
    if (!plainText.trim() && !html.trim() && imageFiles.length) {
      event.preventDefault();
      void addImageFiles(imageFiles);
      return;
    }

    if (plainText && findCodeBlockAtPosition(markdown, textarea.selectionStart)) {
      event.preventDefault();
      replaceSelection(textarea, plainText.replace(/\r\n?/g, "\n"), false);
      return;
    }

    const detection = detectPasteContent(plainText, html);
    if (detection.type === "markdown" || detection.type === "plain-text") return;

    const converted = convertPastedHtml(html);
    const content = converted.markdown || plainText;
    if (!content) return;
    event.preventDefault();
    replaceSelection(textarea, content, content.includes("\n"));
    const prefix = detection.type === "word" ? "已将 Word 内容转换为 Markdown" : "已将富文本转换为 Markdown";
    notify(`${prefix}${converted.skippedImages ? `，${converted.skippedImages} 张本地图片需重新添加` : ""}`, "info", 3600);
  }

  return { copyState, copyForWechat, handleEditorPaste };
}
