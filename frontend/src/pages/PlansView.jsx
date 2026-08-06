import { useGym } from "../services/GymContext";
export const PlansView = () => {
  const { plans, setIsAddPlanModalOpen, openAssignPlanModal, deletePlan } = useGym();
  return <div className="space-y-8 animate-fade-in pb-12">
      {
    /* Header Bar */
  }
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline-lg text-2xl font-bold text-on-surface">
            Membership Plans & Pricing
          </h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Manage billing cycles, access privileges, and recurring membership tiers.
          </p>
        </div>

        <button
    onClick={() => setIsAddPlanModalOpen(true)}
    className="px-5 py-2.5 bg-secondary text-on-secondary hover:bg-secondary/90 rounded-2xl font-headline-md text-xs font-bold flex items-center gap-2 transition-colors shadow-sm self-start sm:self-auto"
  >
          <span className="material-symbols-outlined text-lg">add</span>
          <span>Create New Plan</span>
        </button>
      </div>

      {
    /* Tiered Plan Cards Grid */
  }
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => <div
    key={plan.id}
    className={`bg-surface-container-lowest rounded-3xl p-6 md:p-8 border flex flex-col justify-between relative transition-all duration-200 card-shadow hover:-translate-y-1 ${plan.isPopular ? "border-secondary ring-2 ring-secondary/20 shadow-xl" : "border-outline-variant/30"}`}
  >
            {plan.isPopular && <span className="absolute -top-3.5 right-6 px-3 py-1 bg-secondary text-on-secondary text-[10px] font-extrabold uppercase tracking-widest rounded-full shadow-md">
                MOST POPULAR
              </span>}

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-outline">
                  {plan.tier} Tier
                </span>
                <button
    onClick={() => deletePlan(plan.id)}
    title="Delete Plan"
    className="text-outline hover:text-error"
  >
                  <span className="material-symbols-outlined text-base">delete</span>
                </button>
              </div>

              <h3 className="font-headline-lg text-xl font-bold text-on-surface">
                {plan.name}
              </h3>

              <div className="my-4 flex items-baseline gap-1">
                <span className="font-headline-lg text-4xl font-extrabold text-on-surface">
                  LKR {plan.price}
                </span>
                <span className="text-xs text-on-surface-variant font-medium">
                  {plan.billingCycle}
                </span>
              </div>

              <div className="border-t border-outline-variant/20 pt-4 mt-4 space-y-2.5">
                <p className="text-xs font-bold text-on-surface-variant mb-2">
                  Included Privileges:
                </p>
                {plan.features.map((feature, i) => <div key={i} className="flex items-center gap-2 text-xs text-on-surface">
                    <span className="material-symbols-outlined text-secondary text-base shrink-0">
                      check_circle
                    </span>
                    <span>{feature}</span>
                  </div>)}
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-outline-variant/20 space-y-2">
              <button
    onClick={() => openAssignPlanModal(plan)}
    className="w-full py-3 bg-secondary text-on-secondary rounded-2xl font-headline-md text-xs font-bold flex items-center justify-center gap-2 hover:bg-secondary/90 transition-colors shadow-xs"
  >
                <span className="material-symbols-outlined text-base">person_add</span>
                <span>Assign to Member</span>
              </button>
            </div>
          </div>)}
      </div>

      {
    /* Revenue & Tier Insights Banner */
  }
      <div className="bg-surface-container-lowest p-6 md:p-8 rounded-3xl border border-outline-variant/30 card-shadow">
        <h3 className="font-headline-lg text-base font-bold text-on-surface mb-4">
          Membership Performance Insights
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-4 bg-surface-container-low rounded-2xl">
            <p className="text-xs text-outline font-semibold uppercase">
              Average Member Lifetime Value
            </p>
            <p className="font-headline-lg text-2xl font-extrabold text-on-surface mt-1">
              LKR {680000..toLocaleString("en-US")}
            </p>
            <p className="text-[11px] text-emerald-700 font-bold mt-1">
              +14% vs last quarter
            </p>
          </div>
          <div className="p-4 bg-surface-container-low rounded-2xl">
            <p className="text-xs text-outline font-semibold uppercase">
              Top Converting Tier
            </p>
            <p className="font-headline-lg text-2xl font-extrabold text-on-surface mt-1">
              Quarterly Active
            </p>
            <p className="text-[11px] text-on-surface-variant font-medium mt-1">
              48% total member market share
            </p>
          </div>
          <div className="p-4 bg-surface-container-low rounded-2xl">
            <p className="text-xs text-outline font-semibold uppercase">
              Annual Subscription Retention
            </p>
            <p className="font-headline-lg text-2xl font-extrabold text-on-surface mt-1">
              92.4%
            </p>
            <p className="text-[11px] text-emerald-700 font-bold mt-1">
              Highest lifetime retention rate
            </p>
          </div>
        </div>
      </div>
    </div>;
};
