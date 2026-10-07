import React, { useMemo, useState } from 'react';
import { useSociety } from '../../context/SocietyContext';
import { GuardEventSecurityPlan } from '../../types';
import {
  AlertTriangle,
  CalendarDays,
  Car,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  MapPin,
  PartyPopper,
  Save,
  Shield,
  Users,
} from 'lucide-react';

type EventPlanDraft = Pick<GuardEventSecurityPlan, 'guestProtocol' | 'parkingPlan' | 'guardNotes' | 'status'>;

const emptyDraft: EventPlanDraft = {
  guestProtocol: '',
  parkingPlan: '',
  guardNotes: '',
  status: 'planning',
};

export const GuardEventOperationsSection: React.FC = () => {
  const {
    bookings,
    amenities,
    visitors,
    notices,
    guardEventSecurityPlans,
    saveGuardEventSecurityPlan,
    currentUser,
  } = useSociety();
  const [drafts, setDrafts] = useState<Record<string, EventPlanDraft>>({});
  const [feedback, setFeedback] = useState<{ eventId: string; message: string; success: boolean } | null>(null);

  const plansByEventId = useMemo(
    () => new Map(guardEventSecurityPlans.map((plan) => [plan.eventId, plan])),
    [guardEventSecurityPlans]
  );
  const today = new Date().toISOString().split('T')[0];
  const upcomingBookings = bookings
    .filter((booking) => booking.status === 'confirmed' && booking.date >= today)
    .sort((a, b) => `${a.date} ${a.timeSlot}`.localeCompare(`${b.date} ${b.timeSlot}`));
  const communityEvents = notices
    .filter((notice) => notice.category === 'Event')
    .sort((a, b) => b.date.localeCompare(a.date));
  const allEvents = upcomingBookings.length + communityEvents.length;
  const plannedEventCount = guardEventSecurityPlans.filter((plan) => plan.status === 'ready').length;
  const guestPassCount = upcomingBookings.reduce(
    (total, booking) => total + visitors.filter(
      (visitor) =>
        visitor.flatNumber === booking.flatNumber &&
        visitor.expectedDate === booking.date &&
        visitor.category === 'guest' &&
        visitor.status !== 'denied' &&
        visitor.status !== 'checked_out'
    ).length,
    0
  );

  const getDraft = (eventId: string): EventPlanDraft => {
    const draft = drafts[eventId];
    if (draft) return draft;
    const saved = plansByEventId.get(eventId);
    if (!saved) return emptyDraft;
    return {
      guestProtocol: saved.guestProtocol,
      parkingPlan: saved.parkingPlan,
      guardNotes: saved.guardNotes,
      status: saved.status,
    };
  };

  const updateDraft = (eventId: string, changes: Partial<EventPlanDraft>) => {
    setDrafts((previous) => {
      const existingDraft = previous[eventId];
      const saved = plansByEventId.get(eventId);
      const currentDraft = existingDraft || (saved
        ? {
            guestProtocol: saved.guestProtocol,
            parkingPlan: saved.parkingPlan,
            guardNotes: saved.guardNotes,
            status: saved.status,
          }
        : emptyDraft);
      return {
        ...previous,
        [eventId]: { ...currentDraft, ...changes },
      };
    });
    setFeedback(null);
  };

  const savePlan = (eventId: string) => {
    const result = saveGuardEventSecurityPlan({ eventId, ...getDraft(eventId) });
    setFeedback({ eventId, message: result.message, success: result.success });
  };

  return (
    <section aria-labelledby="guard-events-title" className="w-full space-y-6">
      <header className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-violet-50 p-3 text-violet-700">
            <CalendarDays className="h-7 w-7" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-700">Security event operations</p>
            <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950" id="guard-events-title">
              Community Events & Guard Protocols
            </h2>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
              Review confirmed amenity bookings and society event announcements. Guards can set guest-entry and vehicle-parking procedures for each event.
            </p>
          </div>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
          <Shield className="h-3.5 w-3.5" />
          Security planning by {currentUser?.name || 'guard team'}
        </span>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Upcoming amenity events', value: upcomingBookings.length, icon: CalendarDays },
          { label: 'Society event notices', value: communityEvents.length, icon: PartyPopper },
          { label: 'Guest passes for bookings', value: guestPassCount, icon: Users },
          { label: 'Plans marked ready', value: plannedEventCount, icon: ClipboardCheck },
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

      <div className="rounded-2xl border border-sky-200 bg-sky-50/70 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-sky-700" />
          <div>
            <h3 className="text-sm font-extrabold text-sky-950">Event-day guard checklist</h3>
            <div className="mt-3 grid gap-3 text-sm leading-6 text-sky-900 md:grid-cols-2 xl:grid-cols-4">
              <p><span className="font-bold">Before:</span> Confirm the event time, gate, host flat, and the saved security plan.</p>
              <p><span className="font-bold">Guests:</span> Verify each visitor against the resident pass and record entry using gate operations.</p>
              <p><span className="font-bold">Vehicles:</span> Follow the event parking arrangement and keep emergency/fire access clear.</p>
              <p><span className="font-bold">Handover:</span> Share unresolved guest or parking issues with the next gate guard.</p>
            </div>
          </div>
        </div>
      </div>

      <section aria-labelledby="amenity-events-title" className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-xl font-extrabold text-slate-950" id="amenity-events-title">Upcoming amenity bookings</h3>
            <p className="mt-1 text-sm text-slate-500">Confirmed resident bookings are listed as scheduled event operations.</p>
          </div>
          <span className="text-sm font-semibold text-slate-500">{upcomingBookings.length} upcoming</span>
        </div>

        {upcomingBookings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
            <CalendarDays className="mx-auto h-8 w-8 text-slate-400" />
            <h4 className="mt-3 text-base font-bold text-slate-900">No upcoming amenity bookings</h4>
            <p className="mt-1 text-sm text-slate-500">Confirmed resident bookings will appear here for guard planning.</p>
          </div>
        ) : (
          <div className="grid gap-5 2xl:grid-cols-2">
            {upcomingBookings.map((booking) => {
              const eventId = `booking:${booking.id}`;
              const amenity = amenities.find((item) => item.id === booking.amenityId);
              const guestPasses = visitors.filter(
                (visitor) =>
                  visitor.flatNumber === booking.flatNumber &&
                  visitor.expectedDate === booking.date &&
                  visitor.category === 'guest' &&
                  visitor.status !== 'denied' &&
                  visitor.status !== 'checked_out'
              );
              const draft = getDraft(eventId);
              const savedPlan = plansByEventId.get(eventId);
              const availableVehicles = guestPasses.filter((pass) => pass.vehicleNumber);

              return (
                <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" key={eventId}>
                  <div className="flex flex-col gap-4 border-b border-slate-100 bg-slate-50 p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
                    <div className="flex items-start gap-3">
                      <span className="rounded-xl bg-violet-100 p-2.5 text-violet-800"><PartyPopper className="h-5 w-5" /></span>
                      <div>
                        <h4 className="text-lg font-extrabold text-slate-950">{booking.amenityName}</h4>
                        <p className="mt-1 text-sm font-semibold text-slate-600">{booking.residentName} · Flat {booking.flatNumber}</p>
                        <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                          <MapPin className="h-3.5 w-3.5" /> {amenity?.location || 'Location not recorded'}
                        </p>
                      </div>
                    </div>
                    <span className={`w-fit rounded-full px-3 py-1.5 text-xs font-bold ${
                      savedPlan?.status === 'ready' ? 'bg-emerald-50 text-emerald-800' :
                      savedPlan?.status === 'completed' ? 'bg-slate-200 text-slate-700' : 'bg-amber-50 text-amber-800'
                    }`}>
                      {savedPlan?.status === 'ready' ? 'Plan ready' : savedPlan?.status === 'completed' ? 'Completed' : 'Planning needed'}
                    </span>
                  </div>

                  <div className="grid gap-3 p-5 sm:grid-cols-3 sm:p-6">
                    <div className="rounded-xl border border-slate-200 p-3.5">
                      <p className="flex items-center gap-2 text-xs font-semibold text-slate-500"><CalendarDays className="h-4 w-4" /> Date</p>
                      <p className="mt-2 text-sm font-bold text-slate-900">{booking.date}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 p-3.5">
                      <p className="flex items-center gap-2 text-xs font-semibold text-slate-500"><Clock className="h-4 w-4" /> Reserved time</p>
                      <p className="mt-2 text-sm font-bold text-slate-900">{booking.timeSlot}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 p-3.5">
                      <p className="flex items-center gap-2 text-xs font-semibold text-slate-500"><Users className="h-4 w-4" /> Expected guests</p>
                      <p className="mt-2 text-sm font-bold text-slate-900">{booking.guestsCount}</p>
                    </div>
                  </div>

                  <div className="mx-5 mb-5 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:mx-6 sm:mb-6">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h5 className="text-sm font-extrabold text-slate-900">Visitor passes for this flat and date</h5>
                      <span className="text-xs font-semibold text-slate-500">{guestPasses.length} matching guest pass{guestPasses.length === 1 ? '' : 'es'}</span>
                    </div>
                    {guestPasses.length > 0 ? (
                      <ul className="mt-3 grid gap-2 md:grid-cols-2">
                        {guestPasses.map((pass) => (
                          <li className="flex items-start justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3" key={pass.id}>
                            <div>
                              <p className="text-sm font-bold text-slate-900">{pass.visitorName}</p>
                              <p className="mt-0.5 text-xs text-slate-500">{pass.status.replace('_', ' ')}</p>
                            </div>
                            {pass.vehicleNumber && (
                              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700">
                                <Car className="h-3.5 w-3.5" /> {pass.vehicleNumber}
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-2 text-sm text-slate-500">No matching visitor passes are recorded yet. Verify guests at the gate before entry.</p>
                    )}
                    {availableVehicles.length > 0 && (
                      <p className="mt-3 text-xs leading-5 text-slate-500">
                        Vehicle numbers are from the matching visitor passes. Use the plan below to record where event vehicles should be directed.
                      </p>
                    )}
                  </div>

                  <div className="border-t border-slate-100 p-5 sm:p-6">
                    <h5 className="text-sm font-extrabold text-slate-950">Guard-managed event security plan</h5>
                    <p className="mt-1 text-xs leading-5 text-slate-500">Set entry checks, guest handling, and parking instructions for this booking.</p>
                    <div className="mt-4 grid gap-4 lg:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700" htmlFor={`${eventId}-guest-protocol`}>Guest-entry protocol</label>
                        <textarea
                          id={`${eventId}-guest-protocol`}
                          rows={3}
                          maxLength={800}
                          required
                          value={draft.guestProtocol}
                          onChange={(event) => updateDraft(eventId, { guestProtocol: event.target.value })}
                          placeholder="Example: Verify each guest pass, confirm host flat, and direct visitors to the clubhouse."
                          className="w-full resize-y rounded-xl border border-slate-300 px-3.5 py-3 text-sm leading-5 text-slate-900 outline-none focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700" htmlFor={`${eventId}-parking-plan`}>Vehicle & parking plan</label>
                        <textarea
                          id={`${eventId}-parking-plan`}
                          rows={3}
                          maxLength={800}
                          required
                          value={draft.parkingPlan}
                          onChange={(event) => updateDraft(eventId, { parkingPlan: event.target.value })}
                          placeholder="Example: Direct approved guest vehicles to the marked visitor bays; keep fire lanes clear."
                          className="w-full resize-y rounded-xl border border-slate-300 px-3.5 py-3 text-sm leading-5 text-slate-900 outline-none focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                        />
                      </div>
                      <div className="space-y-2 lg:col-span-2">
                        <label className="text-xs font-bold text-slate-700" htmlFor={`${eventId}-guard-notes`}>Guard coordination notes <span className="font-normal text-slate-400">(optional)</span></label>
                        <textarea
                          id={`${eventId}-guard-notes`}
                          rows={2}
                          maxLength={500}
                          value={draft.guardNotes}
                          onChange={(event) => updateDraft(eventId, { guardNotes: event.target.value })}
                          placeholder="Record gate handover details or the guard position needed during the event."
                          className="w-full resize-y rounded-xl border border-slate-300 px-3.5 py-3 text-sm leading-5 text-slate-900 outline-none focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                        />
                      </div>
                      <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-end sm:justify-between lg:col-span-2">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-700" htmlFor={`${eventId}-plan-status`}>Plan status</label>
                          <select
                            id={`${eventId}-plan-status`}
                            value={draft.status}
                            onChange={(event) => updateDraft(eventId, { status: event.target.value as EventPlanDraft['status'] })}
                            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-4 focus:ring-slate-100 sm:w-56"
                          >
                            <option value="planning">Planning needed</option>
                            <option value="ready">Ready for event</option>
                            <option value="completed">Event completed</option>
                          </select>
                        </div>
                        <div className="flex flex-col items-stretch gap-2 sm:items-end">
                          {feedback?.eventId === eventId && (
                            <p className={`text-xs font-semibold ${feedback.success ? 'text-emerald-700' : 'text-rose-700'}`} role={feedback.success ? 'status' : 'alert'}>
                              {feedback.message}
                            </p>
                          )}
                          {savedPlan && (
                            <p className="text-xs text-slate-400">Last updated by {savedPlan.updatedBy} · {new Date(savedPlan.updatedAt).toLocaleString()}</p>
                          )}
                          <button
                            type="button"
                            onClick={() => savePlan(eventId)}
                            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-200"
                          >
                            <Save className="h-4 w-4" />
                            Save event plan
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section aria-labelledby="society-events-title" className="space-y-4">
        <div>
          <h3 className="text-xl font-extrabold text-slate-950" id="society-events-title">Society-wide event announcements</h3>
          <p className="mt-1 text-sm text-slate-500">Community events published by management; verify event timing and operations with the organizer.</p>
        </div>
        {communityEvents.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-8 text-center">
            <PartyPopper className="mx-auto h-7 w-7 text-slate-400" />
            <p className="mt-2 text-sm font-semibold text-slate-600">No society event notices are currently published.</p>
          </div>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {communityEvents.map((notice) => {
              const eventId = `notice:${notice.id}`;
              const draft = getDraft(eventId);
              const savedPlan = plansByEventId.get(eventId);
              return (
                <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" key={eventId}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-800">Society event</span>
                    <span className="text-xs text-slate-500">Notice published {notice.date}</span>
                  </div>
                  <h4 className="mt-3 text-lg font-extrabold text-slate-950">{notice.title}</h4>
                  <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">{notice.content}</p>
                  <p className="mt-3 text-xs text-slate-500">Organizer / publisher: {notice.author}</p>
                  <div className="mt-5 grid gap-4 border-t border-slate-100 pt-5 lg:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700" htmlFor={`${eventId}-guest-protocol`}>Guest-entry protocol</label>
                      <textarea
                        id={`${eventId}-guest-protocol`}
                        rows={3}
                        maxLength={800}
                        required
                        value={draft.guestProtocol}
                        onChange={(event) => updateDraft(eventId, { guestProtocol: event.target.value })}
                        placeholder="Set guest verification and entry instructions for the event."
                        className="w-full resize-y rounded-xl border border-slate-300 px-3.5 py-3 text-sm leading-5 text-slate-900 outline-none focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700" htmlFor={`${eventId}-parking-plan`}>Vehicle & parking plan</label>
                      <textarea
                        id={`${eventId}-parking-plan`}
                        rows={3}
                        maxLength={800}
                        required
                        value={draft.parkingPlan}
                        onChange={(event) => updateDraft(eventId, { parkingPlan: event.target.value })}
                        placeholder="Set where approved event vehicles should park and access routes to keep clear."
                        className="w-full resize-y rounded-xl border border-slate-300 px-3.5 py-3 text-sm leading-5 text-slate-900 outline-none focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                      />
                    </div>
                    <div className="space-y-2 lg:col-span-2">
                      <label className="text-xs font-bold text-slate-700" htmlFor={`${eventId}-guard-notes`}>Guard coordination notes <span className="font-normal text-slate-400">(optional)</span></label>
                      <textarea
                        id={`${eventId}-guard-notes`}
                        rows={2}
                        maxLength={500}
                        value={draft.guardNotes}
                        onChange={(event) => updateDraft(eventId, { guardNotes: event.target.value })}
                        placeholder="Add deployment or handover notes."
                        className="w-full resize-y rounded-xl border border-slate-300 px-3.5 py-3 text-sm leading-5 text-slate-900 outline-none focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                      />
                    </div>
                    <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-end sm:justify-between lg:col-span-2">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700" htmlFor={`${eventId}-plan-status`}>Plan status</label>
                        <select
                          id={`${eventId}-plan-status`}
                          value={draft.status}
                          onChange={(event) => updateDraft(eventId, { status: event.target.value as EventPlanDraft['status'] })}
                          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-4 focus:ring-slate-100 sm:w-56"
                        >
                          <option value="planning">Planning needed</option>
                          <option value="ready">Ready for event</option>
                          <option value="completed">Event completed</option>
                        </select>
                      </div>
                      <div className="flex flex-col items-stretch gap-2 sm:items-end">
                        {feedback?.eventId === eventId && (
                          <p className={`text-xs font-semibold ${feedback.success ? 'text-emerald-700' : 'text-rose-700'}`} role={feedback.success ? 'status' : 'alert'}>
                            {feedback.message}
                          </p>
                        )}
                        {savedPlan && <p className="text-xs text-slate-400">Updated by {savedPlan.updatedBy}</p>}
                        <button
                          type="button"
                          onClick={() => savePlan(eventId)}
                          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-200"
                        >
                          <Save className="h-4 w-4" />
                          Save event plan
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </section>
  );
};
