import { useState } from "react";
import { useGym } from "../services/GymContext";
export const ReportsView = () => {
  const { addToast } = useGym();
  const [timeRange, setTimeRange] = useState("30Days");
  const handleExportPDF = () => {
    addToast("Report Exported", "FitZone_Analytics_Q4_2026.pdf has been downloaded.", "success");
  };
  return <div className="space-y-8 animate-fade-in pb-12">
      {
    /* Header Bar */
  }
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline-lg text-2xl font-bold text-on-surface">
            Business Insights & Reports
          </h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Financial analytics, attendance metrics, and facility utilization performance.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          {
    /* Time Range Selector */
  }
          <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-2xl border border-outline-variant/30">
            {[
    { id: "Today", label: "Today" },
    { id: "30Days", label: "Last 30 Days" },
    { id: "YTD", label: "Year to Date" }
  ].map((t) => <button
    key={t.id}
    onClick={() => setTimeRange(t.id)}
    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${timeRange === t.id ? "bg-surface-container-lowest text-on-surface shadow-xs font-bold" : "text-on-surface-variant hover:text-on-surface"}`}
  >
                {t.label}
              </button>)}
          </div>

          <button
    onClick={handleExportPDF}
    className="px-4 py-2.5 bg-secondary text-on-secondary hover:bg-secondary/90 rounded-2xl font-headline-md text-xs font-bold flex items-center gap-2 transition-colors shadow-sm"
  >
            <span className="material-symbols-outlined text-lg">download</span>
            <span className="hidden sm:inline">Export PDF</span>
          </button>
        </div>
      </div>

      {
    /* Metric Stat Cards */
  }
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/30 card-shadow">
          <p className="text-xs font-bold text-outline uppercase tracking-wider">
            Total Revenue
          </p>
          <h3 className="font-headline-lg text-3xl font-extrabold text-on-surface mt-2">
            LKR 42,850.00
          </h3>
          <p className="text-xs font-bold text-emerald-700 mt-2 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">trending_up</span>
            +12.4% vs previous month
          </p>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/30 card-shadow">
          <p className="text-xs font-bold text-outline uppercase tracking-wider">
            New Registrations
          </p>
          <h3 className="font-headline-lg text-3xl font-extrabold text-on-surface mt-2">
            158 Members
          </h3>
          <p className="text-xs font-bold text-emerald-700 mt-2 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">trending_up</span>
            +8.2% conversion rate
          </p>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/30 card-shadow">
          <p className="text-xs font-bold text-outline uppercase tracking-wider">
            Avg Daily Occupancy
          </p>
          <h3 className="font-headline-lg text-3xl font-extrabold text-on-surface mt-2">
            76.4%
          </h3>
          <p className="text-xs font-bold text-emerald-700 mt-2 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">trending_up</span>
            +4.1% capacity utilization
          </p>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/30 card-shadow">
          <p className="text-xs font-bold text-outline uppercase tracking-wider">
            Member Churn Rate
          </p>
          <h3 className="font-headline-lg text-3xl font-extrabold text-on-surface mt-2">
            4.2%
          </h3>
          <p className="text-xs font-bold text-emerald-700 mt-2 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">trending_down</span>
            -1.8% reduced cancellation
          </p>
        </div>
      </div>

      {
    /* Main Charts Row */
  }
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {
    /* Left 2 Cols: Monthly Revenue Performance */
  }
        <div className="lg:col-span-2 bg-surface-container-lowest p-6 md:p-8 rounded-3xl border border-outline-variant/30 card-shadow">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-headline-lg text-lg font-bold text-on-surface">
                Revenue Growth Performance
              </h2>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Monthly recurring subscription payments and day pass earnings
              </p>
            </div>
            <span className="text-xs font-bold text-secondary bg-secondary-fixed px-3 py-1 rounded-full">
              Target Exceeded (+15%)
            </span>
          </div>

          <div className="h-64 w-full flex items-end justify-between gap-4 pt-6 border-b border-outline-variant/30">
            {[
    { month: "Jan", rev: "LKR 28k", h: 50 },
    { month: "Feb", rev: "LKR 31k", h: 58 },
    { month: "Mar", rev: "LKR 34k", h: 65 },
    { month: "Apr", rev: "LKR 32k", h: 60 },
    { month: "May", rev: "LKR 36k", h: 72 },
    { month: "Jun", rev: "LKR 38k", h: 78 },
    { month: "Jul", rev: "LKR 40k", h: 84 },
    { month: "Aug", rev: "LKR 41k", h: 88 },
    { month: "Sep", rev: "LKR 39k", h: 82 },
    { month: "Oct", rev: "LKR 42.8k", h: 96 }
  ].map((m, idx) => <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                <div
    style={{ height: `${m.h}%` }}
    className="w-full max-w-[20px] bg-secondary rounded-t-md group-hover:bg-secondary/80 transition-all"
  />
                <span className="text-[10px] font-bold text-outline">{m.month}</span>
              </div>)}
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-outline">
            <span>Highest revenue month: October (LKR 42,850.00)</span>
            <span className="font-semibold text-on-surface">Recurring Revenue: 88%</span>
          </div>
        </div>

        {
    /* Right 1 Col: Donut Breakdown Plan Distribution */
  }
        <div className="bg-surface-container-lowest p-6 md:p-8 rounded-3xl border border-outline-variant/30 card-shadow flex flex-col justify-between">
          <div>
            <h2 className="font-headline-lg text-lg font-bold text-on-surface mb-1">
              Plan Distribution
            </h2>
            <p className="text-xs text-on-surface-variant mb-6">
              Active member breakdown by plan tier
            </p>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-bold text-on-surface mb-1">
                  <span>Annual Elite</span>
                  <span>52% (546 members)</span>
                </div>
                <div className="w-full h-3 bg-surface-container-high rounded-full overflow-hidden">
                  <div className="h-full bg-secondary w-[52%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-on-surface mb-1">
                  <span>Monthly Pro</span>
                  <span>35% (368 font)</span>
                </div>
                <div className="w-full h-3 bg-surface-container-high rounded-full overflow-hidden">
                  <div className="h-full bg-tertiary-container w-[35%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-on-surface mb-1">
                  <span>Day Pass</span>
                  <span>13% (136 guests)</span>
                </div>
                <div className="w-full h-3 bg-surface-container-high rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 w-[13%]" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-surface-container-low rounded-2xl text-xs text-on-surface-variant">
            <span className="font-bold text-on-surface">Insight: </span>
            Annual Elite plan holds highest margin and retention rate.
          </div>
        </div>
      </div>

      {
    /* Hourly Peak Hours Analysis */
  }
      <div className="bg-surface-container-lowest p-6 md:p-8 rounded-3xl border border-outline-variant/30 card-shadow">
        <h2 className="font-headline-lg text-lg font-bold text-on-surface mb-1">
          Peak Floor Occupancy Hours
        </h2>
        <p className="text-xs text-on-surface-variant mb-6">
          Hourly distribution of turnstile check-in scans across a 24-hour cycle
        </p>

        <div className="h-44 w-full flex items-end justify-between gap-3 border-b border-outline-variant/30 pb-2">
          {[
    { hour: "06:00", load: 45 },
    { hour: "08:00", load: 92 },
    { hour: "10:00", load: 85 },
    { hour: "12:00", load: 60 },
    { hour: "14:00", load: 40 },
    { hour: "16:00", load: 70 },
    { hour: "18:00", load: 98 },
    { hour: "20:00", load: 75 },
    { hour: "22:00", load: 30 }
  ].map((h, i) => <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div
    style={{ height: `${h.load}%` }}
    className={`w-full max-w-[24px] rounded-t-md transition-all ${h.load > 90 ? "bg-secondary" : "bg-surface-container-high"}`}
  />
              <span className="text-[10px] font-bold text-outline">{h.hour}</span>
            </div>)}
        </div>
        <p className="text-xs text-on-surface-variant mt-4">
          Peak hours: <span className="font-bold text-on-surface">08:00 AM & 06:00 PM</span>. Staffing levels automatically balanced.
        </p>
      </div>
    </div>;
};
