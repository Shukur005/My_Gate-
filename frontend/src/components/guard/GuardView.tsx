// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { useSociety } from '../../context/SocietyContext';
import { VisitorCategory, VisitorPass } from '../../types';
import { ShiftSummaryModal } from './ShiftSummaryModal';
import { QRScannerModal } from './QRScannerModal';
import { DigitalShiftLogSection } from './DigitalShiftLogSection';
import { LogIncidentModal } from './LogIncidentModal';
import { ShiftHandoverModal } from './ShiftHandoverModal';
import { GuardHelpDeskSection } from './GuardHelpDeskSection';
import { GuardEventOperationsSection } from './GuardEventOperationsSection';
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
  Building2,
  MapPin,
  ArrowLeft,
  Phone,
  ClipboardList,
  Megaphone,
  MessageSquare,
} from 'lucide-react';

export const GuardView: React.FC = () => {
  const {
    visitors,
    domesticWorkerPasses,
    flats,
    verifyAndCheckInVisitor,
    verifyDomesticWorkerPass,
    recordDomesticWorkerGateAction,
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
    activeSidebarNav,
    setActiveSidebarNav,
    users,
    currentUser,
    notices,
    addNotice,
    guardChatMessages,
    sendGuardChatMessage,
  } = useSociety();

  const [activeGuardTab, setActiveGuardTab] = useState<'gate_operations' | 'shift_logs' | 'apartment_directory' | 'guard_directory' | 'gate_announcements' | 'guard_chat' | 'guard_helpdesk' | 'event_operations'>('gate_operations');
  const [guardChatDraft, setGuardChatDraft] = useState('');
  const [guardChatError, setGuardChatError] = useState('');
  const [gateNoticeTitle, setGateNoticeTitle] = useState('');
  const [gateNoticeLocation, setGateNoticeLocation] = useState('');
  const [gateNoticeStatus, setGateNoticeStatus] = useState<'Repair required' | 'Gate not working' | 'Access restricted' | 'Repair completed'>('Repair required');
  const [gateNoticeDetails, setGateNoticeDetails] = useState('');
  const [gateNoticeAlternateAccess, setGateNoticeAlternateAccess] = useState('');
  const [gateNoticeImportant, setGateNoticeImportant] = useState(true);
  const [gateNoticePublished, setGateNoticePublished] = useState(false);

  useEffect(() => {
    if (activeSidebarNav === 'flats') {
      setActiveGuardTab('apartment_directory');
    } else if (activeSidebarNav === 'community') {
      setActiveGuardTab('guard_directory');
    } else if (activeSidebarNav === 'notices') {
      setActiveGuardTab('gate_announcements');
    } else if (activeSidebarNav === 'chat') {
      setActiveGuardTab('guard_chat');
    } else if (activeSidebarNav === 'helpdesk') {
      setActiveGuardTab('guard_helpdesk');
    } else if (activeSidebarNav === 'calendar') {
      setActiveGuardTab('event_operations');
    } else if (activeSidebarNav === 'dashboard') {
      setActiveGuardTab('gate_operations');
    }
  }, [activeSidebarNav]);
  const [isQuickLogIncidentOpen, setIsQuickLogIncidentOpen] = useState(false);
  const [isQuickHandoverOpen, setIsQuickHandoverOpen] = useState(false);
  const [quickHandoverMode, setQuickHandoverMode] = useState<'start' | 'end'>('start');

  const [resolvingAlertId, setResolvingAlertId] = useState<string | null>(null);
  const [resolutionComment, setResolutionComment] = useState('');

  // Verification passcode input state
  const [passcode, setPasscode] = useState('');
  const [passcodeResult, setPasscodeResult] = useState<{ success: boolean; message: string } | null>(null);
  const [domesticWorkerResult, setDomesticWorkerResult] = useState<{ success: boolean; message: string; worker?: { id: string } } | null>(null);
  const [expandedWorkerDetailsId, setExpandedWorkerDetailsId] = useState<string | null>(null);

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
  const gateDropRequests = visitors.filter(
    (v) => v.deliveryInstruction === 'leave_at_gate' && v.status === 'in_gate'
  );
  const flatsByBlock = flats.reduce<Record<string, typeof flats>>((blocks, flat) => {
    const blockName = flat.wing.trim() || 'Unassigned block';
    (blocks[blockName] ||= []).push(flat);
    return blocks;
  }, {});
  const totalResidentStrength = flats.reduce(
    (total, flat) => total + (flat.occupancyStatus === 'Vacant' ? 0 : flat.familyMembersCount || 1),
    0
  );
  const occupiedApartmentCount = flats.filter((flat) => flat.occupancyStatus !== 'Vacant').length;
  const guardProfiles = users.filter((user) => user.role === 'guard');
  const guardRoster = [
    ...guardProfiles.map((profile) => {
      const profileShifts = shiftLogs
        .filter((shift) =>
          (Boolean(profile.badgeId) && shift.guardBadgeId === profile.badgeId) ||
          shift.guardName.trim().toLowerCase() === profile.name.trim().toLowerCase()
        )
        .sort((a, b) => `${b.date} ${b.startTime}`.localeCompare(`${a.date} ${a.startTime}`));
      const currentShift = profileShifts.find((shift) => shift.status === 'active') || profileShifts[0];
      const activeProfileShift = currentShift?.status === 'active';
      return {
        id: profile.id,
        name: profile.name,
        phone: profile.phone,
        badgeId: profile.badgeId,
        assignedGate: activeProfileShift ? currentShift.gateStation : profile.assignedGate || currentShift?.gateStation,
        duty: profile.assignedDuty,
        shiftType: activeProfileShift ? currentShift.shiftType : profile.shiftType || currentShift?.shiftType,
        status: activeProfileShift ? 'on_duty' as const : profile.guardStatus === 'inactive' ? 'inactive' as const : 'off_duty' as const,
        shift: currentShift,
      };
    }),
    ...shiftLogs
      .filter((shift) =>
        shift.status === 'active' &&
        !guardProfiles.some((profile) =>
          (Boolean(profile.badgeId) && shift.guardBadgeId === profile.badgeId) ||
          shift.guardName.trim().toLowerCase() === profile.name.trim().toLowerCase()
        )
      )
      .map((shift) => ({
        id: shift.id,
        name: shift.guardName,
        phone: undefined,
        badgeId: shift.guardBadgeId,
        assignedGate: shift.gateStation,
        duty: undefined,
        shiftType: shift.shiftType,
        status: 'on_duty' as const,
        shift,
      })),
  ];
  const onDutyGuards = guardRoster.filter((guard) => guard.status === 'on_duty');
  const staffedGateCount = new Set(onDutyGuards.map((guard) => guard.assignedGate).filter(Boolean)).size;

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

    if (/^\d{4}$/.test(passcode.trim())) {
      const workerResult = verifyDomesticWorkerPass(passcode);
      setDomesticWorkerResult(workerResult);
      setPasscodeResult(null);
      setPasscode('');
      return;
    }

    setDomesticWorkerResult(null);
    const res = verifyAndCheckInVisitor(passcode);
    setPasscodeResult(res);
    if (res.success) {
      setPasscode('');
    }
  };

  const handleDomesticWorkerGateAction = (workerId: string, action: 'entry' | 'exit') => {
    const result = recordDomesticWorkerGateAction(workerId, action, activeShift?.gateStation || entryGate);
    setDomesticWorkerResult((previous) => ({
      success: result.success,
      message: result.message,
      worker: previous?.worker,
    }));
    setStatusUpdateToast(result.message);
    window.setTimeout(() => setStatusUpdateToast(null), 4000);
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

  const handlePublishGateNotice = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const content = [
      `Gate: ${gateNoticeLocation.trim()}`,
      `Status: ${gateNoticeStatus}`,
      `Details: ${gateNoticeDetails.trim()}`,
      gateNoticeAlternateAccess.trim() ? `Alternative access / instructions: ${gateNoticeAlternateAccess.trim()}` : '',
    ].filter(Boolean).join('\n\n');

    addNotice({
      title: gateNoticeTitle.trim(),
      category: gateNoticeStatus === 'Gate not working' ? 'Emergency' : 'Maintenance',
      content,
      author: currentUser?.name || 'Security Guard',
      isImportant: gateNoticeImportant || gateNoticeStatus === 'Gate not working',
    });

    setGateNoticeTitle('');
    setGateNoticeLocation('');
    setGateNoticeStatus('Repair required');
    setGateNoticeDetails('');
    setGateNoticeAlternateAccess('');
    setGateNoticeImportant(true);
    setGateNoticePublished(true);
    window.setTimeout(() => setGateNoticePublished(false), 5000);
  };

  const handleGuardChatSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = sendGuardChatMessage(guardChatDraft);
    if (!result.success) {
      setGuardChatError(result.message);
      return;
    }
    setGuardChatDraft('');
    setGuardChatError('');
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
      ) : activeGuardTab === 'event_operations' ? (
        <GuardEventOperationsSection />
      ) : activeGuardTab === 'guard_helpdesk' ? (
        <GuardHelpDeskSection />
      ) : activeGuardTab === 'guard_chat' ? (
        <section aria-labelledby="guard-chat-title" className="w-full space-y-6">
          <header className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-sky-50 p-3 text-sky-700">
                <MessageSquare className="h-7 w-7" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-700">Security team channel</p>
                <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950" id="guard-chat-title">
                  Gate-to-Gate Guard Chat
                </h2>
                <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
                  Share live updates and coordinate directly with guards at other gates. Messages show the sending guard and gate station.
                </p>
              </div>
            </div>
            <button
              className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 sm:self-auto"
              onClick={() => {
                setActiveGuardTab('gate_operations');
                setActiveSidebarNav('dashboard');
              }}
              type="button"
            >
              <ArrowLeft className="h-4 w-4" />
              Gate operations
            </button>
          </header>

          <div className="grid gap-4 sm:grid-cols-2">
            <article className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <span className="rounded-xl bg-sky-50 p-3 text-sky-700"><Users className="h-5 w-5" /></span>
              <div>
                <p className="text-sm font-medium text-slate-500">Guard team messages</p>
                <p className="mt-0.5 text-2xl font-extrabold tabular-nums text-slate-950">{guardChatMessages.length}</p>
              </div>
            </article>
            <article className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <span className="rounded-xl bg-emerald-50 p-3 text-emerald-700"><Shield className="h-5 w-5" /></span>
              <div>
                <p className="text-sm font-medium text-slate-500">Available guard profiles</p>
                <p className="mt-0.5 text-2xl font-extrabold tabular-nums text-slate-950">{guardProfiles.length}</p>
              </div>
            </article>
          </div>

          <div className="flex min-h-[560px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
                  <MessageSquare className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-extrabold text-slate-950">All Gates • Security Channel</h3>
                  <p className="text-xs text-slate-500">Messages are shared with guard sessions using this app storage.</p>
                </div>
              </div>
              <span className="w-fit rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800">Guard team only</span>
            </div>

            <div aria-live="polite" className="flex-1 space-y-4 overflow-y-auto bg-slate-50/70 p-4 sm:p-6">
              {guardChatMessages.length === 0 ? (
                <div className="flex min-h-[360px] flex-col items-center justify-center px-4 text-center">
                  <span className="rounded-2xl bg-white p-4 text-slate-400 shadow-sm ring-1 ring-slate-200">
                    <MessageSquare className="h-8 w-8" />
                  </span>
                  <h4 className="mt-4 text-base font-bold text-slate-900">Start the gate-to-gate conversation</h4>
                  <p className="mt-1 max-w-md text-sm leading-6 text-slate-500">
                    Send an update about entry queues, a repair, visitor coordination, or anything the next gate guard needs to know.
                  </p>
                </div>
              ) : (
                guardChatMessages.map((message) => {
                  const isOwnMessage = message.guardName === currentUser?.name;
                  return (
                    <article className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`} key={message.id}>
                      <div className={`w-full max-w-3xl rounded-2xl border p-4 shadow-sm sm:p-5 ${
                        isOwnMessage ? 'border-slate-800 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-900'
                      }`}>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span className={`text-sm font-extrabold ${isOwnMessage ? 'text-white' : 'text-slate-950'}`}>{message.guardName}</span>
                            {message.badgeId && <span className={`text-xs ${isOwnMessage ? 'text-slate-300' : 'text-slate-500'}`}>Badge {message.badgeId}</span>}
                            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                              isOwnMessage ? 'bg-white/15 text-slate-100' : 'bg-sky-50 text-sky-800'
                            }`}>
                              <MapPin className="h-3 w-3" />
                              {message.gateStation}
                            </span>
                          </div>
                          <time className={`text-xs ${isOwnMessage ? 'text-slate-300' : 'text-slate-500'}`}>
                            {new Date(message.sentAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                          </time>
                        </div>
                        <p className={`mt-3 whitespace-pre-wrap break-words text-sm leading-6 ${
                          isOwnMessage ? 'text-slate-100' : 'text-slate-700'
                        }`}>{message.message}</p>
                      </div>
                    </article>
                  );
                })
              )}
            </div>

            <form onSubmit={handleGuardChatSubmit} className="border-t border-slate-200 bg-white p-4 sm:p-5">
              {guardChatError && (
                <p className="mb-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700" role="alert">
                  {guardChatError}
                </p>
              )}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex-1 space-y-2">
                  <label htmlFor="guard-chat-message" className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Message as {currentUser?.name || 'Guard'}
                  </label>
                  <textarea
                    id="guard-chat-message"
                    rows={2}
                    maxLength={1000}
                    required
                    value={guardChatDraft}
                    onChange={(event) => setGuardChatDraft(event.target.value)}
                    placeholder="Message another gate guard…"
                    className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!guardChatDraft.trim()}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-50 sm:mb-0.5"
                >
                  <Send className="h-4 w-4" />
                  Send to guard team
                </button>
              </div>
              <p className="mt-2 text-right text-xs text-slate-400">{guardChatDraft.length}/1000</p>
            </form>
          </div>
        </section>
      ) : activeGuardTab === 'gate_announcements' ? (
        <section aria-labelledby="gate-announcements-title" className="w-full space-y-6">
          <header className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-amber-50 p-3 text-amber-700">
                <Megaphone className="h-7 w-7" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-700">Security communication</p>
                <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950" id="gate-announcements-title">
                  Gate Repairs & Community Announcements
                </h2>
                <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
                  Report a gate that needs repair, is not working, or has restricted access. Published updates appear on the shared notice board for residents and admins.
                </p>
              </div>
            </div>
            <button
              className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 sm:self-auto"
              onClick={() => {
                setActiveGuardTab('gate_operations');
                setActiveSidebarNav('dashboard');
              }}
              type="button"
            >
              <ArrowLeft className="h-4 w-4" />
              Gate operations
            </button>
          </header>

          {gateNoticePublished && (
            <div role="status" className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <p className="text-sm font-bold">Announcement published</p>
                <p className="mt-0.5 text-sm text-emerald-800">The update is now available on the shared notices board for residents and admins.</p>
              </div>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[
              { label: 'Announcements on board', value: notices.length, icon: Megaphone },
              { label: 'Maintenance updates', value: notices.filter((notice) => notice.category === 'Maintenance').length, icon: Wrench },
              { label: 'Important notices', value: notices.filter((notice) => notice.isImportant).length, icon: AlertTriangle },
            ].map(({ label, value, icon: Icon }) => (
              <article className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" key={label}>
                <span className="rounded-xl bg-slate-100 p-3 text-slate-700"><Icon className="h-5 w-5" /></span>
                <div>
                  <p className="text-sm font-medium text-slate-500">{label}</p>
                  <p className="mt-0.5 text-2xl font-extrabold tabular-nums text-slate-950">{value}</p>
                </div>
              </article>
            ))}
          </div>

          <form onSubmit={handlePublishGateNotice} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex flex-col gap-2 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-slate-950">Publish a gate status update</h3>
                <p className="mt-1 text-sm text-slate-500">Provide enough detail so residents know which entrance to use and admins can coordinate repairs.</p>
              </div>
              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                <Shield className="h-3.5 w-3.5" />
                Posting as {currentUser?.name || 'Security Guard'}
              </span>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="gate-notice-title" className="text-sm font-bold text-slate-700">Announcement title</label>
                <input
                  id="gate-notice-title"
                  type="text"
                  required
                  maxLength={100}
                  value={gateNoticeTitle}
                  onChange={(event) => setGateNoticeTitle(event.target.value)}
                  placeholder="Example: Main Gate barrier repair in progress"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="gate-notice-location" className="text-sm font-bold text-slate-700">Affected gate / location</label>
                <input
                  id="gate-notice-location"
                  type="text"
                  required
                  maxLength={80}
                  value={gateNoticeLocation}
                  onChange={(event) => setGateNoticeLocation(event.target.value)}
                  placeholder="Example: Main Gate 1, vehicle barrier"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="gate-notice-status" className="text-sm font-bold text-slate-700">Current status</label>
                <select
                  id="gate-notice-status"
                  value={gateNoticeStatus}
                  onChange={(event) => setGateNoticeStatus(event.target.value as typeof gateNoticeStatus)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                >
                  <option>Repair required</option>
                  <option>Gate not working</option>
                  <option>Access restricted</option>
                  <option>Repair completed</option>
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="gate-notice-alternate" className="text-sm font-bold text-slate-700">Alternative entrance / instructions <span className="font-normal text-slate-400">(optional)</span></label>
                <input
                  id="gate-notice-alternate"
                  type="text"
                  maxLength={160}
                  value={gateNoticeAlternateAccess}
                  onChange={(event) => setGateNoticeAlternateAccess(event.target.value)}
                  placeholder="Example: Please use the service gate until further notice"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                />
              </div>
              <div className="space-y-2 lg:col-span-2">
                <label htmlFor="gate-notice-details" className="text-sm font-bold text-slate-700">What is happening?</label>
                <textarea
                  id="gate-notice-details"
                  required
                  rows={5}
                  maxLength={1200}
                  value={gateNoticeDetails}
                  onChange={(event) => setGateNoticeDetails(event.target.value)}
                  placeholder="Describe the issue, when it started, and any impact on vehicle or pedestrian access."
                  className="w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                />
                <p className="text-right text-xs text-slate-400">{gateNoticeDetails.length}/1200 characters</p>
              </div>
            </div>

            <div className="flex flex-col gap-4 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <label className="flex items-start gap-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={gateNoticeImportant}
                  onChange={(event) => setGateNoticeImportant(event.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                />
                <span>
                  <span className="block font-bold">Mark as important</span>
                  <span className="mt-0.5 block text-xs text-slate-500">Use for access disruptions or updates that need prompt attention.</span>
                </span>
              </label>
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-200 sm:w-auto"
              >
                <Megaphone className="h-4 w-4" />
                Publish for residents & admins
              </button>
            </div>
          </form>

          <section aria-labelledby="community-announcements-title" className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h3 className="text-xl font-extrabold text-slate-950" id="community-announcements-title">Community announcements</h3>
                <p className="mt-1 text-sm text-slate-500">Shared updates visible to residents and admins, including gate notices you publish.</p>
              </div>
              <span className="text-sm font-semibold text-slate-500">{notices.length} total</span>
            </div>
            {notices.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
                <Megaphone className="mx-auto h-9 w-9 text-slate-400" />
                <h4 className="mt-3 text-base font-bold text-slate-900">No announcements yet</h4>
                <p className="mt-1 text-sm text-slate-500">Published gate status updates and community notices will appear here.</p>
              </div>
            ) : (
              <div className="grid gap-4 xl:grid-cols-2">
                {notices.map((notice) => (
                  <article
                    key={notice.id}
                    className={`rounded-2xl border p-5 shadow-sm sm:p-6 ${
                      notice.isImportant ? 'border-amber-200 bg-amber-50/50' : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                          notice.category === 'Emergency' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {notice.category}
                        </span>
                        {notice.isImportant && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                            <AlertTriangle className="h-3.5 w-3.5" />
                            Important
                          </span>
                        )}
                      </div>
                      <time className="text-xs font-medium text-slate-500">{notice.date}</time>
                    </div>
                    <h4 className="mt-4 text-base font-extrabold leading-6 text-slate-950">{notice.title}</h4>
                    <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">{notice.content}</p>
                    <p className="mt-4 border-t border-slate-200/70 pt-3 text-xs font-medium text-slate-500">Published by {notice.author}</p>
                  </article>
                ))}
              </div>
            )}
          </section>
        </section>
      ) : activeGuardTab === 'guard_directory' ? (
        <section aria-labelledby="guard-directory-title" className="w-full space-y-6">
          <header className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-slate-100 p-3 text-slate-800">
                <Users className="h-7 w-7" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Security operations</p>
                <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950" id="guard-directory-title">
                  Guard Team & Duty Roster
                </h2>
                <p className="mt-1 text-sm text-slate-500">Guard contacts, assigned duties, gate stations, and recorded live shifts.</p>
              </div>
            </div>
            <button
              className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 sm:self-auto"
              onClick={() => {
                setActiveGuardTab('gate_operations');
                setActiveSidebarNav('dashboard');
              }}
              type="button"
            >
              <ArrowLeft className="h-4 w-4" />
              Gate operations
            </button>
          </header>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: 'Guard profiles', value: guardProfiles.length, icon: Users },
              { label: 'Currently on duty', value: onDutyGuards.length, icon: Shield },
              { label: 'Gates with active shifts', value: staffedGateCount, icon: Building },
              { label: 'Off duty / inactive', value: guardRoster.filter((guard) => guard.status !== 'on_duty').length, icon: Clock },
            ].map(({ label, value, icon: Icon }) => (
              <article className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" key={label}>
                <span className="rounded-xl bg-emerald-50 p-3 text-emerald-800"><Icon className="h-5 w-5" /></span>
                <div>
                  <p className="text-sm font-medium text-slate-500">{label}</p>
                  <p className="mt-0.5 text-2xl font-extrabold tabular-nums text-slate-950">{value}</p>
                </div>
              </article>
            ))}
          </div>

          {guardRoster.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
              <Users className="mx-auto h-9 w-9 text-slate-400" />
              <h3 className="mt-3 text-base font-bold text-slate-900">No guard records available</h3>
              <p className="mt-1 text-sm text-slate-500">Registered guard profiles and active shift records will appear here.</p>
            </div>
          ) : (
            <div className="grid w-full gap-5 lg:grid-cols-2 2xl:grid-cols-3">
              {guardRoster.map((guard) => {
                const isOnDuty = guard.status === 'on_duty';
                const statusLabel = isOnDuty ? 'On duty' : guard.status === 'inactive' ? 'Inactive' : 'Off duty';
                return (
                  <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" key={guard.id}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                          isOnDuty ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          <Shield className="h-6 w-6" />
                        </span>
                        <div className="min-w-0">
                          <h3 className="truncate text-lg font-extrabold text-slate-950">{guard.name}</h3>
                          <p className="mt-0.5 text-xs font-medium text-slate-500">
                            {guard.badgeId ? `Badge ${guard.badgeId}` : 'Badge not recorded'}
                          </p>
                        </div>
                      </div>
                      <span className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ${
                        isOnDuty ? 'bg-emerald-50 text-emerald-800' : guard.status === 'inactive' ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {statusLabel}
                      </span>
                    </div>

                    <div className="mt-5 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2">
                      <div className="rounded-xl bg-slate-50 p-3.5">
                        <div className="flex items-center gap-2 text-slate-500">
                          <Phone className="h-4 w-4" />
                          <span className="text-xs font-semibold">Mobile</span>
                        </div>
                        {guard.phone ? (
                          <a className="mt-2 inline-block text-sm font-bold text-slate-900 hover:text-emerald-700" href={`tel:${guard.phone}`}>
                            {guard.phone}
                          </a>
                        ) : (
                          <p className="mt-2 text-sm font-semibold text-slate-500">Not recorded</p>
                        )}
                      </div>
                      <div className="rounded-xl bg-slate-50 p-3.5">
                        <div className="flex items-center gap-2 text-slate-500">
                          <MapPin className="h-4 w-4" />
                          <span className="text-xs font-semibold">Gate station</span>
                        </div>
                        <p className="mt-2 text-sm font-bold text-slate-900">{guard.assignedGate || 'Not assigned'}</p>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-3.5">
                        <div className="flex items-center gap-2 text-slate-500">
                          <ClipboardList className="h-4 w-4" />
                          <span className="text-xs font-semibold">Duty</span>
                        </div>
                        <p className="mt-2 text-sm font-bold text-slate-900">{guard.duty || 'Duty not recorded'}</p>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-3.5">
                        <div className="flex items-center gap-2 text-slate-500">
                          <Clock className="h-4 w-4" />
                          <span className="text-xs font-semibold">Shift</span>
                        </div>
                        <p className="mt-2 text-sm font-bold text-slate-900">{guard.shiftType || 'Shift not recorded'}</p>
                        {guard.shift && (
                          <p className="mt-1 text-xs text-slate-500">
                            {isOnDuty ? `Started ${guard.shift.startTime}` : `Last recorded ${guard.shift.date}`}
                          </p>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      ) : activeGuardTab === 'apartment_directory' ? (
        <section aria-labelledby="guard-apartment-directory-title" className="w-full space-y-6">
          <header className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-slate-100 p-3 text-slate-800">
                <Building2 className="h-7 w-7" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Guard reference directory</p>
                <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950" id="guard-apartment-directory-title">
                  Society Apartment Directory
                </h2>
                <p className="mt-1 text-sm text-slate-500">Blocks, apartment addresses, occupancy, and registered resident strength.</p>
              </div>
            </div>
            <button
              className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 sm:self-auto"
              onClick={() => {
                setActiveGuardTab('gate_operations');
                setActiveSidebarNav('dashboard');
              }}
              type="button"
            >
              <ArrowLeft className="h-4 w-4" />
              Gate operations
            </button>
          </header>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: 'Apartments', value: flats.length, icon: Building2 },
              { label: 'Blocks', value: Object.keys(flatsByBlock).length, icon: Building },
              { label: 'Occupied apartments', value: occupiedApartmentCount, icon: UserCheck },
              { label: 'Registered resident strength', value: totalResidentStrength, icon: Users },
            ].map(({ label, value, icon: Icon }) => (
              <article className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" key={label}>
                <span className="rounded-xl bg-emerald-50 p-3 text-emerald-800"><Icon className="h-5 w-5" /></span>
                <div>
                  <p className="text-sm font-medium text-slate-500">{label}</p>
                  <p className="mt-0.5 text-2xl font-extrabold tabular-nums text-slate-950">{value}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="grid w-full gap-5 xl:grid-cols-2">
            {Object.keys(flatsByBlock).sort((a, b) => a.localeCompare(b)).map((blockName) => {
              const blockFlats = flatsByBlock[blockName];
              return (
              <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" key={blockName}>
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="rounded-xl bg-white p-2.5 text-slate-700 shadow-sm ring-1 ring-slate-200"><Building className="h-5 w-5" /></span>
                    <div>
                      <h3 className="font-bold text-slate-900">{blockName}</h3>
                      <p className="text-xs text-slate-500">{blockFlats.length} apartment{blockFlats.length === 1 ? '' : 's'}</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800">
                    {blockFlats.reduce((sum, flat) => sum + (flat.occupancyStatus === 'Vacant' ? 0 : flat.familyMembersCount || 1), 0)} residents
                  </span>
                </div>
                <div className="grid gap-3 p-4 sm:grid-cols-2">
                  {blockFlats.sort((a, b) => a.flatNumber.localeCompare(b.flatNumber)).map((flat) => (
                    <div className="rounded-xl border border-slate-200 p-4" key={flat.flatNumber}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-base font-extrabold text-slate-950">{flat.flatNumber}</p>
                          <p className="mt-1 text-xs text-slate-500">Floor {flat.floor}</p>
                        </div>
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                          flat.occupancyStatus === 'Vacant'
                            ? 'bg-amber-50 text-amber-800'
                            : 'bg-emerald-50 text-emerald-800'
                        }`}>
                          {flat.occupancyStatus === 'Vacant' ? 'Vacant' : flat.occupancyStatus}
                        </span>
                      </div>
                      <div className="mt-3 flex items-start gap-2 border-t border-slate-100 pt-3">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                        <p className="text-xs leading-5 text-slate-600">{flat.propertyAddress || 'Apartment address not recorded'}</p>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <span className="font-medium text-slate-500">Resident / household</span>
                        <span className="font-semibold text-slate-800">
                          {flat.occupancyStatus === 'Vacant' ? 'No household assigned' : `${flat.ownerName} · ${flat.familyMembersCount} resident${flat.familyMembersCount === 1 ? '' : 's'}`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
              );
            })}
          </div>
        </section>
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
                <p className="text-xs text-slate-500">Enter a 4-digit household staff pass or a visitor OTP / QR token</p>
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
                placeholder="4-digit staff pass or visitor pass code"
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

          {domesticWorkerResult && (
            <div className={`rounded-xl border p-4 ${
              domesticWorkerResult.success
                ? 'border-emerald-200 bg-emerald-50'
                : 'border-rose-200 bg-rose-50'
            }`}>
              <div className="flex items-start gap-2.5">
                {domesticWorkerResult.success
                  ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
                  : <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />}
                <div className="min-w-0 flex-1">
                  <p className={`text-xs font-extrabold ${domesticWorkerResult.success ? 'text-emerald-950' : 'text-rose-900'}`}>
                    {domesticWorkerResult.success ? 'Household worker pass verified' : 'Household worker access not verified'}
                  </p>
                  <p className={`mt-1 text-xs leading-5 ${domesticWorkerResult.success ? 'text-emerald-900' : 'text-rose-800'}`}>
                    {domesticWorkerResult.message}
                  </p>
                  {domesticWorkerResult.worker && (() => {
                    const livePass = domesticWorkerPasses.find((item) => item.id === domesticWorkerResult.worker.id);
                    const pass = livePass || domesticWorkerResult.worker;
                    return (
                      <div className="mt-3 rounded-lg border border-white/80 bg-white/80 p-3">
                        <div className="grid gap-2 text-xs sm:grid-cols-2">
                          <p><span className="text-slate-500">Worker:</span> <strong className="text-slate-950">{pass.workerName}</strong></p>
                          <p><span className="text-slate-500">Work type:</span> <strong className="capitalize text-slate-950">{pass.workType}</strong></p>
                          <p><span className="text-slate-500">Phone:</span> <strong className="text-slate-950">{pass.workerPhone}</strong></p>
                          {pass.whatsappNumber && <p><span className="text-slate-500">WhatsApp:</span> <strong className="text-slate-950">{pass.whatsappNumber}</strong></p>}
                          <p><span className="text-slate-500">Flat:</span> <strong className="text-slate-950">{pass.flatNumber}</strong></p>
                          <p><span className="text-slate-500">Resident:</span> <strong className="text-slate-950">{pass.residentName}</strong></p>
                          <p><span className="text-slate-500">Pass valid through:</span> <strong className="text-slate-950">{pass.validThrough}</strong></p>
                          {pass.workerAddress && <p className="sm:col-span-2"><span className="text-slate-500">Home address:</span> <strong className="text-slate-950">{pass.workerAddress}</strong></p>}
                          {pass.maritalStatus && <p><span className="text-slate-500">Marital status:</span> <strong className="capitalize text-slate-950">{pass.maritalStatus}</strong>{pass.spouseName && <> · <span className="text-slate-500">Spouse:</span> <strong className="text-slate-950">{pass.spouseName}</strong></>}</p>}
                        </div>
                        {pass.idDocumentDataUrl && (
                          <div className="mt-3 flex items-center gap-3 rounded-lg bg-slate-50 p-2">
                            <img
                              src={pass.idDocumentDataUrl}
                              alt={`Photo ID for ${pass.workerName}`}
                              className="h-16 w-20 rounded-md border border-slate-200 object-cover"
                            />
                            <p className="text-[11px] text-slate-600">Compare the worker with their registered photo ID.</p>
                          </div>
                        )}
                        <p className={`mt-2 text-[11px] font-bold ${pass.insideSociety ? 'text-amber-800' : 'text-emerald-800'}`}>
                          Gate status: {pass.insideSociety ? 'Inside society' : 'Outside'}
                          {pass.lastEntryAt && ` · Last entry ${new Date(pass.lastEntryAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} at ${pass.lastEntryGate || 'gate'}`}
                          {pass.lastExitAt && ` · Last exit ${new Date(pass.lastExitAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                        </p>
                        {(domesticWorkerResult.success || pass.insideSociety) && (
                          <button
                            type="button"
                            onClick={() => handleDomesticWorkerGateAction(pass.id, pass.insideSociety ? 'exit' : 'entry')}
                            className={`mt-3 w-full rounded-lg px-3 py-2.5 text-xs font-extrabold text-white ${
                              pass.insideSociety ? 'bg-slate-700 hover:bg-slate-800' : 'bg-emerald-700 hover:bg-emerald-800'
                            }`}
                          >
                            {pass.insideSociety ? 'Confirm worker exit' : 'Confirm identity & record entry'}
                          </button>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
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

      {gateDropRequests.length > 0 && (
        <section aria-label="Resident parcel drop requests" className="rounded-2xl border border-amber-300 bg-amber-50 p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-amber-100 p-2.5 text-amber-800">
              <Package className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-extrabold text-amber-950">
                Resident requested parcel drop at the gate ({gateDropRequests.length})
              </h3>
              <p className="mt-1 text-xs text-amber-800">
                Keep these parcels at the gate desk for the resident. Do not send the delivery agent to the apartment.
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {gateDropRequests.map((request) => (
                  <div className="rounded-xl border border-amber-200 bg-white p-3" key={request.id}>
                    <p className="text-sm font-bold text-slate-900">{request.visitorName}</p>
                    <p className="mt-1 text-xs text-slate-600">
                      {request.companyOrRole || 'Delivery'} · Flat {request.flatNumber} · {request.residentName}
                    </p>
                    {request.phone && <p className="mt-1 text-xs text-slate-500">Phone: {request.phone}</p>}
                    <span className="mt-2 inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-900">
                      Leave parcel at gate
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

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
                            {v.deliveryInstruction === 'leave_at_gate' && (
                              <span className="mt-1 inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                                <Package className="h-3 w-3" />
                                Leave parcel at gate
                              </span>
                            )}
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
          <span>Daily Household Staff Gate Attendance</span>
        </h3>

        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-bold text-slate-800">Resident-registered workers</h4>
            <p className="mt-0.5 text-xs text-slate-500">Check the worker’s details and four-digit pass before recording entry or exit.</p>
          </div>
          {domesticWorkerPasses.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-xs text-slate-500">
              No household workers have been registered by residents yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {domesticWorkerPasses.map((workerPass) => {
                const today = new Date();
                const localToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                const passValid = workerPass.status === 'active' &&
                  localToday >= workerPass.validFrom &&
                  localToday <= workerPass.validThrough;
                const canCheckIn = passValid && !workerPass.insideSociety;
                const canCheckOut = workerPass.insideSociety;
                const detailsExpanded = expandedWorkerDetailsId === workerPass.id;

                return (
                  <article key={workerPass.id} className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 text-xs">
                    <div className="flex items-start justify-between gap-3 p-4">
                      <div className="min-w-0">
                        <button
                          type="button"
                          aria-expanded={detailsExpanded}
                          onClick={() => setExpandedWorkerDetailsId(detailsExpanded ? null : workerPass.id)}
                          className="text-left text-sm font-bold text-slate-900 underline decoration-slate-300 underline-offset-2 hover:text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2"
                        >
                          {workerPass.workerName}
                        </button>
                        <p className="mt-0.5 capitalize text-slate-600">{workerPass.workType}</p>
                        <p className="mt-2 text-[11px] text-slate-500">Flat: {workerPass.flatNumber}</p>
                      </div>
                      <button
                        type="button"
                        disabled={!canCheckIn && !canCheckOut}
                        onClick={() => setExpandedWorkerDetailsId(detailsExpanded ? null : workerPass.id)}
                        className={`shrink-0 rounded-lg px-3 py-1.5 text-[11px] font-bold transition-colors disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 ${
                          canCheckOut
                            ? 'bg-slate-900 text-white hover:bg-slate-800'
                            : canCheckIn
                            ? 'bg-slate-200 text-slate-800 hover:bg-slate-300'
                            : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {canCheckOut ? 'Checked-In' : canCheckIn ? 'Mark In' : workerPass.status === 'revoked' ? 'Revoked' : 'Expired'}
                      </button>
                    </div>
                    {detailsExpanded && (
                      <div className="border-t border-slate-200 bg-white p-4">
                        <div className="flex flex-col gap-4 sm:flex-row">
                          {workerPass.idDocumentDataUrl ? (
                            <img
                              src={workerPass.idDocumentDataUrl}
                              alt={`Photo ID for ${workerPass.workerName}`}
                              className="h-44 w-full rounded-lg border border-slate-200 bg-slate-50 object-contain sm:w-56"
                            />
                          ) : (
                            <div className="flex h-32 w-full items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-slate-400 sm:w-40">
                              <User className="h-8 w-8" aria-hidden="true" />
                            </div>
                          )}
                          <dl className="grid min-w-0 flex-1 grid-cols-1 gap-x-4 gap-y-2 text-[11px] sm:grid-cols-2">
                            <div><dt className="text-slate-500">First name</dt><dd className="font-semibold text-slate-900">{workerPass.firstName || workerPass.workerName.split(' ')[0]}</dd></div>
                            <div><dt className="text-slate-500">Last name</dt><dd className="font-semibold text-slate-900">{workerPass.lastName || workerPass.workerName.split(' ').slice(1).join(' ') || '—'}</dd></div>
                            <div><dt className="text-slate-500">Mobile</dt><dd className="font-semibold text-slate-900">{workerPass.workerPhone}</dd></div>
                            <div><dt className="text-slate-500">WhatsApp</dt><dd className="font-semibold text-slate-900">{workerPass.whatsappNumber || 'Not provided'}</dd></div>
                            <div><dt className="text-slate-500">Role</dt><dd className="font-semibold capitalize text-slate-900">{workerPass.workType}</dd></div>
                            <div><dt className="text-slate-500">Marital status</dt><dd className="font-semibold capitalize text-slate-900">{workerPass.maritalStatus || 'Not provided'}</dd></div>
                            {workerPass.spouseName && <div><dt className="text-slate-500">Husband / wife</dt><dd className="font-semibold text-slate-900">{workerPass.spouseName}</dd></div>}
                            <div><dt className="text-slate-500">Home address</dt><dd className="font-semibold text-slate-900">{workerPass.workerAddress || 'Not provided'}</dd></div>
                            <div><dt className="text-slate-500">Flat / resident</dt><dd className="font-semibold text-slate-900">{workerPass.flatNumber} · {workerPass.residentName}</dd></div>
                            <div><dt className="text-slate-500">Pass code</dt><dd className="font-mono font-bold tracking-wider text-slate-900">{workerPass.passCode}</dd></div>
                            <div><dt className="text-slate-500">Validity</dt><dd className="font-semibold text-slate-900">{workerPass.validFrom} – {workerPass.validThrough}</dd></div>
                            {workerPass.idDocumentName && <div className="sm:col-span-2"><dt className="text-slate-500">Photo ID file</dt><dd className="font-semibold text-slate-900">{workerPass.idDocumentName}</dd></div>}
                            {workerPass.lastEntryAt && <div><dt className="text-slate-500">Last entry</dt><dd className="font-semibold text-slate-900">{new Date(workerPass.lastEntryAt).toLocaleString()} · {workerPass.lastEntryGate || 'Gate'}</dd></div>}
                            {workerPass.lastExitAt && <div><dt className="text-slate-500">Last exit</dt><dd className="font-semibold text-slate-900">{new Date(workerPass.lastExitAt).toLocaleString()}</dd></div>}
                          </dl>
                        </div>
                        {(canCheckIn || canCheckOut) && (
                          <button
                            type="button"
                            onClick={() => handleDomesticWorkerGateAction(workerPass.id, canCheckOut ? 'exit' : 'entry')}
                            className={`mt-4 w-full rounded-lg px-3 py-2.5 text-xs font-extrabold text-white transition-colors ${
                              canCheckOut
                                ? 'bg-slate-900 hover:bg-slate-800'
                                : 'bg-emerald-700 hover:bg-emerald-800'
                            }`}
                          >
                            {canCheckOut ? 'Confirm check-out' : 'Confirm check-in'}
                          </button>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>

        <div className="border-t border-slate-200 pt-4">
          <h4 className="mb-3 text-sm font-bold text-slate-800">Daily society staff</h4>
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
                  {s.isPresentToday ? 'Check-Out' : 'Mark In'}
                </button>
              </div>

              <p className="text-slate-500 text-[11px]">{s.phone}</p>
              {s.assignedDuties && <p className="text-slate-600 text-[11px]"><strong>Assigned duties:</strong> {s.assignedDuties}</p>}
              {s.flatsAssigned.length > 0 && <p className="text-slate-500 text-[11px]">Flats: {s.flatsAssigned.join(', ')}</p>}
              {s.checkInTime && s.isPresentToday && <p className="text-slate-500 text-[11px]">Checked in at {s.checkInTime}</p>}
            </div>
          ))}
        </div>
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
