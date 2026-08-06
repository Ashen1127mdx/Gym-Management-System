import { useGym } from "../services/GymContext";
export const MobileNav = () => {
  const { activeTab, setActiveTab } = useGym();
  if (activeTab === "login") return null;
  const items = [
    { id: "members", label: "Members", icon: "group" },
    { id: "plans", label: "Plans", icon: "card_membership" },
    { id: "attendance", label: "Check-In", icon: "how_to_reg" },
    { id: "reports", label: "Reports", icon: "assessment" }
  ];
  return <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-tertiary-container border-t border-surface-variant/20 flex items-center justify-around z-50 px-2">
      {items.map((item) => {
    const isActive = activeTab === item.id || item.id === "members" && activeTab === "members-add";
    return <button
      key={item.id}
      onClick={() => setActiveTab(item.id)}
      className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-colors ${isActive ? "text-secondary-container font-semibold" : "text-on-tertiary-container opacity-70 hover:opacity-100"}`}
    >
            <span
      className="material-symbols-outlined text-xl"
      style={{
        fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0"
      }}
    >
              {item.icon}
            </span>
            <span className="text-[10px] mt-0.5">{item.label}</span>
          </button>;
  })}
    </nav>;
};
