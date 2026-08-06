import { useState, useEffect, useCallback } from "react";
import { useGym } from "../services/GymContext";

/* ─── Helpers ────────────────────────────────────────────────────────────── */
const Spinner = () => (
  <div className="flex justify-center items-center py-20">
    <div className="w-8 h-8 rounded-full border-4 border-secondary/30 border-t-secondary animate-spin" />
  </div>
);

const TIER_STYLES = {
  "Day Pass":     { accent: "from-tertiary-container to-inverse-surface", badge: "bg-surface-container text-on-surface-variant border-outline-variant", icon: "" },
  "Standard":     { accent: "from-tertiary-container to-inverse-surface", badge: "bg-surface-container text-on-surface-variant border-outline-variant", icon: "" },
  "Monthly Pro":  { accent: "from-secondary to-secondary-container",      badge: "bg-secondary/15 text-secondary border-secondary/35",           icon: "" },
  "Premium":      { accent: "from-tertiary-container to-inverse-surface", badge: "bg-surface-container text-on-surface-variant border-outline-variant", icon: "" },
  "Annual Elite": { accent: "from-secondary to-secondary-container",      badge: "bg-secondary/15 text-secondary border-secondary/35",           icon: "" },
  "Elite":        { accent: "from-secondary to-secondary-container",      badge: "bg-secondary/15 text-secondary border-secondary/35",           icon: "" },
};

function getTierStyle(plan) {
  return (
    TIER_STYLES[plan.name] ||
    TIER_STYLES[plan.tier] || {
      accent: "from-tertiary-container to-inverse-surface",
      badge:  "bg-surface-container text-on-surface-variant border-outline-variant",
      icon:   "",
    }
  );
}

/* ─── Request Status Badge ───────────────────────────────────────────────── */
const StatusBadge = ({ status }) => {
  const styles = {
    Pending:  "bg-amber-50 text-amber-700 border-amber-200",
    Approved: "bg-green-50 text-green-700 border-green-200",
    Rejected: "bg-red-50 text-red-700 border-red-200",
  };
  const icons = { Pending: "schedule", Approved: "check_circle", Rejected: "cancel" };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${styles[status] || styles.Pending}`}>
      <span className="material-symbols-outlined text-xs">{icons[status] || "info"}</span>
      {status}
    </span>
  );
};

/* ─── Main Component ─────────────────────────────────────────────────────── */
export const MembershipPlansView = ({ onBack }) => {
  const { user, apiFetch, addToast } = useGym();

  const [plans, setPlans]                   = useState([]);
  const [myRequests, setMyRequests]         = useState([]);
  const [profile, setProfile]               = useState(null);
  const [loading, setLoading]               = useState(true);
  const [submitting, setSubmitting]         = useState(null); // plan name being submitted
  const [cancelling, setCancelling]         = useState(null); // request id being cancelled
  const [showContactModal, setShowContactModal] = useState(false);

  // ── Load data ────────────────────────────────────────────────────────────
  const loadAll = useCallback(async () => {
    setLoading(true);
    const [plansRes, reqsRes, profRes] = await Promise.all([
      apiFetch("/api/plans.php"),
      apiFetch("/api/membership_requests.php"),
      apiFetch("/api/member_dashboard.php?action=profile"),
    ]);
    if (Array.isArray(plansRes)) setPlans(plansRes);
    if (Array.isArray(reqsRes))  setMyRequests(reqsRes);
    if (profRes && !profRes.message) setProfile(profRes);
    setLoading(false);
  }, [apiFetch]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const currentPlan  = profile?.plan || user?.plan || "";
  const pendingRequest = myRequests.find((r) => r.status === "Pending");

  // ── Submit plan request ───────────────────────────────────────────────────
  const handleRequest = async (planName) => {
    if (pendingRequest) {
      addToast("Request Already Pending", "You already have a pending plan change request. Please wait for admin approval.", "error");
      return;
    }
    setSubmitting(planName);
    const res = await apiFetch("/api/membership_requests.php", {
      method: "POST",
      body: JSON.stringify({ requested_plan: planName }),
    });
    if (res?.success) {
      addToast("Request Submitted!", "Your plan change request has been sent to admin.", "success");
      setShowContactModal(true);
      await loadAll();
    } else {
      addToast("Request Failed", res?.message || "Could not submit request.", "error");
    }
    setSubmitting(null);
  };

  // ── Cancel pending request ────────────────────────────────────────────────
  const handleCancel = async (reqId) => {
    setCancelling(reqId);
    const res = await apiFetch(`/api/membership_requests.php?id=${reqId}`, { method: "DELETE" });
    if (res?.success) {
      addToast("Request Cancelled", "Your plan change request has been cancelled.", "info");
      await loadAll();
    } else {
      addToast("Cancel Failed", res?.message || "Could not cancel request.", "error");
    }
    setCancelling(null);
  };

  /* ════════════════════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════════════════════ */
  return (
    <div className="space-y-8 animate-fade-in pb-16">

      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="bg-tertiary-container rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 bottom-0 w-2/5 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-secondary/30 via-transparent to-transparent pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "repeating-linear-gradient(45deg,currentColor 0,currentColor 1px,transparent 0,transparent 50%)", backgroundSize: "12px 12px" }} />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-5">
          <div className="flex-1">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-secondary-fixed/80 hover:text-white mb-3 transition-colors"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              Back to Dashboard
            </button>
            <h1 className="font-headline-lg text-2xl md:text-3xl font-extrabold text-white">
              Membership Plans
            </h1>
            <p className="text-xs md:text-sm text-white/70 mt-1 max-w-xl">
              Choose the plan that fits your fitness journey. Request a plan change and visit the front desk to complete payment — your admin will activate it after confirmation.
            </p>
          </div>
          {currentPlan && (
            <div className="bg-white/10 border border-white/20 rounded-2xl px-5 py-3 backdrop-blur-sm shrink-0">
              <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-1">Current Plan</p>
              <p className="text-lg font-extrabold text-white">{currentPlan}</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Admin Contact Modal ────────────────────────────────────────── */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl animate-scale-in text-center">
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-4 border border-amber-200">
              <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
            </div>
            <h3 className="font-bold text-lg text-on-surface mb-2">Request Awaiting Payment</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed font-medium mb-6">
              To unlock your new membership plan, please complete the payment by contacting the Administrator.
            </p>
            <div className="bg-surface-container-low rounded-2xl p-4 text-left border border-outline-variant/30 space-y-3 mb-6">
              <div className="flex justify-between items-center text-xs">
                <span className="text-outline font-bold uppercase tracking-wider text-[10px]">Administrator</span>
                <span className="font-bold text-on-surface">Remus Lupin</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-outline font-bold uppercase tracking-wider text-[10px]">Email Address</span>
                <span className="font-semibold text-secondary">admin@fitzone.com</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-outline font-bold uppercase tracking-wider text-[10px]">Contact No</span>
                <span className="font-bold text-on-surface">0781296347</span>
              </div>
            </div>
            <button
              onClick={() => setShowContactModal(false)}
              className="w-full py-3 bg-secondary text-on-secondary rounded-2xl font-bold text-xs hover:bg-secondary/90 transition-colors shadow-md"
            >
              Understand &amp; Close
            </button>
          </div>
        </div>
      )}

      {/* ── Pending Request Banner ───────────────────────────────────────── */}
      {pendingRequest && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-amber-50 border border-amber-200 rounded-2xl">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-amber-500 text-xl mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>pending</span>
            <div>
              <p className="text-sm font-bold text-amber-800">Plan Change Request Pending</p>
              <p className="text-xs text-amber-700 mt-0.5 font-medium leading-relaxed">
                You requested to switch from <strong>{pendingRequest.current_plan}</strong> → <strong>{pendingRequest.requested_plan}</strong>.
                Please pay and unlock your plan by contacting Administrator <strong>Remus Lupin</strong> (Email: <strong>admin@fitzone.com</strong> | Phone: <strong>0781296347</strong>).
              </p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0 self-end md:self-auto">
            <button
              onClick={() => setShowContactModal(true)}
              className="text-[10px] font-bold text-amber-800 bg-amber-100/50 border border-amber-300 px-3 py-1.5 rounded-xl hover:bg-amber-200/50 transition-colors"
            >
              Contact Admin Info
            </button>
            <button
              onClick={() => handleCancel(pendingRequest.id)}
              disabled={cancelling === pendingRequest.id}
              className="text-[10px] font-bold text-amber-700 border border-amber-300 px-3 py-1.5 rounded-xl hover:bg-amber-100 transition-colors disabled:opacity-60"
            >
              {cancelling === pendingRequest.id ? "Cancelling…" : "Cancel Request"}
            </button>
          </div>
        </div>
      )}

      {/* ── Plans Grid ──────────────────────────────────────────────────── */}
      {loading ? <Spinner /> : (
        <>
          {plans.length === 0 ? (
            <div className="text-center py-16 text-on-surface-variant/60 text-sm font-medium bg-surface-container-low rounded-2xl border border-dashed border-outline-variant/40">
              No membership plans available at this time. Please contact the front desk.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {plans.map((plan) => {
                const isCurrent  = plan.name === currentPlan;
                const isRequested = pendingRequest?.requested_plan === plan.name;
                const features = Array.isArray(plan.features) ? plan.features : [];

                return (
                  <div
                    key={plan.id}
                    className={`relative flex flex-col justify-between p-6 md:p-8 rounded-3xl border transition-all duration-200 card-shadow bg-surface-container-lowest ${
                      isCurrent
                        ? "border-secondary ring-2 ring-secondary/20 shadow-xl"
                        : plan.isPopular
                        ? "border-secondary shadow-md"
                        : "border-outline-variant/30"
                    }`}
                  >
                    {/* Centered Popular / Current Badge */}
                    {plan.isPopular && !isCurrent && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-secondary text-on-secondary px-3 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-widest shadow-xs">
                        MOST POPULAR
                      </div>
                    )}
                    {isCurrent && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-600 text-white px-3 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-widest shadow-xs">
                        ✓ ACTIVE PLAN
                      </div>
                    )}

                    <div>
                      {/* Tier Label */}
                      <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                        {plan.tier || "STANDARD"} TIER
                      </div>

                      {/* Plan Name */}
                      <h3 className="font-headline-lg text-xl font-bold text-on-surface mt-2">
                        {plan.name}
                      </h3>

                      {/* Pricing */}
                      <div className="my-4 flex items-baseline gap-1">
                        <span className="font-headline-lg text-4xl font-extrabold text-on-surface">
                          LKR {plan.price % 1 === 0 ? plan.price.toLocaleString("en-US") : plan.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span className="text-xs text-on-surface-variant font-medium">
                          / {plan.billingCycle?.toLowerCase() || "month"}
                        </span>
                      </div>

                      {/* Features */}
                      <div className="border-t border-outline-variant/20 pt-4 mt-4 space-y-2.5">
                        <p className="text-xs font-bold text-on-surface-variant mb-2">
                          Included Privileges:
                        </p>
                        {features.length === 0 ? (
                          <p className="text-xs text-on-surface-variant italic">No privileges listed.</p>
                        ) : (
                          features.map((feat, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs text-on-surface">
                              <span className="material-symbols-outlined text-secondary text-base shrink-0">
                                check_circle
                              </span>
                              <span>{feat}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Action Button at the bottom */}
                    <div className="mt-8 pt-4 border-t border-outline-variant/20">
                      {isCurrent ? (
                        <div className="w-full py-3 bg-green-50 border border-green-200 text-green-700 rounded-2xl text-xs font-bold text-center">
                          ✓ Plan Currently Enrolled
                        </div>
                      ) : isRequested ? (
                        <div className="w-full py-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-2xl text-xs font-bold text-center">
                          ⏳ Request Awaiting Payment
                        </div>
                      ) : (
                        <button
                          onClick={() => handleRequest(plan.name)}
                          disabled={!!pendingRequest || submitting === plan.name}
                          className="w-full py-3 bg-secondary text-on-secondary rounded-2xl font-headline-md text-xs font-bold flex items-center justify-center gap-2 hover:bg-secondary/90 transition-colors shadow-xs disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {submitting === plan.name ? (
                            <><div className="w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" /> Submitting…</>
                          ) : (
                            <><span className="material-symbols-outlined text-base">send</span>Request Upgrade</>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── My Request History ─────────────────────────────────────── */}
          {myRequests.length > 0 && (
            <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 card-shadow p-6 md:p-8">
              <div className="flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-secondary text-xl">history</span>
                <h2 className="font-bold text-sm text-on-surface">My Plan Change History</h2>
              </div>
              <div className="overflow-hidden rounded-2xl border border-outline-variant/30">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-surface-container text-on-surface-variant">
                      <th className="text-left px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest">Date</th>
                      <th className="text-left px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest">From</th>
                      <th className="text-left px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest">Requested</th>
                      <th className="text-left px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest">Status</th>
                      <th className="px-5 py-3.5 text-right" />
                    </tr>
                  </thead>
                  <tbody>
                    {myRequests.map((r) => (
                      <tr key={r.id} className="border-t border-outline-variant/20 hover:bg-surface-container/30 transition-colors">
                        <td className="px-5 py-4 text-on-surface-variant font-medium">
                          {new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </td>
                        <td className="px-5 py-4 font-semibold text-on-surface">{r.current_plan}</td>
                        <td className="px-5 py-4">
                          <span className="px-2.5 py-1 bg-secondary-fixed text-on-secondary-fixed rounded-full text-[10px] font-bold">{r.requested_plan}</span>
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge status={r.status} />
                        </td>
                        <td className="px-5 py-4 text-right">
                          {r.status === "Pending" && (
                            <button
                              onClick={() => handleCancel(r.id)}
                              disabled={cancelling === r.id}
                              className="text-[10px] font-bold text-error border border-error/20 px-3 py-1.5 rounded-xl hover:bg-error/10 transition-colors disabled:opacity-60"
                            >
                              {cancelling === r.id ? "…" : "Cancel"}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}


        </>
      )}
    </div>
  );
};