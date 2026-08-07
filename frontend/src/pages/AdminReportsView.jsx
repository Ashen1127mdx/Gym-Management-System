import { useEffect, useState, useCallback } from "react";
import { useGym } from "../services/GymContext";

/* ─── Stat Card ────────────────────────────────────────────────────────── */
const StatCard = ({ icon, label, value, sub, accent = false }) => (
  <div className={`rounded-3xl p-6 flex items-start gap-4 border shadow-sm transition-transform hover:-translate-y-0.5
    ${accent
      ? "bg-tertiary-container text-white border-transparent"
      : "bg-surface-container-lowest border-outline-variant/30 text-on-surface"
    }`}>
    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0
      ${accent ? "bg-white/20" : "bg-secondary-container"}`}>
      <span className={`material-symbols-outlined text-xl ${accent ? "text-white" : "text-on-secondary-container"}`}>
        {icon}
      </span>
    </div>
    <div className="min-w-0">
      <p className={`text-[10px] font-bold uppercase tracking-widest mb-0.5 ${accent ? "text-white/70" : "text-on-surface-variant"}`}>
        {label}
      </p>
      <p className={`text-3xl font-extrabold leading-none ${accent ? "text-white" : "text-on-surface"}`}>{value}</p>
      {sub && (
        <p className={`text-[10px] mt-1.5 ${accent ? "text-white/60" : "text-on-surface-variant/70"}`}>{sub}</p>
      )}
    </div>
  </div>
);

const Spinner = () => (
  <div className="flex justify-center py-20">
    <div className="w-8 h-8 rounded-full border-4 border-secondary/30 border-t-secondary animate-spin" />
  </div>
);

const MONTHS_LIST = [
  { val: "2026-01", label: "January 2026" },
  { val: "2026-02", label: "February 2026" },
  { val: "2026-03", label: "March 2026" },
  { val: "2026-04", label: "April 2026" },
  { val: "2026-05", label: "May 2026" },
  { val: "2026-06", label: "June 2026" },
  { val: "2026-07", label: "July 2026" },
  { val: "2026-08", label: "August 2026" },
  { val: "2026-09", label: "September 2026" },
  { val: "2026-10", label: "October 2026" },
  { val: "2026-11", label: "November 2026" },
  { val: "2026-12", label: "December 2026" }
];

/* ─── Main Component ───────────────────────────────────────────────────── */
export const AdminReportsView = () => {
  const { apiFetch, addToast, user } = useGym();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Month selector (defaults to current month: e.g., '2026-08')
  // Year/Month/Day Filters
  const [selectedYear, setSelectedYear] = useState(() => String(new Date().getFullYear()));
  const [selectedMonth, setSelectedMonth] = useState(() => String(new Date().getMonth() + 1).padStart(2, '0'));
  const [selectedDay, setSelectedDay] = useState(() => String(new Date().getDate()));

  // Inline edit state
  const [editingLog, setEditingLog] = useState(null); // { id, notes }
  const [savingNotes, setSavingNotes] = useState(false);

  // Payment Log Book records
  const [paymentLogs, setPaymentLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Construct dynamic date filter string based on selected Year, Month, Day
  const getDateFilter = useCallback(() => {
    if (!selectedYear) return "";
    if (selectedMonth === "All") return selectedYear; // YYYY
    if (selectedDay === "All") return `${selectedYear}-${selectedMonth}`; // YYYY-MM
    return `${selectedYear}-${selectedMonth}-${selectedDay.padStart(2, '0')}`; // YYYY-MM-DD
  }, [selectedYear, selectedMonth, selectedDay]);

  const loadStats = useCallback(async () => {
    setLoading(true);
    const filter = getDateFilter();
    const data = await apiFetch(`/api/reports.php?date_filter=${filter}`);
    setStats(data);
    setLoading(false);
  }, [apiFetch, getDateFilter]);

  const loadPaymentLogs = useCallback(async () => {
    setLoadingLogs(true);
    const filter = getDateFilter();
    const logs = await apiFetch(`/api/payments_log.php?date_filter=${filter}`);
    setPaymentLogs(Array.isArray(logs) ? logs : []);
    setLoadingLogs(false);
  }, [apiFetch, getDateFilter]);

  const handleEditNotesSubmit = async (e) => {
    e.preventDefault();
    if (!editingLog) return;
    setSavingNotes(true);
    const res = await apiFetch(`/api/payments_log.php?id=${editingLog.id}`, {
      method: "PUT",
      body: JSON.stringify({ notes: editingLog.notes })
    });
    if (res?.success) {
      addToast("Notes Updated", "Payment log notes updated successfully.", "success");
      setEditingLog(null);
      loadPaymentLogs();
    } else {
      addToast("Failed", "Unable to update notes.", "error");
    }
    setSavingNotes(false);
  };

  const deletePaymentLog = async (id) => {
    const res = await apiFetch(`/api/payments_log.php?id=${id}`, { method: "DELETE" });
    if (res?.success) {
      addToast("Removed", "Payment record removed from log book.", "success");
      loadStats();
      loadPaymentLogs();
    } else {
      addToast("Failed", "Unable to remove log entry.", "error");
    }
  };

  useEffect(() => {
    if (user?.role !== "admin") return;
    loadStats();
    loadPaymentLogs();
  }, [loadStats, loadPaymentLogs, selectedYear, selectedMonth, selectedDay, user]);

  if (user?.role !== "admin") return null;

  const fmt = (n) => n !== undefined && n !== null ? Number(n).toLocaleString() : "—";
  const lkr = (n) => n !== undefined && n !== null ? `LKR ${Number(n).toLocaleString()}` : "—";

  return (
    <div className="space-y-8 animate-fade-in pb-16">

      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div className="bg-tertiary-container rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "repeating-linear-gradient(45deg,currentColor 0,currentColor 1px,transparent 0,transparent 50%)", backgroundSize: "12px 12px" }} />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container/30 border border-secondary/40 mb-3">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span className="text-xs font-bold text-secondary-fixed tracking-wide">ADMIN · REPORTS</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold">Business Reports & Payment Log</h1>
            <p className="text-xs md:text-sm text-white/70 mt-1">Snapshot of gym financials and payment log history.</p>
          </div>

          {/* Date filters dropdowns */}
          <div className="flex flex-wrap items-center gap-3 z-20 shrink-0">
            {/* Year Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-white/70 uppercase">Year</span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold focus:outline-none cursor-pointer"
              >
                {["2024", "2025", "2026", "2027"].map(y => (
                  <option key={y} value={y} className="text-on-surface bg-surface-container-highest">{y}</option>
                ))}
              </select>
            </div>

            {/* Month Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-white/70 uppercase">Month</span>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold focus:outline-none cursor-pointer"
              >
                <option value="All" className="text-on-surface bg-surface-container-highest">All Months</option>
                {[
                  { v: "01", l: "Jan" }, { v: "02", l: "Feb" }, { v: "03", l: "Mar" },
                  { v: "04", l: "Apr" }, { v: "05", l: "May" }, { v: "06", l: "Jun" },
                  { v: "07", l: "Jul" }, { v: "08", l: "Aug" }, { v: "09", l: "Sep" },
                  { v: "10", l: "Oct" }, { v: "11", l: "Nov" }, { v: "12", l: "Dec" }
                ].map(m => (
                  <option key={m.v} value={m.v} className="text-on-surface bg-surface-container-highest">{m.l}</option>
                ))}
              </select>
            </div>

            {/* Day Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-white/70 uppercase">Day</span>
              <select
                value={selectedDay}
                disabled={selectedMonth === "All"}
                onChange={(e) => setSelectedDay(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold focus:outline-none cursor-pointer disabled:opacity-50"
              >
                <option value="All" className="text-on-surface bg-surface-container-highest">All Days</option>
                {Array.from({ length: 31 }, (_, i) => String(i + 1)).map(d => (
                  <option key={d} value={d} className="text-on-surface bg-surface-container-highest">{d}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {loading ? <Spinner /> : (!stats || stats.success === false) ? (
        <div className="text-center py-12 text-on-surface-variant/60 text-sm">
          <p>Could not load statistics.</p>
          {stats?.message && <p className="text-error font-mono mt-2 text-xs">{stats.message}</p>}
          <button onClick={() => { loadStats(); loadPaymentLogs(); }} className="mt-4 px-4 py-2 bg-secondary text-on-secondary text-xs rounded-xl font-bold">Try Again</button>
        </div>
      ) : (
        <>
          {/* ── Overview Grid ────────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            <StatCard icon="group" label="Total Members" value={fmt(stats.total_members)} sub={`${fmt(stats.active_members)} currently active`} />
            <StatCard icon="payments" label="Estimated Monthly Revenue" value={lkr(stats.revenue_estimate)} sub="Based on active members × plan price" />
            <StatCard accent icon="monetization_on" label="Actual Revenue" value={lkr(stats.monthly_revenue)} sub={`From ${stats.monthly_payment_count || 0} logged physical payments`} />
          </div>

          <div className="grid grid-cols-1 gap-8">
            {/* ── Payment Log Book (Full Width) ──────────────────────────── */}
            <div>
              <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 shadow-sm p-6 h-full flex flex-col">
                <div className="flex items-center gap-2 mb-6">
                  <span className="material-symbols-outlined text-secondary text-xl">menu_book</span>
                  <h2 className="text-base font-bold text-on-surface">Payment Log Book Details</h2>
                </div>

                {loadingLogs ? <Spinner /> : (
                  <div className="flex-1 overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="bg-surface-container text-on-surface-variant">
                          <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider">Date & Time</th>
                          <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider">Member Details</th>
                          <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider">Plan Details</th>
                          <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider">Receipt & Notes</th>
                          <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider">Amount</th>
                          <th className="px-4 py-3 text-right" />
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/20">
                        {paymentLogs.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-4 py-8 text-center text-on-surface-variant/60 text-xs">
                              No payments found matching the filter options.
                            </td>
                          </tr>
                        ) : paymentLogs.map(log => (
                          <tr key={log.id} className="hover:bg-surface-container/20 transition-colors text-xs">
                            <td className="px-4 py-3 text-on-surface-variant whitespace-nowrap font-medium">
                              {new Date(log.logged_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                            </td>
                            <td className="px-4 py-3">
                              <span className="font-bold text-on-surface block">{log.member_name}</span>
                              <span className="text-[10px] text-on-surface-variant block">{log.member_fz_id}</span>
                            </td>
                            <td className="px-4 py-3 font-semibold text-secondary-fixed">
                              {log.plan_name}
                            </td>
                            <td className="px-4 py-3 text-on-surface-variant">
                              <div className="flex items-center gap-1.5">
                                <span className="italic">{log.notes || "—"}</span>
                                <button
                                  onClick={() => setEditingLog({ id: log.id, notes: log.notes || "" })}
                                  className="p-1 text-secondary hover:bg-secondary/15 rounded-lg transition-colors"
                                  title="Add receipt details"
                                >
                                  <span className="material-symbols-outlined text-xs">edit</span>
                                </button>
                              </div>
                            </td>
                            <td className="px-4 py-3 font-bold text-on-surface">
                              LKR {Number(log.amount).toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => deletePaymentLog(log.id)}
                                className="p-1 text-error hover:bg-error/15 rounded-full transition-colors"
                                title="Delete payment log"
                              >
                                <span className="material-symbols-outlined text-base">delete</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Edit Notes / Receipt Dialog Overlay */}
      {editingLog && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-6 w-96 card-shadow space-y-4">
            <h3 className="font-bold text-sm text-on-surface">Add / Edit Receipt Details</h3>
            <form onSubmit={handleEditNotesSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1 block">Receipt No. & Notes</label>
                <textarea
                  required
                  rows={3}
                  value={editingLog.notes}
                  onChange={(e) => setEditingLog({ ...editingLog, notes: e.target.value })}
                  placeholder="Enter physical receipt number or special payment notes..."
                  className="w-full px-3 py-2.5 rounded-xl border border-outline-variant bg-surface-container text-on-surface text-xs focus:outline-none focus:ring-2 focus:ring-secondary resize-none"
                />
              </div>
              <div className="flex items-center justify-end gap-2 text-xs font-bold pt-2">
                <button
                  type="button"
                  onClick={() => setEditingLog(null)}
                  className="px-4 py-2 border border-outline text-on-surface rounded-xl hover:bg-surface-container-high transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingNotes}
                  className="px-4 py-2 bg-secondary text-on-secondary rounded-xl hover:bg-secondary/90 transition-colors"
                >
                  {savingNotes ? "Saving..." : "Save Details"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
