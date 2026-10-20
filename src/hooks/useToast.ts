import { useCallback, useEffect, useRef, useState } from "react";

export type ToastTone = "info" | "success" | "warning" | "error";
export type Toast = { id: number; message: string; tone: ToastTone };
export type Notify = (message: string, tone?: ToastTone, duration?: number) => void;

export function useToast() {
  const timerRef = useRef<number | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  const dismiss = useCallback(() => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = null;
    setToast(null);
  }, []);

  const notify = useCallback<Notify>((message, tone = "info", duration) => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    setToast({ id: Date.now(), message, tone });
    timerRef.current = window.setTimeout(
      () => {
        setToast(null);
        timerRef.current = null;
      },
      duration ?? (tone === "error" || tone === "warning" ? 6000 : 2600),
    );
  }, []);

  useEffect(
    () => () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    },
    [],
  );

  return { toast, notify, dismiss };
}
