import { useState } from "react";
import { useGym } from "../services/GymContext";
export const AssignPlanModal = () => {
  const { assignPlanModalState, closeAssignPlanModal, assignPlanToMember, members } = useGym();
  const [selectedMemberId, setSelectedMemberId] = useState("");
  if (!assignPlanModalState.isOpen || !assignPlanModalState.plan) return null;
  const plan = assignPlanModalState.plan;
  const handleAssign = () => {
    if (!selectedMemberId) return;
    assignPlanToMember(selectedMemberId, plan.name);
    setSelectedMemberId("");
  };
  return <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest rounded-3xl max-w-md w-full border border-outline-variant/30 shadow-2xl p-6 md:p-8 animate-fade-in">
        <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4 mb-6">
          <div>
            <h2 className="font-headline-lg text-lg font-bold text-on-surface">
              Assign Plan to Member
            </h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Enrolling into <span className="font-bold text-secondary">{plan.name}</span> (${plan.price}{plan.billingCycle})
            </p>
          </div>
          <button
    onClick={closeAssignPlanModal}
    className="p-1.5 rounded-full hover:bg-surface-container text-outline hover:text-on-surface"
  >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">
              Select Gym Member
            </label>
            <select
    value={selectedMemberId}
    onChange={(e) => setSelectedMemberId(e.target.value)}
    className="w-full bg-surface-container-low text-on-surface text-sm px-4 py-2.5 rounded-xl border border-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-secondary/50"
  >
              <option value="">-- Choose a member --</option>
              {members.map((m) => <option key={m.id} value={m.id}>
                  {m.name} ({m.memberId}) — Current: {m.plan}
                </option>)}
            </select>
          </div>

          <div className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant/20">
            <p className="text-xs font-bold text-on-surface mb-1">Plan Summary</p>
            <p className="text-xs text-on-surface-variant">
              Price: <span className="font-semibold text-on-surface">${plan.price} {plan.billingCycle}</span>
            </p>
            <ul className="mt-2 space-y-1">
              {plan.features.map((feat, i) => <li key={i} className="text-[11px] text-on-surface-variant flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-secondary text-xs">check</span>
                  {feat}
                </li>)}
            </ul>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-outline-variant/20">
          <button
    onClick={closeAssignPlanModal}
    className="px-5 py-2.5 rounded-xl text-xs font-semibold text-on-surface-variant hover:bg-surface-container transition-colors"
  >
            Cancel
          </button>
          <button
    disabled={!selectedMemberId}
    onClick={handleAssign}
    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-secondary text-on-secondary disabled:opacity-50 hover:bg-secondary/90 transition-colors shadow-sm"
  >
            Confirm & Enroll
          </button>
        </div>
      </div>
    </div>;
};
