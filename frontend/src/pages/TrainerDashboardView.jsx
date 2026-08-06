import { useGym } from "../services/GymContext";
import { useState, useEffect, useCallback, useRef } from "react";

const Card = ({ children, className = "" }) => (
  <div className={`bg-surface-container-lowest rounded-3xl border border-outline-variant/30 card-shadow ${className}`}>
    {children}
  </div>
);

const SectionHeader = ({ icon, title }) => (
  <div className="flex items-center gap-2 mb-4">
    <span className="material-symbols-outlined text-secondary text-xl">{icon}</span>
    <h2 className="font-headline-md text-base font-bold text-on-surface">{title}</h2>
  </div>
);

const Spinner = () => (
  <div className="flex justify-center items-center py-12">
    <div className="w-8 h-8 rounded-full border-4 border-secondary/30 border-t-secondary animate-spin" />
  </div>
);

/* ─── Typeahead Multi-Selector for Trainees ────────────────────────────────── */
const TraineeMultiSelect = ({ trainees, selectedList, onChange, placeholder = "Type Client Name or ID..." }) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = trainees.filter(t => {
    const isAlreadySelected = selectedList.some(s => s.member_id === t.id);
    if (isAlreadySelected) return false;
    const searchStr = `${t.name} ${t.member_id || ""}`.toLowerCase();
    return searchStr.includes(query.toLowerCase());
  });

  const toggleMember = (t) => {
    const isAlreadySelected = selectedList.some(s => s.member_id === t.id);
    if (isAlreadySelected) {
      onChange(selectedList.filter(s => s.member_id !== t.id));
    } else {
      onChange([...selectedList, { member_id: t.id, member_name: t.name }]);
    }
    setQuery("");
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="flex flex-wrap gap-1.5 p-2 bg-surface-container-low rounded-2xl border border-outline-variant/40 min-h-[46px]">
        {selectedList.map((m) => (
          <span key={m.member_id} className="inline-flex items-center gap-1 bg-secondary text-on-secondary px-2.5 py-1 rounded-xl text-xs font-bold shadow-xs">
            {m.member_name}
            <button
              type="button"
              onClick={() => onChange(selectedList.filter(s => s.member_id !== m.member_id))}
              className="hover:text-red-200 focus:outline-none flex items-center"
            >
              <span className="material-symbols-outlined text-xs">close</span>
            </button>
          </span>
        ))}
        <input
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          placeholder={selectedList.length === 0 ? placeholder : ""}
          className="flex-1 bg-transparent text-on-surface text-sm px-2 py-1 focus:outline-none font-semibold min-w-[120px]"
        />
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-2 max-h-56 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-xl overflow-y-auto z-50 py-2">
          {filtered.length === 0 ? (
            <div className="px-4 py-3 text-xs text-on-surface-variant/60 font-medium">
              No matching clients in your roster.
            </div>
          ) : (
            filtered.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => toggleMember(t)}
                className="w-full text-left px-4 py-2.5 text-xs font-semibold text-on-surface hover:bg-surface-container-low transition-colors flex items-center justify-between"
              >
                <span>{t.name}</span>
                <span className="text-[10px] text-secondary font-bold">{t.member_id}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

/* ─── Typeahead Search Selector for Trainees ────────────────────────────────── */
const TraineeSelect = ({ trainees, selectedId, onChange, placeholder = "Type Client Name or ID..." }) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Sync initial label
  useEffect(() => {
    if (selectedId) {
      const match = trainees.find(t => t.id === selectedId);
      if (match) {
        setQuery(`${match.name} (${match.member_id || "#FZ"})`);
      }
    } else {
      setQuery("");
    }
  }, [selectedId, trainees]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        // Reset query back to actual selection label if not matched
        const match = trainees.find(t => t.id === selectedId);
        setQuery(match ? `${match.name} (${match.member_id || "#FZ"})` : "");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selectedId, trainees]);

  const filtered = trainees.filter(t => {
    const searchStr = `${t.name} ${t.member_id || ""}`.toLowerCase();
    return searchStr.includes(query.toLowerCase());
  });

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            if (!e.target.value) {
              onChange("");
            }
          }}
          placeholder={placeholder}
          className="w-full bg-surface-container-low text-on-surface text-sm pl-4 pr-10 py-3 rounded-2xl border border-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-secondary/50 font-semibold transition-all"
        />
        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline text-lg pointer-events-none">
          arrow_drop_down
        </span>
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-2 max-h-56 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-xl overflow-y-auto z-50 py-2">
          {filtered.length === 0 ? (
            <div className="px-4 py-3 text-xs text-on-surface-variant/60 font-medium">
              No matching clients in your roster.
            </div>
          ) : (
            filtered.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  onChange(t.id);
                  setQuery(`${t.name} (${t.member_id || "#FZ"})`);
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-2.5 text-xs font-semibold text-on-surface hover:bg-surface-container-low transition-colors flex items-center justify-between"
              >
                <span>{t.name}</span>
                <span className="text-[10px] text-secondary font-bold">{t.member_id}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export const TrainerDashboardView = () => {
  const {
    user,
    attendanceRecords,
    checkInMember,
    fetchWorkoutPlans,
    createWorkoutPlan,
    deleteWorkoutPlan,
    fetchSchedule,
    createScheduleSession,
    deleteScheduleSession,
    apiFetch,
    addToast
  } = useGym();

  // ─── Active Tab ────────────────────────────────────────────────────────────
  const [activeActionTab, setActiveActionTab] = useState("plans");

  // ─── Roster and Global Search States ────────────────────────────────────────
  const [roster, setRoster] = useState([]);
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [globalSearchVal, setGlobalSearchVal] = useState("");
  const [globalResults, setGlobalResults] = useState([]);
  const [searchingGlobal, setSearchingGlobal] = useState(false);

  // ─── Backend-connected State ───────────────────────────────────────────────
  const [workoutPlans, setWorkoutPlans] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [loadingSchedule, setLoadingSchedule] = useState(false);

  // ─── Create Workout Plan Form ──────────────────────────────────────────────
  const [selectedPlanMembers, setSelectedPlanMembers] = useState([]); // Array of {member_id, member_name}
  const [workoutPlanName, setWorkoutPlanName] = useState("");
  const [workoutGoal, setWorkoutGoal] = useState("");
  const [exercisesText, setExercisesText] = useState("");
  const [submittingPlan, setSubmittingPlan] = useState(false);

  // ─── Edit Workout Plan States ──────────────────────────────────────────────
  const [editingPlan, setEditingPlan] = useState(null); // The plan object currently being edited
  const [editPlanMembers, setEditPlanMembers] = useState([]);
  const [editPlanName, setEditPlanName] = useState("");
  const [editGoal, setEditGoal] = useState("");
  const [editExercises, setEditExercises] = useState("");
  const [submittingEdit, setSubmittingEdit] = useState(false);

  // ─── Attendance Form ───────────────────────────────────────────────────────
  const [searchMemberIdOrName, setSearchMemberIdOrName] = useState("");
  const [attendanceError, setAttendanceError] = useState("");
  const [attendanceSuccess, setAttendanceSuccess] = useState("");
  const [submittingAttendance, setSubmittingAttendance] = useState(false);

  // ─── Schedule Form ─────────────────────────────────────────────────────────
  const [scheduleDate, setScheduleDate] = useState(new Date().toISOString().split("T")[0]);
  const [scheduleTime, setScheduleTime] = useState("");
  const [selectedScheduleMemberId, setSelectedScheduleMemberId] = useState("");
  const [scheduleSessionType, setScheduleSessionType] = useState("Strength Training");
  const [submittingSchedule, setSubmittingSchedule] = useState(false);

  const trainerId = user?.id;

  // ─── Load Trainees Roster ──────────────────────────────────────────────────
  const loadRoster = useCallback(async () => {
    if (!trainerId) return;
    setLoadingRoster(true);
    const data = await apiFetch("/api/trainer_roster.php?action=list");
    if (Array.isArray(data)) {
      setRoster(data);
    }
    setLoadingRoster(false);
  }, [trainerId, apiFetch]);

  // ─── Search Global Active Members ──────────────────────────────────────────
  const handleGlobalSearch = async (val) => {
    setGlobalSearchVal(val);
    if (val.trim().length < 1) {
      setGlobalResults([]);
      return;
    }
    setSearchingGlobal(true);
    const res = await apiFetch(`/api/trainer_roster.php?action=search_global&q=${encodeURIComponent(val)}`);
    if (Array.isArray(res)) {
      setGlobalResults(res);
    }
    setSearchingGlobal(false);
  };

  // ─── Add Trainee to Roster ────────────────────────────────────────────────
  const handleAddToRoster = async (memberId) => {
    const res = await apiFetch("/api/trainer_roster.php", {
      method: "POST",
      body: JSON.stringify({ member_id: memberId })
    });
    if (res?.success) {
      addToast("Client Recruited", "Athlete has been successfully added to your Trainees Roster.", "success");
      setGlobalSearchVal("");
      setGlobalResults([]);
      loadRoster();
    } else {
      addToast("Roster Update Failed", res?.message || "Failed to add athlete to roster.", "error");
    }
  };

  // ─── Remove Trainee from Roster ───────────────────────────────────────────
  const handleRemoveFromRoster = async (memberId) => {
    const res = await apiFetch(`/api/trainer_roster.php?member_id=${memberId}`, {
      method: "DELETE"
    });
    if (res?.success) {
      addToast("Client Removed", "Athlete removed from your Trainees Roster.", "info");
      loadRoster();
    } else {
      addToast("Roster Update Failed", "Failed to remove client.", "error");
    }
  };

  // ─── Load Plans and Schedule ──────────────────────────────────────────────
  const loadPlans = useCallback(async () => {
    if (!trainerId) return;
    setLoadingPlans(true);
    const data = await fetchWorkoutPlans(trainerId);
    setWorkoutPlans(data);
    setLoadingPlans(false);
  }, [trainerId, fetchWorkoutPlans]);

  const loadSchedule = useCallback(async () => {
    if (!trainerId) return;
    setLoadingSchedule(true);
    const data = await fetchSchedule(trainerId);
    setSchedules(data);
    setLoadingSchedule(false);
  }, [trainerId, fetchSchedule]);

  useEffect(() => {
    loadRoster();
    loadPlans();
    loadSchedule();
  }, [loadRoster, loadPlans, loadSchedule]);

  // ─── Submit Handlers ──────────────────────────────────────────────────────
  const validateWorkoutFormat = (text) => {
    if (!text.trim()) return true;
    const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
    for (let line of lines) {
      if (!line.includes(":")) {
        return false;
      }
    }
    return true;
  };

  const handleCreateWorkoutPlan = async (e) => {
    e.preventDefault();
    if (selectedPlanMembers.length === 0 || !workoutPlanName || !workoutGoal) {
      addToast("Input Required", "Please select at least one member, goal, and plan name.", "error");
      return;
    }
    if (!validateWorkoutFormat(exercisesText)) {
      addToast("Invalid Format", 'IMPORTANT: Ensure to use "Exercise name : Details" format. Each exercise must be on a new line and contain a colon (:).', "error");
      return;
    }
    setSubmittingPlan(true);

    const res = await createWorkoutPlan({
      trainer_id: trainerId,
      members: selectedPlanMembers,
      plan_name: workoutPlanName,
      goal: workoutGoal,
      exercises: exercisesText,
    });

    if (res?.success) {
      setWorkoutPlanName("");
      setWorkoutGoal("");
      setExercisesText("");
      setSelectedPlanMembers([]);
      await loadPlans();
    }
    setSubmittingPlan(false);
  };

  const handleEditClick = (plan) => {
    setEditingPlan(plan);
    setEditPlanName(plan.plan_name);
    setEditGoal(plan.goal);
    setEditExercises(plan.exercises || "");
    setEditPlanMembers(plan.members || []);
  };

  const handleUpdateWorkoutPlan = async (e) => {
    e.preventDefault();
    if (!editingPlan || !editPlanName || !editGoal || editPlanMembers.length === 0) {
      addToast("Input Required", "Please ensure plan details and at least one member are present.", "error");
      return;
    }
    if (!validateWorkoutFormat(editExercises)) {
      addToast("Invalid Format", 'IMPORTANT: Ensure to use "Exercise name : Details" format. Each exercise must be on a new line and contain a colon (:).', "error");
      return;
    }
    setSubmittingEdit(true);

    const res = await apiFetch(`/api/workout_plans.php?action=update`, {
      method: "POST",
      body: JSON.stringify({
        id: editingPlan.id,
        trainer_id: trainerId,
        plan_name: editPlanName,
        goal: editGoal,
        exercises: editExercises,
        members: editPlanMembers
      })
    });

    if (res?.success) {
      addToast("Plan Updated", "Workout plan changes saved successfully.", "success");
      setEditingPlan(null);
      await loadPlans();
    } else {
      addToast("Error", res?.message || "Failed to update workout plan.", "error");
    }
    setSubmittingEdit(false);
  };

  const handleDeletePlan = async (id) => {
    const ok = await deleteWorkoutPlan(id);
    if (ok) await loadPlans();
  };

  const handleMarkAttendance = async (e) => {
    e.preventDefault();
    setAttendanceError("");
    setAttendanceSuccess("");
    if (!searchMemberIdOrName.trim()) return;
    setSubmittingAttendance(true);

    const match = roster.find(
      (m) =>
        m.name.toLowerCase() === searchMemberIdOrName.trim().toLowerCase() ||
        m.member_id.toLowerCase() === searchMemberIdOrName.trim().toLowerCase() ||
        m.id === searchMemberIdOrName.trim()
    );

    if (!match) {
      setAttendanceError("This athlete is not assigned to your trainees roster. Please recruit them first.");
      setSubmittingAttendance(false);
      return;
    }

    const success = await checkInMember(match.member_id, "trainer");
    if (success) {
      setAttendanceSuccess(`Successfully logged gym check-in for: ${match.name}`);
      setSearchMemberIdOrName("");
    } else {
      setAttendanceError("Failed to record check-in.");
    }
    setSubmittingAttendance(false);
  };

  const handleAddSchedule = async (e) => {
    e.preventDefault();
    if (!scheduleTime || !selectedScheduleMemberId) return;
    setSubmittingSchedule(true);

    const selectedMember = roster.find((m) => m.id === selectedScheduleMemberId);
    const res = await createScheduleSession({
      trainer_id: trainerId,
      session_date: scheduleDate,
      session_time: scheduleTime,
      member_name: selectedMember?.name || selectedScheduleMemberId,
      session_type: scheduleSessionType,
    });

    if (res?.success) {
      setScheduleTime("");
      setSelectedScheduleMemberId("");
      setScheduleDate(new Date().toISOString().split("T")[0]);
      await loadSchedule();
    }
    setSubmittingSchedule(false);
  };

  const handleDeleteSchedule = async (id) => {
    const ok = await deleteScheduleSession(id);
    if (ok) await loadSchedule();
  };

  // ─── Computed values ───────────────────────────────────────────────────────
  const trainerName = user?.name || "Trainer";
  const firstName = trainerName.split(" ")[0];

  const initials = trainerName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  const todayStr = new Date().toISOString().split("T")[0];
  const todaySchedules = schedules.filter((s) => s.session_date === todayStr);

  return (
    <div className="space-y-6 animate-fade-in pb-12">

      {/* ══ Welcome Banner ══════════════════════════════════════════ */}
      <div className="bg-tertiary-container rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 bottom-0 w-2/5 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-secondary/30 via-transparent to-transparent pointer-events-none" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "repeating-linear-gradient(45deg, currentColor 0, currentColor 1px, transparent 0, transparent 50%)", backgroundSize: "12px 12px" }}
        />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container/30 border border-secondary/40 mb-3">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span className="text-xs font-bold text-secondary-fixed tracking-wide">TRAINER PORTAL</span>
            </div>
            <h1 className="font-headline-lg text-2xl md:text-3xl font-extrabold text-white">
              Welcome, Coach {firstName}!
            </h1>
            <p className="text-xs md:text-sm text-surface-container-high/80 mt-1">
              {todaySchedules.length} sessions scheduled today
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/10 border border-white/20 rounded-2xl px-5 py-3 backdrop-blur-sm shrink-0">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={trainerName}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-secondary/50"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container font-bold text-lg ring-2 ring-secondary/50">
                {initials}
              </div>
            )}
            <div>
              <p className="font-bold text-white text-sm">{trainerName}</p>
              <p className="text-[11px] text-white/70">Fitness Trainer</p>
            </div>
          </div>
        </div>
      </div>

      {/* ══ Stat Cards ══════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">My Trainees Roster</p>
              <p className="font-headline-lg text-3xl font-extrabold text-on-surface">{roster.length}</p>
            </div>
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-blue-50 text-blue-600">
              <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>group</span>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">Today's Sessions</p>
              <p className="font-headline-lg text-3xl font-extrabold text-on-surface">{todaySchedules.length}</p>
            </div>
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-secondary-fixed text-on-secondary-fixed">
              <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>calendar_today</span>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">Active Plans</p>
              <p className="font-headline-lg text-3xl font-extrabold text-on-surface">{workoutPlans.length}</p>
            </div>
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-amber-50 text-amber-600">
              <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>edit_note</span>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">Today's Checkins</p>
              <p className="font-headline-lg text-3xl font-extrabold text-on-surface">
                {(() => {
                  const rosterMemberIds = roster.map(m => m.member_id || m.memberId);
                  return attendanceRecords.filter(r => rosterMemberIds.includes(r.member_id)).length;
                })()}
              </p>
            </div>
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-green-50 text-green-600">
              <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>how_to_reg</span>
            </div>
          </div>
        </Card>
      </div>

      {/* ══ Action Tabs Navigation ═══════════════════════════════════ */}
      <div className="w-full bg-surface-container-low p-1.5 rounded-2xl border border-outline-variant/30 flex gap-1">
        {[
          { id: "plans", label: "Workout Plans", icon: "add_circle" },
          { id: "roster", label: "Trainees Roster", icon: "group" },
          { id: "attendance", label: "Mark Attendance", icon: "how_to_reg" },
          { id: "schedule", label: "View Schedule", icon: "calendar_month" }
        ].map((tab) => {
          const isSelected = activeActionTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveActionTab(tab.id)}
              className={`flex-1 py-3 px-4 rounded-xl text-center text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                isSelected
                  ? "bg-secondary text-on-secondary shadow-sm"
                  : "text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: isSelected ? "'FILL' 1" : "'FILL' 0" }}>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ══ Tab Contents Container ══════════════════════════════════ */}
      <div className="w-full space-y-6">

        {/* TAB 1: CREATE WORKOUT PLAN */}
        {activeActionTab === "plans" && (
          <Card className="p-6 md:p-8">
            <SectionHeader icon="add_circle" title="Create Workout Plan" />
            <form onSubmit={handleCreateWorkoutPlan} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="md:col-span-1">
                  <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                    Assign Trainees
                  </label>
                  <TraineeMultiSelect
                    trainees={roster}
                    selectedList={selectedPlanMembers}
                    onChange={setSelectedPlanMembers}
                    placeholder="Add trainees to plan..."
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                    Fitness Goal
                  </label>
                  <input
                    type="text"
                    required
                    value={workoutGoal}
                    onChange={(e) => setWorkoutGoal(e.target.value)}
                    placeholder="e.g. Weight Loss, Muscle Gain"
                    className="w-full bg-surface-container-low text-on-surface text-sm px-4 py-3.5 rounded-2xl border border-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-secondary/50 font-semibold transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                    Plan Name
                  </label>
                  <input
                    type="text"
                    required
                    value={workoutPlanName}
                    onChange={(e) => setWorkoutPlanName(e.target.value)}
                    placeholder="e.g. 5-Day Hypertrophy Routine"
                    className="w-full bg-surface-container-low text-on-surface text-sm px-4 py-3.5 rounded-2xl border border-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-secondary/50 font-semibold transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                  Exercises &amp; Schedule Instructions
                </label>
                <div className="text-[10px] text-secondary font-bold mb-2">
                  IMPORTANT: Ensure to use "Exercise name : Details" format.
                </div>
                <textarea
                  required
                  rows={5}
                  value={exercisesText}
                  onChange={(e) => setExercisesText(e.target.value)}
                  placeholder={"Squats: 3 sets of 10 reps\nHeavy Lifting: Monday & Wednesday\nCardio HIIT: Tuesday 20 mins"}
                  className="w-full bg-surface-container-low text-on-surface text-sm px-4 py-3 rounded-2xl border border-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-secondary/50 font-medium font-sans transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={submittingPlan}
                className="w-full py-3 bg-secondary text-on-secondary rounded-2xl font-headline-md text-xs font-bold flex items-center justify-center gap-2 hover:bg-secondary/90 transition-all shadow-md disabled:opacity-60"
              >
                {submittingPlan ? (
                  <><div className="w-4 h-4 rounded-full border-2 border-on-secondary/40 border-t-on-secondary animate-spin" /> Saving...</>
                ) : (
                  <><span className="material-symbols-outlined text-lg">add_circle</span>Create Workout Plan</>
                )}
              </button>
            </form>

            {/* Workout Plans List */}
            <div className="mt-10 border-t border-outline-variant/20 pt-8">
              <div className="flex items-center gap-2 mb-5">
                <span className="material-symbols-outlined text-secondary text-lg">list_alt</span>
                <h3 className="font-bold text-sm text-on-surface">Saved Workout Plans</h3>
                <span className="ml-auto text-[10px] bg-secondary-fixed text-on-secondary-fixed px-2 py-0.5 rounded-full font-bold">{workoutPlans.length}</span>
              </div>

              {loadingPlans ? <Spinner /> : workoutPlans.length === 0 ? (
                <div className="text-center py-12 text-on-surface-variant/60 text-xs font-medium bg-surface-container-low rounded-2xl border border-dashed border-outline-variant/40">
                  No workout plans created yet. Use the form above to add one.
                </div>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-outline-variant/30">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-surface-container text-on-surface-variant">
                        <th className="text-left px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest">Assigned Members</th>
                        <th className="text-left px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest">Plan Name</th>
                        <th className="text-left px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest">Goal</th>
                        <th className="text-left px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest hidden md:table-cell">Created</th>
                        <th className="px-5 py-3.5 text-right" />
                      </tr>
                    </thead>
                    <tbody>
                      {workoutPlans.map((p) => {
                        const mList = Array.isArray(p.members) ? p.members : [];
                        return (
                          <tr key={p.id} className="border-t border-outline-variant/20 hover:bg-surface-container/30 transition-colors">
                            <td className="px-5 py-4 font-semibold text-on-surface text-xs max-w-[200px]">
                              <div className="flex flex-wrap gap-1">
                                {mList.length === 0 ? (
                                  <span className="text-on-surface-variant/60">No members</span>
                                ) : (
                                  mList.map((m) => (
                                    <span key={m.member_id} className="bg-surface-container px-2 py-0.5 text-[10px] font-bold rounded-md border border-outline-variant/25">
                                      {m.member_name}
                                    </span>
                                  ))
                                )}
                              </div>
                            </td>
                            <td className="px-5 py-4 text-on-surface font-bold text-xs">{p.plan_name}</td>
                            <td className="px-5 py-4">
                              <span className="px-2.5 py-1 bg-secondary-fixed text-on-secondary-fixed rounded-full text-[10px] font-bold">{p.goal}</span>
                            </td>
                            <td className="px-5 py-4 text-on-surface-variant text-xs font-medium hidden md:table-cell">
                              {new Date(p.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </td>
                            <td className="px-5 py-4 text-right space-x-2">
                              <button
                                onClick={() => handleEditClick(p)}
                                className="text-[10px] font-bold text-secondary border border-secondary/20 px-3 py-1.5 rounded-xl hover:bg-secondary/10 transition-colors"
                              >
                                Edit / Members
                              </button>
                              <button
                                onClick={() => handleDeletePlan(p.id)}
                                className="text-[10px] font-bold text-error border border-error/20 px-3 py-1.5 rounded-xl hover:bg-error/10 transition-colors"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* TAB 2: ROSTER LIST & RECRUITING */}
        {activeActionTab === "roster" && (
          <Card className="p-6 md:p-8">
            <SectionHeader icon="group" title="My Trainees Roster" />
            <div className="mb-6 max-w-md relative">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-lg">search</span>
              <input
                type="text"
                value={globalSearchVal}
                onChange={(e) => handleGlobalSearch(e.target.value)}
                placeholder="Recruit athletes (search active members by Name or ID)..."
                className="w-full bg-surface-container-low text-on-surface text-sm pl-11 pr-4 py-3 rounded-2xl border border-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-secondary/50 font-semibold transition-all"
              />
              
              {/* Search Results Dropdown Overlay */}
              {globalSearchVal.trim().length > 0 && (
                <div className="absolute left-0 right-0 mt-2 bg-surface-container-lowest border border-outline-variant/40 rounded-2xl shadow-lg z-30 max-h-60 overflow-y-auto p-2 space-y-1">
                  {searchingGlobal ? (
                    <div className="py-4 text-center text-xs text-on-surface-variant/60">Searching...</div>
                  ) : globalResults.length === 0 ? (
                    <div className="py-4 text-center text-xs text-on-surface-variant/60">No new active members found.</div>
                  ) : (
                    globalResults.map((r) => (
                      <div key={r.id} className="flex items-center justify-between p-2 hover:bg-surface-container-low rounded-xl transition-all">
                        <div>
                          <p className="text-xs font-bold text-on-surface">{r.name}</p>
                          <p className="text-[10px] text-on-surface-variant">{r.member_id} &bull; {r.email}</p>
                        </div>
                        <button
                          onClick={() => handleAddToRoster(r.id)}
                          className="px-3 py-1 bg-secondary text-on-secondary text-[10px] font-bold rounded-lg hover:bg-secondary/90 transition-all flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-xs">add</span>Recruit
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {loadingRoster ? <Spinner /> : roster.length === 0 ? (
              <div className="text-center py-12 text-on-surface-variant/60 text-xs font-medium bg-surface-container-low rounded-2xl border border-dashed border-outline-variant/40">
                Your roster is empty. Use the search field above to recruit athletes.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {roster.map((r) => {
                  const dynamicInitials = r.name ? r.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "M";
                  return (
                    <div key={r.id} className="p-4 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest hover:shadow-sm transition-all flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        {r.avatar_url ? (
                          <img
                            src={r.avatar_url}
                            alt={r.name}
                            className="w-10 h-10 rounded-xl object-cover"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary font-bold text-sm">
                            {dynamicInitials}
                          </div>
                        )}
                        <div>
                          <p className="text-xs font-bold text-on-surface">{r.name}</p>
                          <p className="text-[10px] text-on-surface-variant">{r.member_id} &bull; {r.gender}</p>
                          <span className="px-2 py-0.5 bg-surface-container text-on-surface-variant rounded-md text-[9px] font-bold border border-outline-variant/20">{r.plan}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveFromRoster(r.id)}
                        className="p-1.5 text-error/30 hover:text-error hover:bg-error/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <span className="material-symbols-outlined text-lg">group_remove</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        )}

        {/* TAB 3: LOG SESSION ATTENDANCE */}
        {activeActionTab === "attendance" && (
          <Card className="p-6 md:p-8">
            <SectionHeader icon="how_to_reg" title="Log Client Coaching Attendance" />
            <p className="text-xs text-on-surface-variant font-medium mb-6">Record today's physical training session attendance for athletes assigned to your roster.</p>
            
            <form onSubmit={handleMarkAttendance} className="space-y-4 max-w-xl">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Athlete Name or Member ID</label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      required
                      value={searchMemberIdOrName}
                      onChange={(e) => setSearchMemberIdOrName(e.target.value)}
                      placeholder="Search roster clients by name or Member ID..."
                      className="w-full bg-surface-container-low text-on-surface text-sm px-4 py-3 rounded-2xl border border-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-secondary/50 font-semibold transition-all"
                    />
                    
                    {/* Local Roster Dropdown Filter */}
                    {searchMemberIdOrName.trim().length > 0 && !roster.some(t => t.name === searchMemberIdOrName) && (
                      <div className="absolute left-0 right-0 mt-2 bg-surface-container-lowest border border-outline-variant/40 rounded-2xl shadow-lg z-30 max-h-40 overflow-y-auto p-1 space-y-0.5">
                        {roster.filter(t => {
                          const searchStr = `${t.name} ${t.member_id || ""}`.toLowerCase();
                          return searchStr.includes(searchMemberIdOrName.toLowerCase());
                        }).length === 0 ? (
                          <div className="px-4 py-2 text-xs text-on-surface-variant/60">No matching clients in roster.</div>
                        ) : (
                          roster.filter(t => {
                            const searchStr = `${t.name} ${t.member_id || ""}`.toLowerCase();
                            return searchStr.includes(searchMemberIdOrName.toLowerCase());
                          }).map((t) => (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => setSearchMemberIdOrName(t.name)}
                              className="w-full text-left px-4 py-2 text-xs font-semibold text-on-surface hover:bg-surface-container-low transition-colors flex items-center justify-between"
                            >
                              <span>{t.name}</span>
                              <span className="text-[10px] text-secondary">{t.member_id}</span>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={submittingAttendance}
                    className="px-6 bg-secondary text-on-secondary rounded-2xl text-xs font-bold hover:bg-secondary/90 transition-colors shadow-sm whitespace-nowrap disabled:opacity-60"
                  >
                    {submittingAttendance ? "Checking…" : "Check In"}
                  </button>
                </div>
              </div>

              {attendanceSuccess && (
                <p className="text-xs font-bold text-green-600 flex items-center gap-1.5 mt-2">
                  <span className="material-symbols-outlined text-base">check_circle</span>
                  {attendanceSuccess}
                </p>
              )}
              {attendanceError && (
                <p className="text-xs font-bold text-error flex items-center gap-1.5 mt-2">
                  <span className="material-symbols-outlined text-base">error</span>
                  {attendanceError}
                </p>
              )}
            </form>

            {(() => {
              const rosterMemberIds = roster.map(m => m.member_id || m.memberId);
              const trainerAttendanceRecords = attendanceRecords.filter(r => rosterMemberIds.includes(r.member_id));
              return (
                <div className="mt-10 border-t border-outline-variant/20 pt-8">
                  <div className="flex items-center gap-2 mb-5">
                    <span className="material-symbols-outlined text-secondary text-lg">calendar_today</span>
                    <h3 className="font-bold text-sm text-on-surface">Today's Check-ins</h3>
                    <span className="ml-auto text-[10px] bg-green-100 text-green-700 border border-green-200 px-2 py-0.5 rounded-full font-bold">
                      {trainerAttendanceRecords.length} present
                    </span>
                  </div>

                  {trainerAttendanceRecords.length === 0 ? (
                    <div className="text-center py-12 text-on-surface-variant/60 text-xs font-medium bg-surface-container-low rounded-2xl border border-dashed border-outline-variant/40">
                      No session attendance recorded today.
                    </div>
                  ) : (
                    <div className="overflow-hidden rounded-2xl border border-outline-variant/30">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-surface-container text-on-surface-variant">
                            <th className="text-left px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest">Member</th>
                            <th className="text-left px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest">Check-in Time</th>
                            <th className="text-left px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest">Date</th>
                            <th className="text-left px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {trainerAttendanceRecords.map((r, idx) => (
                            <tr key={idx} className="border-t border-outline-variant/20 hover:bg-surface-container/30 transition-colors">
                              <td className="px-5 py-4 font-semibold text-on-surface text-xs">{r.member_name}</td>
                              <td className="px-5 py-4 text-secondary font-bold text-xs">{r.time}</td>
                              <td className="px-5 py-4 text-on-surface-variant text-xs font-medium">{r.date}</td>
                              <td className="px-5 py-4">
                                <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold border ${
                                  r.status === "Active"
                                    ? "bg-green-50 text-green-700 border-green-200"
                                    : r.status === "Flagged"
                                    ? "bg-red-50 text-red-700 border-red-200"
                                    : "bg-amber-50 text-amber-700 border-amber-200"
                                }`}>
                                  {r.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })()}
          </Card>
        )}

        {/* TAB 4: VIEW SCHEDULE */}
        {activeActionTab === "schedule" && (
          <Card className="p-6 md:p-8">
            <SectionHeader icon="calendar_month" title="Scheduled Sessions" />
            <form onSubmit={handleAddSchedule} className="space-y-4 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Date</label>
                  <input
                    type="date"
                    required
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="w-full bg-surface-container-low text-on-surface text-sm px-4 py-3 rounded-2xl border border-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-secondary/50 font-semibold transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Time Slot</label>
                  <input
                    type="time"
                    required
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full bg-surface-container-low text-on-surface text-sm px-4 py-3 rounded-2xl border border-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-secondary/50 font-semibold transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Select Member from Trainees Roster</label>
                  <TraineeSelect
                    trainees={roster}
                    selectedId={selectedScheduleMemberId}
                    onChange={setSelectedScheduleMemberId}
                    placeholder="Search trainees by ID or Name..."
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Session Type</label>
                  <select
                    value={scheduleSessionType}
                    onChange={(e) => setScheduleSessionType(e.target.value)}
                    className="w-full bg-surface-container-low text-on-surface text-sm px-4 py-3 rounded-2xl border border-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-secondary/50 font-semibold transition-all"
                  >
                    <option value="Strength Training">Strength Training</option>
                    <option value="Cardio HIIT">Cardio HIIT</option>
                    <option value="Personal Training">Personal Training</option>
                    <option value="Yoga & Flexibility">Yoga &amp; Flexibility</option>
                    <option value="Weight Loss">Weight Loss</option>
                    <option value="Muscle Gain">Muscle Gain</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                disabled={submittingSchedule}
                className="w-full py-3 bg-secondary text-on-secondary rounded-2xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-secondary/90 transition-colors shadow-md disabled:opacity-60"
              >
                {submittingSchedule ? (
                  <><div className="w-4 h-4 rounded-full border-2 border-on-secondary/40 border-t-on-secondary animate-spin" /> Saving...</>
                ) : (
                  <><span className="material-symbols-outlined text-base">add</span>Add Schedule Session</>
                )}
              </button>
            </form>

            {loadingSchedule ? <Spinner /> : schedules.length === 0 ? (
              <div className="text-center py-12 text-on-surface-variant/60 text-xs font-medium bg-surface-container-low rounded-2xl border border-dashed border-outline-variant/40">
                No sessions scheduled. Use the form above to add one.
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-outline-variant/30">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-surface-container text-on-surface-variant">
                      <th className="text-left px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest">Date</th>
                      <th className="text-left px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest">Time</th>
                      <th className="text-left px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest">Member Name</th>
                      <th className="text-left px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest">Session</th>
                      <th className="px-5 py-3.5 text-right" />
                    </tr>
                  </thead>
                  <tbody>
                    {schedules.map((s) => (
                      <tr key={s.id} className="border-t border-outline-variant/20 hover:bg-surface-container/30 transition-colors">
                        <td className="px-5 py-4 text-on-surface-variant text-xs font-medium">
                          {new Date(s.session_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </td>
                        <td className="px-5 py-4 font-bold text-secondary text-xs">
                          {s.session_time.length === 5
                            ? new Date(`2000-01-01T${s.session_time}`).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
                            : s.session_time}
                        </td>
                        <td className="px-5 py-4 font-semibold text-on-surface text-xs">{s.member_name}</td>
                        <td className="px-5 py-4">
                          <span className="px-2.5 py-1 bg-secondary-fixed text-on-secondary-fixed rounded-full text-[10px] font-bold">{s.session_type}</span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => handleDeleteSchedule(s.id)}
                            className="text-[10px] font-bold text-error border border-error/20 px-3 py-1.5 rounded-xl hover:bg-error/10 transition-colors"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}

      </div>

      {/* ─── Edit Workout Plan Modal ────────────────────────────────────────── */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-6 md:p-8 w-full max-w-2xl shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-xl">edit_note</span>
                <h3 className="font-bold text-lg text-on-surface">Edit Workout Plan</h3>
              </div>
              <button
                onClick={() => setEditingPlan(null)}
                className="p-1 text-on-surface-variant hover:bg-surface-container rounded-lg transition-all"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleUpdateWorkoutPlan} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                    Plan Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editPlanName}
                    onChange={(e) => setEditPlanName(e.target.value)}
                    className="w-full bg-surface-container-low text-on-surface text-sm px-4 py-3 rounded-2xl border border-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-secondary/50 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                    Fitness Goal
                  </label>
                  <input
                    type="text"
                    required
                    value={editGoal}
                    onChange={(e) => setEditGoal(e.target.value)}
                    className="w-full bg-surface-container-low text-on-surface text-sm px-4 py-3 rounded-2xl border border-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-secondary/50 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Assigned Trainees
                </label>
                <TraineeMultiSelect
                  trainees={roster}
                  selectedList={editPlanMembers}
                  onChange={setEditPlanMembers}
                  placeholder="Assign trainees to this plan..."
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Exercises &amp; Instructions
                </label>
                <div className="text-[10px] text-secondary font-bold mb-2">
                  IMPORTANT: Ensure to use "Exercise name : Details" format.
                </div>
                <textarea
                  required
                  rows={4}
                  value={editExercises}
                  onChange={(e) => setEditExercises(e.target.value)}
                  className="w-full bg-surface-container-low text-on-surface text-sm px-4 py-3 rounded-2xl border border-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-secondary/50 font-medium font-sans"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-outline-variant/20">
                <button
                  type="button"
                  onClick={() => setEditingPlan(null)}
                  className="px-5 py-2.5 border border-outline-variant/40 text-on-surface-variant font-bold text-xs rounded-xl hover:bg-surface-container transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingEdit}
                  className="px-6 py-2.5 bg-secondary text-on-secondary font-bold text-xs rounded-xl hover:bg-secondary/90 transition-all flex items-center gap-1.5 disabled:opacity-60"
                >
                  {submittingEdit ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
