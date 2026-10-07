import React, { useState } from 'react';
import { useSociety } from '../../context/SocietyContext';
import {
  AlertOctagon,
  ShieldAlert,
  PhoneCall,
  CheckCircle2,
  X,
  Radio,
  User,
  Users,
  Building,
  Lock,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';

interface PanicAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PanicAlertModal: React.FC<PanicAlertModalProps> = ({ isOpen, onClose }) => {
  const { activeFlat, flats, sosAlerts, triggerPanicAlert, resolveSOS } = useSociety();

  const [emergencyReason, setEmergencyReason] = useState<string>('Immediate Security Assistance');
  const [customNotes, setCustomNotes] = useState<string>('');
  const [isTriggered, setIsTriggered] = useState<boolean>(false);
  const [activeAlertId, setActiveAlertId] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentFlat = flats.find((f) => f.flatNumber === activeFlat) || flats[0];
  const existingActivePanic = sosAlerts.find(
    (a) => a.flatNumber === activeFlat && a.status === 'active' && a.isSilentPanic
  );

  const isCurrentlyInPanic = !!existingActivePanic || isTriggered;

  const handleSendPanicAlert = () => {
    const fullNote = customNotes.trim()
      ? `${emergencyReason}: ${customNotes.trim()}`
      : `Silent Panic: ${emergencyReason}`;
    const newAlert = triggerPanicAlert(fullNote);
    setActiveAlertId(newAlert.id);
    setIsTriggered(true);
  };

  const handleCancelPanic = () => {
    const targetId = existingActivePanic?.id || activeAlertId;
    if (targetId) {
      resolveSOS(targetId, 'Cancelled by Resident / False Alarm Cleared');
    }
    setIsTriggered(false);
    setActiveAlertId(null);
    onClose();
  };

  return (
    <div
      id="panic-alert-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in"
    >
      <div
        id="panic-alert-modal-container"
        className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-rose-200/80 my-8 transition-all"
      >
        {/* Modal Header */}
        <div className={`p-6 text-white ${isCurrentlyInPanic ? 'bg-gradient-to-r from-rose-700 via-red-600 to-rose-800' : 'bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-2xl ${isCurrentlyInPanic ? 'bg-white text-rose-700 animate-pulse' : 'bg-rose-600 text-white shadow-lg'}`}>
                <AlertOctagon className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black tracking-tight">
                    {isCurrentlyInPanic ? 'SILENT PANIC ALARM ACTIVE' : 'Silent Panic Emergency Alert'}
                  </h3>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-rose-500/30 text-rose-200 border border-rose-400/40 px-2.5 py-0.5 rounded-full">
                    Gate 1 Link
                  </span>
                </div>
                <p className="text-xs text-rose-100 mt-0.5">
                  {isCurrentlyInPanic
                    ? 'Security guards at Gate 1 have received your emergency dispatch request.'
                    : 'Instantly alerts on-duty security guards with your flat location & contacts.'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5">
          {/* Active Emergency Status View */}
          {isCurrentlyInPanic ? (
            <div className="space-y-4">
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 text-rose-950 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="relative flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-600"></span>
                  </span>
                  <h4 className="font-extrabold text-sm text-rose-900">
                    Emergency Broadcast Transmitted to Guard View
                  </h4>
                </div>

                <p className="text-xs text-rose-800 leading-relaxed">
                  Security guards at Gate 1 Desk have been dispatched with your registered unit location and are monitoring your status. If you are safe or triggered this by mistake, you can stand down the alert below.
                </p>

                {/* Dispatched Guards info if any */}
                {existingActivePanic?.dispatchedGuards && existingActivePanic.dispatchedGuards.length > 0 && (
                  <div className="bg-white/80 border border-rose-200 rounded-xl p-3 text-xs space-y-1">
                    <span className="font-bold text-rose-950 block">Dispatched Responders:</span>
                    <div className="text-rose-800">
                      {existingActivePanic.dispatchedGuards.join(', ')} ({existingActivePanic.dispatchedAt})
                    </div>
                  </div>
                )}
              </div>

              {/* Resident Info Transmitted Summary */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5 text-xs text-slate-700">
                <h5 className="font-bold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Information Transmitted to Security:</span>
                </h5>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400 block font-medium">Apartment Unit:</span>
                    <span className="font-extrabold text-slate-900">
                      Flat {currentFlat.flatNumber} (Wing {currentFlat.wing}, Floor {currentFlat.floor})
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Resident:</span>
                    <span className="font-extrabold text-slate-900">{currentFlat.ownerName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Phone:</span>
                    <span className="font-mono font-bold text-slate-900">{currentFlat.phone}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Emergency Contacts:</span>
                    <span className="font-bold text-slate-900">
                      {currentFlat.emergencyContacts?.length || 0} Registered Contacts
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleCancelPanic}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs sm:text-sm py-3 px-4 rounded-xl transition-all shadow-md active:scale-95 text-center"
                >
                  Clear Alarm / False Alert
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-3 px-4 rounded-xl transition-all"
                >
                  Close Window (Keep Alarm Active)
                </button>
              </div>
            </div>
          ) : (
            /* Trigger Panic Alert Form */
            <div className="space-y-5">
              {/* Target Location Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Originating Unit:</span>
                  <span className="font-black text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-lg">
                    Flat {currentFlat.flatNumber} • Wing {currentFlat.wing} (Floor {currentFlat.floor})
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Resident Name & Contact:</span>
                  <span className="font-bold text-slate-900">
                    {currentFlat.ownerName} ({currentFlat.phone})
                  </span>
                </div>
                {currentFlat.emergencyContacts && currentFlat.emergencyContacts.length > 0 && (
                  <div className="text-[11px] text-slate-500 border-t border-slate-200 pt-2 mt-1">
                    <span className="font-semibold text-slate-700">Primary Emergency Contact:</span>{' '}
                    {currentFlat.emergencyContacts[0].name} ({currentFlat.emergencyContacts[0].relationship}) -{' '}
                    {currentFlat.emergencyContacts[0].phone}
                  </div>
                )}
              </div>

              {/* Nature of Emergency Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 block">
                  Select Situation Type (Optional):
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'Immediate Security Assistance',
                    'Intruder / Threat at Door',
                    'Medical Emergency',
                    'Fire / Smoke Hazard',
                  ].map((reason) => (
                    <button
                      key={reason}
                      type="button"
                      onClick={() => setEmergencyReason(reason)}
                      className={`p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                        emergencyReason === reason
                          ? 'bg-rose-50 border-rose-400 text-rose-950 ring-1 ring-rose-400 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {reason}
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional Discreet Note */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Additional Notes for Guard (Optional):
                </label>
                <input
                  type="text"
                  placeholder="e.g. Someone knocking persistently, need assistance immediately"
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-rose-500 focus:bg-white transition-all"
                />
              </div>

              {/* Warning Notice */}
              <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3 text-[11px] text-amber-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  Pressing the button below sends an <strong>instant silent priority alert</strong> to Gate 1 security guards. Security protocols will be initiated immediately.
                </p>
              </div>

              {/* Primary Instant Dispatch Button */}
              <button
                type="button"
                onClick={handleSendPanicAlert}
                className="w-full bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-black text-sm sm:text-base py-3.5 px-6 rounded-2xl shadow-xl shadow-rose-950/30 flex items-center justify-center gap-2.5 transition-all active:scale-95 group"
              >
                <Radio className="w-5 h-5 text-white animate-pulse" />
                <span>TRIGGER SILENT PANIC ALERT</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
