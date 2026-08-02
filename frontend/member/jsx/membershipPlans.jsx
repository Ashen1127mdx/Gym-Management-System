import { useState, useEffect } from "react";
import "../css/MembershipPlans.css";

const API_BASE = "http://localhost/GYM/Gym-Management-System/backend/api/plans";

export default function MembershipPlans() {
    const [plans, setPlans] = useState([]);
    const [insights, setInsights] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modals
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [currentAssignPlanId, setCurrentAssignPlanId] = useState(null);

    // Create Form State
    const [createForm, setCreateForm] = useState({
        plan_name: "", price: "", duration_months: "", benefits: [""]
    });
    const [createError, setCreateError] = useState("");

    // Assign Form State
    const [assignMemberId, setAssignMemberId] = useState("");
    const [assignError, setAssignError] = useState("");

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [plansRes, insightsRes] = await Promise.all([
                fetch(`${API_BASE}/get_plans.php`),
                fetch(`${API_BASE}/insights.php`)
            ]);

            if (!plansRes.ok) throw new Error("Failed to fetch plans");
            if (!insightsRes.ok) throw new Error("Failed to fetch insights");

            const plansData = await plansRes.json();
            const insightsData = await insightsRes.json();

            setPlans(plansData);
            setInsights(insightsData);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // --- Create Plan Logic ---
    const handleAddBenefit = () => {
        setCreateForm({ ...createForm, benefits: [...createForm.benefits, ""] });
    };

    const handleBenefitChange = (index, value) => {
        const newBenefits = [...createForm.benefits];
        newBenefits[index] = value;
        setCreateForm({ ...createForm, benefits: newBenefits });
    };

    const handleRemoveBenefit = (index) => {
        const newBenefits = createForm.benefits.filter((_, i) => i !== index);
        setCreateForm({ ...createForm, benefits: newBenefits });
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        setCreateError("");

        if (!createForm.plan_name) return setCreateError("Plan name is required.");
        if (Number(createForm.price) <= 0) return setCreateError("Price must be > 0.");
        if (Number(createForm.duration_months) <= 0) return setCreateError("Duration must be > 0.");

        const filteredBenefits = createForm.benefits.filter(b => b.trim() !== "");
        if (filteredBenefits.length === 0) return setCreateError("At least one benefit is required.");

        try {
            const res = await fetch(`${API_BASE}/create_plan.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    plan_name: createForm.plan_name,
                    price: Number(createForm.price),
                    duration_months: Number(createForm.duration_months),
                    benefits: filteredBenefits
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to create plan");

            alert("Plan created successfully!");
            setShowCreateModal(false);
            setCreateForm({ plan_name: "", price: "", duration_months: "", benefits: [""] });
            fetchData();
        } catch (err) {
            setCreateError(err.message);
        }
    };

    // --- Delete Plan Logic ---
    const handleDelete = async (planId, force = false) => {
        if (!force && !window.confirm("Are you sure you want to delete this plan?")) return;

        try {
            const url = `${API_BASE}/delete_plan.php?plan_id=${planId}${force ? "&force=true" : ""}`;
            const res = await fetch(url, { method: "DELETE" });
            const data = await res.json();

            if (res.status === 409) {
                if (window.confirm(`${data.member_count} members are on this plan. Delete anyway?`)) {
                    handleDelete(planId, true);
                }
                return;
            }

            if (!res.ok) throw new Error(data.error || "Failed to delete plan");

            alert("Plan deleted successfully!");
            fetchData();
        } catch (err) {
            alert("Error: " + err.message);
        }
    };

    // --- Assign Plan Logic ---
    const handleAssignClick = (planId) => {
        setCurrentAssignPlanId(planId);
        setAssignMemberId("");
        setAssignError("");
        setShowAssignModal(true);
    };

    const handleAssignSubmit = async (e) => {
        e.preventDefault();
        setAssignError("");

        if (!assignMemberId) return setAssignError("Member ID is required.");

        try {
            const res = await fetch(`${API_BASE}/assign_plan.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    member_id: assignMemberId,
                    plan_id: currentAssignPlanId
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to assign plan");

            alert("Plan assigned to member successfully!");
            setShowAssignModal(false);
        } catch (err) {
            setAssignError(err.message);
        }
    };

    return (
        <div className="plans-page">
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
                <div className="page-header">
                    <div>
                        <h1>Membership Plans &amp; Pricing</h1>
                        <p>Manage billing cycles, access privileges, and recurring membership tiers.</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                        <PlusIcon />
                        Create New Plan
                    </button>
                </div>

                {loading ? (
                    <div>Loading data...</div>
                ) : error ? (
                    <div style={{ color: "red", padding: "20px 0" }}>{error}</div>
                ) : (
                    <>
                        <div className="plans-grid">
                            {plans.map((plan) => (
                                <div
                                    key={plan.plan_id}
                                    className={`plan-card ${plan.most_popular ? "popular" : ""}`}
                                >
                                    {plan.most_popular && <span className="popular-badge">Most Popular</span>}

                                    <div className="plan-card-head">
                                        <span className="plan-tier">{plan.plan_name}</span>
                                        <button 
                                            className="plan-delete-btn" 
                                            aria-label="Delete plan"
                                            onClick={() => handleDelete(plan.plan_id)}
                                        >
                                            <TrashIcon />
                                        </button>
                                    </div>

                                    <h2 className="plan-name">{plan.plan_name}</h2>

                                    <div className="plan-price">
                                        <span className="price-amount">${plan.price}</span>
                                        <span className="price-cadence">/ {plan.duration_months} months</span>
                                    </div>

                                    <div className="plan-divider" />

                                    <div className="plan-privileges">
                                        <span className="privileges-label">Included Privileges:</span>
                                        <ul>
                                            {plan.benefits.map((p, idx) => (
                                                <li key={idx}>
                                                    <CheckIcon />
                                                    {p}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <button 
                                        className="btn btn-primary plan-assign-btn"
                                        onClick={() => handleAssignClick(plan.plan_id)}
                                    >
                                        <AddUserIcon />
                                        Assign to Member
                                    </button>
                                </div>
                            ))}
                        </div>

                        {insights && (
                            <div className="insights-card">
                                <h3>Membership Performance Insights</h3>
                                <div className="insights-grid">
                                    <div className="insight-tile">
                                        <span className="insight-label">Average Member Lifetime Value</span>
                                        <span className="insight-value">${insights.average_lifetime_value}</span>
                                        {insights.average_lifetime_value_trend && <span className="insight-note">{insights.average_lifetime_value_trend}</span>}
                                    </div>
                                    <div className="insight-tile">
                                        <span className="insight-label">Top Converting Tier</span>
                                        <span className="insight-value">{insights.top_converting_tier?.plan_name}</span>
                                        <span className="insight-note">{insights.top_converting_tier?.percent_share}% total member market share</span>
                                    </div>
                                    <div className="insight-tile">
                                        <span className="insight-label">Annual Subscription Retention</span>
                                        <span className="insight-value">{insights.annual_retention}%</span>
                                        {insights.annual_retention_trend && <span className="insight-note">{insights.annual_retention_trend}</span>}
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>

            {/* Create Plan Modal */}
            {showCreateModal && (
                <div style={modalOverlayStyle}>
                    <div style={modalContentStyle}>
                        <h2>Create New Plan</h2>
                        {createError && <div style={{ color: "red", marginBottom: "10px" }}>{createError}</div>}
                        <form onSubmit={handleCreateSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            <input 
                                type="text" 
                                placeholder="Plan Name" 
                                value={createForm.plan_name}
                                onChange={e => setCreateForm({...createForm, plan_name: e.target.value})} 
                                style={inputStyle}
                            />
                            <input 
                                type="number" 
                                placeholder="Price" 
                                value={createForm.price}
                                onChange={e => setCreateForm({...createForm, price: e.target.value})} 
                                style={inputStyle}
                            />
                            <input 
                                type="number" 
                                placeholder="Duration (months)" 
                                value={createForm.duration_months}
                                onChange={e => setCreateForm({...createForm, duration_months: e.target.value})} 
                                style={inputStyle}
                            />
                            <div>
                                <label style={{ display: "block", marginBottom: "5px", color: "#666" }}>Benefits:</label>
                                {createForm.benefits.map((b, idx) => (
                                    <div key={idx} style={{ display: "flex", gap: "5px", marginBottom: "5px" }}>
                                        <input 
                                            type="text" 
                                            value={b}
                                            onChange={e => handleBenefitChange(idx, e.target.value)}
                                            style={{ ...inputStyle, flex: 1 }}
                                        />
                                        <button 
                                            type="button" 
                                            onClick={() => handleRemoveBenefit(idx)}
                                            style={{ padding: "8px", cursor: "pointer" }}
                                        >
                                            X
                                        </button>
                                    </div>
                                ))}
                                <button 
                                    type="button" 
                                    onClick={handleAddBenefit}
                                    style={{ padding: "8px", marginTop: "5px", cursor: "pointer" }}
                                >
                                    + Add Benefit
                                </button>
                            </div>
                            <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                                <button type="submit" className="btn btn-primary">Create</button>
                                <button 
                                    type="button" 
                                    onClick={() => setShowCreateModal(false)}
                                    style={{ padding: "10px 16px", cursor: "pointer", border: "1px solid #ccc", borderRadius: "8px", background: "transparent" }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Assign Plan Modal */}
            {showAssignModal && (
                <div style={modalOverlayStyle}>
                    <div style={modalContentStyle}>
                        <h2>Assign Plan to Member</h2>
                        {assignError && <div style={{ color: "red", marginBottom: "10px" }}>{assignError}</div>}
                        <form onSubmit={handleAssignSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            <input 
                                type="number" 
                                placeholder="Member ID" 
                                value={assignMemberId}
                                onChange={e => setAssignMemberId(e.target.value)} 
                                style={inputStyle}
                            />
                            <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                                <button type="submit" className="btn btn-primary">Assign</button>
                                <button 
                                    type="button" 
                                    onClick={() => setShowAssignModal(false)}
                                    style={{ padding: "10px 16px", cursor: "pointer", border: "1px solid #ccc", borderRadius: "8px", background: "transparent" }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

const modalOverlayStyle = {
    position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
    backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000
};

const modalContentStyle = {
    backgroundColor: "#fff", padding: "24px", borderRadius: "12px", width: "400px", maxWidth: "90%", color: "#333",
    boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
};

const inputStyle = {
    padding: "10px", borderRadius: "8px", border: "1px solid #ccc", width: "100%", boxSizing: "border-box"
};

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