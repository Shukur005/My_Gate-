import React, { useMemo, useState } from 'react';
import { Camera, ClipboardList, Heart, MapPin, MessageCircle, Plus, ShieldCheck, UserRound, X } from 'lucide-react';
import { useSociety } from '../../context/SocietyContext';
import type { DailyStaff } from '../../types';

type SocietyStaffForm = {
  firstName: string;
  lastName: string;
  role: string;
  phone: string;
  whatsappNumber: string;
  address: string;
  maritalStatus: 'married' | 'single';
  spouseName: string;
  identityProofType: string;
  identityNumber: string;
  assignedDuties: string;
};

const EMPTY_FORM: SocietyStaffForm = {
  firstName: '',
  lastName: '',
  role: '',
  phone: '',
  whatsappNumber: '',
  address: '',
  maritalStatus: 'single',
  spouseName: '',
  identityProofType: 'Aadhaar Card',
  identityNumber: '',
  assignedDuties: '',
};

const fieldClassName = 'mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-emerald-600';

export const SocietyStaffManagementSection: React.FC = () => {
  const { role, currentUser, staff, addSocietyStaff, currentSocietyName } = useSociety();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [idPhoto, setIdPhoto] = useState<{ name: string; dataUrl: string } | null>(null);
  const [message, setMessage] = useState<{ success: boolean; text: string } | null>(null);
  const [expandedStaffId, setExpandedStaffId] = useState<string | null>(null);
  const isAdmin = role === 'admin' && currentUser?.role === 'admin';

  const sortedStaff = useMemo(
    () => staff
      .filter((person) => person.societyName === currentSocietyName)
      .sort((first, second) => first.name.localeCompare(second.name)),
    [staff, currentSocietyName]
  );

  const updateField = <K extends keyof SocietyStaffForm>(field: K, value: SocietyStaffForm[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setIdPhoto(null);
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setIdPhoto(null);
      setMessage({ success: false, text: 'Choose a JPG, PNG, or WebP image for ID proof.' });
      event.target.value = '';
      return;
    }
    if (file.size > 1024 * 1024) {
      setIdPhoto(null);
      setMessage({ success: false, text: 'ID proof images must be 1 MB or smaller.' });
      event.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        setMessage({ success: false, text: 'Could not read this ID photo. Please select it again.' });
        return;
      }
      setIdPhoto({ name: file.name, dataUrl: reader.result });
      setMessage(null);
    };
    reader.onerror = () => setMessage({ success: false, text: 'Could not read this ID photo. Please select another image.' });
    reader.readAsDataURL(file);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setForm(EMPTY_FORM);
    setIdPhoto(null);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!idPhoto) {
      setMessage({ success: false, text: 'Upload a photo of the staff member’s ID proof.' });
      return;
    }
    const result = addSocietyStaff({
      ...form,
      identityPhotoUrl: idPhoto.dataUrl,
    });
    setMessage({ success: result.success, text: result.message });
    if (result.success) closeForm();
  };

  return (
    <section aria-labelledby="society-staff-title" className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <header className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700">
            <UserRound className="h-4 w-4" />
            Society workforce
          </div>
          <h2 id="society-staff-title" className="mt-1 text-xl font-bold tracking-tight text-slate-900">Society Staff & Duties</h2>
          <p className="mt-1 text-sm text-slate-500">Register and manage {currentSocietyName} staff, including cleaners, gardeners, and other assigned workers.</p>
        </div>
        {isAdmin && (
          <button
            type="button"
            onClick={() => {
              setIsFormOpen((open) => !open);
              setMessage(null);
            }}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-700"
          >
            {isFormOpen ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {isFormOpen ? 'Close form' : 'Add society staff'}
          </button>
        )}
      </header>

      {message && (
        <p role="status" className={`rounded-lg border px-3 py-2.5 text-sm ${
          message.success ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-rose-200 bg-rose-50 text-rose-800'
        }`}>
          {message.text}
        </p>
      )}

      {isFormOpen && isAdmin && (
        <form onSubmit={handleSubmit} className="grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2 sm:p-5">
          <label className="text-xs font-bold text-slate-700">
            First name
            <input required minLength={2} maxLength={60} autoComplete="given-name" value={form.firstName} onChange={(event) => updateField('firstName', event.target.value)} className={fieldClassName} />
          </label>
          <label className="text-xs font-bold text-slate-700">
            Last name
            <input required minLength={1} maxLength={60} autoComplete="family-name" value={form.lastName} onChange={(event) => updateField('lastName', event.target.value)} className={fieldClassName} />
          </label>
          <label className="text-xs font-bold text-slate-700">
            Staff role / job title
            <input required minLength={2} maxLength={80} value={form.role} onChange={(event) => updateField('role', event.target.value)} placeholder="Cleaner, sweeper, maid, gardener..." className={fieldClassName} />
          </label>
          <label className="text-xs font-bold text-slate-700">
            Mobile number
            <input required type="tel" maxLength={20} autoComplete="tel" value={form.phone} onChange={(event) => updateField('phone', event.target.value)} placeholder="+91 98765 43210" className={fieldClassName} />
          </label>
          <label className="text-xs font-bold text-slate-700">
            <span className="inline-flex items-center gap-1.5"><MessageCircle className="h-3.5 w-3.5 text-emerald-700" />WhatsApp number <span className="font-medium text-slate-400">(optional)</span></span>
            <input type="tel" maxLength={20} value={form.whatsappNumber} onChange={(event) => updateField('whatsappNumber', event.target.value)} placeholder="If different from mobile" className={fieldClassName} />
          </label>
          <label className="text-xs font-bold text-slate-700">
            <span className="inline-flex items-center gap-1.5"><Heart className="h-3.5 w-3.5 text-emerald-700" />Marital status</span>
            <select value={form.maritalStatus} onChange={(event) => {
              const value = event.target.value as SocietyStaffForm['maritalStatus'];
              updateField('maritalStatus', value);
              if (value === 'single') updateField('spouseName', '');
            }} className={fieldClassName}>
              <option value="single">Single</option>
              <option value="married">Married</option>
            </select>
          </label>
          {form.maritalStatus === 'married' && (
            <label className="text-xs font-bold text-slate-700">
              Husband / wife name
              <input required minLength={2} maxLength={120} value={form.spouseName} onChange={(event) => updateField('spouseName', event.target.value)} className={fieldClassName} />
            </label>
          )}
          <label className="text-xs font-bold text-slate-700">
            ID proof type
            <select value={form.identityProofType} onChange={(event) => updateField('identityProofType', event.target.value)} className={fieldClassName}>
              <option>Aadhaar Card</option>
              <option>Voter ID</option>
              <option>Driving Licence</option>
              <option>Passport</option>
              <option>Other Government ID</option>
            </select>
          </label>
          <label className="text-xs font-bold text-slate-700">
            ID number <span className="font-medium text-slate-400">(optional)</span>
            <input maxLength={40} value={form.identityNumber} onChange={(event) => updateField('identityNumber', event.target.value)} className={fieldClassName} />
          </label>
          <label className="text-xs font-bold text-slate-700 sm:col-span-2">
            <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-emerald-700" />Home address</span>
            <textarea required minLength={5} maxLength={300} rows={2} autoComplete="street-address" value={form.address} onChange={(event) => updateField('address', event.target.value)} className={`${fieldClassName} resize-y`} />
          </label>
          <label className="text-xs font-bold text-slate-700 sm:col-span-2">
            <span className="inline-flex items-center gap-1.5"><Camera className="h-3.5 w-3.5 text-emerald-700" />Photo of ID proof <span className="text-rose-600">*</span></span>
            <input required type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhotoChange} className="mt-1.5 block w-full rounded-lg border border-slate-200 bg-white text-xs text-slate-600 file:mr-3 file:border-0 file:bg-emerald-50 file:px-3 file:py-2.5 file:font-bold file:text-emerald-800" />
            <span className="mt-1 block font-medium text-slate-500">JPG, PNG, or WebP, up to 1 MB. Stored in this browser for authorized staff viewing.</span>
            {idPhoto && <span className="mt-1 block text-emerald-800">Selected: {idPhoto.name}</span>}
          </label>
          <label className="text-xs font-bold text-slate-700 sm:col-span-2">
            <span className="inline-flex items-center gap-1.5"><ClipboardList className="h-3.5 w-3.5 text-emerald-700" />Assigned duties</span>
            <textarea required minLength={3} maxLength={500} rows={3} value={form.assignedDuties} onChange={(event) => updateField('assignedDuties', event.target.value)} placeholder="Describe duties assigned by the administrator" className={`${fieldClassName} resize-y`} />
          </label>
          <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-800 sm:col-span-2">
            <ShieldCheck className="h-4 w-4" />Save society staff
          </button>
        </form>
      )}

      {sortedStaff.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">No society staff have been registered yet.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {sortedStaff.map((person: DailyStaff) => {
            const expanded = expandedStaffId === person.id;
            return (
              <article key={person.id} className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                <button
                  type="button"
                  aria-expanded={expanded}
                  onClick={() => setExpandedStaffId(expanded ? null : person.id)}
                  className="flex w-full items-start justify-between gap-3 p-4 text-left hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-600"
                >
                  <span>
                    <strong className="block text-sm text-slate-900">{person.name}</strong>
                    <span className="mt-0.5 block text-xs text-slate-600">{person.role}</span>
                    <span className="mt-2 block text-[11px] text-slate-500">{person.assignedDuties || 'Duties not recorded'}</span>
                  </span>
                  <span className={`shrink-0 rounded-lg px-3 py-1.5 text-[11px] font-bold ${person.isPresentToday ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-700'}`}>
                    {person.isPresentToday ? 'Checked-In' : 'Not checked in'}
                  </span>
                </button>
                {expanded && (
                  <div className="border-t border-slate-200 bg-white p-4">
                    <div className="flex gap-3">
                      {person.identityPhotoUrl ? (
                        <img src={person.identityPhotoUrl} alt={`ID proof for ${person.name}`} className="h-32 w-40 rounded-lg border border-slate-200 object-contain" />
                      ) : (
                        <div className="flex h-24 w-28 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-slate-400"><UserRound className="h-7 w-7" /></div>
                      )}
                      <dl className="grid min-w-0 flex-1 gap-2 text-[11px] sm:grid-cols-2">
                        <div><dt className="text-slate-500">Mobile</dt><dd className="font-semibold text-slate-900">{person.phone}</dd></div>
                        <div><dt className="text-slate-500">WhatsApp</dt><dd className="font-semibold text-slate-900">{person.whatsappNumber || 'Not provided'}</dd></div>
                        <div><dt className="text-slate-500">Marital status</dt><dd className="font-semibold capitalize text-slate-900">{person.maritalStatus || 'Not recorded'}</dd></div>
                        {person.spouseName && <div><dt className="text-slate-500">Husband / wife</dt><dd className="font-semibold text-slate-900">{person.spouseName}</dd></div>}
                        <div><dt className="text-slate-500">ID proof</dt><dd className="font-semibold text-slate-900">{person.identityProofType || 'Not recorded'}{person.identityNumber ? ` · ${person.identityNumber}` : ''}</dd></div>
                        <div className="sm:col-span-2"><dt className="text-slate-500">Address</dt><dd className="font-semibold text-slate-900">{person.address || 'Not recorded'}</dd></div>
                        <div className="sm:col-span-2"><dt className="text-slate-500">Assigned duties</dt><dd className="font-semibold text-slate-900">{person.assignedDuties || 'Not recorded'}</dd></div>
                      </dl>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};
