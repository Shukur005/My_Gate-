import React, { useMemo, useState } from 'react';
import { useSociety } from '../../context/SocietyContext';
import { AuthUser } from '../../types';
import {
  Clock3,
  Edit,
  FileBadge,
  FileText,
  IdCard,
  MapPin,
  Phone,
  Plus,
  Search,
  Shield,
  Upload,
  User,
  UserCheck,
  UserRound,
  UserX,
  X,
} from 'lucide-react';

type GuardFormData = {
  name: string;
  phone: string;
  phoneCountryCode: string;
  email: string;
  badgeId: string;
  assignedGate: string;
  shiftType: NonNullable<AuthUser['shiftType']>;
  assignedDuty: string;
  joiningDate: string;
  endDate: string;
  employmentType: NonNullable<AuthUser['employmentType']>;
  guardStatus: NonNullable<AuthUser['guardStatus']>;
  avatarUrl: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup: string;
  address: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  identityProofType: string;
  identityNumber: string;
  guardNotes: string;
  guardDocuments: string[];
};

const EMPTY_GUARD: GuardFormData = {
  name: '',
  phone: '',
  phoneCountryCode: '+91',
  email: '',
  badgeId: '',
  assignedGate: 'Main Gate 1',
  shiftType: 'Morning',
  assignedDuty: 'Gate entry and visitor verification',
  joiningDate: new Date().toISOString().slice(0, 10),
  endDate: '',
  employmentType: 'Full-time',
  guardStatus: 'active',
  avatarUrl: '',
  dateOfBirth: '',
  gender: 'Male',
  bloodGroup: 'O+',
  address: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  identityProofType: 'Aadhaar Card',
  identityNumber: '',
  guardNotes: '',
  guardDocuments: [],
};

const fieldClassName =
  'w-full rounded-md border border-blue-100 bg-white px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100';

const sectionTitleClassName = 'text-xs font-bold text-slate-800';
const sectionSubTitleClassName = 'text-[10px] text-slate-500';

export const GuardManagementSection: React.FC = () => {
  const { users, shiftLogs, createGuard, updateGuard } = useSociety();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [historyGuardId, setHistoryGuardId] = useState<string | null>(null);
  const [editingGuard, setEditingGuard] = useState<AuthUser | null>(null);
  const [formData, setFormData] = useState<GuardFormData>(EMPTY_GUARD);
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState('');
  const [notice, setNotice] = useState('');

  const guards = useMemo(
    () =>
      users
        .filter((user) => user.role === 'guard')
        .sort((first, second) => first.name.localeCompare(second.name)),
    [users]
  );
  const activeCount = guards.filter((guard) => guard.guardStatus !== 'inactive').length;
  const inactiveCount = guards.length - activeCount;
  const activeShiftCount = shiftLogs.filter((shift) => shift.status === 'active').length;

  const filteredGuards = guards.filter((guard) => {
    const query = search.trim().toLowerCase();
    const matchesQuery =
      !query ||
      [guard.name, guard.badgeId, guard.phone, guard.assignedGate, guard.assignedDuty]
        .some((value) => value?.toLowerCase().includes(query));
    const matchesStatus = statusFilter === 'all' || (guard.guardStatus || 'active') === statusFilter;
    return matchesQuery && matchesStatus;
  });

  const filteredShifts = shiftLogs
    .filter((shift) => {
      if (!historyGuardId) return true;
      const guard = guards.find((item) => item.id === historyGuardId);
      return guard?.badgeId === shift.guardBadgeId || guard?.name === shift.guardName;
    })
    .sort((first, second) => `${second.date} ${second.startTime}`.localeCompare(`${first.date} ${first.startTime}`));

  const openCreateForm = () => {
    setEditingGuard(null);
    setFormData(EMPTY_GUARD);
    setFormError('');
    setShowForm(true);
  };

  const openEditForm = (guard: AuthUser) => {
    setEditingGuard(guard);
    setFormData({
      name: guard.name,
      phone: guard.phone?.replace(/^\+\d{1,3}\s*/, '') || '',
      phoneCountryCode: guard.phone?.match(/^\+\d{1,3}/)?.[0] || '+91',
      email: guard.email || '',
      badgeId: guard.badgeId || '',
      assignedGate: guard.assignedGate || '',
      shiftType: guard.shiftType || 'Morning',
      assignedDuty: guard.assignedDuty || '',
      joiningDate: guard.joiningDate || '',
      endDate: guard.endDate || '',
      employmentType: guard.employmentType || 'Full-time',
      guardStatus: guard.guardStatus || 'active',
      avatarUrl: guard.avatarUrl || '',
      dateOfBirth: guard.dateOfBirth || '',
      gender: guard.gender || 'Male',
      bloodGroup: guard.bloodGroup || 'O+',
      address: guard.address || '',
      emergencyContactName: guard.emergencyContactName || '',
      emergencyContactPhone: guard.emergencyContactPhone?.replace(/^\+\d{1,3}\s*/, '') || '',
      identityProofType: guard.identityProofType || 'Aadhaar Card',
      identityNumber: guard.identityNumber || '',
      guardNotes: guard.guardNotes || '',
      guardDocuments: guard.guardDocuments || [],
    });
    setFormError('');
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingGuard(null);
    setFormError('');
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError('');
    setNotice('');
    if (!formData.name.trim() || !formData.phone.trim() || !formData.badgeId.trim() ||
      !formData.assignedGate.trim() || !formData.assignedDuty.trim() || !formData.joiningDate) {
      setFormError('Complete all required guard and duty details before saving.');
      return;
    }

    const guardDetails = {
      name: formData.name,
      phone: `${formData.phoneCountryCode} ${formData.phone.trim()}`,
      assignedGate: formData.assignedGate,
      shiftType: formData.shiftType,
      assignedDuty: formData.assignedDuty,
      guardStatus: formData.guardStatus,
      badgeId: formData.badgeId,
      email: formData.email.trim() || editingGuard?.email,
      avatarUrl: formData.avatarUrl,
      joiningDate: formData.joiningDate,
      endDate: formData.endDate || undefined,
      employmentType: formData.employmentType,
      dateOfBirth: formData.dateOfBirth,
      gender: formData.gender,
      bloodGroup: formData.bloodGroup,
      address: formData.address,
      emergencyContactName: formData.emergencyContactName,
      emergencyContactPhone: formData.emergencyContactPhone
        ? `${formData.phoneCountryCode} ${formData.emergencyContactPhone.trim()}`
        : '',
      identityProofType: formData.identityProofType,
      identityNumber: formData.identityNumber,
      guardNotes: formData.guardNotes,
      guardDocuments: formData.guardDocuments,
    };
    const result = editingGuard
      ? updateGuard(editingGuard.id, guardDetails)
      : createGuard({ ...guardDetails, joiningDate: formData.joiningDate });

    if (!result.success) {
      setFormError(result.message);
      return;
    }
    setNotice(result.message);
    closeForm();
  };

  const toggleStatus = (guard: AuthUser) => {
    const nextStatus = guard.guardStatus === 'inactive' ? 'active' : 'inactive';
    const result = updateGuard(guard.id, { guardStatus: nextStatus });
    setNotice(result.message);
  };

  const handlePhotoSelect = (file?: File) => {
    if (!file) return;
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setFormError('Choose a JPG or PNG profile photo.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setFormError('Profile photos must be 2 MB or smaller.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const avatarUrl = reader.result;
      if (typeof avatarUrl === 'string') {
        setFormData((current) => ({ ...current, avatarUrl }));
        setFormError('');
      }
    };
    reader.onerror = () => setFormError('The profile photo could not be read. Please try another file.');
    reader.readAsDataURL(file);
  };

  const handleDocumentSelect = (files: FileList | null) => {
    if (!files?.length) return;
    const selectedFiles = Array.from(files);
    const invalidFile = selectedFiles.find((file) => file.size > 5 * 1024 * 1024);
    if (invalidFile) {
      setFormError(`${invalidFile.name} is larger than the 5 MB upload limit.`);
      return;
    }
    setFormData((current) => ({
      ...current,
      guardDocuments: Array.from(new Set([...current.guardDocuments, ...selectedFiles.map((file) => file.name)])),
    }));
    setFormError('');
  };

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs sm:p-6">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700">
              <Shield className="h-4 w-4" />
              Security operations
            </div>
            <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">Guard roster & duty management</h2>
            <p className="mt-1 text-sm text-slate-500">
              Manage guard profiles, gate assignments, shift schedules, and historical duty records.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-700"
          >
            <Plus className="h-4 w-4" />
            Add guard
          </button>
        </div>

        {notice && (
          <div role="status" className="mt-4 flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            <span>{notice}</span>
            <button type="button" aria-label="Dismiss notification" onClick={() => setNotice('')}>
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { label: 'Active guards', value: activeCount, icon: UserCheck, tone: 'text-emerald-700 bg-emerald-50' },
            { label: 'Inactive guards', value: inactiveCount, icon: UserX, tone: 'text-slate-600 bg-slate-100' },
            { label: 'Active shifts', value: activeShiftCount, icon: Clock3, tone: 'text-blue-700 bg-blue-50' },
          ].map(({ label, value, icon: Icon, tone }) => (
            <div key={label} className="flex items-center gap-3 rounded-lg border border-slate-100 p-4">
              <span className={`rounded-lg p-2 ${tone}`}><Icon className="h-5 w-5" /></span>
              <div>
                <div className="text-xl font-bold text-slate-900">{value}</div>
                <div className="text-xs font-medium text-slate-500">{label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <label className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, badge, gate, or duty..."
              className={`${fieldClassName} pl-9`}
            />
          </label>
          <select
            aria-label="Filter guards by status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
            className={`${fieldClassName} sm:w-44`}
          >
            <option value="all">All guard statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wide text-slate-500">
                <th className="px-3 py-3">Guard details</th>
                <th className="px-3 py-3">Badge</th>
                <th className="px-3 py-3">Duty & gate</th>
                <th className="px-3 py-3">Shift</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredGuards.map((guard) => {
                const inactive = guard.guardStatus === 'inactive';
                return (
                  <tr key={guard.id} className="align-top hover:bg-slate-50/70">
                    <td className="px-3 py-4">
                      <div className="font-semibold text-slate-900">{guard.name}</div>
                      <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                        <Phone className="h-3.5 w-3.5" />{guard.phone || 'No phone recorded'}
                      </div>
                    </td>
                    <td className="px-3 py-4 font-mono text-xs font-semibold text-slate-700">{guard.badgeId || '—'}</td>
                    <td className="px-3 py-4">
                      <div className="font-medium text-slate-800">{guard.assignedDuty || 'General security duty'}</div>
                      <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                        <MapPin className="h-3.5 w-3.5" />{guard.assignedGate || 'Unassigned gate'}
                      </div>
                    </td>
                    <td className="px-3 py-4 text-slate-700">{guard.shiftType || 'Morning'}</td>
                    <td className="px-3 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${inactive ? 'bg-slate-100 text-slate-600' : 'bg-emerald-50 text-emerald-700'}`}>
                        {inactive ? 'Inactive' : 'Active'}
                      </span>
                    </td>
                    <td className="px-3 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEditForm(guard)}
                          className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                        >
                          <Edit className="h-3.5 w-3.5" />Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setHistoryGuardId(historyGuardId === guard.id ? null : guard.id)}
                          className="rounded-md px-2 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-50"
                        >
                          History
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleStatus(guard)}
                          className={`rounded-md px-2 py-1.5 text-xs font-semibold ${inactive ? 'text-emerald-700 hover:bg-emerald-50' : 'text-rose-700 hover:bg-rose-50'}`}
                        >
                          {inactive ? 'Activate' : 'Deactivate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredGuards.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-10 text-center text-sm text-slate-500">
                    No guards match this search or status filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs sm:p-6">
        <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {historyGuardId
                ? `Shift history — ${guards.find((guard) => guard.id === historyGuardId)?.name || 'Guard'}`
                : 'Previous guard & shift records'}
            </h3>
            <p className="mt-1 text-sm text-slate-500">Completed and active shifts remain available for review, including incident actions.</p>
          </div>
          {historyGuardId && (
            <button type="button" onClick={() => setHistoryGuardId(null)} className="text-sm font-semibold text-blue-700 hover:text-blue-900">
              Show all history
            </button>
          )}
        </div>
        <div className="space-y-3">
          {filteredShifts.map((shift) => (
            <details key={shift.id} className="rounded-lg border border-slate-200">
              <summary className="flex cursor-pointer list-none flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="font-semibold text-slate-900">{shift.guardName}</div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span>{shift.guardBadgeId}</span>
                    <span>{shift.date}</span>
                    <span>{shift.shiftType}: {shift.startTime}{shift.endTime ? ` – ${shift.endTime}` : ' (in progress)'}</span>
                    <span>{shift.gateStation}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold capitalize text-slate-700">{shift.status.replace('_', ' ')}</span>
                  <span className="text-slate-500">{shift.incidents.length} incident{shift.incidents.length === 1 ? '' : 's'}</span>
                </div>
              </summary>
              <div className="border-t border-slate-100 bg-slate-50/60 p-4 text-sm">
                <div className="grid gap-2 text-xs text-slate-600 sm:grid-cols-3">
                  <span>Visitors processed: <strong className="text-slate-800">{shift.totalVisitorsProcessed ?? 0}</strong></span>
                  <span>Denied entries: <strong className="text-slate-800">{shift.deniedEntriesCount ?? 0}</strong></span>
                  <span>Handed over to: <strong className="text-slate-800">{shift.handedOverTo || '—'}</strong></span>
                </div>
                {shift.handoverNotes && <p className="mt-3 text-xs leading-relaxed text-slate-600">{shift.handoverNotes}</p>}
                {shift.incidents.length > 0 && (
                  <ul className="mt-3 space-y-2">
                    {shift.incidents.map((incident) => (
                      <li key={incident.id} className="rounded-md border border-slate-200 bg-white p-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <strong className="text-sm text-slate-800">{incident.title}</strong>
                          <span className="text-xs capitalize text-slate-500">{incident.severity} · {incident.date} {incident.timestamp}</span>
                        </div>
                        <p className="mt-1 text-xs text-slate-600">{incident.description}</p>
                        <p className="mt-2 text-xs text-slate-700"><strong>Action taken:</strong> {incident.actionTaken}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </details>
          ))}
          {filteredShifts.length === 0 && (
            <p className="rounded-lg border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500">
              No shift history is recorded for this guard yet.
            </p>
          )}
        </div>
      </section>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#101c31]/55 p-2 backdrop-blur-sm sm:p-4">
          <div role="dialog" aria-modal="true" aria-labelledby="guard-form-title" className="flex max-h-[96vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-2xl">
            <div className="flex shrink-0 items-center justify-between bg-gradient-to-r from-[#132642] to-[#263d60] px-4 py-3 text-white sm:px-5">
              <div className="flex items-center gap-3">
                <span className="rounded-lg bg-emerald-400/15 p-2 text-emerald-300"><Shield className="h-6 w-6" /></span>
                <div>
                  <h3 id="guard-form-title" className="text-base font-bold">{editingGuard ? 'Edit guard details' : 'Add guard to roster'}</h3>
                  <p className="text-[11px] text-blue-100">Set the guard profile and current duty assignment.</p>
                </div>
              </div>
              <button type="button" onClick={closeForm} aria-label="Close form" className="rounded p-1 text-slate-200 hover:bg-white/10 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-5">
              <div className="grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(230px,1fr)]">
                <div className="space-y-4">
                  <section className="border-b border-blue-100 pb-4">
                    <div className="mb-3 flex items-center gap-2.5">
                      <span className="rounded-lg bg-blue-50 p-2 text-blue-800"><User className="h-4 w-4" /></span>
                      <div>
                        <h4 className={sectionTitleClassName}>Personal Information</h4>
                        <p className={sectionSubTitleClassName}>Basic details of the guard.</p>
                      </div>
                    </div>
                    <div className="grid gap-x-3 gap-y-2.5 sm:grid-cols-2 xl:grid-cols-3">
                      <label className="space-y-1 text-[10px] font-semibold text-slate-700">
                        Full name *
                        <input autoFocus required value={formData.name} onChange={(event) => setFormData({ ...formData, name: event.target.value })} className={fieldClassName} placeholder="Enter guard's full name" />
                      </label>
                      <label className="space-y-1 text-[10px] font-semibold text-slate-700">
                        Phone number *
                        <span className="flex">
                          <input required type="tel" value={formData.phone} onChange={(event) => setFormData({ ...formData, phone: event.target.value })} className={`${fieldClassName} min-w-0 rounded-r-none`} placeholder="98765 43210" />
                          <select aria-label="Phone country code" value={formData.phoneCountryCode} onChange={(event) => setFormData({ ...formData, phoneCountryCode: event.target.value })} className="w-[68px] shrink-0 rounded-r-md border border-l-0 border-blue-100 bg-blue-50 px-1 text-[10px] text-slate-700 focus:outline-none">
                            <option value="+91">+91</option>
                            <option value="+1">+1</option>
                            <option value="+44">+44</option>
                            <option value="+971">+971</option>
                          </select>
                        </span>
                      </label>
                      <label className="space-y-1 text-[10px] font-semibold text-slate-700">
                        Email address
                        <input type="email" value={formData.email} onChange={(event) => setFormData({ ...formData, email: event.target.value })} className={fieldClassName} placeholder="guard@example.com" />
                      </label>
                      <label className="space-y-1 text-[10px] font-semibold text-slate-700">
                        Badge ID *
                        <input required disabled={Boolean(editingGuard)} value={formData.badgeId} onChange={(event) => setFormData({ ...formData, badgeId: event.target.value })} className={`${fieldClassName} disabled:cursor-not-allowed disabled:bg-slate-100`} placeholder="e.g. GRD-703" />
                      </label>
                      <label className="space-y-1 text-[10px] font-semibold text-slate-700">
                        Assigned gate *
                        <select required value={formData.assignedGate} onChange={(event) => setFormData({ ...formData, assignedGate: event.target.value })} className={fieldClassName}>
                          <option>Main Gate 1</option>
                          <option>Service Gate 2</option>
                          <option>North Gate</option>
                          <option>Clubhouse Entrance</option>
                          <option>Other / Patrol</option>
                        </select>
                      </label>
                      <label className="space-y-1 text-[10px] font-semibold text-slate-700">
                        Shift *
                        <select value={formData.shiftType} onChange={(event) => setFormData({ ...formData, shiftType: event.target.value as GuardFormData['shiftType'] })} className={fieldClassName}>
                          <option>Morning</option>
                          <option>Afternoon</option>
                          <option>Night</option>
                          <option>Custom</option>
                        </select>
                      </label>
                      <label className="space-y-1 text-[10px] font-semibold text-slate-700">
                        Assigned duty *
                        <select value={formData.assignedDuty} onChange={(event) => setFormData({ ...formData, assignedDuty: event.target.value })} className={fieldClassName}>
                          <option>Gate entry and visitor verification</option>
                          <option>Perimeter patrol</option>
                          <option>Visitor and delivery management</option>
                          <option>Parking and vehicle checks</option>
                          <option>Emergency response</option>
                          <option>Custom duty</option>
                        </select>
                      </label>
                      <label className="space-y-1 text-[10px] font-semibold text-slate-700">
                        Date of joining *
                        <input required type="date" value={formData.joiningDate} onChange={(event) => setFormData({ ...formData, joiningDate: event.target.value })} className={fieldClassName} />
                      </label>
                      <label className="space-y-1 text-[10px] font-semibold text-slate-700">
                        End date <span className="font-normal text-slate-400">(if temporary)</span>
                        <input type="date" value={formData.endDate} min={formData.joiningDate || undefined} onChange={(event) => setFormData({ ...formData, endDate: event.target.value })} className={fieldClassName} />
                      </label>
                      <label className="space-y-1 text-[10px] font-semibold text-slate-700">
                        Employment type
                        <select value={formData.employmentType} onChange={(event) => setFormData({ ...formData, employmentType: event.target.value as GuardFormData['employmentType'] })} className={fieldClassName}>
                          <option>Full-time</option>
                          <option>Part-time</option>
                          <option>Contract</option>
                        </select>
                      </label>
                      <label className="flex items-end justify-between gap-3 pb-1 text-[10px] font-semibold text-slate-700">
                        Status
                        <span className="flex items-center gap-2">
                          <button
                            type="button"
                            role="switch"
                            aria-checked={formData.guardStatus === 'active'}
                            aria-label="Guard active status"
                            onClick={() => setFormData({ ...formData, guardStatus: formData.guardStatus === 'active' ? 'inactive' : 'active' })}
                            className={`relative h-5 w-10 rounded-full transition-colors ${formData.guardStatus === 'active' ? 'bg-emerald-500' : 'bg-slate-300'}`}
                          >
                            <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${formData.guardStatus === 'active' ? 'left-5' : 'left-0.5'}`} />
                          </button>
                          <span className={formData.guardStatus === 'active' ? 'text-emerald-700' : 'text-slate-500'}>
                            {formData.guardStatus === 'active' ? 'Active' : 'Inactive'}
                          </span>
                        </span>
                      </label>
                    </div>
                  </section>

                  <section className="border-b border-blue-100 pb-4">
                    <div className="mb-3 flex items-center gap-2.5">
                      <span className="rounded-lg bg-blue-50 p-2 text-blue-800"><FileText className="h-4 w-4" /></span>
                      <div>
                        <h4 className={sectionTitleClassName}>Additional Details</h4>
                        <p className={sectionSubTitleClassName}>More information about the guard.</p>
                      </div>
                    </div>
                    <div className="grid gap-x-3 gap-y-2.5 sm:grid-cols-2 xl:grid-cols-3">
                      <label className="space-y-1 text-[10px] font-semibold text-slate-700">
                        Date of birth
                        <input type="date" value={formData.dateOfBirth} onChange={(event) => setFormData({ ...formData, dateOfBirth: event.target.value })} className={fieldClassName} />
                      </label>
                      <label className="space-y-1 text-[10px] font-semibold text-slate-700">
                        Gender
                        <select value={formData.gender} onChange={(event) => setFormData({ ...formData, gender: event.target.value })} className={fieldClassName}>
                          <option>Male</option><option>Female</option><option>Non-binary</option><option>Prefer not to say</option>
                        </select>
                      </label>
                      <label className="space-y-1 text-[10px] font-semibold text-slate-700">
                        Blood group
                        <select value={formData.bloodGroup} onChange={(event) => setFormData({ ...formData, bloodGroup: event.target.value })} className={fieldClassName}>
                          {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((group) => <option key={group}>{group}</option>)}
                        </select>
                      </label>
                      <label className="space-y-1 text-[10px] font-semibold text-slate-700 sm:col-span-2">
                        Address
                        <textarea rows={2} maxLength={200} value={formData.address} onChange={(event) => setFormData({ ...formData, address: event.target.value })} className={`${fieldClassName} resize-y`} placeholder="Guard's residential address" />
                        <span className="block text-right text-[9px] font-normal text-slate-400">{formData.address.length}/200</span>
                      </label>
                      <label className="space-y-1 text-[10px] font-semibold text-slate-700">
                        Emergency contact name
                        <input value={formData.emergencyContactName} onChange={(event) => setFormData({ ...formData, emergencyContactName: event.target.value })} className={fieldClassName} placeholder="Emergency contact" />
                      </label>
                      <label className="space-y-1 text-[10px] font-semibold text-slate-700">
                        Emergency contact number
                        <input type="tel" value={formData.emergencyContactPhone} onChange={(event) => setFormData({ ...formData, emergencyContactPhone: event.target.value })} className={fieldClassName} placeholder="98765 43211" />
                      </label>
                      <label className="space-y-1 text-[10px] font-semibold text-slate-700">
                        Identity proof
                        <select value={formData.identityProofType} onChange={(event) => setFormData({ ...formData, identityProofType: event.target.value })} className={fieldClassName}>
                          <option>Aadhaar Card</option><option>PAN Card</option><option>Passport</option><option>Driving Licence</option><option>Voter ID</option>
                        </select>
                      </label>
                      <label className="space-y-1 text-[10px] font-semibold text-slate-700">
                        ID number
                        <input value={formData.identityNumber} onChange={(event) => setFormData({ ...formData, identityNumber: event.target.value })} className={fieldClassName} placeholder="Enter identity number" />
                      </label>
                      <label className="flex min-h-16 cursor-pointer flex-col justify-center gap-1 rounded-md border border-dashed border-blue-200 bg-blue-50/40 px-3 py-2 text-center text-[10px] text-blue-800 hover:bg-blue-50">
                        <span className="flex items-center justify-center gap-1 font-semibold"><Upload className="h-3.5 w-3.5" />Upload documents</span>
                        <span className="text-[9px] text-slate-500">Aadhaar / PAN / Resume · Max 5 MB each</span>
                        <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png" className="sr-only" onChange={(event) => handleDocumentSelect(event.target.files)} />
                      </label>
                      {formData.guardDocuments.length > 0 && (
                        <div className="flex flex-wrap gap-1 sm:col-span-2 xl:col-span-3">
                          {formData.guardDocuments.map((fileName) => (
                            <span key={fileName} className="inline-flex items-center gap-1 rounded bg-blue-50 px-2 py-1 text-[9px] text-blue-800">
                              <FileBadge className="h-3 w-3" />{fileName}
                              <button type="button" aria-label={`Remove ${fileName}`} onClick={() => setFormData({ ...formData, guardDocuments: formData.guardDocuments.filter((name) => name !== fileName) })}><X className="h-3 w-3" /></button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </section>

                  <section>
                    <div className="mb-2 flex items-center gap-2.5">
                      <span className="rounded-lg bg-blue-50 p-2 text-blue-800"><FileText className="h-4 w-4" /></span>
                      <div>
                        <h4 className={sectionTitleClassName}>Notes / Remarks</h4>
                        <p className={sectionSubTitleClassName}>Any additional notes about the guard or duty.</p>
                      </div>
                    </div>
                    <textarea rows={2} maxLength={500} value={formData.guardNotes} onChange={(event) => setFormData({ ...formData, guardNotes: event.target.value })} className={`${fieldClassName} resize-y`} placeholder="Enter any additional information..." />
                    <div className="text-right text-[9px] text-slate-400">{formData.guardNotes.length}/500</div>
                  </section>
                </div>

                <aside className="space-y-3">
                  <section className="rounded-xl border border-blue-100 bg-blue-50/40 p-3">
                    <div className="mb-3 flex items-center gap-2">
                      <span className="rounded-md bg-white p-1.5 text-blue-800"><UserRound className="h-4 w-4" /></span>
                      <div>
                        <h4 className={sectionTitleClassName}>Profile Photo</h4>
                        <p className={sectionSubTitleClassName}>Upload a clear photo of the guard.</p>
                      </div>
                    </div>
                    <div className="mx-auto flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-slate-200 shadow-sm">
                      {formData.avatarUrl
                        ? <img src={formData.avatarUrl} alt="Guard profile preview" className="h-full w-full object-cover" />
                        : <UserRound className="h-16 w-16 text-slate-500" />}
                    </div>
                    <label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-md border border-blue-100 bg-white px-3 py-2 text-xs font-semibold text-blue-900 hover:bg-blue-50">
                      <Upload className="h-3.5 w-3.5" />Choose Photo
                      <input type="file" accept="image/jpeg,image/png" className="sr-only" onChange={(event) => handlePhotoSelect(event.target.files?.[0])} />
                    </label>
                    <p className="mt-1 text-center text-[9px] text-slate-500">JPG, PNG (Max 2 MB)</p>
                    {formData.avatarUrl && (
                      <button type="button" onClick={() => setFormData({ ...formData, avatarUrl: '' })} className="mt-2 w-full text-[10px] font-semibold text-rose-600 hover:text-rose-800">Remove photo</button>
                    )}
                  </section>

                  <section className="rounded-xl border border-blue-100 bg-blue-50/40 p-3">
                    <div className="mb-3 flex items-center gap-2">
                      <span className="rounded-md bg-white p-1.5 text-blue-800"><IdCard className="h-4 w-4" /></span>
                      <div>
                        <h4 className={sectionTitleClassName}>Badge Preview</h4>
                        <p className={sectionSubTitleClassName}>This will be printed on the ID card.</p>
                      </div>
                    </div>
                    <div className="overflow-hidden rounded-lg border border-blue-200 bg-white shadow-sm">
                      <div className="flex items-center justify-center gap-2 bg-[#1c2f4c] px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-white">
                        <Shield className="h-4 w-4" />Security
                      </div>
                      <div className="flex items-center gap-2.5 p-3">
                        <div className="flex h-14 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-blue-50">
                          {formData.avatarUrl ? <img src={formData.avatarUrl} alt="" className="h-full w-full object-cover" /> : <UserRound className="h-10 w-10 text-slate-500" />}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate text-xs font-bold text-slate-900">{formData.badgeId || 'GRD-703'}</div>
                          <div className="truncate text-[10px] text-slate-600">{formData.name || 'Guard'}</div>
                          <div className="mt-1 flex items-center gap-1 truncate text-[9px] text-slate-500"><MapPin className="h-3 w-3 shrink-0" />{formData.assignedGate || 'Main Gate 1'}</div>
                        </div>
                      </div>
                      <div className="mx-3 mb-3 h-5 bg-[repeating-linear-gradient(90deg,#334155_0,#334155_2px,transparent_2px,transparent_4px)]" aria-label="Badge barcode preview" />
                    </div>
                  </section>
                </aside>
              </div>

              {formError && <p role="alert" className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">{formError}</p>}
              {!editingGuard && <p className="mt-2 text-[10px] text-slate-500">Sign in with the badge ID. Initial demo PIN: guard123.</p>}
              <div className="mt-4 flex justify-end gap-2 border-t border-blue-100 pt-3">
                <button type="button" onClick={closeForm} className="rounded-lg border border-blue-100 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit" className="inline-flex items-center gap-2 rounded-lg bg-[#15345f] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1d477e]">
                  <Plus className="h-4 w-4" />{editingGuard ? 'Save changes' : 'Add guard'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
