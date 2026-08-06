import { useGym } from "../services/GymContext";
import { useState, useEffect } from "react";

/* ─── Small shared components ──────────────────────────────────────────────── */
const Card = ({ children, className = "" }) => (
  <div className={`bg-surface-container-lowest rounded-3xl border border-outline-variant/30 card-shadow ${className}`}>
    {children}
  </div>
);

const SectionTitle = ({ icon, title, badge }) => (
  <div className="flex items-center gap-2 mb-5">
    <span className="material-symbols-outlined text-secondary text-xl">{icon}</span>
    <h2 className="font-bold text-sm text-on-surface">{title}</h2>
    {badge && (
      <span className="ml-auto text-[10px] bg-secondary-fixed text-on-secondary-fixed px-2 py-0.5 rounded-full font-bold">{badge}</span>
    )}
  </div>
);

const StatBadge = ({ label, value, color = "blue" }) => {
  const colors = {
    blue:   "bg-blue-50 text-blue-700 border-blue-200",
    green:  "bg-green-50 text-green-700 border-green-200",
    amber:  "bg-amber-50 text-amber-700 border-amber-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
  };
  return (
    <div className={`flex flex-col items-center px-4 py-3 rounded-2xl border ${colors[color]}`}>
      <p className="font-extrabold text-xl">{value}</p>
      <p className="text-[10px] font-bold uppercase tracking-wider mt-0.5 opacity-70">{label}</p>
    </div>
  );
};

const Spinner = () => (
  <div className="flex justify-center py-10">
    <div className="w-7 h-7 rounded-full border-4 border-secondary/30 border-t-secondary animate-spin" />
  </div>
);

const EmptyState = ({ msg }) => (
  <div className="text-center py-10 text-on-surface-variant/60 text-xs font-medium bg-surface-container-low rounded-2xl border border-dashed border-outline-variant/40">
    {msg}
  </div>
);

/* ─── Tabs ──────────────────────────────────────────────────────────────────── */
const TABS = [
  { id: "overview",  label: "Overview",         icon: "dashboard" },
  { id: "workout",   label: "Workout Plan",      icon: "fitness_center" },
  { id: "sessions",  label: "Upcoming Sessions", icon: "calendar_month" },
  { id: "progress",  label: "Progress",          icon: "trending_up" },
];

/* ─── Main Component ─────────────────────────────────────────────────────────── */
export const MemberDashboardView = ({ onViewPlans }) => {
  const { user, refreshCounter } = useGym();
  const [activeTab, setActiveTab] = useState("overview");

  // Data state
  const [profile,     setProfile]     = useState(null);
  const [attendance,  setAttendance]  = useState(null);
  const [workoutPlans, setWorkoutPlans] = useState([]);
  const [sessions,    setSessions]    = useState([]);
  const [loading,     setLoading]     = useState(true);

  // ─── Load all member data via direct fetch (bypasses apiFetch instability) ──
  useEffect(() => {
    let cancelled = false;
    // Dynamically resolve backend host based on dev (port 3000) vs production (htdocs)
    const isDev = window.location.port === "3000";
    const API = isDev ? "http://localhost" : "";
    const ts   = Date.now();

    const fetchJSON = async (url) => {
      try {
        const r = await fetch(`${API}${url}&t=${ts}`, { credentials: "include" });
        const text = await r.text();
        try { return JSON.parse(text); }
        catch { return null; }
      } catch {
        return null;
      }
    };

    (async () => {
      setLoading(true);
      const [prof, att, wps, sess] = await Promise.all([
        fetchJSON("/backend/api/member_dashboard.php?action=profile"),
        fetchJSON("/backend/api/member_dashboard.php?action=attendance"),
        fetchJSON("/backend/api/member_dashboard.php?action=workout_plans"),
        fetchJSON("/backend/api/member_dashboard.php?action=sessions"),
      ]);
      if (cancelled) return;
      if (prof && prof.id)                   setProfile(prof);
      if (att  && att.totalVisits !== undefined) setAttendance(att);
      if (Array.isArray(wps))                setWorkoutPlans(wps);
      if (Array.isArray(sess))               setSessions(sess);
      setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [refreshCounter]);

  // ─── Computed helpers ─────────────────────────────────────────────────────
  const firstName    = (profile?.name || user?.name || "Member").split(" ")[0];
  const initials     = (profile?.name || user?.name || "M").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  const planName     = profile?.plan || "—";
  const latestPlan   = workoutPlans[0] ?? null;
  const nextSession  = sessions[0] ?? null;
  const thisMonthVisits = attendance?.thisMonthCount ?? 0;

  // attendance rate (approx out of 26 possible weekdays/month)
  const attendanceRate = thisMonthVisits > 0
    ? Math.min(100, Math.round((thisMonthVisits / 26) * 100))
    : 0;

  // Progress bar helper
  const ProgressBar = ({ value, max, colorClass = "bg-secondary" }) => {
    const pct = Math.min(100, Math.round((value / max) * 100));
    return (
      <div className="w-full h-2.5 bg-surface-container-high rounded-full overflow-hidden">
        <div className={`h-full ${colorClass} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
    );
  };

  /* ════════════════════════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════════════════════════ */
  return (
    <div className="space-y-6 animate-fade-in pb-16">

      {/* ══ Welcome Banner ═══════════════════════════════════════════════════ */}
      <div className="bg-tertiary-container rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 bottom-0 w-2/5 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-secondary/30 via-transparent to-transparent pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "repeating-linear-gradient(45deg,currentColor 0,currentColor 1px,transparent 0,transparent 50%)", backgroundSize: "12px 12px" }} />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container/30 border border-secondary/40 mb-3">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span className="text-xs font-bold text-secondary-fixed tracking-wide">MEMBER PORTAL</span>
            </div>
            <h1 className="font-headline-lg text-2xl md:text-3xl font-extrabold text-white">
              Welcome back, {firstName}!
            </h1>
            <p className="text-xs md:text-sm text-white/70 mt-1">
              {planName}
              {nextSession && <> &middot; Next session on {new Date(nextSession.session_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</>}
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/10 border border-white/20 rounded-2xl px-5 py-3 backdrop-blur-sm shrink-0">
            {profile?.avatar_url || user?.avatarUrl ? (
              <img
                src={profile?.avatar_url || user?.avatarUrl}
                alt="Profile"
                className="w-12 h-12 rounded-full object-cover ring-2 ring-secondary/50"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container font-bold text-lg ring-2 ring-secondary/50">
                {initials}
              </div>
            )}
            <div>
              <p className="font-bold text-white text-sm">{profile?.name || user?.name}</p>
              <p className="text-[11px] text-white/70">{profile?.member_id || "—"}</p>
            </div>
          </div>
        </div>
      </div>



      {/* ══ Tab Navigation ═══════════════════════════════════════════════════ */}
      <div className="w-full bg-surface-container-low p-1.5 rounded-2xl border border-outline-variant/30 flex gap-1 overflow-x-auto">
        {TABS.map(tab => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
                active ? "bg-secondary text-on-secondary shadow-sm" : "text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ══ Tab Content ═══════════════════════════════════════════════════════ */}
      {loading ? <Spinner /> : (
        <div className="space-y-6">

          {/* ── OVERVIEW ──────────────────────────────────────────────────── */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Next Session Snapshot */}
              <Card className="p-6">
                <SectionTitle icon="calendar_month" title="Next Session" />
                {nextSession ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-4 bg-surface-container-low rounded-2xl border border-outline-variant/30">
                      <div className="w-12 h-12 rounded-2xl bg-secondary-fixed flex flex-col items-center justify-center text-on-secondary-fixed shrink-0">
                        <p className="text-[10px] font-bold uppercase">{new Date(nextSession.session_date).toLocaleDateString("en-US", { month: "short" })}</p>
                        <p className="font-extrabold text-lg leading-none">{new Date(nextSession.session_date).getDate()}</p>
                      </div>
                      <div>
                        <p className="font-bold text-sm text-on-surface">{nextSession.session_type}</p>
                        <p className="text-xs text-on-surface-variant font-medium">
                          {nextSession.session_time?.length === 5
                            ? new Date(`2000-01-01T${nextSession.session_time}`).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
                            : nextSession.session_time}
                          {nextSession.trainer_name && ` · Coach ${nextSession.trainer_name}`}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab("sessions")}
                      className="w-full py-2.5 border border-secondary/40 text-secondary rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-secondary/10 transition-colors"
                    >
                      View All Sessions
                    </button>
                  </div>
                ) : (
                  <EmptyState msg="No upcoming sessions scheduled yet." />
                )}
              </Card>

              {/* Attendance Summary */}
              <Card className="p-6">
                <SectionTitle icon="event_available" title="Attendance Summary" />
                <div className="grid grid-cols-3 gap-3 mb-5">
                  <StatBadge label="This Month" value={`${thisMonthVisits} days`} color="green" />
                  <StatBadge label="Total Visits" value={attendance?.totalVisits ?? 0} color="blue" />
                  <StatBadge label="Rate" value={`${attendanceRate}%`} color="purple" />
                </div>
                <div>
                  <div className="flex justify-between text-[10px] font-bold text-on-surface-variant mb-1.5">
                    <span>Attendance Rate</span>
                    <span>{attendanceRate}%</span>
                  </div>
                  <ProgressBar value={attendanceRate} max={100} colorClass="bg-green-500" />
                </div>
                {attendance?.lastVisit && (
                  <p className="mt-3 text-[11px] text-on-surface-variant font-medium">
                    Last visit: <span className="font-bold text-on-surface">{attendance.lastVisit}</span>
                  </p>
                )}
              </Card>

              {/* Membership Plans CTA — spans full width */}
              <div className="lg:col-span-2">
                <div
                  onClick={onViewPlans}
                  className="cursor-pointer group flex flex-col sm:flex-row items-center justify-between gap-5 p-6 bg-gradient-to-r from-tertiary-container to-secondary/80 rounded-3xl border border-secondary/30 shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-white shrink-0">
                      <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>card_membership</span>
                    </div>
                    <div>
                      <p className="font-extrabold text-white text-base">View Membership Plans</p>
                      <p className="text-white/70 text-xs mt-0.5 font-medium">
                        Currently on <span className="font-bold text-white">{profile?.plan || "—"}</span> Plan &middot; Explore upgrades or request a plan change
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-white/20 border border-white/30 text-white px-5 py-2.5 rounded-2xl text-xs font-bold shrink-0 group-hover:bg-white/30 transition-colors">
                    <span>Browse Plans</span>
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ── WORKOUT PLAN ───────────────────────────────────────────────── */}
          {activeTab === "workout" && (
            <Card className="p-6 md:p-8">
              <SectionTitle icon="fitness_center" title="My Workout Plans" badge={workoutPlans.length} />
              {workoutPlans.length === 0 ? (
                <EmptyState msg="No workout plans assigned yet. Your trainer will create one for you." />
              ) : (
                <div className="space-y-5">
                  {workoutPlans.map((plan, idx) => (
                    <div key={plan.id} className={`rounded-2xl border p-5 ${idx === 0 ? "border-secondary/40 bg-secondary/5" : "border-outline-variant/30 bg-surface-container-low"}`}>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            {idx === 0 && <span className="text-[9px] font-bold bg-secondary text-on-secondary px-2 py-0.5 rounded-full uppercase tracking-wide">Current</span>}
                            <h3 className="font-bold text-sm text-on-surface">{plan.plan_name}</h3>
                          </div>
                          <p className="text-[11px] text-on-surface-variant">
                            Goal: <span className="font-semibold text-secondary">{plan.goal}</span>
                          </p>
                        </div>
                        <p className="text-[10px] text-on-surface-variant font-medium">
                          {new Date(plan.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                      </div>

                      {plan.exercises && (
                        <div className="mt-3 pt-3 border-t border-outline-variant/20">
                          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Exercises &amp; Schedule</p>
                          <div className="overflow-hidden rounded-xl border border-outline-variant/30">
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="bg-surface-container text-on-surface-variant">
                                  <th className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest">Exercise</th>
                                  <th className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest">Details</th>
                                </tr>
                              </thead>
                              <tbody>
                                {plan.exercises.split("\n").filter(l => l.trim()).map((line, i) => {
                                  const hasColon = line.includes(":");
                                  const parts = hasColon ? line.split(":").map(s => s.trim()) : [line];
                                  return (
                                    <tr key={i} className="border-t border-outline-variant/20 hover:bg-surface-container/30 transition-colors">
                                      <td className="px-4 py-3 font-semibold text-on-surface" colSpan={hasColon ? 1 : 2}>{parts[0]}</td>
                                      {hasColon && <td className="px-4 py-3 text-on-surface-variant">{parts[1] || "—"}</td>}
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {/* ── UPCOMING SESSIONS ──────────────────────────────────────────── */}
          {activeTab === "sessions" && (
            <Card className="p-6 md:p-8">
              <SectionTitle icon="calendar_month" title="Upcoming Sessions" badge={sessions.length} />
              {sessions.length === 0 ? (
                <EmptyState msg="No upcoming sessions scheduled for you." />
              ) : (
                <div className="overflow-hidden rounded-2xl border border-outline-variant/30">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-surface-container text-on-surface-variant">
                        <th className="text-left px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest">Date</th>
                        <th className="text-left px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest">Time</th>
                        <th className="text-left px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest">Session</th>
                        <th className="text-left px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest">Trainer</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sessions.map((s, i) => (
                        <tr key={s.id ?? i} className="border-t border-outline-variant/20 hover:bg-surface-container/30 transition-colors">
                          <td className="px-5 py-4 font-bold text-on-surface text-xs">
                            {new Date(s.session_date).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                          </td>
                          <td className="px-5 py-4 font-bold text-secondary text-xs">
                            {s.session_time?.length === 5
                              ? new Date(`2000-01-01T${s.session_time}`).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
                              : s.session_time}
                          </td>
                          <td className="px-5 py-4">
                            <span className="px-2.5 py-1 bg-secondary-fixed text-on-secondary-fixed rounded-full text-[10px] font-bold">{s.session_type}</span>
                          </td>
                          <td className="px-5 py-4 text-on-surface-variant text-xs font-medium">
                            {s.trainer_name ? `Coach ${s.trainer_name}` : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          )}

          {/* ── PROGRESS ───────────────────────────────────────────────────── */}
          {activeTab === "progress" && (
            <div className="space-y-6">
              <Card className="p-6 md:p-8">
                <SectionTitle icon="trending_up" title="Fitness Progress" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <StatBadge label="Visits This Month" value={`${thisMonthVisits}`} color="green" />
                  <StatBadge label="Total Check-ins" value={attendance?.totalVisits ?? 0} color="blue" />
                  <StatBadge label="Attendance Rate" value={`${attendanceRate}%`} color="purple" />
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-bold text-on-surface-variant mb-1.5">
                      <span>Monthly Attendance</span>
                      <span className="text-on-surface">{thisMonthVisits} / 26 days</span>
                    </div>
                    <ProgressBar value={thisMonthVisits} max={26} colorClass="bg-green-500" />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-bold text-on-surface-variant mb-1.5">
                      <span>Workout Plans Assigned</span>
                      <span className="text-on-surface">{workoutPlans.length} plans</span>
                    </div>
                    <ProgressBar value={workoutPlans.length} max={Math.max(workoutPlans.length, 5)} colorClass="bg-secondary" />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-bold text-on-surface-variant mb-1.5">
                      <span>Upcoming Sessions</span>
                      <span className="text-on-surface">{sessions.length} scheduled</span>
                    </div>
                    <ProgressBar value={sessions.length} max={Math.max(sessions.length, 10)} colorClass="bg-blue-500" />
                  </div>
                </div>
              </Card>

              {/* Workout Goal Highlight */}
              {latestPlan && (
                <Card className="p-6 md:p-8">
                  <SectionTitle icon="flag" title="Current Goal" />
                  <div className="flex items-center gap-4 p-4 bg-surface-container-low rounded-2xl border border-outline-variant/30">
                    <div className="w-14 h-14 rounded-2xl bg-secondary-fixed flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-2xl text-on-secondary-fixed" style={{ fontVariationSettings: "'FILL' 1" }}>target</span>
                    </div>
                    <div>
                      <p className="font-extrabold text-base text-on-surface">{latestPlan.goal}</p>
                      <p className="text-xs text-on-surface-variant font-medium mt-0.5">via <span className="font-semibold">{latestPlan.plan_name}</span></p>
                      <span className="inline-block mt-1.5 text-[10px] font-bold bg-green-100 text-green-700 border border-green-200 px-2.5 py-0.5 rounded-full">On Track</span>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )}

        </div>
      )}



    </div>
  );
};
