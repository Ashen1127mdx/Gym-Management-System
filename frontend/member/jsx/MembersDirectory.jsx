import { useState, useMemo } from "react";
import Sidebar from "./Sidebar";
import "../css/MembersDirectory.css";

// Sample data — replace this with data fetched from your PHP API
const MEMBERS = [
  {
    id: "FZ-1029",
    name: "Sarah Jenkins",
    gender: "Female",
    email: "s.jenkins@email.com",
    phone: "+1 987 654 321",
    plan: "Monthly Pro",
    joined: "Nov 05, 2023",
    status: "Active",
    avatar: "https://i.pravatar.cc/80?img=47",
  },
  {
    id: "FZ-1045",
    name: "Marcus Thompson",
    gender: "Male",
    email: "marcus.t@fitzone.com",
    phone: "+1 234 567 890",
    plan: "Annual Elite",
    joined: "Oct 24, 2023",
    status: "Active",
    avatar: "https://i.pravatar.cc/80?img=12",
  },
  {
    id: "FZ-0998",
    name: "Elena Rodriguez",
    gender: "Female",
    email: "elena.r@web.com",
    phone: "+1 444 321 0987",
    plan: "Day Pass",
    joined: "Mar 28, 2024",
    status: "Guest",
    avatar: "https://i.pravatar.cc/80?img=32",
  },
  {
    id: "FZ-1102",
    name: "David Lee",
    gender: "Male",
    email: "david.lee@service.org",
    phone: "+1 555 123 4567",
    plan: "Annual Elite",
    joined: "Jan 12, 2024",
    status: "Active",
    avatar: "https://i.pravatar.cc/80?img=14",
  },
  {
    id: "FZ-1051",
    name: "Kelly White",
    gender: "Female",
    email: "kelly.w@mail.com",
    phone: "+1 222 333 4444",
    plan: "Monthly Pro",
    joined: "Feb 15, 2024",
    status: "Flagged",
    avatar: "https://i.pravatar.cc/80?img=25",
  },
  {
    id: "FZ-1011",
    name: "John Doe",
    gender: "Male",
    email: "john.doe@email.com",
    phone: "+1 234 567 890",
    plan: "Annual Elite",
    joined: "Oct 12, 2023",
    status: "Active",
    avatar: "https://i.pravatar.cc/80?img=8",
  },
  {
    id: "FZ-1088",
    name: "Michael Chen",
    gender: "Male",
    email: "m.chen@service.org",
    phone: "+1 555 123 4567",
    plan: "Annual Elite",
    joined: "Jan 12, 2024",
    status: "Active",
    initials: "MC",
  },
  {
    id: "FZ-1092",
    name: "Amanda Miller",
    gender: "Female",
    email: "amanda.m@web.com",
    phone: "+1 444 321 0987",
    plan: "Day Pass",
    joined: "Mar 28, 2024",
    status: "Active",
    initials: "AM",
  },
  {
    id: "FZ-1077",
    name: "David Ross",
    gender: "Male",
    email: "ross.david@mail.com",
    phone: "+1 222 333 4444",
    plan: "Monthly Pro",
    joined: "Feb 15, 2024",
    status: "Expired",
    initials: "DR",
  },
];

const FILTERS = ["All", "Active", "Guest", "Expired", "Flagged"];
const STATUS_CLASS = {
  Active: "status-active",
  Guest: "status-guest",
  Flagged: "status-flagged",
  Expired: "status-expired",
};

export default function MembersDirectory() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [selected, setSelected] = useState([]);

  const filteredMembers = useMemo(() => {
    return MEMBERS.filter((m) => {
      const matchesFilter = activeFilter === "All" || m.status === activeFilter;
      const q = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.id.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, searchTerm]);

  const toggleSelected = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    setSelected((prev) =>
      prev.length === filteredMembers.length
        ? []
        : filteredMembers.map((m) => m.id)
    );
  };

  return (
    <div className="app-layout">
      <Sidebar active="Members" />

      <div className="app-main">
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
              <button className="btn btn-primary">
                <AddUserIcon />
                Add New Member
              </button>
            </div>

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
                          {m.avatar ? (
                            <img src={m.avatar} alt={m.name} className="member-avatar" />
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
                          <button className="row-action-btn" aria-label="Check in">
                            <CheckInIcon small />
                          </button>
                          <button className="row-action-btn delete" aria-label="Delete">
                            <TrashIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="table-footer">
                <span>
                  Showing {filteredMembers.length} of {MEMBERS.length} members
                </span>
                <div className="pagination">
                  <button className="page-btn">Previous</button>
                  <button className="page-btn active">1</button>
                  <button className="page-btn">Next</button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
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
