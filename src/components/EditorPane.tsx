import type { ClipboardEvent as ReactClipboardEvent, DragEvent as ReactDragEvent, ReactNode, RefObject } from "react";

type EditorPaneProps = {
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  markdown: string;
  dragActive: boolean;
  toolbar: ReactNode;
  onChange: (value: string) => void;
  onPaste: (event: ReactClipboardEvent<HTMLTextAreaElement>) => void;
  onDrop: (event: ReactDragEvent<HTMLTextAreaElement>) => void;
  onDragActiveChange: (active: boolean) => void;
  onScroll: () => void;
};

export function EditorPane({ textareaRef, ...props }: EditorPaneProps) {
  return (
    <section className={`pane editorPane${props.dragActive ? " dragging" : ""}`} aria-label="Markdown 编辑器">
      <div className="paneHeader">
        <span className="paneTitle">Markdown</span>
        <div className="paneTools">{props.toolbar}</div>
      </div>
      <div className="editorBody">
        <textarea
          ref={textareaRef}
          className="markdownInput"
          value={props.markdown}
          placeholder="在这里粘贴或编写 Markdown…"
          spellCheck={false}
          onChange={(event) => props.onChange(event.target.value)}
          onPaste={props.onPaste}
          onScroll={props.onScroll}
          onDragEnter={(event) => {
            if (event.dataTransfer.types.includes("Files")) props.onDragActiveChange(true);
          }}
          onDragOver={(event) => {
            if (event.dataTransfer.types.includes("Files")) event.preventDefault();
          }}
          onDragLeave={() => props.onDragActiveChange(false)}
          onDrop={props.onDrop}
        />
        {props.dragActive && <div className="dropHint">松开以添加图片</div>}
      </div>
    </section>
  );
}
