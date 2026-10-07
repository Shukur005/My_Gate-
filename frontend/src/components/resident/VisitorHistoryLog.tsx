import React, { useState, useMemo } from 'react';
import { VisitorPass, VisitorCategory } from '../../types';
import { calculateStayDuration } from '../../utils/durationCalculator';
import {
  History,
  Clock,
  Search,
  Filter,
  User,
  Calendar,
  Package,
  Car,
  Wrench,
  Users,
  ShieldCheck,
  CheckCircle2,
  Download,
  QrCode,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Info,
  CarFront,
  Phone,
  FileText,
  RotateCcw,
} from 'lucide-react';

interface VisitorHistoryLogProps {
  visitors: VisitorPass[];
  activeFlat: string;
  onReIssuePass?: (visitor: VisitorPass) => void;
  onViewPassDetails?: (pass: VisitorPass) => void;
}

export const VisitorHistoryLog: React.FC<VisitorHistoryLogProps> = ({
  visitors,
  activeFlat,
  onReIssuePass,
  onViewPassDetails,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'checked_out' | 'in_gate'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | '7days'>('all');
  const [selectedHistoryPass, setSelectedHistoryPass] = useState<VisitorPass | null>(null);

  // Filter visitors belonging to active flat that have check-in history or were scanned
  const historicalPasses = useMemo(() => {
    return visitors
      .filter((v) => v.flatNumber === activeFlat)
      .filter((v) => {
        // Must have been checked in, or checked out, or actively in gate
        return (
          v.checkInTime ||
          v.status === 'checked_out' ||
          v.status === 'in_gate' ||
          v.approvedByResident
        );
      })
      .sort((a, b) => {
        // Sort most recent first
        const dateA = a.expectedDate || '';
        const dateB = b.expectedDate || '';
        if (dateA !== dateB) return dateB.localeCompare(dateA);
        const timeA = a.checkInTime || a.expectedTimeSlot || '';
        const timeB = b.checkInTime || b.expectedTimeSlot || '';
        return timeB.localeCompare(timeA);
      });
  }, [visitors, activeFlat]);

  // Apply UI filters
  const filteredPasses = useMemo(() => {
    return historicalPasses.filter((v) => {
      // Category filter
      if (selectedCategory !== 'all' && v.category !== selectedCategory) {
        return false;
      }

      // Status filter
      if (statusFilter === 'checked_out' && v.status !== 'checked_out') {
        return false;
      }
      if (statusFilter === 'in_gate' && v.status !== 'in_gate') {
        return false;
      }

      // Date filter
      if (dateFilter === 'today') {
        const todayStr = new Date().toISOString().split('T')[0];
        if (v.expectedDate !== todayStr) return false;
      } else if (dateFilter === '7days') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const passDate = new Date(v.expectedDate || '');
        if (!isNaN(passDate.getTime()) && passDate < weekAgo) return false;
      }

      // Search Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = v.visitorName.toLowerCase().includes(q);
        const matchesPhone = v.phone.toLowerCase().includes(q);
        const matchesCompany = (v.companyOrRole || '').toLowerCase().includes(q);
        const matchesVehicle = (v.vehicleNumber || '').toLowerCase().includes(q);
        const matchesPurpose = (v.purpose || '').toLowerCase().includes(q);
        const matchesCode = (v.passcode || '').toLowerCase().includes(q);
        const matchesId = v.id.toLowerCase().includes(q);

        if (
          !matchesName &&
          !matchesPhone &&
          !matchesCompany &&
          !matchesVehicle &&
          !matchesPurpose &&
          !matchesCode &&
          !matchesId
        ) {
          return false;
        }
      }

      return true;
    });
  }, [historicalPasses, selectedCategory, statusFilter, dateFilter, searchQuery]);

  // Summary Metrics calculations
  const totalScanned = historicalPasses.length;
  const completedVisits = historicalPasses.filter((v) => v.status === 'checked_out');
  const activeInside = historicalPasses.filter((v) => v.status === 'in_gate');

  // Compute average duration of completed visits
  const averageStayMinutes = useMemo(() => {
    const visitsWithDuration = completedVisits
      .map((v) => calculateStayDuration(v.checkInTime, v.checkOutTime, v.expectedDate, v.status).totalMinutes)
      .filter((m) => m > 0);

    if (visitsWithDuration.length === 0) return 0;
    const sum = visitsWithDuration.reduce((acc, curr) => acc + curr, 0);
    return Math.round(sum / visitsWithDuration.length);
  }, [completedVisits]);

  const formatAvgStay = (mins: number) => {
    if (mins <= 0) return 'N/A';
    if (mins < 60) return `${mins} mins`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h} hr`;
  };

  const getCategoryIcon = (cat: VisitorCategory) => {
    switch (cat) {
      case 'guest':
        return <Users className="w-4 h-4 text-indigo-600" />;
      case 'delivery':
        return <Package className="w-4 h-4 text-amber-600" />;
      case 'cab':
        return <Car className="w-4 h-4 text-blue-600" />;
      case 'service':
        return <Wrench className="w-4 h-4 text-violet-600" />;
      case 'staff':
        return <User className="w-4 h-4 text-teal-600" />;
      default:
        return <User className="w-4 h-4 text-slate-600" />;
    }
  };

  const getCategoryBadgeClass = (cat: VisitorCategory) => {
    switch (cat) {
      case 'guest':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'delivery':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'cab':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'service':
        return 'bg-violet-50 text-violet-700 border-violet-200';
      case 'staff':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredPasses.length === 0) return;

    const headers = [
      'Pass ID',
      'Visitor Name',
      'Phone',
      'Category',
      'Company/Role',
      'Vehicle Number',
      'Date',
      'Check-in Time',
      'Check-out Time',
      'Duration of Stay',
      'Status',
      'Entry Gate',
      'Purpose',
    ];

    const rows = filteredPasses.map((v) => {
      const duration = calculateStayDuration(v.checkInTime, v.checkOutTime, v.expectedDate, v.status).durationText;
      return [
        `"${v.id}"`,
        `"${v.visitorName}"`,
        `"${v.phone}"`,
        `"${v.category}"`,
        `"${v.companyOrRole || ''}"`,
        `"${v.vehicleNumber || ''}"`,
        `"${v.expectedDate || ''}"`,
        `"${v.checkInTime || ''}"`,
        `"${v.checkOutTime || ''}"`,
        `"${duration}"`,
        `"${v.status}"`,
        `"${v.entryGate || 'Gate 1'}"`,
        `"${v.purpose || ''}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Visitor_History_Flat_${activeFlat}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden space-y-6">
      {/* Section Header */}
      <div className="p-6 pb-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-200">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Visitor Access History & Stay Duration Log
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Verified entry records, check-in timestamps, and duration of stay for Flat {activeFlat}
              </p>
            </div>
          </div>
        </div>

        {/* CSV Export Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={filteredPasses.length === 0}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Log (CSV)</span>
          </button>
        </div>
      </div>

      {/* Metrics Summary Strip */}
      <div className="px-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-slate-800">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Total Scanned Visits
          </span>
          <div className="text-xl font-black text-slate-900 mt-0.5">{totalScanned}</div>
          <span className="text-[10px] text-slate-400">All registered passes</span>
        </div>

        <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-3.5 text-emerald-950">
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
            Completed Visits
          </span>
          <div className="text-xl font-black text-emerald-700 mt-0.5">{completedVisits.length}</div>
          <span className="text-[10px] text-emerald-600">Checked out safely</span>
        </div>

        <div className="bg-indigo-50/60 border border-indigo-200 rounded-xl p-3.5 text-indigo-950">
          <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">
            Avg Duration of Stay
          </span>
          <div className="text-xl font-black text-indigo-700 mt-0.5">{formatAvgStay(averageStayMinutes)}</div>
          <span className="text-[10px] text-indigo-500">Per visitor average</span>
        </div>

        <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-3.5 text-blue-950">
          <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
            Currently on Premises
          </span>
          <div className="text-xl font-black text-blue-700 mt-0.5">{activeInside.length}</div>
          <span className="text-[10px] text-blue-500">Active in society</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="px-6 space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by visitor name, phone, Swiggy/Uber, vehicle KA-01..., or OTP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Status and Time Filters */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-emerald-600"
            >
              <option value="all">All Statuses</option>
              <option value="checked_out">Completed (Checked Out)</option>
              <option value="in_gate">Currently Inside Gate</option>
            </select>

            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-emerald-600"
            >
              <option value="all">All Dates</option>
              <option value="today">Today Only</option>
              <option value="7days">Past 7 Days</option>
            </select>
          </div>
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'all', label: 'All Categories' },
            { id: 'guest', label: 'Guests' },
            { id: 'delivery', label: 'Deliveries' },
            { id: 'cab', label: 'Cabs / Taxis' },
            { id: 'service', label: 'Services & Repairs' },
            { id: 'staff', label: 'Daily Staff' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Historical Visitors List / Table */}
      <div className="px-6 pb-6">
        {filteredPasses.length === 0 ? (
          <div className="p-12 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
            <History className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-semibold text-slate-600">No past visitor records found</p>
            <p className="text-[11px] text-slate-400">
              {searchQuery || selectedCategory !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your search terms or filter selection.'
                : `No gate passes have been scanned yet for Flat ${activeFlat}.`}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Visitor & Purpose</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Gate Pass ID</th>
                    <th className="py-3 px-3">Entry Time</th>
                    <th className="py-3 px-3">Exit Time</th>
                    <th className="py-3 px-4">Duration of Stay</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white font-medium">
                  {filteredPasses.map((pass) => {
                    const stay = calculateStayDuration(
                      pass.checkInTime,
                      pass.checkOutTime,
                      pass.expectedDate,
                      pass.status
                    );

                    return (
                      <tr key={pass.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Visitor & Purpose */}
                        <td className="py-3 px-4">
                          <div className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                            {pass.visitorName}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                            {pass.companyOrRole && (
                              <span className="font-semibold text-slate-700">{pass.companyOrRole}</span>
                            )}
                            {pass.companyOrRole && <span>•</span>}
                            <span>{pass.phone}</span>
                          </div>
                          {pass.vehicleNumber && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded mt-1">
                              <CarFront className="w-3 h-3 text-slate-500" />
                              {pass.vehicleNumber}
                            </span>
                          )}
                        </td>

                        {/* Category */}
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${getCategoryBadgeClass(
                              pass.category
                            )}`}
                          >
                            {getCategoryIcon(pass.category)}
                            <span className="capitalize">{pass.category}</span>
                          </span>
                        </td>

                        {/* Gate Pass ID & OTP */}
                        <td className="py-3 px-3">
                          <div className="font-mono text-[11px] font-bold text-slate-800">{pass.id}</div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <QrCode className="w-3 h-3 text-emerald-600" />
                            <span>OTP: {pass.passcode}</span>
                          </div>
                        </td>

                        {/* Entry Time */}
                        <td className="py-3 px-3">
                          <div className="font-extrabold text-slate-900 text-xs">
                            {pass.checkInTime || 'Pending Gate'}
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Calendar className="w-2.5 h-2.5" />
                            <span>{pass.expectedDate}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 block">{pass.entryGate || 'Gate 1'}</span>
                        </td>

                        {/* Exit Time */}
                        <td className="py-3 px-3">
                          {pass.checkOutTime ? (
                            <div>
                              <div className="font-extrabold text-slate-900 text-xs">{pass.checkOutTime}</div>
                              <span className="text-[10px] text-slate-400">Exit Recorded</span>
                            </div>
                          ) : pass.status === 'in_gate' ? (
                            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              Active Inside
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400">--</span>
                          )}
                        </td>

                        {/* Duration of Stay */}
                        <td className="py-3 px-4">
                          <div
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black ${
                              stay.isActive
                                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 animate-pulse'
                                : stay.totalMinutes > 0
                                ? 'bg-indigo-50 text-indigo-900 border border-indigo-200 font-mono'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            <Clock className="w-3.5 h-3.5 text-indigo-600" />
                            <span>{stay.durationText}</span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-3">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              pass.status === 'in_gate'
                                ? 'bg-emerald-100 text-emerald-800'
                                : pass.status === 'checked_out'
                                ? 'bg-slate-100 text-slate-700'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {pass.status === 'in_gate'
                              ? 'In Society'
                              : pass.status === 'checked_out'
                              ? 'Checked Out'
                              : pass.status}
                          </span>
                        </td>

                        {/* Details button */}
                        <td className="py-3 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedHistoryPass(pass)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-1.5 rounded-lg text-xs font-bold transition-all"
                            title="View Full Visit Details"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile / Tablet Responsive Cards Feed */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:hidden gap-3">
              {filteredPasses.map((pass) => {
                const stay = calculateStayDuration(
                  pass.checkInTime,
                  pass.checkOutTime,
                  pass.expectedDate,
                  pass.status
                );

                return (
                  <div
                    key={pass.id}
                    onClick={() => setSelectedHistoryPass(pass)}
                    className="bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 rounded-xl p-4 space-y-3 cursor-pointer transition-all shadow-2xs"
                  >
                    {/* Top Row: Visitor Name & Category */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-slate-900 text-sm">{pass.visitorName}</h4>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getCategoryBadgeClass(
                              pass.category
                            )}`}
                          >
                            {pass.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {pass.companyOrRole ? `${pass.companyOrRole} • ` : ''}
                          {pass.phone}
                        </p>
                      </div>

                      <span className="text-[10px] font-mono font-bold text-slate-400 bg-white px-2 py-1 rounded border border-slate-200">
                        {pass.id}
                      </span>
                    </div>

                    {/* Middle Grid: Entry Time, Exit Time & Duration of Stay */}
                    <div className="grid grid-cols-3 gap-2 bg-white p-2.5 rounded-xl border border-slate-200 text-center">
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase block">Entry Time</span>
                        <span className="text-xs font-black text-slate-900">
                          {pass.checkInTime || 'Pending'}
                        </span>
                      </div>

                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase block">Exit Time</span>
                        <span className="text-xs font-black text-slate-900">
                          {pass.checkOutTime || (pass.status === 'in_gate' ? 'Inside' : '--')}
                        </span>
                      </div>

                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase block">Duration</span>
                        <span
                          className={`text-xs font-black ${
                            stay.isActive ? 'text-emerald-600' : 'text-indigo-600'
                          }`}
                        >
                          {stay.durationText.split(' ')[0]} {stay.durationText.split(' ')[1] || ''}
                        </span>
                      </div>
                    </div>

                    {/* Bottom Row: Date & Gate */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{pass.expectedDate}</span>
                        <span>•</span>
                        <span>{pass.entryGate || 'Gate 1'}</span>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          pass.status === 'in_gate'
                            ? 'bg-emerald-100 text-emerald-800'
                            : pass.status === 'checked_out'
                            ? 'bg-slate-200 text-slate-700'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {pass.status === 'in_gate' ? 'In Society' : pass.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Historical Visitor Pass Detail Modal */}
      {selectedHistoryPass && (
        <div
          id="visitor-history-detail-modal"
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in"
        >
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 my-8">
            {/* Modal Header */}
            <div className="bg-slate-900 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-500 text-slate-950 rounded-xl font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-base">Verified Gate Log Details</h4>
                  <p className="text-xs text-slate-400 font-mono">Pass {selectedHistoryPass.id}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedHistoryPass(null)}
                className="text-slate-400 hover:text-white bg-slate-800 p-1.5 rounded-xl transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4 text-xs text-slate-700">
              {/* Visitor Overview */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">Visitor Name:</span>
                  <span className="font-black text-slate-900 text-sm">
                    {selectedHistoryPass.visitorName}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">Contact Phone:</span>
                  <span className="font-bold text-slate-900 font-mono">{selectedHistoryPass.phone}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">Category:</span>
                  <span className="font-bold text-slate-900 capitalize">
                    {selectedHistoryPass.category}
                  </span>
                </div>
                {selectedHistoryPass.companyOrRole && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-semibold">Company / Role:</span>
                    <span className="font-bold text-slate-900">
                      {selectedHistoryPass.companyOrRole}
                    </span>
                  </div>
                )}
                {selectedHistoryPass.vehicleNumber && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-semibold">Vehicle Number:</span>
                    <span className="font-bold font-mono text-slate-900">
                      {selectedHistoryPass.vehicleNumber}
                    </span>
                  </div>
                )}
                {selectedHistoryPass.purpose && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-semibold">Visit Purpose:</span>
                    <span className="font-bold text-slate-900">{selectedHistoryPass.purpose}</span>
                  </div>
                )}
              </div>

              {/* Verified Stay Duration Card */}
              {(() => {
                const stay = calculateStayDuration(
                  selectedHistoryPass.checkInTime,
                  selectedHistoryPass.checkOutTime,
                  selectedHistoryPass.expectedDate,
                  selectedHistoryPass.status
                );

                return (
                  <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-4 space-y-2.5">
                    <span className="font-bold text-indigo-950 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-indigo-600" />
                      <span>Gate Movement & Stay Duration</span>
                    </span>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-slate-500 block">Check-In Time:</span>
                        <span className="font-extrabold text-slate-900">
                          {selectedHistoryPass.checkInTime || 'Pending Gate Scan'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Check-Out Time:</span>
                        <span className="font-extrabold text-slate-900">
                          {selectedHistoryPass.checkOutTime ||
                            (selectedHistoryPass.status === 'in_gate' ? 'Active Inside' : 'Not Recorded')}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Date of Entry:</span>
                        <span className="font-bold text-slate-900">
                          {selectedHistoryPass.expectedDate}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Gate Desk:</span>
                        <span className="font-bold text-slate-900">
                          {selectedHistoryPass.entryGate || 'Main Gate 1'}
                        </span>
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-indigo-200 flex items-center justify-between">
                      <span className="font-bold text-indigo-950">Calculated Duration:</span>
                      <span className="font-black text-indigo-700 font-mono text-sm">
                        {stay.durationText}
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* Close and Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedHistoryPass(null)}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-2.5 px-4 rounded-xl text-xs transition-all text-center"
                >
                  Close Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
