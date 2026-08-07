import { createContext, useContext, useState, useEffect } from "react";
const GymContext = createContext(void 0);
export const GymProvider = ({ children }) => {
  const [activeTab, setActiveTab] = useState("login");
  const [user, setUser] = useState({
    name: "",
    email: "",
    role: "",
    avatarUrl: "",
    isLoggedIn: false
  });
  const [members, setMembers] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [selectedAttendanceDate, setSelectedAttendanceDate] = useState(() => {
    const now = new Date();
    const month = now.toLocaleDateString("en-US", { month: "short" }); // "Aug"
    const day   = String(now.getDate()).padStart(2, "0");               // "06"
    const year  = now.getFullYear();                                     // 2026
    return `${month} ${day}, ${year}`;                                   // "Aug 06, 2026"
  });
  const [plans, setPlans] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [toasts, setToasts] = useState([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAddTrainerModalOpen, setIsAddTrainerModalOpen] = useState(false);
  const [isAddPlanModalOpen, setIsAddPlanModalOpen] = useState(false);
  const [assignPlanModalState, setAssignPlanModalState] = useState({ isOpen: false, plan: null });
  // Broadcast channel for cross-tab refresh signals
  const refreshChannel = new BroadcastChannel('gym-refresh');
  // Load any persisted counter value (default 0)
  const [refreshCounter, setRefreshCounter] = useState(() => {
    return Number(localStorage.getItem('gymRefreshCounter')) || 0;
  });

  const fetchNotifications = async () => {
    const res = await apiFetch("/api/notifications.php");
    if (res && !res.message) setNotifications(res);
  };
  const markNotificationsRead = async () => {
    const res = await apiFetch("/api/notifications.php?action=mark_read", { method: "POST" });
    if (res && res.success) {
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
    }
  };
  const addToast = (title, description, type = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, description, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4e3);
  };
  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };
const apiFetch = async (endpoint, options = {}) => {
  try {
    // Check if we're in development mode (React dev server)
    const isDev = window.location.port === "3000" || window.location.port === "3001";
    const base = isDev ? "http://localhost/backend" : "/backend";
    
    const method = (options.method || "GET").toUpperCase();
    const headers = method === "GET"
      ? { ...(options.headers || {}) }
      : { "Content-Type": "application/json", ...(options.headers || {}) };

    const response = await fetch(`${base}${endpoint}`, {
      ...options,
      credentials: "include",
      headers,
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("API fetch error:", error);
    return null;
  }
};
  const fetchInitialData = async () => {
    const fetchedMembers = await apiFetch("/api/members.php");
    if (fetchedMembers) setMembers(fetchedMembers);
    const fetchedTrainers = await apiFetch("/api/trainers.php");
    if (fetchedTrainers) setTrainers(fetchedTrainers);
    const fetchedPlans = await apiFetch("/api/plans.php");
    if (fetchedPlans) setPlans(fetchedPlans);
    const fetchedAttendance = await apiFetch("/api/attendance.php");
    if (fetchedAttendance) setAttendanceRecords(fetchedAttendance);
    fetchNotifications();
  };
  useEffect(() => {
      const checkLogin = async () => {
        const res = await apiFetch("/api/auth.php?action=status");
        if (res && res.isLoggedIn) {
          setUser(res.user);
          setActiveTab(res.user.role === "admin" ? "members" : res.user.role === "trainer" ? "trainer-dashboard" : "home");
          fetchInitialData();
        }
      };
      checkLogin();
    }, [refreshCounter]);

    // Listen for refresh broadcasts from other tabs
    useEffect(() => {
      const handler = e => {
        if (e.data?.counter !== undefined) {
          setRefreshCounter(e.data.counter);
        }
      };
      refreshChannel.addEventListener('message', handler);
      return () => refreshChannel.removeEventListener('message', handler);
    }, []);
  const login = async (email, password) => {
    const res = await apiFetch("/api/auth.php?action=login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
    if (res && res.success) {
      setUser(res.user);
      setActiveTab(res.user.role === "admin" ? "members" : res.user.role === "trainer" ? "trainer-dashboard" : "home");
      addToast("Welcome Back!", `Successfully logged in as ${res.user.role}.`, "success");
      fetchInitialData();
      return { ok: true };
    } else {
      const msg = res?.message || "Email or password is incorrect.";
      addToast("Login Failed", msg, "error");
      return { ok: false, message: msg };
    }
  };
  const registerMember = async (memberData) => {
    const res = await apiFetch("/api/auth.php?action=register_member", {
      method: "POST",
      body: JSON.stringify(memberData)
    });
    if (res && res.success) {
      addToast("Registration Successful", "Member registered. Awaiting admin activation.", "success");
      setActiveTab("login");
      return true;
    } else {
      addToast("Registration Failed", res?.message || "Could not register.", "error");
      return false;
    }
  };
  const registerTrainer = async (trainerData) => {
    const res = await apiFetch("/api/auth.php?action=register_trainer", {
      method: "POST",
      body: JSON.stringify(trainerData)
    });
    if (res && res.success) {
      addToast("Registration Successful", "Trainer registered. Awaiting admin activation.", "success");
      setActiveTab("login");
      return true;
    } else {
      addToast("Registration Failed", res?.message || "Could not register.", "error");
      return false;
    }
  };
  const logout = async () => {
    await apiFetch("/api/auth.php?action=logout");
    setUser({ name: "", email: "", role: "", avatarUrl: "", isLoggedIn: false });
    setActiveTab("login");
    addToast("Logged Out", "You have been safely logged out.", "info");
  };
  const addMember = async (memberData) => {
    const res = await apiFetch("/api/members.php", {
      method: "POST",
      body: JSON.stringify(memberData)
    });
    if (res && res.success) {
      addToast("Member Registered", `${memberData.name} has been added to FitZone!`, "success");
      fetchInitialData();
      setActiveTab("members");
    } else {
      addToast("Error", "Failed to register member.", "error");
    }
  };
  const updateMember = async (id, updated) => {
    const res = await apiFetch(`/api/members.php?id=${id}`, {
      method: "PUT",
      body: JSON.stringify(updated)
    });
    if (res && res.success) {
      addToast("Member Updated", "Changes saved successfully.", "info");
      fetchInitialData();
    } else {
      addToast("Error", "Failed to update member.", "error");
    }
  };
  const deleteMember = async (id) => {
    const res = await apiFetch(`/api/members.php?id=${id}`, {
      method: "DELETE"
    });
    if (res && res.success) {
      addToast("Member Removed", "Member deleted.", "info");
      fetchInitialData();
    } else {
      addToast("Error", "Failed to delete member.", "error");
    }
  };
  const checkInMember = async (memberNameOrId, checkedByRole = "admin") => {
    const res = await apiFetch(`/api/attendance.php?date=${selectedAttendanceDate}`, {
      method: "POST",
      body: JSON.stringify({ memberNameOrId, checked_by_role: checkedByRole })
    });
    if (res && res.success) {
      addToast(
        "Check-in Successful",
        `${res.record.memberName} checked in at ${res.record.time}`,
        "success"
      );
      fetchInitialData();
      return true;
    } else {
      addToast("Error", "Check-in failed.", "error");
      return false;
    }
  };
  const addPlan = async (plan) => {
    const res = await apiFetch("/api/plans.php", {
      method: "POST",
      body: JSON.stringify(plan)
    });
    if (res && res.success) {
      addToast("Plan Created", `${plan.name} is now available.`, "success");
      fetchInitialData();
    } else {
      addToast("Error", "Failed to create plan.", "error");
    }
  };
  const updatePlan = async (id, updated) => {
    const res = await apiFetch(`/api/plans.php?id=${id}`, {
      method: "PUT",
      body: JSON.stringify(updated)
    });
    if (res && res.success) {
      addToast("Plan Updated", "Plan options saved.", "info");
      fetchInitialData();
    } else {
      addToast("Error", "Failed to update plan.", "error");
    }
  };
  const deletePlan = async (id) => {
    const res = await apiFetch(`/api/plans.php?id=${id}`, {
      method: "DELETE"
    });
    if (res && res.success) {
      addToast("Plan Removed", "Plan deleted.", "info");
      fetchInitialData();
    } else {
      addToast("Error", "Failed to delete plan.", "error");
    }
  };
  const openAssignPlanModal = (plan) => {
    setAssignPlanModalState({ isOpen: true, plan });
  };
  const closeAssignPlanModal = () => {
    setAssignPlanModalState({ isOpen: false, plan: null });
  };
  const assignPlanToMember = async (memberId, planName) => {
    const targetMember = members.find((m) => m.id === memberId);
    if (targetMember) {
      const updatedMember = { ...targetMember, plan: planName, status: "Active" };
      const res = await apiFetch(`/api/members.php?id=${memberId}`, {
        method: "PUT",
        body: JSON.stringify(updatedMember)
      });
      if (res && res.success) {
        addToast(
          "Plan Assigned",
          `${targetMember.name} is now enrolled in ${planName}.`,
          "success"
        );
        fetchInitialData();
      } else {
        addToast("Error", "Failed to assign plan.", "error");
      }
    }
    closeAssignPlanModal();
  };
  const addTrainer = async (trainerData) => {
    const res = await apiFetch("/api/trainers.php", {
      method: "POST",
      body: JSON.stringify(trainerData)
    });
    if (res && res.success) {
      addToast("Trainer Added", `${trainerData.name} joined FitZone staff!`, "success");
      fetchInitialData();
    } else {
      addToast("Error", "Failed to add trainer.", "error");
    }
  };
  const updateTrainer = async (id, updated) => {
    const res = await apiFetch(`/api/trainers.php?id=${id}`, {
      method: "PUT",
      body: JSON.stringify(updated)
    });
    if (res && res.success) {
      addToast("Trainer Updated", "Staff records updated.", "info");
      fetchInitialData();
    } else {
      addToast("Error", "Failed to update trainer.", "error");
    }
  };
  // ─── Trainer Workout Plans ───────────────────────────────────────────────
  const fetchWorkoutPlans = async (trainerId) => {
    const res = await apiFetch(`/api/workout_plans.php?trainer_id=${trainerId}`);
    return res || [];
  };

  const createWorkoutPlan = async (planData) => {
    const res = await apiFetch('/api/workout_plans.php', {
      method: 'POST',
      body: JSON.stringify(planData)
    });
    if (res && res.success) {
      addToast('Plan Created', 'Workout plan saved successfully.', 'success');
      return res;
    } else {
      addToast('Error', res?.message || 'Failed to create plan.', 'error');
      return null;
    }
  };

  const deleteWorkoutPlan = async (id) => {
    const res = await apiFetch(`/api/workout_plans.php?id=${id}`, { method: 'DELETE' });
    if (res && res.success) {
      addToast('Plan Deleted', 'Workout plan removed.', 'info');
      return true;
    } else {
      addToast('Error', res?.message || 'Failed to delete plan.', 'error');
      return false;
    }
  };

  // ─── Trainer Schedule ───────────────────────────────────────────────────────
  const fetchSchedule = async (trainerId) => {
    const res = await apiFetch(`/api/trainer_schedule.php?trainer_id=${trainerId}`);
    return res || [];
  };

  const createScheduleSession = async (sessionData) => {
    const res = await apiFetch('/api/trainer_schedule.php', {
      method: 'POST',
      body: JSON.stringify(sessionData)
    });
    if (res && res.success) {
      addToast('Session Scheduled', 'Session added to your schedule.', 'success');
      return res;
    } else {
      addToast('Error', res?.message || 'Failed to schedule session.', 'error');
      return null;
    }
  };

  const deleteScheduleSession = async (id) => {
    const res = await apiFetch(`/api/trainer_schedule.php?id=${id}`, { method: 'DELETE' });
    if (res && res.success) {
      addToast('Session Removed', 'Schedule session removed.', 'info');
      return true;
    } else {
      addToast('Error', res?.message || 'Failed to remove session.', 'error');
      return false;
    }
  };

  const deleteTrainer = async (id) => {
    const res = await apiFetch(`/api/trainers.php?id=${id}`, {
      method: "DELETE"
    });
    if (res && res.success) {
      addToast("Trainer Removed", "Staff record deleted.", "info");
      fetchInitialData();
    } else {
      addToast("Error", "Failed to delete trainer.", "error");
    }
  };
  return <GymContext.Provider
    value={{
      activeTab,
      setActiveTab,
      user,
      setUser,
      login,
      logout,
      registerMember,
      registerTrainer,
      members,
      addMember,
      updateMember,
      deleteMember,
      attendanceRecords,
      checkInMember,
      selectedAttendanceDate,
      setSelectedAttendanceDate,
      plans,
      addPlan,
      updatePlan,
      deletePlan,
      trainers,
      addTrainer,
      updateTrainer,
      deleteTrainer,
      searchQuery,
      setSearchQuery,
      toasts,
      addToast,
      removeToast,
      isSettingsOpen,
      setIsSettingsOpen,
      isAddTrainerModalOpen,
      setIsAddTrainerModalOpen,
      isAddPlanModalOpen,
      setIsAddPlanModalOpen,
      assignPlanModalState,
      openAssignPlanModal,
      closeAssignPlanModal,
      assignPlanToMember,
      fetchInitialData,
      apiFetch,
      fetchWorkoutPlans,
      createWorkoutPlan,
      deleteWorkoutPlan,
      fetchSchedule,
      createScheduleSession,
      deleteScheduleSession,
      notifications,
      fetchNotifications,
      markNotificationsRead,
      refreshCounter,
      setRefreshCounter
    }}
  >
      {children}
    </GymContext.Provider>;
};
export const useGym = () => {
  const context = useContext(GymContext);
  if (!context) {
    throw new Error("useGym must be used within a GymProvider");
  }
  return context;
};
