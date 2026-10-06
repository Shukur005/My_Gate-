import React, { useMemo, useState } from 'react';
import { useSociety } from '../../context/SocietyContext';
import { ShiftIncidentCategory, ShiftIncidentSeverity } from '../../types';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  LifeBuoy,
  MapPin,
  PlusCircle,
  Shield,
  ShieldAlert,
  Wrench,
} from 'lucide-react';

export const GuardHelpDeskSection: React.FC = () => {
  const { currentUser, shiftLogs, logShiftIncident } = useSociety();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ShiftIncidentCategory>('Other');
  const [severity, setSeverity] = useState<ShiftIncidentSeverity>('medium');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [actionTaken, setActionTaken] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const ownActiveShift = shiftLogs.find((shift) =>
    shift.status === 'active' &&
    ((Boolean(currentUser?.badgeId) && shift.guardBadgeId === currentUser?.badgeId) ||
      shift.guardName.trim().toLowerCase() === currentUser?.name.trim().toLowerCase())
  );

  const incidents = useMemo(
    () => shiftLogs
      .flatMap((shift) => shift.incidents.map((incident) => ({ ...incident, shift })))
      .sort((a, b) => `${b.date} ${b.timestamp}`.localeCompare(`${a.date} ${a.timestamp}`)),
    [shiftLogs]
  );
  const openIncidents = incidents.filter((incident) => !incident.resolved);
  const highPriorityIncidents = openIncidents.filter(
    (incident) => incident.severity === 'high' || incident.severity === 'critical'
  );
  const loggedToday = incidents.filter((incident) => incident.date === new Date().toISOString().split('T')[0]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentUser || currentUser.role !== 'guard') {
      setSubmitError('A signed-in guard account is required to submit a duty support request.');
      return;
    }

    try {
      logShiftIncident({
        shiftId: ownActiveShift?.id,
        guardName: currentUser.name,
        guardBadgeId: currentUser.badgeId,
        gateStation: ownActiveShift?.gateStation || currentUser.assignedGate,
        shiftType: ownActiveShift?.shiftType || currentUser.shiftType,
        severity,
        category,
        title: title.trim(),
        description: description.trim(),
        location: location.trim() || ownActiveShift?.gateStation || currentUser.assignedGate || 'Gate not recorded',
        actionTaken: actionTaken.trim(),
        reportedBy: currentUser.name,
      });
      setTitle('');
      setCategory('Other');
      setSeverity('medium');
      setLocation('');
      setDescription('');
      setActionTaken('');
      setSubmitError('');
      setSubmitted(true);
      window.setTimeout(() => setSubmitted(false), 5000);
    } catch (error) {
      console.error('Unable to submit guard duty support request.', error);
      setSubmitError('The request could not be saved. Please try again.');
    }
  };

  return (
    <section aria-labelledby="guard-helpdesk-title" className="w-full space-y-6">
      <header className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-sky-50 p-3 text-sky-700">
            <LifeBuoy className="h-7 w-7" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-700">Security team support</p>
            <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950" id="guard-helpdesk-title">
              Guard Duty Help Desk
            </h2>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
              Report gate equipment faults, security concerns, access problems, or other duty issues. This page shows guard shift incidents only—not resident complaints.
            </p>
          </div>
        </div>
        <div className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${
          ownActiveShift ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'
        }`}>
          <span className={`h-2 w-2 rounded-full ${ownActiveShift ? 'bg-emerald-500' : 'bg-amber-500'}`} />
          {ownActiveShift ? `On duty · ${ownActiveShift.gateStation}` : 'No active shift recorded'}
        </div>
      </header>

      {submitted && (
        <div role="status" className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="text-sm font-bold">Duty support request recorded</p>
            <p className="mt-0.5 text-sm text-emerald-800">The report has been added to the guard shift incident records.</p>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Guard duty reports', value: incidents.length, icon: FileText },
          { label: 'Open reports', value: openIncidents.length, icon: Clock },
          { label: 'High / critical open', value: highPriorityIncidents.length, icon: AlertTriangle },
          { label: 'Reports today', value: loggedToday.length, icon: Shield },
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

      <div className="grid w-full items-start gap-6 2xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex items-start gap-3 border-b border-slate-100 pb-5">
            <span className="rounded-xl bg-rose-50 p-2.5 text-rose-700"><PlusCircle className="h-5 w-5" /></span>
            <div>
              <h3 className="text-lg font-extrabold text-slate-950">Create a duty support report</h3>
              <p className="mt-1 text-sm text-slate-500">Include the location, impact, and what has already been done.</p>
            </div>
          </div>

          {submitError && (
            <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800">
              {submitError}
            </p>
          )}

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="guard-helpdesk-title-field" className="text-sm font-bold text-slate-700">Issue title</label>
              <input
                id="guard-helpdesk-title-field"
                required
                maxLength={100}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Example: Vehicle barrier is not responding"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="guard-helpdesk-category" className="text-sm font-bold text-slate-700">Duty issue type</label>
              <select
                id="guard-helpdesk-category"
                value={category}
                onChange={(event) => setCategory(event.target.value as ShiftIncidentCategory)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
              >
                <option>Gate Barrier Fault</option>
                <option>Security Breach</option>
                <option>Unauthorized Vehicle</option>
                <option>Suspicious Package</option>
                <option>Medical / SOS</option>
                <option>Staff Misconduct</option>
                <option>Noise / Disturbance</option>
                <option>Resident Dispute</option>
                <option>Lost &amp; Found</option>
                <option>Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="guard-helpdesk-severity" className="text-sm font-bold text-slate-700">Priority</label>
              <select
                id="guard-helpdesk-severity"
                value={severity}
                onChange={(event) => setSeverity(event.target.value as ShiftIncidentSeverity)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
              >
                <option value="low">Low / routine</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="guard-helpdesk-location" className="text-sm font-bold text-slate-700">Gate / location</label>
              <div className="relative">
                <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="guard-helpdesk-location"
                  maxLength={100}
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  placeholder={ownActiveShift?.gateStation || currentUser?.assignedGate || 'Enter gate or location'}
                  className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                />
              </div>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="guard-helpdesk-description" className="text-sm font-bold text-slate-700">Issue details</label>
              <textarea
                id="guard-helpdesk-description"
                required
                rows={4}
                maxLength={1200}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Describe what happened, when it started, and any safety or access impact."
                className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="guard-helpdesk-action" className="text-sm font-bold text-slate-700">Action taken so far</label>
              <textarea
                id="guard-helpdesk-action"
                required
                rows={3}
                maxLength={800}
                value={actionTaken}
                onChange={(event) => setActionTaken(event.target.value)}
                placeholder="Example: Redirected vehicles to Gate 2 and informed the next gate guard."
                className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-5 text-slate-500">
              Reported by <span className="font-bold text-slate-700">{currentUser?.name || 'Signed-in guard'}</span>
              {currentUser?.badgeId ? ` · Badge ${currentUser.badgeId}` : ''}
            </p>
            <button
              type="submit"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-200"
            >
              <ShieldAlert className="h-4 w-4" />
              Submit guard report
            </button>
          </div>
        </form>

        <section aria-labelledby="guard-helpdesk-history-title" className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex items-start gap-3 border-b border-slate-100 pb-5">
            <span className="rounded-xl bg-amber-50 p-2.5 text-amber-700"><Wrench className="h-5 w-5" /></span>
            <div>
              <h3 className="text-lg font-extrabold text-slate-950" id="guard-helpdesk-history-title">Guard duty reports</h3>
              <p className="mt-1 text-sm text-slate-500">Open and resolved issues logged by the security team.</p>
            </div>
          </div>

          {incidents.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 text-center">
              <LifeBuoy className="h-9 w-9 text-slate-400" />
              <h4 className="mt-3 text-base font-bold text-slate-900">No guard reports yet</h4>
              <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500">When a guard logs a duty issue, its details and current status will be listed here.</p>
            </div>
          ) : (
            <div className="max-h-[760px] space-y-3 overflow-y-auto pr-1">
              {incidents.map((incident) => (
                <article key={`${incident.shift.id}-${incident.id}`} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase ${
                        incident.severity === 'critical' ? 'bg-rose-100 text-rose-800' :
                        incident.severity === 'high' ? 'bg-amber-100 text-amber-800' :
                        incident.severity === 'medium' ? 'bg-sky-100 text-sky-800' : 'bg-slate-100 text-slate-700'
                      }`}>{incident.severity}</span>
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                        incident.resolved ? 'bg-emerald-50 text-emerald-800' : 'bg-orange-50 text-orange-800'
                      }`}>{incident.resolved ? 'Resolved' : 'Open'}</span>
                    </div>
                    <time className="text-xs text-slate-500">{incident.date} · {incident.timestamp}</time>
                  </div>
                  <h4 className="mt-3 text-sm font-extrabold text-slate-950">{incident.title}</h4>
                  <p className="mt-1 text-xs font-semibold text-slate-500">{incident.category}</p>
                  <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">{incident.description}</p>
                  <div className="mt-3 grid gap-2 border-t border-slate-100 pt-3 text-xs sm:grid-cols-2">
                    <p className="text-slate-600"><span className="font-bold text-slate-700">Location:</span> {incident.location}</p>
                    <p className="text-slate-600"><span className="font-bold text-slate-700">Guard:</span> {incident.reportedBy}</p>
                    <p className="text-slate-600 sm:col-span-2"><span className="font-bold text-slate-700">Action taken:</span> {incident.actionTaken}</p>
                    {incident.resolved && incident.resolutionNotes && (
                      <p className="text-emerald-800 sm:col-span-2">
                        <span className="font-bold">Resolution:</span> {incident.resolutionNotes}
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </section>
  );
};
