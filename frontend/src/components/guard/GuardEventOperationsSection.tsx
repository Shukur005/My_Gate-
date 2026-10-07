import React, { useMemo } from 'react';
import { useSociety } from '../../context/SocietyContext';
import {
  AlertTriangle,
  CalendarDays,
  Car,
  ClipboardCheck,
  Clock,
  MapPin,
  PartyPopper,
  Shield,
  Users,
} from 'lucide-react';

export const GuardEventOperationsSection: React.FC = () => {
  const {
    bookings,
    amenities,
    visitors,
    notices,
    guardEventSecurityPlans,
    currentUser,
  } = useSociety();

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
  const plannedEventCount = guardEventSecurityPlans.filter(
    (plan) => plan.status === 'ready' && plan.assignedGuardIds?.length && plan.entryGate && plan.parkingArea
  ).length;
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
              Review administrator-confirmed event schedules, assigned guards, entrances, and parking instructions. Event plans are read-only for guards.
            </p>
          </div>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
          <Shield className="h-3.5 w-3.5" />
          Read-only event brief · {currentUser?.name || 'guard team'}
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
              <p><span className="font-bold">Before:</span> Follow the event schedule and entrance confirmed by the administrator.</p>
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
                      savedPlan?.status === 'ready' && savedPlan.entryGate && savedPlan.parkingArea && savedPlan.assignedGuardIds?.length
                        ? 'bg-emerald-50 text-emerald-800'
                        : 'bg-amber-50 text-amber-800'
                    }`}>
                      {savedPlan?.status === 'ready' && savedPlan.entryGate && savedPlan.parkingArea && savedPlan.assignedGuardIds?.length
                        ? 'Admin confirmed'
                        : 'Awaiting admin confirmation'}
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
                    <h5 className="text-sm font-extrabold text-slate-950">Admin-confirmed event instructions</h5>
                    {savedPlan?.status === 'ready' && savedPlan.entryGate && savedPlan.parkingArea && savedPlan.assignedGuardIds?.length ? (
                      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-xl border border-slate-200 p-3.5">
                          <dt className="text-xs font-bold text-slate-500">Approved entrance</dt>
                          <dd className="mt-1 text-sm font-bold text-slate-900">{savedPlan.entryGate}</dd>
                        </div>
                        <div className="rounded-xl border border-slate-200 p-3.5">
                          <dt className="text-xs font-bold text-slate-500">Approved parking area</dt>
                          <dd className="mt-1 text-sm font-bold text-slate-900">{savedPlan.parkingArea}</dd>
                        </div>
                        <div className="rounded-xl border border-slate-200 p-3.5">
                          <dt className="text-xs font-bold text-slate-500">Assigned guards</dt>
                          <dd className="mt-1 text-sm font-bold text-slate-900">{savedPlan.assignedGuardNames?.join(', ') || `${savedPlan.assignedGuardCount || 0} guards`}</dd>
                        </div>
                        <div className="rounded-xl border border-slate-200 p-3.5">
                          <dt className="text-xs font-bold text-slate-500">Confirmed by</dt>
                          <dd className="mt-1 text-sm font-bold text-slate-900">{savedPlan.updatedBy} · {new Date(savedPlan.updatedAt).toLocaleString()}</dd>
                        </div>
                        <div className="rounded-xl border border-slate-200 p-3.5 sm:col-span-2">
                          <dt className="text-xs font-bold text-slate-500">Guest-entry protocol</dt>
                          <dd className="mt-1 whitespace-pre-line text-sm leading-6 text-slate-700">{savedPlan.guestProtocol}</dd>
                        </div>
                        <div className="rounded-xl border border-slate-200 p-3.5 sm:col-span-2">
                          <dt className="text-xs font-bold text-slate-500">Parking protocol</dt>
                          <dd className="mt-1 whitespace-pre-line text-sm leading-6 text-slate-700">{savedPlan.parkingPlan}</dd>
                        </div>
                        {savedPlan.guardNotes && (
                          <div className="rounded-xl border border-slate-200 p-3.5 sm:col-span-2">
                            <dt className="text-xs font-bold text-slate-500">Additional instructions</dt>
                            <dd className="mt-1 whitespace-pre-line text-sm leading-6 text-slate-700">{savedPlan.guardNotes}</dd>
                          </div>
                        )}
                      </dl>
                    ) : (
                      <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                        This event is not yet confirmed by the administrator. Wait for the final entrance, parking, and guard assignment details before directing guests.
                      </p>
                    )}
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
              const savedPlan = plansByEventId.get(eventId);
              return (
                <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" key={eventId}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-800">Society event</span>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${savedPlan?.status === 'ready' && savedPlan.entryGate && savedPlan.parkingArea && savedPlan.assignedGuardIds?.length ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}>
                      {savedPlan?.status === 'ready' && savedPlan.entryGate && savedPlan.parkingArea && savedPlan.assignedGuardIds?.length ? 'Admin confirmed' : 'Awaiting admin confirmation'}
                    </span>
                  </div>
                  <h4 className="mt-3 text-lg font-extrabold text-slate-950">{notice.title}</h4>
                  <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">{notice.content}</p>
                  <p className="mt-3 text-xs text-slate-500">Organizer / publisher: {notice.author} · Notice published {notice.date}</p>
                  {savedPlan?.status === 'ready' && savedPlan.entryGate && savedPlan.parkingArea && savedPlan.assignedGuardIds?.length ? (
                    <dl className="mt-5 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2">
                      <div className="rounded-xl border border-slate-200 p-4">
                        <dt className="text-xs font-bold text-slate-700">Approved entrance</dt>
                        <dd className="mt-2 text-sm font-semibold text-slate-900">{savedPlan.entryGate}</dd>
                      </div>
                      <div className="rounded-xl border border-slate-200 p-4">
                        <dt className="text-xs font-bold text-slate-700">Approved parking area</dt>
                        <dd className="mt-2 text-sm font-semibold text-slate-900">{savedPlan.parkingArea}</dd>
                      </div>
                      <div className="rounded-xl bg-violet-50 p-4">
                        <dt className="flex items-center gap-2 text-xs font-bold text-violet-900"><Users className="h-4 w-4" /> Guards assigned</dt>
                        <dd className="mt-2 text-sm font-extrabold text-violet-950">{savedPlan.assignedGuardNames?.join(', ') || `${savedPlan.assignedGuardCount || 0} guards`}</dd>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-4">
                        <dt className="flex items-center gap-2 text-xs font-bold text-slate-700"><ClipboardCheck className="h-4 w-4" /> Plan updated</dt>
                        <dd className="mt-2 text-sm font-semibold text-slate-900">{savedPlan.updatedBy} · {new Date(savedPlan.updatedAt).toLocaleString()}</dd>
                      </div>
                      <div className="rounded-xl border border-slate-200 p-4">
                        <dt className="text-xs font-bold text-slate-700">Guest-entry protocol</dt>
                        <dd className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">{savedPlan.guestProtocol}</dd>
                      </div>
                      <div className="rounded-xl border border-slate-200 p-4">
                        <dt className="flex items-center gap-2 text-xs font-bold text-slate-700"><Car className="h-4 w-4" /> Parking protocol</dt>
                        <dd className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">{savedPlan.parkingPlan}</dd>
                      </div>
                      {savedPlan.guardNotes && (
                        <div className="rounded-xl border border-slate-200 p-4 sm:col-span-2">
                          <dt className="text-xs font-bold text-slate-700">Additional guard instructions</dt>
                          <dd className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">{savedPlan.guardNotes}</dd>
                        </div>
                      )}
                    </dl>
                  ) : (
                    <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-900">
                      The administrator has not confirmed the guard assignment, entrance, and parking details yet. Wait for final confirmation before directing guests.
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </section>
  );
};
