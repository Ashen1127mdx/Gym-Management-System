import { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../css/MembersDirectory.css";

const API_BASE = import.meta.env.VITE_API_BASE || "/api";

const FILTERS = ["All", "Active", "Guest", "Expired", "Flagged"];
const STATUS_CLASS = {
    Active: "status-active",
    Guest: "status-guest",
    Flagged: "status-flagged",
    Expired: "status-expired",
};

const GENDER_OPTIONS = ["Male", "Female", "Other", "Prefer not to say"];

const initialEditForm = {
    fullName: "",
    nic: "",
    dob: "",
    gender: "Male",
    email: "",
    phone: "",
    address: "",
    emergencyContact: "",
    plan: "Monthly Pro ($49/mo)",
    status: "Active",
    joinDate: "",
    photoUrl: "",
};

const normalizeMembers = (members) =>
    members.map((member) => normalizeMember(member));

const normalizeMember = (member) => ({
    ...member,
    id: String(member.member_id),
    name: member.full_name || "",
    email: member.email || "",
    gender: member.gender || "",
    plan: member.plan_label || "Unassigned",
    joined: member.join_date || "",
    phone: member.contact || "",
    initials: member.photo_url
        ? null
        : (member.full_name || "")
            .split(" ")
            .map((part) => part[0])
            .join("")
            .slice(0, 2)
            .toUpperCase(),
    avatar: member.photo_url || null,
    status: member.status || "Active",
});

export default function MembersDirectory() {
    const [members, setMembers] = useState([]);
    const [activeFilter, setActiveFilter] = useState("All");
    const [searchTerm, setSearchTerm] = useState("");
    const [selected, setSelected] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deletingIds, setDeletingIds] = useState([]);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editMemberId, setEditMemberId] = useState(null);
    const [editForm, setEditForm] = useState(initialEditForm);
    const [editSubmitting, setEditSubmitting] = useState(false);
    const [editError, setEditError] = useState(null);
    const [editSuccess, setEditSuccess] = useState(null);
    const [editPhotoFile, setEditPhotoFile] = useState(null);
    const [editPhotoPreview, setEditPhotoPreview] = useState(null);
    const [editPhotoError, setEditPhotoError] = useState(null);
    const [failedAvatars, setFailedAvatars] = useState([]);

    const fetchMembers = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE}/getMembers.php`);
            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Failed to load members.");
            }

            setMembers(normalizeMembers(data.data || []));
        } catch (fetchError) {
            setError(fetchError.message);
            setMembers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteMember = async (id) => {
        if (!window.confirm("Are you sure you want to delete this member?")) {
            return;
        }

        setError(null);
        setDeletingIds((prev) => [...prev, id]);

        try {
            const response = await fetch(`${API_BASE}/deleteMember.php`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ member_id: id }),
            });
            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || data.message || "Failed to delete member.");
            }

            setMembers((prev) => prev.filter((member) => member.id !== id));
            setSelected((prev) => prev.filter((selectedId) => selectedId !== id));
        } catch (deleteError) {
            setError(deleteError.message);
        } finally {
            setDeletingIds((prev) => prev.filter((deletingId) => deletingId !== id));
        }
    };

    const filteredMembers = useMemo(() => {
        return members.filter((m) => {
            const matchesFilter = activeFilter === "All" || m.status === activeFilter;
            const q = searchTerm.trim().toLowerCase();
            const matchesSearch =
                !q ||
                m.name.toLowerCase().includes(q) ||
                String(m.id).toLowerCase().includes(q) ||
                m.email.toLowerCase().includes(q);
            return matchesFilter && matchesSearch;
        });
    }, [activeFilter, searchTerm, members]);

    const toggleSelected = (id) => {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const navigate = useNavigate();
    const location = useLocation();

    const resetEditState = () => {
        setEditMemberId(null);
        setEditForm(initialEditForm);
        setEditSubmitting(false);
        setEditError(null);
        setEditSuccess(null);
        setEditPhotoFile(null);
        setEditPhotoPreview(null);
        setEditPhotoError(null);
    };

    const setEditFormFromMember = (member) => {
        setEditForm({
            fullName: member.full_name || member.name || "",
            nic: member.nic || "",
            dob: member.dob || "",
            gender: member.gender || "Male",
            email: member.email || "",
            phone: member.contact || "",
            address: member.address || "",
            emergencyContact: member.emergency_contact || "",
            plan: member.plan_label || member.plan || "Monthly Pro ($49/mo)",
            status: member.status || "Active",
            joinDate: member.join_date || member.joined || "",
            photoUrl: member.photo_url || member.avatar || "",
        });
    };

    const fetchMemberById = async (id) => {
        const response = await fetch(`${API_BASE}/getMembers.php?member_id=${id}`);
        const data = await response.json();
        if (!response.ok || !data.success) {
            throw new Error(data.message || "Unable to load member data.");
        }
        if (!Array.isArray(data.data) || data.data.length === 0) {
            throw new Error("Member not found.");
        }
        return data.data[0];
    };

    const openEditModal = async (id) => {
        resetEditState();
        try {
            const existing = members.find((member) => member.id === id);
            const member = existing ? existing : await fetchMemberById(id);
            setEditMemberId(id);
            setEditFormFromMember(member);
            setIsEditOpen(true);
        } catch (fetchError) {
            setError(fetchError.message);
        }
    };

    const closeEditModal = () => {
        resetEditState();
        setIsEditOpen(false);
    };

    const handleEditChange = (field) => (e) => {
        setEditForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

    const handleEditFileChange = (e) => {
        const file = e.target.files?.[0];
        setEditPhotoError(null);

        if (!file) {
            return;
        }

        const allowedTypes = ["image/png", "image/jpeg", "image/webp"];
        if (!allowedTypes.includes(file.type)) {
            setEditPhotoError("Only PNG, JPG, or WEBP images are allowed.");
            e.target.value = "";
            setEditPhotoFile(null);
            setEditPhotoPreview(null);
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setEditPhotoError("Image must be 5MB or smaller.");
            e.target.value = "";
            setEditPhotoFile(null);
            setEditPhotoPreview(null);
            return;
        }

        if (editPhotoPreview) {
            URL.revokeObjectURL(editPhotoPreview);
        }

        setEditPhotoFile(file);
        setEditPhotoPreview(URL.createObjectURL(file));
    };

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        setEditError(null);
        setEditSuccess(null);

        const requiredFields = [
            editForm.fullName,
            editForm.nic,
            editForm.dob,
            editForm.email,
            editForm.phone,
            editForm.gender,
            editForm.plan,
            editForm.status,
            editForm.joinDate,
        ];

        if (requiredFields.some((value) => !value?.toString().trim())) {
            setEditError("Please complete all required fields.");
            return;
        }

        if (editPhotoError) {
            setEditError(editPhotoError);
            return;
        }

        const formData = new FormData();
        formData.append("member_id", editMemberId);
        formData.append("full_name", editForm.fullName.trim());
        formData.append("nic", editForm.nic.trim());
        formData.append("dob", editForm.dob);
        formData.append("gender", editForm.gender);
        formData.append("email", editForm.email.trim());
        formData.append("contact", editForm.phone.trim());
        formData.append("address", editForm.address.trim() || "");
        formData.append("emergency_contact", editForm.emergencyContact.trim() || "");
        formData.append("plan_label", editForm.plan);
        formData.append("join_date", editForm.joinDate);
        formData.append("status", editForm.status);

        if (editPhotoFile) {
            formData.append("photo", editPhotoFile);
        } else if (editForm.photoUrl.trim()) {
            formData.append("photo_url", editForm.photoUrl.trim());
        }

        setEditSubmitting(true);

        try {
            const response = await fetch(`${API_BASE}/updateMember.php`, {
                method: "POST",
                body: formData,
            });

            const json = await response.json();

            if (!response.ok || !json.success) {
                const errorMessage = json.message || (json.errors ? json.errors.join(" ") : "Unable to update member.");
                throw new Error(errorMessage);
            }

            setEditSuccess(json.message || "Member updated successfully.");
            closeEditModal();
            fetchMembers();
        } catch (updateError) {
            setEditError(updateError.message);
        } finally {
            setEditSubmitting(false);
        }
    };

    const toggleSelectAll = () => {
        setSelected((prev) =>
            prev.length === filteredMembers.length
                ? []
                : filteredMembers.map((m) => m.id)
        );
    };

    useEffect(() => {
        fetchMembers();
    }, []);

    useEffect(() => {
        if (location.state?.refresh === true) {
            fetchMembers();
        }
    }, [location.state]);

    useEffect(() => {
        if (location.state?.newMember) {
            const normalized = normalizeMember(location.state.newMember);
            setMembers((prev) => {
                if (prev.some((member) => member.id === normalized.id)) {
                    return prev;
                }
                return [normalized, ...prev];
            });
        }
    }, [location.state?.newMember]);

    const handleAvatarError = (id) => {
        setFailedAvatars((prev) => (prev.includes(id) ? prev : [...prev, id]));
    };

    return (
        <div className="members-page">
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
                        <h1>Members Directory</h1>
                        <p>Manage gym memberships, profiles, billing plans, and status logs.</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => navigate('/add-member')}>
                        <AddUserIcon />
                        Add New Member
                    </button>
                </div>

                {loading && <div className="info-banner">Loading members...</div>}
                {error && <div className="error-banner">{error}</div>}
                {!loading && !error && members.length === 0 && (
                    <div className="info-banner">No members found yet.</div>
                )}

                {/* Filter bar */}
                <div className="filter-bar">
                    <div className="search-input">
                        <SearchIcon />
                        <input
                            type="text"
                            placeholder="Search by name, ID, email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="filter-tabs">
                        {FILTERS.map((f) => (
                            <button
                                key={f}
                                className={`filter-tab ${activeFilter === f ? "active" : ""}`}
                                onClick={() => setActiveFilter(f)}
                            >
                                {f}
                            </button>
                        ))}
                    </div>

                    <select className="plan-select" defaultValue="All Membership Plans">
                        <option>All Membership Plans</option>
                        <option>Monthly Pro</option>
                        <option>Annual Elite</option>
                        <option>Day Pass</option>
                    </select>
                </div>

                {/* Table */}
                <div className="table-card">
                    <table className="members-table">
                        <thead>
                            <tr>
                                <th className="col-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={
                                            selected.length === filteredMembers.length &&
                                            filteredMembers.length > 0
                                        }
                                        onChange={toggleSelectAll}
                                    />
                                </th>
                                <th>Member Name</th>
                                <th>Member ID</th>
                                <th>Contact Info</th>
                                <th>Plan Tier</th>
                                <th>Joined Date</th>
                                <th>Status</th>
                                <th className="col-actions">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredMembers.map((m) => (
                                <tr key={m.id}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={selected.includes(m.id)}
                                            onChange={() => toggleSelected(m.id)}
                                        />
                                    </td>
                                    <td>
                                        <div className="member-cell">
                                            {m.avatar && !failedAvatars.includes(m.id) ? (
                                                <img
                                                    src={m.avatar}
                                                    alt={m.name}
                                                    className="member-avatar"
                                                    onError={() => handleAvatarError(m.id)}
                                                />
                                            ) : (
                                                <span className="member-initials">{m.initials}</span>
                                            )}
                                            <div>
                                                <div className="member-name">{m.name}</div>
                                                <div className="member-gender">{m.gender}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="member-id">#{m.id}</td>
                                    <td>
                                        <div className="contact-email">{m.email}</div>
                                        <div className="contact-phone">{m.phone}</div>
                                    </td>
                                    <td>
                                        <span className="plan-badge">{m.plan}</span>
                                    </td>
                                    <td className="joined-date">{m.joined}</td>
                                    <td>
                                        <span className={`status-badge ${STATUS_CLASS[m.status]}`}>
                                            {m.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="row-actions">
                                            <button
                                                className="row-action-btn edit"
                                                aria-label="Edit"
                                                onClick={() => navigate('/add-member', {
                                                    state: {
                                                        mode: 'edit',
                                                        member_id: m.id,
                                                        member: {
                                                            member_id: m.id,
                                                            full_name: m.name,
                                                            nic: m.nic || '',
                                                            dob: m.dob || '',
                                                            gender: m.gender || 'Male',
                                                            email: m.email || '',
                                                            contact: m.phone || '',
                                                            address: m.address || '',
                                                            emergency_contact: m.emergencyContact || '',
                                                            plan_label: m.plan || '',
                                                            join_date: m.joined || '',
                                                            photo_url: m.avatar || m.photoUrl || '',
                                                            status: m.status || 'Active',
                                                        },
                                                    },
                                                })}
                                            >
                                                <EditIcon />
                                            </button>
                                            <button className="row-action-btn" aria-label="Check in">
                                                <CheckInIcon small />
                                            </button>
                                            <button
                                                className="row-action-btn delete"
                                                aria-label="Delete"
                                                disabled={deletingIds.includes(m.id)}
                                                onClick={() => handleDeleteMember(m.id)}
                                            >
                                                {deletingIds.includes(m.id) ? "Deleting..." : <TrashIcon />}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="table-footer">
                        <span>
                            Showing {filteredMembers.length} of {members.length} members
                        </span>
                        <div className="pagination">
                            <button className="page-btn">Previous</button>
                            <button className="page-btn active">1</button>
                            <button className="page-btn">Next</button>
                        </div>
                    </div>
                </div>

                {isEditOpen && (
                    <div className="modal-overlay" onClick={closeEditModal}>
                        <div className="modal-window" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <div>
                                    <h2>Edit Member</h2>
                                    <p>Update member details and save changes.</p>
                                </div>
                                <button className="modal-close" type="button" onClick={closeEditModal}>
                                    ×
                                </button>
                            </div>

                            {editError && <div className="error-banner">{editError}</div>}
                            {editSuccess && <div className="info-banner">{editSuccess}</div>}

                            <form className="edit-member-form" onSubmit={handleUpdateSubmit}>
                                <div className="form-row">
                                    <div className="form-card">
                                        <div className="form-card-title">
                                            <PersonIcon />
                                            <h2>Personal Information</h2>
                                        </div>
                                        <div className="form-grid">
                                            <div className="form-field">
                                                <label>Full Legal Name</label>
                                                <input
                                                    type="text"
                                                    value={editForm.fullName}
                                                    onChange={handleEditChange("fullName")}
                                                />
                                            </div>
                                            <div className="form-field">
                                                <label>NIC / ID Number</label>
                                                <input
                                                    type="text"
                                                    value={editForm.nic}
                                                    onChange={handleEditChange("nic")}
                                                />
                                            </div>
                                            <div className="form-field">
                                                <label>Date of Birth</label>
                                                <input
                                                    type="date"
                                                    value={editForm.dob}
                                                    onChange={handleEditChange("dob")}
                                                />
                                            </div>
                                            <div className="form-field">
                                                <label>Gender</label>
                                                <select value={editForm.gender} onChange={handleEditChange("gender")}>
                                                    {GENDER_OPTIONS.map((g) => (
                                                        <option key={g}>{g}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="form-card">
                                        <div className="form-card-title">
                                            <ContactIcon />
                                            <h2>Contact & Membership</h2>
                                        </div>
                                        <div className="form-grid">
                                            <div className="form-field">
                                                <label>Email Address</label>
                                                <input
                                                    type="email"
                                                    value={editForm.email}
                                                    onChange={handleEditChange("email")}
                                                />
                                            </div>
                                            <div className="form-field">
                                                <label>Contact Number</label>
                                                <input
                                                    type="tel"
                                                    value={editForm.phone}
                                                    onChange={handleEditChange("phone")}
                                                />
                                            </div>
                                            <div className="form-field form-field-full">
                                                <label>Home Address</label>
                                                <input
                                                    type="text"
                                                    value={editForm.address}
                                                    onChange={handleEditChange("address")}
                                                />
                                            </div>
                                            <div className="form-field form-field-full">
                                                <label>Emergency Contact</label>
                                                <input
                                                    type="text"
                                                    value={editForm.emergencyContact}
                                                    onChange={handleEditChange("emergencyContact")}
                                                />
                                            </div>
                                            <div className="form-field">
                                                <label>Membership Plan</label>
                                                <select value={editForm.plan} onChange={handleEditChange("plan")}>
                                                    {PLAN_OPTIONS.map((p) => (
                                                        <option key={p}>{p}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="form-field">
                                                <label>Account Status</label>
                                                <select value={editForm.status} onChange={handleEditChange("status")}>
                                                    {STATUS_OPTIONS.map((s) => (
                                                        <option key={s}>{s}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="form-field">
                                                <label>Join Date</label>
                                                <input
                                                    type="date"
                                                    value={editForm.joinDate}
                                                    onChange={handleEditChange("joinDate")}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="form-card">
                                    <div className="form-card-title">
                                        <PhotoIcon />
                                        <h2>Profile Photo</h2>
                                    </div>
                                    <div className="form-field">
                                        <label>Photo URL</label>
                                        <input
                                            type="text"
                                            value={editForm.photoUrl}
                                            onChange={handleEditChange("photoUrl")}
                                        />
                                    </div>
                                    <div className="form-field">
                                        <label className="upload-box edit-upload-box">
                                            <CameraIcon />
                                            <span className="upload-title">Upload New Photo</span>
                                            <span className="upload-sub">
                                                PNG, JPG or WEBP formats supported up to 5MB
                                            </span>
                                            <input
                                                type="file"
                                                accept="image/png,image/jpeg,image/webp"
                                                hidden
                                                onChange={handleEditFileChange}
                                            />
                                        </label>
                                    </div>
                                    {editPhotoError && <div className="field-error">{editPhotoError}</div>}
                                    {editPhotoPreview && (
                                        <div className="photo-preview">
                                            <img src={editPhotoPreview} alt="Photo preview" />
                                        </div>
                                    )}
                                </div>

                                <div className="modal-actions">
                                    <button type="button" className="btn btn-secondary" onClick={closeEditModal}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary" disabled={editSubmitting}>
                                        {editSubmitting ? "Saving..." : "Save Changes"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
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

function CheckInIcon({ small }) {
    const size = small ? 16 : 18;
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
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

function PersonIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
            <path d="M4 21c0-4 4-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
    );
}

function ContactIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M4 4h16v16H4z" stroke="currentColor" strokeWidth="2" />
            <path d="M8 8h8M8 12h8M8 16h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
    );
}

function PhotoIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <rect x="4" y="6" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
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

function EditIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
                d="M12 20h9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4 12.5-12.5z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
