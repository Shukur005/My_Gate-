import React from 'react';
import { useSociety } from '../../context/SocietyContext';
import {
  Shield,
  FileText,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  UserCheck,
  Car,
  Package,
  X,
  Users,
  BarChart3,
  Building,
  Sparkles,
  Printer,
  ShieldAlert,
  ArrowUpRight,
} from 'lucide-react';

interface ShiftSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShiftSummaryModal: React.FC<ShiftSummaryModalProps> = ({ isOpen, onClose }) => {
  const { visitors, sosAlerts, staff } = useSociety();

  if (!isOpen) return null;

  // Visitor Tallies
  const totalVisitors = visitors.length;
  const inGateCount = visitors.filter((v) => v.status === 'in_gate').length;
  const checkedOutCount = visitors.filter((v) => v.status === 'checked_out').length;
  const deniedCount = visitors.filter((v) => v.status === 'denied').length;
  const pendingCount = visitors.filter(
    (v) => v.status === 'pending_approval' || v.status === 'expected'
  ).length;

  // Visitor Category Tallies
  const deliveryCount = visitors.filter((v) => v.category === 'delivery').length;
  const cabCount = visitors.filter((v) => v.category === 'cab').length;
  const guestCount = visitors.filter((v) => v.category === 'guest').length;
  const serviceCount = visitors.filter((v) => v.category === 'service').length;

  // Vehicle entries recorded
  const vehicleCount = visitors.filter((v) => v.vehicleNumber && v.vehicleNumber.trim().length > 0).length;

  // Incidents Tallies
  const totalSOS = sosAlerts.length;
  const activeSOSCount = sosAlerts.filter((s) => s.status === 'active').length;
  const resolvedSOSCount = sosAlerts.filter((s) => s.status === 'resolved').length;
  const totalIncidents = totalSOS + deniedCount;

  // Staff attendance tally
  const staffPresent = staff.filter((s) => s.isPresentToday).length;

  // Today's Date formatting
  const todayDateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-200 my-6 animate-fade-in">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white p-5 sm:p-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-emerald-500 text-slate-950 rounded-2xl font-black shadow-md">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-lg sm:text-xl text-white">Active Shift Summary & Handover</h3>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                  Shift Log #8492
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Station: Main Gate 1 • Duty Officer: Commander Vikram • {todayDateStr}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Shift Time & Quick Overview Banner */}
          <div className="bg-slate-900 rounded-2xl p-4 text-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Current Shift Window</span>
                <span className="text-sm font-extrabold text-white">Morning Shift (06:00 AM - 02:00 PM)</span>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="bg-slate-800 border border-slate-700 px-3.5 py-1.5 rounded-xl text-center flex-1 sm:flex-initial">
                <span className="text-[9px] text-slate-400 font-bold uppercase block">Incidents Logged</span>
                <span className={`text-xs font-black ${totalIncidents > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {totalIncidents} Incident(s)
                </span>
              </div>
              <div className="bg-slate-800 border border-slate-700 px-3.5 py-1.5 rounded-xl text-center flex-1 sm:flex-initial">
                <span className="text-[9px] text-slate-400 font-bold uppercase block">Visitors Processed</span>
                <span className="text-xs font-black text-emerald-400">{totalVisitors} Total</span>
              </div>
            </div>
          </div>

          {/* SECTION 1: VISITOR TALLY METRICS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-600" />
                <span>1. Visitor Traffic Tally</span>
              </h4>
              <span className="text-xs font-bold text-slate-500">{totalVisitors} Visitors Today</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-3.5 text-center">
                <span className="text-[10px] font-bold text-emerald-800 uppercase block mb-0.5">Approved / In-Gate</span>
                <span className="text-2xl font-black text-emerald-900">{inGateCount}</span>
                <span className="text-[10px] text-emerald-700 font-semibold block mt-1">Currently Inside</span>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-center">
                <span className="text-[10px] font-bold text-slate-600 uppercase block mb-0.5">Checked Out</span>
                <span className="text-2xl font-black text-slate-800">{checkedOutCount}</span>
                <span className="text-[10px] text-slate-500 font-semibold block mt-1">Exited Gate</span>
              </div>

              <div className="bg-rose-50/80 border border-rose-200/80 rounded-2xl p-3.5 text-center">
                <span className="text-[10px] font-bold text-rose-800 uppercase block mb-0.5">Denied / Blocked</span>
                <span className="text-2xl font-black text-rose-900">{deniedCount}</span>
                <span className="text-[10px] text-rose-700 font-semibold block mt-1">Entry Refused</span>
              </div>

              <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-3.5 text-center">
                <span className="text-[10px] font-bold text-amber-800 uppercase block mb-0.5">Pending Approval</span>
                <span className="text-2xl font-black text-amber-900">{pendingCount}</span>
                <span className="text-[10px] text-amber-700 font-semibold block mt-1">Awaiting Flat Confirmation</span>
              </div>
            </div>

            {/* Visitor Category Breakdown */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
              <span className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider block">
                Visitor Category Distribution
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="w-3.5 h-3.5 text-amber-600" />
                    <span className="text-xs font-bold text-slate-800">Delivery</span>
                  </div>
                  <span className="text-xs font-black text-slate-900">{deliveryCount}</span>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Car className="w-3.5 h-3.5 text-blue-600" />
                    <span className="text-xs font-bold text-slate-800">Cab / Taxi</span>
                  </div>
                  <span className="text-xs font-black text-slate-900">{cabCount}</span>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-800">Guest</span>
                  </div>
                  <span className="text-xs font-black text-slate-900">{guestCount}</span>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-3.5 h-3.5 text-purple-600" />
                    <span className="text-xs font-bold text-slate-800">Services</span>
                  </div>
                  <span className="text-xs font-black text-slate-900">{serviceCount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: LOGGED INCIDENTS & EMERGENCY ALERTS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <span>2. Logged Security Incidents & Emergency SOS ({totalIncidents})</span>
              </h4>
              <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                {activeSOSCount} Active Emergency
              </span>
            </div>

            {/* SOS Alerts Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-rose-50/90 border border-rose-200 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-rose-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    Emergency SOS Triggered
                  </span>
                  <span className="text-xs font-black text-rose-700">{totalSOS} Total</span>
                </div>
                <div className="text-[11px] text-rose-800 space-y-1">
                  <div className="flex justify-between">
                    <span>Active Unresolved Alerts:</span>
                    <strong className="text-rose-900">{activeSOSCount}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Resolved & Cleared:</span>
                    <strong className="text-emerald-800">{resolvedSOSCount}</strong>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-900 flex items-center gap-1.5">
                    <XCircle className="w-4 h-4 text-amber-600" />
                    Flagged / Denied Entries
                  </span>
                  <span className="text-xs font-black text-amber-700">{deniedCount} Blocked</span>
                </div>
                <p className="text-[11px] text-amber-800">
                  {deniedCount > 0
                    ? `${deniedCount} unauthorized or resident-rejected visitor entry attempts were stopped at gate.`
                    : 'No unauthorized entry attempts recorded during this shift window.'}
                </p>
              </div>
            </div>

            {/* Incident Log Table / List */}
            {sosAlerts.length > 0 || deniedCount > 0 ? (
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/50">
                <div className="bg-slate-900 text-slate-200 text-[10px] font-extrabold uppercase px-3.5 py-2 flex justify-between">
                  <span>Incident Log Event Details</span>
                  <span>Timestamp & Status</span>
                </div>
                <div className="divide-y divide-slate-200 max-h-40 overflow-y-auto">
                  {sosAlerts.map((s) => (
                    <div key={s.id} className="p-3 bg-white text-xs flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <AlertTriangle
                          className={`w-4 h-4 shrink-0 ${
                            s.status === 'active' ? 'text-rose-600 animate-pulse' : 'text-slate-400'
                          }`}
                        />
                        <div>
                          <strong className="text-slate-900">
                            {s.type} SOS from Flat {s.flatNumber}
                          </strong>
                          <span className="text-[11px] text-slate-500 block">Resident: {s.residentName}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase border ${
                            s.status === 'active'
                              ? 'bg-rose-100 text-rose-800 border-rose-300'
                              : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          }`}
                        >
                          {s.status}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{s.triggeredAt}</span>
                      </div>
                    </div>
                  ))}

                  {visitors
                    .filter((v) => v.status === 'denied')
                    .map((d) => (
                      <div key={d.id} className="p-3 bg-white text-xs flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                          <div>
                            <strong className="text-slate-900">
                              Denied Visitor: {d.visitorName} ({d.category})
                            </strong>
                            <span className="text-[11px] text-slate-500 block">Target: Flat {d.flatNumber}</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase bg-rose-100 text-rose-800 border border-rose-300">
                            Entry Blocked
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ) : (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Zero security breaches or active unresolved emergency alerts logged for this shift window.</span>
              </div>
            )}
          </div>

          {/* SECTION 3: ADDITIONAL SHIFT STATS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Car className="w-4 h-4 text-emerald-600" />
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Vehicle Logged Entries</span>
                  <span className="text-[11px] text-slate-500">Cars & bikes with license plates</span>
                </div>
              </div>
              <span className="text-sm font-black text-slate-900">{vehicleCount} Recorded</span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <UserCheck className="w-4 h-4 text-indigo-600" />
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Daily Staff Attendance</span>
                  <span className="text-[11px] text-slate-500">Maids, cooks & technicians on site</span>
                </div>
              </div>
              <span className="text-sm font-black text-indigo-700">
                {staffPresent} / {staff.length} Active
              </span>
            </div>
          </div>

          {/* Handover Sign-off & Actions Footer */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Shift Summary auto-generated and synced with Admin Audit Desk</span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handlePrint}
                className="flex-1 sm:flex-initial bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-200"
              >
                <Printer className="w-4 h-4 text-slate-600" />
                <span>Print Summary</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-initial bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2.5 px-5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Acknowledge & Close</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
