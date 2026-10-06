import React, { useState, useEffect } from 'react';
import { useSociety } from '../../context/SocietyContext';
import { FlatDetail, EmergencyContact } from '../../types';
import {
  User,
  Phone,
  Mail,
  Car,
  ShieldAlert,
  Plus,
  Trash2,
  Save,
  X,
  CheckCircle2,
  Building,
  Users,
  Check,
  Sparkles,
  AlertCircle,
  PhoneCall,
  Shield,
  Briefcase,
} from 'lucide-react';

interface ResidentSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ResidentSettingsModal: React.FC<ResidentSettingsModalProps> = ({ isOpen, onClose }) => {
  const { activeFlat, flats, updateResidentProfile } = useSociety();

  const currentFlat = flats.find((f) => f.flatNumber === activeFlat) || flats[0];

  // Form State
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [occupancyStatus, setOccupancyStatus] = useState<'Owner' | 'Tenant' | 'Vacant'>('Owner');
  const [familyMembersCount, setFamilyMembersCount] = useState<number>(1);

  // Vehicles list state
  const [vehicles, setVehicles] = useState<{ type: 'Car' | 'Bike'; number: string }[]>([]);
  const [newVehicleType, setNewVehicleType] = useState<'Car' | 'Bike'>('Car');
  const [newVehicleNumber, setNewVehicleNumber] = useState('');

  // Emergency Contacts state
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [newContactName, setNewContactName] = useState('');
  const [newContactRel, setNewContactRel] = useState('Spouse');
  const [newContactPhone, setNewContactPhone] = useState('');

  // Notification Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (currentFlat) {
      setOwnerName(currentFlat.ownerName || '');
      setPhone(currentFlat.phone || '');
      setEmail(currentFlat.email || '');
      setOccupancyStatus(currentFlat.occupancyStatus || 'Owner');
      setFamilyMembersCount(currentFlat.familyMembersCount || 1);
      setVehicles(currentFlat.vehicles || []);
      setEmergencyContacts(currentFlat.emergencyContacts || []);
    }
  }, [currentFlat, isOpen]);

  if (!isOpen) return null;

  // Vehicle handlers
  const handleAddVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVehicleNumber.trim()) return;

    const formattedNum = newVehicleNumber.trim().toUpperCase();
    if (vehicles.some((v) => v.number === formattedNum)) {
      alert('This vehicle number is already added!');
      return;
    }

    setVehicles((prev) => [...prev, { type: newVehicleType, number: formattedNum }]);
    setNewVehicleNumber('');
  };

  const handleRemoveVehicle = (index: number) => {
    setVehicles((prev) => prev.filter((_, i) => i !== index));
  };

  // Emergency Contact handlers
  const handleAddEmergencyContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName.trim() || !newContactPhone.trim()) return;

    const newContact: EmergencyContact = {
      id: `ec-${Date.now()}`,
      name: newContactName.trim(),
      relationship: newContactRel.trim(),
      phone: newContactPhone.trim(),
    };

    setEmergencyContacts((prev) => [...prev, newContact]);
    setNewContactName('');
    setNewContactPhone('');
  };

  const handleRemoveEmergencyContact = (id: string) => {
    setEmergencyContacts((prev) => prev.filter((c) => c.id !== id));
  };

  // Save changes handler
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerName.trim() || !phone.trim() || !email.trim()) {
      alert('Please fill out all mandatory contact fields.');
      return;
    }

    const res = updateResidentProfile(activeFlat, {
      ownerName: ownerName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      occupancyStatus,
      familyMembersCount: Math.max(1, familyMembersCount),
      vehicles,
      emergencyContacts,
    });

    if (res.success) {
      setToastMessage(res.message);
      setTimeout(() => {
        setToastMessage(null);
        onClose();
      }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[calc(100dvh-2rem)] overflow-hidden shadow-2xl border border-slate-200 my-4 animate-fade-in relative flex flex-col">
        {/* Toast Overlay */}
        {toastMessage && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-900 text-emerald-100 border border-emerald-500/50 px-5 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold animate-bounce">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white p-5 sm:p-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500 text-slate-950 rounded-2xl font-black shadow-md">
              <User className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-lg sm:text-xl text-white">Resident Account Settings</h3>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                  Unit {currentFlat?.flatNumber}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Update your contact information, vehicle permits, and emergency contacts
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSaveProfile} className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-7 lg:p-8 space-y-6">
          {/* SECTION 1: CONTACT INFORMATION */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-600" />
                <span>1. Primary Contact Information</span>
              </h4>
              <span className="text-[11px] text-slate-400 font-semibold">Flat Unit: {currentFlat?.flatNumber}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
              <div className="sm:col-span-1 lg:col-span-3">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Resident / Owner Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                  />
                </div>
              </div>

              <div className="sm:col-span-1 lg:col-span-3">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Primary Mobile Phone Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                  />
                </div>
              </div>

              <div className="sm:col-span-1 lg:col-span-3">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="resident@society.org"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:col-span-1 lg:col-span-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Occupancy</label>
                  <select
                    value={occupancyStatus}
                    onChange={(e) => setOccupancyStatus(e.target.value as 'Owner' | 'Tenant')}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
                  >
                    <option value="Owner">Owner</option>
                    <option value="Tenant">Tenant</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Family Size</label>
                  <input
                    type="number"
                    min={1}
                    max={15}
                    value={familyMembersCount}
                    onChange={(e) => setFamilyMembersCount(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: REGISTERED VEHICLES */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Car className="w-4 h-4 text-emerald-600" />
                <span>2. Registered Vehicles ({vehicles.length})</span>
              </h4>
              <span className="text-[11px] text-slate-400 font-semibold">Automatic Gate RFID Permits</span>
            </div>

            {/* List of existing vehicles */}
            {vehicles.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {vehicles.map((v, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3 flex items-center justify-between shadow-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                        <Car className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-black text-slate-900 block font-mono tracking-wider">
                          {v.number}
                        </span>
                        <span className="text-[10px] text-slate-500 font-bold uppercase">{v.type} Permit</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveVehicle(idx)}
                      className="text-slate-400 hover:text-rose-600 p-1.5 transition-colors"
                      title="Remove Vehicle"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-2xl text-xs text-amber-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>No vehicle permits registered. Add your vehicle plate numbers for fast security gate entry.</span>
              </div>
            )}

            {/* Add new vehicle sub-form */}
            <div className="bg-slate-900 text-white p-3.5 rounded-2xl space-y-2 border border-slate-800">
              <span className="text-[11px] font-extrabold uppercase text-slate-300 block">Add New Vehicle Permit</span>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                <select
                  value={newVehicleType}
                  onChange={(e) => setNewVehicleType(e.target.value as 'Car' | 'Bike')}
                  className="bg-slate-800 text-white text-xs font-bold border border-slate-700 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500 sm:col-span-4"
                >
                  <option value="Car">4-Wheeler (Car)</option>
                  <option value="Bike">2-Wheeler (Bike/Scooter)</option>
                </select>

                <input
                  type="text"
                  placeholder="Plate No. e.g. KA-01-MJ-4021"
                  value={newVehicleNumber}
                  onChange={(e) => setNewVehicleNumber(e.target.value)}
                  className="bg-slate-800 text-white text-xs font-bold border border-slate-700 rounded-xl px-3 py-2 sm:col-span-5 focus:outline-none focus:border-emerald-500 font-mono"
                />

                <button
                  type="button"
                  onClick={handleAddVehicle}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs px-4 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 sm:col-span-3"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Vehicle</span>
                </button>
              </div>
            </div>
          </div>

          {/* SECTION 3: EMERGENCY CONTACT NUMBERS */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <span>3. Emergency Contacts ({emergencyContacts.length})</span>
              </h4>
              <span className="text-[11px] text-slate-400 font-semibold">Notified during Emergency SOS</span>
            </div>

            {/* Emergency Contacts List */}
            {emergencyContacts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {emergencyContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="bg-rose-50/80 border border-rose-200/90 rounded-2xl p-3 flex items-center justify-between shadow-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-rose-100 text-rose-700 rounded-xl">
                        <PhoneCall className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-extrabold text-slate-900 block">{contact.name}</span>
                        <span className="text-[10px] text-rose-800 font-bold">
                          {contact.relationship} • {contact.phone}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveEmergencyContact(contact.id)}
                      className="text-slate-400 hover:text-rose-600 p-1.5 transition-colors"
                      title="Remove Emergency Contact"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 bg-rose-50 border border-rose-200/80 rounded-2xl text-xs text-rose-900 flex items-center gap-2">
                <Shield className="w-4 h-4 text-rose-600 shrink-0" />
                <span>No emergency contact numbers listed. Adding immediate family or doctor details ensures quick security response.</span>
              </div>
            )}

            {/* Add Emergency Contact Form */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2">
              <span className="text-[11px] font-extrabold uppercase text-slate-700 block">
                Add Emergency Contact Person
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Contact Name"
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
                />

                <select
                  value={newContactRel}
                  onChange={(e) => setNewContactRel(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
                >
                  <option value="Spouse">Spouse</option>
                  <option value="Parent">Parent</option>
                  <option value="Sibling">Sibling / Family</option>
                  <option value="Doctor">Family Physician / Doctor</option>
                  <option value="Local Guardian">Local Guardian</option>
                  <option value="Friend">Neighbor / Friend</option>
                </select>

                <input
                  type="text"
                  placeholder="Phone Number"
                  value={newContactPhone}
                  onChange={(e) => setNewContactPhone(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleAddEmergencyContact}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                >
                  <Plus className="w-4 h-4 text-emerald-400" />
                  <span>Add Emergency Contact</span>
                </button>
              </div>
            </div>
          </div>

          {/* Modal Footer Controls */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-xl text-xs transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-6 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Save Settings</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
