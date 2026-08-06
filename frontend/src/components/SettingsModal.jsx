import { useState, useEffect } from "react";
import { useGym } from "../services/GymContext";

export const SettingsModal = () => {
  const { isSettingsOpen, setIsSettingsOpen, user, setUser, setActiveTab, apiFetch, addToast, setRefreshCounter, fetchInitialData } = useGym();
  
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    avatar_url: "",
    address: "",
    emergency_contact_name: "",
    emergency_contact_phone: ""
  });
  
  // Password Change Fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch profile on open
  useEffect(() => {
    if (!isSettingsOpen) return;
    const fetchProfile = async () => {
      setLoading(true);
      const res = await apiFetch("/api/profile.php");
      if (res && res.success && res.profile) {
        // Emergency contact formatting: "Name | Phone"
        const rawEm = res.profile.emergency_contact || "";
        const parts = rawEm.includes("|") ? rawEm.split("|").map(s => s.trim()) : [rawEm, ""];
        setProfileData({
          name: res.profile.name || "",
          email: res.profile.email || "",
          phone: res.profile.phone || "",
          avatar_url: res.profile.avatar_url || "",
          address: res.profile.address || "",
          emergency_contact_name: parts[0] || "",
          emergency_contact_phone: parts[1] || ""
        });
      }
      setLoading(false);
    };
    fetchProfile();
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  }, [isSettingsOpen, apiFetch]);

  if (!isSettingsOpen) return null;

  // Handle local file uploads (PNG, JPEG, JPG)
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate type
    const validTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      addToast("Invalid File Type", "Please choose a valid JPG, JPEG, or PNG image.", "error");
      return;
    }

    // Convert file to Base64
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileData((prev) => ({ ...prev, avatar_url: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();

    // Frontend Validations
    // 1. Email structure
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profileData.email)) {
      addToast("Validation Error", "Please enter a valid email address structure.", "error");
      return;
    }

    // 2. Phone number format (exactly 10 digits) — only validate if filled
    const cleanPhone = profileData.phone.replace(/\D/g, "");
    if (cleanPhone.length > 0 && cleanPhone.length !== 10) {
      addToast("Validation Error", "Phone number must be exactly 10 digits.", "error");
      return;
    }

    // 3. Password Double Confirmation
    if (newPassword || confirmPassword || currentPassword) {
      if (!currentPassword) {
        addToast("Validation Error", "Please enter your current password to set a new password.", "error");
        return;
      }
      if (newPassword !== confirmPassword) {
        addToast("Validation Error", "New passwords do not match. Please confirm again.", "error");
        return;
      }
      if (newPassword.length < 4) {
        addToast("Validation Error", "New password must be at least 4 characters long.", "error");
        return;
      }
    }

    setSaving(true);
    const emergency_contact = user?.role === "member"
      ? `${profileData.emergency_contact_name || ""} | ${profileData.emergency_contact_phone || ""}`.trim()
      : undefined;

    const res = await apiFetch("/api/profile.php", {
      method: "PUT",
      body: JSON.stringify({
        name: profileData.name,
        email: profileData.email,
        phone: cleanPhone,
        avatar_url: profileData.avatar_url,
        ...(user?.role === "member" && {
          address: profileData.address,
          emergency_contact
        }),
        current_password: currentPassword,
        new_password: newPassword
      })
    });

    if (res && res.success) {
      // 1. Re-fetch authoritative user record from server (includes name, email, phone, avatarUrl)
      const statusRes = await apiFetch("/api/auth.php?action=status");
      if (statusRes && statusRes.isLoggedIn && statusRes.user) {
        setUser(statusRes.user);
      } else {
        // Fallback: update context directly with what we submitted
        setUser((prev) => ({
          ...prev,
          email: profileData.email,
          phone: cleanPhone || profileData.phone,
          avatarUrl: profileData.avatar_url || prev.avatarUrl
        }));
      }

      // 2. Refresh all portal data (members list, trainers list, etc.)
      //    This makes admin portal, trainer roster, and member lists reflect the new avatar/details immediately.
      if (typeof fetchInitialData === "function") await fetchInitialData();

      // 3. Broadcast to other open tabs via refreshCounter
      setRefreshCounter((prev) => {
        const next = prev + 1;
        localStorage.setItem("gymRefreshCounter", next);
        return next;
      });

      addToast("Profile Updated", "Your changes have been saved successfully.", "success");
      setIsSettingsOpen(false);
    } else {
      addToast("Failed to Update", res?.message || "Could not update profile.", "error");
    }
    setSaving(false);
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      "WARNING: Are you absolutely sure you want to delete your account? This will permanently delete your membership, payments, attendance, and entire profile from the database."
    );
    if (!confirmDelete) return;

    const res = await apiFetch("/api/profile.php", { method: "DELETE" });
    if (res && res.success) {
      addToast("Account Deleted", "Your account has been permanently removed.", "info");
      setUser({
        name: "",
        email: "",
        role: "",
        avatarUrl: "",
        isLoggedIn: false
      });
      setIsSettingsOpen(false);
      setActiveTab("login");
    } else {
      addToast("Failed to Delete", res?.message || "Could not delete account.", "error");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest rounded-3xl max-w-lg w-full border border-outline-variant/30 shadow-2xl p-6 md:p-8 animate-fade-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4 mb-6">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-secondary text-2xl animate-spin-slow">
              manage_accounts
            </span>
            <h2 className="font-headline-lg text-lg font-bold text-on-surface">
              Manage Profile Settings
            </h2>
          </div>
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="p-1.5 rounded-full hover:bg-surface-container text-outline hover:text-on-surface"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-8 h-8 rounded-full border-4 border-secondary/30 border-t-secondary animate-spin" />
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-5">
            {/* Local Image Upload Section */}
            <div className="flex items-center gap-4 p-4 bg-surface-container-low rounded-2xl">
              {profileData.avatar_url ? (
                <div className="relative">
                  <img
                    src={profileData.avatar_url}
                    alt="Profile Preview"
                    className="w-14 h-14 rounded-full object-cover ring-2 ring-secondary/50"
                  />
                  <button
                    type="button"
                    onClick={() => setProfileData({ ...profileData, avatar_url: "" })}
                    className="absolute -top-1 -right-1 bg-error text-white p-0.5 rounded-full hover:bg-error/95 shadow-xs transition-colors"
                    title="Remove profile picture"
                  >
                    <span className="material-symbols-outlined text-xs leading-none">cancel</span>
                  </button>
                </div>
              ) : (
                <div className="w-14 h-14 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container font-bold text-base ring-2 ring-secondary/50">
                  {profileData.name ? profileData.name.split(" ").map(n => n[0]).join("").slice(0,2).toUpperCase() : "U"}
                </div>
              )}
              <div className="flex-1">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">
                  Upload Profile Picture
                </label>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg"
                  onChange={handleImageChange}
                  className="w-full text-xs text-on-surface file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-secondary/15 file:text-secondary hover:file:bg-secondary/25 file:cursor-pointer cursor-pointer"
                />
                <p className="text-[9px] text-outline mt-1 font-medium">Supports JPG, JPEG, and PNG formats.</p>
              </div>
            </div>

            {/* General Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  readOnly
                  value={profileData.name}
                  className="w-full bg-surface-container-low text-on-surface-variant text-xs px-4 py-2.5 rounded-xl border border-outline-variant/30 cursor-not-allowed opacity-60"
                  title="Name cannot be changed from this page."
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  className="w-full bg-surface-container-low text-on-surface text-xs px-4 py-2.5 rounded-xl border border-outline-variant/40 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 0771234567"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  className="w-full bg-surface-container-low text-on-surface text-xs px-4 py-2.5 rounded-xl border border-outline-variant/40 focus:outline-none"
                />
              </div>
            </div>

            {user?.role === "member" && (
              <>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">
                    Home Address
                  </label>
                  <input
                    type="text"
                    required
                    value={profileData.address || ""}
                    onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                    className="w-full bg-surface-container-low text-on-surface text-xs px-4 py-2.5 rounded-xl border border-outline-variant/40 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">
                      Emergency Contact Name
                    </label>
                    <input
                      type="text"
                      required
                      value={profileData.emergency_contact_name || ""}
                      onChange={(e) => setProfileData({ ...profileData, emergency_contact_name: e.target.value })}
                      className="w-full bg-surface-container-low text-on-surface text-xs px-4 py-2.5 rounded-xl border border-outline-variant/40 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">
                      Emergency Contact Number
                    </label>
                    <input
                      type="tel"
                      required
                      value={profileData.emergency_contact_phone || ""}
                      onChange={(e) => setProfileData({ ...profileData, emergency_contact_phone: e.target.value })}
                      className="w-full bg-surface-container-low text-on-surface text-xs px-4 py-2.5 rounded-xl border border-outline-variant/40 focus:outline-none"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Change Password Block with Current Verification & Double Confirm */}
            <div className="bg-surface-container-low p-4 rounded-2xl space-y-3">
              <h3 className="text-xs font-bold text-on-surface flex items-center gap-1.5 border-b border-outline-variant/20 pb-2">
                <span className="material-symbols-outlined text-base">lock</span>
                Change Password
              </h3>
              
              <div>
                <label className="block text-[9px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-surface-container-lowest text-on-surface text-xs px-4 py-2 rounded-xl border border-outline-variant/40 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-surface-container-lowest text-on-surface text-xs px-4 py-2 rounded-xl border border-outline-variant/40 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-surface-container-lowest text-on-surface text-xs px-4 py-2 rounded-xl border border-outline-variant/40 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-outline-variant/20 pt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Account Deletion Button (Only for Non-Admins) */}
              {user?.role !== "admin" && (
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  className="text-xs font-bold text-error border border-error/25 hover:bg-error/10 px-4 py-2.5 rounded-xl transition-all self-start md:self-auto"
                >
                  Delete Account
                </button>
              )}

              <div className="flex items-center justify-end gap-2 text-xs font-bold self-end md:flex-1 md:justify-end">
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-on-surface-variant hover:bg-surface-container transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-secondary text-on-secondary hover:bg-secondary/90 transition-colors shadow-sm"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
