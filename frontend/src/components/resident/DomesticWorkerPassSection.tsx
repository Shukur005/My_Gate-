import React, { useMemo, useState } from 'react';
import {
  BadgeCheck,
  CalendarClock,
  Camera,
  Copy,
  Heart,
  MapPin,
  MessageCircle,
  Plus,
  RefreshCw,
  Shield,
  UserRound,
  X,
} from 'lucide-react';
import { useSociety } from '../../context/SocietyContext';

const localDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const DomesticWorkerPassSection: React.FC = () => {
  const {
    activeFlat,
    currentUser,
    domesticWorkerPasses,
    createDomesticWorkerPass,
    renewDomesticWorkerPass,
    revokeDomesticWorkerPass,
  } = useSociety();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [workerPhone, setWorkerPhone] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [workType, setWorkType] = useState('');
  const [workerAddress, setWorkerAddress] = useState('');
  const [maritalStatus, setMaritalStatus] = useState<'married' | 'single'>('single');
  const [spouseName, setSpouseName] = useState('');
  const [idDocument, setIdDocument] = useState<{ name: string; dataUrl: string } | null>(null);
  const [formMessage, setFormMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedPassId, setCopiedPassId] = useState<string | null>(null);
  const today = localDate(new Date());
  const passes = useMemo(
    () => domesticWorkerPasses.filter((pass) => pass.flatNumber === activeFlat),
    [domesticWorkerPasses, activeFlat]
  );
  const residentCanManage = currentUser?.role === 'resident' && currentUser.flatNumber === activeFlat;

  const handleCreate = (event: React.FormEvent) => {
    event.preventDefault();
    if (!idDocument) {
      setFormMessage({ type: 'error', text: 'Upload a photo of the worker’s identity document.' });
      return;
    }
    const result = createDomesticWorkerPass({
      firstName,
      lastName,
      workerPhone,
      whatsappNumber,
      workType,
      workerAddress,
      maritalStatus,
      spouseName,
      idDocumentName: idDocument.name,
      idDocumentDataUrl: idDocument.dataUrl,
    });
    setFormMessage({ type: result.success ? 'success' : 'error', text: result.message });
    if (result.success) {
      setFirstName('');
      setLastName('');
      setWorkerPhone('');
      setWhatsappNumber('');
      setWorkType('');
      setWorkerAddress('');
      setMaritalStatus('single');
      setSpouseName('');
      setIdDocument(null);
      setIsFormOpen(false);
    }
  };

  const handleIdDocumentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setIdDocument(null);
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setIdDocument(null);
      setFormMessage({ type: 'error', text: 'Choose an image file for the worker’s photo ID.' });
      event.target.value = '';
      return;
    }
    if (file.size > 1024 * 1024) {
      setIdDocument(null);
      setFormMessage({ type: 'error', text: 'The ID photo must be 1 MB or smaller so it can be saved in this browser.' });
      event.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        setFormMessage({ type: 'error', text: 'Unable to read the selected ID photo. Please try another image.' });
        return;
      }
      setIdDocument({ name: file.name, dataUrl: reader.result });
      setFormMessage(null);
    };
    reader.onerror = () => {
      setFormMessage({ type: 'error', text: 'Unable to read the selected ID photo. Please try another image.' });
    };
    reader.readAsDataURL(file);
  };

  const handleRenew = (passId: string) => {
    const result = renewDomesticWorkerPass(passId);
    setFormMessage({ type: result.success ? 'success' : 'error', text: result.message });
  };

  const handleRevoke = (passId: string, name: string) => {
    if (!window.confirm(`Revoke permanent entry access for ${name}?`)) return;
    const result = revokeDomesticWorkerPass(passId);
    setFormMessage({ type: result.success ? 'success' : 'error', text: result.message });
  };

  const handleCopyCode = async (passId: string, code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedPassId(passId);
      window.setTimeout(() => setCopiedPassId(null), 1800);
    } catch {
      setFormMessage({ type: 'error', text: 'Unable to copy the pass code. Select and copy it manually.' });
    }
  };

  return (
    <section aria-labelledby="household-staff-title" className="overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-sm">
      <header className="flex flex-col gap-4 bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-900 p-5 text-white sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-start gap-3">
          <span className="rounded-xl bg-white/10 p-3 text-emerald-100"><Shield className="h-5 w-5" /></span>
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-emerald-200">Recurring household access</p>
            <h3 id="household-staff-title" className="mt-1 text-lg font-extrabold">Household Staff Management</h3>
            <p className="mt-1 max-w-2xl text-xs leading-5 text-emerald-50/80">
              Register any regular household worker. The resident activates and renews their monthly pass; security checks the four-digit code and resident details at the gate.
            </p>
          </div>
        </div>
        {residentCanManage && (
          <button
            type="button"
            onClick={() => {
              setIsFormOpen((open) => !open);
              setFormMessage(null);
            }}
            className="inline-flex w-fit items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-extrabold text-emerald-950 transition-colors hover:bg-emerald-50"
          >
            {isFormOpen ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {isFormOpen ? 'Close form' : 'Register staff'}
          </button>
        )}
      </header>

      <div className="space-y-4 p-5 sm:p-6">
        {formMessage && (
          <p role="status" className={`rounded-xl border p-3 text-xs font-semibold ${
            formMessage.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
              : 'border-rose-200 bg-rose-50 text-rose-800'
          }`}>
            {formMessage.text}
          </p>
        )}

        {isFormOpen && residentCanManage && (
          <form onSubmit={handleCreate} className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2 sm:p-5">
            <label className="text-xs font-bold text-slate-700">
              First name
              <input
                autoComplete="given-name"
                required
                minLength={2}
                maxLength={60}
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                placeholder="Worker first name"
                className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 font-medium text-slate-900 outline-none focus:border-emerald-600"
              />
            </label>
            <label className="text-xs font-bold text-slate-700">
              Last name
              <input
                autoComplete="family-name"
                required
                minLength={1}
                maxLength={60}
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                placeholder="Worker last name"
                className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 font-medium text-slate-900 outline-none focus:border-emerald-600"
              />
            </label>
            <label className="text-xs font-bold text-slate-700">
              Mobile number
              <input
                autoComplete="tel"
                required
                type="tel"
                maxLength={20}
                value={workerPhone}
                onChange={(event) => setWorkerPhone(event.target.value)}
                placeholder="+91 98765 43210"
                className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 font-medium text-slate-900 outline-none focus:border-emerald-600"
              />
            </label>
            <label className="text-xs font-bold text-slate-700">
              <span className="inline-flex items-center gap-1.5"><MessageCircle className="h-3.5 w-3.5 text-emerald-700" />WhatsApp number <span className="font-medium text-slate-400">(optional)</span></span>
              <input
                autoComplete="tel"
                type="tel"
                maxLength={20}
                value={whatsappNumber}
                onChange={(event) => setWhatsappNumber(event.target.value)}
                placeholder="If different from mobile number"
                className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 font-medium text-slate-900 outline-none focus:border-emerald-600"
              />
            </label>
            <label className="text-xs font-bold text-slate-700 sm:col-span-2">
              Work type
              <input
                required
                minLength={2}
                maxLength={60}
                value={workType}
                onChange={(event) => setWorkType(event.target.value)}
                placeholder="Maid, driver, cook, caregiver, cleaner, gardener, or another role"
                className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 font-medium text-slate-900 outline-none focus:border-emerald-600"
              />
            </label>
            <label className="text-xs font-bold text-slate-700 sm:col-span-2">
              <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-emerald-700" />Home address</span>
              <textarea
                autoComplete="street-address"
                required
                minLength={5}
                maxLength={300}
                rows={2}
                value={workerAddress}
                onChange={(event) => setWorkerAddress(event.target.value)}
                placeholder="Enter the worker’s current residential address"
                className="mt-1.5 w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2.5 font-medium text-slate-900 outline-none focus:border-emerald-600"
              />
            </label>
            <label className="text-xs font-bold text-slate-700">
              <span className="inline-flex items-center gap-1.5"><Heart className="h-3.5 w-3.5 text-emerald-700" />Marital status</span>
              <select
                required
                value={maritalStatus}
                onChange={(event) => {
                  const status = event.target.value as 'married' | 'single';
                  setMaritalStatus(status);
                  if (status === 'single') setSpouseName('');
                }}
                className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 font-medium text-slate-900 outline-none focus:border-emerald-600"
              >
                <option value="single">Single</option>
                <option value="married">Married</option>
              </select>
            </label>
            {maritalStatus === 'married' && (
              <label className="text-xs font-bold text-slate-700">
                Husband / wife name
                <input
                  autoComplete="off"
                  required
                  minLength={2}
                  maxLength={120}
                  value={spouseName}
                  onChange={(event) => setSpouseName(event.target.value)}
                  placeholder="Enter spouse’s full name"
                  className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 font-medium text-slate-900 outline-none focus:border-emerald-600"
                />
              </label>
            )}
            <label className="text-xs font-bold text-slate-700 sm:col-span-2">
              <span className="inline-flex items-center gap-1.5"><Camera className="h-3.5 w-3.5 text-emerald-700" />Photo ID <span className="text-rose-600">*</span></span>
              <input
                required
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleIdDocumentChange}
                className="mt-1.5 block w-full rounded-lg border border-slate-200 bg-white text-xs text-slate-600 file:mr-3 file:border-0 file:bg-emerald-50 file:px-3 file:py-2.5 file:font-bold file:text-emerald-800 hover:file:bg-emerald-100"
              />
              <span className="mt-1 block font-medium text-slate-500">Image only, up to 1 MB. The image is saved in this browser for staff verification.</span>
              {idDocument && <span className="mt-1 block text-emerald-800">Selected: {idDocument.name}</span>}
            </label>
            <p className="text-[11px] leading-5 text-slate-500 sm:col-span-2">
              Registration activates a one-month pass for Flat {activeFlat}. You can renew it during the final seven days or after it expires.
            </p>
            <button type="submit" className="rounded-lg bg-emerald-700 px-4 py-2.5 text-xs font-extrabold text-white hover:bg-emerald-800 sm:col-span-2">
              Create monthly staff pass
            </button>
          </form>
        )}

        {passes.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center">
            <UserRound className="mx-auto h-7 w-7 text-slate-400" />
            <p className="mt-2 text-sm font-bold text-slate-800">No household staff registered</p>
            <p className="mt-1 text-xs text-slate-500">Add a regular worker to issue a monthly, reusable gate pass.</p>
          </div>
        ) : (
          <div className="grid gap-3 xl:grid-cols-2">
            {passes.map((pass) => {
              const renewalDate = new Date(`${pass.validThrough}T00:00:00`);
              renewalDate.setDate(renewalDate.getDate() - 7);
              const renewalOpen = today >= localDate(renewalDate);
              const expired = today > pass.validThrough;
              const isActive = pass.status === 'active' && !expired;
              return (
                <article key={pass.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className="rounded-xl bg-emerald-50 p-2.5 text-emerald-800"><UserRound className="h-5 w-5" /></span>
                      <div>
                        <h4 className="font-extrabold text-slate-950">{pass.workerName}</h4>
                        <p className="mt-0.5 text-xs font-semibold capitalize text-slate-600">{pass.workType} · {pass.workerPhone}</p>
                        <p className="mt-1 text-[11px] text-slate-500">Registered for Flat {pass.flatNumber} · Resident: {pass.residentName}</p>
                        {pass.whatsappNumber && <p className="mt-1 text-[11px] text-slate-500">WhatsApp: {pass.whatsappNumber}</p>}
                      </div>
                    </div>
                    <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-extrabold ${
                      pass.status === 'revoked'
                        ? 'bg-rose-50 text-rose-800'
                        : isActive
                        ? 'bg-emerald-50 text-emerald-800'
                        : 'bg-amber-50 text-amber-900'
                    }`}>
                      {pass.status === 'revoked' ? 'Revoked' : isActive ? (pass.insideSociety ? 'Inside society' : 'Active') : 'Expired'}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-emerald-100 bg-emerald-50/70 p-3">
                    <div>
                      <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-emerald-800">4-digit gate pass</p>
                      <p className="mt-0.5 font-mono text-2xl font-black tracking-[0.25em] text-emerald-950">{pass.passCode}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void handleCopyCode(pass.id, pass.passCode)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-[11px] font-bold text-emerald-900 hover:bg-emerald-100"
                    >
                      <Copy className="h-3.5 w-3.5" />{copiedPassId === pass.id ? 'Copied' : 'Copy code'}
                    </button>
                  </div>

                  <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-600">
                    <CalendarClock className="h-4 w-4 text-slate-500" />
                    <span>Valid {pass.validFrom} through <strong className="text-slate-900">{pass.validThrough}</strong></span>
                  </div>
                  {(pass.workerAddress || pass.maritalStatus || pass.idDocumentDataUrl) && (
                    <div className="mt-3 flex gap-3 rounded-lg bg-slate-50 p-3">
                      {pass.idDocumentDataUrl && (
                        <img
                          src={pass.idDocumentDataUrl}
                          alt={`Photo ID for ${pass.workerName}`}
                          className="h-16 w-20 shrink-0 rounded-md border border-slate-200 object-cover"
                        />
                      )}
                      <div className="min-w-0 space-y-1 text-[11px] text-slate-600">
                        {pass.workerAddress && <p><strong className="text-slate-800">Address:</strong> {pass.workerAddress}</p>}
                        {pass.maritalStatus && (
                          <p>
                            <strong className="text-slate-800">Marital status:</strong> {pass.maritalStatus}
                            {pass.spouseName ? ` · Spouse: ${pass.spouseName}` : ''}
                          </p>
                        )}
                        {pass.idDocumentName && <p className="truncate"><strong className="text-slate-800">Photo ID:</strong> {pass.idDocumentName}</p>}
                      </div>
                    </div>
                  )}
                  {pass.insideSociety && pass.lastEntryAt && (
                    <p className="mt-2 text-[11px] font-semibold text-emerald-800">
                      Last entered at {new Date(pass.lastEntryAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {pass.lastEntryGate}
                    </p>
                  )}

                  {residentCanManage && pass.status === 'active' && (
                    <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-3">
                      <button
                        type="button"
                        disabled={!renewalOpen}
                        onClick={() => handleRenew(pass.id)}
                        title={renewalOpen ? 'Extend access by one month' : `Renewal opens ${localDate(renewalDate)}`}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-2 text-[11px] font-extrabold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />Renew one month
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRevoke(pass.id, pass.workerName)}
                        className="rounded-lg border border-rose-200 px-3 py-2 text-[11px] font-bold text-rose-700 hover:bg-rose-50"
                      >
                        Revoke access
                      </button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}

        <p className="flex items-start gap-2 text-[11px] leading-5 text-slate-500">
          <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
          Show the same worker and resident details to security as registered above. The four-digit code is reusable while the monthly pass is active; entry and exit are logged separately.
        </p>
      </div>
    </section>
  );
};
