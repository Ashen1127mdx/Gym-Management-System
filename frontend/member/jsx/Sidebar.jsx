import { NavLink } from "react-router-dom";
import "../css/Sidebar.css";

const NAV_ITEMS = [
    { label: "Home", path: "/", icon: HomeIcon },
    { label: "Members", path: "/members", icon: MembersIcon },
    { label: "Membership Plans", path: "/membership-plans", icon: PlansIcon },
    { label: "Trainers", path: "/trainers", icon: TrainersIcon },
    { label: "Attendance", path: "/attendance", icon: AttendanceIcon },
    { label: "Reports", path: "/reports", icon: ReportsIcon },
];

export default function Sidebar() {
    return (
        <aside className="sidebar">
            <div className="sidebar-brand">
                <span className="brand-name">FitZone</span>
                <span className="brand-sub">Gym Management</span>
            </div>

            <nav className="sidebar-nav">
                {NAV_ITEMS.map(({ label, path, icon: Icon }) => (
                    <NavLink
                        key={label}
                        to={path}
                        className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
                    >
                        <Icon />
                        <span>{label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-footer">
                <img className="footer-avatar" src="https://i.pravatar.cc/80?img=51" alt="Alex Rivera" />
                <div className="footer-info">
                    <div className="footer-name">Alex Rivera</div>
                    <div className="footer-role">SUPER ADMIN</div>
                </div>
                <button className="footer-gear" aria-label="Account settings">
                    <GearIcon />
                </button>
            </div>
        </aside>
    );
}

/* --- Inline icons --- */

function HomeIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" />
        </svg>
    );
}

function MembersIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="9" cy="8" r="3.5" stroke="currentColor" strokeWidth="2" />
            <path d="M2.5 20a6.5 6.5 0 0113 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <circle cx="17" cy="9" r="2.7" stroke="currentColor" strokeWidth="2" />
            <path d="M15 20a5 5 0 016.5-4.77" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
    );
}

function PlansIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="6" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="2" />
            <path d="M3 10h18" stroke="currentColor" strokeWidth="2" />
            <path d="M7 3.5v3M17 3.5v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
    );
}

function TrainersIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M6.5 6.5l11 11M4 9l3-3M17 18l3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M3 4l3 3M18 15l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <circle cx="5" cy="5" r="1.6" stroke="currentColor" strokeWidth="1.6" />
            <circle cx="19" cy="19" r="1.6" stroke="currentColor" strokeWidth="1.6" />
        </svg>
    );
}

function AttendanceIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="9" cy="8" r="3.2" stroke="currentColor" strokeWidth="2" />
            <path d="M3 20a6 6 0 0112 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M15.5 9.5l2 2 3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function ReportsIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
            <path d="M8 17V11M12 17V7M16 17v-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
    );
}

function GearIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
            <path
                d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.65 1.65 0 004.6 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.6a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06A1.65 1.65 0 0019.4 9c.2.63.75 1.09 1.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"
                stroke="currentColor"
                strokeWidth="1.5"
            />
        </svg>
    );
}
