import { useState } from "react";
import { useGym } from "../services/GymContext";

export const AttendanceView = () => {
  const {
    attendanceRecords,
    checkInMember,
    selectedAttendanceDate,
    setSelectedAttendanceDate,
    members,
    addToast
  } = useGym();
  const [inputVal, setInputVal] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);


  const handleCheckInSubmit = async (e) => {
    e.preventDefault();
    if (!inputVal.trim()) {
      addToast("Input Required", "Please enter a member name or ID", "error");
      return;
    }
    setIsProcessing(true);
    await checkInMember(inputVal.trim());
    setIsProcessing(false);
    setInputVal("");
  };

  const filteredRecords = attendanceRecords.filter((record) => {
    if (record.checked_by_role === 'trainer') return false;
    return record.date === selectedAttendanceDate;
  });

  // Compute per-weekday check-in counts from all records (for bar chart)
  const weekdayMap = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  attendanceRecords.forEach((r) => {
    if (!r.date) return;
    const d = new Date(r.date);
    if (isNaN(d)) return;
    const key = dayNames[d.getDay()];
    if (key in weekdayMap) weekdayMap[key]++;
  });
  const chartData = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => ({
    day,
    count: weekdayMap[day]
  }));
  const maxCount = Math.max(...chartData.map(d => d.count), 1);
  const todayDayName = dayNames[new Date().getDay()];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Hero Header & Instant Check-In Box */}
      <div className="bg-tertiary-container rounded-3xl p-6 md:p-8 text-white relative shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container/30 border border-secondary/40 mb-3">
            <span className="material-symbols-outlined text-secondary text-sm">
              how_to_reg
            </span>
            <span className="text-xs font-bold text-secondary-fixed">
              FRONT DESK TERMINAL
            </span>
          </div>

          <h1 className="font-headline-lg text-2xl md:text-3xl font-extrabold text-white">
            Instant Member Check-In
          </h1>
          <p className="text-xs md:text-sm text-surface-container-high/80 mt-1">
            Scan membership ID card or search by member name to process entrance verification.
          </p>

          {/* Form */}
          <form onSubmit={handleCheckInSubmit} className="mt-6 flex flex-col sm:flex-row gap-3 relative z-30">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-xl">
                qr_code_scanner
              </span>
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Type member name (e.g. John Doe, Sarah) or ID (#FZ-1029)..."
                className="w-full bg-surface-container-lowest text-on-surface text-sm pl-12 pr-4 py-3.5 rounded-2xl border-2 border-transparent focus:border-secondary focus:outline-none transition-all font-medium shadow-md"
              />
              {/* Quick Select Autocomplete Dropdown preview */}
              {(() => {
                const matches = members.filter(
                  (m) =>
                    m.name.toLowerCase().includes(inputVal.toLowerCase()) ||
                    (m.memberId && m.memberId.toLowerCase().includes(inputVal.toLowerCase()))
                );
                if (inputVal.length > 1 && matches.length > 0) {
                  return (
                    <div className="absolute left-0 right-0 top-full mt-2 bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/30 py-2 z-50 max-h-56 overflow-y-auto">
                      {matches.map((m) => (
                        <div
                          key={m.id}
                          onClick={() => {
                            setInputVal(m.name);
                          }}
                          className="px-4 py-2.5 hover:bg-surface-container-low cursor-pointer flex items-center justify-between text-xs text-on-surface border-b border-outline-variant/10 last:border-b-0"
                        >
                          <span className="font-bold text-on-surface">{m.name}</span>
                          <span className="font-mono text-outline">{m.memberId || "#FZ"} ({m.status})</span>
                        </div>
                      ))}
                    </div>
                  );
                }
                return null;
              })()}
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="px-8 py-3.5 bg-secondary text-on-secondary hover:bg-secondary/90 rounded-2xl font-headline-md text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 shrink-0"
            >
              {isProcessing ? (
                <span className="material-symbols-outlined animate-spin text-xl">
                  progress_activity
                </span>
              ) : (
                <>
                  <span className="material-symbols-outlined text-xl">check_circle</span>
                  <span>CHECK IN</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Date Explorer & Filter Toolbar */}
      <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/30 card-shadow flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 bg-surface-container-low px-4 py-2 rounded-xl border border-outline-variant/40">
            <span className="material-symbols-outlined text-outline text-lg">calendar_today</span>
            <input
              type="text"
              value={selectedAttendanceDate}
              onChange={(e) => setSelectedAttendanceDate(e.target.value)}
              className="bg-transparent text-xs font-bold text-on-surface focus:outline-none w-28"
            />
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs text-on-surface-variant">
          <div>
            <span className="text-outline">Peak Time: </span>
            <span className="font-bold text-on-surface">08:00 AM - 11:00 AM</span>
          </div>
          <div>
            <span className="text-outline">Total Logged: </span>
            <span className="font-bold text-on-surface">{attendanceRecords.length} Check-ins</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Attendance Table & Hourly Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Attendance Table */}
        <div className="lg:col-span-2 bg-surface-container-lowest p-6 md:p-8 rounded-3xl border border-outline-variant/30 card-shadow">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-headline-lg text-lg font-bold text-on-surface">
                Today's Attendance Log ({filteredRecords.length})
              </h2>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Real-time record of members currently checked into the facility
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/30 text-[11px] font-bold text-outline uppercase tracking-wider">
                  <th className="py-3 px-4">Member</th>
                  <th className="py-3 px-4">Check-In Time</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20 text-xs">
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-surface-container-low/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {record.avatar_url ? (
                          <img
                            src={record.avatar_url}
                            alt={record.member_name}
                            referrerPolicy="no-referrer"
                            className="w-8 h-8 rounded-full object-cover"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center font-bold text-on-surface text-xs">
                            {record.member_name ? record.member_name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "M"}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-on-surface">{record.member_name}</p>
                          <p className="font-mono text-[10px] text-outline">{record.member_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-on-surface">{record.time}</td>
                    <td className="py-3.5 px-4 text-on-surface-variant">{record.date}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          record.status === "Active"
                            ? "bg-emerald-100 text-emerald-800"
                            : record.status === "Guest"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {record.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg">
                        <span className="material-symbols-outlined text-xs">verified</span>
                        Verified
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: Daily Hourly Check-In Chart & Peak Summary */}
        <div className="space-y-6">
          <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/30 card-shadow">
            <h3 className="font-headline-md text-base font-bold text-on-surface mb-4">Daily Check-in Volume</h3>

            {/* Mon-Sun Bar Chart */}
            <div className="h-44 flex items-end justify-between gap-2 pt-4 px-1 border-b border-outline-variant/20">
              {chartData.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group">
                  <div
                    style={{ height: `${(d.count / maxCount) * 100}%`, minHeight: d.count > 0 ? "4px" : "0" }}
                    className={`w-full max-w-[18px] rounded-t-md transition-all ${
                      d.day === todayDayName ? "bg-secondary" : "bg-surface-container-high"
                    }`}
                  />
                  <span className="text-[10px] font-bold text-outline">{d.day}</span>
                </div>
              ))}
            </div>

            <p className="text-xs text-on-surface-variant mt-4">
              Today is highlighted in <span className="font-bold text-on-surface">{todayDayName}</span>. Bars show all-time check-ins per weekday.
            </p>
          </div>

          <div className="bg-tertiary-container text-white p-6 rounded-3xl shadow-lg">
            <div className="flex items-center gap-2 mb-2 text-secondary-container">
              <span className="material-symbols-outlined text-xl">shield</span>
              <h4 className="font-headline-md text-sm font-bold">Access Rules Active</h4>
            </div>
            <p className="text-xs text-surface-container-high/80 leading-relaxed">
              Active plan members receive instant turnstile clearance. Flagged accounts require manual staff review at the desk.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
