import type { Toast } from "../hooks/useToast";

export function ToastView({ toast, onDismiss }: { toast: Toast | null; onDismiss: () => void }) {
  if (!toast) return null;
  return (
    <div key={toast.id} className={`toast ${toast.tone}`} role={toast.tone === "error" ? "alert" : "status"}>
      <span>{toast.message}</span>
      <button type="button" aria-label="关闭提示" onClick={onDismiss}>
        ×
      </button>
    </div>
  );
}
