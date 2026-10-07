import React, { useState, useEffect } from 'react';
import { useSociety } from '../../context/SocietyContext';
import {
  GuardShiftLog,
  ShiftIncident,
  ShiftIncidentCategory,
  ShiftIncidentSeverity,
} from '../../types';
import { LogIncidentModal } from './LogIncidentModal';
import { ShiftHandoverModal } from './ShiftHandoverModal';
import {
  Shield,
  ShieldAlert,
  Clock,
  UserCheck,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Plus,
  Search,
  Filter,
  Download,
  Printer,
  ChevronDown,
  ChevronUp,
  MapPin,
  Car,
  Building,
  User,
  FileText,
  Sparkles,
  ArrowRight,
  Radio,
  History,
} from 'lucide-react';

export const DigitalShiftLogSection: React.FC = () => {
  const {
    shiftLogs,
    activeShift,
    visitors,
    sosAlerts,
    updateShiftIncident,
    deleteShiftIncident,
  } = useSociety();

  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'all' | ShiftIncidentSeverity>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | ShiftIncidentCategory>('all');
  const [stationFilter, setStationFilter] = useState<string>('all');

  const [expandedShiftId, setExpandedShiftId] = useState<string | null>(
    activeShift?.id || (shiftLogs[0]?.id ?? null)
  );

  const [isLogIncidentOpen, setIsLogIncidentOpen] = useState(false);
  const [isHandoverOpen, setIsHandoverOpen] = useState(false);
  const [handoverMode, setHandoverMode] = useState<'start' | 'end'>('start');

  const [resolvingIncidentId, setResolvingIncidentId] = useState<string | null>(null);
  const [resolutionText, setResolutionText] = useState('');

  // Live timer calculation for active shift
  const [elapsedDuration, setElapsedDuration] = useState<string>('');

  useEffect(() => {
    if (!activeShift) {
      setElapsedDuration('');
      return;
    }

    const updateTimer = () => {
      // Calculate elapsed time based on today's start
      const [time, modifier] = activeShift.startTime.split(' ');
      let [hours, minutes] = (time || '06:00').split(':').map(Number);
      if (modifier === 'PM' && hours < 12) hours += 12;
      if (modifier === 'AM' && hours === 12) hours = 0;

      const shiftStartDate = new Date();
      shiftStartDate.setHours(hours || 6, minutes || 0, 0, 0);

      const now = new Date();
      const diffMs = now.getTime() - shiftStartDate.getTime();
      if (diffMs > 0) {
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        setElapsedDuration(`${diffHrs}h ${diffMins}m on duty`);
      } else {
        setElapsedDuration('Just started');
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000);
    return () => clearInterval(interval);
  }, [activeShift]);

  // Aggregate stats
  const totalShiftsCount = shiftLogs.length;
  const allIncidents = shiftLogs.flatMap((s) => s.incidents);
  const totalIncidentsCount = allIncidents.length;
  const criticalIncidentsCount = allIncidents.filter(
    (i) => i.severity === 'critical' || i.severity === 'high'
  ).length;
  const resolvedIncidentsCount = allIncidents.filter((i) => i.resolved).length;
  const openIncidentsCount = totalIncidentsCount - resolvedIncidentsCount;

  // Filtered shifts and incidents
  const filteredShifts = shiftLogs.filter((shift) => {
    const matchesStation = stationFilter === 'all' || shift.gateStation === stationFilter;
    const matchesQuery =
      shift.guardName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shift.gateStation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shift.guardBadgeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shift.incidents.some(
        (i) =>
          i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          i.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          i.actionTaken.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (i.flatNumber && i.flatNumber.toLowerCase().includes(searchQuery.toLowerCase()))
      );

    return matchesStation && matchesQuery;
  });

  const handleResolveSubmit = (incidentId: string) => {
    if (!resolutionText.trim()) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

    updateShiftIncident(incidentId, {
      resolved: true,
      resolvedAt: timeStr,
      resolutionNotes: resolutionText.trim(),
    });

    setResolvingIncidentId(null);
    setResolutionText('');
  };

  const handleToggleResolve = (incident: ShiftIncident) => {
    if (incident.resolved) {
      updateShiftIncident(incident.id, {
        resolved: false,
        resolvedAt: undefined,
      });
    } else {
      setResolvingIncidentId(incident.id);
      setResolutionText(incident.resolutionNotes || 'Situation verified and cleared by duty officer.');
    }
  };

  const getSeverityBadge = (severity: ShiftIncidentSeverity) => {
    switch (severity) {
      case 'critical':
        return (
          <span className="bg-rose-100 text-rose-800 border border-rose-300 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping" />
            Critical SOS
          </span>
        );
      case 'high':
        return (
          <span className="bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
            High Severity
          </span>
        );
      case 'medium':
        return (
          <span className="bg-blue-100 text-blue-800 border border-blue-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
            Medium
          </span>
        );
      case 'low':
      default:
        return (
          <span className="bg-slate-100 text-slate-700 border border-slate-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
            Low / Routine
          </span>
        );
    }
  };

  const exportShiftLogCSV = () => {
    const headers = [
      'Shift ID',
      'Date',
      'Duty Officer',
      'Badge ID',
      'Gate Station',
      'Shift Window',
      'Start Time',
      'End Time',
      'Status',
      'Incident Count',
      'Incident Titles',
      'Handover Remarks',
      'Relieving Officer',
    ];

    const rows = shiftLogs.map((s) => [
      s.id,
      s.date,
      `"${s.guardName}"`,
      s.guardBadgeId,
      `"${s.gateStation}"`,
      s.shiftType,
      s.startTime,
      s.endTime || 'Active',
      s.status,
      s.incidents.length,
      `"${s.incidents.map((i) => `[${i.severity.toUpperCase()}] ${i.title}`).join('; ')}"`,
      `"${s.handoverNotes || ''}"`,
      `"${s.handedOverTo || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Security_Shift_Log_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* SECTION 1: ACTIVE DUTY SHIFT COCKPIT */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="p-4 bg-emerald-500 text-slate-950 rounded-2xl font-black shadow-lg">
              <Shield className="w-8 h-8" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                  <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                  <span>{activeShift ? 'Active Security Duty' : 'No Active Shift'}</span>
                </span>
                <span className="text-slate-400 text-xs font-mono">
                  {activeShift?.gateStation || 'Main Gate 1'}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
                {activeShift ? activeShift.guardName : 'Officer Clock-In Required'}
              </h2>

              <p className="text-xs text-slate-300 flex flex-wrap items-center gap-3 mt-1">
                <span>Badge: <strong className="text-emerald-400 font-mono">{activeShift?.guardBadgeId || 'SEC-01'}</strong></span>
                <span>•</span>
                <span>Shift: <strong className="text-white">{activeShift?.shiftType || 'Morning'}</strong></span>
                <span>•</span>
                <span>Start: <strong className="text-white">{activeShift?.startTime || '06:00 AM'}</strong></span>
                {elapsedDuration && (
                  <>
                    <span>•</span>
                    <span className="text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                      {elapsedDuration}
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsLogIncidentOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Log Incident / Event</span>
            </button>

            {activeShift ? (
              <button
                onClick={() => {
                  setHandoverMode('end');
                  setIsHandoverOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs sm:text-sm font-bold border border-slate-600 transition-all"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Clock-Out & Handover</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setHandoverMode('start');
                  setIsHandoverOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold shadow-md transition-all"
              >
                <Clock className="w-4 h-4" />
                <span>Clock-In New Shift</span>
              </button>
            )}

            <button
              onClick={exportShiftLogCSV}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
              title="Export Shift Logs CSV"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800">
          <div className="bg-slate-800/70 border border-slate-700/70 rounded-2xl p-3.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Active Shift Incidents
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-amber-400">
                {activeShift ? activeShift.incidents.length : 0}
              </span>
              <span className="text-[11px] text-slate-400">logged</span>
            </div>
          </div>

          <div className="bg-slate-800/70 border border-slate-700/70 rounded-2xl p-3.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Duty Shifts Logged
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-white">{totalShiftsCount}</span>
              <span className="text-[11px] text-slate-400">recorded</span>
            </div>
          </div>

          <div className="bg-slate-800/70 border border-slate-700/70 rounded-2xl p-3.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Open / Unresolved Events
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className={`text-2xl font-black ${openIncidentsCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {openIncidentsCount}
              </span>
              <span className="text-[11px] text-slate-400">pending</span>
            </div>
          </div>

          <div className="bg-slate-800/70 border border-slate-700/70 rounded-2xl p-3.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Duty Station Status
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-base font-black text-emerald-400">Normal / Green</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: SEARCH & FILTERS */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search shift logs by officer name, incident title, location, vehicle or flat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={stationFilter}
            onChange={(e) => setStationFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:bg-white focus:outline-hidden"
          >
            <option value="all">All Gate Stations</option>
            <option value="Main Gate 1">Main Gate 1</option>
            <option value="Service Gate 2">Service Gate 2</option>
            <option value="North Gate 3">North Gate 3</option>
            <option value="Clubhouse Gate">Clubhouse Gate</option>
          </select>

          <button
            onClick={() => {
              setHandoverMode('start');
              setIsHandoverOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Shift</span>
          </button>
        </div>
      </div>

      {/* SECTION 3: SHIFTS & INCIDENTS ACCORDION LIST */}
      <div className="space-y-4">
        {filteredShifts.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Shield className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-800">No Security Shift Logs Match Filter</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Try adjusting your search keywords or start a new security shift to log start/end times and incidents.
            </p>
          </div>
        ) : (
          filteredShifts.map((shift) => {
            const isExpanded = expandedShiftId === shift.id;
            const hasIncidents = shift.incidents.length > 0;
            const hasCritical = shift.incidents.some(
              (i) => i.severity === 'critical' || i.severity === 'high'
            );

            return (
              <div
                key={shift.id}
                className={`bg-white rounded-2xl border transition-all shadow-xs overflow-hidden ${
                  shift.status === 'active'
                    ? 'border-emerald-300 ring-2 ring-emerald-500/20'
                    : 'border-slate-200/80 hover:border-slate-300'
                }`}
              >
                {/* Shift Accordion Header */}
                <div
                  onClick={() => setExpandedShiftId(isExpanded ? null : shift.id)}
                  className="p-5 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 select-none hover:bg-slate-50/70 transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div
                      className={`p-3 rounded-2xl shrink-0 ${
                        shift.status === 'active'
                          ? 'bg-emerald-600 text-white font-black'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      <Shield className="w-5 h-5" />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-base">
                          {shift.guardName}
                        </span>
                        <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                          {shift.guardBadgeId}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                            shift.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 animate-pulse'
                              : shift.status === 'handed_over'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {shift.status === 'active'
                            ? '● Active On-Duty'
                            : shift.status === 'handed_over'
                            ? 'Handed Over'
                            : 'Completed'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1 font-semibold text-slate-700">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {shift.gateStation}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {shift.date}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-mono">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {shift.startTime} – {shift.endTime || 'In Progress'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-4">
                    {/* Incidents Count Badge */}
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-xl flex items-center gap-1.5 ${
                          hasCritical
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : hasIncidents
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>{shift.incidents.length} Incident(s)</span>
                      </span>
                    </div>

                    <div className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Shift Log Details */}
                {isExpanded && (
                  <div className="p-5 sm:p-6 bg-slate-50/50 border-t border-slate-100 space-y-6 animate-fade-in">
                    {/* Handover Remarks & Log Metadata */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 space-y-2">
                        <span className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Shift Handover Notes & Remarks</span>
                        </span>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {shift.handoverNotes || 'No specific handover notes recorded for this shift.'}
                        </p>
                        {shift.handedOverTo && (
                          <p className="text-[11px] font-bold text-slate-800 pt-1 border-t border-slate-100">
                            Relieved by: <span className="text-indigo-600">{shift.handedOverTo}</span>
                          </p>
                        )}
                      </div>

                      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 space-y-2">
                        <span className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                          <History className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Gate Traffic & Security Ledger Snapshot</span>
                        </span>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                            <span className="text-[10px] text-slate-500 block uppercase">Visitors Processed</span>
                            <span className="text-lg font-black text-slate-900">
                              {shift.totalVisitorsProcessed ?? visitors.length}
                            </span>
                          </div>
                          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                            <span className="text-[10px] text-slate-500 block uppercase">Denied Entries</span>
                            <span className="text-lg font-black text-rose-700">
                              {shift.deniedEntriesCount ?? 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Notable Incidents Logged During this Shift */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                          <ShieldAlert className="w-4 h-4 text-rose-600" />
                          <span>Notable Incidents Recorded ({shift.incidents.length})</span>
                        </h4>

                        <button
                          onClick={() => setIsLogIncidentOpen(true)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Log New Incident</span>
                        </button>
                      </div>

                      {shift.incidents.length === 0 ? (
                        <div className="bg-white p-6 rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-500">
                          No incidents or security infractions recorded during this shift.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {shift.incidents.map((incident) => (
                            <div
                              key={incident.id}
                              className={`bg-white rounded-2xl border p-4 sm:p-5 shadow-xs space-y-3 transition-all ${
                                incident.severity === 'critical'
                                  ? 'border-rose-300 bg-rose-50/20'
                                  : incident.severity === 'high'
                                  ? 'border-amber-300'
                                  : 'border-slate-200'
                              }`}
                            >
                              {/* Incident Card Header */}
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                                <div className="flex flex-wrap items-center gap-2">
                                  {getSeverityBadge(incident.severity)}
                                  <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2.5 py-0.5 rounded-md">
                                    {incident.category}
                                  </span>
                                  <span className="text-xs font-black text-slate-900">
                                    {incident.title}
                                  </span>
                                </div>

                                <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                                  <span>{incident.timestamp}</span>
                                  <span>•</span>
                                  <button
                                    onClick={() => handleToggleResolve(incident)}
                                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-colors flex items-center gap-1 ${
                                      incident.resolved
                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                        : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                                    }`}
                                  >
                                    {incident.resolved ? (
                                      <>
                                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                        <span>Resolved</span>
                                      </>
                                    ) : (
                                      <>
                                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                                        <span>Mark Resolved</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                              </div>

                              {/* Incident Description & Action Taken */}
                              <div className="space-y-2 text-xs">
                                <div>
                                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">
                                    Event Description
                                  </span>
                                  <p className="text-slate-700 leading-relaxed">{incident.description}</p>
                                </div>

                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                  <span className="text-[10px] font-bold text-indigo-700 uppercase block mb-0.5">
                                    Immediate Action Taken
                                  </span>
                                  <p className="text-slate-800 leading-relaxed font-medium">
                                    {incident.actionTaken}
                                  </p>
                                </div>

                                {incident.resolutionNotes && (
                                  <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-100">
                                    <span className="text-[10px] font-bold text-emerald-800 uppercase block mb-0.5">
                                      Resolution Summary ({incident.resolvedAt || 'Cleared'})
                                    </span>
                                    <p className="text-emerald-900 leading-relaxed font-medium">
                                      {incident.resolutionNotes}
                                    </p>
                                  </div>
                                )}
                              </div>

                              {/* Incident Tags & Reporting Guard Footer */}
                              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                                <div className="flex flex-wrap items-center gap-3">
                                  <span className="flex items-center gap-1 font-semibold text-slate-700">
                                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                    {incident.location}
                                  </span>
                                  {incident.flatNumber && (
                                    <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-bold">
                                      <Building className="w-3 h-3 text-slate-400" />
                                      Flat {incident.flatNumber}
                                    </span>
                                  )}
                                  {incident.vehicleNumber && (
                                    <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-mono font-bold">
                                      <Car className="w-3 h-3 text-slate-400" />
                                      {incident.vehicleNumber}
                                    </span>
                                  )}
                                </div>

                                <div className="text-slate-400">
                                  Reported by: <strong className="text-slate-700">{incident.reportedBy}</strong>
                                </div>
                              </div>

                              {/* Inline Resolution Modal / Popover */}
                              {resolvingIncidentId === incident.id && (
                                <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl space-y-2 mt-2">
                                  <label className="block text-[11px] font-bold text-amber-900 uppercase tracking-wider">
                                    Add Resolution & Final Clearance Note
                                  </label>
                                  <textarea
                                    rows={2}
                                    value={resolutionText}
                                    onChange={(e) => setResolutionText(e.target.value)}
                                    placeholder="Detail how the issue was resolved, residents contacted, or corrective steps taken..."
                                    className="w-full bg-white border border-amber-200 rounded-lg p-2 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                                  />
                                  <div className="flex justify-end gap-2">
                                    <button
                                      type="button"
                                      onClick={() => setResolvingIncidentId(null)}
                                      className="px-3 py-1 text-xs text-slate-600 hover:bg-amber-100 rounded-lg font-bold"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleResolveSubmit(incident.id)}
                                      className="px-3.5 py-1 text-xs bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold"
                                    >
                                      Confirm Resolution
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modals */}
      <LogIncidentModal
        isOpen={isLogIncidentOpen}
        onClose={() => setIsLogIncidentOpen(false)}
        shiftId={activeShift?.id}
      />

      <ShiftHandoverModal
        isOpen={isHandoverOpen}
        onClose={() => setIsHandoverOpen(false)}
        mode={handoverMode}
      />
    </div>
  );
};
