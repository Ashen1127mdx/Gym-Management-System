import { useState, useEffect, useCallback } from "react";
import { useGym } from "../services/GymContext";

/* ─── Shared Components ─────────────────────────────────────────────────── */
const Card = ({ children, className = "" }) => (
  <div className={`bg-surface-container-lowest rounded-3xl border border-outline-variant/30 card-shadow ${className}`}>
    {children}
  </div>
);

const SectionHeader = ({ icon, title, count }) => (
  <div className="flex items-center gap-2 mb-6">
    <span className="material-symbols-outlined text-secondary text-xl">{icon}</span>
    <h2 className="font-headline-md text-base font-bold text-on-surface">{title}</h2>
    {count > 0 && (
      <span className="ml-2 text-[10px] bg-secondary text-on-secondary px-2.5 py-0.5 rounded-full font-bold">
        {count}
      </span>
    )}
  </div>
);

const Spinner = () => (
  <div className="flex justify-center items-center py-20">
    <div className="w-8 h-8 rounded-full border-4 border-secondary/30 border-t-secondary animate-spin" />
  </div>
);

const StatusBadge = ({ status }) => {
  const styles = {
    Pending:  "bg-amber-50 text-amber-700 border-amber-200",
    Approved: "bg-green-50 text-green-700 border-green-200",
    Rejected: "bg-red-50 text-red-700 border-red-200",
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${styles[status] || styles.Pending}`}>
      {status}
    </span>
  );
};

export const MembershipRequestsView = ({ embedded = false }) => {
  const { apiFetch, addToast, refreshCounter, setRefreshCounter } = useGym();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null); // id of request currently being approved/rejected

  const loadRequests = useCallback(async () => {
    setLoading(true);
    const data = await apiFetch("/api/membership_requests.php");
    if (Array.isArray(data)) {
      setRequests(data);
    }
    setLoading(false);
  }, [apiFetch]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleAction = async (id, action) => {
    setProcessing(id);
    const res = await apiFetch(`/api/membership_requests.php?action=${action}`, {
      method: "POST",
      body: JSON.stringify({ request_id: id })
    });
    if (res?.success) {
      addToast(
        action === "approve" ? "Request Approved" : "Request Rejected",
        action === "approve" ? "The member's tier has been upgraded." : "The request was rejected.",
        action === "approve" ? "success" : "info"
      );
      await loadRequests();
      // Trigger dashboard refresh by updating refreshCounter
      // Increment refresh counter, persist to localStorage and broadcast to other tabs
    const refreshChannel = new BroadcastChannel('gym-refresh');
    setRefreshCounter(prev => {
      const next = prev + 1;
      localStorage.setItem('gymRefreshCounter', next);
      refreshChannel.postMessage({ counter: next });
      return next;
    });
    } else {
      addToast("Action Failed", res?.message || "Failed to process request.", "error");
    }
    setProcessing(null);
  };

  const pending = requests.filter(r => r.status === "Pending");
  const processed = requests.filter(r => r.status !== "Pending");

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      
      {/* ── Page Header ─────────────────────────────────────────────────── */}
      {!embedded && (
      <div className="bg-tertiary-container rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 bottom-0 w-2/5 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-secondary/30 via-transparent to-transparent pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "repeating-linear-gradient(45deg,currentColor 0,currentColor 1px,transparent 0,transparent 50%)", backgroundSize: "12px 12px" }} />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container/30 border border-secondary/40 mb-3">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            <span className="text-xs font-bold text-secondary-fixed tracking-wide">ADMINISTRATOR</span>
          </div>
          <h1 className="font-headline-lg text-2xl md:text-3xl font-extrabold">
            Plan Change Requests
          </h1>
          <p className="text-xs md:text-sm text-white/70 mt-1 max-w-xl">
            Review and manage member requests to change their membership plans. Verify physical payments before approving plan upgrades.
          </p>
        </div>
      </div>
      )}

      {loading ? <Spinner /> : (
        <div className="space-y-8">
          
          {/* ── Pending Requests Section ────────────────────────────────────── */}
          <Card className="p-6 md:p-8">
            <SectionHeader icon="pending_actions" title="Pending Plan Changes" count={pending.length} />
            
            {pending.length === 0 ? (
              <div className="text-center py-12 text-on-surface-variant/60 text-xs font-medium bg-surface-container-low rounded-2xl border border-dashed border-outline-variant/40">
                All requests are up to date. No pending changes to review.
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-outline-variant/30">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-surface-container text-on-surface-variant">
                      <th className="text-left px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest">Date</th>
                      <th className="text-left px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest">Athlete Client</th>
                      <th className="text-left px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest">Current Plan</th>
                      <th className="text-left px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest">Requested Plan</th>
                      <th className="px-5 py-3.5 text-right" />
                    </tr>
                  </thead>
                  <tbody>
                    {pending.map((r) => (
                      <tr key={r.id} className="border-t border-outline-variant/20 hover:bg-surface-container/30 transition-colors">
                        <td className="px-5 py-4 text-on-surface-variant text-xs font-medium">
                          {new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </td>
                        <td className="px-5 py-4 font-semibold text-on-surface text-xs">{r.member_name}</td>
                        <td className="px-5 py-4 text-xs font-medium text-on-surface-variant">{r.current_plan}</td>
                        <td className="px-5 py-4">
                          <span className="px-2.5 py-1 bg-secondary-fixed text-on-secondary-fixed rounded-full text-[10px] font-extrabold border border-secondary/20">
                            {r.requested_plan}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="inline-flex gap-2">
                            <button
                              disabled={processing === r.id}
                              onClick={() => handleAction(r.id, "approve")}
                              className="px-3.5 py-1.5 bg-green-600 text-white text-[10px] font-bold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-60"
                            >
                              Approve
                            </button>
                            <button
                              disabled={processing === r.id}
                              onClick={() => handleAction(r.id, "reject")}
                              className="px-3.5 py-1.5 border border-error text-error text-[10px] font-bold rounded-xl hover:bg-error/10 transition-colors disabled:opacity-60"
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* ── Processed Requests History Section ───────────────────────────── */}
          {processed.length > 0 && (
            <Card className="p-6 md:p-8">
              <SectionHeader icon="history" title="Processed Request History" />
              
              <div className="overflow-hidden rounded-2xl border border-outline-variant/30">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-surface-container text-on-surface-variant">
                      <th className="text-left px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest">Date</th>
                      <th className="text-left px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest">Athlete Client</th>
                      <th className="text-left px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest">From Plan</th>
                      <th className="text-left px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest">To Plan</th>
                      <th className="text-left px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest">Status</th>
                      <th className="text-left px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest">Processed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {processed.map((r) => (
                      <tr key={r.id} className="border-t border-outline-variant/20 hover:bg-surface-container/30 transition-colors">
                        <td className="px-5 py-4 text-on-surface-variant text-xs">
                          {new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </td>
                        <td className="px-5 py-4 font-semibold text-on-surface text-xs">{r.member_name}</td>
                        <td className="px-5 py-4 text-xs text-on-surface-variant">{r.current_plan}</td>
                        <td className="px-5 py-4 text-xs font-semibold text-on-surface">{r.requested_plan}</td>
                        <td className="px-5 py-4">
                          <StatusBadge status={r.status} />
                        </td>
                        <td className="px-5 py-4 text-on-surface-variant text-xs font-medium">
                          {r.processed_at ? new Date(r.processed_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

        </div>
      )}

    </div>
  );
};
