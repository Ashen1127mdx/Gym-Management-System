import { useGym } from "../services/GymContext";
export const Sidebar = () => {
  const { activeTab, setActiveTab, user, setIsSettingsOpen } = useGym();
  const allNavItems = [
    { id: "members", label: "Members & Trainers", icon: "group" },
    { id: "plans", label: "Membership Plans", icon: "card_membership" },
    { id: "attendance", label: "Front Desk Check-In", icon: "how_to_reg" },
    { id: "reports", label: "Financial Reports", icon: "assessment" }
  ];
  // Admin sees all admin pages; non‑admin sees only Home and their own dashboard (handled elsewhere)
  const navItems = user?.role === "admin" ? allNavItems : [{ id: "home", label: "Home", icon: "dashboard" }];
  if (activeTab === "login") return null;
  return <aside className="fixed left-0 top-0 h-full w-[260px] z-50 overflow-y-auto bg-tertiary-container hidden md:flex flex-col">
      {
    /* Brand Header */
  }
      <div className="p-6">
        <div className="flex items-center gap-3">
          <img
            src="/fitzone-logo-512.png"
            alt="FitZone"
            className="w-9 h-9 object-contain flex-shrink-0"
          />
          <div>
            <h1 className="font-headline-lg text-[22px] font-bold text-secondary-container leading-tight">
              FitZone
            </h1>
            <p className="font-label-md text-xs text-on-tertiary-container opacity-60">
              No Pain. No Gain.
            </p>
          </div>
        </div>
      </div>

      {
    /* Navigation */
  }
      <nav className="mt-2 flex-1 flex flex-col">
        {navItems.map((item) => {
    const isActive = activeTab === item.id || item.id === "members" && activeTab === "members-add";
    return <button
      key={item.id}
      onClick={() => setActiveTab(item.id)}
      className={`w-full text-left flex items-center gap-4 px-6 py-3.5 transition-all duration-150 ${isActive ? "border-l-4 border-secondary text-secondary bg-surface-variant/10 font-semibold" : "text-on-tertiary-container hover:bg-surface-variant/20 hover:text-secondary"}`}
    >
              <span
      className="material-symbols-outlined"
      style={{
        fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0"
      }}
    >
                {item.icon}
              </span>
              <span className="font-label-md text-sm">{item.label}</span>
            </button>;
  })}
      </nav>

      {
    /* Admin User Footer Profile Card */
  }
      <div className="p-6 border-t border-surface-variant/10">
        <div
    onClick={() => setIsSettingsOpen(true)}
    className="bg-surface-variant/5 rounded-xl p-3.5 flex items-center gap-3 cursor-pointer hover:bg-surface-variant/10 transition-colors group"
  >
          {user.avatarUrl ? <img
    src={user.avatarUrl}
    alt={user.name}
    referrerPolicy="no-referrer"
    className="w-10 h-10 rounded-full object-cover ring-2 ring-secondary/30"
  /> : <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container font-bold text-sm">
              AD
            </div>}
          <div className="flex flex-col min-w-0">
            <span className="font-label-md text-sm text-on-tertiary-container font-medium truncate group-hover:text-white">
              {user.name}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-on-tertiary-container/60 font-semibold">
              {user.role}
            </span>
          </div>
          <span className="material-symbols-outlined text-on-tertiary-container/40 text-sm ml-auto">
            settings
          </span>
        </div>
      </div>
    </aside>;
};
