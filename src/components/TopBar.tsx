import type { SaveState } from "../hooks/useDraft";
import type { CopyState } from "../hooks/useClipboard";
import { BrandMark, CheckIcon, CopyIcon } from "./icons";

type TopBarProps = {
  saveState: SaveState;
  copyState: CopyState;
  canCopy: boolean;
  onCopy: () => void;
};

const saveLabels: Record<SaveState, string> = {
  saved: "已自动保存",
  pending: "保存中…",
  error: "无法保存到浏览器",
};

export function TopBar({ saveState, copyState, canCopy, onCopy }: TopBarProps) {
  const copied = copyState === "copied";
  return (
    <header className="topBar">
      <div className="brand">
        <BrandMark />
        <span className="brandName">
          WeChat <strong>MD</strong>
        </span>
      </div>
      <div className="topBarActions">
        <span className={`saveState ${saveState}`} role="status">
          {saveLabels[saveState]}
        </span>
        <button className={`primaryButton${copied ? " done" : ""}`} type="button" disabled={!canCopy} onClick={onCopy}>
          {copied ? <CheckIcon /> : <CopyIcon />}
          {copied ? "已复制" : "复制到微信"}
        </button>
      </div>
    </header>
  );
}
