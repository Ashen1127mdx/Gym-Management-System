import { useGym } from "../services/GymContext";
export const ToastContainer = () => {
  const { toasts, removeToast } = useGym();
  if (toasts.length === 0) return null;
  return <div className="fixed bottom-20 md:bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => <div
    key={toast.id}
    className={`pointer-events-auto p-4 rounded-2xl shadow-xl border flex items-start gap-3 animate-fade-in ${toast.type === "success" ? "bg-surface-container-lowest border-secondary-container/40 text-on-surface" : toast.type === "error" ? "bg-error-container border-error/30 text-on-error-container" : "bg-surface-container-high border-outline-variant/40 text-on-surface"}`}
  >
          <span
    className={`material-symbols-outlined text-xl shrink-0 mt-0.5 ${toast.type === "success" ? "text-secondary" : toast.type === "error" ? "text-error" : "text-on-surface-variant"}`}
  >
            {toast.type === "success" ? "check_circle" : toast.type === "error" ? "error" : "info"}
          </span>
          <div className="flex-1 min-w-0">
            <h4 className="font-headline-md text-xs font-bold leading-snug">
              {toast.title}
            </h4>
            {toast.description && <p className="text-[11px] text-on-surface-variant mt-0.5">
                {toast.description}
              </p>}
          </div>
          <button
    onClick={() => removeToast(toast.id)}
    className="text-outline hover:text-on-surface text-sm"
  >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>)}
    </div>;
};
