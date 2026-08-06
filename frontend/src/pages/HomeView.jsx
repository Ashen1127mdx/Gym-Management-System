import { useGym } from "../services/GymContext";
import { useState, useEffect, useCallback } from "react";

/* ─── Helpers ────────────────────────────────────────────────────────────── */
const Card = ({ children, className = "" }) => (
  <div className={`bg-surface-container-lowest rounded-3xl border border-outline-variant/30 card-shadow p-6 ${className}`}>
    {children}
  </div>
);

const SectionTitle = ({ icon, title, count }) => (
  <div className="flex items-center gap-2 mb-5">
    <span className="material-symbols-outlined text-secondary text-xl">{icon}</span>
    <h2 className="font-bold text-sm text-on-surface">{title}</h2>
    {count !== undefined && (
      <span className="ml-2 text-[10px] bg-secondary text-on-secondary px-2.5 py-0.5 rounded-full font-bold">
        {count}
      </span>
    )}
  </div>
);

const Spinner = () => (
  <div className="flex justify-center items-center py-10">
    <div className="w-6 h-6 rounded-full border-3 border-secondary/30 border-t-secondary animate-spin" />
  </div>
);

const EmptyState = ({ msg }) => (
  <p className="text-xs text-on-surface-variant/60 italic text-center py-4">{msg}</p>
);

export const HomeView = () => {
  const {
    user,
    setActiveTab,
    members,
    trainers,
    apiFetch,
    setIsAddTrainerModalOpen
  } = useGym();

  const [schedules, setSchedules] = useState([]);
  const [loadingSchedule, setLoadingSchedule] = useState(false);

  // Live stats from reports API
  const [homeStats, setHomeStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Fetch today's aggregated stats (always use current month filter for monthly revenue)
  const loadHomeStats = useCallback(async () => {
    setLoadingStats(true);
    const curMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"
    const data = await apiFetch(`/api/reports.php?date_filter=${curMonth}`);
    setHomeStats(data);
    setLoadingStats(false);
  }, [apiFetch]);

  // Fetch all schedules
  const loadSchedule = useCallback(async () => {
    setLoadingSchedule(true);
    const data = await apiFetch("/api/trainer_schedule.php");
    if (Array.isArray(data)) {
      setSchedules(data);
    }
    setLoadingSchedule(false);
  }, [apiFetch]);

  useEffect(() => {
    loadHomeStats();
    loadSchedule();
  }, [loadHomeStats, loadSchedule]);

  /* ── Derived values ─────────────────────────────────────────────────────── */
  const totalMembersCount  = homeStats?.total_members  ?? members.length;
  const totalTrainersCount = homeStats?.total_trainers ?? trainers.length;

  // Today's date string to match schedule records
  const todayStr = new Date().toISOString().split("T")[0];
  const todaySchedules = schedules.filter(s => s.session_date === todayStr);

  // Attendance from API (today's check-ins)
  const presentCount = homeStats?.today_checkins ?? 0;
  const totalGymCapacity = totalMembersCount || 1;
  const absentCount = Math.max(0, totalGymCapacity - presentCount);
  const attendanceRate = totalGymCapacity > 0
    ? Math.min(100, Math.round((presentCount / totalGymCapacity) * 100))
    : 0;

  // Revenue
  const monthlyRevenue  = homeStats?.monthly_revenue   ?? 0;
  const todayRevenue    = homeStats?.today_revenue     ?? 0;
  const pendingMembers  = homeStats?.pending_payment_members ?? 0;
  const trainerCounts   = homeStats?.trainer_member_counts  ?? {};

  // Grouping members by plans (from context)
  const planDistribution = members.reduce((acc, m) => {
    const p = m.plan || "Basic";
    acc[p] = (acc[p] || 0) + 1;
    return acc;
  }, {});

  const initials = user?.name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "AD";

  const lkr = (n) => Number(n || 0).toLocaleString("en-LK", { minimumFractionDigits: 2 });

  return (
    <div className="space-y-6 animate-fade-in pb-16">

      {/* ══ Welcome Header ════════════════════════════════════════════════════ */}
      <div className="bg-tertiary-container rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 bottom-0 w-2/5 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-secondary/30 via-transparent to-transparent pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "repeating-linear-gradient(45deg,currentColor 0,currentColor 1px,transparent 0,transparent 50%)", backgroundSize: "12px 12px" }} />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container/30 border border-secondary/40 mb-3">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span className="text-xs font-bold text-secondary-fixed tracking-wide">SYSTEM CONTROL CENTER</span>
            </div>
            <h1 className="font-headline-lg text-2xl md:text-3xl font-extrabold">
              Welcome Back, {user?.name || "Admin"}!
            </h1>
            <p className="text-xs md:text-sm text-white/70 mt-1 max-w-xl">
              Overall facility status: active &amp; secure. Check-ins are logging smoothly.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/10 border border-white/20 rounded-2xl px-5 py-3 backdrop-blur-sm shrink-0">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name || "Admin"}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-secondary/50"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container font-bold text-lg ring-2 ring-secondary/50">
                {initials}
              </div>
            )}
            <div>
              <p className="font-bold text-white text-sm">{user?.name || "Administrator"}</p>
              <p className="text-[11px] text-white/70">Administrator</p>
            </div>
          </div>
        </div>
      </div>

      {/* ══ Dashboard Metric Cards ═══════════════════════════════════════════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">Total Members</p>
              <p className="font-headline-lg text-3xl font-extrabold text-on-surface">
                {loadingStats ? "…" : totalMembersCount}
              </p>
            </div>
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-blue-50 text-blue-600">
              <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>group</span>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">Total Trainers</p>
              <p className="font-headline-lg text-3xl font-extrabold text-on-surface">
                {loadingStats ? "…" : totalTrainersCount}
              </p>
            </div>
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-green-50 text-green-600">
              <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>fitness_center</span>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">Monthly Revenue</p>
              <p className="font-headline-lg text-sm font-extrabold text-on-surface leading-tight">
                {loadingStats ? "…" : `LKR ${lkr(monthlyRevenue)}`}
              </p>
            </div>
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-secondary-fixed text-on-secondary-fixed">
              <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">Today's Sessions</p>
              <p className="font-headline-lg text-3xl font-extrabold text-on-surface">{todaySchedules.length}</p>
            </div>
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-purple-50 text-purple-600">
              <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>calendar_today</span>
            </div>
          </div>
        </Card>
      </div>

      {/* ══ Main Grid Layout ══════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column: Recent Registrations & Trainer Overview */}
        <div className="lg:col-span-2 space-y-6">

          {/* Recent Member Registrations */}
          <Card>
            <SectionTitle icon="person_add" title="Recent Member Registrations" />
            {members.length === 0 ? (
              <div className="text-center py-10 text-on-surface-variant/60 text-xs font-medium bg-surface-container-low rounded-2xl border border-dashed border-outline-variant/40">
                No registered members found.
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-outline-variant/30">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-surface-container text-on-surface-variant">
                      <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest">Member ID</th>
                      <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest">Name</th>
                      <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest">Membership</th>
                      <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest">Join Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.slice(0, 3).map((m) => (
                      <tr key={m.id} className="border-t border-outline-variant/20 hover:bg-surface-container/30 transition-colors">
                        <td className="px-4 py-3 font-bold text-secondary">{m.member_id}</td>
                        <td className="px-4 py-3 font-semibold text-on-surface">{m.name}</td>
                        <td className="px-4 py-3 text-on-surface-variant font-medium">{m.plan || "—"}</td>
                        <td className="px-4 py-3 text-outline font-medium">{m.join_date || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <button
              onClick={() => setActiveTab("members")}
              className="mt-4 w-full py-2.5 border border-outline text-on-surface hover:bg-surface-container-low rounded-xl text-xs font-bold transition-all"
            >
              View All Members
            </button>
          </Card>

          {/* Trainer Overview */}
          <Card>
            <SectionTitle icon="fitness_center" title="Trainer Overview" />
            {trainers.length === 0 ? (
              <div className="text-center py-10 text-on-surface-variant/60 text-xs font-medium bg-surface-container-low rounded-2xl border border-dashed border-outline-variant/40">
                No gym trainers registered.
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-outline-variant/30">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-surface-container text-on-surface-variant">
                      <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest">Trainer</th>
                      <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest">Specialization</th>
                      <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest">Assigned Members</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trainers.slice(0, 3).map((t) => (
                      <tr key={t.id} className="border-t border-outline-variant/20 hover:bg-surface-container/30 transition-colors">
                        <td className="px-4 py-3 font-semibold text-on-surface">{t.name}</td>
                        <td className="px-4 py-3 text-on-surface-variant font-medium">{t.specialization || "General Coaching"}</td>
                        <td className="px-4 py-3 text-outline font-bold">
                          {loadingStats ? "…" : (trainerCounts[t.id] ?? 0)} Members
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <button
              onClick={() => setActiveTab("trainers")}
              className="mt-4 w-full py-2.5 border border-outline text-on-surface hover:bg-surface-container-low rounded-xl text-xs font-bold transition-all"
            >
              Manage Trainers
            </button>
          </Card>

        </div>

        {/* Right Column: Summaries, Schedules & Actions */}
        <div className="space-y-6">

          {/* Quick Actions */}
          <Card className="bg-surface-container-low">
            <SectionTitle icon="bolt" title="Quick Actions" />
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setActiveTab("members-add")}
                className="p-3 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl flex flex-col items-center justify-center gap-1.5 font-bold text-[10px] text-on-surface hover:bg-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined text-lg text-secondary">person_add</span>
                Add Member
              </button>
              <button
                onClick={() => setIsAddTrainerModalOpen(true)}
                className="p-3 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl flex flex-col items-center justify-center gap-1.5 font-bold text-[10px] text-on-surface hover:bg-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined text-lg text-secondary">fitness_center</span>
                Add Trainer
              </button>
              <button
                onClick={() => setActiveTab("plans")}
                className="p-3 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl flex flex-col items-center justify-center gap-1.5 font-bold text-[10px] text-on-surface hover:bg-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined text-lg text-secondary">card_membership</span>
                Manage Plans
              </button>
              <button
                onClick={() => setActiveTab("reports")}
                className="p-3 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl flex flex-col items-center justify-center gap-1.5 font-bold text-[10px] text-on-surface hover:bg-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined text-lg text-secondary">payments</span>
                View Payments
              </button>
            </div>
          </Card>

          {/* Membership Summary */}
          <Card>
            <SectionTitle icon="pie_chart" title="Membership Summary" />
            <div className="space-y-2">
              {Object.keys(planDistribution).length === 0 ? (
                <EmptyState msg="No plan data available." />
              ) : (
                Object.entries(planDistribution).map(([planName, count]) => (
                  <div key={planName} className="flex justify-between items-center p-3 bg-surface-container-low rounded-xl">
                    <span className="text-xs font-semibold text-on-surface">{planName}</span>
                    <span className="text-xs font-bold text-secondary">{count} Members</span>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Payment Summary — fully live */}
          <Card>
            <SectionTitle icon="payments" title="Payment Summary" />
            {loadingStats ? <Spinner /> : (
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-on-surface-variant font-medium">Payments Received Today</span>
                  <span className="font-bold text-on-surface">LKR {lkr(todayRevenue)}</span>
                </div>
                <div className="flex justify-between items-center text-xs border-t border-outline-variant/20 pt-3">
                  <span className="text-on-surface-variant font-medium">Pending Payments</span>
                  <span className="font-bold text-on-surface">{pendingMembers} Members</span>
                </div>
                <div className="flex justify-between items-center text-xs border-t border-outline-variant/20 pt-3">
                  <span className="text-on-surface-variant font-medium">Monthly Revenue</span>
                  <span className="font-bold text-secondary">LKR {lkr(monthlyRevenue)}</span>
                </div>
                <button
                  onClick={() => setActiveTab("reports")}
                  className="w-full py-2 border border-secondary text-secondary rounded-xl text-xs font-bold hover:bg-secondary/10 transition-colors mt-2"
                >
                  View Payments
                </button>
              </div>
            )}
          </Card>

          {/* Today's Schedule */}
          <Card>
            <SectionTitle icon="schedule" title="Today's Schedule" />
            {loadingSchedule ? <Spinner /> : todaySchedules.length === 0 ? (
              <EmptyState msg="No classes scheduled for today." />
            ) : (
              <div className="space-y-2.5 max-h-56 overflow-y-auto custom-scrollbar">
                {todaySchedules.map((s) => (
                  <div key={s.id} className="p-3 bg-surface-container-low rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-on-surface">{s.session_type}</p>
                      <p className="text-[10px] text-on-surface-variant mt-0.5">Coach {s.member_name}</p>
                    </div>
                    <span className="font-extrabold text-secondary">{s.session_time}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Attendance Summary — fully live */}
          <Card>
            <SectionTitle icon="task_alt" title="Attendance Summary" />
            {loadingStats ? <Spinner /> : (
              <>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-center">
                    <p className="text-lg font-extrabold text-green-700">{presentCount}</p>
                    <p className="text-[9px] font-bold text-green-600 uppercase mt-0.5">Present Today</p>
                  </div>
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-center">
                    <p className="text-lg font-extrabold text-red-700">{absentCount}</p>
                    <p className="text-[9px] font-bold text-red-600 uppercase mt-0.5">Not Checked In</p>
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs font-medium text-on-surface-variant mb-2">
                  <span>Attendance Rate</span>
                  <span className="font-bold text-on-surface">{attendanceRate}%</span>
                </div>
                <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                  <div className="h-full bg-green-600 rounded-full transition-all duration-500" style={{ width: `${attendanceRate}%` }} />
                </div>
              </>
            )}
            <button
              onClick={() => setActiveTab("attendance")}
              className="mt-4 w-full py-2 border border-outline text-on-surface hover:bg-surface-container-low rounded-xl text-xs font-bold transition-all"
            >
              View Attendance
            </button>
          </Card>

          {/* System Alerts — live pending requests */}
          <Card>
            <SectionTitle icon="notifications" title="System Alerts" />
            {loadingStats ? <Spinner /> : (
              <ul className="space-y-2.5 text-xs text-on-surface-variant font-medium">
                <li className="flex items-start gap-2">
                  <span className="text-secondary">•</span>
                  <span>
                    {homeStats?.pending_requests > 0
                      ? `${homeStats.pending_requests} pending membership upgrade request${homeStats.pending_requests !== 1 ? "s" : ""}.`
                      : "No pending membership requests."}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-secondary">•</span>
                  <span>
                    {pendingMembers > 0
                      ? `${pendingMembers} active member${pendingMembers !== 1 ? "s" : ""} with no payment logged this month.`
                      : "All active members have payments logged this month."}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-secondary">•</span>
                  <span>
                    {homeStats?.new_members_this_month > 0
                      ? `${homeStats.new_members_this_month} new member${homeStats.new_members_this_month !== 1 ? "s" : ""} joined this month.`
                      : "No new members registered this month."}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-secondary">•</span>
                  <span>
                    {presentCount > 0
                      ? `${presentCount} member${presentCount !== 1 ? "s" : ""} checked in today.`
                      : "No check-ins recorded for today yet."}
                  </span>
                </li>
              </ul>
            )}
          </Card>

        </div>

      </div>

    </div>
  );
};
