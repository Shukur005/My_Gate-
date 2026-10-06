import React, { useState, useEffect } from 'react';
import { useSociety } from '../../context/SocietyContext';
import { downloadBillReceipt } from '../../utils/receiptGenerator';
import { ApartmentCensusSection } from './ApartmentCensusSection';
import { GuardManagementSection } from './GuardManagementSection';
import {
  Building2,
  DollarSign,
  TrendingUp,
  Receipt,
  FileText,
  AlertCircle,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  UserCheck,
  Megaphone,
  Wrench,
  Shield,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  Car,
  Calendar,
  Send,
  Trash2,
  Download,
  UserPlus,
  Home,
  ChevronRight,
  X,
  CreditCard,
  Edit,
  Mail,
  Phone,
} from 'lucide-react';

export const AdminView: React.FC = () => {
  const {
    flats,
    bills,
    expenses,
    complaints,
    notices,
    staff,
    createBill,
    addExpense,
    updateComplaintStatus,
    addNotice,
    deleteNotice,
    activeSidebarNav,
  } = useSociety();

  const [adminTab, setAdminTab] = useState<'accounting' | 'flats' | 'complaints' | 'notices' | 'staff' | 'amenities'>('amenities');

  // Synchronize with left sidebar selection
  useEffect(() => {
    if (activeSidebarNav === 'accounting' || activeSidebarNav === 'reports') {
      setAdminTab('accounting');
    } else if (activeSidebarNav === 'flats' || activeSidebarNav === 'community') {
      setAdminTab('flats');
    } else if (activeSidebarNav === 'helpdesk') {
      setAdminTab('complaints');
    } else if (activeSidebarNav === 'notices') {
      setAdminTab('notices');
    } else if (activeSidebarNav === 'staff') {
      setAdminTab('staff');
    } else if (activeSidebarNav === 'calendar') {
      setAdminTab('amenities');
    } else if (activeSidebarNav === 'dashboard') {
      setAdminTab('accounting');
    }
  }, [activeSidebarNav]);

  // Modal States
  const [showCreateBill, setShowCreateBill] = useState(false);
  const [billFlat, setBillFlat] = useState('B-402');
  const [billOwner, setBillOwner] = useState('');
  const [billMonth, setBillMonth] = useState('September 2026');
  const [billDueDate, setBillDueDate] = useState('2026-09-10');
  const [baseMaint, setBaseMaint] = useState(3500);
  const [waterChg, setWaterChg] = useState(450);
  const [parkingChg, setParkingChg] = useState(500);
  const [clubChg, setClubChg] = useState(300);

  const [showAddExpense, setShowAddExpense] = useState(false);
  const [expTitle, setExpTitle] = useState('');
  const [expCategory, setExpCategory] = useState<
    'Security' | 'Maintenance & Repairs' | 'Utilities' | 'Gardening' | 'Elevator AMC' | 'Events' | 'Administrative'
  >('Maintenance & Repairs');
  const [expAmount, setExpAmount] = useState(1500);
  const [expPaidTo, setExpPaidTo] = useState('');
  const [expMode, setExpMode] = useState('Bank Transfer');

  // Notice Form
  const [showAddNotice, setShowAddNotice] = useState(false);
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeCategory, setNoticeCategory] = useState<'General' | 'Maintenance' | 'Emergency' | 'Event' | 'Financial'>('General');
  const [noticeContent, setNoticeContent] = useState('');
  const [noticeAuthor, setNoticeAuthor] = useState('Society Management Committee');
  const [noticeImportant, setNoticeImportant] = useState(false);

  // Amenity Groups matching the user screenshot!
  const [amenityGroups, setAmenityGroups] = useState([
    {
      id: 1,
      title: 'Wing A - Free Amenities',
      description: 'This group allows residents of Wing B to access the selected free amenities as per the defined booking rules.',
      type: 'Rule Based',
    },
    {
      id: 2,
      title: 'Wing B',
      description: "Residents of Wing B can access the selected paid amenities as per the society's usage rules. Bookings will follow the defined slot limits, charges, and availability set by the committee.",
      type: 'Location Based',
    },
    {
      id: 3,
      title: 'Clubhouse & Tennis Courts',
      description: 'Standard access for all registered flat owners and tenants with slot reservation verification.',
      type: 'Slot Based',
    },
  ]);

  const [showAddAmenityGroup, setShowAddAmenityGroup] = useState(false);
  const [newGroupTitle, setNewGroupTitle] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [newGroupType, setNewGroupType] = useState('Rule Based');

  // Cancellation Charges matching user screenshot
  const [cancellationCharges, setCancellationCharges] = useState<
    Array<{ id: number; title: string; slab: string; fee: string; refundMode: string }>
  >([]);
  const [showAddCancellation, setShowAddCancellation] = useState(false);
  const [newCancelTitle, setNewCancelTitle] = useState('');
  const [newCancelFee, setNewCancelFee] = useState('10%');

  // Amenity Email Recipients matching user screenshot
  const [emailRecipients, setEmailRecipients] = useState([
    {
      id: 1,
      name: 'Dr. Arvind Malhotra',
      email: 'admin@society.org',
      role: 'Estate Chairman & Managing Director',
    },
    {
      id: 2,
      name: 'Officer Suresh Rao',
      email: 'security@emerald.org',
      role: 'Chief Security Officer (Main Gate 1)',
    },
  ]);
  const [showAddRecipient, setShowAddRecipient] = useState(false);
  const [newRecipName, setNewRecipName] = useState('');
  const [newRecipEmail, setNewRecipEmail] = useState('');
  const [newRecipRole, setNewRecipRole] = useState('Committee Member');

  // Financial Calculations
  const totalCollected = bills.filter((b) => b.status === 'paid').reduce((acc, b) => acc + b.totalAmount, 0);
  const totalPending = bills.filter((b) => b.status === 'pending' || b.status === 'overdue').reduce((acc, b) => acc + b.totalAmount, 0);
  const totalSpent = expenses.reduce((acc, e) => acc + e.amount, 0);
  const netSurplus = totalCollected - totalSpent;

  const handleCreateBillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetFlatObj = flats.find((f) => f.flatNumber === billFlat);
    const ownerName = targetFlatObj ? targetFlatObj.ownerName : billOwner || 'Flat Resident';
    const total = Number(baseMaint) + Number(waterChg) + Number(parkingChg) + Number(clubChg);

    createBill({
      flatNumber: billFlat,
      ownerName,
      monthYear: billMonth,
      dueDate: billDueDate,
      baseMaintenance: Number(baseMaint),
      waterCharges: Number(waterChg),
      parkingCharges: Number(parkingChg),
      clubhouseFee: Number(clubChg),
      lateFee: 0,
      totalAmount: total,
    });
    setShowCreateBill(false);
  };

  const handleAddExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expTitle || !expPaidTo) return;

    addExpense({
      title: expTitle,
      category: expCategory,
      amount: Number(expAmount),
      date: new Date().toISOString().split('T')[0],
      paidTo: expPaidTo,
      paymentMode: expMode,
      approvedBy: 'Admin Treasurer',
    });

    setExpTitle('');
    setExpPaidTo('');
    setShowAddExpense(false);
  };

  const handleAddNoticeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle || !noticeContent) return;

    addNotice({
      title: noticeTitle,
      category: noticeCategory,
      content: noticeContent,
      author: noticeAuthor,
      isImportant: noticeImportant,
    });

    setNoticeTitle('');
    setNoticeContent('');
    setShowAddNotice(false);
  };

  const handleAddAmenityGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupTitle.trim()) return;
    const newGroup = {
      id: amenityGroups.length + 1,
      title: newGroupTitle.trim(),
      description: newGroupDesc.trim() || 'Custom amenity rules configured for society residents.',
      type: newGroupType,
    };
    setAmenityGroups((prev) => [...prev, newGroup]);
    setNewGroupTitle('');
    setNewGroupDesc('');
    setShowAddAmenityGroup(false);
  };

  const handleAddCancellation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCancelTitle.trim()) return;
    const newCharge = {
      id: cancellationCharges.length + 1,
      title: newCancelTitle.trim(),
      slab: 'Cancellation within 24 hrs of slot',
      fee: newCancelFee,
      refundMode: 'Auto-deducted from refund',
    };
    setCancellationCharges((prev) => [...prev, newCharge]);
    setNewCancelTitle('');
    setShowAddCancellation(false);
  };

  const handleAddRecipient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecipName.trim() || !newRecipEmail.trim()) return;
    if (emailRecipients.length >= 3) {
      alert('Maximum of 3 email recipients allowed.');
      return;
    }
    const newR = {
      id: emailRecipients.length + 1,
      name: newRecipName.trim(),
      email: newRecipEmail.trim(),
      role: newRecipRole,
    };
    setEmailRecipients((prev) => [...prev, newR]);
    setNewRecipName('');
    setNewRecipEmail('');
    setShowAddRecipient(false);
  };

  return (
    <div className="w-full min-h-screen bg-[#f8fafc] text-slate-800 pb-16 font-sans">
      {/* Top Professional Breadcrumb Bar Matching MyGate ERP Screenshot */}
      <div className="bg-white border-b border-slate-200/90 px-6 py-2.5 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1.5 font-medium">
          {adminTab === 'amenities' && (
            <>
              <span className="text-slate-800 font-semibold">Amenities</span>
              <span className="text-slate-400">&gt;&gt;</span>
              <span className="text-slate-500">Settings</span>
            </>
          )}
          {adminTab === 'accounting' && (
            <>
              <span className="text-slate-800 font-semibold">Accounting</span>
              <span className="text-slate-400">&gt;&gt;</span>
              <span className="text-slate-500">Maintenance Bills & Invoices</span>
            </>
          )}
          {adminTab === 'flats' && (
            <>
              <span className="text-slate-800 font-semibold">Properties</span>
              <span className="text-slate-400">&gt;&gt;</span>
              <span className="text-slate-500">Flat Census Directory</span>
            </>
          )}
          {adminTab === 'complaints' && (
            <>
              <span className="text-slate-800 font-semibold">Helpdesk</span>
              <span className="text-slate-400">&gt;&gt;</span>
              <span className="text-slate-500">Resident Service Requests</span>
            </>
          )}
          {adminTab === 'notices' && (
            <>
              <span className="text-slate-800 font-semibold">Broadcasts</span>
              <span className="text-slate-400">&gt;&gt;</span>
              <span className="text-slate-500">Society Notice Board</span>
            </>
          )}
          {adminTab === 'staff' && (
            <>
              <span className="text-slate-800 font-semibold">Security</span>
              <span className="text-slate-400">&gt;&gt;</span>
              <span className="text-slate-500">Guards & Shift History</span>
            </>
          )}
        </div>

        {/* Tab Switcher Pills */}
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
          <button
            onClick={() => setAdminTab('amenities')}
            className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
              adminTab === 'amenities' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Amenities
          </button>
          <button
            onClick={() => setAdminTab('accounting')}
            className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
              adminTab === 'accounting' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Accounting (₹)
          </button>
          <button
            onClick={() => setAdminTab('flats')}
            className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
              adminTab === 'flats' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Flats Census
          </button>
          <button
            onClick={() => setAdminTab('complaints')}
            className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
              adminTab === 'complaints' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Helpdesk
          </button>
          <button
            onClick={() => setAdminTab('notices')}
            className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
              adminTab === 'notices' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Notices
          </button>
          <button
            onClick={() => setAdminTab('staff')}
            className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
              adminTab === 'staff' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Guards & Duties
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* ================= AMENITIES TAB (EXACTLY MATCHING USER'S SCREENSHOT) ================= */}
        {adminTab === 'amenities' && (
          <div className="space-y-8">
            {/* Top Quick Overview Table: Amenity Status */}
            <div className="bg-white rounded-xl shadow-xs border border-slate-200/90 overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Amenities &gt;&gt; Settings</span>
                  <h3 className="text-sm font-bold text-slate-800">Master Amenity List</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddAmenityGroup(true)}
                  className="bg-[#0c1f28] hover:bg-slate-800 text-white font-semibold text-xs px-3.5 py-1.5 rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  Add New
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-bold">
                      <th className="py-2.5 px-4 w-16">Sr.No.</th>
                      <th className="py-2.5 px-4">Amenity Name</th>
                      <th className="py-2.5 px-4">Charges</th>
                      <th className="py-2.5 px-4">Status</th>
                      <th className="py-2.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    <tr className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-mono">8</td>
                      <td className="py-3 px-4 font-medium">Tennis Court</td>
                      <td className="py-3 px-4">Free</td>
                      <td className="py-3 px-4">
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold text-[10px]">Active</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-sky-600 hover:text-sky-800 font-medium cursor-pointer">View | Edit</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-mono">9</td>
                      <td className="py-3 px-4 font-medium">Clubhouse Banquet Hall</td>
                      <td className="py-3 px-4">Paid (₹500/slot)</td>
                      <td className="py-3 px-4">
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold text-[10px]">Active</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-sky-600 hover:text-sky-800 font-medium cursor-pointer">View | Edit</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 1: Amenity Groups (From Screenshot) */}
            <div className="bg-white rounded-xl shadow-xs border border-slate-200/90 p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">Amenity Groups</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                    Amenities (e.g. Guest Rooms, Parkings, Tennis Courts) can be grouped together based on defined rules or location in the settings.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddAmenityGroup(true)}
                  className="bg-[#0c1f28] hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-sm transition-colors cursor-pointer self-start sm:self-center shrink-0"
                >
                  Add New
                </button>
              </div>

              {/* Neat White Grid Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-800 font-bold text-xs">
                      <th className="py-3 px-4 w-16">Sr.No.</th>
                      <th className="py-3 px-4 w-52">Title</th>
                      <th className="py-3 px-4">Description</th>
                      <th className="py-3 px-4 w-36">Type</th>
                      <th className="py-3 px-4 w-32 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {amenityGroups.map((group) => (
                      <tr key={group.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-4 px-4 font-mono text-slate-600">{group.id}</td>
                        <td className="py-4 px-4 font-bold text-slate-900">{group.title}</td>
                        <td className="py-4 px-4 text-slate-600 leading-relaxed max-w-md">{group.description}</td>
                        <td className="py-4 px-4 text-slate-800 font-medium">{group.type}</td>
                        <td className="py-4 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => alert(`Editing amenity group: ${group.title}`)}
                            className="text-sky-600 hover:text-sky-800 font-semibold cursor-pointer mr-1"
                          >
                            Edit
                          </button>
                          <span className="text-slate-300">|</span>
                          <button
                            onClick={() => setAmenityGroups((prev) => prev.filter((g) => g.id !== group.id))}
                            className="text-sky-600 hover:text-rose-600 font-semibold cursor-pointer ml-1"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 2: Amenity Cancellation Charges (From Screenshot) */}
            <div className="bg-white rounded-xl shadow-xs border border-slate-200/90 p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">Amenity Cancellation Charges</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                    Rules can be set up for paid amenities to attract additional charges upon cancellation. These charges would be auto-deducted from the Booking Amount refund.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddCancellation(true)}
                  className="bg-[#0c1f28] hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-sm transition-colors cursor-pointer self-start sm:self-center shrink-0"
                >
                  Add New
                </button>
              </div>

              {/* State: Matching Screenshot */}
              {cancellationCharges.length === 0 ? (
                <div className="py-6 px-4 text-slate-400 text-xs font-medium">
                  No Amenity Cancellation Charges found
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-800 font-bold text-xs">
                        <th className="py-3 px-4 w-16">Sr.No.</th>
                        <th className="py-3 px-4">Charge Rule</th>
                        <th className="py-3 px-4">Time Slab</th>
                        <th className="py-3 px-4">Fee Percentage</th>
                        <th className="py-3 px-4">Deduction Type</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {cancellationCharges.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4 font-mono">{c.id}</td>
                          <td className="py-3 px-4 font-bold text-slate-900">{c.title}</td>
                          <td className="py-3 px-4 text-slate-600">{c.slab}</td>
                          <td className="py-3 px-4 text-amber-700 font-bold">{c.fee}</td>
                          <td className="py-3 px-4 text-slate-600">{c.refundMode}</td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => setCancellationCharges((prev) => prev.filter((i) => i.id !== c.id))}
                              className="text-rose-600 hover:underline font-semibold cursor-pointer"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Section 3: Amenity Email Recipients (From Screenshot) */}
            <div className="bg-white rounded-xl shadow-xs border border-slate-200/90 p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">Amenity Email Recipients</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                    Email alerts will go to the following people when an owner / tenant books an amenity. Provide a maximum of 3 people for receiving such Email alerts.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddRecipient(true)}
                  className="bg-[#0c1f28] hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-sm transition-colors cursor-pointer self-start sm:self-center shrink-0"
                >
                  Add New
                </button>
              </div>

              {/* Neat White Grid Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-800 font-bold text-xs">
                      <th className="py-3 px-4 w-16">Sr.No.</th>
                      <th className="py-3 px-4">Name</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Role / Designation</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {emailRecipients.map((recip) => (
                      <tr key={recip.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-slate-600">{recip.id}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">{recip.name}</td>
                        <td className="py-3.5 px-4 font-mono text-slate-600">{recip.email}</td>
                        <td className="py-3.5 px-4 text-slate-700">{recip.role}</td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => alert(`Edit recipient ${recip.name}`)}
                            className="text-sky-600 hover:text-sky-800 font-semibold cursor-pointer mr-1"
                          >
                            Edit
                          </button>
                          <span className="text-slate-300">|</span>
                          <button
                            onClick={() => setEmailRecipients((prev) => prev.filter((r) => r.id !== recip.id))}
                            className="text-sky-600 hover:text-rose-600 font-semibold cursor-pointer ml-1"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= ACCOUNTING & LEDGER TAB (NEAT WHITE GRIDS) ================= */}
        {adminTab === 'accounting' && (
          <div className="space-y-8">
            {/* Top Financial Summary KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200/90 p-5 rounded-xl shadow-xs space-y-1">
                <span className="text-slate-500 text-xs font-semibold block">Total Revenue Collected</span>
                <p className="text-2xl font-black text-emerald-600">₹{totalCollected.toLocaleString()}</p>
                <p className="text-[11px] text-slate-400">48 Flat Maintenance assessments</p>
              </div>

              <div className="bg-white border border-slate-200/90 p-5 rounded-xl shadow-xs space-y-1">
                <span className="text-slate-500 text-xs font-semibold block">Outstanding Dues</span>
                <p className="text-2xl font-black text-amber-600">₹{totalPending.toLocaleString()}</p>
                <p className="text-[11px] text-slate-400">Due by 10th of every month</p>
              </div>

              <div className="bg-white border border-slate-200/90 p-5 rounded-xl shadow-xs space-y-1">
                <span className="text-slate-500 text-xs font-semibold block">Operational Expenses</span>
                <p className="text-2xl font-black text-rose-600">₹{totalSpent.toLocaleString()}</p>
                <p className="text-[11px] text-slate-400">Security, Lift AMC, Utilities</p>
              </div>

              <div className="bg-white border border-slate-200/90 p-5 rounded-xl shadow-xs space-y-1">
                <span className="text-slate-500 text-xs font-semibold block">Treasury Net Surplus</span>
                <p className="text-2xl font-black text-slate-900">₹{netSurplus.toLocaleString()}</p>
                <p className="text-[11px] text-emerald-600 font-semibold">Reserve Fund Solvent</p>
              </div>
            </div>

            {/* Section 1: Maintenance Invoices & Ledger Grid */}
            <div className="bg-white rounded-xl shadow-xs border border-slate-200/90 p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">Maintenance Bills & Assessment Ledger</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                    Automated assessment of monthly maintenance dues, water charges, parking fees, and collection tracking across all 48 flat units.
                  </p>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowCreateBill(true)}
                    className="bg-[#0c1f28] hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-sm transition-colors cursor-pointer"
                  >
                    Add New Bill
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-800 font-bold text-xs">
                      <th className="py-3 px-4 w-14">Sr.No.</th>
                      <th className="py-3 px-4">Flat Unit</th>
                      <th className="py-3 px-4">Owner Name</th>
                      <th className="py-3 px-4">Billing Month</th>
                      <th className="py-3 px-4">Amount (₹)</th>
                      <th className="py-3 px-4">Due Date</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {bills.map((bill, index) => (
                      <tr key={bill.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-slate-600">{index + 1}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">{bill.flatNumber}</td>
                        <td className="py-3.5 px-4 font-medium text-slate-800">{bill.ownerName}</td>
                        <td className="py-3.5 px-4 text-slate-600">{bill.monthYear}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">₹{bill.totalAmount.toLocaleString()}</td>
                        <td className="py-3.5 px-4 text-slate-600">{bill.dueDate}</td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              bill.status === 'paid'
                                ? 'bg-emerald-100 text-emerald-800'
                                : bill.status === 'overdue'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {bill.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => downloadBillReceipt(bill)}
                            className="text-sky-600 hover:text-sky-800 font-semibold cursor-pointer mr-1"
                          >
                            Receipt
                          </button>
                          <span className="text-slate-300">|</span>
                          <button
                            onClick={() => alert(`Viewing invoice breakdown for ${bill.flatNumber}`)}
                            className="text-sky-600 hover:text-sky-800 font-semibold cursor-pointer ml-1"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 2: Society Operational Expenses Grid */}
            <div className="bg-white rounded-xl shadow-xs border border-slate-200/90 p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">Society Operational Expenses</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                    Operational expenditures, security contractor salaries, elevator AMC contracts, utility bills, and routine maintenance.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddExpense(true)}
                  className="bg-[#0c1f28] hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-sm transition-colors cursor-pointer self-start sm:self-center shrink-0"
                >
                  Record Expense
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-800 font-bold text-xs">
                      <th className="py-3 px-4 w-14">Sr.No.</th>
                      <th className="py-3 px-4">Expense Title</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Amount (₹)</th>
                      <th className="py-3 px-4">Paid To</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {expenses.map((exp, index) => (
                      <tr key={exp.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-mono text-slate-600">{index + 1}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">{exp.title}</td>
                        <td className="py-3 px-4">
                          <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-medium text-[11px]">
                            {exp.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-rose-600">₹{exp.amount.toLocaleString()}</td>
                        <td className="py-3 px-4 text-slate-700">{exp.paidTo}</td>
                        <td className="py-3 px-4 text-slate-500 font-mono">{exp.date}</td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-sky-600 hover:text-sky-800 font-semibold cursor-pointer">
                            View Voucher
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= FLATS DIRECTORY TAB (NEAT WHITE GRIDS) ================= */}
        {adminTab === 'flats' && (
          <ApartmentCensusSection />
        )}

        {/* ================= HELPDESK & COMPLAINTS TAB (NEAT WHITE GRIDS) ================= */}
        {adminTab === 'complaints' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-xs border border-slate-200/90 p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">Helpdesk & Service Tickets</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                    Track resident tickets for plumbing, electrical, elevator, cleanlines, and noise disturbances.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-800 font-bold text-xs">
                      <th className="py-3 px-4 w-14">Sr.No.</th>
                      <th className="py-3 px-4">Ticket Title</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Flat Unit</th>
                      <th className="py-3 px-4">Resident</th>
                      <th className="py-3 px-4">Priority</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {complaints.map((ticket, index) => (
                      <tr key={ticket.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-slate-600">{index + 1}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">{ticket.title}</td>
                        <td className="py-3.5 px-4 text-slate-600">{ticket.category}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-800">{ticket.flatNumber}</td>
                        <td className="py-3.5 px-4 text-slate-600">{ticket.residentName}</td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              ticket.priority === 'urgent'
                                ? 'bg-rose-100 text-rose-800'
                                : ticket.priority === 'high'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {ticket.priority}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              ticket.status === 'resolved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : ticket.status === 'in_progress'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {ticket.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {ticket.status !== 'resolved' ? (
                            <button
                              onClick={() => updateComplaintStatus(ticket.id, 'resolved', 'Society Plumber')}
                              className="text-emerald-600 hover:underline font-semibold cursor-pointer"
                            >
                              Mark Resolved
                            </button>
                          ) : (
                            <span className="text-slate-400 font-medium">Completed</span>
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

        {/* ================= NOTICES TAB (NEAT WHITE GRIDS) ================= */}
        {adminTab === 'notices' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-xs border border-slate-200/90 p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">Society Notice Board</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                    Official broadcasts and circulars published to all residents.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddNotice(true)}
                  className="bg-[#0c1f28] hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  Publish Notice
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-800 font-bold text-xs">
                      <th className="py-3 px-4 w-14">Sr.No.</th>
                      <th className="py-3 px-4">Notice Title</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Published Date</th>
                      <th className="py-3 px-4">Author</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {notices.map((notice, index) => (
                      <tr key={notice.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-slate-600">{index + 1}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">{notice.title}</td>
                        <td className="py-3.5 px-4">
                          <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded font-bold text-[10px]">
                            {notice.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-600">{notice.date}</td>
                        <td className="py-3.5 px-4 text-slate-600">{notice.author}</td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => alert(`Notice: ${notice.content}`)}
                            className="text-sky-600 hover:text-sky-800 font-semibold cursor-pointer mr-1"
                          >
                            View
                          </button>
                          <span className="text-slate-300">|</span>
                          <button
                            onClick={() => deleteNotice(notice.id)}
                            className="text-sky-600 hover:text-rose-600 font-semibold cursor-pointer ml-1"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        {adminTab === 'staff' && <GuardManagementSection />}
      </div>

      {/* ================= MODAL: ADD AMENITY GROUP ================= */}
      {showAddAmenityGroup && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">Add New Amenity Group</h3>
              <button onClick={() => setShowAddAmenityGroup(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddAmenityGroup} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Group Title *</label>
                <input
                  type="text"
                  value={newGroupTitle}
                  onChange={(e) => setNewGroupTitle(e.target.value)}
                  placeholder="e.g. Wing C - Premium Club Access"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-slate-800"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={newGroupDesc}
                  onChange={(e) => setNewGroupDesc(e.target.value)}
                  placeholder="Describe rules, timings, and resident access conditions..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-slate-800"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Type</label>
                <select
                  value={newGroupType}
                  onChange={(e) => setNewGroupType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-slate-800"
                >
                  <option value="Rule Based">Rule Based</option>
                  <option value="Location Based">Location Based</option>
                  <option value="Slot Based">Slot Based</option>
                  <option value="Free Access">Free Access</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddAmenityGroup(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold"
                >
                  Save Amenity Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD CANCELLATION CHARGE ================= */}
      {showAddCancellation && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">Add Amenity Cancellation Rule</h3>
              <button onClick={() => setShowAddCancellation(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddCancellation} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Rule Name *</label>
                <input
                  type="text"
                  value={newCancelTitle}
                  onChange={(e) => setNewCancelTitle(e.target.value)}
                  placeholder="e.g. Standard 24h Cancellation"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-slate-800"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Cancellation Charge Percentage</label>
                <select
                  value={newCancelFee}
                  onChange={(e) => setNewCancelFee(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-slate-800"
                >
                  <option value="10%">10% Deduction</option>
                  <option value="20%">20% Deduction</option>
                  <option value="50%">50% Deduction</option>
                  <option value="100%">100% Non-refundable</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddCancellation(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold"
                >
                  Create Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD EMAIL RECIPIENT ================= */}
      {showAddRecipient && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">Add Amenity Email Recipient</h3>
              <button onClick={() => setShowAddRecipient(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddRecipient} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={newRecipName}
                  onChange={(e) => setNewRecipName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-slate-800"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  value={newRecipEmail}
                  onChange={(e) => setNewRecipEmail(e.target.value)}
                  placeholder="ramesh.k@society.org"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-slate-800"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Role</label>
                <input
                  type="text"
                  value={newRecipRole}
                  onChange={(e) => setNewRecipRole(e.target.value)}
                  placeholder="e.g. Clubhouse Manager"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-slate-800"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddRecipient(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold"
                >
                  Save Recipient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Existing Modals: Bill Creation */}
      {showCreateBill && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">Issue Maintenance Invoice</h3>
              <button onClick={() => setShowCreateBill(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateBillSubmit} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Flat Unit</label>
                  <select
                    value={billFlat}
                    onChange={(e) => setBillFlat(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                  >
                    {flats.map((f) => (
                      <option key={f.flatNumber} value={f.flatNumber}>
                        {f.flatNumber} ({f.ownerName})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Billing Month</label>
                  <input
                    type="text"
                    value={billMonth}
                    onChange={(e) => setBillMonth(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Base Maintenance (₹)</label>
                  <input
                    type="number"
                    value={baseMaint}
                    onChange={(e) => setBaseMaint(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Water Charges (₹)</label>
                  <input
                    type="number"
                    value={waterChg}
                    onChange={(e) => setWaterChg(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateBill(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg font-bold"
                >
                  Issue Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddExpense && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">Record Society Expense</h3>
              <button onClick={() => setShowAddExpense(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddExpenseSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Expense Title</label>
                <input
                  type="text"
                  value={expTitle}
                  onChange={(e) => setExpTitle(e.target.value)}
                  placeholder="e.g. Lift AMC Monthly Maintenance"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    value={expAmount}
                    onChange={(e) => setExpAmount(Number(e.target.value))}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Paid To (Vendor)</label>
                  <input
                    type="text"
                    value={expPaidTo}
                    onChange={(e) => setExpPaidTo(e.target.value)}
                    placeholder="Otis Elevator Co."
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddExpense(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg font-bold"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddNotice && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">Publish Notice</h3>
              <button onClick={() => setShowAddNotice(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddNoticeSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Notice Title</label>
                <input
                  type="text"
                  value={noticeTitle}
                  onChange={(e) => setNoticeTitle(e.target.value)}
                  placeholder="e.g. Annual General Body Meeting 2026"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Content</label>
                <textarea
                  rows={4}
                  value={noticeContent}
                  onChange={(e) => setNoticeContent(e.target.value)}
                  placeholder="Details of the circular..."
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddNotice(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg font-bold"
                >
                  Publish Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
