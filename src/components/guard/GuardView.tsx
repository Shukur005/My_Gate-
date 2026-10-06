import React, { useState } from 'react';
import { useSociety } from '../../context/SocietyContext';
import { VisitorCategory, VisitorPass } from '../../types';
import { ShiftSummaryModal } from './ShiftSummaryModal';
import { QRScannerModal } from './QRScannerModal';
import { DigitalShiftLogSection } from './DigitalShiftLogSection';
import { LogIncidentModal } from './LogIncidentModal';
import { ShiftHandoverModal } from './ShiftHandoverModal';
import {
  Shield,
  ShieldAlert,
  Key,
  QrCode,
  UserCheck,
  CheckCircle2,
  XCircle,
  Search,
  Clock,
  LogOut,
  PhoneCall,
  AlertTriangle,
  Car,
  Package,
  Wrench,
  User,
  Building,
  Check,
  RotateCcw,
  SlidersHorizontal,
  Ban,
  UserX,
  Sparkles,
  Info,
  FileText,
  Camera,
  AlertOctagon,
  Radio,
  Send,
  Copy,
  Users,
  Calendar,
  History,
} from 'lucide-react';

export const GuardView: React.FC = () => {
  const {
    visitors,
    flats,
    verifyAndCheckInVisitor,
    quickGateCheckIn,
    checkOutVisitor,
    updateVisitorStatus,
    sosAlerts,
    dispatchGuardToEmergency,
    resolveSOS,
    staff,
    toggleStaffAttendance,
    shiftLogs,
    activeShift,
  } = useSociety();

  const [activeGuardTab, setActiveGuardTab] = useState<'gate_operations' | 'shift_logs'>('gate_operations');
  const [isQuickLogIncidentOpen, setIsQuickLogIncidentOpen] = useState(false);
  const [isQuickHandoverOpen, setIsQuickHandoverOpen] = useState(false);
  const [quickHandoverMode, setQuickHandoverMode] = useState<'start' | 'end'>('start');

  const [resolvingAlertId, setResolvingAlertId] = useState<string | null>(null);
  const [resolutionComment, setResolutionComment] = useState('');

  // Verification passcode input state
  const [passcode, setPasscode] = useState('');
  const [passcodeResult, setPasscodeResult] = useState<{ success: boolean; message: string } | null>(null);

  // Fast Check-In Form
  const [flatNumber, setFlatNumber] = useState('B-402');
  const [visitorName, setVisitorName] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState<VisitorCategory>('delivery');
  const [companyOrRole, setCompanyOrRole] = useState('Swiggy');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [entryGate, setEntryGate] = useState('Main Gate 1');
  const [quickCheckInSuccess, setQuickCheckInSuccess] = useState<string | null>(null);

  // Real-Time Visitor Log Search & Filter
  const [logStatusFilter, setLogStatusFilter] = useState<'all' | 'in_gate' | 'pending_approval' | 'denied' | 'checked_out'>('all');
  const [logSearchQuery, setLogSearchQuery] = useState('');
  const [statusUpdateToast, setStatusUpdateToast] = useState<string | null>(null);

  // Shift Summary Modal State
  const [showShiftSummary, setShowShiftSummary] = useState(false);

  // QR Scanner Modal State
  const [showQRScanner, setShowQRScanner] = useState(false);

  // Active Emergency SOS Alerts
  const activeSOS = sosAlerts.filter((s) => s.status === 'active');

  // Filter visitors for passcode / expected section
  const expectedVisitors = visitors.filter((v) => v.status === 'expected' || v.status === 'pending_approval');
  const inGateVisitors = visitors.filter((v) => v.status === 'in_gate');

  // Real-Time Visitor Log filtering
  const filteredVisitorLogs = visitors.filter((v) => {
    const matchesStatus = logStatusFilter === 'all' || v.status === logStatusFilter;
    const matchesQuery =
      v.visitorName.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
      v.flatNumber.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
      v.phone.includes(logSearchQuery) ||
      (v.companyOrRole && v.companyOrRole.toLowerCase().includes(logSearchQuery.toLowerCase()));
    return matchesStatus && matchesQuery;
  });

  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) return;

    const res = verifyAndCheckInVisitor(passcode);
    setPasscodeResult(res);
    if (res.success) {
      setPasscode('');
    }
  };

  const handleQuickCheckInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorName.trim()) return;

    const newPass = quickGateCheckIn({
      flatNumber,
      visitorName,
      phone: phone || '+91 98765 43210',
      category,
      companyOrRole: companyOrRole || category,
      vehicleNumber,
      entryGate,
    });

    setQuickCheckInSuccess(
      `Check-in recorded for ${newPass.visitorName} to Flat ${flatNumber}. Resident notified!`
    );
    setVisitorName('');
    setPhone('');
    setVehicleNumber('');
  };

  const handleToggleApproval = (v: VisitorPass) => {
    const newStatus = v.status === 'in_gate' ? 'denied' : 'in_gate';
    updateVisitorStatus(v.id, newStatus);
    setStatusUpdateToast(
      `Approval status for ${v.visitorName} (Flat ${v.flatNumber}) updated to ${
        newStatus === 'in_gate' ? 'APPROVED (In-Gate)' : 'DENIED (Entry Blocked)'
      }`
    );
    setTimeout(() => setStatusUpdateToast(null), 4000);
  };

  const getCategoryBadge = (cat: VisitorCategory) => {
    switch (cat) {
      case 'delivery':
      case 'cab':
      case 'service':
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="w-full max-w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Emergency SOS & Silent Panic Alert Dispatch Desk */}
      {activeSOS.length > 0 && (
        <div className="space-y-4">
          {activeSOS.map((alert) => {
            const flatInfo = flats.find((f) => f.flatNumber === alert.flatNumber);
            const residentPhone = alert.phone || flatInfo?.phone || 'Not provided';
            const residentWing = alert.wing || flatInfo?.wing || 'Main';
            const residentFloor = alert.floor || flatInfo?.floor || 1;
            const emergencyContacts = alert.emergencyContacts || flatInfo?.emergencyContacts || [];
            const isSilentPanic = alert.isSilentPanic || alert.type === 'Panic Alert (Silent)';

            return (
              <div
                key={alert.id}
                className="bg-gradient-to-r from-rose-700 via-red-600 to-rose-800 border-2 border-rose-400 rounded-3xl p-6 text-white shadow-2xl space-y-4 animate-fade-in ring-4 ring-rose-500/30"
              >
                {/* Top Alert Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-white/20">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-white text-rose-700 rounded-2xl shadow-lg animate-bounce shrink-0">
                      <AlertOctagon className="w-8 h-8" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase tracking-widest bg-white/20 border border-white/30 text-white px-2.5 py-0.5 rounded-full">
                          {isSilentPanic ? '🚨 SILENT PANIC ALARM' : 'CRITICAL EMERGENCY'}
                        </span>
                        <span className="text-xs font-mono bg-slate-950/40 px-2 py-0.5 rounded text-rose-200">
                          {alert.id}
                        </span>
                      </div>
                      <h3 className="text-2xl font-black text-white mt-1">
                        Emergency Alert from Unit {alert.flatNumber} • Wing {residentWing} (Floor {residentFloor})
                      </h3>
                    </div>
                  </div>

                  <div className="text-left md:text-right">
                    <span className="text-xs text-rose-200 block font-medium">Triggered Time:</span>
                    <span className="text-lg font-black text-white font-mono">{alert.triggeredAt}</span>
                  </div>
                </div>

                {/* Resident & Emergency Contact Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Resident Info Card */}
                  <div className="bg-slate-950/40 backdrop-blur-md rounded-2xl p-4 border border-white/10 space-y-1.5 text-xs">
                    <span className="text-rose-200 font-bold uppercase tracking-wider text-[10px] block">
                      Resident Details
                    </span>
                    <div className="text-sm font-extrabold text-white">{alert.residentName}</div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="font-mono text-rose-100 font-bold">{residentPhone}</span>
                      <a
                        href={`tel:${residentPhone}`}
                        className="bg-white hover:bg-slate-100 text-slate-900 px-2.5 py-1 rounded-lg font-black text-[11px] flex items-center gap-1 shadow-sm transition-all active:scale-95"
                      >
                        <PhoneCall className="w-3 h-3" />
                        <span>Call</span>
                      </a>
                    </div>
                  </div>

                  {/* Registered Emergency Contacts Card */}
                  <div className="bg-slate-950/40 backdrop-blur-md rounded-2xl p-4 border border-white/10 space-y-1.5 text-xs">
                    <span className="text-rose-200 font-bold uppercase tracking-wider text-[10px] block">
                      Registered Emergency Contacts ({emergencyContacts.length})
                    </span>
                    {emergencyContacts.length === 0 ? (
                      <p className="text-rose-200/80 text-[11px] italic">No extra emergency contacts listed.</p>
                    ) : (
                      <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
                        {emergencyContacts.map((contact) => (
                          <div key={contact.id} className="flex items-center justify-between text-[11px] bg-white/10 p-1.5 rounded-lg">
                            <div>
                              <span className="font-bold text-white block">{contact.name}</span>
                              <span className="text-[10px] text-rose-200">{contact.relationship} • {contact.phone}</span>
                            </div>
                            <a
                              href={`tel:${contact.phone}`}
                              className="bg-white/20 hover:bg-white/30 text-white px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 transition-all"
                            >
                              <PhoneCall className="w-2.5 h-2.5" />
                              <span>Call</span>
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Duress Notes & Guard Dispatch Status */}
                  <div className="bg-slate-950/40 backdrop-blur-md rounded-2xl p-4 border border-white/10 space-y-1.5 text-xs">
                    <span className="text-rose-200 font-bold uppercase tracking-wider text-[10px] block">
                      Duress / Incident Notes
                    </span>
                    <p className="text-white text-xs bg-rose-950/60 p-2 rounded-xl border border-rose-500/30">
                      {alert.notes || (isSilentPanic ? 'Resident triggered silent panic alarm.' : `${alert.type} urgency.`)}
                    </p>
                    {alert.dispatchedGuards && alert.dispatchedGuards.length > 0 && (
                      <div className="text-[11px] text-white font-semibold pt-1">
                        ✓ Dispatched: {alert.dispatchedGuards.join(', ')} ({alert.dispatchedAt})
                      </div>
                    )}
                  </div>
                </div>

                {/* Guard Incident Resolution Form / Action Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => dispatchGuardToEmergency(alert.id, 'Commander Vikram (Gate 1 Rapid Response)')}
                      className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg transition-all active:scale-95"
                    >
                      <Shield className="w-4 h-4" />
                      <span>Dispatch Security Guard Team</span>
                    </button>

                    <a
                      href={`tel:${residentPhone}`}
                      className="bg-white/20 hover:bg-white/30 text-white font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-all"
                    >
                      <PhoneCall className="w-4 h-4" />
                      <span>Dial Resident Phone</span>
                    </a>
                  </div>

                  {resolvingAlertId === alert.id ? (
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <input
                        type="text"
                        placeholder="Resolution outcome notes..."
                        value={resolutionComment}
                        onChange={(e) => setResolutionComment(e.target.value)}
                        className="bg-white text-slate-900 px-3 py-2 rounded-xl text-xs font-medium focus:outline-none w-full sm:w-64"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          resolveSOS(alert.id, resolutionComment || 'Guard verified scene, all clear');
                          setResolvingAlertId(null);
                          setResolutionComment('');
                        }}
                        className="bg-slate-950 hover:bg-slate-900 text-white font-extrabold px-3 py-2 rounded-xl text-xs shrink-0 shadow-md"
                      >
                        Confirm Resolve
                      </button>
                      <button
                        type="button"
                        onClick={() => setResolvingAlertId(null)}
                        className="bg-white/20 text-white px-2 py-2 rounded-xl text-xs hover:bg-white/30"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setResolvingAlertId(alert.id)}
                      className="bg-white text-rose-700 hover:bg-rose-50 font-black px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider shrink-0 shadow-xl transition-all active:scale-95 w-full sm:w-auto text-center"
                    >
                      Acknowledge & Mark Resolved
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Guard Header Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 text-slate-900 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-slate-100 text-slate-900 rounded-2xl border border-slate-200 shadow-sm">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-950">Main Gate Security Terminal</h2>
              <span className="bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase flex items-center gap-1">
                <Radio className="w-2.5 h-2.5 text-slate-600 animate-pulse" />
                <span>{activeShift ? 'Active Duty' : 'Standby'}</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 flex flex-wrap items-center gap-2">
              <span>Duty Officer: <strong className="text-slate-900">{activeShift?.guardName || 'Commander Vikram Singh'}</strong></span>
              <span>•</span>
              <span>Station: <strong className="text-slate-900">{activeShift?.gateStation || 'Station 1 (Main Entrance)'}</strong></span>
              <span>•</span>
              <span className="font-mono text-slate-500">{activeShift?.startTime ? `Clocked in ${activeShift.startTime}` : '06:00 AM Shift'}</span>
            </p>
          </div>
        </div>

        {/* Live Gate Metrics & Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-center min-w-[90px]">
            <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">In-Gate</span>
            <span className="text-lg font-black text-slate-900">{inGateVisitors.length}</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-center min-w-[90px]">
            <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Incidents</span>
            <span className="text-lg font-black text-slate-900">
              {activeShift ? activeShift.incidents.length : shiftLogs[0]?.incidents.length || 0}
            </span>
          </div>

          <button
            onClick={() => setIsQuickLogIncidentOpen(true)}
            className="bg-rose-600 hover:bg-rose-500 text-white font-black px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95"
            title="Record security breach or duty incident"
          >
            <ShieldAlert className="w-4 h-4 text-white" />
            <span>Log Incident</span>
          </button>

          <button
            onClick={() => setShowQRScanner(true)}
            className="bg-slate-900 hover:bg-black text-white font-black px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
          >
            <Camera className="w-4 h-4 text-white" />
            <span>Scan QR</span>
          </button>

          <button
            onClick={() => {
              setQuickHandoverMode(activeShift ? 'end' : 'start');
              setIsQuickHandoverOpen(true);
            }}
            className="bg-white hover:bg-slate-100 text-slate-800 font-extrabold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 border border-slate-300 shadow-sm transition-all active:scale-95"
          >
            <Clock className="w-4 h-4 text-slate-600" />
            <span>{activeShift ? 'Shift Handover' : 'Clock-In'}</span>
          </button>
        </div>
      </div>

      {/* Guard View Primary Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-1">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveGuardTab('gate_operations')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
              activeGuardTab === 'gate_operations'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Gate Operations & Entry Terminal</span>
          </button>

          <button
            onClick={() => setActiveGuardTab('shift_logs')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
              activeGuardTab === 'shift_logs'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <History className="w-4 h-4 text-slate-600" />
            <span>Digital Shift Log & Incidents ({shiftLogs.length} Shifts)</span>
          </button>
        </div>

        <button
          onClick={() => setShowShiftSummary(true)}
          className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition-colors"
        >
          <FileText className="w-3.5 h-3.5 text-slate-600" />
          <span>Daily Analytics Summary</span>
        </button>
      </div>

      {/* TAB CONTENT */}
      {activeGuardTab === 'shift_logs' ? (
        <DigitalShiftLogSection />
      ) : (
        <div className="space-y-6">
          {/* Section 1: Passcode / QR Verification Desk & Fast Gate Entry */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Passcode / QR Code Check-In Desk */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-slate-100 text-slate-800 rounded-xl border border-slate-200">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Passcode & QR Verification</h3>
                <p className="text-xs text-slate-500">Scan QR token or enter 6-digit visitor OTP</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowQRScanner(true)}
              className="bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-black px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <QrCode className="w-3.5 h-3.5 text-slate-600" />
              <span>Camera Scan</span>
            </button>
          </div>

          <form onSubmit={handlePasscodeSubmit} className="space-y-3">
            <div>
              <input
                type="text"
                placeholder="Enter 6-digit OTP or QR Token (e.g. 849201)"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-200 focus:border-slate-900 rounded-xl px-4 py-3 text-center text-lg sm:text-xl font-mono font-bold tracking-wider text-slate-900 focus:outline-none focus:bg-white transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="submit"
                className="bg-slate-900 hover:bg-black text-white font-extrabold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Verify & Check In</span>
              </button>

              <button
                type="button"
                onClick={() => setShowQRScanner(true)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95"
              >
                <Camera className="w-4 h-4 text-white" />
                <span>Open QR Scanner</span>
              </button>
            </div>
          </form>

          {passcodeResult && (
            <div
              className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2.5 ${
                passcodeResult.success
                  ? 'bg-slate-100 text-slate-800 border-slate-300'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}
            >
              {passcodeResult.success ? (
                <CheckCircle2 className="w-5 h-5 text-slate-700 shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
              )}
              <span>{passcodeResult.message}</span>
            </div>
          )}
        </div>

        {/* Quick Unplanned Visitor Log & Intercom Ring */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-slate-100 text-slate-700 rounded-xl border border-slate-200">
                <PhoneCall className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Walk-In Visitor & Intercom Bell</h3>
                <p className="text-xs text-slate-500">Triggers live gate approval call to resident</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleQuickCheckInSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Destination Flat *</label>
                <select
                  value={flatNumber}
                  onChange={(e) => setFlatNumber(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                >
                  {flats.map((f) => (
                    <option key={f.flatNumber} value={f.flatNumber}>
                      Flat {f.flatNumber} ({f.ownerName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => {
                    const cat = e.target.value as VisitorCategory;
                    setCategory(cat);
                    if (cat === 'delivery') setCompanyOrRole('Swiggy');
                    else if (cat === 'cab') setCompanyOrRole('Uber');
                    else setCompanyOrRole('');
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                >
                  <option value="delivery">Delivery (Swiggy/Amazon)</option>
                  <option value="guest">Walk-in Guest</option>
                  <option value="cab">Cab / Taxi (Uber/Ola)</option>
                  <option value="service">Service Plumber/Electrician</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Visitor Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh (Swiggy)"
                  value={visitorName}
                  onChange={(e) => setVisitorName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Mobile Phone #</label>
                <input
                  type="text"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Company / Role</label>
                <input
                  type="text"
                  placeholder="Swiggy, Amazon, Uber, Plumber"
                  value={companyOrRole}
                  onChange={(e) => setCompanyOrRole(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Vehicle Tag #</label>
                <input
                  type="text"
                  placeholder="KA-01-XX-0000"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900 font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-black text-white font-extrabold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Ring Flat Intercom & Record Check-In</span>
            </button>
          </form>

          {quickCheckInSuccess && (
            <div className="p-3 bg-slate-100 border border-slate-200 text-slate-800 text-xs rounded-xl flex items-center justify-between">
              <span>{quickCheckInSuccess}</span>
              <button onClick={() => setQuickCheckInSuccess(null)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Section 2: Expected Pre-Approved Visitors List */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
          <Clock className="w-5 h-5 text-slate-700" />
          <span>Expected Pre-Approved Visitors Today ({expectedVisitors.length})</span>
        </h3>

        {expectedVisitors.length === 0 ? (
          <p className="text-xs text-slate-500">No expected pre-approved visitors waiting for check-in.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {expectedVisitors.map((v) => (
              <div
                key={v.id}
                className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{v.visitorName}</span>
                    <span className="bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold px-2 py-0.5 rounded capitalize">
                      {v.category}
                    </span>
                  </div>
                  <p className="text-slate-500 mt-0.5">
                    Destination: <span className="text-slate-900 font-bold">Flat {v.flatNumber}</span> ({v.residentName})
                  </p>
                  <p className="text-slate-500 text-[11px]">Passcode: <span className="font-mono text-slate-800 font-bold">{v.passcode}</span></p>
                </div>

                <button
                  onClick={() => verifyAndCheckInVisitor(v.passcode)}
                  className="bg-slate-900 hover:bg-black text-white font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1 shadow-sm transition-all"
                >
                  <Check className="w-4 h-4" />
                  <span>Pass Check-In</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 3: Real-Time Visitor Entry Log & Guard Terminal */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-5">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-100 text-slate-800 rounded-xl border border-slate-200">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900">Real-Time Visitor Entry Log</h3>
                <span className="bg-slate-100 text-slate-700 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full uppercase border border-slate-200">
                  Live Sync
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Log records for visitor name, apartment unit being visited, entry timestamp, and real-time approval status toggle
              </p>
            </div>
          </div>

          {/* Log Summary Counters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Total</span>
              <span className="text-xs font-black text-slate-900">{visitors.length}</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-center">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">In-Gate</span>
              <span className="text-xs font-black text-slate-900">{inGateVisitors.length}</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-center">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Pending</span>
              <span className="text-xs font-black text-slate-900">
                {visitors.filter((v) => v.status === 'pending_approval' || v.status === 'expected').length}
              </span>
            </div>
            <div className="bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl text-center">
              <span className="text-[10px] text-rose-600 font-bold uppercase block">Denied</span>
              <span className="text-xs font-black text-rose-700">
                {visitors.filter((v) => v.status === 'denied').length}
              </span>
            </div>
          </div>
        </div>

        {/* Live Status Toast Notification */}
        {statusUpdateToast && (
          <div className="p-3.5 bg-slate-100 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold flex items-center justify-between shadow-sm animate-fade-in">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-slate-600 shrink-0" />
              <span>{statusUpdateToast}</span>
            </div>
            <button onClick={() => setStatusUpdateToast(null)} className="text-slate-400 hover:text-slate-900">
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Filter Controls & Search Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
          {/* Status Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-1 shrink-0">
              <SlidersHorizontal className="w-3.5 h-3.5" /> Status:
            </span>
            {(
              [
                { id: 'all', label: 'All Logs' },
                { id: 'in_gate', label: 'Approved (In-Gate)' },
                { id: 'pending_approval', label: 'Pending Approval' },
                { id: 'denied', label: 'Denied / Blocked' },
                { id: 'checked_out', label: 'Checked Out' },
              ] as const
            ).map((st) => (
              <button
                key={st.id}
                onClick={() => setLogStatusFilter(st.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  logStatusFilter === st.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white hover:bg-slate-200 text-slate-600 border border-slate-200'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full lg:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Visitor, Apartment, Phone..."
              value={logSearchQuery}
              onChange={(e) => setLogSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 transition-all"
            />
          </div>
        </div>

        {/* Visitor Logs Table */}
        {filteredVisitorLogs.length === 0 ? (
          <div className="text-center py-10 text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 space-y-2">
            <UserX className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-xs font-semibold">No visitor entry logs match your search filters.</p>
            <p className="text-[11px] text-slate-400">Try adjusting the status filter pill or search query above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-xs">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-900 text-slate-200 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-4">Visitor Name & Info</th>
                  <th className="p-4">Apartment Being Visited</th>
                  <th className="p-4">Entry Time</th>
                  <th className="p-4 text-center">Entry Approval Toggle</th>
                  <th className="p-4 text-right">Gate Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredVisitorLogs.map((v) => {
                  const isApproved = v.status === 'in_gate';
                  const isDenied = v.status === 'denied';

                  return (
                    <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* 1. Visitor Name */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center font-extrabold text-xs shrink-0 ${
                              isApproved
                                ? 'bg-slate-200 text-slate-900 ring-2 ring-slate-400/30'
                                : isDenied
                                ? 'bg-rose-100 text-rose-800 ring-2 ring-rose-400/30'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {v.visitorName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-slate-900 text-sm">{v.visitorName}</span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-md border capitalize ${getCategoryBadge(
                                  v.category
                                )}`}
                              >
                                {v.category}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                              <span>{v.phone}</span>
                              {v.companyOrRole && <span className="font-semibold text-slate-700">• {v.companyOrRole}</span>}
                              {v.vehicleNumber && (
                                <span className="font-mono bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded text-[10px] border border-slate-200">
                                  {v.vehicleNumber}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 2. Apartment Visited */}
                      <td className="p-4">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-black text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 text-xs">
                              Flat {v.flatNumber}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 font-medium mt-1">
                            Resident: <strong className="text-slate-800">{v.residentName}</strong>
                          </div>
                        </div>
                      </td>

                      {/* 3. Entry Time */}
                      <td className="p-4">
                        <div className="space-y-0.5">
                          <div className="font-mono font-bold text-slate-900 flex items-center gap-1 text-xs">
                            <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span>{v.checkInTime || v.expectedTimeSlot || 'Just Now'}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-medium">
                            {v.entryGate || 'Main Gate 1'} • {v.expectedDate || 'Today'}
                          </div>
                        </div>
                      </td>

                      {/* 4. Status Toggle for Entry Approval */}
                      <td className="p-4 text-center">
                        <div className="inline-flex flex-col items-center gap-1.5">
                          <div className="flex items-center gap-2">
                            {/* Interactive Toggle Switch */}
                            <button
                              type="button"
                              onClick={() => handleToggleApproval(v)}
                              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                isApproved ? 'bg-slate-900' : 'bg-slate-300 hover:bg-slate-400'
                              }`}
                              title={isApproved ? 'Click to Deny Entry' : 'Click to Grant Entry Approval'}
                            >
                              <span
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                  isApproved ? 'translate-x-5' : 'translate-x-0'
                                }`}
                              />
                            </button>

                            {/* Status Label Pill */}
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 border ${
                                isApproved
                                  ? 'bg-slate-200 text-slate-900 border-slate-300'
                                  : isDenied
                                  ? 'bg-rose-100 text-rose-900 border-rose-300'
                                  : v.status === 'checked_out'
                                  ? 'bg-slate-100 text-slate-600 border-slate-300'
                                  : 'bg-slate-100 text-slate-700 border-slate-300'
                              }`}
                            >
                              {isApproved && <span className="w-1.5 h-1.5 rounded-full bg-slate-700 animate-ping" />}
                              {isApproved
                                ? 'Approved (In-Gate)'
                                : isDenied
                                ? 'Denied / Blocked'
                                : v.status === 'checked_out'
                                ? 'Checked Out'
                                : 'Pending Approval'}
                            </span>
                          </div>

                          <span className="text-[9px] text-slate-400 font-semibold">
                            {isApproved ? 'Toggle OFF to Deny' : 'Toggle ON to Grant Entry'}
                          </span>
                        </div>
                      </td>

                      {/* 5. Gate Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isApproved ? (
                            <button
                              onClick={() => {
                                checkOutVisitor(v.id);
                                setStatusUpdateToast(`Checked out ${v.visitorName} from Flat ${v.flatNumber}`);
                                setTimeout(() => setStatusUpdateToast(null), 3000);
                              }}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 font-bold px-3 py-1.5 rounded-xl text-xs inline-flex items-center gap-1 transition-all"
                            >
                              <LogOut className="w-3.5 h-3.5 text-amber-600" />
                              <span>Check-Out</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleToggleApproval(v)}
                              className="bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold px-3 py-1.5 rounded-xl text-xs inline-flex items-center gap-1 transition-all"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-slate-600" />
                              <span>Grant Entry</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Section 4: Daily Helps Gate Attendance Desk */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-slate-700" />
          <span>Daily Helps & Maid Gate Attendance Toggle</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {staff.map((s) => (
            <div
              key={s.id}
              className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{s.name}</h4>
                  <span className="text-slate-500">{s.role}</span>
                </div>
                <button
                  onClick={() => toggleStaffAttendance(s.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    s.isPresentToday
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                >
                  {s.isPresentToday ? 'Checked-In' : 'Mark In'}
                </button>
              </div>

              <p className="text-slate-500 text-[11px]">Flats: {s.flatsAssigned.join(', ')}</p>
            </div>
          ))}
        </div>
      </div>
      </div>
      )}

      {/* Shift Summary Modal */}
      <ShiftSummaryModal isOpen={showShiftSummary} onClose={() => setShowShiftSummary(false)} />

      {/* QR Code Scanner Terminal Modal */}
      <QRScannerModal isOpen={showQRScanner} onClose={() => setShowQRScanner(false)} />

      {/* Quick Log Incident Modal */}
      <LogIncidentModal
        isOpen={isQuickLogIncidentOpen}
        onClose={() => setIsQuickLogIncidentOpen(false)}
        shiftId={activeShift?.id}
      />

      {/* Quick Shift Handover / Clock-In Modal */}
      <ShiftHandoverModal
        isOpen={isQuickHandoverOpen}
        onClose={() => setIsQuickHandoverOpen(false)}
        mode={quickHandoverMode}
      />
    </div>
  );
};
