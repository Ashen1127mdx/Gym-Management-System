import { useState } from "react";
import { useGym } from "../services/GymContext";
export const AddPlanModal = () => {
  const { isAddPlanModalOpen, setIsAddPlanModalOpen, addPlan } = useGym();
  const [name, setName] = useState("");
  const [price, setPrice] = useState(79);
  const [billingCycle, setBillingCycle] = useState("/ month");
  const [tier, setTier] = useState("Growth");
  const [featureInput, setFeatureInput] = useState("");
  const [features, setFeatures] = useState([
    "Full Gym Access",
    "Locker & Shower Access"
  ]);
  const [customQty, setCustomQty] = useState(1);
  const [customUnit, setCustomUnit] = useState("months");

  if (!isAddPlanModalOpen) return null;
  const handleAddFeature = () => {
    if (featureInput.trim()) {
      setFeatures([...features, featureInput.trim()]);
      setFeatureInput("");
    }
  };
  const handleRemoveFeature = (index) => {
    setFeatures(features.filter((_, i) => i !== index));
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name) return;

    const billingCycleVal = billingCycle === "Other"
      ? `/ ${customQty} ${customUnit}`
      : billingCycle;

    addPlan({
      name,
      price: Number(price),
      billingCycle: billingCycleVal,
      tier,
      features
    });
    setName("");
    setPrice(79);
    setFeatures(["Full Gym Access", "Locker & Shower Access"]);
    setBillingCycle("/ month");
    setCustomQty(1);
    setCustomUnit("months");
    setIsAddPlanModalOpen(false);
  };
  return <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest rounded-3xl max-w-lg w-full border border-outline-variant/30 shadow-2xl p-6 md:p-8 animate-fade-in">
        <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4 mb-6">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-secondary text-2xl">
              card_membership
            </span>
            <h2 className="font-headline-lg text-lg font-bold text-on-surface">
              Create Membership Plan
            </h2>
          </div>
          <button
    onClick={() => setIsAddPlanModalOpen(false)}
    className="p-1.5 rounded-full hover:bg-surface-container text-outline hover:text-on-surface"
  >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-1">
              Plan Title *
            </label>
            <input
    type="text"
    required
    placeholder="e.g. Bi-Annual Active"
    value={name}
    onChange={(e) => setName(e.target.value)}
    className="w-full bg-surface-container-low text-on-surface text-sm px-4 py-2.5 rounded-xl border border-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-secondary/50"
  />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                Price (LKR)
              </label>
              <input
    type="number"
    required
    value={price}
    onChange={(e) => setPrice(Number(e.target.value))}
    className="w-full bg-surface-container-low text-on-surface text-sm px-4 py-2.5 rounded-xl border border-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-secondary/50"
  />
            </div>
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                Billing Cycle
              </label>
              <select
                value={billingCycle}
                onChange={(e) => setBillingCycle(e.target.value)}
                className="w-full bg-surface-container-low text-on-surface text-sm px-4 py-2.5 rounded-xl border border-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-secondary/50"
              >
                <option value="/ day">/ day</option>
                <option value="/ week">/ week</option>
                <option value="/ month">/ month</option>
                <option value="/ 3 months">/ 3 months</option>
                <option value="/ 6 months">/ 6 months</option>
                <option value="/ year">/ year</option>
                <option value="Other">Other</option>
              </select>
            </div>
            {billingCycle === "Other" && (
              <div className="col-span-3 grid grid-cols-2 gap-3 bg-surface-container-low p-4 rounded-2xl border border-outline-variant/30 mt-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Duration Quantity</label>
                  <input
                    type="number" min="1" value={customQty} onChange={e => setCustomQty(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-surface-container text-on-surface text-sm px-4 py-2 rounded-xl border border-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-secondary/50"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Unit</label>
                  <select value={customUnit} onChange={e => setCustomUnit(e.target.value)}
                    className="w-full bg-surface-container text-on-surface text-sm px-4 py-2 rounded-xl border border-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-secondary/50">
                    <option>days</option>
                    <option>weeks</option>
                    <option>months</option>
                    <option>years</option>
                  </select>
                </div>
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                Tier Level
              </label>
              <select
    value={tier}
    onChange={(e) => setTier(e.target.value)}
    className="w-full bg-surface-container-low text-on-surface text-sm px-4 py-2.5 rounded-xl border border-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-secondary/50"
  >
                <option value="Standard">Standard</option>
                <option value="Growth">Growth</option>
                <option value="Premium">Premium</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-1">
              Included Features
            </label>
            <div className="flex gap-2 mb-2">
              <input
    type="text"
    placeholder="Add feature item..."
    value={featureInput}
    onChange={(e) => setFeatureInput(e.target.value)}
    onKeyDown={(e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleAddFeature();
      }
    }}
    className="flex-1 bg-surface-container-low text-on-surface text-sm px-4 py-2 rounded-xl border border-outline-variant/40 focus:outline-none"
  />
              <button
    type="button"
    onClick={handleAddFeature}
    className="px-3 py-2 bg-surface-container-high font-semibold text-xs rounded-xl hover:bg-surface-container-highest text-on-surface"
  >
                Add
              </button>
            </div>

            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {features.map((feat, idx) => <div
    key={idx}
    className="flex items-center justify-between px-3 py-1.5 bg-surface-container-low rounded-lg text-xs"
  >
                  <span className="text-on-surface">{feat}</span>
                  <button
    type="button"
    onClick={() => handleRemoveFeature(idx)}
    className="text-outline hover:text-error"
  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>)}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-outline-variant/20">
            <button
    type="button"
    onClick={() => setIsAddPlanModalOpen(false)}
    className="px-5 py-2.5 rounded-xl text-xs font-semibold text-on-surface-variant hover:bg-surface-container transition-colors"
  >
              Cancel
            </button>
            <button
    type="submit"
    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-secondary text-on-secondary hover:bg-secondary/90 transition-colors shadow-sm"
  >
              Save Plan
            </button>
          </div>
        </form>
      </div>
    </div>;
};
