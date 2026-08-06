import { useState } from "react";
import { useGym } from "../services/GymContext";
export const Header = () => {
  const {
    activeTab,
    setActiveTab,
    user,
    logout,
    searchQuery,
    setSearchQuery,
    setIsSettingsOpen,
    notifications,
    markNotificationsRead
  } = useGym();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const isAdmin = user?.role === "admin";
  return <header className={`fixed top-0 right-0 left-0 ${isAdmin ? "md:left-[260px]" : ""} h-16 bg-surface-container-low border-b border-surface-variant/30 px-4 md:px-8 flex items-center justify-between z-40`}>
      {
    /* Left: Mobile Brand or Search Bar */
  }
      <div className="flex items-center gap-3 flex-1">
        <div className={`flex items-center gap-2 mr-2 ${isAdmin ? "md:hidden" : ""}`}>
          <img
            src="/fitzone-logo-512.png"
            alt="FitZone"
            className="w-8 h-8 object-contain"
          />
          <div>
            <span className="font-headline-lg text-lg font-bold text-secondary-container leading-none block">
              FitZone
            </span>
            <span className="text-[10px] text-on-surface-variant font-medium block">
              No Pain. No Gain.
            </span>
          </div>
        </div>
      </div>

      {
    /* Right Actions */
  }
      <div className="flex items-center gap-2 md:gap-4">
        {/* Notifications Popover Toggle */}
        <div className="relative">
          <button
            onClick={() => {
              const nextState = !isNotifOpen;
              setIsNotifOpen(nextState);
              setIsUserMenuOpen(false);
              if (nextState) {
                markNotificationsRead();
              }
            }}
            className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg relative transition-colors"
            title="Notifications"
          >
            <span className="material-symbols-outlined text-xl">notifications</span>
            {notifications.some((n) => !n.is_read) && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-secondary animate-pulse" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-surface-container-lowest rounded-2xl shadow-xl border border-outline-variant/30 py-2 z-50 animate-fade-in">
              <div className="px-4 py-2 border-b border-outline-variant/20 flex items-center justify-between">
                <span className="font-headline-md text-sm font-bold text-on-surface">
                  Notifications
                </span>
                {notifications.filter((n) => !n.is_read).length > 0 && (
                  <span className="text-[10px] bg-secondary-fixed text-on-secondary-fixed font-bold px-2 py-0.5 rounded-full">
                    {notifications.filter((n) => !n.is_read).length} New
                  </span>
                )}
              </div>
              <div className="divide-y divide-outline-variant/10 max-h-72 overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="px-4 py-6 text-center text-xs text-on-surface-variant font-medium">
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`px-4 py-3 hover:bg-surface-container-low transition-colors cursor-pointer ${
                        !n.is_read ? "bg-secondary/5 font-semibold" : ""
                      }`}
                    >
                      <p className="text-xs text-on-surface">{n.title}</p>
                      <p className="text-[11px] text-on-surface-variant mt-0.5 font-normal leading-relaxed">
                        {n.message}
                      </p>
                      <span className="text-[10px] text-outline mt-1 block font-normal">
                        {new Date(n.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {
    /* User Profile Avatar Menu */
  }
        <div className="relative">
          <button
    onClick={() => {
      setIsUserMenuOpen(!isUserMenuOpen);
      setIsNotifOpen(false);
    }}
    className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-secondary/30 transition-all"
  >
            {user.avatarUrl ? <img
    src={user.avatarUrl}
    alt={user.name}
    referrerPolicy="no-referrer"
    className="w-9 h-9 rounded-full object-cover"
  /> : <div className="w-9 h-9 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container font-bold text-xs">
                {user.name ? user.name.split(" ").map(n => n[0]).join("").slice(0,2).toUpperCase() : "U"}
              </div>}
          </button>
 
          {
    /* User Menu Dropdown */
  }
          {isUserMenuOpen && <div className="absolute right-0 mt-2 w-56 bg-surface-container-lowest rounded-2xl shadow-xl border border-outline-variant/30 py-2 z-50 animate-fade-in">
              <div className="px-4 py-3 border-b border-outline-variant/20">
                <p className="font-headline-md text-sm font-bold text-on-surface">
                  {user.name}
                </p>
                <p className="text-xs text-on-surface-variant truncate">{user.email}</p>
                <span className="inline-block mt-1 text-[10px] bg-surface-container-high font-bold px-2 py-0.5 rounded-md text-on-surface">
                  {user.role}
                </span>
              </div>
              <button
                onClick={() => {
                  setIsUserMenuOpen(false);
                  setIsSettingsOpen(true);
                }}
                className="w-full text-left px-4 py-2 text-xs font-medium text-on-surface hover:bg-surface-container-low flex items-center gap-2 transition-colors"
              >
                <span className="material-symbols-outlined text-base">manage_accounts</span>
                <span>Account Settings</span>
              </button>
              <button
    onClick={() => {
      setIsUserMenuOpen(false);
      logout();
    }}
    className="w-full text-left px-4 py-2 text-xs font-semibold text-error hover:bg-error-container/20 flex items-center gap-2 transition-colors border-t border-outline-variant/20 mt-1"
  >
                <span className="material-symbols-outlined text-base">logout</span>
                <span>Sign Out</span>
              </button>
            </div>}
        </div>
      </div>
    </header>;
};
