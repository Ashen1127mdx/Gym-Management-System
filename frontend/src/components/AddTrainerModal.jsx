import { useState } from "react";
import { useGym } from "../services/GymContext";
export const AddTrainerModal = () => {
  const { isAddTrainerModalOpen, setIsAddTrainerModalOpen, addTrainer } = useGym();
  const [name, setName] = useState("");
  const [role, setRole] = useState("Senior Coach");
  const [specialization, setSpecialization] = useState("Strength");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  if (!isAddTrainerModalOpen) return null;
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email) return;

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    // Validate contact number (10 digits)
    const cleanPhone = (phone || "").replace(/\D/g, "");
    if (cleanPhone.length !== 10) {
      alert("Contact number must be exactly 10 digits.");
      return;
    }

    addTrainer({
      name,
      role,
      specialization,
      email,
      phone: cleanPhone,
      avatarUrl: avatarUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuCvGExzUZNr9X6M0ggMRSzE_z80cvkKsOQM_aiJYgAjD-WU5JiyKw-JVTUi1HONkc_WKO4fhmfVn_NCR8tjtaybbgg_NJsEYs-3hpT-LHaLRin_4dSx7cmhxMe9sYSaRbY-Lyljzu1MhEVceMFuCDYRMQmYgKWnl_gHJxqieGmODZHn273vS6b1xYoHqU520R7MeI_lOX7fsCwJ7rnIE1smRqBgLn667f3p17HMswsZqmjct86ojzUUCt3WVp0jMSaRPtYHhULXhHx5"
    });
    setName("");
    setEmail("");
    setPhone("");
    setAvatarUrl("");
    setIsAddTrainerModalOpen(false);
  };
  return <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest rounded-3xl max-w-lg w-full border border-outline-variant/30 shadow-2xl p-6 md:p-8 animate-fade-in">
        <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4 mb-6">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-secondary text-2xl">
              fitness_center
            </span>
            <h2 className="font-headline-lg text-lg font-bold text-on-surface">
              Add New Trainer
            </h2>
          </div>
          <button
    onClick={() => setIsAddTrainerModalOpen(false)}
    className="p-1.5 rounded-full hover:bg-surface-container text-outline hover:text-on-surface"
  >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-1">
              Full Name *
            </label>
            <input
    type="text"
    required
    placeholder="e.g. Mike Tyson"
    value={name}
    onChange={(e) => setName(e.target.value)}
    className="w-full bg-surface-container-low text-on-surface text-sm px-4 py-2.5 rounded-xl border border-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-secondary/50"
  />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                Title / Role
              </label>
              <input
    type="text"
    placeholder="e.g. Lead Instructor"
    value={role}
    onChange={(e) => setRole(e.target.value)}
    className="w-full bg-surface-container-low text-on-surface text-sm px-4 py-2.5 rounded-xl border border-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-secondary/50"
  />
            </div>
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                Specialization
              </label>
              <select
    value={specialization}
    onChange={(e) => setSpecialization(e.target.value)}
    className="w-full bg-surface-container-low text-on-surface text-sm px-4 py-2.5 rounded-xl border border-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-secondary/50"
  >
                <option value="Cardio">Cardio</option>
                <option value="Strength">Strength</option>
                <option value="Yoga">Yoga</option>
                <option value="Crossfit">Crossfit</option>
                <option value="Boxing">Boxing</option>
                <option value="Pilates">Pilates</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-1">
              Email Address *
            </label>
            <input
    type="email"
    required
    placeholder="trainer@fitzone.com"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    className="w-full bg-surface-container-low text-on-surface text-sm px-4 py-2.5 rounded-xl border border-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-secondary/50"
  />
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-1">
              Phone Number
            </label>
            <input
    type="text"
    placeholder="+1 (555) 012-3456"
    value={phone}
    onChange={(e) => setPhone(e.target.value)}
    className="w-full bg-surface-container-low text-on-surface text-sm px-4 py-2.5 rounded-xl border border-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-secondary/50"
  />
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-1">
              Avatar Image URL (Optional)
            </label>
            <input
    type="url"
    placeholder="https://images.unsplash.com/photo-..."
    value={avatarUrl}
    onChange={(e) => setAvatarUrl(e.target.value)}
    className="w-full bg-surface-container-low text-on-surface text-sm px-4 py-2.5 rounded-xl border border-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-secondary/50"
  />
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-outline-variant/20">
            <button
    type="button"
    onClick={() => setIsAddTrainerModalOpen(false)}
    className="px-5 py-2.5 rounded-xl text-xs font-semibold text-on-surface-variant hover:bg-surface-container transition-colors"
  >
              Cancel
            </button>
            <button
    type="submit"
    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-secondary text-on-secondary hover:bg-secondary/90 transition-colors shadow-sm"
  >
              Add Trainer
            </button>
          </div>
        </form>
      </div>
    </div>;
};
