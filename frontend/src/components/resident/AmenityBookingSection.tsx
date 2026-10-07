import React, { useState } from 'react';
import { useSociety } from '../../context/SocietyContext';
import { Amenity, AmenityBooking } from '../../types';
import {
  Calendar as CalendarIcon,
  Clock,
  Users,
  MapPin,
  CheckCircle2,
  XCircle,
  Download,
  Filter,
  Search,
  Sparkles,
  ShieldCheck,
  QrCode,
  Printer,
  ChevronRight,
  Info,
  Dumbbell,
  Trophy,
  PartyPopper,
  Briefcase,
  Waves,
  X,
  CreditCard,
} from 'lucide-react';

export const AmenityBookingSection: React.FC = () => {
  const { amenities, bookings, bookAmenity, cancelBooking, activeFlat, flats } = useSociety();

  const currentFlatObj = flats.find((f) => f.flatNumber === activeFlat) || flats[0];

  // Filters & State
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const dayAfterStr = new Date(Date.now() + 172800000).toISOString().split('T')[0];

  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Booking Modal State
  const [bookingModalAmenity, setBookingModalAmenity] = useState<Amenity | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [guestsCount, setGuestsCount] = useState<number>(1);
  const [purposeNote, setPurposeNote] = useState<string>('');
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Success Pass Modal State
  const [viewPassBooking, setViewPassBooking] = useState<AmenityBooking | null>(null);
  const [bookingMessage, setBookingMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Categories list
  const categories = ['All', 'Fitness', 'Sports', 'Events', 'Leisure', 'Work'];

  // Filtered Amenities
  const filteredAmenities = amenities.filter((am) => {
    const matchesCat = selectedCategory === 'All' || am.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      am.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      am.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      am.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Filtered My Bookings for Active Flat
  const myBookings = bookings.filter((b) => b.flatNumber === activeFlat);

  // Helper to check slot booking status
  const getSlotStatus = (amenityId: string, slot: string, date: string) => {
    const existing = bookings.find(
      (b) => b.amenityId === amenityId && b.date === date && b.timeSlot === slot && b.status === 'confirmed'
    );
    if (existing) {
      return {
        isBooked: true,
        bookedByFlat: existing.flatNumber,
        isMyBooking: existing.flatNumber === activeFlat,
        bookingId: existing.id,
      };
    }
    return { isBooked: false };
  };

  // Open booking modal for a slot
  const handleOpenBookingModal = (amenity: Amenity, slot?: string) => {
    setBookingModalAmenity(amenity);
    setSelectedSlot(slot || amenity.availableSlots[0] || '');
    setGuestsCount(1);
    setPurposeNote('');
    setBookingError(null);
  };

  // Confirm Amenity Booking
  const handleConfirmBooking = () => {
    if (!bookingModalAmenity || !selectedSlot) {
      setBookingError('Please select an available time slot.');
      return;
    }

    if (guestsCount < 1 || guestsCount > bookingModalAmenity.maxCapacity) {
      setBookingError(`Guest count must be between 1 and ${bookingModalAmenity.maxCapacity}.`);
      return;
    }

    const result = bookAmenity(bookingModalAmenity.id, selectedDate, selectedSlot, guestsCount);

    if (result.success) {
      setBookingMessage({ type: 'success', text: result.message });
      
      // Find the created booking to show pass
      const newlyCreated = bookings.find(
        (b) =>
          b.amenityId === bookingModalAmenity.id &&
          b.date === selectedDate &&
          b.timeSlot === selectedSlot &&
          b.flatNumber === activeFlat
      );

      if (newlyCreated) {
        setViewPassBooking(newlyCreated);
      }
      setBookingModalAmenity(null);
    } else {
      setBookingError(result.message);
    }
  };

  // Function to print / download HTML pass
  const handleDownloadFacilityPass = (bk: AmenityBooking) => {
    const am = amenities.find((a) => a.id === bk.amenityId);
    const passHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Facility Entry Pass - ${bk.amenityName}</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f8fafc; padding: 30px 15px; color: #0f172a; }
    .card { max-width: 550px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #059669 0%, #047857 100%); color: #ffffff; padding: 24px; text-align: center; }
    .title { font-size: 20px; font-weight: 800; }
    .subtitle { font-size: 11px; opacity: 0.9; margin-top: 4px; }
    .body { padding: 24px; }
    .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; background: #f8fafc; padding: 16px; border-radius: 12px; margin-bottom: 20px; }
    .item label { font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; }
    .item p { font-size: 13px; font-weight: 700; color: #0f172a; margin-top: 2px; }
    .qr-box { text-align: center; padding: 16px; background: #f1f5f9; border-radius: 12px; margin-bottom: 20px; }
    .code { font-family: monospace; font-size: 22px; font-weight: 900; color: #059669; letter-spacing: 2px; }
    .footer { text-align: center; font-size: 11px; color: #64748b; border-top: 1px dashed #e2e8f0; padding-top: 16px; }
    .btn { background: #059669; color: white; border: none; padding: 10px 20px; font-weight: 700; border-radius: 8px; cursor: pointer; margin-bottom: 15px; }
    @media print { .no-print { display: none; } }
  </style>
</head>
<body>
  <div style="text-align: center;" class="no-print">
    <button class="btn" onclick="window.print()">🖨️ Print / Save Facility Pass PDF</button>
  </div>
  <div class="card">
    <div class="header">
      <div class="title">Emerald Palms CHS • Facility Entry Pass</div>
      <div class="subtitle">Official Verified Booking Confirmation</div>
    </div>
    <div class="body">
      <div class="qr-box">
        <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">Facility Pass Verification Code</div>
        <div class="code">${bk.id}</div>
        <div style="font-size: 10px; color: #059669; margin-top: 4px; font-weight: bold;">✓ STATUS: CONFIRMED & PAID</div>
      </div>
      <div class="grid">
        <div class="item"><label>Facility Name</label><p>${bk.amenityName}</p></div>
        <div class="item"><label>Location</label><p>${am?.location || 'Clubhouse Complex'}</p></div>
        <div class="item"><label>Booking Date</label><p>${bk.date}</p></div>
        <div class="item"><label>Allocated Time Slot</label><p>${bk.timeSlot}</p></div>
        <div class="item"><label>Flat Unit & Resident</label><p>Flat ${bk.flatNumber} • ${bk.residentName}</p></div>
        <div class="item"><label>Pass Guests Count</label><p>${bk.guestsCount} Person(s)</p></div>
      </div>
      <div class="footer">
        Please present this pass or verification code to the facility manager or security officer prior to entering.<br>
        Emerald Palms Society Management Suite
      </div>
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([passHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Facility_Pass_${bk.amenityName.replace(/\s+/g, '_')}_${bk.date}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    const win = window.open('', '_blank');
    if (win) {
      win.document.write(passHtml);
      win.document.close();
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'fitness':
        return <Dumbbell className="w-4 h-4 text-emerald-600" />;
      case 'sports':
        return <Trophy className="w-4 h-4 text-emerald-600" />;
      case 'events':
        return <PartyPopper className="w-4 h-4 text-emerald-600" />;
      case 'leisure':
        return <Waves className="w-4 h-4 text-emerald-600" />;
      case 'work':
        return <Briefcase className="w-4 h-4 text-emerald-600" />;
      default:
        return <Sparkles className="w-4 h-4 text-emerald-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Alert Notifications */}
      {bookingMessage && (
        <div
          className={`p-4 rounded-xl border text-xs font-bold flex items-center justify-between shadow-xs ${
            bookingMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-rose-50 text-rose-900 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {bookingMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{bookingMessage.text}</span>
          </div>
          <button onClick={() => setBookingMessage(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Date & Category Navigation Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Quick Date Selector */}
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-2">
              Select Booking Date
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setSelectedDate(todayStr)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  selectedDate === todayStr
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <CalendarIcon className="w-3.5 h-3.5" />
                <span>Today ({todayStr.slice(5)})</span>
              </button>

              <button
                onClick={() => setSelectedDate(tomorrowStr)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  selectedDate === tomorrowStr
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <CalendarIcon className="w-3.5 h-3.5" />
                <span>Tomorrow ({tomorrowStr.slice(5)})</span>
              </button>

              <button
                onClick={() => setSelectedDate(dayAfterStr)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  selectedDate === dayAfterStr
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <CalendarIcon className="w-3.5 h-3.5" />
                <span>{dayAfterStr.slice(5)}</span>
              </button>

              <div className="relative">
                <input
                  type="date"
                  value={selectedDate}
                  min={todayStr}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative w-full lg:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Gym, Pool, Tennis..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Categories Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-2 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1 mr-2 shrink-0">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-emerald-400 shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Facilities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAmenities.map((am) => (
          <div
            key={am.id}
            className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-emerald-300 hover:shadow-lg transition-all group"
          >
            <div>
              {/* Image & Price Header */}
              <div className="h-44 relative overflow-hidden bg-slate-900">
                <img
                  src={am.image}
                  alt={am.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                <span className="absolute top-3 right-3 bg-emerald-500 text-slate-950 font-black text-xs px-3 py-1 rounded-full shadow-md">
                  ₹{am.hourlyRate} / slot
                </span>

                <span className="absolute bottom-3 left-3 bg-slate-900/90 text-emerald-300 text-[11px] font-bold px-2.5 py-0.5 rounded-md backdrop-blur-xs flex items-center gap-1">
                  {getCategoryIcon(am.category)}
                  <span>{am.category}</span>
                </span>
              </div>

              {/* Info Body */}
              <div className="p-5 space-y-3">
                <div>
                  <h4 className="text-base font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {am.name}
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">{am.description}</p>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
                  <span className="flex items-center gap-1 font-semibold text-slate-600">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    {am.location}
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-slate-600">
                    <Users className="w-3.5 h-3.5 text-emerald-600" />
                    Max {am.maxCapacity} people
                  </span>
                </div>

                {/* Available Time Slots for Selected Date */}
                <div className="pt-2">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 block mb-2">
                    Available Slots for {selectedDate}
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {am.availableSlots.map((slot) => {
                      const status = getSlotStatus(am.id, slot, selectedDate);
                      return (
                        <button
                          key={slot}
                          disabled={status.isBooked}
                          onClick={() => handleOpenBookingModal(am, slot)}
                          className={`px-2 py-1.5 rounded-lg text-[11px] font-bold transition-all text-center flex items-center justify-center gap-1 ${
                            status.isBooked
                              ? status.isMyBooking
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-default'
                                : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed line-through'
                              : 'bg-emerald-50 hover:bg-emerald-600 text-emerald-800 hover:text-white border border-emerald-200 hover:border-emerald-600 shadow-xs'
                          }`}
                        >
                          <Clock className="w-3 h-3 shrink-0" />
                          <span className="truncate">{slot}</span>
                          {status.isBooked && (
                            <span className="text-[9px] font-black uppercase text-slate-500 ml-0.5">
                              ({status.bookedByFlat})
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action Footer */}
            <div className="p-5 pt-0">
              <button
                onClick={() => handleOpenBookingModal(am)}
                className="w-full bg-slate-900 hover:bg-emerald-600 text-white font-extrabold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95"
              >
                <CalendarIcon className="w-4 h-4 text-emerald-400" />
                <span>Book Facility Slot</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* My Active Facility Bookings */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                My Facility Bookings ({myBookings.length})
              </h3>
              <p className="text-xs text-slate-500">Active and past facility slots reserved for Flat {activeFlat}</p>
            </div>
          </div>
        </div>

        {myBookings.length === 0 ? (
          <div className="text-center py-8 text-slate-400 space-y-2">
            <CalendarIcon className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-xs font-semibold">No active bookings recorded for Flat {activeFlat}.</p>
            <p className="text-[11px]">Select a facility above to reserve a time slot instantly.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myBookings.map((bk) => {
              const amObj = amenities.find((a) => a.id === bk.amenityId);
              return (
                <div
                  key={bk.id}
                  className="bg-slate-50 p-4 rounded-2xl border border-slate-200 hover:border-emerald-300 transition-all flex flex-col justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 font-extrabold px-2.5 py-0.5 rounded-full text-[10px]">
                        Pass ID: {bk.id}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          bk.status === 'confirmed'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-rose-100 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {bk.status}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-slate-900 text-sm">{bk.amenityName}</h4>
                    <p className="text-slate-500 text-xs mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      {amObj?.location || 'Clubhouse Area'}
                    </p>

                    <div className="mt-3 bg-white p-3 rounded-xl border border-slate-200/80 space-y-1">
                      <div className="flex justify-between text-slate-600 font-medium">
                        <span>Reserved Date:</span>
                        <span className="font-bold text-slate-900">{bk.date}</span>
                      </div>
                      <div className="flex justify-between text-slate-600 font-medium">
                        <span>Time Slot:</span>
                        <span className="font-bold text-emerald-700">{bk.timeSlot}</span>
                      </div>
                      <div className="flex justify-between text-slate-600 font-medium">
                        <span>Guests & Total Paid:</span>
                        <span className="font-bold text-slate-900">
                          {bk.guestsCount} Guests • ₹{bk.amountPaid}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                    <button
                      onClick={() => handleDownloadFacilityPass(bk)}
                      className="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 border border-emerald-200 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Download Pass</span>
                    </button>

                    {bk.status === 'confirmed' && (
                      <button
                        onClick={() => {
                          if (confirm(`Cancel booking for ${bk.amenityName} on ${bk.date}?`)) {
                            cancelBooking(bk.id);
                          }
                        }}
                        className="bg-white hover:bg-rose-50 text-rose-600 font-semibold px-3 py-2 rounded-xl text-xs border border-slate-200 hover:border-rose-300 transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* BOOKING MODAL */}
      {bookingModalAmenity && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 space-y-0">
            {/* Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500 text-slate-950 rounded-xl font-bold">
                  <CalendarIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">{bookingModalAmenity.name}</h3>
                  <p className="text-xs text-slate-400">Flat {activeFlat} Facility Reservation</p>
                </div>
              </div>
              <button
                onClick={() => setBookingModalAmenity(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {bookingError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-bold flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{bookingError}</span>
                </div>
              )}

              {/* Facility Details card */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center gap-3">
                <img
                  src={bookingModalAmenity.image}
                  alt={bookingModalAmenity.name}
                  className="w-16 h-16 rounded-xl object-cover shrink-0"
                />
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">{bookingModalAmenity.location}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{bookingModalAmenity.description}</p>
                  <span className="inline-block mt-1 text-[11px] font-extrabold text-emerald-700">
                    Rate: ₹{bookingModalAmenity.hourlyRate} per slot
                  </span>
                </div>
              </div>

              {/* Select Date */}
              <div>
                <label className="text-xs font-extrabold text-slate-700 block mb-1">Select Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  min={todayStr}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              {/* Time Slots Selector */}
              <div>
                <label className="text-xs font-extrabold text-slate-700 block mb-1.5">
                  Choose Available Time Slot
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {bookingModalAmenity.availableSlots.map((slot) => {
                    const status = getSlotStatus(bookingModalAmenity.id, slot, selectedDate);
                    const isSelected = selectedSlot === slot;
                    return (
                      <button
                        key={slot}
                        disabled={status.isBooked}
                        onClick={() => setSelectedSlot(slot)}
                        className={`p-2.5 rounded-xl text-xs font-bold transition-all border text-center flex items-center justify-between ${
                          status.isBooked
                            ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through'
                            : isSelected
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-emerald-50 hover:border-emerald-300'
                        }`}
                      >
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {slot}
                        </span>
                        {status.isBooked ? (
                          <span className="text-[9px] uppercase font-black">Booked</span>
                        ) : (
                          isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Guest Count */}
              <div>
                <label className="text-xs font-extrabold text-slate-700 block mb-1">
                  Number of Attendees / Guests
                </label>
                <input
                  type="number"
                  min="1"
                  max={bookingModalAmenity.maxCapacity}
                  value={guestsCount}
                  onChange={(e) => setGuestsCount(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Max capacity for this facility is {bookingModalAmenity.maxCapacity} persons.
                </span>
              </div>

              {/* Summary Box */}
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl space-y-1.5 text-xs">
                <div className="flex justify-between font-medium text-emerald-900">
                  <span>Slot Base Fee:</span>
                  <span className="font-bold">₹{bookingModalAmenity.hourlyRate}</span>
                </div>
                <div className="flex justify-between font-medium text-emerald-900">
                  <span>GST & Service Charge:</span>
                  <span className="font-bold">₹0 (Inclusive)</span>
                </div>
                <div className="flex justify-between font-extrabold text-slate-900 text-sm pt-2 border-t border-emerald-200">
                  <span>Total Payable:</span>
                  <span className="text-emerald-700 text-base">₹{bookingModalAmenity.hourlyRate}</span>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-5 bg-slate-50 border-t border-slate-100 flex gap-3">
              <button
                type="button"
                onClick={() => setBookingModalAmenity(null)}
                className="flex-1 bg-white hover:bg-slate-100 text-slate-700 font-bold py-3 px-4 rounded-xl text-xs border border-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmBooking}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
              >
                <CreditCard className="w-4 h-4" />
                <span>Confirm & Reserve Slot</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS ENTRY PASS MODAL */}
      {viewPassBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 text-center p-6 space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                Booking Confirmed!
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-1">{viewPassBooking.amenityName}</h3>
              <p className="text-xs text-slate-500 mt-0.5">Facility entry pass issued for Flat {viewPassBooking.flatNumber}</p>
            </div>

            <div className="bg-slate-50 border-2 border-dashed border-emerald-300 p-4 rounded-2xl space-y-2">
              <div className="text-[11px] text-slate-500 font-bold">Entry Pass Verification Code</div>
              <div className="text-3xl font-mono font-black text-emerald-700 tracking-widest">
                {viewPassBooking.id}
              </div>
              <div className="text-[11px] text-slate-500">
                Date: <strong className="text-slate-800">{viewPassBooking.date}</strong> • Slot:{' '}
                <strong className="text-slate-800">{viewPassBooking.timeSlot}</strong>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setViewPassBooking(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-3 rounded-xl text-xs"
              >
                Close
              </button>
              <button
                onClick={() => handleDownloadFacilityPass(viewPassBooking)}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md"
              >
                <Download className="w-4 h-4" />
                <span>Download Pass</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
