import { GymProvider, useGym } from "./services/GymContext";
import { useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { MobileNav } from "./components/MobileNav";
import { ToastContainer } from "./components/Toast";
import { SettingsModal } from "./components/SettingsModal";
import { LoginView } from "./pages/LoginView";
import { HomeView } from "./pages/HomeView";
import { AdminMembersView } from "./pages/AdminMembersView";
import { AddMemberView } from "./pages/AddMemberView";
import { AdminPlansView } from "./pages/AdminPlansView";
import { AttendanceView } from "./pages/AttendanceView";
import { AdminReportsView } from "./pages/AdminReportsView";

import { MemberDashboardView } from "./pages/MemberDashboardView";
import { TrainerDashboardView } from "./pages/TrainerDashboardView";
import { MembershipPlansView } from "./pages/MembershipPlansView";

import { Footer } from "./components/Footer";

const MainContent = () => {
  const { activeTab, user, setActiveTab } = useGym();
  const [memberView, setMemberView] = useState("dashboard"); // "dashboard" or "plans"

  // Show login page if not authenticated
  if (activeTab === "login") {
    return <LoginView />;
  }

  // Redirect/render appropriate portal if user is NOT admin

  if (user?.role === "member") {
    return (
      <div className="min-h-screen bg-surface text-on-surface flex flex-col justify-between">
        <Header />
        <main className="pt-20 px-4 md:px-8 pb-12 min-h-[calc(100vh-140px)]">
          {memberView === "dashboard" ? (
            <MemberDashboardView onViewPlans={() => setMemberView("plans")} />
          ) : (
            <MembershipPlansView onBack={() => setMemberView("dashboard")} />
          )}
        </main>
        <Footer />
        <SettingsModal />
        <ToastContainer />
      </div>
    );
  }

  if (user?.role === "trainer") {
    return (
      <div className="min-h-screen bg-surface text-on-surface flex flex-col justify-between">
        <Header />
        <main className="pt-20 px-4 md:px-8 pb-12 min-h-[calc(100vh-140px)]">
          <TrainerDashboardView />
        </main>
        <Footer />
        <SettingsModal />
        <ToastContainer />
      </div>
    );
  }

  // Fallback check if user role is not determined yet or invalid
  if (user?.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface text-on-surface">
        <p className="text-lg font-medium">Loading session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <Sidebar />
      <Header />
      <main className="md:ml-[260px] pt-20 px-4 md:px-8 pb-24 md:pb-8 min-h-screen">
        {activeTab === "home" && <HomeView />}
        {activeTab === "members" && <AdminMembersView />}
        {activeTab === "members-add" && <AddMemberView />}
        {activeTab === "plans" && <AdminPlansView />}
        {activeTab === "attendance" && <AttendanceView />}
        {activeTab === "reports" && <AdminReportsView />}
      </main>
      <MobileNav />
      <SettingsModal />
      <ToastContainer />
    </div>
  );
};

export function App() {
  return (
    <GymProvider>
      <MainContent />
    </GymProvider>
  );
}

export default App;
