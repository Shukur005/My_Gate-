import React, { useState } from 'react';
import { useSociety } from '../../context/SocietyContext';
import { VisitorCategory, VisitorPass } from '../../types';
import { QRVisitorPassCard } from '../common/QRVisitorPassCard';
import {
  X,
  Key,
  QrCode,
  Smartphone,
  Calendar,
  Clock,
  Car,
  FileText,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Share2,
} from 'lucide-react';

interface PreApproveModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCategory?: VisitorCategory;
  onOpenPublicView?: (passToken: string) => void;
}

export const PreApproveModal: React.FC<PreApproveModalProps> = ({
  isOpen,
  onClose,
  defaultCategory = 'guest',
  onOpenPublicView,
}) => {
  const { preApproveVisitor, activeFlat, notices, guardEventSecurityPlans } = useSociety();

  const [visitorName, setVisitorName] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState<VisitorCategory>(defaultCategory);
  const [companyOrRole, setCompanyOrRole] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [expectedDate, setExpectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [expectedTimeSlot, setExpectedTimeSlot] = useState('18:00 - 22:00');
  const [validDurationHours, setValidDurationHours] = useState<number>(6);
  const [purpose, setPurpose] = useState('');
  const [eventId, setEventId] = useState('');
  const [formError, setFormError] = useState('');
  const [createdPass, setCreatedPass] = useState<VisitorPass | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorName.trim()) return;

    const result = preApproveVisitor({
      visitorName: visitorName.trim(),
      phone: phone.trim() || '+91 98765 43210',
      category,
      companyOrRole: companyOrRole.trim() || (category === 'delivery' ? 'Swiggy' : category === 'cab' ? 'Uber' : 'Guest'),
      expectedDate,
      expectedTimeSlot,
      validDurationHours,
      purpose: purpose.trim() || undefined,
      vehicleNumber: vehicleNumber.trim() ? vehicleNumber.trim().toUpperCase() : undefined,
      eventId: eventId || undefined,
    });

    if (!result.success || !result.pass) {
      setFormError(result.message);
      return;
    }
    setFormError('');
    setCreatedPass(result.pass);
  };

  const handleDone = () => {
    setCreatedPass(null);
    setVisitorName('');
    setPhone('');
    setCompanyOrRole('');
    setVehicleNumber('');
    setPurpose('');
    setEventId('');
    setFormError('');
    onClose();
  };

  const createdEventPlan = createdPass?.eventId
    ? guardEventSecurityPlans.find((plan) => plan.eventId === createdPass.eventId)
    : undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/55 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full overflow-hidden text-slate-800 shadow-2xl my-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-white text-slate-900">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-slate-100 text-slate-900 rounded-2xl font-black shadow-sm">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900">Time-Limited QR Gate Pass</h3>
                <span className="bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                  Unit {activeFlat}
                </span>
              </div>
              <p className="text-xs text-slate-500">Generate secure QR code & link for instant gate verification</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content: Generated Pass vs Input Form */}
        {createdPass ? (
          <div className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="text-center space-y-1 pb-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-emerald-800 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>QR Visitor Pass Ready to Share!</span>
              </div>
            </div>
            {createdPass.eventName && createdEventPlan && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-950">
                <p className="font-extrabold">Event security update: {createdPass.eventName}</p>
                <p className="mt-1">{createdEventPlan.assignedGuardNames?.join(', ')} assigned · Enter via {createdEventPlan.entryGate} · Park at {createdEventPlan.parkingArea}. Your pass is ready under the administrator-confirmed protocols.</p>
              </div>
            )}

            {/* Reusable QR Card */}
            <QRVisitorPassCard
              pass={createdPass}
              showActions={true}
              onOpenPublicView={onOpenPublicView}
            />

            <div className="pt-2">
              <button
                type="button"
                onClick={handleDone}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-3 px-4 rounded-xl text-xs transition-all shadow-md active:scale-95"
              >
                Close & Return to Dashboard
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            {/* Category selection */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">1. Visitor Category</label>
              <div className="grid grid-cols-4 gap-2">
                {(['guest', 'delivery', 'cab', 'service'] as VisitorCategory[]).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setCategory(cat);
                      if (cat !== 'guest') setEventId('');
                    }}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold capitalize border text-center transition-all ${
                      category === cat
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Visitor Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Visitor Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma / Courier Agent"
                  value={visitorName}
                  onChange={(e) => setVisitorName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Mobile Phone #</label>
                <input
                  type="text"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>
            </div>

            {/* Company & Vehicle Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Company / Role</label>
                <input
                  type="text"
                  placeholder="Swiggy, Uber, Maid, Friend"
                  value={companyOrRole}
                  onChange={(e) => setCompanyOrRole(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Vehicle Plate (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. KA-01-AB-1234"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold font-mono text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white uppercase"
                />
              </div>
            </div>

            {/* Time-Limited Validity Duration Selector */}
            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-700" />
                  <span>Time-Limited Validity Duration</span>
                </label>
                <span className="text-[11px] font-bold text-emerald-700">
                  {validDurationHours} Hours from creation
                </span>
              </div>

              <div className="grid grid-cols-5 gap-1.5">
                {[
                  { hrs: 2, label: '2 Hours', hint: 'Delivery/Cab' },
                  { hrs: 4, label: '4 Hours', hint: 'Short Visit' },
                  { hrs: 8, label: '8 Hours', hint: 'Party/Dinner' },
                  { hrs: 24, label: '24 Hours', hint: 'Day Pass' },
                  { hrs: 48, label: '48 Hours', hint: 'Weekend' },
                ].map((item) => (
                  <button
                    key={item.hrs}
                    type="button"
                    onClick={() => setValidDurationHours(item.hrs)}
                    className={`py-2 px-1 rounded-xl text-center border transition-all ${
                      validDurationHours === item.hrs
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-xs font-black block">{item.label}</span>
                    <span className="text-[9px] block opacity-80">{item.hint}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Expected Date & Time Slot */}
            {category === 'guest' && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <label htmlFor="visitor-event" className="text-xs font-bold text-slate-700 block mb-1.5">Society event (optional)</label>
                <select
                  id="visitor-event"
                  value={eventId}
                  onChange={(event) => {
                    setEventId(event.target.value);
                    setFormError('');
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-900"
                >
                  <option value="">Regular visitor — not attending a society event</option>
                  {notices.filter((notice) => notice.category === 'Event').map((notice) => {
                    const id = `notice:${notice.id}`;
                    const plan = guardEventSecurityPlans.find((item) => item.eventId === id);
                    const ready = plan?.status === 'ready' && Boolean(plan.assignedGuardIds?.length && plan.entryGate && plan.parkingArea);
                    return (
                      <option key={id} value={id} disabled={!ready}>
                        {notice.title} · {ready ? 'Admin confirmed' : 'Awaiting admin confirmation'}
                      </option>
                    );
                  })}
                </select>
                <p className="mt-1 text-[11px] text-slate-500">Event options stay unavailable until management assigns guards and publishes the event security plan.</p>
                {eventId && (() => {
                  const eventNotice = notices.find((notice) => `notice:${notice.id}` === eventId);
                  const plan = guardEventSecurityPlans.find((item) => item.eventId === eventId);
                  if (!eventNotice || !plan || plan.status !== 'ready' || !plan.assignedGuardIds?.length || !plan.entryGate || !plan.parkingArea) {
                    return <p className="mt-2 text-xs font-semibold text-amber-800">Passes are unavailable until the administrator confirms the assigned guards, entrance, and parking area.</p>;
                  }
                  return (
                    <div className="mt-2 space-y-1 text-xs text-emerald-900">
                      <p className="font-bold">Final details confirmed by {plan.updatedBy}</p>
                      <p><span className="font-semibold">Assigned guards:</span> {plan.assignedGuardNames?.join(', ')}</p>
                      <p><span className="font-semibold">Entrance:</span> {plan.entryGate}</p>
                      <p><span className="font-semibold">Parking area:</span> {plan.parkingArea}</p>
                      <p><span className="font-semibold">Guest entry:</span> {plan.guestProtocol}</p>
                      <p><span className="font-semibold">Parking:</span> {plan.parkingPlan}</p>
                      {plan.guardNotes && <p><span className="font-semibold">Guard notes:</span> {plan.guardNotes}</p>}
                      <p className="text-emerald-700">Updated by {plan.updatedBy} · {new Date(plan.updatedAt).toLocaleString()}</p>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Expected Date & Time Slot */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Expected Date</label>
                <input
                  type="date"
                  value={expectedDate}
                  onChange={(e) => setExpectedDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Expected Time Slot</label>
                <select
                  value={expectedTimeSlot}
                  onChange={(e) => setExpectedTimeSlot(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
                >
                  <option value="Morning (08:00 - 12:00)">Morning (08:00 - 12:00)</option>
                  <option value="Afternoon (12:00 - 16:00)">Afternoon (12:00 - 16:00)</option>
                  <option value="Evening (16:00 - 20:00)">Evening (16:00 - 20:00)</option>
                  <option value="Night (20:00 - 23:00)">Night (20:00 - 23:00)</option>
                  <option value="Full Day Flexible">Full Day Flexible</option>
                </select>
              </div>
            </div>

            {/* Visit Purpose */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Purpose / Note (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Birthday dinner, Courier packet, AC repair service"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
              />
            </div>

            {/* Footer Buttons */}
            {formError && <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-800">{formError}</p>}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-xl text-xs transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={Boolean(eventId && !guardEventSecurityPlans.some((plan) => plan.eventId === eventId && plan.status === 'ready' && plan.assignedGuardIds?.length && plan.entryGate && plan.parkingArea))}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-6 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
              >
                <QrCode className="w-4 h-4" />
                <span>Generate QR Visitor Pass</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
