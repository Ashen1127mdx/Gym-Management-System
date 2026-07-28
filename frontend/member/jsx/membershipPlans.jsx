import "../css/MembershipPlans.css";

// Sample data — replace this with data fetched from your PHP API
const PLANS = [
    {
        id: "standard",
        tier: "Standard Tier",
        name: "Monthly Pro",
        price: "$49",
        cadence: "/ month",
        popular: false,
        privileges: ["Access to Cardio Zone", "Weight Lifting Area", "Personal Locker"],
    },
    {
        id: "growth",
        tier: "Growth Tier",
        name: "Quarterly Active",
        price: "$129",
        cadence: "/ 3 months",
        popular: true,
        privileges: [
            "Cardio & Weight Areas",
            "Personal Locker",
            "1 Yoga Session per month",
            "Free Guest Pass (x2)",
        ],
    },
    {
        id: "premium",
        tier: "Premium Tier",
        name: "Annual Elite",
        price: "$399",
        cadence: "/ year",
        popular: false,
        privileges: [
            "Unlimited Access (Everything)",
            "1 PT Session per month",
            "Priority Class Booking",
            "Premium Locker & Towels",
            "Sauna & Pool Access",
        ],
    },
];

const INSIGHTS = [
    {
        label: "Average Member Lifetime Value",
        value: "$680.00",
        note: "+14% vs last quarter",
    },
    {
        label: "Top Converting Tier",
        value: "Quarterly Active",
        note: "48% total member market share",
    },
    {
        label: "Annual Subscription Retention",
        value: "92.4%",
        note: "Highest lifetime retention rate",
    },
];

export default function MembershipPlans() {
    return (
        <div className="plans-page">
            {/* Top bar */}
            <header className="topbar">
                <div className="topbar-search">
                    <SearchIcon />
                    <input type="text" placeholder="Search members, trainers, plans..." />
                </div>
                <div className="topbar-actions">
                    <button className="btn btn-primary">
                        <CheckInIcon />
                        Quick Check-In
                    </button>
                    <button className="icon-btn" aria-label="Notifications">
                        <BellIcon />
                        <span className="notif-dot" />
                    </button>
                    <button className="icon-btn" aria-label="Settings">
                        <GearIcon />
                    </button>
                    <img
                        className="avatar-btn"
                        src="https://i.pravatar.cc/80?img=51"
                        alt="Account"
                    />
                </div>
            </header>

            <main className="page-content">
                {/* Page header */}
                <div className="page-header">
                    <div>
                        <h1>Membership Plans &amp; Pricing</h1>
                        <p>Manage billing cycles, access privileges, and recurring membership tiers.</p>
                    </div>
                    <button className="btn btn-primary">
                        <PlusIcon />
                        Create New Plan
                    </button>
                </div>

                {/* Plan cards */}
                <div className="plans-grid">
                    {PLANS.map((plan) => (
                        <div
                            key={plan.id}
                            className={`plan-card ${plan.popular ? "popular" : ""}`}
                        >
                            {plan.popular && <span className="popular-badge">Most Popular</span>}

                            <div className="plan-card-head">
                                <span className="plan-tier">{plan.tier}</span>
                                <button className="plan-delete-btn" aria-label="Delete plan">
                                    <TrashIcon />
                                </button>
                            </div>

                            <h2 className="plan-name">{plan.name}</h2>

                            <div className="plan-price">
                                <span className="price-amount">{plan.price}</span>
                                <span className="price-cadence">{plan.cadence}</span>
                            </div>

                            <div className="plan-divider" />

                            <div className="plan-privileges">
                                <span className="privileges-label">Included Privileges:</span>
                                <ul>
                                    {plan.privileges.map((p) => (
                                        <li key={p}>
                                            <CheckIcon />
                                            {p}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <button className="btn btn-primary plan-assign-btn">
                                <AddUserIcon />
                                Assign to Member
                            </button>
                        </div>
                    ))}
                </div>

                {/* Insights */}
                <div className="insights-card">
                    <h3>Membership Performance Insights</h3>
                    <div className="insights-grid">
                        {INSIGHTS.map((insight) => (
                            <div className="insight-tile" key={insight.label}>
                                <span className="insight-label">{insight.label}</span>
                                <span className="insight-value">{insight.value}</span>
                                <span className="insight-note">{insight.note}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}

/* --- Inline icon components (no external icon library needed) --- */

function SearchIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
    );
}

function BellIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
                d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path d="M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
    );
}

function GearIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
            <path
                d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.65 1.65 0 004.6 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.6a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06A1.65 1.65 0 0019.4 9c.2.63.75 1.09 1.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"
                stroke="currentColor"
                strokeWidth="1.5"
            />
        </svg>
    );
}

function CheckInIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
            <path d="M2 21v-1a7 7 0 0114 0v1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M16 11l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function AddUserIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
            <path d="M2 21v-1a7 7 0 0114 0v1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="19" y1="8" x2="19" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="16" y1="11" x2="22" y2="11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
    );
}

function PlusIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
    );
}

function TrashIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path
                d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function CheckIcon() {
    return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            <path d="M8 12.5l2.5 2.5L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}