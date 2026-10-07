import React, { useState, useEffect } from 'react';
import { useSociety } from '../../context/SocietyContext';
import { MaintenanceBill, VisitorCategory, VisitorPass } from '../../types';
import { PreApproveModal } from './PreApproveModal';
import { PayBillModal } from './PayBillModal';
import { ResidentSettingsModal } from './ResidentSettingsModal';
import { QRPassDetailsModal } from './QRPassDetailsModal';
import { PanicAlertModal } from './PanicAlertModal';
import { VisitorHistoryLog } from './VisitorHistoryLog';
import { AmenityBookingSection } from './AmenityBookingSection';
import { DomesticWorkerPassSection } from './DomesticWorkerPassSection';
import { downloadBillReceipt } from '../../utils/receiptGenerator';
import {
  Key,
  QrCode,
  Share2,
  ExternalLink,
  Receipt,
  Sparkles,
  AlertOctagon,
  Radio,
  Calendar,
  LifeBuoy,
  Megaphone,
  UserCheck,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Car,
  Package,
  UserPlus,
  Wrench,
  Search,
  ChevronRight,
  ShieldAlert,
  Building,
  Users,
  Star,
  MapPin,
  Tag,
  Download,
  Settings,
  Shield,
  PhoneCall,
  History,
} from 'lucide-react';

export const ResidentView: React.FC = () => {
  const {
    activeFlat,
    currentUser,
    flats,
    visitors,
    bills,
    amenities,
    bookings,
    complaints,
    notices,
    staff,
    sosAlerts,
    setActiveSidebarNav,
    triggerPanicAlert,
    resolveSOS,
    bookAmenity,
    cancelBooking,
    submitComplaint,
    activeSidebarNav,
  } = useSociety();

  const [activeTab, setActiveTab] = useState<'passes' | 'history' | 'bills' | 'amenities' | 'helpdesk' | 'notices' | 'community' | 'staff'>('passes');

  // Synchronize with left sidebar selection
  useEffect(() => {
    if (activeSidebarNav === 'accounting') {
      setActiveTab('bills');
    } else if (activeSidebarNav === 'calendar') {
      setActiveTab('amenities');
    } else if (activeSidebarNav === 'notices') {
      setActiveTab('notices');
    } else if (activeSidebarNav === 'helpdesk') {
      setActiveTab('helpdesk');
    } else if (activeSidebarNav === 'community') {
      setActiveTab('community');
    } else if (activeSidebarNav === 'deliveries') {
      setActiveTab('history');
    } else if (activeSidebarNav === 'staff') {
      setActiveTab('staff');
    } else if (activeSidebarNav === 'dashboard') {
      setActiveTab('passes');
    } else if (activeSidebarNav === 'settings') {
      setIsSettingsOpen(true);
    }
  }, [activeSidebarNav]);

  // Modals state
  const [isPreApproveOpen, setIsPreApproveOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPanicOpen, setIsPanicOpen] = useState(false);
  const [selectedQRPass, setSelectedQRPass] = useState<VisitorPass | null>(null);
  const [preApproveCat, setPreApproveCat] = useState<VisitorCategory>('guest');
  const [selectedPayBill, setSelectedPayBill] = useState<MaintenanceBill | null>(null);

  // New Complaint Form
  const [ticketCategory, setTicketCategory] = useState<
    'Plumbing' | 'Electrical' | 'Elevator' | 'Security' | 'Noise/Disturbance' | 'Cleanliness' | 'Other'
  >('Plumbing');
  const [ticketTitle, setTicketTitle] = useState('');
  const [ticketDesc, setTicketDesc] = useState('');
  const [ticketPriority, setTicketPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');

  // Amenity Booking state
  const [selectedAmenityId, setSelectedAmenityId] = useState<string | null>(null);
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookingSlot, setBookingSlot] = useState('');
  const [bookingGuests, setBookingGuests] = useState(2);
  const [bookingMessage, setBookingMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Current Flat details
  const flatObj = (currentUser?.societyName
    ? flats.find((flat) => flat.flatNumber === activeFlat && flat.societyName === currentUser.societyName)
    : undefined) || flats.find((flat) => flat.flatNumber === activeFlat) || flats[0];

  // Filtered records for active flat
  const myVisitors = visitors.filter((v) => v.flatNumber === activeFlat);
  const myExpectedPasses = myVisitors.filter((v) => v.status === 'expected' || v.status === 'pending_approval');
  const myBills = bills.filter((b) => b.flatNumber === activeFlat);
  const pendingBill = myBills.find((b) => b.status === 'pending' || b.status === 'overdue');
  const myBookings = bookings.filter((b) => b.flatNumber === activeFlat);
  const myComplaints = complaints.filter((c) => c.flatNumber === activeFlat);
  const residentProfile = flatObj.profileDetails || {};
  const householdMembers = flatObj.familyMembers?.filter((member) => member.name.trim()) || [];

  const openPreApprove = (cat: VisitorCategory) => {
    setPreApproveCat(cat);
    setIsPreApproveOpen(true);
  };

  const handleComplaintSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketTitle.trim() || !ticketDesc.trim()) return;

    submitComplaint({
      category: ticketCategory,
      title: ticketTitle,
      description: ticketDesc,
      priority: ticketPriority,
    });

    setTicketTitle('');
    setTicketDesc('');
    alert('Complaint ticket submitted to Society Helpdesk!');
  };

  const handleAmenityBook = (amenityId: string) => {
    if (!bookingSlot) {
      setBookingMessage({ type: 'error', text: 'Please select a time slot first.' });
      return;
    }

    const res = bookAmenity(amenityId, bookingDate, bookingSlot, bookingGuests);
    if (res.success) {
      setBookingMessage({ type: 'success', text: res.message });
      setSelectedAmenityId(null);
      setBookingSlot('');
    } else {
      setBookingMessage({ type: 'error', text: res.message });
    }
  };

  const activePanicAlert = sosAlerts.find(
    (s) => s.flatNumber === activeFlat && s.status === 'active'
  );

  return (
    <div className="w-full max-w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Active Silent Panic / SOS Emergency Status Banner */}
      {activePanicAlert && (
        <div className="bg-gradient-to-r from-rose-700 via-red-600 to-rose-800 border-2 border-rose-400 rounded-2xl p-5 text-white shadow-2xl animate-fade-in flex flex-col md:flex-row items-center justify-between gap-4 ring-4 ring-rose-500/30">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white text-rose-700 rounded-2xl shadow-lg animate-bounce">
              <AlertOctagon className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-white/20 text-white border border-white/30 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                  {activePanicAlert.isSilentPanic ? '🚨 SILENT PANIC ALARM DISPATCHED' : 'EMERGENCY SOS ACTIVE'}
                </span>
                <span className="text-xs font-mono text-rose-200">{activePanicAlert.triggeredAt}</span>
              </div>
              <h3 className="text-lg font-black text-white mt-1">
                Gate 1 Security has been notified for Flat {activeFlat}
              </h3>
              <p className="text-xs text-rose-100">
                Security guards have your contact details ({flatObj.phone}) and emergency contacts. Stay safe.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPanicOpen(true)}
              className="bg-white text-rose-700 hover:bg-rose-50 font-black text-xs px-4 py-2.5 rounded-xl transition-all shadow-md active:scale-95"
            >
              View Dispatch Details
            </button>
            <button
              onClick={() => resolveSOS(activePanicAlert.id, 'Resident cancelled alert')}
              className="bg-rose-950/60 hover:bg-rose-950 text-white border border-rose-400/40 font-bold text-xs px-3.5 py-2.5 rounded-xl transition-all"
            >
              Cancel Alarm
            </button>
          </div>
        </div>
      )}

      {/* Resident Welcome Banner in Crisp Professional White Style */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 text-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold px-2.5 py-0.5 rounded">
              {flatObj.occupancyStatus} • Wing {flatObj.wing}
            </span>
            <span className="text-xs text-slate-500 font-medium">Flat Unit {flatObj.flatNumber}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Welcome, {flatObj.ownerName}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Registered Vehicles: {flatObj.vehicles.map((v) => v.number).join(', ') || 'None'} • Phone: {flatObj.phone}
          </p>
        </div>

        {/* Quick Summary Cards & Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-center min-w-[110px]">
            <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Outstanding Dues</span>
            <span className={`text-lg font-bold ${flatObj.outstandingDues > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
              ₹{flatObj.outstandingDues.toLocaleString()}
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-center min-w-[110px]">
            <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Active Gate Passes</span>
            <span className="text-lg font-bold text-slate-900">{myExpectedPasses.length}</span>
          </div>

          {/* Panic Alert Button */}
          <button
            onClick={() => setIsPanicOpen(true)}
            className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs px-3.5 py-2.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <AlertOctagon className="w-4 h-4 text-rose-600" />
            <span>Panic Alert</span>
          </button>

          <button
            onClick={() => openPreApprove('guest')}
            className="bg-[#0c1f28] hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <Key className="w-4 h-4 text-emerald-400" />
            <span>Pre-Approve Guest</span>
          </button>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs px-3 py-2.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Settings className="w-4 h-4 text-slate-500" />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* Main Resident Navigation Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2 pb-2">
        <button
          onClick={() => setActiveTab('passes')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === 'passes'
              ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>Visitor Passes ({myVisitors.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === 'history'
              ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Visitor History Log</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('staff');
            setActiveSidebarNav('staff');
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === 'staff'
              ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Household Staff</span>
        </button>

        <button
          onClick={() => setActiveTab('bills')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap relative ${
            activeTab === 'bills'
              ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Maintenance & Bills</span>
          {pendingBill && (
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping absolute top-2 right-2 border border-white" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('amenities')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === 'amenities'
              ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Amenity Bookings</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('helpdesk');
            setActiveSidebarNav('helpdesk');
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === 'helpdesk'
              ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <LifeBuoy className="w-4 h-4" />
          <span>Helpdesk & Complaints</span>
        </button>

        <button
          onClick={() => setActiveTab('notices')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === 'notices'
              ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>Notice Board & Staff</span>
        </button>
      </div>

      {activeTab === 'staff' && <DomesticWorkerPassSection />}

      {activeTab === 'community' && (
        <section aria-labelledby="resident-family-details-title" className="space-y-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Resident profile</p>
            <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950" id="resident-family-details-title">
              Family & Apartment Details
            </h2>
            <p className="mt-1 text-sm text-slate-500">Your registered household, parking, and apartment information.</p>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Apartment</h3>
                  <p className="mt-1 text-sm text-slate-500">Your unit and occupancy information</p>
                </div>
                <Building className="h-5 w-5 text-emerald-700" />
              </div>
              <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                {[
                  ['Flat number', flatObj.flatNumber],
                  ['Wing', flatObj.wing],
                  ['Floor', String(flatObj.floor)],
                  ['Occupancy', flatObj.occupancyStatus],
                  ['Ownership type', residentProfile.ownershipType || flatObj.occupancyStatus],
                  ['Move-in date', residentProfile.moveInDate || 'Not recorded'],
                  ['Possession date', residentProfile.possessionDate || 'Not recorded'],
                  ['Parking slot number', residentProfile.parkingSlot || 'Not assigned'],
                ].map(([label, value]) => (
                  <div className="rounded-xl bg-slate-50 p-3.5" key={label}>
                    <dt className="text-xs font-medium text-slate-500">{label}</dt>
                    <dd className="mt-1 break-words text-sm font-semibold text-slate-900">{value}</dd>
                  </div>
                ))}
              </dl>
              {flatObj.propertyAddress && (
                <div className="mt-4 rounded-xl bg-slate-50 p-3.5">
                  <p className="text-xs font-medium text-slate-500">Apartment address</p>
                  <p className="mt-1 text-sm leading-6 text-slate-900">{flatObj.propertyAddress}</p>
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Household</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {flatObj.familyMembersCount} registered member{flatObj.familyMembersCount === 1 ? '' : 's'}
                  </p>
                </div>
                <Users className="h-5 w-5 text-emerald-700" />
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3">
                {[
                  ['Adults', residentProfile.numberOfAdults ?? 0],
                  ['Children', residentProfile.numberOfChildren ?? 0],
                  ['Senior citizens', residentProfile.seniorCitizens ?? 0],
                ].map(([label, value]) => (
                  <div className="rounded-xl bg-emerald-50 p-3 text-center" key={label}>
                    <p className="text-xl font-extrabold text-emerald-900">{value}</p>
                    <p className="mt-1 text-[11px] font-medium text-emerald-800">{label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 space-y-3">
                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Primary resident</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{flatObj.ownerName}</p>
                  <p className="mt-1 text-xs text-slate-600">{residentProfile.fatherOrSpouseName ? `Father / spouse: ${residentProfile.fatherOrSpouseName}` : 'Father / spouse: Not recorded'}</p>
                </div>
                {householdMembers.length ? householdMembers.map((member) => (
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 p-4" key={member.id}>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{member.name}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {member.relationship || 'Family member'}
                        {member.age !== undefined ? ` · Age ${member.age}` : ''}
                      </p>
                    </div>
                    {member.phone && <p className="text-xs font-medium text-slate-600">{member.phone}</p>}
                  </div>
                )) : (
                  <p className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                    Individual family member details have not been recorded.
                  </p>
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Resident details</h3>
                  <p className="mt-1 text-sm text-slate-500">Personal and contact information</p>
                </div>
                <UserCheck className="h-5 w-5 text-emerald-700" />
              </div>
              <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                {[
                  ['Phone', flatObj.phone],
                  ['Email', flatObj.email],
                  ['Alternate phone', residentProfile.alternatePhone || 'Not recorded'],
                  ['Date of birth', residentProfile.dateOfBirth || 'Not recorded'],
                  ['Gender', residentProfile.gender || 'Not recorded'],
                  ['Occupation', residentProfile.occupation || 'Not recorded'],
                  ['Company', residentProfile.company || 'Not recorded'],
                  ['Pets', residentProfile.pets || 'None recorded'],
                ].map(([label, value]) => (
                  <div className="rounded-xl bg-slate-50 p-3.5" key={label}>
                    <dt className="text-xs font-medium text-slate-500">{label}</dt>
                    <dd className="mt-1 break-words text-sm font-semibold text-slate-900">{value}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-4 rounded-xl bg-slate-50 p-3.5">
                <p className="text-xs font-medium text-slate-500">Permanent address</p>
                <p className="mt-1 text-sm leading-6 text-slate-900">{residentProfile.permanentAddress || 'Not recorded'}</p>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Parking & vehicles</h3>
                  <p className="mt-1 text-sm text-slate-500">Registered parking and vehicle records</p>
                </div>
                <Car className="h-5 w-5 text-emerald-700" />
              </div>
              <div className="mt-5 rounded-xl bg-emerald-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-emerald-800">Parking slot number</p>
                <p className="mt-1 text-2xl font-extrabold text-emerald-950">{residentProfile.parkingSlot || 'Not assigned'}</p>
              </div>
              {flatObj.vehicles.length ? (
                <ul className="mt-4 space-y-3">
                  {flatObj.vehicles.map((vehicle) => (
                    <li className="rounded-xl border border-slate-200 p-4" key={`${vehicle.type}-${vehicle.number}`}>
                      <p className="text-sm font-semibold text-slate-900">{vehicle.type} · {vehicle.number}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {[vehicle.makeModel, vehicle.color, vehicle.fastTag ? `FASTag ${vehicle.fastTag}` : ''].filter(Boolean).join(' · ') || 'Additional vehicle details not recorded'}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">No vehicles registered.</p>
              )}
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:col-span-2">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Emergency contacts & household notes</h3>
                  <p className="mt-1 text-sm text-slate-500">Information available to support your household</p>
                </div>
                <PhoneCall className="h-5 w-5 text-emerald-700" />
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {flatObj.emergencyContacts?.length ? flatObj.emergencyContacts.map((contact) => (
                  <div className="rounded-xl bg-slate-50 p-4" key={contact.id}>
                    <p className="text-sm font-semibold text-slate-900">{contact.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{contact.relationship} · {contact.phone}</p>
                    {contact.alternatePhone && <p className="mt-1 text-xs text-slate-500">Alternate: {contact.alternatePhone}</p>}
                    {contact.bloodGroup && <p className="mt-1 text-xs text-slate-500">Blood group: {contact.bloodGroup}</p>}
                    {contact.medicalNotes && <p className="mt-2 text-xs leading-5 text-slate-600">{contact.medicalNotes}</p>}
                  </div>
                )) : (
                  <p className="text-sm text-slate-500">No emergency contacts recorded.</p>
                )}
              </div>
              {(residentProfile.notes || residentProfile.specialInstructions) && (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {residentProfile.notes && <p className="rounded-xl border border-slate-200 p-4 text-sm leading-6 text-slate-700"><strong>Household notes:</strong> {residentProfile.notes}</p>}
                  {residentProfile.specialInstructions && <p className="rounded-xl border border-slate-200 p-4 text-sm leading-6 text-slate-700"><strong>Special instructions:</strong> {residentProfile.specialInstructions}</p>}
                </div>
              )}
            </section>
          </div>
        </section>
      )}

      {/* Tab 1: Visitor Passes & Quick Pre-approvals */}
      {activeTab === 'passes' && (
        <div className="space-y-6">
          {/* Quick Category Fast Pass Buttons */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <span>Instant Gate Pass Shortcuts</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                onClick={() => openPreApprove('guest')}
                className="bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 hover:border-indigo-300 p-4 rounded-2xl flex flex-col items-center gap-2 transition-all text-center group"
              >
                <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl group-hover:scale-110 transition-transform">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Guest Pass</span>
                  <span className="text-[11px] text-slate-500">Friends & Relatives</span>
                </div>
              </button>

              <button
                onClick={() => openPreApprove('delivery')}
                className="bg-slate-50 hover:bg-amber-50/50 border border-slate-200 hover:border-amber-300 p-4 rounded-2xl flex flex-col items-center gap-2 transition-all text-center group"
              >
                <div className="p-3 bg-amber-100 text-amber-600 rounded-xl group-hover:scale-110 transition-transform">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Delivery Pass</span>
                  <span className="text-[11px] text-slate-500">Swiggy, Amazon, etc.</span>
                </div>
              </button>

              <button
                onClick={() => openPreApprove('cab')}
                className="bg-slate-50 hover:bg-blue-50/50 border border-slate-200 hover:border-blue-300 p-4 rounded-2xl flex flex-col items-center gap-2 transition-all text-center group"
              >
                <div className="p-3 bg-blue-100 text-blue-600 rounded-xl group-hover:scale-110 transition-transform">
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Cab Pass</span>
                  <span className="text-[11px] text-slate-500">Uber, Ola, Taxi</span>
                </div>
              </button>

              <button
                onClick={() => openPreApprove('service')}
                className="bg-slate-50 hover:bg-violet-50/50 border border-slate-200 hover:border-violet-300 p-4 rounded-2xl flex flex-col items-center gap-2 transition-all text-center group"
              >
                <div className="p-3 bg-violet-100 text-violet-600 rounded-xl group-hover:scale-110 transition-transform">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Service / Staff</span>
                  <span className="text-[11px] text-slate-500">Plumber, Maid, etc.</span>
                </div>
              </button>
            </div>
          </div>

          {/* Currently At Gate or Expected Passes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Active Pre-Approved Passes */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Key className="w-5 h-5 text-indigo-600" />
                  <span>Pre-Approved Passcodes ({myExpectedPasses.length})</span>
                </h3>
                <span className="text-xs text-slate-500">Guard Verifies at Gate</span>
              </div>

              {myExpectedPasses.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  No pending or pre-approved passes for Flat {activeFlat}.
                </div>
              ) : (
                <div className="space-y-3">
                  {myExpectedPasses.map((v) => {
                    const isExp = v.expiresAt && new Date() > new Date(v.expiresAt);
                    return (
                      <div
                        key={v.id}
                        className="bg-slate-50 p-4 rounded-xl border border-indigo-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs hover:border-emerald-400 transition-colors"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900">{v.visitorName}</h4>
                            <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold px-2 py-0.5 rounded capitalize">
                              {v.category}
                            </span>
                            {v.isTimeLimited && (
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${isExp ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                                {isExp ? 'Expired' : 'Time-Limited'}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {v.companyOrRole ? `${v.companyOrRole} • ` : ''}Phone: {v.phone}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Date: {v.expectedDate} {v.expectedTimeSlot ? `(${v.expectedTimeSlot})` : ''}
                            {v.expiresAt && ` • Exp: ${new Date(v.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                          </p>
                        </div>

                        {/* Passcode & QR Share Button */}
                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <button
                            type="button"
                            onClick={() => setSelectedQRPass(v)}
                            className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
                          >
                            <QrCode className="w-4 h-4 text-emerald-400" />
                            <span>View QR</span>
                          </button>

                          <div className="text-right">
                            <span className="text-[9px] text-slate-500 uppercase font-bold block">OTP</span>
                            <div className="bg-indigo-600 text-white font-mono text-sm font-black px-2.5 py-1 rounded-xl tracking-wider shadow-xs">
                              {v.passcode}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Currently In Gate or Recent Activity */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600" />
                <span>Inside Society / Recent Activity ({myVisitors.length})</span>
              </h3>

              {myVisitors.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  No recent visitor logs for Flat {activeFlat}.
                </div>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {myVisitors.map((v) => (
                    <div
                      key={v.id}
                      className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{v.visitorName}</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              v.status === 'in_gate'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : v.status === 'checked_out'
                                ? 'bg-slate-200 text-slate-600'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {v.status === 'in_gate'
                              ? 'In Society'
                              : v.status === 'checked_out'
                              ? 'Left Gate'
                              : v.status}
                          </span>
                        </div>
                        <p className="text-slate-500 text-[11px] mt-0.5">
                          {v.category} • In: {v.checkInTime || 'Pending'} {v.checkOutTime ? `• Out: ${v.checkOutTime}` : ''}
                        </p>
                      </div>
                      <span className="text-slate-400 font-mono text-[11px]">{v.id}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Historical Log Section */}
          <VisitorHistoryLog
            visitors={visitors}
            activeFlat={activeFlat}
            onViewPassDetails={(pass) => setSelectedQRPass(pass)}
            onReIssuePass={(pass) => openPreApprove(pass.category)}
          />
        </div>
      )}

      {/* Tab: Historical Log & Stay Duration */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          <VisitorHistoryLog
            visitors={visitors}
            activeFlat={activeFlat}
            onViewPassDetails={(pass) => setSelectedQRPass(pass)}
            onReIssuePass={(pass) => openPreApprove(pass.category)}
          />
        </div>
      )}

      {/* Tab 2: Maintenance Dues & Accounting */}
      {activeTab === 'bills' && (
        <div className="space-y-6">
          {/* Outstanding Bill Focus Card */}
          {pendingBill ? (
            <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 border border-amber-400 rounded-2xl p-6 text-white shadow-lg space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="bg-white/20 text-white border border-white/30 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {pendingBill.status === 'overdue' ? 'Overdue Maintenance' : 'Pending Bill'}
                  </span>
                  <h3 className="text-2xl font-black text-white mt-2">
                    {pendingBill.monthYear} Society Invoice
                  </h3>
                  <p className="text-xs text-amber-100">Due Date: {pendingBill.dueDate}</p>
                </div>

                <div className="text-left md:text-right">
                  <span className="text-xs text-amber-100 block font-bold">Total Payable Dues</span>
                  <span className="text-3xl font-black text-white">
                    ₹{pendingBill.totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Bill Breakdown */}
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-white">
                <div>
                  <span className="text-amber-100 block">Base Maintenance:</span>
                  <span className="font-extrabold">₹{pendingBill.baseMaintenance}</span>
                </div>
                <div>
                  <span className="text-amber-100 block">Water Charges:</span>
                  <span className="font-extrabold">₹{pendingBill.waterCharges}</span>
                </div>
                <div>
                  <span className="text-amber-100 block">Covered Parking:</span>
                  <span className="font-extrabold">₹{pendingBill.parkingCharges}</span>
                </div>
                <div>
                  <span className="text-amber-100 block">Late Fee:</span>
                  <span className="font-extrabold">₹{pendingBill.lateFee}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  onClick={() => downloadBillReceipt(pendingBill)}
                  className="bg-white/10 hover:bg-white/20 text-white font-bold px-4 py-3 rounded-xl text-xs flex items-center gap-1.5 transition-all border border-white/20"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Invoice</span>
                </button>

                <button
                  onClick={() => setSelectedPayBill(pendingBill)}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-black px-6 py-3 rounded-xl text-xs flex items-center gap-2 transition-all shadow-md active:scale-95"
                >
                  <Receipt className="w-4 h-4 text-emerald-400" />
                  <span>Pay ₹{pendingBill.totalAmount.toLocaleString()} Now</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-8 text-center space-y-2 shadow-sm">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">All Clear! No Pending Dues</h3>
              <p className="text-xs text-slate-500">Flat {activeFlat} maintenance account is fully up to date.</p>
            </div>
          )}

          {/* Payment History & Ledger */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-indigo-600" />
              <span>Society Maintenance Ledger & Receipts</span>
            </h3>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Bill Cycle</th>
                    <th className="p-3.5">Due Date</th>
                    <th className="p-3.5">Amount</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Payment Info</th>
                    <th className="p-3.5 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {myBills.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 font-bold text-slate-900">{b.monthYear}</td>
                      <td className="p-3.5 text-slate-500">{b.dueDate}</td>
                      <td className="p-3.5 font-extrabold text-slate-900">₹{b.totalAmount.toLocaleString()}</td>
                      <td className="p-3.5">
                        <span
                          className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${
                            b.status === 'paid'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-500">
                        {b.paidDate ? `${b.paidDate} via ${b.paymentMethod}` : 'Unpaid'}
                      </td>
                      <td className="p-3.5 text-right">
                        {b.status === 'paid' ? (
                          <button
                            onClick={() => downloadBillReceipt(b)}
                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-emerald-200 transition-colors inline-flex items-center gap-1"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Receipt</span>
                          </button>
                        ) : (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => downloadBillReceipt(b)}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 transition-colors inline-flex items-center gap-1"
                              title="Download Invoice"
                            >
                              <Download className="w-3.5 h-3.5 text-slate-500" />
                              <span>Invoice</span>
                            </button>

                            <button
                              onClick={() => setSelectedPayBill(b)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                            >
                              Pay
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Amenities Booking */}
      {activeTab === 'amenities' && <AmenityBookingSection />}

      {/* Tab 4: Helpdesk & Complaints */}
      {activeTab === 'helpdesk' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Lodge New Ticket */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <LifeBuoy className="w-5 h-5 text-indigo-600" />
              <span>Lodge Maintenance Ticket</span>
            </h3>

            <form onSubmit={handleComplaintSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Issue Category</label>
                <select
                  value={ticketCategory}
                  onChange={(e) => setTicketCategory(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                >
                  <option value="Plumbing">Plumbing / Water Supply</option>
                  <option value="Electrical">Electrical / Power Cut</option>
                  <option value="Elevator">Elevator / Lift issue</option>
                  <option value="Security">Security Guard issue</option>
                  <option value="Noise/Disturbance">Noise / Disturbance</option>
                  <option value="Cleanliness">Garbage / Common Cleaning</option>
                  <option value="Other">Other General Request</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Issue Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Water leakage in balcony tap"
                  value={ticketTitle}
                  onChange={(e) => setTicketTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Priority</label>
                <div className="flex gap-2">
                  {(['low', 'medium', 'high', 'urgent'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setTicketPriority(p)}
                      className={`flex-1 py-1.5 text-xs font-bold capitalize rounded-lg border transition-all ${
                        ticketPriority === p
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-300'
                          : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Detailed Description *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe the issue so society technician can resolve it..."
                  value={ticketDesc}
                  onChange={(e) => setTicketDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Submit Ticket to Society Admin</span>
              </button>
            </form>
          </div>

          {/* Active Tickets List */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-indigo-600" />
              <span>My Ticket History ({myComplaints.length})</span>
            </h3>

            {myComplaints.length === 0 ? (
              <p className="text-xs text-slate-500">No complaint tickets filed for Flat {activeFlat}.</p>
            ) : (
              <div className="space-y-3">
                {myComplaints.map((c) => (
                  <div
                    key={c.id}
                    className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] text-indigo-600 font-bold uppercase">{c.category}</span>
                        <h4 className="font-bold text-slate-900 text-sm">{c.title}</h4>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          c.status === 'resolved'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : c.status === 'in_progress'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {c.status.replace('_', ' ')}
                      </span>
                    </div>

                    <p className="text-slate-600">{c.description}</p>

                    <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-[11px] text-slate-500">
                      <span>Assigned: {c.assignedTo || 'Pending Assignment'}</span>
                      <span>Filed: {c.createdAt}</span>
                    </div>

                    {c.resolutionNotes && (
                      <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-800 text-[11px]">
                        <strong>Resolution Note:</strong> {c.resolutionNotes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 5: Society Notices & Daily Staff */}
      {activeTab === 'notices' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Society Notice Board */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-indigo-600" />
              <span>Notice Board Announcements</span>
            </h3>

            <div className="space-y-3">
              {notices.map((n) => (
                <div
                  key={n.id}
                  className={`p-4 rounded-xl border text-xs space-y-2 ${
                    n.isImportant
                      ? 'bg-amber-50/80 border-amber-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-slate-200 text-slate-700 rounded">
                      {n.category}
                    </span>
                    <span className="text-[11px] text-slate-400">{n.date}</span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm">{n.title}</h4>
                  <p className="text-slate-600 leading-relaxed">{n.content}</p>

                  <p className="text-[10px] text-slate-400 pt-1">Posted by {n.author}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Staff & Helps */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-indigo-600" />
              <span>Daily Staff Presence at Gate</span>
            </h3>

            <div className="space-y-3">
              {staff.map((s) => (
                <div
                  key={s.id}
                  className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-sm">{s.name}</h4>
                      <span className="bg-slate-200 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded">
                        {s.role}
                      </span>
                    </div>

                    <p className="text-slate-500 mt-1">
                      Assigned Flats: {s.flatsAssigned.join(', ')} • Phone: {s.phone}
                    </p>

                    <div className="flex items-center gap-1 text-amber-500 text-[11px] mt-1 font-semibold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{s.rating} Rating</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`inline-block px-2.5 py-1 rounded text-[10px] font-bold uppercase ${
                        s.isPresentToday
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {s.isPresentToday ? `At Gate (${s.checkInTime})` : 'Not In Yet'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <PreApproveModal
        isOpen={isPreApproveOpen}
        onClose={() => setIsPreApproveOpen(false)}
        defaultCategory={preApproveCat}
      />

      <PayBillModal
        bill={selectedPayBill}
        onClose={() => setSelectedPayBill(null)}
      />

      <ResidentSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <PanicAlertModal
        isOpen={isPanicOpen}
        onClose={() => setIsPanicOpen(false)}
      />

      <QRPassDetailsModal
        pass={selectedQRPass}
        onClose={() => setSelectedQRPass(null)}
      />
    </div>
  );
};
