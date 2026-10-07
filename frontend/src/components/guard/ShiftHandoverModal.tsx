import React, { useState } from 'react';
import { useSociety } from '../../context/SocietyContext';
import {
  Shield,
  Clock,
  UserCheck,
  FileText,
  CheckCircle2,
  X,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Building,
  Key,
} from 'lucide-react';

interface ShiftHandoverModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'start' | 'end';
}

export const ShiftHandoverModal: React.FC<ShiftHandoverModalProps> = ({ isOpen, onClose, mode }) => {
  const { activeShift, startGuardShift, endGuardShift, visitors, sosAlerts } = useSociety();

  // Start Form
  const [guardName, setGuardName] = useState('Commander Vikram Singh');
  const [guardBadgeId, setGuardBadgeId] = useState('SEC-01');
  const [gateStation, setGateStation] = useState('Main Gate 1');
  const [shiftType, setShiftType] = useState<'Morning' | 'Afternoon' | 'Night' | 'Custom'>('Morning');
  const [startTime, setStartTime] = useState(
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
  );

  // End / Handover Form
  const [endTime, setEndTime] = useState(
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
  );
  const [handedOverTo, setHandedOverTo] = useState('Officer Ramesh Patil');
  const [handoverNotes, setHandoverNotes] = useState(
    'All perimeter sensors checked and clear. Key locker audited. Radio handset #1 handed over.'
  );

  const [completedToast, setCompletedToast] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStartSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guardName.trim()) return;

    startGuardShift({
      guardName: guardName.trim(),
      guardBadgeId: guardBadgeId.trim(),
      gateStation: gateStation.trim(),
      shiftType,
      startTime,
    });

    setCompletedToast(`Security Shift started for ${guardName} at ${gateStation}`);
    setTimeout(() => {
      setCompletedToast(null);
      onClose();
    }, 1200);
  };

  const handleEndSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeShift) return;

    endGuardShift(activeShift.id, {
      endTime,
      handoverNotes: handoverNotes.trim(),
      handedOverTo: handedOverTo.trim() || undefined,
    });

    setCompletedToast(
      `Shift ended and handed over to ${handedOverTo || 'Relieving Officer'} at ${endTime}`
    );
    setTimeout(() => {
      setCompletedToast(null);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-200 my-6 animate-fade-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white p-5 sm:p-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500 text-slate-950 rounded-2xl shadow-md font-black">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-lg sm:text-xl text-white">
                {mode === 'start' ? 'Clock-In: Start Security Shift' : 'Clock-Out & Duty Handover'}
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                {mode === 'start'
                  ? 'Record guard identity, assigned gate station, and shift window.'
                  : 'Document duty completion, visitor tallies, and relieving guard handover remarks.'}
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

        {/* Content */}
        {completedToast ? (
          <div className="p-10 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-xl font-black text-slate-900">Shift Status Updated</h4>
            <p className="text-sm text-slate-600">{completedToast}</p>
          </div>
        ) : mode === 'start' ? (
          <form onSubmit={handleStartSubmit} className="p-5 sm:p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Duty Guard Name *
                </label>
                <input
                  type="text"
                  required
                  value={guardName}
                  onChange={(e) => setGuardName(e.target.value)}
                  placeholder="e.g. Commander Vikram Singh"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Badge / Security ID
                </label>
                <input
                  type="text"
                  value={guardBadgeId}
                  onChange={(e) => setGuardBadgeId(e.target.value)}
                  placeholder="e.g. SEC-01"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 uppercase focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Gate Station *
                </label>
                <select
                  value={gateStation}
                  onChange={(e) => setGateStation(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                >
                  <option value="Main Gate 1">Main Gate 1 (Primary Entry & Exit)</option>
                  <option value="Service Gate 2">Service Gate 2 (Vendors & Deliveries)</option>
                  <option value="North Gate 3">North Gate 3 (Resident Fast-Lane)</option>
                  <option value="Clubhouse Gate">Clubhouse & Sports Gate</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Shift Window *
                </label>
                <select
                  value={shiftType}
                  onChange={(e) =>
                    setShiftType(e.target.value as 'Morning' | 'Afternoon' | 'Night' | 'Custom')
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                >
                  <option value="Morning">Morning Shift (06:00 AM - 02:00 PM)</option>
                  <option value="Afternoon">Afternoon Shift (02:00 PM - 10:00 PM)</option>
                  <option value="Night">Night Shift (10:00 PM - 06:00 AM)</option>
                  <option value="Custom">Custom Shift Window</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Clock-In Start Time
              </label>
              <input
                type="text"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                placeholder="e.g. 06:00 AM"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Clock className="w-4 h-4" />
                <span>Clock-In & Activate Shift</span>
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleEndSubmit} className="p-5 sm:p-6 space-y-4">
            {/* Shift Snapshot */}
            {activeShift && (
              <div className="bg-slate-900 text-slate-200 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{activeShift.guardName}</span>
                    <span className="text-[10px] font-mono bg-slate-800 px-2 py-0.5 rounded text-emerald-400 border border-slate-700">
                      {activeShift.guardBadgeId}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 font-bold">{activeShift.gateStation}</span>
                </div>
                <p className="text-xs text-slate-300">
                  Duty started at <strong className="text-emerald-400">{activeShift.startTime}</strong> on{' '}
                  {activeShift.date}.
                </p>
                <div className="flex gap-4 pt-1 text-[11px] text-slate-400 border-t border-slate-800">
                  <span>Processed Visitors: <strong className="text-white">{visitors.length}</strong></span>
                  <span>Logged Incidents: <strong className="text-amber-400">{activeShift.incidents.length}</strong></span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Clock-Out End Time *
                </label>
                <input
                  type="text"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  placeholder="e.g. 02:00 PM"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Relieving Officer (Handover To)
                </label>
                <input
                  type="text"
                  value={handedOverTo}
                  onChange={(e) => setHandedOverTo(e.target.value)}
                  placeholder="e.g. Officer Ramesh Patil"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Shift Handover Remarks & Equipment Status *
              </label>
              <textarea
                required
                rows={3}
                value={handoverNotes}
                onChange={(e) => setHandoverNotes(e.target.value)}
                placeholder="Mention equipment handover (walkie-talkies, boom barrier keys), pending gate approvals, visitor alerts, or special resident instructions..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Sign Off & Conclude Shift</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
