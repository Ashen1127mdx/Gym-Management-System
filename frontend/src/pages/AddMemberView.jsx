import { useState } from "react";
import { useGym } from "../services/GymContext";
export const AddMemberView = () => {
  const { addMember, setActiveTab } = useGym();
  const [name, setName] = useState("");
  const [nic, setNic] = useState("");
  const [dob, setDob] = useState("1998-05-14");
  const [gender, setGender] = useState("Male");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [plan, setPlan] = useState("Monthly Pro");
  const [status, setStatus] = useState("Active");
  const [avatarUrl, setAvatarUrl] = useState("");
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

    // Validate emergency contact number (if provided)
    if (emergencyContact) {
      const parts = emergencyContact.split("|");
      const phonePart = parts[1] || parts[0];
      const cleanEmergency = phonePart.replace(/\D/g, "");
      if (cleanEmergency.length !== 10) {
        alert("Emergency contact number must be exactly 10 digits.");
        return;
      }
    }

    addMember({
      name,
      email,
      phone: cleanPhone,
      nic: nic || "12345678-V",
      dob,
      gender,
      address: address || "123 Fitness Ave, Suite 100",
      emergencyContact: emergencyContact || "Family Contact | 0771234567",
      plan,
      status,
      avatarUrl: avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop"
    });
  };
  return <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      {
    /* Top Header */
  }
      <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4">
        <div>
          <button
    onClick={() => setActiveTab("members")}
    className="inline-flex items-center gap-1 text-xs font-bold text-secondary mb-1 hover:underline"
  >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span>Back to Members</span>
          </button>
          <h1 className="font-headline-lg text-2xl font-bold text-on-surface">
            New Member Registration
          </h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Complete member identification, plan enrolment, and contact details.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {
    /* Personal Details Card */
  }
        <div className="bg-surface-container-lowest p-6 md:p-8 rounded-3xl border border-outline-variant/30 card-shadow space-y-6">
          <div className="flex items-center gap-2 border-b border-outline-variant/20 pb-3">
            <span className="material-symbols-outlined text-secondary text-xl">
              person
            </span>
            <h2 className="font-headline-md text-base font-bold text-on-surface">
              Personal Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">
                Full Legal Name *
              </label>
              <input
    type="text"
    required
    value={name}
    onChange={(e) => setName(e.target.value)}
    placeholder="e.g. Amanda Miller"
    className="w-full bg-surface-container-low text-on-surface text-sm px-4 py-3 rounded-2xl border border-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-secondary/50 font-medium"
  />
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">
                National ID / Passport / NIC
              </label>
              <input
    type="text"
    value={nic}
    onChange={(e) => setNic(e.target.value)}
    placeholder="e.g. 98392019-V"
    className="w-full bg-surface-container-low text-on-surface text-sm px-4 py-3 rounded-2xl border border-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-secondary/50 font-medium"
  />
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">
                Date of Birth
              </label>
              <input
    type="date"
    value={dob}
    onChange={(e) => setDob(e.target.value)}
    className="w-full bg-surface-container-low text-on-surface text-sm px-4 py-3 rounded-2xl border border-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-secondary/50 font-medium"
  />
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">
                Gender Identification
              </label>
              <select
    value={gender}
    onChange={(e) => setGender(e.target.value)}
    className="w-full bg-surface-container-low text-on-surface text-sm px-4 py-3 rounded-2xl border border-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-secondary/50 font-medium"
  >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other / Unspecified</option>
              </select>
            </div>
          </div>
        </div>

        {
    /* Contact & Emergency Info */
  }
        <div className="bg-surface-container-lowest p-6 md:p-8 rounded-3xl border border-outline-variant/30 card-shadow space-y-6">
          <div className="flex items-center gap-2 border-b border-outline-variant/20 pb-3">
            <span className="material-symbols-outlined text-secondary text-xl">
              contact_mail
            </span>
            <h2 className="font-headline-md text-base font-bold text-on-surface">
              Contact & Emergency Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">
                Email Address *
              </label>
              <input
    type="email"
    required
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    placeholder="member@domain.com"
    className="w-full bg-surface-container-low text-on-surface text-sm px-4 py-3 rounded-2xl border border-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-secondary/50 font-medium"
  />
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">
                Mobile Phone Number
              </label>
              <input
    type="text"
    value={phone}
    onChange={(e) => setPhone(e.target.value)}
    placeholder="+1 (555) 123-4567"
    className="w-full bg-surface-container-low text-on-surface text-sm px-4 py-3 rounded-2xl border border-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-secondary/50 font-medium"
  />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">
                Home Address
              </label>
              <input
    type="text"
    value={address}
    onChange={(e) => setAddress(e.target.value)}
    placeholder="124 Fitness Blvd, Suite 4B, Los Angeles, CA"
    className="w-full bg-surface-container-low text-on-surface text-sm px-4 py-3 rounded-2xl border border-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-secondary/50 font-medium"
  />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">
                Emergency Contact Person & Phone
              </label>
              <input
    type="text"
    value={emergencyContact}
    onChange={(e) => setEmergencyContact(e.target.value)}
    placeholder="e.g. Mark Miller (Spouse) | +1 (555) 998-1122"
    className="w-full bg-surface-container-low text-on-surface text-sm px-4 py-3 rounded-2xl border border-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-secondary/50 font-medium"
  />
            </div>
          </div>
        </div>

        {
    /* Plan Enrolment & Photo */
  }
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-surface-container-lowest p-6 md:p-8 rounded-3xl border border-outline-variant/30 card-shadow space-y-4">
            <div className="flex items-center gap-2 border-b border-outline-variant/20 pb-3">
              <span className="material-symbols-outlined text-secondary text-xl">
                card_membership
              </span>
              <h2 className="font-headline-md text-base font-bold text-on-surface">
                Membership Plan Selection
              </h2>
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">
                Select Initial Membership Plan
              </label>
              <select
    value={plan}
    onChange={(e) => setPlan(e.target.value)}
    className="w-full bg-surface-container-low text-on-surface text-sm px-4 py-3 rounded-2xl border border-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-secondary/50 font-bold"
  >
                <option value="Monthly Pro">Monthly Pro ($49/mo)</option>
                <option value="Quarterly Active">Quarterly Active ($129/3mo)</option>
                <option value="Annual Elite">Annual Elite ($399/yr)</option>
                <option value="Day Pass">Day Pass ($15/day)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">
                Initial Account Status
              </label>
              <select
    value={status}
    onChange={(e) => setStatus(e.target.value)}
    className="w-full bg-surface-container-low text-on-surface text-sm px-4 py-3 rounded-2xl border border-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-secondary/50 font-medium"
  >
                <option value="Active">Active (Cleared for entrance)</option>
                <option value="Guest">Guest Pass</option>
                <option value="Pending">Pending Payment</option>
              </select>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-6 md:p-8 rounded-3xl border border-outline-variant/30 card-shadow space-y-4">
            <div className="flex items-center gap-2 border-b border-outline-variant/20 pb-3">
              <span className="material-symbols-outlined text-secondary text-xl">
                add_a_photo
              </span>
              <h2 className="font-headline-md text-base font-bold text-on-surface">
                Identification Photo
              </h2>
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">
                Photo URL
              </label>
              <input
    type="url"
    value={avatarUrl}
    onChange={(e) => setAvatarUrl(e.target.value)}
    placeholder="https://images.unsplash.com/..."
    className="w-full bg-surface-container-low text-on-surface text-sm px-4 py-2.5 rounded-2xl border border-outline-variant/40 focus:outline-none"
  />
            </div>

            <div className="p-4 bg-surface-container-low rounded-2xl border-2 border-dashed border-outline-variant/50 flex flex-col items-center justify-center text-center">
              {avatarUrl ? <img
    src={avatarUrl}
    alt="Member Preview"
    referrerPolicy="no-referrer"
    className="w-20 h-20 rounded-full object-cover mb-2 ring-4 ring-secondary/30"
  /> : <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center text-outline mb-2">
                  <span className="material-symbols-outlined text-2xl">photo_camera</span>
                </div>}
              <p className="text-xs font-bold text-on-surface">Camera Capture / Upload</p>
              <p className="text-[10px] text-outline mt-0.5">
                PNG, JPG or WEBP formats supported up to 5MB
              </p>
            </div>
          </div>
        </div>

        {
    /* Form Actions */
  }
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-outline-variant/20">
          <button
    type="button"
    onClick={() => setActiveTab("members")}
    className="px-6 py-3 rounded-2xl text-xs font-bold text-on-surface-variant hover:bg-surface-container transition-colors"
  >
            Cancel
          </button>
          <button
    type="submit"
    className="px-8 py-3.5 rounded-2xl text-xs font-bold bg-secondary text-on-secondary hover:bg-secondary/90 transition-colors shadow-md flex items-center gap-2"
  >
            <span className="material-symbols-outlined text-lg">person_add</span>
            <span>Register & Enrol Member</span>
          </button>
        </div>
      </form>
    </div>;
};
