import { useState, useEffect } from "react";
import { useGym } from "../services/GymContext.jsx";

export const LoginView = () => {
  const { login, registerMember, registerTrainer } = useGym();
  
  // Modes: 'login' or 'register'
  const [mode, setMode] = useState("login");
  // Sub-roles under registration: 'member' or 'trainer'
  const [registerRole, setRegisterRole] = useState("member");

  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Common Registration State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  // Member Registration Specific State
  const [nic, setNic] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("Male");
  const [address, setAddress] = useState("");
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("");

  // Confirm Password
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [emailError, setEmailError] = useState("");

  const [stats, setStats] = useState({
    activeMembers: "0+",
    activeTrainers: "0 Staff"
  });

  // Load active stats from MySQL API on mount
  useEffect(() => {
    const isDev = window.location.port === "3000";
    const API = isDev ? "http://localhost" : "";
    fetch(`${API}/backend/api/public_stats.php`)
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setStats({
            activeMembers: `${data.activeMembers.toLocaleString()}+`,
            activeTrainers: `${data.activeTrainers} Staff`
          });
        }
      })
      .catch((err) => console.error("Error loading stats:", err));
  }, []);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError("");
    setIsLoading(true);
    const result = await login(email, password);
    if (!result?.ok) {
      setLoginError(result?.message || "Email or password is incorrect. Please try again.");
    }
    setIsLoading(false);
  };

  const checkEmailExists = async (emailVal) => {
    if (!emailVal) return;
    try {
      const isDev = window.location.port === "3000";
      const API = isDev ? "http://localhost" : "";
      const res = await fetch(
        `${API}/backend/api/auth.php?action=check_email&email=${encodeURIComponent(emailVal)}`
      );
      const data = await res.json();
      if (data.exists) {
        setEmailError("This email is already registered. Please sign in instead.");
      } else {
        setEmailError("");
      }
    } catch {
      setEmailError("");
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setPasswordError("");

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setPasswordError("Please enter a valid email address structure.");
      return;
    }

    // Validate phone number (10 digits)
    const cleanPhone = (phone || "").replace(/\D/g, "");
    if (cleanPhone.length !== 10) {
      setPasswordError("Contact number must be exactly 10 digits.");
      return;
    }

    if (emailError) return; // block if email already taken

    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    if (registerRole === "member") {
      const emergencyContact = `${emergencyContactName} | ${emergencyContactPhone}`;
      const success = await registerMember({
        name,
        email,
        phone: cleanPhone,
        password,
        nic,
        dob,
        gender,
        address,
        emergencyContact,
        plan: "Monthly Pro"
      });
      setIsLoading(false);
      if (success) {
        // Clear form
        setName("");
        setEmail("");
        setPhone("");
        setPassword("");
        setConfirmPassword("");
        setNic("");
        setDob("");
        setAddress("");
        setEmergencyContactName("");
        setEmergencyContactPhone("");
        setMode("login");
      }
    } else {
      const success = await registerTrainer({
        name,
        email,
        phone: cleanPhone,
        password,
        specialization: "General"
      });
      setIsLoading(false);
      if (success) {
        setName("");
        setEmail("");
        setPhone("");
        setPassword("");
        setConfirmPassword("");
        setMode("login");
      }
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#fdf8f8]">
      {/* Left Column - High-Energy Visual Banner */}
      <div className="hidden lg:flex flex-1 relative bg-tertiary-container overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1600&auto=format&fit=crop"
          alt="Gym Facility"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover opacity-35 scale-105 transform hover:scale-100 transition-transform duration-1000"
        />
        <div className="absolute inset-0 energy-overlay"></div>

        <div className="relative z-10 flex flex-col justify-between p-12 lg:p-16 w-full text-white">
          {/* Top Logo */}
          <div className="flex items-center gap-3">
            <img
              src="/fitzone-logo-512.png"
              alt="FitZone Logo"
              className="w-10 h-10 object-contain rounded-xl shadow-lg"
            />
            <div>
              <span className="font-headline-lg text-2xl font-bold tracking-tight text-white block">
                FitZone
              </span>
              <span className="text-[10px] text-on-tertiary-container/70 tracking-widest uppercase font-semibold">
                No Pain. No Gain.
              </span>
            </div>
          </div>

          {/* Hero Center Text */}
          <div className="max-w-xl my-auto py-12">
            <h2 className="font-display-lg text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight text-white mb-6">
              Precision. Vigor. <br />
              <span className="text-secondary-container">Performance.</span>
            </h2>

            <p className="font-body-lg text-base text-surface-container-high/90 leading-relaxed font-normal max-w-lg">
              The ultimate platform for modern fitness center operations, member attendance, automated plan billing, and real-time athletic facility intelligence.
            </p>
          </div>

          {/* Bottom Footer Stats */}
          <div className="grid grid-cols-2 gap-6 pt-8 border-t border-white/10">
            <div>
              <p className="font-headline-lg text-2xl font-bold text-white">{stats.activeMembers}</p>
              <p className="text-xs text-surface-variant/70">Active Members</p>
            </div>
            <div>
              <p className="font-headline-lg text-2xl font-bold text-white">{stats.activeTrainers}</p>
              <p className="text-xs text-surface-variant/70">Access & Staff</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Forms Section */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 lg:p-16 overflow-y-auto max-h-screen">
        <div className="w-full max-w-md bg-surface-container-lowest p-8 sm:p-10 rounded-3xl login-card-shadow border border-outline-variant/30 my-8">
          
          {/* SIGN IN VIEW */}
          {mode === "login" && (
            <>
              <div className="mb-8 text-center sm:text-left">
                <div className="inline-flex items-center gap-2 mb-3">
                  <img
                    src="/fitzone-logo-512.png"
                    alt="FitZone"
                    className="w-8 h-8 object-contain"
                  />
                  <h1 className="font-headline-lg text-2xl font-bold text-on-surface">
                    FitZone Portal
                  </h1>
                </div>
                <h2 className="font-headline-md text-xl font-bold text-on-surface">
                  Welcome Back
                </h2>
                <p className="text-xs text-on-surface-variant mt-1">
                  Enter your credentials to access the management portal.
                </p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">
                    Work Email Address
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-lg">
                      mail
                    </span>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setLoginError(""); }}
                      placeholder="e.g. member@email.com"
                      className={`w-full bg-surface-container-low text-on-surface text-sm pl-11 pr-4 py-3 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all font-medium ${
                        loginError ? "border-error" : "border-outline-variant/50"
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-lg">
                      lock
                    </span>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setLoginError(""); }}
                      placeholder="••••••••"
                      className={`w-full bg-surface-container-low text-on-surface text-sm pl-11 pr-4 py-3 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all font-medium ${
                        loginError ? "border-error" : "border-outline-variant/50"
                      }`}
                    />
                  </div>
                </div>

                {/* Inline login error */}
                {loginError && (
                  <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-error/10 border border-error/30 text-error">
                    <span className="material-symbols-outlined text-lg flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>cancel</span>
                    <p className="text-xs font-semibold leading-snug">{loginError}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-6 bg-secondary text-on-secondary rounded-2xl font-headline-md text-sm font-bold flex items-center justify-center gap-2 hover:bg-secondary/90 transition-all shadow-md active:scale-[0.99]"
                >
                  {isLoading ? (
                    <span className="material-symbols-outlined animate-spin text-xl">
                      progress_activity
                    </span>
                  ) : (
                    <>
                      <span>Sign In to Portal</span>
                      <span className="material-symbols-outlined text-lg">arrow_forward</span>
                    </>
                  )}
                </button>
              </form>

              <div className="mt-8 text-center border-t border-outline-variant/20 pt-6 space-y-3">
                <p className="text-xs text-on-surface-variant">
                  Don't have an account yet? Register here:
                </p>
                <div className="flex justify-center text-xs">
                  <button
                    onClick={() => {
                      setEmail("");
                      setPassword("");
                      setRegisterRole("member");
                      setMode("register");
                    }}
                    className="px-4 py-2 bg-secondary text-on-secondary font-bold rounded-xl hover:bg-secondary/90 transition-all shadow-sm"
                  >
                    Create Account
                  </button>
                </div>
              </div>
            </>
          )}

          {/* SINGLE REGISTRATION VIEW WITH ROLE TABS */}
          {mode === "register" && (
            <>
              <div className="mb-6 text-center sm:text-left">
                <h2 className="font-headline-md text-xl font-bold text-on-surface">
                  Create Your Account
                </h2>
              </div>

              {/* Tabs Indicator Container */}
              <div className="w-full bg-surface-container-low p-1.5 rounded-2xl border border-outline-variant/30 flex mb-6">
                <button
                  type="button"
                  onClick={() => setRegisterRole("member")}
                  className={`flex-1 py-2 px-3 text-center text-xs font-bold rounded-xl transition-all ${
                    registerRole === "member"
                      ? "bg-secondary text-on-secondary shadow-sm"
                      : "text-on-surface-variant hover:bg-surface-container-high"
                  }`}
                >
                  Register as Member
                </button>
                <button
                  type="button"
                  onClick={() => setRegisterRole("trainer")}
                  className={`flex-1 py-2 px-3 text-center text-xs font-bold rounded-xl transition-all ${
                    registerRole === "trainer"
                      ? "bg-secondary text-on-secondary shadow-sm"
                      : "text-on-surface-variant hover:bg-surface-container-high"
                  }`}
                >
                  Register as Trainer
                </button>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                {/* Scrollable Fields Container */}
                <div className="max-h-[320px] overflow-y-auto pr-1.5 space-y-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-on-surface-variant mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Sarah Jenkins"
                      className="w-full bg-surface-container-low text-on-surface text-sm px-3.5 py-2.5 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="block text-[11px] font-semibold text-on-surface-variant mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
                        onBlur={(e) => checkEmailExists(e.target.value)}
                        placeholder="e.g. sarah@email.com"
                        className={`w-full bg-surface-container-low text-on-surface text-sm px-3.5 py-2.5 rounded-xl border transition-all font-medium focus:outline-none focus:ring-2 focus:ring-secondary/50 ${
                          emailError ? "border-error" : "border-outline-variant/50"
                        }`}
                      />
                      {emailError && (
                        <p className="text-[11px] font-semibold text-error flex items-center gap-1 mt-1">
                          <span className="material-symbols-outlined text-sm">error</span>
                          {emailError}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-on-surface-variant mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. 555-0199"
                        className="w-full bg-surface-container-low text-on-surface text-sm px-3.5 py-2.5 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all font-medium"
                      />
                    </div>
                  </div>

                  {/* Member Specific Fields */}
                  {registerRole === "member" && (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-on-surface-variant mb-1">
                            NIC Number
                          </label>
                          <input
                            type="text"
                            required
                            value={nic}
                            onChange={(e) => setNic(e.target.value)}
                            placeholder="e.g. 199512345678"
                            className="w-full bg-surface-container-low text-on-surface text-sm px-3.5 py-2.5 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-on-surface-variant mb-1">
                            Date of Birth
                          </label>
                          <input
                            type="date"
                            required
                            value={dob}
                            onChange={(e) => setDob(e.target.value)}
                            className="w-full bg-surface-container-low text-on-surface text-sm px-3.5 py-2.5 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all font-medium"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-on-surface-variant mb-1">
                          Gender
                        </label>
                        <select
                          value={gender}
                          onChange={(e) => setGender(e.target.value)}
                          className="w-full bg-surface-container-low text-on-surface text-sm px-3.5 py-2.5 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all font-medium"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-on-surface-variant mb-1">
                          Home Address
                        </label>
                        <input
                          type="text"
                          required
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="e.g. 124 Fitness Blvd, Los Angeles, CA"
                          className="w-full bg-surface-container-low text-on-surface text-sm px-3.5 py-2.5 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all font-medium"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-on-surface-variant mb-1">
                            Emergency Contact Name
                          </label>
                          <input
                            type="text"
                            required
                            value={emergencyContactName}
                            onChange={(e) => setEmergencyContactName(e.target.value)}
                            placeholder="e.g. Tom Jenkins"
                            className="w-full bg-surface-container-low text-on-surface text-sm px-3.5 py-2.5 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-on-surface-variant mb-1">
                            Emergency Contact No.
                          </label>
                          <input
                            type="tel"
                            required
                            value={emergencyContactPhone}
                            onChange={(e) => setEmergencyContactPhone(e.target.value)}
                            placeholder="e.g. 555-992-1029"
                            className="w-full bg-surface-container-low text-on-surface text-sm px-3.5 py-2.5 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all font-medium"
                          />
                        </div>
                      </div>
                    </>
                  )}



                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-on-surface-variant mb-1">
                        Password
                      </label>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Create Password"
                        className={`w-full bg-surface-container-low text-on-surface text-sm px-3.5 py-2.5 rounded-xl border transition-all font-medium focus:outline-none focus:ring-2 focus:ring-secondary/50 ${
                          passwordError ? "border-error" : "border-outline-variant/50"
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-on-surface-variant mb-1">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repeat Password"
                        className={`w-full bg-surface-container-low text-on-surface text-sm px-3.5 py-2.5 rounded-xl border transition-all font-medium focus:outline-none focus:ring-2 focus:ring-secondary/50 ${
                          passwordError ? "border-error" : "border-outline-variant/50"
                        }`}
                      />
                    </div>
                  </div>
                  {passwordError && (
                    <p className="text-[11px] font-semibold text-error flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">error</span>
                      {passwordError}
                    </p>
                  )}

                </div>

                {/* Submit button remains fixed at bottom */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3 px-6 bg-secondary text-on-secondary rounded-xl font-headline-md text-sm font-bold flex items-center justify-center gap-2 hover:bg-secondary/90 transition-all shadow-md"
                >
                  {isLoading ? (
                    <span className="material-symbols-outlined animate-spin text-xl">
                      progress_activity
                    </span>
                  ) : (
                    <>
                      <span>Register Account</span>
                      <span className="material-symbols-outlined text-lg">check_circle</span>
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center border-t border-outline-variant/20 pt-4">
                <button
                  onClick={() => setMode("login")}
                  className="text-xs font-bold text-secondary hover:underline"
                >
                  Back to Sign In
                </button>
              </div>
            </>
          )}

          {/* Authorized Access Notice */}
          <div className="mt-8 text-center border-t border-outline-variant/20 pt-6">
            <p className="text-[11px] text-outline leading-tight">
              Authorized access only. All activity is logged and monitored.
              <br />
              FitZone OS v4.2 &copy; 2026 FitZone Technologies Inc.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
