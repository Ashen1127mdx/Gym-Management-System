import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../css/AddMember.css";

const API_BASE = import.meta.env.VITE_API_BASE || "/api";
const PLAN_OPTIONS = [
    "Monthly Pro ($49/mo)",
    "Annual Elite ($399/yr)",
    "Day Pass ($15/visit)",
];

const STATUS_OPTIONS = [
    "Active",
    "Guest",
    "Flagged",
    "Expired",
];

const GENDER_OPTIONS = ["Male", "Female", "Other", "Prefer not to say"];

const initialFormState = {
    fullName: "",
    nationalId: "",
    dob: "",
    gender: "Male",
    email: "",
    phone: "",
    address: "",
    emergencyContact: "",
    plan: PLAN_OPTIONS[0],
    status: STATUS_OPTIONS[0],
    photoUrl: "",
};

export default function AddMember() {
    const [form, setForm] = useState(initialFormState);
    const [message, setMessage] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleChange = (field) => (e) => {
        setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);

        const payload = {
            full_name: form.fullName.trim(),
            nic: form.nationalId.trim(),
            dob: form.dob,
            gender: form.gender,
            email: form.email.trim(),
            contact: form.phone.trim(),
            address: form.address.trim() || null,
            emergency_contact: form.emergencyContact.trim() || null,
            plan_label: form.plan,
            join_date: new Date().toISOString().slice(0, 10),
            photo: form.photoUrl.trim() || null,
            status: form.status,
        };

        if (
            !payload.full_name ||
            !payload.nic ||
            !payload.dob ||
            !payload.email ||
            !payload.contact ||
            !payload.gender ||
            !payload.plan_label ||
            !payload.status
        ) {
            setMessage({ type: "error", text: "Please complete all required fields." });
            return;
        }

        setSubmitting(true);

        try {
            const response = await fetch(`${API_BASE}/addMember.php`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const responseText = await response.text();
            let json;

            try {
                json = responseText ? JSON.parse(responseText) : {};
            } catch (parseError) {
                throw new Error(`Invalid server response: ${responseText}`);
            }

            if (!response.ok || !json.success) {
                throw new Error(json.message || json.error || "Unable to add member.");
            }

            setMessage({ type: "success", text: json.message || "Member added successfully." });
            setForm(initialFormState);
            navigate("/members", {
                state: {
                    refresh: true,
                    newMember: json.member,
                },
            });
        } catch (err) {
            setMessage({ type: "error", text: err.message });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="addmember-page">
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
                <Link to="/members" className="back-link">
                    <BackIcon />
                    Back to Members
                </Link>

                <div className="page-header">
                    <h1>New Member Registration</h1>
                    <p>Complete member identification, plan enrolment, and contact details.</p>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Personal Information */}
                    <section className="form-card">
                        <div className="form-card-title">
                            <PersonIcon />
                            <h2>Personal Information</h2>
                        </div>
                        <div className="form-grid">
                            <div className="form-field">
                                <label>Full Legal Name *</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Amanda Miller"
                                    value={form.fullName}
                                    onChange={handleChange("fullName")}
                                    required
                                />
                            </div>
                            <div className="form-field">
                                <label>National ID / Passport / NIC</label>
                                <input
                                    type="text"
                                    placeholder="e.g. 98392019-V"
                                    value={form.nationalId}
                                    onChange={handleChange("nationalId")}
                                />
                            </div>
                            <div className="form-field">
                                <label>Date of Birth</label>
                                <input
                                    type="date"
                                    value={form.dob}
                                    onChange={handleChange("dob")}
                                />
                            </div>
                            <div className="form-field">
                                <label>Gender Identification</label>
                                <select value={form.gender} onChange={handleChange("gender")}>
                                    {GENDER_OPTIONS.map((g) => (
                                        <option key={g}>{g}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </section>

                    {/* Contact & Emergency Information */}
                    <section className="form-card">
                        <div className="form-card-title">
                            <ContactIcon />
                            <h2>Contact &amp; Emergency Information</h2>
                        </div>
                        <div className="form-grid">
                            <div className="form-field">
                                <label>Email Address *</label>
                                <input
                                    type="email"
                                    placeholder="member@domain.com"
                                    value={form.email}
                                    onChange={handleChange("email")}
                                    required
                                />
                            </div>
                            <div className="form-field">
                                <label>Mobile Phone Number</label>
                                <input
                                    type="tel"
                                    placeholder="+1 (555) 123-4567"
                                    value={form.phone}
                                    onChange={handleChange("phone")}
                                />
                            </div>
                            <div className="form-field form-field-full">
                                <label>Home Address</label>
                                <input
                                    type="text"
                                    placeholder="124 Fitness Blvd, Suite 4B, Los Angeles, CA"
                                    value={form.address}
                                    onChange={handleChange("address")}
                                />
                            </div>
                            <div className="form-field form-field-full">
                                <label>Emergency Contact Person &amp; Phone</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Mark Miller (Spouse) | +1 (555) 998-1122"
                                    value={form.emergencyContact}
                                    onChange={handleChange("emergencyContact")}
                                />
                            </div>
                        </div>
                    </section>

                    {/* Plan + Photo */}
                    <div className="form-row">
                        <section className="form-card">
                            <div className="form-card-title">
                                <PlanIcon />
                                <h2>Membership Plan Selection</h2>
                            </div>
                            <div className="form-field">
                                <label>Select Initial Membership Plan</label>
                                <select value={form.plan} onChange={handleChange("plan")}>
                                    {PLAN_OPTIONS.map((p) => (
                                        <option key={p}>{p}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-field">
                                <label>Initial Account Status</label>
                                <select value={form.status} onChange={handleChange("status")}>
                                    {STATUS_OPTIONS.map((s) => (
                                        <option key={s}>{s}</option>
                                    ))}
                                </select>
                            </div>
                        </section>

                        <section className="form-card">
                            <div className="form-card-title">
                                <PhotoIcon />
                                <h2>Identification Photo</h2>
                            </div>
                            <div className="form-field">
                                <label>Photo URL</label>
                                <input
                                    type="text"
                                    placeholder="https://images.unsplash.com/..."
                                    value={form.photoUrl}
                                    onChange={handleChange("photoUrl")}
                                />
                            </div>
                            <label className="upload-box">
                                <CameraIcon />
                                <span className="upload-title">Camera Capture / Upload</span>
                                <span className="upload-sub">
                                    PNG, JPG or WEBP formats supported up to 5MB
                                </span>
                                <input type="file" accept="image/png,image/jpeg,image/webp" hidden />
                            </label>
                        </section>
                    </div>

                    {/* Actions */}
                    <div className="form-actions">
                        <Link to="/members" className="btn-text">
                            Cancel
                        </Link>
                        <button type="submit" className="btn btn-primary">
                            <AddUserIcon />
                            Register &amp; Enrol Member
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}

/* --- Inline icons --- */

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
            <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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

function BackIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M5 12l6-6M5 12l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function PersonIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
            <path d="M4 21a8 8 0 0116 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
    );
}

function ContactIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
            <circle cx="9" cy="10" r="2" stroke="currentColor" strokeWidth="2" />
            <path d="M6 17a3 3 0 016 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M14 9h4M14 13h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
    );
}

function PlanIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="6" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="2" />
            <path d="M3 10h18" stroke="currentColor" strokeWidth="2" />
            <path d="M7 3.5v3M17 3.5v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
    );
}

function PhotoIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="6" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
            <circle cx="12" cy="13" r="3.5" stroke="currentColor" strokeWidth="2" />
            <path d="M8 6l1.2-2h5.6L16 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function CameraIcon() {
    return (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="6" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
            <circle cx="12" cy="13" r="3.5" stroke="currentColor" strokeWidth="2" />
            <path d="M8 6l1.2-2h5.6L16 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}
