import { useGym } from "../services/GymContext";
export const TrainersView = () => {
  const { trainers, setIsAddTrainerModalOpen, deleteTrainer, setActiveTab } = useGym();
  return <div className="space-y-8 animate-fade-in pb-12">
      {
    /* Header Bar */
  }
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline-lg text-2xl font-bold text-on-surface">
            Trainers & Coaching Staff
          </h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Manage fitness instructors, class schedules, specializations, and member allocations.
          </p>
        </div>

        <button
    onClick={() => setIsAddTrainerModalOpen(true)}
    className="px-5 py-2.5 bg-secondary text-on-secondary hover:bg-secondary/90 rounded-2xl font-headline-md text-xs font-bold flex items-center gap-2 transition-colors shadow-sm self-start sm:self-auto"
  >
          <span className="material-symbols-outlined text-lg">person_add</span>
          <span>Add Trainer Staff</span>
        </button>
      </div>

      {
    /* Trainers Cards Grid */
  }
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {trainers.map((trainer) => <div
    key={trainer.id}
    className="bg-surface-container-lowest rounded-3xl p-6 border border-outline-variant/30 card-shadow hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between"
  >
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <img
    src={trainer.avatarUrl}
    alt={trainer.name}
    referrerPolicy="no-referrer"
    className="w-16 h-16 rounded-2xl object-cover ring-2 ring-secondary/20 shadow-md"
  />
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-secondary-fixed text-on-secondary-fixed">
                  Trainer
                </span>
              </div>

              <h3 className="font-headline-lg text-lg font-bold text-on-surface">
                {trainer.name}
              </h3>
              <p className="text-xs text-on-surface-variant font-medium">
                {trainer.role}
              </p>

              <div className="mt-4 pt-4 border-t border-outline-variant/20 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-on-surface-variant">
                  <span className="material-symbols-outlined text-outline text-base">
                    mail
                  </span>
                  <span className="truncate">{trainer.email}</span>
                </div>
                <div className="flex items-center gap-2 text-on-surface-variant">
                  <span className="material-symbols-outlined text-outline text-base">
                    call
                  </span>
                  <span>{trainer.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-on-surface-variant">
                  <span className="material-symbols-outlined text-secondary text-base">
                    group
                  </span>
                  <span className="font-bold text-on-surface">
                    {trainer.assignedMembersCount} Assigned Members
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-outline-variant/20 flex items-center justify-between">
              <button
    onClick={() => setActiveTab("members")}
    className="text-xs font-bold text-secondary hover:underline flex items-center gap-1"
  >
                <span>View Assigned Members</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
              <button
    onClick={() => deleteTrainer(trainer.id)}
    title="Delete Trainer"
    className="p-1.5 rounded-lg hover:bg-error-container text-error transition-colors"
  >
                <span className="material-symbols-outlined text-base">delete</span>
              </button>
            </div>
          </div>)}
      </div>

      {
    /* Staff Operational Stats */
  }
      <div className="bg-surface-container-lowest p-6 md:p-8 rounded-3xl border border-outline-variant/30 card-shadow">
        <h3 className="font-headline-lg text-base font-bold text-on-surface mb-4">
          Coaching Capacity & Performance
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-4 bg-surface-container-low rounded-2xl">
            <p className="text-xs text-outline font-semibold uppercase">
              Total Coaching Staff
            </p>
            <p className="font-headline-lg text-2xl font-extrabold text-on-surface mt-1">
              18 Instructors
            </p>
            <p className="text-[11px] text-emerald-700 font-bold mt-1">
              Full schedule coverage
            </p>
          </div>
          <div className="p-4 bg-surface-container-low rounded-2xl">
            <p className="text-xs text-outline font-semibold uppercase">
              Member-to-Trainer Ratio
            </p>
            <p className="font-headline-lg text-2xl font-extrabold text-on-surface mt-1">
              24 : 1
            </p>
            <p className="text-[11px] text-on-surface-variant font-medium mt-1">
              Optimal industry benchmark
            </p>
          </div>
          <div className="p-4 bg-surface-container-low rounded-2xl">
            <p className="text-xs text-outline font-semibold uppercase">
              Top Requested Class
            </p>
            <p className="font-headline-lg text-2xl font-extrabold text-on-surface mt-1">
              Strength & Yoga
            </p>
            <p className="text-[11px] text-emerald-700 font-bold mt-1">
              98% participant satisfaction
            </p>
          </div>
        </div>
      </div>
    </div>;
};
