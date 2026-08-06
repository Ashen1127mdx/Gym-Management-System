import { useEffect, useState, useCallback } from "react";
import { useGym } from "../services/GymContext";

/* ─── Helpers ──────────────────────────────────────────────────────────── */
const Card = ({ children, className = "" }) => (
  <div className={`bg-surface-container-lowest rounded-3xl border border-outline-variant/30 shadow-sm ${className}`}>
    {children}
  </div>
);

const Spinner = () => (
  <div className="flex justify-center py-16">
    <div className="w-8 h-8 rounded-full border-4 border-secondary/30 border-t-secondary animate-spin" />
  </div>
);

const Avatar = ({ name, avatarUrl }) => {
  const initials = name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "?";
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className="w-9 h-9 rounded-full object-cover flex-shrink-0"
        onError={(e) => { e.target.style.display = 'none'; }}
      />
    );
  }
  return (
    <div className="w-9 h-9 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container font-bold text-xs flex-shrink-0">
      {initials}
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const styles = {
    Active: "bg-green-50 text-green-700 border-green-200",
    Inactive: "bg-gray-50 text-gray-500 border-gray-200",
    Pending: "bg-amber-50 text-amber-700 border-amber-200",
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${styles[status] || styles.Inactive}`}>
      {status}
    </span>
  );
};

const UserTable = ({ rows, columns, onDelete, deleting, onToggleStatus, changingStatus }) => (
  <div className="overflow-hidden rounded-2xl border border-outline-variant/30">
    <table className="w-full text-sm">
      <thead>
        <tr className="bg-surface-container text-on-surface-variant">
          {columns.map(c => (
            <th key={c.key} className="text-left px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest">{c.label}</th>
          ))}
          <th className="px-5 py-3.5 text-right" />
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td colSpan={columns.length + 1} className="px-5 py-10 text-center text-on-surface-variant/60 text-xs">
              No records found.
            </td>
          </tr>
        ) : rows.map(row => (
          <tr key={row.id} className="border-t border-outline-variant/20 hover:bg-surface-container/30 transition-colors">
            {columns.map(c => (
              <td key={c.key} className="px-5 py-3.5 text-xs">
                {c.render ? c.render(row) : (row[c.key] || "—")}
              </td>
            ))}
            <td className="px-5 py-3.5 text-right flex items-center justify-end gap-2">
              {row.status === "Pending" ? (
                <button
                  disabled={changingStatus === row.id}
                  onClick={() => onToggleStatus(row.id, "Active")}
                  className="px-3 py-1 text-[10px] font-bold bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  Approve
                </button>
              ) : (
                <button
                  disabled={changingStatus === row.id}
                  onClick={() => onToggleStatus(row.id, row.status === "Active" ? "Inactive" : "Active")}
                  className={`px-3 py-1 text-[10px] font-bold border rounded-full transition-colors disabled:opacity-50 ${
                    row.status === "Active"
                      ? "border-amber-600 text-amber-600 hover:bg-amber-50"
                      : "border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                  }`}
                >
                  {row.status === "Active" ? "Suspend" : "Activate"}
                </button>
              )}
              <button
                disabled={deleting === row.id}
                onClick={() => onDelete(row.id)}
                className="px-3 py-1 text-[10px] font-bold border border-error text-error rounded-full hover:bg-error/10 transition-colors disabled:opacity-50"
              >
                {deleting === row.id ? "Removing…" : "Remove"}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

/* ─── Main Component ───────────────────────────────────────────────────── */
export const AdminMembersView = () => {
  const { apiFetch, addToast, user } = useGym();
  const [members, setMembers] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [search, setSearch] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    const query = search.trim() ? `?q=${encodeURIComponent(search.trim())}` : '';
    const [mem, trn] = await Promise.all([
      apiFetch(`/api/members.php${query}`),
      apiFetch('/api/trainers.php'),
    ]);
    setMembers(Array.isArray(mem) ? mem : []);
    setTrainers(Array.isArray(trn) ? trn : []);
    setLoading(false);
  }, [apiFetch, search]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSearchChange = e => {
    setSearch(e.target.value);
  };

  // Debounce load on search input change (simple)
  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 400);
    return () => clearTimeout(timer);
  }, [search, loadData]);

  const [changingStatus, setChangingStatus] = useState(null);

  const toggleStatus = async (type, id, targetStatus) => {
    setChangingStatus(id);
    const endpoint = type === "member" ? "/api/members.php" : "/api/trainers.php";
    const res = await apiFetch(`${endpoint}?id=${id}`, {
      method: "PUT",
      body: JSON.stringify({ status: targetStatus })
    });
    if (res?.success) {
      addToast("Status Updated", `User status changed to ${targetStatus}.`, "success");
      loadData();
    } else {
      addToast("Update Failed", res?.message || "Unable to change status.", "error");
    }
    setChangingStatus(null);
  };

  const removeUser = async (type, id) => {
    setDeleting(id);
    const endpoint = type === "member" ? "/api/members.php" : "/api/trainers.php";
    const res = await apiFetch(`${endpoint}?id=${id}`, { method: "DELETE" });
    if (res?.success) {
      addToast(`${type === "member" ? "Member" : "Trainer"} Removed`, "Successfully deleted from the system.", "success");
      loadData();
    } else {
      addToast("Remove Failed", res?.message || "Unable to remove user.", "error");
    }
    setDeleting(null);
  };

  const memberColumns = [
    {
      key: "name", label: "Name",
      render: m => (
        <div className="flex items-center gap-3">
          <Avatar name={m.name} avatarUrl={m.avatarUrl} />
          <div>
            <div className="font-semibold text-on-surface">{m.name}</div>
            <div className="text-[10px] text-on-surface-variant">{m.email}</div>
          </div>
        </div>
      )
    },
    { key: "phone", label: "Phone" },
    { key: "plan", label: "Plan" },
    {
      key: "status",
      label: "Status",
      render: m => <StatusBadge status={m.status} />
    }
  ];

  const trainerColumns = [
    {
      key: "name", label: "Name",
      render: t => (
        <div className="flex items-center gap-3">
          <Avatar name={t.name} avatarUrl={t.avatarUrl} />
          <div>
            <div className="font-semibold text-on-surface">{t.name}</div>
            <div className="text-[10px] text-on-surface-variant">{t.email}</div>
          </div>
        </div>
      )
    },
    { key: "phone", label: "Phone" },
    {
      key: "status",
      label: "Status",
      render: t => <StatusBadge status={t.status} />
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      
      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div className="bg-tertiary-container rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "repeating-linear-gradient(45deg,currentColor 0,currentColor 1px,transparent 0,transparent 50%)", backgroundSize: "12px 12px" }} />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container/30 border border-secondary/40 mb-3">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            <span className="text-xs font-bold text-secondary-fixed tracking-wide">ADMIN · MEMBERS & TRAINERS</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold">Members & Trainers</h1>
          <p className="text-xs md:text-sm text-white/70 mt-1">View all registered members and trainers. Remove any user from the system.</p>
        </div>
      </div>

      {loading ? <Spinner /> : (
        <>
          {/* ── Members Table ─────────────────────────────────────────── */}
          <Card className="p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-xl">group</span>
                <h2 className="text-base font-bold text-on-surface">Members</h2>
              </div>
              <span className="text-xs bg-secondary text-on-secondary px-2.5 py-0.5 rounded-full font-bold">{members.length}</span>
            </div>
            <UserTable
              rows={members}
              columns={memberColumns}
              onDelete={id => removeUser("member", id)}
              deleting={deleting}
              onToggleStatus={(id, target) => toggleStatus("member", id, target)}
              changingStatus={changingStatus}
            />
          </Card>

          {/* ── Trainers Table ────────────────────────────────────────── */}
          <Card className="p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-xl">fitness_center</span>
                <h2 className="text-base font-bold text-on-surface">Trainers</h2>
              </div>
              <span className="text-xs bg-secondary text-on-secondary px-2.5 py-0.5 rounded-full font-bold">{trainers.length}</span>
            </div>
            <UserTable
              rows={trainers}
              columns={trainerColumns}
              onDelete={id => removeUser("trainer", id)}
              deleting={deleting}
              onToggleStatus={(id, target) => toggleStatus("trainer", id, target)}
              changingStatus={changingStatus}
            />
          </Card>
        </>
      )}
    </div>
  );
};
