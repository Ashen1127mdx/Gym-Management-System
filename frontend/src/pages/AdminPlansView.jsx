import { useEffect, useState, useCallback } from "react";
import { useGym } from "../services/GymContext";
import { MembershipRequestsView } from "./MembershipRequestsView";

/* ─── Small helpers ──────────────────────────────────────────────────── */
const Card = ({ children, className = "" }) => (
  <div className={`bg-surface-container-lowest rounded-3xl border border-outline-variant/30 shadow-sm ${className}`}>
    {children}
  </div>
);

const Spinner = () => (
  <div className="flex justify-center py-16">
    <div className="w-8 h-8 rounded-full border-4 border-secondary/30 border-t-secondary animate-spin" />
  </div>
);

export const AdminPlansView = () => {
  const { apiFetch, addToast, user } = useGym();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", price: "", billingCycle: "Monthly", tier: "Standard" });
  const [featuresInput, setFeaturesInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [customQty, setCustomQty] = useState(1);
  const [customUnit, setCustomUnit] = useState("Days");

  if (user?.role !== "admin") return null;

  const loadPlans = useCallback(async () => {
    setLoading(true);
    const data = await apiFetch("/api/plans.php");
    setPlans(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [apiFetch]);

  useEffect(() => { loadPlans(); }, [loadPlans]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const createPlan = async e => {
    e.preventDefault();
    if (!form.name || !form.price) return;
    setSubmitting(true);
    // Parse features: split by newline or comma
    const featuresList = featuresInput
      .split(/[\n,]+/)
      .map(f => f.trim())
      .filter(f => f.length > 0);

    const billingCycleVal = form.billingCycle === "Other"
      ? `${customQty} ${customUnit}`
      : form.billingCycle;

    const res = await apiFetch("/api/plans.php", {
      method: "POST",
      body: JSON.stringify({
        ...form,
        billingCycle: billingCycleVal,
        price: parseFloat(form.price),
        features: featuresList
      }),
    });
    if (res && res.success === true) {
      addToast("Plan Created", "New membership plan added successfully.", "success");
      setForm({ name: "", price: "", billingCycle: "Monthly", tier: "Standard" });
      setFeaturesInput("");
      setCustomQty(1);
      setCustomUnit("Days");
      loadPlans();
    } else {
      addToast("Create Failed", res?.message || "Unable to create plan.", "error");
    }
    setSubmitting(false);
  };

  const deletePlan = async id => {
    const res = await apiFetch(`/api/plans.php?id=${id}`, { method: "DELETE" });
    if (res && res.success === true) {
      addToast("Plan Deleted", "Plan removed successfully.", "success");
      loadPlans();
    } else {
      addToast("Delete Failed", res?.message || "Unable to delete plan.", "error");
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">

      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div className="bg-tertiary-container rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "repeating-linear-gradient(45deg,currentColor 0,currentColor 1px,transparent 0,transparent 50%)", backgroundSize: "12px 12px" }} />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container/30 border border-secondary/40 mb-3">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            <span className="text-xs font-bold text-secondary-fixed tracking-wide">ADMIN · PLANS</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold">Membership Plans</h1>
          <p className="text-xs md:text-sm text-white/70 mt-1">Create new plans and manage plan‑change requests from members.</p>
        </div>
      </div>

      {/* ── Create Plan Form ─────────────────────────────────────────── */}
      <Card className="p-6 md:p-8">
        <div className="flex items-center gap-2 mb-6">
          <span className="material-symbols-outlined text-secondary text-xl">add_circle</span>
          <h2 className="text-base font-bold text-on-surface">Create New Plan</h2>
        </div>
        <form onSubmit={createPlan} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Plan Name</label>
            <input
              type="text" name="name" value={form.name} onChange={handleChange} required
              placeholder="e.g. Gold Monthly"
              className="px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Price (LKR)</label>
            <input
              type="number" name="price" value={form.price} onChange={handleChange} required min="0"
              placeholder="e.g. 4500"
              className="px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Billing Cycle</label>
            <select name="billingCycle" value={form.billingCycle} onChange={handleChange}
              className="px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-secondary">
              <option>Daily</option>
              <option>Weekly</option>
              <option>Monthly</option>
              <option>Quarterly</option>
              <option>Yearly</option>
              <option>Other</option>
            </select>
          </div>
          {form.billingCycle === "Other" && (
            <div className="flex gap-2 items-end md:col-span-2 bg-surface-container-low p-4 rounded-2xl border border-outline-variant/30">
              <div className="flex-1 flex flex-col gap-1">
                <label className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">Duration Quantity</label>
                <input
                  type="number" min="1" value={customQty} onChange={e => setCustomQty(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                />
              </div>
              <div className="flex-1 flex flex-col gap-1">
                <label className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">Unit</label>
                <select value={customUnit} onChange={e => setCustomUnit(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-secondary">
                  <option>Days</option>
                  <option>Weeks</option>
                  <option>Months</option>
                  <option>Years</option>
                </select>
              </div>
            </div>
          )}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Tier</label>
            <select name="tier" value={form.tier} onChange={handleChange}
              className="px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-secondary">
              <option>Basic</option>
              <option>Standard</option>
              <option>Premium</option>
            </select>
          </div>
          {/* ── Privileges / Features ── */}
          <div className="flex flex-col gap-1 md:col-span-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              Plan Privileges & Features
              <span className="ml-1 text-outline font-normal normal-case tracking-normal">(one per line or comma-separated)</span>
            </label>
            <textarea
              rows={4}
              value={featuresInput}
              onChange={e => setFeaturesInput(e.target.value)}
              placeholder={`e.g.\nFull locker access\nAll group classes included\n1 Personal coaching session / month\nSpa & sauna access`}
              className="px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-secondary resize-none font-medium leading-relaxed"
            />
          </div>
          <div className="md:col-span-2">
            <button type="submit" disabled={submitting}
              className="w-full py-2.5 bg-secondary text-on-secondary rounded-xl font-bold text-sm hover:bg-secondary/90 transition-colors disabled:opacity-60">
              {submitting ? "Creating…" : "Create Plan"}
            </button>
          </div>
        </form>
      </Card>

      {/* ── Existing Plans Table ─────────────────────────────────────── */}
      <Card className="p-6 md:p-8">
        <div className="flex items-center gap-2 mb-6">
          <span className="material-symbols-outlined text-secondary text-xl">card_membership</span>
          <h2 className="text-base font-bold text-on-surface">Existing Plans</h2>
        </div>
        {loading ? <Spinner /> : (
          <div className="overflow-hidden rounded-2xl border border-outline-variant/30">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-container text-on-surface-variant">
                  <th className="text-left px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest">Name</th>
                  <th className="text-left px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest">Tier</th>
                  <th className="text-left px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest">Billing</th>
                  <th className="text-left px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest">Price (LKR)</th>
                  <th className="text-left px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest">Privileges</th>
                  <th className="px-5 py-3.5 text-right" />
                </tr>
              </thead>
              <tbody>
                {plans.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-on-surface-variant/60 text-xs">No plans yet. Create one above.</td>
                  </tr>
                ) : plans.map(p => (
                  <tr key={p.id} className="border-t border-outline-variant/20 hover:bg-surface-container/30 transition-colors align-top">
                    <td className="px-5 py-4 font-bold text-on-surface text-xs">{p.name}</td>
                    <td className="px-5 py-4 text-xs text-on-surface-variant">{p.tier}</td>
                    <td className="px-5 py-4 text-xs text-on-surface-variant">{p.billingCycle}</td>
                    <td className="px-5 py-4 text-xs font-bold text-secondary">LKR {Number(p.price).toLocaleString()}</td>
                    <td className="px-5 py-4 max-w-xs">
                      {Array.isArray(p.features) && p.features.length > 0 ? (
                        <ul className="space-y-0.5">
                          {p.features.map((feat, idx) => (
                            <li key={idx} className="flex items-start gap-1 text-[11px] text-on-surface-variant font-medium">
                              <span className="material-symbols-outlined text-secondary text-sm mt-[1px] flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                              {feat}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="italic text-outline text-xs">No privileges listed</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button onClick={() => deletePlan(p.id)}
                        className="px-3 py-1 text-[10px] font-bold border border-error text-error rounded-full hover:bg-error/10 transition-colors">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ── Plan Change Requests ─────────────────────────────────────── */}
      <Card className="p-6 md:p-8">
        <div className="flex items-center gap-2 mb-6">
          <span className="material-symbols-outlined text-secondary text-xl">pending_actions</span>
          <h2 className="text-base font-bold text-on-surface">Plan Change Requests</h2>
        </div>
        <MembershipRequestsView embedded />
      </Card>

    </div>
  );
};
