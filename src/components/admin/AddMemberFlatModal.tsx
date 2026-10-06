import React, { useState } from 'react';
import { useSociety } from '../../context/SocietyContext';
import { EmergencyContact, FlatFamilyMember, FlatProfileDetails } from '../../types';
import {
  Building2,
  UserCheck,
  Phone,
  Mail,
  Users,
  Car,
  DollarSign,
  Plus,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle,
  Calculator,
  ShieldCheck,
  CreditCard,
  Building,
  Sparkles,
} from 'lucide-react';

interface AddMemberFlatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddMemberFlatModal: React.FC<AddMemberFlatModalProps> = ({ isOpen, onClose }) => {
  const { flats, addFlatWithMember } = useSociety();
  const availableFlats = flats.filter((flat) => flat.occupancyStatus === 'Vacant');

  // Form State - Flat & Member Info
  const [flatNumber, setFlatNumber] = useState(() => availableFlats[0]?.flatNumber || '');
  const selectedFlat = availableFlats.find((flat) => flat.flatNumber === flatNumber);
  const [ownerName, setOwnerName] = useState('');
  const [occupancyStatus, setOccupancyStatus] = useState<'Owner' | 'Tenant'>('Owner');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [familyMembersCount, setFamilyMembersCount] = useState<number>(1);
  const [familyMembers, setFamilyMembers] = useState<FlatFamilyMember[]>([]);

  // Vehicles state
  const [vehicles, setVehicles] = useState<{ type: 'Car' | 'Bike'; number: string; makeModel?: string; color?: string; fastTag?: string }[]>([
    { type: 'Car', number: '' },
  ]);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [profileDetails, setProfileDetails] = useState<FlatProfileDetails>({
    ownershipType: 'Owner',
    gender: '',
    numberOfAdults: 2,
    numberOfChildren: 1,
    seniorCitizens: 0,
  });

  // Maintenance Cost Breakdown
  const [baseMaintenance, setBaseMaintenance] = useState<number>(3500);
  const [waterCharges, setWaterCharges] = useState<number>(450);
  const [parkingCharges, setParkingCharges] = useState<number>(500);
  const [clubhouseFee, setClubhouseFee] = useState<number>(300);
  const [autoGenerateFirstBill, setAutoGenerateFirstBill] = useState<boolean>(true);
  const [billingMonth, setBillingMonth] = useState<string>('August 2026');
  const [dueDate, setDueDate] = useState<string>('2026-08-10');

  const [formError, setFormError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  if (!isOpen) return null;

  // Total Live Monthly Maintenance Cost
  const totalMonthlyCost =
    Number(baseMaintenance || 0) +
    Number(waterCharges || 0) +
    Number(parkingCharges || 0) +
    Number(clubhouseFee || 0);

  const handleAddVehicle = () => {
    setVehicles((prev) => [...prev, { type: 'Car', number: '' }]);
  };

  const handleRemoveVehicle = (index: number) => {
    setVehicles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleVehicleChange = (
    index: number,
    field: 'type' | 'number' | 'makeModel' | 'color' | 'fastTag',
    value: string
  ) => {
    setVehicles((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: value } : v))
    );
  };

  const updateProfileDetails = (field: keyof FlatProfileDetails, value: string | number | string[]) => {
    setProfileDetails((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!selectedFlat) {
      setFormError('Select an available apartment before assigning a resident.');
      return;
    }

    if (!ownerName.trim()) {
      setFormError('Please enter the Primary Member / Owner Name.');
      return;
    }

    if (!phone.trim() || phone.length < 8) {
      setFormError('Please enter a valid phone number.');
      return;
    }

    if (!username.trim()) {
      setFormError('Please choose a username for the resident login.');
      return;
    }
    if (password.length < 8) {
      setFormError('Please set a password with at least 8 characters.');
      return;
    }

    const filteredVehicles = vehicles.filter((v) => v.number.trim().length > 0);
    const filteredEmergencyContacts = emergencyContacts.filter(
      (contact) => contact.name.trim() || contact.phone.trim()
    );

    const result = addFlatWithMember({
      flatNumber,
      wing: selectedFlat.wing,
      floor: selectedFlat.floor,
      ownerName,
      occupancyStatus,
      phone,
      email: email.trim(),
      username,
      password,
      familyMembersCount,
      familyMembers: familyMembers.filter((member) => member.name.trim()).map((member) => ({
        ...member,
        name: member.name.trim(),
        relationship: member.relationship.trim(),
        phone: member.phone?.trim() || undefined,
      })),
      vehicles: filteredVehicles,
      emergencyContacts: filteredEmergencyContacts,
      profileDetails,
      monthlyMaintenance: {
        baseMaintenance,
        waterCharges,
        parkingCharges,
        clubhouseFee,
        autoGenerateFirstBill,
        monthYear: billingMonth,
        dueDate,
      },
    });

    if (result.success) {
      setSuccessToast(result.message);
      setTimeout(() => {
        setSuccessToast(null);
        onClose();
      }, 1800);
    } else {
      setFormError(result.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-2xl max-w-[1600px] w-full h-[calc(100dvh-1rem)] sm:h-[calc(100dvh-2rem)] overflow-hidden shadow-2xl border border-slate-200 flex flex-col">
        {/* Modal Header */}
        <div className="bg-white text-slate-900 p-4 sm:px-6 sm:py-4 flex items-center justify-between border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-slate-100 text-slate-900 rounded-xl border border-slate-200">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-lg text-slate-950">Assign Resident to Apartment</h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Select a vacant apartment, add the resident and household details, and optionally create the first maintenance bill.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-950 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 flex-1 min-h-0 overflow-y-auto flex flex-col">
          {formError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {successToast && (
            <div className="p-3.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-900 text-xs font-extrabold flex items-center gap-2 shadow-sm animate-fade-in">
              <CheckCircle2 className="w-5 h-5 text-slate-700 shrink-0" />
              <span>{successToast}</span>
            </div>
          )}

          {availableFlats.length === 0 ? (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <p className="font-bold">No vacant apartments are available.</p>
              <p className="mt-1 text-xs">Add an apartment to the inventory or mark an occupied apartment as vacant before assigning a resident.</p>
            </div>
          ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-start">
            <div className="space-y-4">
          {/* SECTION 1: FLAT & LOCATION DETAILS */}
          <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2">
              <Building className="w-4 h-4 text-slate-700" />
              <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                1. Apartment Unit & Location
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Available Apartment *</label>
                <select
                  value={flatNumber}
                  onChange={(e) => setFlatNumber(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-extrabold text-slate-900 focus:outline-none focus:border-slate-900"
                >
                  {availableFlats.map((flat) => (
                    <option key={flat.flatNumber} value={flat.flatNumber}>
                      {flat.flatNumber} · {flat.wing}, Floor {flat.floor}
                    </option>
                  ))}
                </select>
                {selectedFlat?.propertyAddress && (
                  <p className="mt-1.5 text-[11px] text-slate-500">{selectedFlat.propertyAddress}</p>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Ownership Type</label>
                  <select
                    value={profileDetails.ownershipType || 'Owner'}
                    onChange={(e) => updateProfileDetails('ownershipType', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-slate-900"
                  >
                    <option>Owner</option><option>Joint Owner</option><option>Power of Attorney</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Possession Date</label>
                  <input type="date" value={profileDetails.possessionDate || ''} onChange={(e) => updateProfileDetails('possessionDate', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-slate-900" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Move-in Date</label>
                  <input type="date" value={profileDetails.moveInDate || ''} onChange={(e) => updateProfileDetails('moveInDate', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-slate-900" />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: RESIDENT MEMBER DETAILS */}
          <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2">
              <UserCheck className="w-4 h-4 text-slate-700" />
              <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                2. Member / Resident Profile Details
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Primary Member / Owner Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Kumar"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:border-slate-900"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Occupancy Status</label>
                <select
                  value={occupancyStatus}
                  onChange={(e) => setOccupancyStatus(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:border-slate-900"
                >
                  <option value="Owner">Owner Occupied</option>
                  <option value="Tenant">Tenant Occupied</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Mobile Phone Number *</label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="+91 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-900 focus:outline-none focus:border-slate-900"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    placeholder="member@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              <div className="sm:col-span-2 rounded-xl border border-emerald-200 bg-emerald-50/60 p-3">
                <div className="mb-2">
                  <h5 className="text-[11px] font-extrabold text-emerald-950">Resident Login Details</h5>
                  <p className="mt-0.5 text-[10px] text-emerald-800">The resident can use these credentials to sign in to their dashboard.</p>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Username *</label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. ramesh.kumar"
                      autoComplete="username"
                      minLength={3}
                      required
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:border-emerald-700"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Password * (minimum 8 characters)</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Set an initial password"
                      autoComplete="new-password"
                      minLength={8}
                      required
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:border-emerald-700"
                    />
                  </div>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Family Members Count</label>
                <input
                  type="number"
                  min="1"
                  max="15"
                  value={familyMembersCount}
                  onChange={(e) => setFamilyMembersCount(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>
              <div className="sm:col-span-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <h5 className="text-xs font-bold text-slate-800">Household member details</h5>
                    <p className="mt-0.5 text-[10px] text-slate-500">Add family members besides the primary resident.</p>
                  </div>
                  <button
                    className="shrink-0 text-xs font-bold text-emerald-800 hover:text-emerald-950"
                    onClick={() => setFamilyMembers((members) => [...members, {
                      id: `family-${Date.now()}-${members.length}`,
                      name: '',
                      relationship: '',
                    }])}
                    type="button"
                  >
                    + Add member
                  </button>
                </div>
                {familyMembers.length === 0 ? (
                  <p className="text-xs text-slate-400">No additional member details added.</p>
                ) : (
                  <div className="space-y-2">
                    {familyMembers.map((member, index) => (
                      <div className="grid gap-2 rounded-lg border border-slate-200 bg-white p-2 sm:grid-cols-2" key={member.id}>
                        <input
                          aria-label={`Family member ${index + 1} name`}
                          className="rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900"
                          onChange={(event) => setFamilyMembers((members) => members.map((item) => item.id === member.id ? { ...item, name: event.target.value } : item))}
                          placeholder="Full name"
                          value={member.name}
                        />
                        <input
                          aria-label={`Family member ${index + 1} relationship`}
                          className="rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900"
                          onChange={(event) => setFamilyMembers((members) => members.map((item) => item.id === member.id ? { ...item, relationship: event.target.value } : item))}
                          placeholder="Relationship (e.g. spouse)"
                          value={member.relationship}
                        />
                        <input
                          aria-label={`Family member ${index + 1} age`}
                          className="rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900"
                          max="120"
                          min="0"
                          onChange={(event) => setFamilyMembers((members) => members.map((item) => item.id === member.id ? { ...item, age: event.target.value ? Number(event.target.value) : undefined } : item))}
                          placeholder="Age (optional)"
                          type="number"
                          value={member.age ?? ''}
                        />
                        <input
                          aria-label={`Family member ${index + 1} phone`}
                          className="rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900"
                          onChange={(event) => setFamilyMembers((members) => members.map((item) => item.id === member.id ? { ...item, phone: event.target.value } : item))}
                          placeholder="Phone (optional)"
                          type="tel"
                          value={member.phone || ''}
                        />
                        <button
                          className="justify-self-start text-[11px] font-semibold text-rose-600 hover:text-rose-800 sm:col-span-2"
                          onClick={() => setFamilyMembers((members) => members.filter((item) => item.id !== member.id))}
                          type="button"
                        >
                          Remove member
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Father / Spouse Name</label>
                <input type="text" value={profileDetails.fatherOrSpouseName || ''} onChange={(e) => updateProfileDetails('fatherOrSpouseName', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-slate-900" placeholder="Enter name" />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Date of Birth</label>
                <input type="date" value={profileDetails.dateOfBirth || ''} onChange={(e) => updateProfileDetails('dateOfBirth', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-slate-900" />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Gender</label>
                <select value={profileDetails.gender || ''} onChange={(e) => updateProfileDetails('gender', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-slate-900">
                  <option value="">Select gender</option><option>Female</option><option>Male</option><option>Non-binary</option><option>Prefer not to say</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Alternate Phone</label>
                <input type="tel" value={profileDetails.alternatePhone || ''} onChange={(e) => updateProfileDetails('alternatePhone', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-slate-900" placeholder="+91 9876543210" />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Government ID (last 4 digits only)</label>
                <input type="text" inputMode="numeric" maxLength={4} value={profileDetails.governmentIdLastFour || ''}
                  onChange={(e) => updateProfileDetails('governmentIdLastFour', e.target.value.replace(/\D/g, '').slice(0, 4))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-slate-900" placeholder="••••" />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Occupation</label>
                <input type="text" value={profileDetails.occupation || ''} onChange={(e) => updateProfileDetails('occupation', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-slate-900" placeholder="Occupation" />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Company / Organization</label>
                <input type="text" value={profileDetails.company || ''} onChange={(e) => updateProfileDetails('company', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-slate-900" placeholder="Company name" />
              </div>
            </div>

            {/* Vehicle Details */}
            <div className="pt-2 border-t border-slate-200/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                  <Car className="w-3.5 h-3.5 text-slate-700" />
                  Registered Resident Vehicles ({vehicles.length})
                </span>
                <button
                  type="button"
                  onClick={handleAddVehicle}
                  className="text-xs font-extrabold text-slate-700 hover:text-slate-950 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Vehicle
                </button>
              </div>

              <div className="space-y-2">
                {vehicles.map((v, idx) => (
                  <div key={idx} className="grid grid-cols-1 sm:grid-cols-2 gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2">
                    <select
                      value={v.type}
                      onChange={(e) => handleVehicleChange(idx, 'type', e.target.value as any)}
                      className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none"
                    >
                      <option value="Car">4-Wheeler Car</option>
                      <option value="Bike">2-Wheeler Bike</option>
                    </select>

                    <input
                      type="text"
                      placeholder="e.g. MH-02-CD-5678"
                      value={v.number}
                      onChange={(e) => handleVehicleChange(idx, 'number', e.target.value.toUpperCase())}
                      className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-slate-900 uppercase"
                    />
                    <input type="text" value={v.makeModel || ''} onChange={(e) => handleVehicleChange(idx, 'makeModel', e.target.value)} placeholder="Make / model"
                      className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900" />
                    <input type="text" value={v.color || ''} onChange={(e) => handleVehicleChange(idx, 'color', e.target.value)} placeholder="Color"
                      className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900" />
                    <input type="text" value={v.fastTag || ''} onChange={(e) => handleVehicleChange(idx, 'fastTag', e.target.value)} placeholder="FASTag ID (optional)"
                      className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900 sm:col-span-2" />

                    {vehicles.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveVehicle(idx)}
                        className="text-slate-500 hover:text-rose-600 p-1.5 sm:col-span-2 sm:justify-self-end"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">
              3. Emergency Contacts
            </h4>
            <div className="space-y-2">
              {emergencyContacts.map((contact, index) => (
                <div key={contact.id} className="grid grid-cols-1 sm:grid-cols-2 gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <input aria-label="Emergency contact name" placeholder="Contact name" value={contact.name}
                    onChange={(e) => setEmergencyContacts((items) => items.map((item, i) => i === index ? { ...item, name: e.target.value } : item))}
                    className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900" />
                  <input aria-label="Relationship" placeholder="Relationship" value={contact.relationship}
                    onChange={(e) => setEmergencyContacts((items) => items.map((item, i) => i === index ? { ...item, relationship: e.target.value } : item))}
                    className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900" />
                  <input aria-label="Emergency phone" type="tel" placeholder="Emergency phone" value={contact.phone}
                    onChange={(e) => setEmergencyContacts((items) => items.map((item, i) => i === index ? { ...item, phone: e.target.value } : item))}
                    className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900" />
                  <input aria-label="Alternate emergency phone" type="tel" placeholder="Alternate phone (optional)" value={contact.alternatePhone || ''}
                    onChange={(e) => setEmergencyContacts((items) => items.map((item, i) => i === index ? { ...item, alternatePhone: e.target.value } : item))}
                    className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900" />
                  <input aria-label="Blood group" placeholder="Blood group (optional)" value={contact.bloodGroup || ''}
                    onChange={(e) => setEmergencyContacts((items) => items.map((item, i) => i === index ? { ...item, bloodGroup: e.target.value } : item))}
                    className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900" />
                  <input aria-label="Medical notes" placeholder="Medical notes (optional)" value={contact.medicalNotes || ''}
                    onChange={(e) => setEmergencyContacts((items) => items.map((item, i) => i === index ? { ...item, medicalNotes: e.target.value } : item))}
                    className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900" />
                  <button type="button" onClick={() => setEmergencyContacts((items) => items.filter((_, i) => i !== index))}
                    className="text-left text-xs font-semibold text-slate-500 hover:text-rose-700 sm:col-span-2">Remove emergency contact</button>
                </div>
              ))}
              <button type="button" onClick={() => setEmergencyContacts((items) => [...items, { id: `contact-${Date.now()}`, name: '', relationship: '', phone: '' }])}
                className="text-xs font-bold text-slate-700 hover:text-slate-950">+ Add emergency contact</button>
            </div>
          </div>

          <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">4. Additional Information</h4>
            <textarea value={profileDetails.permanentAddress || ''} onChange={(e) => updateProfileDetails('permanentAddress', e.target.value)}
              placeholder="Permanent address" rows={2} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {([
                ['numberOfAdults', 'Adults'],
                ['numberOfChildren', 'Children'],
                ['seniorCitizens', 'Senior citizens'],
              ] as const).map(([field, label]) => (
                <label key={field} className="text-[10px] font-semibold text-slate-600">{label}
                  <input type="number" min="0" value={profileDetails[field] ?? 0}
                    onChange={(e) => updateProfileDetails(field, Number(e.target.value) || 0)}
                    className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-xs text-slate-900" />
                </label>
              ))}
              <label className="text-[10px] font-semibold text-slate-600">Pets
                <input type="text" value={profileDetails.pets || ''} onChange={(e) => updateProfileDetails('pets', e.target.value)}
                  placeholder="None" className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-xs text-slate-900" />
              </label>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 border-t border-slate-200 pt-3">
              <label className="text-[10px] font-bold text-slate-600">Current Dues (₹)
                <input type="number" min="0" value={profileDetails.currentDues ?? 0} onChange={(e) => updateProfileDetails('currentDues', Number(e.target.value) || 0)}
                  className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-sm font-bold text-slate-900" />
              </label>
              <label className="text-[10px] font-bold text-slate-600">Previous Dues (₹)
                <input type="number" min="0" value={profileDetails.previousDues ?? 0} onChange={(e) => updateProfileDetails('previousDues', Number(e.target.value) || 0)}
                  className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-sm font-bold text-slate-900" />
              </label>
              <label className="text-[10px] font-bold text-slate-600">Last Payment Date
                <input type="date" value={profileDetails.lastPaymentDate || ''} onChange={(e) => updateProfileDetails('lastPaymentDate', e.target.value)}
                  className="mt-1 w-full min-w-0 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-sm text-slate-900" />
              </label>
              <label className="text-[10px] font-bold text-slate-600">Last Payment Amount (₹)
                <input type="number" min="0" value={profileDetails.lastPaymentAmount ?? 0} onChange={(e) => updateProfileDetails('lastPaymentAmount', Number(e.target.value) || 0)}
                  className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-sm font-bold text-slate-900" />
              </label>
              <label className="text-[10px] font-bold text-slate-600">Payment Status
                <select value={profileDetails.paymentStatus || 'Pending'} onChange={(e) => updateProfileDetails('paymentStatus', e.target.value)}
                  className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-sm text-slate-900">
                  <option>Pending</option><option>Paid</option><option>Overdue</option>
                </select>
              </label>
              <label className="text-[10px] font-bold text-slate-600">Payment Method
                <select value={profileDetails.paymentMethod || ''} onChange={(e) => updateProfileDetails('paymentMethod', e.target.value)}
                  className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-sm text-slate-900">
                  <option value="">Select method</option><option>UPI</option><option>Card</option><option>Net Banking</option><option>Cash</option>
                </select>
              </label>
            </div>
            <input type="text" value={profileDetails.parkingSlot || ''} onChange={(e) => updateProfileDetails('parkingSlot', e.target.value)}
              placeholder="Assigned parking slot (optional)" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900" />
            <textarea value={profileDetails.specialInstructions || ''} onChange={(e) => updateProfileDetails('specialInstructions', e.target.value)}
              placeholder="Special instructions / notes" rows={2} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900" />
          </div>
            </div>

            <div className="space-y-4">
          {/* SECTION 5: MONTHLY MAINTENANCE COST BREAKDOWN & AUTO-BILLING */}
          <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-slate-700" />
                <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                  5. Monthly Maintenance & Auto-Billing
                </h4>
              </div>

              <span className="bg-slate-900 text-white font-black text-xs px-2.5 py-0.5 rounded-full shadow-xs">
                Total: ₹{totalMonthlyCost.toLocaleString()} / mo
              </span>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">Base Maintenance (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={baseMaintenance}
                  onChange={(e) => setBaseMaintenance(Number(e.target.value) || 0)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-sm font-bold text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">Water Charges (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={waterCharges}
                  onChange={(e) => setWaterCharges(Number(e.target.value) || 0)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-sm font-bold text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">Parking Slot Fee (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={parkingCharges}
                  onChange={(e) => setParkingCharges(Number(e.target.value) || 0)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-sm font-bold text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">Clubhouse Fee (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={clubhouseFee}
                  onChange={(e) => setClubhouseFee(Number(e.target.value) || 0)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-sm font-bold text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>
            </div>

            {/* Auto-generate First Maintenance Invoice */}
            <div className="pt-2 border-t border-slate-200 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoGenerateFirstBill}
                  onChange={(e) => setAutoGenerateFirstBill(e.target.checked)}
                  className="w-4 h-4 accent-slate-900 rounded border-slate-300"
                />
                <span className="text-xs font-bold text-slate-900">
                  Automatically issue first month's active maintenance invoice upon registration
                </span>
              </label>

              {autoGenerateFirstBill && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-1">Billing Period</label>
                    <input
                      type="text"
                      value={billingMonth}
                      onChange={(e) => setBillingMonth(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-900 focus:outline-none focus:border-slate-900"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-1">Invoice Payment Due Date</label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-900 focus:outline-none focus:border-slate-900"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">6. Documents</h4>
            <p className="text-xs text-slate-500">Choose supporting documents. Only file names are recorded in this browser-based demo.</p>
            <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => updateProfileDetails('documents', Array.from(e.currentTarget.files || []).map((file: File) => file.name))}
              className="block w-full text-xs text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-xs file:font-bold file:text-slate-800 hover:file:bg-slate-200" />
            {profileDetails.documents && profileDetails.documents.length > 0 && (
              <ul className="list-inside list-disc text-xs text-slate-700">
                {profileDetails.documents.map((document) => <li key={document}>{document}</li>)}
              </ul>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">7. Profile Preview</h4>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white border border-slate-200 text-slate-500">
                <UserCheck className="h-6 w-6" />
              </div>
              <div>
                <p className="font-bold text-slate-900">{ownerName || 'Resident name'}</p>
                <p className="text-xs text-slate-600">Flat {flatNumber || '—'} • {occupancyStatus}</p>
                <p className="text-xs text-slate-500">{phone || 'Phone number'}{email ? ` • ${email}` : ''}</p>
              </div>
            </div>
            <p className="mt-3 text-[11px] text-slate-500">Login username: {username || '—'} · A resident dashboard account will be created with this flat registration.</p>
          </div>
            </div>
          </div>
          )}

          {/* Form Action Footer */}
          <div className="sticky bottom-0 mt-4 pt-3 pb-1 bg-white/95 backdrop-blur border-t border-slate-200 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-4 rounded-xl text-xs transition-colors"
            >
              Cancel
            </button>
            {availableFlats.length > 0 && (
              <button
                type="submit"
                className="flex-1 bg-slate-900 hover:bg-black text-white font-extrabold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                <span>Assign Resident & Update Records</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
