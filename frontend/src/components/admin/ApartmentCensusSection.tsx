import React, { useState } from 'react';
import {
  Building2,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  CreditCard,
  FileText,
  Layers3,
  Home,
  Mail,
  MapPin,
  Phone,
  Receipt,
  Search,
  ShieldCheck,
  Car,
  UserRound,
  Users,
  X,
} from 'lucide-react';
import { useSociety } from '../../context/SocietyContext';
import { FlatDetail } from '../../types';
import { AddApartmentModal } from './AddApartmentModal';
import { AddVacantFlatModal } from './AddVacantFlatModal';
import { AddMemberFlatModal } from './AddMemberFlatModal';

type OccupancyFilter = 'all' | 'occupied' | 'Owner' | 'Tenant' | 'Vacant';

const occupancyLabel = (flat: FlatDetail) =>
  flat.occupancyStatus === 'Vacant' ? 'Available' : flat.occupancyStatus === 'Owner' ? 'Owner occupied' : 'Tenant occupied';

const formatProfileDate = (value?: string) => {
  if (!value) return 'Not recorded';
  const date = new Date(value.length === 10 ? `${value}T00:00:00` : value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
};

const profileTenure = (value?: string) => {
  if (!value) return undefined;
  const start = new Date(value.length === 10 ? `${value}T00:00:00` : value);
  const now = new Date();
  if (Number.isNaN(start.getTime()) || start > now) return undefined;

  const totalMonths = (now.getFullYear() - start.getFullYear()) * 12
    + now.getMonth() - start.getMonth()
    - (now.getDate() < start.getDate() ? 1 : 0);
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  return [years ? `${years} Year${years === 1 ? '' : 's'}` : '', months ? `${months} Month${months === 1 ? '' : 's'}` : '']
    .filter(Boolean)
    .join(' ') || 'Less than a month';
};

export const ApartmentCensusSection: React.FC = () => {
  const { flats, societies, bills, visitors, currentSocietyName, activeSidebarNav, markFlatVacant, updateApartmentAddress } = useSociety();
  const isPeopleHub = activeSidebarNav === 'community';
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<OccupancyFilter>('all');
  const [selectedFlat, setSelectedFlat] = useState<FlatDetail | null>(null);
  const [activeProfileSection, setActiveProfileSection] = useState('Overview');
  const [addressDraft, setAddressDraft] = useState('');
  const [editingAddress, setEditingAddress] = useState(false);
  const [showAddApartment, setShowAddApartment] = useState(false);
  const [showAddFlat, setShowAddFlat] = useState(false);
  const [showAssignResident, setShowAssignResident] = useState(false);
  const [showSocietySummary, setShowSocietySummary] = useState(false);

  const currentSocietyFlats = flats.filter((flat) => flat.societyName === currentSocietyName);
  const occupiedFlats = currentSocietyFlats.filter((flat) => flat.occupancyStatus !== 'Vacant');
  const vacantCount = currentSocietyFlats.length - occupiedFlats.length;
  const ownerCount = currentSocietyFlats.filter((flat) => flat.occupancyStatus === 'Owner').length;
  const tenantCount = currentSocietyFlats.filter((flat) => flat.occupancyStatus === 'Tenant').length;
  const societySummaries = societies.map((society) => {
    const societyFlats = flats.filter((flat) => flat.societyName === society.name);
    const societyOccupied = societyFlats.filter((flat) => flat.occupancyStatus !== 'Vacant');
    const societyVacant = societyFlats.filter((flat) => flat.occupancyStatus === 'Vacant');
    const declaredBlocks = society.wingBlock.split(',').map((block) => block.trim()).filter(Boolean);
    const blockNames = [...new Set([...declaredBlocks, ...societyFlats.map((flat) => flat.wing).filter(Boolean)])];
    const blocks = blockNames.map((blockName) => {
      const blockFlats = societyFlats.filter((flat) => flat.wing === blockName);
      const floors = [...new Set(blockFlats.map((flat) => flat.floor))].sort((a, b) => a - b);
      return {
        name: blockName,
        total: blockFlats.length,
        occupied: blockFlats.filter((flat) => flat.occupancyStatus !== 'Vacant').length,
        vacant: blockFlats.filter((flat) => flat.occupancyStatus === 'Vacant').length,
        floors: floors.map((floor) => {
          const floorFlats = blockFlats.filter((flat) => flat.floor === floor);
          return {
            floor,
            occupied: floorFlats.filter((flat) => flat.occupancyStatus !== 'Vacant').length,
            vacant: floorFlats.filter((flat) => flat.occupancyStatus === 'Vacant').length,
          };
        }),
      };
    });

    return {
      ...society,
      totalFlats: society.totalFlats || societyFlats.length,
      registeredFlats: societyFlats.length,
      occupiedFlats: societyOccupied.length,
      vacantFlats: societyVacant.length,
      unregisteredFlats: Math.max((society.totalFlats || societyFlats.length) - societyFlats.length, 0),
      blocks: blocks.length ? blocks : Array.from({ length: society.numberOfBlocks }, (_, index) => ({
        name: `Block ${index + 1}`,
        total: 0,
        occupied: 0,
        vacant: 0,
        floors: [],
      })),
    };
  });
  const normalizedSearch = search.trim().toLowerCase();
  const visibleFlats = currentSocietyFlats
    .filter((flat) => {
      const matchesFilter =
        filter === 'all' ||
        (filter === 'occupied' ? flat.occupancyStatus !== 'Vacant' : flat.occupancyStatus === filter);
      const matchesSearch =
        !normalizedSearch ||
        [flat.flatNumber, flat.societyName, flat.wing, flat.ownerName, flat.phone, flat.propertyAddress]
          .some((value) => value?.toLowerCase().includes(normalizedSearch));
      return matchesFilter && matchesSearch;
    })
    .sort((a, b) => a.wing.localeCompare(b.wing) || a.floor - b.floor || a.flatNumber.localeCompare(b.flatNumber));

  const handleMarkVacant = (flat: FlatDetail) => {
    const confirmed = window.confirm(
      `Mark apartment ${flat.flatNumber} as vacant? Its resident and household details will be removed from this apartment.`
    );
    if (!confirmed) return;
    const result = markFlatVacant(flat.flatNumber, flat.societyName);
    if (!result.success) window.alert(result.message);
    setSelectedFlat(null);
  };

  const handleOpenProfile = (flat: FlatDetail) => {
    setSelectedFlat(flat);
    setActiveProfileSection('Overview');
    setAddressDraft(flat.propertyAddress || '');
    setEditingAddress(false);
  };

  const handleSaveAddress = () => {
    if (!selectedFlat) return;
    const result = updateApartmentAddress(selectedFlat.flatNumber, addressDraft, selectedFlat.societyName);
    if (!result.success) {
      window.alert(result.message);
      return;
    }
    setSelectedFlat({ ...selectedFlat, propertyAddress: addressDraft.trim() });
    setEditingAddress(false);
  };

  const residentBills = selectedFlat
    ? bills.filter((bill) =>
        bill.flatNumber === selectedFlat.flatNumber &&
        bill.societyName === selectedFlat.societyName
      ).sort((first, second) => (second.paidDate || second.dueDate).localeCompare(first.paidDate || first.dueDate))
    : [];
  const residentVisitors = selectedFlat
    ? visitors.filter((visitor) =>
        visitor.flatNumber === selectedFlat.flatNumber &&
        visitor.societyName === selectedFlat.societyName
      ).sort((first, second) => (second.generatedAt || second.expectedDate).localeCompare(first.generatedAt || first.expectedDate))
    : [];
  const residentActivity = [
    ...residentBills.map((bill) => ({
      id: bill.id,
      title: bill.status === 'paid' ? 'Payment received' : 'Maintenance bill issued',
      detail: `${bill.monthYear} · ₹${bill.totalAmount.toLocaleString('en-IN')}${bill.paymentMethod ? ` · ${bill.paymentMethod}` : ''}`,
      date: bill.paidDate || bill.dueDate,
      kind: bill.status === 'paid' ? 'payment' : 'bill',
    })),
    ...residentVisitors.map((visitor) => ({
      id: visitor.id,
      title: visitor.status === 'checked_out' ? 'Visitor checked out' : visitor.status === 'in_gate' ? 'Visitor entry' : 'Visitor pass created',
      detail: `${visitor.visitorName} · ${visitor.category}`,
      date: visitor.checkOutTime || visitor.checkInTime || visitor.generatedAt || visitor.expectedDate,
      kind: 'visitor',
    })),
  ].sort((first, second) => second.date.localeCompare(first.date)).slice(0, 8);

  const stats = [
    { label: 'Society', value: currentSocietyName, icon: Building2, color: 'text-indigo-700', tint: 'bg-indigo-50', onClick: () => setShowSocietySummary(true) },
    { label: 'Total apartments', value: currentSocietyFlats.length, icon: Building2, color: 'text-slate-700', tint: 'bg-slate-100' },
    { label: 'Occupied', value: occupiedFlats.length, icon: Users, color: 'text-blue-700', tint: 'bg-blue-50' },
    { label: 'Available', value: vacantCount, icon: Home, color: 'text-emerald-700', tint: 'bg-emerald-50' },
    { label: 'Owners · Tenants', value: `${ownerCount} · ${tenantCount}`, icon: UserRound, color: 'text-violet-700', tint: 'bg-violet-50' },
  ];

  const filters: { id: OccupancyFilter; label: string; count: number }[] = [
    { id: 'all', label: 'All apartments', count: currentSocietyFlats.length },
    { id: 'occupied', label: 'Occupied', count: occupiedFlats.length },
    { id: 'Vacant', label: 'Available', count: vacantCount },
    { id: 'Owner', label: 'Owner occupied', count: ownerCount },
    { id: 'Tenant', label: 'Tenant occupied', count: tenantCount },
  ];

  return (
    <section className={isPeopleHub ? 'space-y-0' : 'space-y-5'} aria-labelledby="apartment-census-title">
      {!isPeopleHub && (
        <>
      <header className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">People Hub · {currentSocietyName}</p>
          <h1 id="apartment-census-title" className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
            Apartment census
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Manage {currentSocietyName} apartment inventory, occupancy, resident profiles, and household information.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            onClick={() => setShowAddApartment(true)}
            type="button"
          >
            <Building2 className="h-4 w-4" />
            Add society
          </button>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            onClick={() => setShowAddFlat(true)}
            type="button"
          >
            <Home className="h-4 w-4" />
            Add flat
          </button>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            disabled={vacantCount === 0}
            onClick={() => setShowAssignResident(true)}
            type="button"
          >
            <UserRound className="h-4 w-4" />
            Assign resident
          </button>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-5">
        {stats.map(({ label, value, icon: Icon, color, tint, onClick }) => {
          const contents = (
            <>
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-medium text-slate-500 sm:text-sm">{label}</p>
                <span className={`rounded-lg p-2 ${tint} ${color}`}><Icon className="h-4 w-4" /></span>
              </div>
              <p className="mt-3 text-2xl font-bold tracking-tight text-slate-950">{value}</p>
              {onClick && <p className="mt-1 text-xs font-medium text-indigo-700">View society breakdown</p>}
            </>
          );
          return onClick ? (
            <button className="rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-indigo-300 hover:shadow-md sm:p-5" key={label} onClick={onClick} type="button">
              {contents}
            </button>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5" key={label}>
              {contents}
            </div>
          );
        })}
      </div>

      {showSocietySummary && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <section aria-labelledby="society-summary-title" aria-modal="true" className="max-h-[90dvh] w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl" role="dialog">
            <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-indigo-700">Admin overview</p>
                <h2 className="mt-1 text-lg font-bold text-slate-950" id="society-summary-title">Societies and occupancy</h2>
              </div>
              <button aria-label="Close society breakdown" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" onClick={() => setShowSocietySummary(false)} type="button"><X className="h-5 w-5" /></button>
            </header>
            <div className="max-h-[calc(90dvh-5rem)] space-y-4 overflow-y-auto p-4 sm:p-6">
              {societySummaries.map((society) => (
                <article className="rounded-xl border border-slate-200 p-4 sm:p-5" key={society.id}>
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div>
                      <h3 className="text-base font-bold text-slate-950">{society.name}</h3>
                      <p className="mt-1 text-xs text-slate-500">
                        {society.numberOfBlocks || society.blocks.length} blocks · {society.floors || 'Floor count not set'}
                        {society.floors === 1 ? ' floor' : typeof society.floors === 'number' && society.floors > 0 ? ' floors' : ''}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-x-5 gap-y-1 text-xs sm:grid-cols-4">
                      <p><span className="text-slate-500">Planned</span><strong className="ml-1 text-slate-900">{society.totalFlats}</strong></p>
                      <p><span className="text-slate-500">Registered</span><strong className="ml-1 text-slate-900">{society.registeredFlats}</strong></p>
                      <p><span className="text-slate-500">Occupied</span><strong className="ml-1 text-blue-700">{society.occupiedFlats}</strong></p>
                      <p><span className="text-slate-500">Vacant</span><strong className="ml-1 text-emerald-700">{society.vacantFlats}</strong></p>
                    </div>
                  </div>
                  {society.unregisteredFlats > 0 && (
                    <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
                      {society.unregisteredFlats} planned {society.unregisteredFlats === 1 ? 'flat has' : 'flats have'} not been added to inventory yet.
                    </p>
                  )}
                  <div className="mt-4 space-y-2">
                    <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500"><Layers3 className="h-4 w-4" /> Block availability</h4>
                    {society.blocks.map((block) => (
                      <div className="rounded-lg bg-slate-50 px-3 py-2.5" key={`${society.id}-${block.name}`}>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-slate-800">{block.name}</p>
                          <p className="text-xs text-slate-600">{block.total} registered · <span className="text-blue-700">{block.occupied} occupied</span> · <span className="text-emerald-700">{block.vacant} vacant</span></p>
                        </div>
                        {block.floors.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {block.floors.map(({ floor, occupied, vacant }) => (
                              <span className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-600" key={floor}>
                                Floor {floor}: {occupied} occupied · {vacant} vacant
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                    {society.blocks.length === 0 && <p className="text-xs text-slate-500">No blocks are recorded for this society yet.</p>}
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      )}
        </>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="space-y-4 border-b border-slate-200 p-4 sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-950">Apartment directory</h2>
              <p className="mt-1 text-xs text-slate-500">Select a unit to review its address, resident, household, and contact details.</p>
            </div>
            <label className="relative block w-full lg:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                aria-label="Search apartments"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search unit, resident, wing, address"
                type="search"
                value={search}
              />
            </label>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1" aria-label="Filter apartments by occupancy">
            {filters.map((item) => (
              <button
                aria-pressed={filter === item.id}
                className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                  filter === item.id
                    ? 'border-slate-950 bg-slate-950 text-white'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                }`}
                key={item.id}
                onClick={() => setFilter(item.id)}
                type="button"
              >
                {item.label}<span className="ml-1.5 opacity-70">{item.count}</span>
              </button>
            ))}
          </div>
        </div>

        {visibleFlats.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <Building2 className="mx-auto h-8 w-8 text-slate-300" />
            <h3 className="mt-3 text-sm font-semibold text-slate-800">
              {currentSocietyFlats.length === 0 ? `No apartments have been added for ${currentSocietyName} yet` : 'No apartments match your search'}
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              {currentSocietyFlats.length === 0 ? 'Add an apartment to this society to start tracking residents and household details.' : 'Try another unit, resident, wing, or address.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Apartment</th>
                  <th className="px-5 py-3 font-semibold">Address</th>
                  <th className="px-5 py-3 font-semibold">Resident & household</th>
                  <th className="px-5 py-3 font-semibold">Occupancy</th>
                  <th className="px-5 py-3 text-right font-semibold">Dues</th>
                  <th className="px-5 py-3 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibleFlats.map((flat) => (
                  <tr className="transition hover:bg-slate-50/70" key={`${flat.societyName}-${flat.flatNumber}`}>
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-950">{flat.flatNumber}</p>
                      <p className="mt-0.5 text-xs font-medium text-slate-600">{flat.societyName}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{flat.wing} · Floor {flat.floor}</p>
                    </td>
                    <td className="max-w-xs px-5 py-4">
                      <p className="line-clamp-2 text-xs leading-5 text-slate-600">{flat.propertyAddress || 'Address not recorded'}</p>
                    </td>
                    <td className="px-5 py-4">
                      {flat.occupancyStatus === 'Vacant' ? (
                        <p className="text-xs text-slate-400">No resident assigned</p>
                      ) : (
                        <>
                          <p className="font-semibold text-slate-800">{flat.ownerName || 'Resident name not recorded'}</p>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {flat.familyMembersCount} household member{flat.familyMembersCount === 1 ? '' : 's'}
                          </p>
                        </>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                        flat.occupancyStatus === 'Vacant' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'
                      }`}>
                        {flat.occupancyStatus === 'Vacant' && <Check className="h-3 w-3" />}
                        {occupancyLabel(flat)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right font-semibold tabular-nums">
                      <span className={flat.outstandingDues > 0 ? 'text-amber-700' : 'text-slate-500'}>
                        ₹{flat.outstandingDues.toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 hover:text-emerald-950"
                        onClick={() => handleOpenProfile(flat)}
                        type="button"
                      >
                        View details <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
          Showing {visibleFlats.length} of {currentSocietyFlats.length} apartments in {currentSocietyName}
        </div>
      </div>

      {selectedFlat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-slate-950/60 p-2 backdrop-blur-sm">
          <section
            aria-labelledby="flat-profile-title"
            aria-modal="true"
            className="my-2 flex h-[calc(100dvh-1rem)] max-h-[calc(100dvh-1rem)] w-full max-w-7xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-2xl"
            role="dialog"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2.5 sm:px-6">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-sky-700">Resident directory <span className="px-1 text-slate-300">/</span> Apartment profile</p>
                <h2 id="flat-profile-title" className="mt-0.5 truncate text-lg font-bold text-slate-950">{selectedFlat.flatNumber}</h2>
              </div>
              <button aria-label="Close apartment details" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" onClick={() => setSelectedFlat(null)} type="button">
                <span aria-hidden="true" className="text-xl leading-none">×</span>
              </button>
            </div>
            <div className="grid min-h-0 flex-1 grid-cols-1 items-start gap-2.5 overflow-hidden p-3 sm:gap-3 md:grid-cols-12">
              <div className="flex min-w-0 flex-col justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm sm:flex-row sm:items-center md:col-span-6 md:col-start-1 md:row-start-1">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-blue-700 text-lg font-bold text-white shadow-md shadow-blue-900/10">
                    {selectedFlat.occupancyStatus === 'Vacant'
                      ? <Home className="h-7 w-7" />
                      : selectedFlat.ownerName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('')}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-xl font-bold text-slate-950">{selectedFlat.occupancyStatus === 'Vacant' ? 'Vacant apartment' : selectedFlat.ownerName}</h3>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${selectedFlat.occupancyStatus === 'Vacant' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                        <ShieldCheck className="h-3.5 w-3.5" />{occupancyLabel(selectedFlat)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">{selectedFlat.societyName} · {selectedFlat.wing} · Floor {selectedFlat.floor}</p>
                    {selectedFlat.occupancyStatus !== 'Vacant' && (
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-600">
                          {selectedFlat.phone && <a className="inline-flex items-center gap-1.5 text-slate-600 hover:text-blue-700" href={`tel:${selectedFlat.phone}`}><Phone className="h-3.5 w-3.5 text-sky-700" />{selectedFlat.phone}</a>}
                          {selectedFlat.email && <a className="inline-flex items-center gap-1.5 break-all text-slate-600 hover:text-blue-700" href={`mailto:${selectedFlat.email}`}><Mail className="h-3.5 w-3.5 text-sky-700" />{selectedFlat.email}</a>}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2 self-start sm:self-center">
                  <span className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-700">{selectedFlat.flatNumber}</span>
                  <span className="rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-800">{selectedFlat.flatType || 'Apartment'}</span>
                </div>
              </div>

              <aside className="space-y-2.5 md:col-span-3 md:col-start-10 md:row-span-8 md:row-start-1">
                <article className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-900">Quick actions</h3>
                    <div className="mt-3 space-y-1.5">
                    <button className="flex w-full items-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-left text-xs font-semibold text-slate-700 transition hover:border-sky-200 hover:bg-sky-50" onClick={() => setEditingAddress(true)} type="button">
                        <MapPin className="h-4 w-4 text-sky-700" /> Edit apartment address
                    </button>
                      {selectedFlat.phone && <a className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-700 transition hover:border-sky-200 hover:bg-sky-50" href={`tel:${selectedFlat.phone}`}><Phone className="h-4 w-4 text-sky-700" /> Call resident</a>}
                      {selectedFlat.email && <a className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-700 transition hover:border-sky-200 hover:bg-sky-50" href={`mailto:${selectedFlat.email}`}><Mail className="h-4 w-4 text-sky-700" /> Email resident</a>}
                    {selectedFlat.occupancyStatus === 'Vacant' ? (
                        <button className="flex w-full items-center gap-2 rounded-lg bg-blue-700 px-3 py-2.5 text-left text-xs font-semibold text-white transition hover:bg-blue-800" onClick={() => { setSelectedFlat(null); setShowAssignResident(true); }} type="button"><Users className="h-4 w-4" /> Assign a resident</button>
                    ) : (
                      <button className="flex w-full items-center gap-2 rounded-lg border border-amber-200 px-3 py-2.5 text-left text-xs font-semibold text-amber-800 transition hover:bg-amber-50" onClick={() => handleMarkVacant(selectedFlat)} type="button"><Home className="h-4 w-4" /> Mark apartment vacant</button>
                    )}
                  </div>
                </article>
                <article className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm ${activeProfileSection === 'Overview' || activeProfileSection === 'Activity Log' ? '' : 'hidden'}`} id="activity-log">
                  <div className="flex items-center justify-between gap-3"><h3 className="font-bold text-slate-900">Recent activity</h3><Clock3 className="h-4 w-4 text-slate-400" /></div>
                  {residentActivity.length ? (
                    <ul className="mt-4 space-y-4">
                      {residentActivity.slice(0, 3).map((activity) => (
                        <li className="flex gap-3" key={`${activity.kind}-${activity.id}`}>
                          <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${activity.kind === 'payment' ? 'bg-emerald-50 text-emerald-700' : activity.kind === 'visitor' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'}`}>
                            {activity.kind === 'payment' ? <CreditCard className="h-4 w-4" /> : activity.kind === 'visitor' ? <UserRound className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                          </span>
                          <span className="min-w-0"><span className="block text-sm font-semibold text-slate-800">{activity.title}</span><span className="mt-0.5 block text-xs text-slate-500">{activity.detail}</span><span className="mt-1 block text-[11px] text-slate-400">{activity.date}</span></span>
                        </li>
                      ))}
                    </ul>
                  ) : <p className="mt-4 text-sm text-slate-400">No payment or visitor activity recorded.</p>}
                </article>
                <article className="rounded-2xl border border-slate-200 bg-gradient-to-br from-blue-50 to-white p-4">
                  <h3 className="flex items-center gap-2 font-bold text-slate-900"><Building2 className="h-4 w-4 text-blue-700" /> Apartment location</h3>
                  <p className="mt-2 text-sm font-semibold text-slate-800">{selectedFlat.societyName}</p>
                  <p className="mt-1 text-xs text-slate-500">{selectedFlat.wing} · Floor {selectedFlat.floor}</p>
                </article>
              </aside>

              <div className="grid grid-cols-2 gap-2 md:col-span-9 md:col-start-1 md:row-start-2 md:grid-cols-4">
                {[
                  { label: 'Household members', value: selectedFlat.occupancyStatus === 'Vacant' ? 0 : selectedFlat.familyMembersCount, icon: Users, tint: 'bg-sky-100 text-sky-700', surface: 'border-sky-100 bg-gradient-to-br from-sky-50 to-white' },
                  { label: 'Registered vehicles', value: selectedFlat.vehicles.length, icon: Car, tint: 'bg-blue-100 text-blue-700', surface: 'border-blue-100 bg-gradient-to-br from-blue-50 to-white' },
                  { label: 'Pets', value: selectedFlat.profileDetails?.pets || '0', icon: UserRound, tint: 'bg-amber-100 text-amber-700', surface: 'border-amber-100 bg-gradient-to-br from-amber-50 to-white' },
                  { label: 'Emergency contacts', value: selectedFlat.emergencyContacts?.length ?? 0, icon: Phone, tint: 'bg-emerald-100 text-emerald-700', surface: 'border-emerald-100 bg-gradient-to-br from-emerald-50 to-white' },
                ].map(({ label, value, icon: Icon, tint, surface }) => (
                  <div className={`flex items-center gap-2.5 rounded-xl border p-3 shadow-sm ${surface}`} key={label}>
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${tint}`}><Icon className="h-4 w-4" /></span>
                    <span className="min-w-0"><span className="block truncate text-[11px] font-medium text-slate-500">{label}</span><span className="mt-0.5 block truncate text-base font-bold text-slate-950">{value}</span></span>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 to-white p-3.5 shadow-sm md:col-span-3 md:col-start-7 md:row-start-1">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-sky-700" />
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">Apartment address</h3>
                    {editingAddress ? (
                      <div className="mt-2 space-y-2">
                        <textarea
                          aria-label="Apartment property address"
                          className="min-h-20 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                          onChange={(event) => setAddressDraft(event.target.value)}
                          placeholder="Building, street, locality, city, and postal code"
                          rows={3}
                          value={addressDraft}
                        />
                        <div className="flex gap-2">
                          <button className="rounded-lg bg-sky-700 px-3 py-2 text-xs font-semibold text-white hover:bg-sky-800" onClick={handleSaveAddress} type="button">
                            Save address
                          </button>
                          <button className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50" onClick={() => { setAddressDraft(selectedFlat.propertyAddress || ''); setEditingAddress(false); }} type="button">
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-1 flex items-start justify-between gap-3">
                        <p className="text-sm leading-6 text-slate-800">{selectedFlat.propertyAddress || 'Address not recorded'}</p>
                          <button className="shrink-0 text-xs font-semibold text-sky-700 hover:text-sky-900" onClick={() => setEditingAddress(true)} type="button">
                          Edit
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <nav aria-label="Apartment profile sections" className="flex min-w-0 flex-wrap items-center justify-between gap-x-1 gap-y-0 rounded-xl border-b border-slate-200 bg-white px-2 shadow-sm md:col-span-9 md:col-start-1 md:row-start-3">
                {[
                  'Overview',
                  'Family Members',
                  'Vehicles',
                  'Dues & Payments',
                  'Visitor History',
                  'Activity Log',
                ].map((label) => (
                  <button aria-current={activeProfileSection === label ? 'page' : undefined} className={`shrink-0 border-b-2 px-2.5 py-2.5 text-xs font-semibold transition ${activeProfileSection === label ? 'border-sky-600 text-sky-700' : 'border-transparent text-slate-500 hover:border-sky-200 hover:text-sky-700'}`} key={label} onClick={() => setActiveProfileSection(label)} type="button">
                    {label}
                  </button>
                ))}
              </nav>

              <div className={`grid gap-3 sm:grid-cols-2 md:col-span-9 md:col-start-1 md:row-start-4 ${activeProfileSection === 'Overview' ? '' : 'hidden'}`} id="profile-overview">
                <article className="rounded-xl border border-sky-100 bg-white p-3.5 shadow-sm">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900"><Users className="h-4 w-4 text-sky-700" /> Household details</h3>
                  <div className="mt-2.5">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[11px] font-semibold ${selectedFlat.occupancyStatus === 'Vacant' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                      <ShieldCheck className="h-3.5 w-3.5" />{occupancyLabel(selectedFlat)}
                    </span>
                    {selectedFlat.occupancyStatus !== 'Vacant' ? (
                      <div className="mt-2.5">
                        <p className="text-sm font-semibold text-slate-900">{selectedFlat.ownerName}</p>
                        <p className="mt-1 text-xs text-slate-500">{selectedFlat.phone || 'Phone not recorded'}</p>
                        <p className="mt-0.5 break-all text-xs text-slate-500">{selectedFlat.email || 'Email not recorded'}</p>
                        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 border-t border-slate-100 pt-2 text-[11px] text-slate-500">
                          <span className="font-semibold text-slate-700">{selectedFlat.familyMembersCount} Total Members</span>
                          <span>{selectedFlat.profileDetails?.numberOfAdults ?? 0} Adults</span>
                          <span>{selectedFlat.profileDetails?.numberOfChildren ?? 0} Children</span>
                          <span>{selectedFlat.profileDetails?.seniorCitizens ?? 0} Senior Citizens</span>
                        </div>
                      </div>
                    ) : <p className="mt-2 text-xs text-slate-500">No household assigned.</p>}
                  </div>
                </article>
                <article className="rounded-xl border border-emerald-100 bg-white p-3.5 shadow-sm">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900"><CreditCard className="h-4 w-4 text-emerald-600" /> Financial details</h3>
                  <div className="mt-2.5 grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[11px] text-slate-500">Current dues</p>
                      <p className={`mt-0.5 text-lg font-bold tabular-nums ${selectedFlat.outstandingDues > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>₹{selectedFlat.outstandingDues.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="border-l border-slate-100 pl-3">
                      <p className="text-[11px] text-slate-500">Last paid</p>
                      <p className="mt-0.5 text-xs font-semibold text-slate-800">{selectedFlat.profileDetails?.lastPaymentDate || residentBills.find((bill) => bill.status === 'paid')?.paidDate || 'Not recorded'}</p>
                      {selectedFlat.profileDetails?.lastPaymentAmount !== undefined && <p className="mt-0.5 text-[11px] text-slate-500">₹{selectedFlat.profileDetails.lastPaymentAmount.toLocaleString('en-IN')}</p>}
                    </div>
                  </div>
                  {residentBills.length > 0 && (
                    <div className="mt-2 border-t border-slate-100 pt-2">
                      <p className="mb-1 text-[11px] font-semibold text-slate-500">Recent payments</p>
                      <ul className="space-y-1">
                        {residentBills.filter((bill) => bill.status === 'paid').slice(0, 3).map((bill) => (
                          <li className="flex items-center justify-between gap-2 text-[11px]" key={bill.id}>
                            <span className="truncate text-slate-600">{bill.monthYear}</span>
                            <span className="shrink-0 font-medium text-slate-700">₹{bill.totalAmount.toLocaleString('en-IN')}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </article>
              </div>

              {selectedFlat.occupancyStatus !== 'Vacant' && (
                <>
                  <div className={`grid gap-3 md:grid-cols-2 md:col-span-9 md:col-start-1 md:row-start-5 ${activeProfileSection === 'Overview' ? '' : 'hidden'}`} id="profile-details">
                    <article className="rounded-xl border border-violet-100 bg-white p-3.5 shadow-sm">
                      <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900"><FileText className="h-4 w-4 text-violet-600" /> Additional household details</h3>
                      <dl className="mt-2 grid min-w-0 gap-x-3 gap-y-1.5 text-xs sm:grid-cols-2">
                        {([
                          ['Related person', selectedFlat.profileDetails?.fatherOrSpouseName],
                          ['Government ID (last four)', selectedFlat.profileDetails?.governmentIdLastFour],
                          ['Date of birth', selectedFlat.profileDetails?.dateOfBirth],
                          ['Gender', selectedFlat.profileDetails?.gender],
                          ['Alternate phone', selectedFlat.profileDetails?.alternatePhone],
                          ['Occupation', selectedFlat.profileDetails?.occupation],
                          ['Company', selectedFlat.profileDetails?.company],
                          ['Permanent address', selectedFlat.profileDetails?.permanentAddress],
                          ['Parking slot', selectedFlat.profileDetails?.parkingSlot],
                          ['Pets', selectedFlat.profileDetails?.pets],
                          ['Resident notes', selectedFlat.profileDetails?.notes],
                          ['Special instructions', selectedFlat.profileDetails?.specialInstructions],
                        ] as const).filter(([, value]) => value !== undefined && value !== null && value !== '').map(([label, value]) => (
                          <div className="min-w-0" key={label}>
                            <dt className="text-[11px] text-slate-500">{label}</dt>
                            <dd className="mt-0.5 break-words font-medium leading-4 text-slate-800">{value}</dd>
                          </div>
                        ))}
                      </dl>
                      {!selectedFlat.profileDetails || Object.entries(selectedFlat.profileDetails)
                        .filter(([key]) => !['ownershipType', 'possessionDate', 'moveInDate', 'documents', 'currentDues', 'previousDues', 'lastPaymentDate', 'lastPaymentAmount', 'paymentStatus', 'paymentMethod'].includes(key))
                        .every(([, value]) => !value || (Array.isArray(value) && value.length === 0)) ? (
                        <p className="mt-2 text-xs text-slate-400">No additional household details recorded.</p>
                      ) : null}
                    </article>
                    <article className="rounded-xl border border-sky-100 bg-gradient-to-br from-sky-50/70 to-white p-3.5 shadow-sm">
                      <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900"><CalendarDays className="h-4 w-4 text-sky-700" /> Stay &amp; registration info</h3>
                      <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-2.5">
                        <div>
                          <p className="flex items-center gap-1 text-[11px] text-slate-500"><CalendarDays className="h-3 w-3 text-sky-600" /> Move-in date</p>
                          <p className="mt-0.5 text-xs font-semibold text-slate-800">{formatProfileDate(selectedFlat.profileDetails?.moveInDate)}</p>
                        </div>
                        <div>
                          <p className="flex items-center gap-1 text-[11px] text-slate-500"><Clock3 className="h-3 w-3 text-sky-600" /> Tenure</p>
                          <p className="mt-0.5 text-xs font-semibold text-slate-800">{profileTenure(selectedFlat.profileDetails?.moveInDate) || 'Not recorded'}</p>
                        </div>
                        <div>
                          <p className="flex items-center gap-1 text-[11px] text-slate-500"><CalendarDays className="h-3 w-3 text-sky-600" /> Possession date</p>
                          <p className="mt-0.5 text-xs font-semibold text-slate-800">{formatProfileDate(selectedFlat.profileDetails?.possessionDate)}</p>
                        </div>
                        <div>
                          <p className="flex items-center gap-1 text-[11px] text-slate-500"><Users className="h-3 w-3 text-sky-600" /> Registration type</p>
                          <p className="mt-0.5 text-xs font-semibold text-slate-800">{selectedFlat.profileDetails?.ownershipType || selectedFlat.occupancyStatus}</p>
                        </div>
                      </div>
                      <div className="mt-2.5 border-t border-sky-100 pt-2">
                        <p className="flex items-center gap-1 text-[11px] font-semibold text-slate-600"><FileText className="h-3 w-3 text-sky-600" /> Documents &amp; ID</p>
                        {selectedFlat.profileDetails?.documents?.length ? (
                          <div className="mt-1 flex flex-wrap gap-1.5">
                            {selectedFlat.profileDetails.documents.map((document) => <span className="rounded-full bg-white px-2 py-1 text-[10px] font-medium text-slate-600 ring-1 ring-slate-200" key={document}>{document}</span>)}
                          </div>
                        ) : <p className="mt-1 text-[11px] text-slate-400">No documents recorded</p>}
                      </div>
                    </article>
                  </div>

                  <div className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:col-start-1 md:row-start-4 ${activeProfileSection === 'Family Members' ? 'md:col-span-5' : 'hidden'}`} id="family-members">
                    <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">Household members</h3>
                    {selectedFlat.familyMembers?.filter((member) => member.name.trim()).length ? (
                      <ul className="mt-2 divide-y divide-slate-100 rounded-xl border border-slate-200">
                        {selectedFlat.familyMembers.filter((member) => member.name.trim()).map((member) => (
                          <li className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-3" key={member.id}>
                            <div>
                              <p className="text-sm font-semibold text-slate-800">{member.name}</p>
                              <p className="mt-0.5 text-xs text-slate-500">
                                {member.relationship || 'Family member'}{member.age !== undefined ? ` · Age ${member.age}` : ''}
                              </p>
                            </div>
                            {member.phone && <p className="text-xs text-slate-600">{member.phone}</p>}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-2 text-sm text-slate-400">Individual family member details have not been added.</p>
                    )}
                  </div>

                  <div className={`grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-2 md:row-start-4 ${activeProfileSection === 'Vehicles' ? 'md:col-span-9 md:col-start-1' : activeProfileSection === 'Family Members' ? 'md:col-span-4 md:col-start-6' : 'hidden'}`} id="vehicles">
                    <div className={activeProfileSection === 'Vehicles' ? '' : 'hidden'}>
                      <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">Registered vehicles</h3>
                      {selectedFlat.vehicles.length ? (
                        <ul className="mt-2 space-y-1.5 text-sm text-slate-700">
                          {selectedFlat.vehicles.map((vehicle) => (
                            <li key={`${vehicle.type}-${vehicle.number}`}>
                              {vehicle.type}: {vehicle.number}
                              {vehicle.makeModel ? ` · ${vehicle.makeModel}` : ''}
                              {vehicle.color ? ` · ${vehicle.color}` : ''}
                              {vehicle.fastTag ? ` · FASTag ${vehicle.fastTag}` : ''}
                            </li>
                          ))}
                        </ul>
                      ) : <p className="mt-2 text-sm text-slate-400">No vehicles recorded</p>}
                    </div>
                    <div className={activeProfileSection === 'Family Members' ? '' : 'hidden'}>
                      <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">Emergency contacts</h3>
                      {selectedFlat.emergencyContacts?.length ? (
                        <ul className="mt-2 space-y-2 text-sm text-slate-700">
                          {selectedFlat.emergencyContacts.map((contact) => (
                            <li key={contact.id}>
                              <span className="font-medium">{contact.name}</span>
                              <span className="text-slate-500"> · {contact.relationship} · {contact.phone}</span>
                              {contact.alternatePhone && <span className="block text-xs text-slate-500">Alternate: {contact.alternatePhone}</span>}
                              {contact.bloodGroup && <span className="block text-xs text-slate-500">Blood group: {contact.bloodGroup}</span>}
                              {contact.medicalNotes && <span className="block text-xs text-slate-500">Medical notes: {contact.medicalNotes}</span>}
                            </li>
                          ))}
                        </ul>
                      ) : <p className="mt-2 text-sm text-slate-400">No emergency contacts recorded</p>}
                    </div>
                  </div>

                </>
              )}

              {selectedFlat.occupancyStatus !== 'Vacant' && (
              <div className={`grid gap-5 md:col-span-9 md:col-start-1 md:row-start-4 md:grid-cols-2 ${activeProfileSection === 'Dues & Payments' ? '' : 'hidden'}`} id="payment-history">
                <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="flex items-center gap-2 font-bold text-slate-900"><Receipt className="h-4 w-4 text-emerald-700" /> Payment history</h3>
                  {residentBills.length ? (
                    <div className="mt-3 overflow-hidden">
                      <table className="min-w-full text-left text-sm">
                        <thead className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-500">
                          <tr><th className="py-2 pr-4">Period</th><th className="py-2 pr-4">Date</th><th className="py-2 pr-4">Amount</th><th className="py-2">Status</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {residentBills.slice(0, 5).map((bill) => (
                            <tr key={bill.id}>
                              <td className="py-3 pr-4 font-medium text-slate-800">{bill.monthYear}</td>
                              <td className="py-3 pr-4 text-slate-600">{bill.status === 'paid' ? bill.paidDate || 'Paid' : `Due ${bill.dueDate}`}</td>
                              <td className="py-3 pr-4 font-semibold text-slate-800">₹{bill.totalAmount.toLocaleString('en-IN')}</td>
                              <td className="py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${bill.status === 'paid' ? 'bg-emerald-50 text-emerald-700' : bill.status === 'overdue' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'}`}>{bill.status}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : <p className="mt-3 text-sm text-slate-400">No maintenance bills recorded for this apartment.</p>}
                </article>
                <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="flex items-center gap-2 font-bold text-slate-900"><CreditCard className="h-4 w-4 text-emerald-700" /> Financial details</h3>
                  <dl className="mt-4 space-y-4">
                    <div><dt className="text-xs text-slate-500">Current dues</dt><dd className="mt-1 text-xl font-bold text-slate-900">₹{selectedFlat.outstandingDues.toLocaleString('en-IN')}</dd></div>
                    <div className="border-t border-slate-100 pt-3"><dt className="text-xs text-slate-500">Last payment</dt><dd className="mt-1 text-sm font-semibold text-slate-800">{selectedFlat.profileDetails?.lastPaymentDate || residentBills.find((bill) => bill.status === 'paid')?.paidDate || 'Not recorded'}</dd></div>
                    {selectedFlat.profileDetails?.lastPaymentAmount !== undefined && <div><dt className="text-xs text-slate-500">Last payment amount</dt><dd className="mt-1 text-sm font-semibold text-slate-800">₹{selectedFlat.profileDetails.lastPaymentAmount.toLocaleString('en-IN')}</dd></div>}
                    {(selectedFlat.profileDetails?.paymentStatus || selectedFlat.profileDetails?.paymentMethod) && <div className="border-t border-slate-100 pt-3"><dt className="text-xs text-slate-500">Payment information</dt><dd className="mt-1 text-sm font-semibold text-slate-800">{[selectedFlat.profileDetails.paymentStatus, selectedFlat.profileDetails.paymentMethod].filter(Boolean).join(' · ')}</dd></div>}
                  </dl>
                </article>
              </div>
              )}

              {selectedFlat.occupancyStatus !== 'Vacant' && activeProfileSection === 'Visitor History' && (
                <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:col-span-9 md:col-start-1 md:row-start-4" id="visitor-history">
                  <h3 className="flex items-center gap-2 font-bold text-slate-900"><UserRound className="h-4 w-4 text-emerald-700" /> Visitor history</h3>
                  {residentVisitors.length ? (
                    <div className="mt-3 divide-y divide-slate-100">
                      {residentVisitors.slice(0, 5).map((visitor) => (
                        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-2.5 first:pt-0 last:pb-0" key={visitor.id}>
                          <div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-800">{visitor.visitorName}</p><p className="mt-0.5 text-xs capitalize text-slate-500">{visitor.category}{visitor.companyOrRole ? ` · ${visitor.companyOrRole}` : ''}</p></div>
                          <div className="shrink-0 text-right"><p className="text-xs text-slate-600">{visitor.expectedDate}</p><p className="mt-0.5 text-xs capitalize text-slate-500">{visitor.status.replaceAll('_', ' ')}</p></div>
                        </div>
                      ))}
                    </div>
                  ) : <p className="mt-3 text-sm text-slate-400">No visitor passes recorded for this apartment.</p>}
                </article>
              )}

              <div className={`flex justify-end border-t border-slate-200 pt-3 md:col-span-12 md:col-start-1 ${selectedFlat.occupancyStatus === 'Vacant' ? 'md:row-start-5' : activeProfileSection === 'Overview' ? 'md:row-start-6' : 'md:row-start-5'}`}>
                <button className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50" onClick={() => setSelectedFlat(null)} type="button">
                  Close
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      <AddApartmentModal isOpen={showAddApartment} onClose={() => setShowAddApartment(false)} />
      <AddVacantFlatModal isOpen={showAddFlat} onClose={() => setShowAddFlat(false)} />
      {showAssignResident && (
        <AddMemberFlatModal isOpen={showAssignResident} onClose={() => setShowAssignResident(false)} />
      )}
    </section>
  );
};
