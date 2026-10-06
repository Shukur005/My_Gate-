import React, { useState } from 'react';
import { useSociety } from '../../context/SocietyContext';
import { ShiftIncidentCategory, ShiftIncidentSeverity } from '../../types';
import {
  AlertTriangle,
  ShieldAlert,
  X,
  MapPin,
  FileText,
  CheckCircle2,
  Car,
  Building,
  User,
  Activity,
  Sparkles,
} from 'lucide-react';

interface LogIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  shiftId?: string;
}

export const LogIncidentModal: React.FC<LogIncidentModalProps> = ({ isOpen, onClose, shiftId }) => {
  const { activeShift, logShiftIncident } = useSociety();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ShiftIncidentCategory>('Unauthorized Vehicle');
  const [severity, setSeverity] = useState<ShiftIncidentSeverity>('medium');
  const [location, setLocation] = useState('Main Gate 1');
  const [description, setDescription] = useState('');
  const [actionTaken, setActionTaken] = useState('');
  const [flatNumber, setFlatNumber] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [reportedBy, setReportedBy] = useState(activeShift?.guardName || 'Commander Vikram Singh');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !actionTaken.trim()) return;

    logShiftIncident({
      shiftId: shiftId || activeShift?.id,
      title: title.trim(),
      category,
      severity,
      location: location.trim(),
      description: description.trim(),
      actionTaken: actionTaken.trim(),
      reportedBy: reportedBy.trim(),
      flatNumber: flatNumber.trim() || undefined,
      vehicleNumber: vehicleNumber.trim() || undefined,
    });

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setTitle('');
      setDescription('');
      setActionTaken('');
      setFlatNumber('');
      setVehicleNumber('');
      onClose();
    }, 1200);
  };

  const getSeverityStyle = (s: ShiftIncidentSeverity) => {
    switch (s) {
      case 'critical':
        return 'bg-rose-50 border-rose-500 text-rose-700 ring-2 ring-rose-500';
      case 'high':
        return 'bg-amber-50 border-amber-500 text-amber-700 ring-2 ring-amber-500';
      case 'medium':
        return 'bg-blue-50 border-blue-500 text-blue-700 ring-2 ring-blue-500';
      case 'low':
        return 'bg-slate-50 border-slate-400 text-slate-700 ring-2 ring-slate-400';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 my-6 animate-fade-in">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white p-5 sm:p-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-rose-500 text-white rounded-2xl shadow-md">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-lg sm:text-xl text-white">Log Notable Duty Incident</h3>
                <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  Shift Record
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Record security breaches, disputes, mechanical faults, or safety events for the digital ledger.
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

        {/* Modal Body */}
        {submitted ? (
          <div className="p-10 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-xl font-black text-slate-900">Incident Logged Successfully</h4>
            <p className="text-sm text-slate-500">
              The incident has been recorded to the current security shift ledger and synced.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
            {/* Severity Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Incident Severity Level *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['low', 'medium', 'high', 'critical'] as ShiftIncidentSeverity[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSeverity(s)}
                    className={`py-2 px-3 rounded-xl border text-xs font-black capitalize transition-all ${
                      severity === s
                        ? getSeverityStyle(s)
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {s === 'critical' ? '🔴 Critical SOS' : s === 'high' ? '🟠 High Risk' : s === 'medium' ? '🔵 Medium' : '⚪ Low / Info'}
                  </button>
                ))}
              </div>
            </div>

            {/* Category & Title */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ShiftIncidentCategory)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                >
                  <option value="Security Breach">Security Breach</option>
                  <option value="Unauthorized Vehicle">Unauthorized Vehicle</option>
                  <option value="Noise / Disturbance">Noise / Disturbance</option>
                  <option value="Medical / SOS">Medical / SOS</option>
                  <option value="Gate Barrier Fault">Gate Barrier Fault</option>
                  <option value="Suspicious Package">Suspicious Package</option>
                  <option value="Resident Dispute">Resident Dispute</option>
                  <option value="Staff Misconduct">Staff Misconduct</option>
                  <option value="Lost & Found">Lost & Found</option>
                  <option value="Other">Other Duty Event</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Incident Title / Headline *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tailgating attempt at Exit Boom Barrier"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>

            {/* Location & Reported By */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>Incident Location *</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Main Gate 1 Boom Barrier, Tower B Basement"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Reporting Officer Name *</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Commander Vikram Singh"
                  value={reportedBy}
                  onChange={(e) => setReportedBy(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>

            {/* Optional Flat and Vehicle Tag */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  <span>Associated Flat (Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. B-402 or C-302"
                  value={flatNumber}
                  onChange={(e) => setFlatNumber(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Car className="w-3.5 h-3.5 text-slate-400" />
                  <span>Vehicle Number (Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. MH-02-CD-9988"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 uppercase focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Incident Description & Sequence of Events *
              </label>
              <textarea
                required
                rows={3}
                placeholder="Describe what occurred, people involved, and observations made by the security personnel..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900"
              />
            </div>

            {/* Action Taken */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Immediate Action Taken / Resolution Steps *
              </label>
              <textarea
                required
                rows={2}
                placeholder="What action did the duty guard take? (e.g. Detained vehicle, dispatched patrol guard, alerted resident, reset breaker, calmed dispute...)"
                value={actionTaken}
                onChange={(e) => setActionTaken(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
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
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>Save to Shift Log</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
