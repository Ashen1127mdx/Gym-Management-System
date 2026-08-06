import { useState } from "react";
import { useGym } from "../services/GymContext";
export const MembersView = () => {
  const { members, setActiveTab, deleteMember, checkInMember, searchQuery, setSearchQuery } = useGym();
  const [planFilter, setPlanFilter] = useState("All");
  const [selectedIds, setSelectedIds] = useState([]);
  const filteredMembers = members.filter((m) => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.memberId.toLowerCase().includes(searchQuery.toLowerCase()) || m.email.toLowerCase().includes(searchQuery.toLowerCase()) || m.phone.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlan = planFilter === "All" || m.plan === planFilter;
    return matchesSearch && matchesPlan;
  });
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredMembers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredMembers.map((m) => m.id));
    }
  };
  const toggleSelectOne = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };
  return <div className="space-y-6 animate-fade-in pb-12">
      {
    /* Header Bar */
  }
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline-lg text-2xl font-bold text-on-surface">
            Members Directory
          </h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Manage gym memberships, profiles, billing plans, and status logs.
          </p>
        </div>

        <button
    onClick={() => setActiveTab("members-add")}
    className="px-5 py-2.5 bg-secondary text-on-secondary hover:bg-secondary/90 rounded-2xl font-headline-md text-xs font-bold flex items-center gap-2 transition-colors shadow-sm self-start sm:self-auto"
  >
          <span className="material-symbols-outlined text-lg">person_add</span>
          <span>Add New Member</span>
        </button>
      </div>

      {
    /* Filter and Search Bar Card */
  }
      <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/30 card-shadow space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {
    /* Search Input */
  }
          <div className="relative w-full md:w-80">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-lg">
              search
            </span>
            <input
    type="text"
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    placeholder="Search by name, ID, email..."
    className="w-full bg-surface-container-low text-on-surface text-xs pl-10 pr-4 py-2.5 rounded-xl border border-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-secondary/50"
  />
          </div>


          {
    /* Plan Dropdown */
  }
          <div className="w-full md:w-48">
            <select
    value={planFilter}
    onChange={(e) => setPlanFilter(e.target.value)}
    className="w-full bg-surface-container-low text-on-surface text-xs px-3 py-2.5 rounded-xl border border-outline-variant/40 focus:outline-none"
  >
              <option value="All">All Membership Plans</option>
              <option value="Annual Elite">Annual Elite</option>
              <option value="Monthly Pro">Monthly Pro</option>
              <option value="Day Pass">Day Pass</option>
            </select>
          </div>
        </div>
      </div>

      {
    /* Members Directory Table */
  }
      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 card-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/50 border-b border-outline-variant/30 text-[11px] font-bold text-outline uppercase tracking-wider">
                <th className="py-3.5 px-4 w-10 text-center">
                  <input
    type="checkbox"
    checked={selectedIds.length === filteredMembers.length && filteredMembers.length > 0}
    onChange={toggleSelectAll}
    className="w-4 h-4 accent-secondary rounded-sm cursor-pointer"
  />
                </th>
                <th className="py-3.5 px-4">Member Name</th>
                <th className="py-3.5 px-4">Member ID</th>
                <th className="py-3.5 px-4">Contact Info</th>
                <th className="py-3.5 px-4">Plan Tier</th>
                <th className="py-3.5 px-4">Joined Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 text-xs">
              {filteredMembers.length === 0 ? <tr>
                  <td colSpan={8} className="py-12 text-center text-outline">
                    <span className="material-symbols-outlined text-4xl block mb-2">
                      person_search
                    </span>
                    No members match the selected criteria.
                  </td>
                </tr> : filteredMembers.map((member) => <tr
    key={member.id}
    className="hover:bg-surface-container-low/50 transition-colors"
  >
                    <td className="py-3.5 px-4 text-center">
                      <input
    type="checkbox"
    checked={selectedIds.includes(member.id)}
    onChange={() => toggleSelectOne(member.id)}
    className="w-4 h-4 accent-secondary rounded-sm cursor-pointer"
  />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {member.avatarUrl ? <img
    src={member.avatarUrl}
    alt={member.name}
    referrerPolicy="no-referrer"
    className="w-9 h-9 rounded-full object-cover"
  /> : <div className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center font-bold text-on-surface text-xs">
                            {member.initials}
                          </div>}
                        <div>
                          <p className="font-bold text-on-surface">{member.name}</p>
                          <p className="text-[10px] text-outline">{member.gender}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-on-surface">
                      {member.memberId}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-medium text-on-surface">{member.email}</p>
                      <p className="text-[10px] text-outline">{member.phone}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-surface-container-high text-on-surface font-semibold text-[11px]">
                        {member.plan}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-on-surface-variant">
                      {member.joinDate}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
    onClick={() => checkInMember(member.name)}
    title="Instant Check-In"
    className="p-1.5 rounded-lg hover:bg-secondary-fixed text-secondary transition-colors"
  >
                          <span className="material-symbols-outlined text-lg">
                            how_to_reg
                          </span>
                        </button>
                        <button
    onClick={() => deleteMember(member.id)}
    title="Delete Member"
    className="p-1.5 rounded-lg hover:bg-error-container text-error transition-colors"
  >
                          <span className="material-symbols-outlined text-lg">
                            delete
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>)}
            </tbody>
          </table>
        </div>

        {
    /* Footer Counter */
  }
        <div className="p-4 bg-surface-container-low/30 border-t border-outline-variant/20 flex items-center justify-between text-xs text-outline">
          <span>
            Showing {filteredMembers.length} of {members.length} members
          </span>
          <div className="flex items-center gap-1">
            <button className="px-3 py-1 rounded-lg bg-surface-container-high font-semibold text-on-surface hover:bg-surface-container-highest">
              Previous
            </button>
            <button className="px-3 py-1 rounded-lg bg-secondary text-on-secondary font-bold">
              1
            </button>
            <button className="px-3 py-1 rounded-lg bg-surface-container-high font-semibold text-on-surface hover:bg-surface-container-highest">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>;
};
