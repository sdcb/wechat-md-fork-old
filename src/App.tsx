import { useCallback, useMemo, useRef } from "react";
import { EditorPane } from "./components/EditorPane";
import { ImageMenu } from "./components/ImageMenu";
import { PreviewPane } from "./components/PreviewPane";
import { ToastView } from "./components/ToastView";
import { TopBar } from "./components/TopBar";
import { useClipboard } from "./hooks/useClipboard";
import { useDraft } from "./hooks/useDraft";
import { useImageAssets } from "./hooks/useImageAssets";
import { useSyncScroll } from "./hooks/useSyncScroll";
import { useToast } from "./hooks/useToast";
import { getLocalAssetReferences } from "./markdown/assets";
import { buildCopyHtml, buildCopyPlainText, renderMarkdown } from "./markdown/renderMarkdown";
import { defaultTheme } from "./themes/themes";

export default function App() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast, notify, dismiss } = useToast();
  const { markdown, setMarkdown, saveState } = useDraft();

  const insertBlock = useCallback(
    (content: string) => {
      const textarea = textareaRef.current;
      const start = textarea?.selectionStart ?? Number.MAX_SAFE_INTEGER;
      const end = textarea?.selectionEnd ?? start;
      let caret = 0;
      setMarkdown((current) => {
        const safeStart = Math.min(start, current.length);
        const safeEnd = Math.min(Math.max(end, safeStart), current.length);
        const before = safeStart > 0 && current[safeStart - 1] !== "\n" ? "\n\n" : "";
        const after = safeEnd < current.length && current[safeEnd] !== "\n" ? "\n\n" : "";
        caret = safeStart + before.length + content.length;
        return `${current.slice(0, safeStart)}${before}${content}${after}${current.slice(safeEnd)}`;
      });
      requestAnimationFrame(() => {
        if (!textarea) return;
        textarea.focus();
        textarea.selectionStart = textarea.selectionEnd = caret;
      });
    },
    [setMarkdown],
  );

  const images = useImageAssets({ markdown, setMarkdown, insertBlock, notify });
  const bodyHtml = useMemo(() => renderMarkdown(markdown, defaultTheme, images.assetUrls), [markdown, images.assetUrls]);
  const copyHtml = useMemo(() => buildCopyHtml(bodyHtml, defaultTheme), [bodyHtml]);
  const copyPlainText = useMemo(() => buildCopyPlainText(markdown), [markdown]);
  const localImageCount = useMemo(() => getLocalAssetReferences(markdown).length, [markdown]);
  const clipboard = useClipboard({
    markdown,
    setMarkdown,
    copyHtml,
    copyPlainText,
    localImageCount,
    addImageFiles: images.addImageFiles,
    notify,
  });
  const scroll = useSyncScroll(textareaRef);

  return (
    <div className="app">
      <TopBar
        saveState={saveState}
        copyState={clipboard.copyState}
        canCopy={markdown.trim() !== ""}
        onCopy={() => void clipboard.copyForWechat()}
      />
      <main className="workspace">
        <EditorPane
          textareaRef={textareaRef}
          markdown={markdown}
          dragActive={images.dragActive}
          toolbar={
            <ImageMenu
              assets={images.referencedAssets}
              urls={images.assetUrls}
              processing={images.processing}
              onAdd={(files) => void images.addImageFiles(files)}
              onDownload={images.downloadImage}
              onRemove={(asset) => void images.removeImage(asset)}
            />
          }
          onChange={setMarkdown}
          onPaste={clipboard.handleEditorPaste}
          onDrop={images.handleDrop}
          onDragActiveChange={images.setDragActive}
          onScroll={scroll.onEditorScroll}
        />
        <PreviewPane previewRef={scroll.previewRef} bodyHtml={bodyHtml} onScroll={scroll.onPreviewScroll} />
      </main>
      <ToastView toast={toast} onDismiss={dismiss} />
    </div>
  );
}
