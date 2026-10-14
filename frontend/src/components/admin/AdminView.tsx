import React, { useState, useEffect } from 'react';
import { useSociety } from '../../context/SocietyContext';
import { downloadBillReceipt, downloadExpenseVoucher } from '../../utils/receiptGenerator';
import type { Amenity, MaintenanceBill, SocietyBankDetails } from '../../types';
import { ApartmentCensusSection } from './ApartmentCensusSection';
import { GuardManagementSection } from './GuardManagementSection';
import { SocietyStaffManagementSection } from './SocietyStaffManagementSection';
import { AssetsInventorySection } from './AssetsInventorySection';
import { AdminSettingsSection } from './AdminSettingsSection';
import {
  Activity,
  Bell,
  Building2,
  CircleDollarSign,
  DoorOpen,
  DollarSign,
  FileClock,
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
  UserRound,
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
  Tag,
  MapPin,
  IndianRupee,
  UsersRound,
  Image,
  Timer,
  LayoutGrid,
  House,
  CalendarDays,
  FileBadge,
  Droplet,
  CarFront,
  CirclePlus,
  Info,
} from 'lucide-react';

export const AdminView: React.FC = () => {
  const {
    flats,
    bills,
    expenses,
    complaints,
    notices,
    amenities,
    bookings,
    users,
    currentUser,
    visitors,
    staff,
    societies,
    currentSocietyName,
    guardEventSecurityPlans,
    createBill,
    addExpense,
    addAmenity,
    updateAmenity,
    deleteAmenity,
    saveGuardEventSecurityPlan,
    updateSocietyBankDetails,
    updateComplaintStatus,
    approveAmenityBooking,
    rejectAmenityBooking,
    addNotice,
    deleteNotice,
    activeSidebarNav,
    setActiveSidebarNav,
  } = useSociety();

  const [adminTab, setAdminTab] = useState<'dashboard' | 'accounting' | 'flats' | 'complaints' | 'notices' | 'staff' | 'amenities' | 'assets' | 'settings'>(() => {
    if (activeSidebarNav === 'dashboard') return 'dashboard';
    if (activeSidebarNav === 'accounting' || activeSidebarNav === 'reports') return 'accounting';
    if (activeSidebarNav === 'flats' || activeSidebarNav === 'community') return 'flats';
    if (activeSidebarNav === 'helpdesk') return 'complaints';
    if (activeSidebarNav === 'notices') return 'notices';
    if (activeSidebarNav === 'staff') return 'staff';
    if (activeSidebarNav === 'deliveries') return 'assets';
    if (activeSidebarNav === 'settings') return 'settings';
    return 'amenities';
  });
  const societyFlats = flats.filter((flat) => flat.societyName === currentSocietyName);
  const societyVisitors = visitors.filter((visitor) => visitor.societyName === currentSocietyName);
  const societyBills = bills.filter((bill) => bill.societyName === currentSocietyName);
  const societyExpenses = expenses.filter((expense) => expense.societyName === currentSocietyName);
  const societyAmenities = amenities.filter((amenity) => amenity.societyName === currentSocietyName);
  const societyBookings = bookings.filter((booking) => booking.societyName === currentSocietyName);
  const pendingAmenityBookings = societyBookings
    .filter((booking) => booking.status === 'pending')
    .sort((first, second) => `${first.date} ${first.timeSlot}`.localeCompare(`${second.date} ${second.timeSlot}`));
  const societyComplaints = complaints.filter((ticket) => ticket.societyName === currentSocietyName);
  const societyNotices = notices.filter((notice) => notice.societyName === currentSocietyName);
  const societyResidents = users.filter((user) => user.role === 'resident' && user.societyName === currentSocietyName);
  const societyGuards = users.filter((user) => user.role === 'guard' && user.societyName === currentSocietyName && user.guardStatus !== 'inactive');
  const societyStaff = staff.filter((person) => person.societyName === currentSocietyName);
  const selectedBankSociety = societies.find((society) => society.name === currentSocietyName);
  const [bankDetails, setBankDetails] = useState<SocietyBankDetails>({
    accountHolderName: '',
    accountNumber: '',
    bankName: '',
    ifscCode: '',
    branchName: '',
    bankAddress: '',
    accountType: 'Savings',
    upiId: '',
  });
  const [bankDetailsNotice, setBankDetailsNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isEditingBankDetails, setIsEditingBankDetails] = useState(false);
  const [amenityBookingNotice, setAmenityBookingNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [rejectingBookingId, setRejectingBookingId] = useState<string | null>(null);
  const [rejectionReasonCategory, setRejectionReasonCategory] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionFeedback, setRejectionFeedback] = useState('');

  useEffect(() => {
    const saved = selectedBankSociety?.bankDetails;
    setBankDetails({
      accountHolderName: saved?.accountHolderName || '',
      accountNumber: saved?.accountNumber || '',
      bankName: saved?.bankName || '',
      ifscCode: saved?.ifscCode || '',
      branchName: saved?.branchName || '',
      bankAddress: saved?.bankAddress || '',
      accountType: saved?.accountType || 'Savings',
      upiId: saved?.upiId || '',
    });
    setIsEditingBankDetails(!saved);
  }, [currentSocietyName, selectedBankSociety?.bankDetails]);

  useEffect(() => {
    setBankDetailsNotice(null);
  }, [currentSocietyName]);

  const handleSaveBankDetails = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedBankSociety) {
      setBankDetailsNotice({ type: 'error', message: 'Select a valid society before saving bank details.' });
      return;
    }
    const result = updateSocietyBankDetails(selectedBankSociety.id, bankDetails);
    setBankDetailsNotice({ type: result.success ? 'success' : 'error', message: result.message });
    if (result.success) setIsEditingBankDetails(false);
  };

  const handleCancelBankDetailsEdit = () => {
    const saved = selectedBankSociety?.bankDetails;
    if (saved) {
      setBankDetails({
        accountHolderName: saved.accountHolderName,
        accountNumber: saved.accountNumber,
        bankName: saved.bankName,
        ifscCode: saved.ifscCode,
        branchName: saved.branchName,
        bankAddress: saved.bankAddress,
        accountType: saved.accountType,
        upiId: saved.upiId || '',
      });
    }
    setBankDetailsNotice(null);
    setIsEditingBankDetails(false);
  };

  const handleAmenityBookingDecision = (bookingId: string, decision: 'approve' | 'reject') => {
    if (decision === 'approve') {
      openEventPlanEditor(`booking:${bookingId}`);
      return;
    }
    setRejectingBookingId(bookingId);
    setRejectionReasonCategory('');
    setRejectionReason('');
    setRejectionFeedback('');
    setAmenityBookingNotice(null);
  };

  const handleRejectAmenityBooking = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!rejectingBookingId) return;
    const result = rejectAmenityBooking(rejectingBookingId, rejectionReasonCategory, rejectionReason);
    setRejectionFeedback(result.message);
    if (result.success) {
      setAmenityBookingNotice({ type: 'success', message: result.message });
      setRejectingBookingId(null);
    }
  };

  // Synchronize with left sidebar selection
  useEffect(() => {
    if (activeSidebarNav === 'accounting' || activeSidebarNav === 'reports') {
      setAdminTab('accounting');
    } else if (activeSidebarNav === 'dashboard') {
      setAdminTab('dashboard');
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
    } else if (activeSidebarNav === 'deliveries') {
      setAdminTab('assets');
    } else if (activeSidebarNav === 'settings') {
      setAdminTab('settings');
    }
  }, [activeSidebarNav]);

  // Modal States
  const [showCreateBill, setShowCreateBill] = useState(false);
  const [selectedBill, setSelectedBill] = useState<MaintenanceBill | null>(null);
  const [billFlat, setBillFlat] = useState('B-402');
  const [billOwner, setBillOwner] = useState('');
  const [billMonth, setBillMonth] = useState('September 2026');
  const [billDueDate, setBillDueDate] = useState('2026-09-10');
  const [billInvoiceDate, setBillInvoiceDate] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  });
  const [billType, setBillType] = useState('Maintenance');
  const [billStatus, setBillStatus] = useState<'pending' | 'overdue'>('pending');
  const [billNotes, setBillNotes] = useState('');
  const [baseMaint, setBaseMaint] = useState(3500);
  const [waterChg, setWaterChg] = useState(450);
  const [parkingChg, setParkingChg] = useState(500);
  const [clubChg, setClubChg] = useState(300);

  useEffect(() => {
    if (!societyFlats.some((flat) => flat.flatNumber === billFlat)) {
      setBillFlat(societyFlats[0]?.flatNumber || '');
    }
  }, [currentSocietyName, flats]);

  const [showAddExpense, setShowAddExpense] = useState(false);
  const [expTitle, setExpTitle] = useState('');
  const [expCategory, setExpCategory] = useState<
    'Security' | 'Maintenance & Repairs' | 'Utilities' | 'Gardening' | 'Elevator AMC' | 'Events' | 'Administrative'
  >('Maintenance & Repairs');
  const [expAmount, setExpAmount] = useState(1500);
  const [expPaidTo, setExpPaidTo] = useState('');
  const [expMode, setExpMode] = useState('Bank Transfer');
  const [expDate, setExpDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [expNotes, setExpNotes] = useState('');

  // Notice Form
  const [showAddNotice, setShowAddNotice] = useState(false);
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeCategory, setNoticeCategory] = useState<'General' | 'Maintenance' | 'Emergency' | 'Event' | 'Financial'>('General');
  const [noticeContent, setNoticeContent] = useState('');
  const [noticeAuthor, setNoticeAuthor] = useState('Society Management Committee');
  const [noticeImportant, setNoticeImportant] = useState(false);
  const [editingSecurityEventId, setEditingSecurityEventId] = useState<string | null>(null);
  const [eventAssignedGuardIds, setEventAssignedGuardIds] = useState<string[]>([]);
  const [eventEntryGate, setEventEntryGate] = useState('');
  const [eventParkingArea, setEventParkingArea] = useState('');
  const [eventGuestProtocol, setEventGuestProtocol] = useState('');
  const [eventParkingPlan, setEventParkingPlan] = useState('');
  const [eventGuardNotes, setEventGuardNotes] = useState('');
  const [eventPlanFeedback, setEventPlanFeedback] = useState('');

  // Amenity Groups matching the user screenshot!
  const [amenityGroups, setAmenityGroups] = useState<Array<{ id: number; title: string; description: string; type: string }>>(() => {
    const saved = localStorage.getItem('mygate_amenity_groups');
    return saved ? JSON.parse(saved) : [
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
    ];
  });

  const [showAddAmenityGroup, setShowAddAmenityGroup] = useState(false);
  const [editingAmenityGroupId, setEditingAmenityGroupId] = useState<number | null>(null);
  const [newGroupTitle, setNewGroupTitle] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [newGroupType, setNewGroupType] = useState('Rule Based');
  const [showAmenityForm, setShowAmenityForm] = useState(false);
  const [editingAmenityId, setEditingAmenityId] = useState<string | null>(null);
  const [viewingAmenity, setViewingAmenity] = useState<Amenity | null>(null);
  const [amenityName, setAmenityName] = useState('');
  const [amenityCategory, setAmenityCategory] = useState('Recreation');
  const [amenityLocation, setAmenityLocation] = useState('');
  const [amenityRate, setAmenityRate] = useState(0);
  const [amenityCapacity, setAmenityCapacity] = useState(10);
  const [amenityDescription, setAmenityDescription] = useState('');
  const [amenityImage, setAmenityImage] = useState('');
  const [amenitySlots, setAmenitySlots] = useState<string[]>(['09:00 - 10:00']);
  const [customSlotStart, setCustomSlotStart] = useState('22:00');
  const [customSlotEnd, setCustomSlotEnd] = useState('23:00');
  const [amenityActive, setAmenityActive] = useState(true);

  // Cancellation Charges matching user screenshot
  const [cancellationCharges, setCancellationCharges] = useState<
    Array<{ id: number; title: string; slab: string; fee: string; refundMode: string }>
  >(() => {
    const saved = localStorage.getItem('mygate_amenity_cancellation_charges');
    return saved ? JSON.parse(saved) : [];
  });
  const [showAddCancellation, setShowAddCancellation] = useState(false);
  const [editingCancellationId, setEditingCancellationId] = useState<number | null>(null);
  const [newCancelTitle, setNewCancelTitle] = useState('');
  const [newCancelFee, setNewCancelFee] = useState('10%');

  // Amenity Email Recipients matching user screenshot
  const [emailRecipients, setEmailRecipients] = useState<Array<{ id: number; name: string; email: string; role: string }>>(() => {
    const saved = localStorage.getItem('mygate_amenity_email_recipients');
    return saved ? JSON.parse(saved) : [
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
    ];
  });
  const [showAddRecipient, setShowAddRecipient] = useState(false);
  const [editingRecipientId, setEditingRecipientId] = useState<number | null>(null);
  const [newRecipName, setNewRecipName] = useState('');
  const [newRecipEmail, setNewRecipEmail] = useState('');
  const [newRecipRole, setNewRecipRole] = useState('Committee Member');

  useEffect(() => {
    localStorage.setItem('mygate_amenity_groups', JSON.stringify(amenityGroups));
  }, [amenityGroups]);

  useEffect(() => {
    localStorage.setItem('mygate_amenity_cancellation_charges', JSON.stringify(cancellationCharges));
  }, [cancellationCharges]);

  useEffect(() => {
    localStorage.setItem('mygate_amenity_email_recipients', JSON.stringify(emailRecipients));
  }, [emailRecipients]);

  // Financial Calculations
  const maintenanceCollected = societyBills.filter((b) => b.status === 'paid').reduce((acc, b) => acc + b.totalAmount, 0);
  const amenityCollected = societyBookings
    .filter((booking) => booking.status === 'confirmed')
    .reduce((acc, booking) => acc + booking.amountPaid, 0);
  const totalCollected = maintenanceCollected + amenityCollected;
  const totalPending = societyBills.filter((b) => b.status === 'pending' || b.status === 'overdue').reduce((acc, b) => acc + b.totalAmount, 0);
  const totalSpent = societyExpenses.reduce((acc, e) => acc + e.amount, 0);
  const netSurplus = totalCollected - totalSpent;
  const activeGuards = users.filter((user) => user.role === 'guard' && user.guardStatus !== 'inactive' &&
    (user.societyName === currentSocietyName || (!user.societyName && currentSocietyName === societies[0]?.name)));
  const todayDate = new Date().toISOString().split('T')[0];
  const visitorsToday = societyVisitors.filter((visitor) => visitor.expectedDate === todayDate);
  const visitorsInGate = societyVisitors.filter((visitor) => visitor.status === 'in_gate');
  const visitorsCheckedOut = societyVisitors.filter((visitor) => visitor.status === 'checked_out');
  const openTickets = societyComplaints.filter((ticket) => ticket.status !== 'resolved');
  const paidBills = societyBills.filter((bill) => bill.status === 'paid');
  const collectionProgress = societyBills.length
    ? Math.round((paidBills.length / societyBills.length) * 100)
    : 0;
  const occupiedFlats = societyFlats.filter((flat) => flat.occupancyStatus !== 'Vacant');
  const recentVisitors = [...societyVisitors].sort((first, second) =>
    (second.generatedAt || second.expectedDate).localeCompare(first.generatedAt || first.expectedDate)
  ).slice(0, 5);
  const recentPaidBills = [...paidBills].sort((first, second) =>
    (second.paidDate || second.dueDate).localeCompare(first.paidDate || first.dueDate)
  ).slice(0, 3);
  const eventSecurityItems = [
    ...societyNotices
      .filter((notice) => notice.category === 'Event')
      .map((notice) => ({
        eventId: `notice:${notice.id}`,
        title: notice.title,
        date: notice.date,
        detail: notice.content,
      })),
    ...societyBookings
      .filter((booking) =>
        (booking.status === 'confirmed' && booking.date >= todayDate) || booking.status === 'pending'
      )
      .map((booking) => ({
        eventId: `booking:${booking.id}`,
        title: booking.amenityName,
        date: booking.date,
        detail: `${booking.residentName} · Flat ${booking.flatNumber} · ${booking.timeSlot}`,
      })),
  ].sort((first, second) => first.date.localeCompare(second.date));

  const handleCreateBillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetFlatObj = societyFlats.find((f) => f.flatNumber === billFlat);
    if (!targetFlatObj) {
      window.alert(`Add a flat to ${currentSocietyName} before issuing a maintenance bill.`);
      return;
    }
    const ownerName = targetFlatObj.ownerName;
    const total = Number(baseMaint) + Number(waterChg) + Number(parkingChg) + Number(clubChg);

    createBill({
      flatNumber: billFlat,
      ownerName,
      monthYear: billMonth,
      invoiceDate: billInvoiceDate,
      invoiceType: billType,
      notes: billNotes.trim(),
      dueDate: billDueDate,
      baseMaintenance: Number(baseMaint),
      waterCharges: Number(waterChg),
      parkingCharges: Number(parkingChg),
      clubhouseFee: 0,
      otherCharges: Number(clubChg),
      lateFee: 0,
      totalAmount: total,
      status: billStatus,
    });
    setShowCreateBill(false);
  };

  const handleAddExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expTitle.trim() || !expPaidTo.trim() || expAmount <= 0) return;

    addExpense({
      title: expTitle.trim(),
      category: expCategory,
      amount: expAmount,
      date: expDate,
      paidTo: expPaidTo.trim(),
      paymentMode: expMode,
      approvedBy: 'Admin Treasurer',
      notes: expNotes.trim() || undefined,
    });

    setExpTitle('');
    setExpPaidTo('');
    setExpAmount(1500);
    setExpCategory('Maintenance & Repairs');
    setExpMode('Bank Transfer');
    setExpDate(new Date().toISOString().split('T')[0]);
    setExpNotes('');
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

  const openEventPlanEditor = (eventId: string) => {
    const plan = guardEventSecurityPlans.find((item) => item.eventId === eventId);
    setEditingSecurityEventId(eventId);
    setEventAssignedGuardIds(plan?.assignedGuardIds || []);
    setEventEntryGate(plan?.entryGate || '');
    setEventParkingArea(plan?.parkingArea || '');
    setEventGuestProtocol(plan?.guestProtocol || '');
    setEventParkingPlan(plan?.parkingPlan || '');
    setEventGuardNotes(plan?.guardNotes || '');
    setEventPlanFeedback('');
  };

  const handleSaveEventPlan = (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingSecurityEventId) return;
    const assignedGuardNames = activeGuards
      .filter((guard) => eventAssignedGuardIds.includes(guard.id))
      .map((guard) => guard.name);
    const plan = {
      eventId: editingSecurityEventId,
      assignedGuardCount: assignedGuardNames.length,
      assignedGuardIds: eventAssignedGuardIds,
      assignedGuardNames,
      entryGate: eventEntryGate,
      parkingArea: eventParkingArea,
      guestProtocol: eventGuestProtocol,
      parkingPlan: eventParkingPlan,
      guardNotes: eventGuardNotes,
      status: 'ready',
    } as const;
    const pendingBooking = editingSecurityEventId.startsWith('booking:')
      ? societyBookings.find((booking) =>
        `booking:${booking.id}` === editingSecurityEventId && booking.status === 'pending'
      )
      : undefined;
    const result = pendingBooking
      ? approveAmenityBooking(pendingBooking.id, plan)
      : saveGuardEventSecurityPlan(plan);
    setEventPlanFeedback(result.message);
    if (result.success) {
      if (pendingBooking) setAmenityBookingNotice({ type: 'success', message: result.message });
      setEditingSecurityEventId(null);
    }
  };

  const handleAddAmenityGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupTitle.trim()) return;
    const groupData = {
      title: newGroupTitle.trim(),
      description: newGroupDesc.trim() || 'Custom amenity rules configured for society residents.',
      type: newGroupType,
    };
    if (editingAmenityGroupId !== null) {
      setAmenityGroups((prev) => prev.map((group) => (
        group.id === editingAmenityGroupId ? { ...group, ...groupData } : group
      )));
    } else {
      setAmenityGroups((prev) => [...prev, { id: Math.max(0, ...prev.map((group) => group.id)) + 1, ...groupData }]);
    }
    setEditingAmenityGroupId(null);
    setNewGroupTitle('');
    setNewGroupDesc('');
    setShowAddAmenityGroup(false);
  };

  const openAmenityForm = (amenity?: Amenity) => {
    setEditingAmenityId(amenity?.id || null);
    setAmenityName(amenity?.name || '');
    setAmenityCategory(amenity?.category || 'Recreation');
    setAmenityLocation(amenity?.location || '');
    setAmenityRate(amenity?.hourlyRate || 0);
    setAmenityCapacity(amenity?.maxCapacity || 10);
    setAmenityDescription(amenity?.description || '');
    setAmenityImage(amenity?.image || '');
    setAmenitySlots(amenity?.availableSlots || ['09:00 - 10:00']);
    setCustomSlotStart('22:00');
    setCustomSlotEnd('23:00');
    setAmenityActive(amenity?.isActive !== false);
    setShowAmenityForm(true);
  };

  const handleSaveAmenity = (e: React.FormEvent) => {
    e.preventDefault();
    const amenityData: Omit<Amenity, 'id'> = {
      name: amenityName.trim(),
      category: amenityCategory.trim(),
      location: amenityLocation.trim(),
      hourlyRate: amenityRate,
      maxCapacity: amenityCapacity,
      image: amenityImage.trim(),
      availableSlots: amenitySlots,
      description: amenityDescription.trim(),
      isActive: amenityActive,
    };
    if (editingAmenityId) {
      updateAmenity(editingAmenityId, amenityData);
    } else {
      addAmenity(amenityData);
    }
    setShowAmenityForm(false);
  };

  const handleAddCancellation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCancelTitle.trim()) return;
    const chargeData = {
      title: newCancelTitle.trim(),
      slab: 'Cancellation within 24 hrs of slot',
      fee: newCancelFee,
      refundMode: 'Auto-deducted from refund',
    };
    if (editingCancellationId !== null) {
      setCancellationCharges((prev) => prev.map((charge) => (
        charge.id === editingCancellationId ? { ...charge, ...chargeData } : charge
      )));
    } else {
      setCancellationCharges((prev) => [...prev, { id: Math.max(0, ...prev.map((charge) => charge.id)) + 1, ...chargeData }]);
    }
    setEditingCancellationId(null);
    setNewCancelTitle('');
    setShowAddCancellation(false);
  };

  const handleAddRecipient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecipName.trim() || !newRecipEmail.trim()) return;
    if (editingRecipientId === null && emailRecipients.length >= 3) {
      window.alert('Maximum of 3 email recipients allowed.');
      return;
    }
    const recipientData = {
      name: newRecipName.trim(),
      email: newRecipEmail.trim(),
      role: newRecipRole.trim(),
    };
    if (editingRecipientId !== null) {
      setEmailRecipients((prev) => prev.map((recipient) => (
        recipient.id === editingRecipientId ? { ...recipient, ...recipientData } : recipient
      )));
    } else {
      setEmailRecipients((prev) => [...prev, { id: Math.max(0, ...prev.map((recipient) => recipient.id)) + 1, ...recipientData }]);
    }
    setEditingRecipientId(null);
    setNewRecipName('');
    setNewRecipEmail('');
    setNewRecipRole('Committee Member');
    setShowAddRecipient(false);
  };

  const handleDashboardMetricAction = (action: 'residents' | 'visitors' | 'helpdesk' | 'accounting') => {
    if (action === 'visitors') {
      document.getElementById('admin-dashboard-visitors')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const destination = {
      residents: 'community',
      helpdesk: 'helpdesk',
      accounting: 'accounting',
    } as const;
    setActiveSidebarNav(destination[action]);
  };

  return (
    <div className="w-full min-h-screen bg-[#f8fafc] text-slate-800 pb-16 font-sans">
      {adminTab !== 'dashboard' && adminTab !== 'assets' && adminTab !== 'settings' && (
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
              <span className="text-slate-800 font-semibold">Accounts</span>
              <span className="text-slate-400">&gt;&gt;</span>
              <span className="text-slate-500">Bank Details & Financial Ledger</span>
            </>
          )}
          {adminTab === 'flats' && (
            <>
              <span className="text-slate-800 font-semibold">{activeSidebarNav === 'community' ? 'People Hub' : 'Properties'}</span>
              <span className="text-slate-400">&gt;&gt;</span>
              <span className="text-slate-500">{activeSidebarNav === 'community' ? 'Society Households & Flat Directory' : 'Flat Census Directory'}</span>
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
              <span className="text-slate-800 font-semibold">People & Security</span>
              <span className="text-slate-400">&gt;&gt;</span>
              <span className="text-slate-500">Society Staff, Guards & Duties</span>
            </>
          )}
        </div>

        {activeSidebarNav !== 'community' && (
          <>
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
            Staff & Guards
          </button>
        </div>
          </>
        )}
      </div>
      )}

      {/* Main Container */}
      <div className={`${adminTab === 'dashboard' || adminTab === 'assets' || adminTab === 'settings' ? 'mx-auto w-full max-w-none space-y-5 px-0 py-0' : `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${activeSidebarNav === 'community' ? 'py-4 space-y-4' : 'py-6 space-y-8'}`}`}>
        {adminTab === 'settings' && <AdminSettingsSection key={currentSocietyName} />}
        {adminTab === 'dashboard' && (
          <div className="grid w-full items-start gap-5 xl:grid-cols-12">
            <div className="space-y-5 xl:col-span-8">
              {pendingAmenityBookings.length > 0 && (
                <section className="overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-orange-50 shadow-md">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-100 px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                        <Bell className="h-5 w-5" />
                        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white">
                          {pendingAmenityBookings.length}
                        </span>
                      </span>
                      <div>
                        <h2 className="text-base font-bold text-slate-900">Amenity booking requests</h2>
                        <p className="text-xs text-slate-600">New resident requests awaiting your approval.</p>
                      </div>
                    </div>
                    <span className="rounded-full border border-amber-200 bg-white px-3 py-1 text-xs font-bold text-amber-800">
                      {pendingAmenityBookings.length} pending
                    </span>
                  </div>
                  {amenityBookingNotice && (
                    <p role="status" className={`mx-5 mt-4 rounded-lg border px-3 py-2 text-xs font-semibold ${
                      amenityBookingNotice.type === 'success'
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                        : 'border-rose-200 bg-rose-50 text-rose-800'
                    }`}>
                      {amenityBookingNotice.message}
                    </p>
                  )}
                  <div className="divide-y divide-amber-100">
                    {pendingAmenityBookings.map((booking) => (
                      <div key={booking.id} className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900">{booking.amenityName} <span className="font-medium text-slate-500">· Flat {booking.flatNumber}</span></p>
                          <p className="mt-1 text-xs text-slate-600">
                            {booking.residentName} · {booking.date} · {booking.timeSlot} · {booking.guestsCount} guest{booking.guestsCount === 1 ? '' : 's'}
                          </p>
                        </div>
                        <div className="flex shrink-0 gap-2">
                          <button
                            type="button"
                            onClick={() => handleAmenityBookingDecision(booking.id, 'approve')}
                            className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAmenityBookingDecision(booking.id, 'reject')}
                            className="rounded-lg border border-rose-200 bg-white px-3 py-2 text-xs font-bold text-rose-700 transition hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
              <section className="rounded-2xl border border-sky-100 bg-gradient-to-br from-white via-sky-50/70 to-indigo-50/70 p-5 shadow-md sm:p-7">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-2xl font-bold tracking-tight text-slate-900">
                      Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {currentUser?.name || 'Admin'}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">Here’s what’s happening in {currentSocietyName} today.</p>
                  </div>
                  <div className="flex items-center gap-2 rounded-full border border-emerald-100 bg-white/80 px-3 py-2 text-xs font-medium text-slate-600 shadow-sm">
                    <Activity className="h-4 w-4 text-emerald-600" />
                    Live society data
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    { label: 'New Residents', value: societyResidents.filter((user) => user.createdAt.slice(0, 10) === todayDate).length, icon: UserPlus, style: 'bg-sky-100 text-sky-800', card: 'from-sky-50 to-blue-100/70 border-sky-200', description: 'Added today', action: 'residents' as const },
                    { label: 'Visitor Activity', value: visitorsToday.length, icon: DoorOpen, style: 'bg-emerald-100 text-emerald-800', card: 'from-emerald-50 to-teal-100/70 border-emerald-200', description: 'Expected today', action: 'visitors' as const },
                    { label: 'Open Help Desk Tickets', value: openTickets.length, icon: AlertCircle, style: 'bg-orange-100 text-orange-800', card: 'from-orange-50 to-amber-100/70 border-orange-200', description: 'Awaiting resolution', action: 'helpdesk' as const },
                    { label: 'Outstanding Dues', value: `₹${totalPending.toLocaleString()}`, icon: CircleDollarSign, style: 'bg-violet-100 text-violet-800', card: 'from-violet-50 to-purple-100/70 border-violet-200', description: 'Pending and overdue bills', action: 'accounting' as const },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => handleDashboardMetricAction(item.action)}
                        aria-label={`View ${item.label}`}
                        className={`flex min-h-[100px] w-full cursor-pointer items-center justify-between rounded-xl border bg-gradient-to-br px-4 py-4 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 ${item.card}`}
                      >
                        <div className="flex items-center gap-4">
                          <span className={`flex h-12 w-12 items-center justify-center rounded-full shadow-sm ${item.style}`}>
                            <Icon className="h-6 w-6" />
                          </span>
                          <div>
                            <p className="text-xs font-semibold text-slate-600">{item.label}</p>
                            <p className="text-2xl font-bold leading-8 text-slate-900">{item.value}</p>
                            <p className="text-[11px] text-slate-500">{item.description}</p>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 shrink-0 rounded-full bg-white p-1 text-slate-500 shadow-sm" />
                      </button>
                    );
                  })}
                </div>
              </section>

              <div className="grid gap-5 md:grid-cols-2">
                <section className="rounded-2xl border border-sky-100 bg-gradient-to-br from-white to-sky-50/80 p-5 shadow-md">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-base font-bold text-slate-800">Visitor & Security Overview</h2>
                    <span className="text-[10px] text-slate-400">All recorded passes</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full shadow-sm" style={{ background: 'conic-gradient(#10b981 0deg 120deg, #3b82f6 120deg 250deg, #f97316 250deg 360deg)' }}>
                      <div className="flex h-[78px] w-[78px] flex-col items-center justify-center rounded-full bg-white">
                        <span className="text-2xl font-bold text-slate-800">{societyVisitors.length}</span>
                        <span className="text-[9px] text-slate-500">Total visitors</span>
                      </div>
                    </div>
                    <div className="min-w-0 flex-1 space-y-2 text-[11px]">
                      <div className="flex items-center justify-between gap-2"><span className="flex items-center gap-1.5 text-slate-500"><i className="h-2 w-2 rounded-full bg-emerald-500" />In gate</span><strong className="text-slate-700">{visitorsInGate.length}</strong></div>
                      <div className="flex items-center justify-between gap-2"><span className="flex items-center gap-1.5 text-slate-500"><i className="h-2 w-2 rounded-full bg-blue-500" />Expected</span><strong className="text-slate-700">{societyVisitors.filter((visitor) => visitor.status === 'expected' || visitor.status === 'pending_approval').length}</strong></div>
                      <div className="flex items-center justify-between gap-2"><span className="flex items-center gap-1.5 text-slate-500"><i className="h-2 w-2 rounded-full bg-orange-500" />Checked out</span><strong className="text-slate-700">{visitorsCheckedOut.length}</strong></div>
                    </div>
                  </div>
                </section>

                <section className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-white to-emerald-50/80 p-5 shadow-md">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-base font-bold text-slate-800">Today’s Gate Activity</h2>
                    <span className="text-[10px] text-slate-400">{new Date().toLocaleDateString()}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-100 to-green-50 p-4">
                      <p className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-700"><ArrowDownRight className="h-4 w-4" /> In gate</p>
                      <p className="mt-1 text-2xl font-semibold text-slate-900">{visitorsInGate.length}</p>
                      <p className="mt-1 text-[10px] text-slate-500">Currently on site</p>
                    </div>
                    <div className="rounded-xl border border-rose-200 bg-gradient-to-br from-rose-100 to-pink-50 p-4">
                      <p className="flex items-center gap-1.5 text-[11px] font-medium text-rose-700"><ArrowUpRight className="h-4 w-4" /> Checked out</p>
                      <p className="mt-1 text-2xl font-semibold text-slate-900">{visitorsCheckedOut.length}</p>
                      <p className="mt-1 text-[10px] text-slate-500">Recorded exits</p>
                    </div>
                  </div>
                </section>
              </div>

              <section className="rounded-2xl border border-violet-100 bg-gradient-to-r from-white via-violet-50/60 to-sky-50/70 p-5 shadow-md">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-base font-bold text-slate-800">Quick Actions</h2>
                  <span className="text-[10px] text-slate-400">Go to a management section</span>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { label: 'Notices', icon: Bell, nav: 'notices' as const, tone: 'text-emerald-700 bg-emerald-50' },
                    { label: 'Help Desk', icon: FileClock, nav: 'helpdesk' as const, tone: 'text-sky-700 bg-sky-50' },
                    { label: 'Accounts', icon: Receipt, nav: 'accounting' as const, tone: 'text-violet-700 bg-violet-50' },
                    { label: 'People Hub', icon: Users, nav: 'community' as const, tone: 'text-amber-700 bg-amber-50' },
                  ].map((action) => {
                    const Icon = action.icon;
                    return (
                      <button key={action.label} type="button" onClick={() => setActiveSidebarNav(action.nav)} className="flex min-h-12 items-center gap-2 rounded-xl border border-white bg-white/80 p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md">
                        <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${action.tone}`}><Icon className="h-5 w-5" /></span>
                        <span className="text-xs font-semibold text-slate-700">{action.label}</span>
                        <ChevronRight className="ml-auto h-3.5 w-3.5 text-slate-400" />
                      </button>
                    );
                  })}
                </div>
              </section>

              <div className="grid gap-5 lg:grid-cols-5">
                <section id="admin-dashboard-visitors" className="overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-md lg:col-span-3">
                  <div className="flex items-center justify-between border-b border-sky-100 bg-gradient-to-r from-sky-50 to-white px-5 py-4">
                    <h2 className="text-base font-bold text-slate-800">Recent Visitors</h2>
                    <span className="text-[10px] text-slate-400">{societyVisitors.length} records</span>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {recentVisitors.length ? recentVisitors.map((visitor) => (
                      <div key={visitor.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                        <div className="min-w-0">
                          <p className="truncate text-[11px] font-semibold text-slate-800">{visitor.visitorName}</p>
                          <p className="truncate text-[10px] text-slate-500">Flat {visitor.flatNumber} · {visitor.category}</p>
                        </div>
                        <span className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-semibold ${
                          visitor.status === 'in_gate' ? 'bg-emerald-100 text-emerald-700' :
                            visitor.status === 'checked_out' ? 'bg-slate-100 text-slate-600' :
                              visitor.status === 'denied' ? 'bg-rose-100 text-rose-700' : 'bg-sky-100 text-sky-700'
                        }`}>{visitor.status.replace('_', ' ')}</span>
                      </div>
                    )) : <p className="px-4 py-5 text-xs text-slate-500">No visitor passes recorded for this society yet.</p>}
                  </div>
                </section>

                <section className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-white to-emerald-50/80 p-5 shadow-md lg:col-span-2">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-base font-bold text-slate-800">Dues Collection</h2>
                    <button type="button" onClick={() => setActiveSidebarNav('accounting')} className="text-[10px] font-semibold text-sky-700 hover:text-sky-900">View accounts <ArrowUpRight className="inline h-3 w-3" /></button>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full shadow-sm" style={{ background: `conic-gradient(#10b981 0% ${collectionProgress}%, #e2e8f0 ${collectionProgress}% 100%)` }}>
                      <div className="flex h-[70px] w-[70px] items-center justify-center rounded-full bg-white text-base font-bold text-slate-700">{collectionProgress}%</div>
                    </div>
                    <div className="min-w-0 space-y-1 text-[10px]">
                      <p className="text-slate-500">Paid <strong className="block text-sm text-emerald-700">₹{maintenanceCollected.toLocaleString()}</strong></p>
                      <p className="text-slate-500">Pending <strong className="block text-sm text-rose-600">₹{totalPending.toLocaleString()}</strong></p>
                    </div>
                  </div>
                  <div className="mt-3 border-t border-slate-100 pt-3">
                    <h3 className="mb-2 text-[11px] font-semibold text-slate-700">Recent Payments</h3>
                    {recentPaidBills.length ? recentPaidBills.map((bill) => (
                      <div key={bill.id} className="flex items-center justify-between gap-2 py-1.5 text-[10px]">
                        <span className="truncate text-slate-600">Flat {bill.flatNumber} · {bill.ownerName}</span>
                        <strong className="shrink-0 text-slate-800">₹{bill.totalAmount.toLocaleString()}</strong>
                      </div>
                    )) : <p className="text-[10px] text-slate-500">No paid bills to show yet.</p>}
                  </div>
                </section>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <section className="rounded-2xl border border-orange-100 bg-gradient-to-br from-white to-orange-50/80 p-5 shadow-md">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-base font-bold text-slate-800">Help Desk Tickets</h2>
                    <button type="button" onClick={() => setActiveSidebarNav('helpdesk')} className="text-[10px] font-semibold text-sky-700">View all <ArrowUpRight className="inline h-3 w-3" /></button>
                  </div>
                  {[
                    { label: 'Open', count: societyComplaints.filter((ticket) => ticket.status === 'open').length, tone: 'bg-sky-500' },
                    { label: 'In progress', count: societyComplaints.filter((ticket) => ticket.status === 'in_progress').length, tone: 'bg-amber-500' },
                    { label: 'Resolved', count: societyComplaints.filter((ticket) => ticket.status === 'resolved').length, tone: 'bg-emerald-500' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between border-t border-slate-50 py-2 text-[11px]">
                      <span className="flex items-center gap-2 text-slate-600"><i className={`h-2.5 w-2.5 rounded-full ${item.tone}`} />{item.label}</span>
                      <strong className="text-slate-700">{item.count}</strong>
                    </div>
                  ))}
                </section>

                <section className="rounded-2xl border border-violet-100 bg-gradient-to-br from-white to-violet-50/80 p-5 shadow-md">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-base font-bold text-slate-800">Recent Notices</h2>
                    <button type="button" onClick={() => setActiveSidebarNav('notices')} className="text-[10px] font-semibold text-sky-700">View all <ArrowUpRight className="inline h-3 w-3" /></button>
                  </div>
                  {societyNotices.slice(0, 3).map((notice) => (
                    <div key={notice.id} className="flex items-center justify-between gap-3 border-t border-slate-50 py-2">
                      <div className="min-w-0">
                        <p className="truncate text-[11px] font-medium text-slate-700">{notice.title}</p>
                        <p className="text-[9px] text-slate-400">{notice.category}</p>
                      </div>
                      <span className="shrink-0 text-[9px] text-slate-400">{notice.date}</span>
                    </div>
                  ))}
                  {societyNotices.length === 0 && <p className="text-[10px] text-slate-500">No notices have been posted yet.</p>}
                </section>
              </div>
            </div>

            <aside className="space-y-5 xl:col-span-4">
              <section className="rounded-2xl border border-sky-100 bg-gradient-to-br from-white to-sky-50/80 p-5 shadow-md">
                <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-700">Shortcuts</h2>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 xl:grid-cols-3">
                  {[
                    { label: 'Notices', icon: Bell, nav: 'notices' as const },
                    { label: 'Helpdesk', icon: FileClock, nav: 'helpdesk' as const },
                    { label: 'All Dues', icon: Receipt, nav: 'accounting' as const },
                    { label: 'People', icon: Users, nav: 'community' as const },
                    { label: 'Visitor Log', icon: DoorOpen, nav: 'visitors' as const },
                  ].map((shortcut) => {
                    const Icon = shortcut.icon;
                    return (
                      <button key={shortcut.label} type="button" onClick={() => {
                        if (shortcut.nav === 'visitors') {
                          document.getElementById('admin-dashboard-visitors')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        } else {
                          setActiveSidebarNav(shortcut.nav);
                        }
                      }} className="flex flex-col items-center gap-1.5 border-r border-slate-100 px-1 py-2 text-center text-[10px] text-slate-600 transition hover:text-emerald-700">
                        <Icon className="h-5 w-5 text-slate-700" />
                        {shortcut.label}
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-white to-indigo-50/80 p-5 shadow-md">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-base font-bold text-slate-800">Society Snapshot</h2>
                  <Building2 className="h-4 w-4 text-sky-600" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Total Flats', value: societyFlats.length, icon: Building2, tone: 'bg-sky-50 text-sky-700' },
                    { label: 'Occupied', value: occupiedFlats.length, icon: Home, tone: 'bg-emerald-50 text-emerald-700' },
                    { label: 'Vacant', value: societyFlats.length - occupiedFlats.length, icon: DoorOpen, tone: 'bg-amber-50 text-amber-700' },
                    { label: 'Residents', value: societyResidents.length, icon: Users, tone: 'bg-violet-50 text-violet-700' },
                    { label: 'Guards', value: societyGuards.length, icon: Shield, tone: 'bg-sky-50 text-sky-700' },
                    { label: 'Society Staff', value: societyStaff.length, icon: UserRound, tone: 'bg-orange-50 text-orange-700' },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.label} className="flex min-h-[62px] items-center gap-2 rounded-xl border border-white bg-white/80 p-3 shadow-sm">
                        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${item.tone}`}><Icon className="h-5 w-5" /></span>
                        <div><p className="text-[10px] font-medium text-slate-500">{item.label}</p><p className="text-base font-bold text-slate-800">{item.value}</p></div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-white to-emerald-50/80 p-5 shadow-md">
                <h2 className="mb-3 text-base font-bold text-slate-800">Financial Summary</h2>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between gap-2"><span className="text-slate-500">Revenue collected</span><strong className="text-emerald-700">₹{totalCollected.toLocaleString()}</strong></div>
                  <div className="flex justify-between gap-2"><span className="text-slate-500">Operational expenses</span><strong className="text-rose-600">₹{totalSpent.toLocaleString()}</strong></div>
                  <div className="flex justify-between gap-2 border-t border-slate-100 pt-2"><span className="text-slate-700">Net surplus</span><strong className="text-slate-900">₹{netSurplus.toLocaleString()}</strong></div>
                </div>
              </section>
            </aside>
          </div>
        )}

        {adminTab === 'assets' && (
          <AssetsInventorySection key={currentSocietyName} societyName={currentSocietyName} />
        )}

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
                  onClick={() => openAmenityForm()}
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
                    {societyAmenities.map((amenity, index) => (
                      <tr key={amenity.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4 font-mono">{index + 1}</td>
                        <td className="py-3 px-4 font-medium">{amenity.name}</td>
                        <td className="py-3 px-4">{amenity.hourlyRate ? `Paid (₹${amenity.hourlyRate}/slot)` : 'Free'}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${amenity.isActive === false ? 'text-slate-600 bg-slate-100' : 'text-emerald-700 bg-emerald-50'}`}>
                            {amenity.isActive === false ? 'Inactive' : 'Active'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <button type="button" onClick={() => setViewingAmenity(amenity)} className="text-sky-600 hover:text-sky-800 font-medium">View</button>
                          <span className="text-slate-300"> | </span>
                          <button type="button" onClick={() => openAmenityForm(amenity)} className="text-sky-600 hover:text-sky-800 font-medium">Edit</button>
                          <span className="text-slate-300"> | </span>
                          <button type="button" onClick={() => deleteAmenity(amenity.id)} className="text-sky-600 hover:text-rose-600 font-medium">Delete</button>
                        </td>
                      </tr>
                    ))}
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
                            type="button"
                            onClick={() => {
                              setEditingAmenityGroupId(group.id);
                              setNewGroupTitle(group.title);
                              setNewGroupDesc(group.description);
                              setNewGroupType(group.type);
                              setShowAddAmenityGroup(true);
                            }}
                            className="text-sky-600 hover:text-sky-800 font-semibold cursor-pointer mr-1"
                          >
                            Edit
                          </button>
                          <span className="text-slate-300">|</span>
                          <button
                            type="button"
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
                  onClick={() => {
                    setEditingCancellationId(null);
                    setNewCancelTitle('');
                    setNewCancelFee('10%');
                    setShowAddCancellation(true);
                  }}
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
                              type="button"
                              onClick={() => {
                                setEditingCancellationId(c.id);
                                setNewCancelTitle(c.title);
                                setNewCancelFee(c.fee);
                                setShowAddCancellation(true);
                              }}
                              className="text-sky-600 hover:underline font-semibold cursor-pointer mr-2"
                            >
                              Edit
                            </button>
                            <span className="text-slate-300">|</span>
                            <button
                              type="button"
                              onClick={() => setCancellationCharges((prev) => prev.filter((i) => i.id !== c.id))}
                              className="text-rose-600 hover:underline font-semibold cursor-pointer ml-2"
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
                  onClick={() => {
                    setEditingRecipientId(null);
                    setNewRecipName('');
                    setNewRecipEmail('');
                    setNewRecipRole('Committee Member');
                    setShowAddRecipient(true);
                  }}
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
                            type="button"
                            onClick={() => {
                              setEditingRecipientId(recip.id);
                              setNewRecipName(recip.name);
                              setNewRecipEmail(recip.email);
                              setNewRecipRole(recip.role);
                              setShowAddRecipient(true);
                            }}
                            className="text-sky-600 hover:text-sky-800 font-semibold cursor-pointer mr-1"
                          >
                            Edit
                          </button>
                          <span className="text-slate-300">|</span>
                          <button
                            type="button"
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
            {adminTab === 'accounting' && (
              <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
              <div className="flex flex-col gap-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-2.5 text-emerald-700">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Society collection bank account</h3>
                    <p className="mt-1 text-xs text-slate-500">Each society has its own receiving account and UPI details.</p>
                  </div>
                </div>
                <label className="w-full text-xs font-semibold text-slate-600 sm:max-w-xs">
                  Selected society
                  <span className="mt-1.5 block rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-bold text-slate-900">
                  {currentSocietyName}
                  </span>
                </label>
              </div>

              {selectedBankSociety ? (
                isEditingBankDetails ? (
                <form className="space-y-5 p-5 sm:p-6" onSubmit={handleSaveBankDetails}>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <label className="text-xs font-semibold text-slate-700">
                      Account holder name <span className="text-rose-600">*</span>
                      <input autoComplete="off" className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" onChange={(event) => setBankDetails((previous) => ({ ...previous, accountHolderName: event.target.value }))} required value={bankDetails.accountHolderName} />
                    </label>
                    <label className="text-xs font-semibold text-slate-700">
                      Account number <span className="text-rose-600">*</span>
                      <input autoComplete="off" inputMode="numeric" className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" onChange={(event) => setBankDetails((previous) => ({ ...previous, accountNumber: event.target.value.replace(/\D/g, '').slice(0, 18) }))} pattern="[0-9]{6,18}" required value={bankDetails.accountNumber} />
                    </label>
                    <label className="text-xs font-semibold text-slate-700">
                      Bank name <span className="text-rose-600">*</span>
                      <input autoComplete="off" className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" onChange={(event) => setBankDetails((previous) => ({ ...previous, bankName: event.target.value }))} required value={bankDetails.bankName} />
                    </label>
                    <label className="text-xs font-semibold text-slate-700">
                      IFSC code <span className="text-rose-600">*</span>
                      <input autoComplete="off" className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm uppercase outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" maxLength={11} onChange={(event) => setBankDetails((previous) => ({ ...previous, ifscCode: event.target.value.toUpperCase() }))} pattern="[A-Z]{4}0[A-Z0-9]{6}" placeholder="e.g. ABCD0123456" required value={bankDetails.ifscCode} />
                    </label>
                    <label className="text-xs font-semibold text-slate-700">
                      Branch name <span className="text-rose-600">*</span>
                      <input autoComplete="off" className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" onChange={(event) => setBankDetails((previous) => ({ ...previous, branchName: event.target.value }))} required value={bankDetails.branchName} />
                    </label>
                    <label className="text-xs font-semibold text-slate-700">
                      Account type <span className="text-rose-600">*</span>
                      <select className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" onChange={(event) => setBankDetails((previous) => ({ ...previous, accountType: event.target.value === 'Current' ? 'Current' : 'Savings' }))} value={bankDetails.accountType}>
                        <option value="Savings">Savings</option>
                        <option value="Current">Current</option>
                      </select>
                    </label>
                    <label className="text-xs font-semibold text-slate-700 sm:col-span-2 lg:col-span-3">
                      Bank branch address <span className="text-rose-600">*</span>
                      <textarea autoComplete="off" className="mt-1.5 min-h-20 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" onChange={(event) => setBankDetails((previous) => ({ ...previous, bankAddress: event.target.value }))} required rows={2} value={bankDetails.bankAddress} />
                    </label>
                    <label className="text-xs font-semibold text-slate-700 sm:col-span-2 lg:col-span-3">
                      Society UPI ID <span className="font-normal text-slate-400">(optional; used for the bill QR code)</span>
                      <input autoComplete="off" className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" onChange={(event) => setBankDetails((previous) => ({ ...previous, upiId: event.target.value.trim() }))} placeholder="society@bank" value={bankDetails.upiId || ''} />
                    </label>
                  </div>
                  <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="max-w-2xl text-xs leading-relaxed text-amber-800">
                      Bank details are stored in this browser’s local storage in this prototype. Use a secured server-side system before storing real account information.
                    </p>
                    <div className="flex items-center gap-3">
                      {bankDetailsNotice && (
                        <p role={bankDetailsNotice.type === 'error' ? 'alert' : 'status'} className={`text-xs font-semibold ${bankDetailsNotice.type === 'success' ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {bankDetailsNotice.message}
                        </p>
                      )}
                      <button className="shrink-0 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800" type="submit">
                        Save bank details
                      </button>
                      {selectedBankSociety.bankDetails && (
                        <button className="shrink-0 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50" onClick={handleCancelBankDetailsEdit} type="button">
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </form>
                ) : (
                  <div className="space-y-5 p-5 sm:p-6">
                    <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <div>
                        <dt className="text-xs font-semibold text-slate-500">Account holder name</dt>
                        <dd className="mt-1 text-sm font-medium text-slate-900">{bankDetails.accountHolderName}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-semibold text-slate-500">Account number</dt>
                        <dd className="mt-1 text-sm font-medium text-slate-900">{bankDetails.accountNumber}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-semibold text-slate-500">Bank name</dt>
                        <dd className="mt-1 text-sm font-medium text-slate-900">{bankDetails.bankName}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-semibold text-slate-500">IFSC code</dt>
                        <dd className="mt-1 text-sm font-medium text-slate-900">{bankDetails.ifscCode}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-semibold text-slate-500">Branch name</dt>
                        <dd className="mt-1 text-sm font-medium text-slate-900">{bankDetails.branchName}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-semibold text-slate-500">Account type</dt>
                        <dd className="mt-1 text-sm font-medium text-slate-900">{bankDetails.accountType}</dd>
                      </div>
                      <div className="sm:col-span-2 lg:col-span-3">
                        <dt className="text-xs font-semibold text-slate-500">Bank branch address</dt>
                        <dd className="mt-1 whitespace-pre-wrap text-sm font-medium text-slate-900">{bankDetails.bankAddress}</dd>
                      </div>
                      <div className="sm:col-span-2 lg:col-span-3">
                        <dt className="text-xs font-semibold text-slate-500">Society UPI ID</dt>
                        <dd className="mt-1 text-sm font-medium text-slate-900">{bankDetails.upiId || 'Not provided'}</dd>
                      </div>
                    </dl>
                    <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="max-w-2xl text-xs leading-relaxed text-amber-800">
                          Bank details are stored in this browser’s local storage in this prototype. Use a secured server-side system before storing real account information.
                        </p>
                        {bankDetailsNotice && (
                          <p role="status" className="mt-2 text-xs font-semibold text-emerald-700">
                            {bankDetailsNotice.message}
                          </p>
                        )}
                      </div>
                      <button className="shrink-0 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800" onClick={() => { setBankDetailsNotice(null); setIsEditingBankDetails(true); }} type="button">
                        Edit bank details
                      </button>
                    </div>
                  </div>
                )
              ) : (
                <p className="p-6 text-sm text-slate-500">No societies are available to configure.</p>
              )}
              </section>
            )}

            {/* Top Financial Summary KPI Cards */}
            {adminTab === 'accounting' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200/90 p-5 rounded-xl shadow-xs space-y-1">
                  <span className="text-slate-500 text-xs font-semibold block">Total Revenue Collected</span>
                  <p className="text-2xl font-black text-emerald-600">₹{totalCollected.toLocaleString()}</p>
                  <p className="text-[11px] text-slate-400">Maintenance and amenity collections</p>
                </div>
                <div className="bg-white border border-slate-200/90 p-5 rounded-xl shadow-xs space-y-1">
                  <span className="text-slate-500 text-xs font-semibold block">Outstanding Dues</span>
                  <p className="text-2xl font-black text-amber-600">₹{totalPending.toLocaleString()}</p>
                  <p className="text-[11px] text-slate-400">{currentSocietyName} pending bills</p>
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
            )}

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
                    {societyBills.map((bill, index) => (
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
                            type="button"
                            onClick={() => setSelectedBill(bill)}
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
                    {societyExpenses.map((exp, index) => (
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
                          <button
                            type="button"
                            onClick={() => downloadExpenseVoucher(exp)}
                            className="text-sky-600 hover:text-sky-800 font-semibold cursor-pointer"
                          >
                            View Voucher
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

        {/* ================= FLATS DIRECTORY TAB (NEAT WHITE GRIDS) ================= */}
        {adminTab === 'flats' && (
          <ApartmentCensusSection key={currentSocietyName} />
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
                    {societyComplaints.map((ticket, index) => (
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
                    {societyNotices.map((notice, index) => (
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
            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
              <h3 className="text-xl font-bold text-slate-900">Event Security Assignments</h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                Assign the event guard team and publish entry and parking protocols. Guards and residents can view the plan once it is published.
              </p>
              <div className="mt-4 divide-y divide-slate-100">
                {eventSecurityItems.map((eventItem) => {
                  const plan = guardEventSecurityPlans.find((item) => item.eventId === eventItem.eventId);
                  const isReady = plan?.status === 'ready' && (plan.assignedGuardIds?.length || 0) > 0 &&
                    Boolean(plan.entryGate && plan.parkingArea);
                  return (
                    <div key={eventItem.eventId} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-bold text-slate-900">{eventItem.title}</p>
                        <p className="mt-1 text-xs text-slate-500">{eventItem.date} · {eventItem.detail}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {isReady
                            ? `Confirmed by admin · ${plan?.assignedGuardNames?.join(', ')} · ${plan?.entryGate} · ${plan?.parkingArea}`
                            : 'Awaiting admin confirmation — guards and residents cannot use a final event plan yet'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => openEventPlanEditor(eventItem.eventId)}
                        className="w-fit rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800"
                      >
                        {isReady ? 'Edit Final Event Plan' : 'Assign & Confirm Event Plan'}
                      </button>
                    </div>
                  );
                })}
                {eventSecurityItems.length === 0 && (
                  <p className="py-5 text-sm text-slate-500">Publish an Event notice or submit an amenity booking to configure event security.</p>
                )}
              </div>
            </section>
          </div>
        )}
        {adminTab === 'staff' && (
          <>
            <SocietyStaffManagementSection />
            <GuardManagementSection />
          </>
        )}
      </div>

      {rejectingBookingId && (() => {
        const booking = pendingAmenityBookings.find((item) => item.id === rejectingBookingId);
        if (!booking) return null;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
            <section role="dialog" aria-modal="true" aria-labelledby="reject-booking-title" className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl">
              <header className="flex items-center justify-between bg-slate-900 p-5 text-white">
                <div>
                  <h3 id="reject-booking-title" className="font-bold">Decline Amenity Booking</h3>
                  <p className="mt-1 text-xs text-slate-300">
                    {booking.amenityName} · {booking.date} · {booking.residentName} · Flat {booking.flatNumber} · {booking.guestsCount} guest{booking.guestsCount === 1 ? '' : 's'}
                  </p>
                </div>
                <button type="button" aria-label="Close rejection form" onClick={() => setRejectingBookingId(null)} className="text-slate-300 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </header>
              <form onSubmit={handleRejectAmenityBooking} className="grid grid-cols-1 gap-5 p-5 md:grid-cols-2">
                <div>
                  <label htmlFor="amenity-rejection-category" className="mb-1 block text-xs font-bold text-slate-700">Reason for declining *</label>
                  <select
                    id="amenity-rejection-category"
                    required
                    value={rejectionReasonCategory}
                    onChange={(event) => setRejectionReasonCategory(event.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm"
                  >
                    <option value="">Select a reason</option>
                    <option value="Scheduled maintenance">Facility is unavailable due to scheduled maintenance</option>
                    <option value="Guest capacity">Requested guest count exceeds the facility limit</option>
                    <option value="Facility or time suitability">The event is not suitable for this facility or time slot</option>
                    <option value="Safety or security">Safety or security requirements cannot be met</option>
                    <option value="Other">Other</option>
                  </select>
                  <p className="mt-2 text-xs leading-relaxed text-slate-500">
                    Choose the main reason so the resident can understand the decision.
                  </p>
                </div>
                <div>
                  <label htmlFor="amenity-rejection-explanation" className="mb-1 block text-xs font-bold text-slate-700">Explanation for the resident *</label>
                  <textarea
                    id="amenity-rejection-explanation"
                    required
                    minLength={10}
                    maxLength={500}
                    rows={5}
                    value={rejectionReason}
                    onChange={(event) => setRejectionReason(event.target.value)}
                    placeholder="Explain why this request cannot be approved. Include any relevant dates, capacity limits, or alternatives where possible."
                    className="w-full resize-y rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm"
                  />
                  <p className="mt-1 text-right text-[11px] text-slate-500">{rejectionReason.length}/500</p>
                </div>
                {rejectionFeedback && (
                  <p role="alert" className="text-xs font-semibold text-rose-700 md:col-span-2">{rejectionFeedback}</p>
                )}
                <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 md:col-span-2">
                  <button type="button" onClick={() => setRejectingBookingId(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600">
                    Cancel
                  </button>
                  <button type="submit" className="rounded-lg bg-rose-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-rose-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2">
                    Decline Booking & Save Reason
                  </button>
                </div>
              </form>
            </section>
          </div>
        );
      })()}

      {editingSecurityEventId && (() => {
        const eventItem = eventSecurityItems.find((item) => item.eventId === editingSecurityEventId);
        if (!eventItem) return null;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
            <section role="dialog" aria-modal="true" aria-labelledby="event-plan-title" className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl">
              <header className="flex items-center justify-between bg-slate-900 p-4 text-white">
                <div>
                  <h3 id="event-plan-title" className="font-bold">
                    {editingSecurityEventId.startsWith('booking:') &&
                    societyBookings.some((booking) => `booking:${booking.id}` === editingSecurityEventId && booking.status === 'pending')
                      ? 'Approve Booking & Assign Event Security'
                      : 'Event Security Plan'}
                  </h3>
                  <p className="mt-1 text-xs text-slate-300">{eventItem.title} · {eventItem.date} · {eventItem.detail}</p>
                </div>
                <button type="button" aria-label="Close event security plan" onClick={() => setEditingSecurityEventId(null)} className="text-slate-300 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </header>
              <form onSubmit={handleSaveEventPlan} className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <p className="mb-2 block text-xs font-bold text-slate-700">Select active guards assigned to this event *</p>
                  {activeGuards.length > 0 ? (
                    <div className="grid gap-2 sm:grid-cols-2">
                      {activeGuards.map((guard) => (
                        <label key={guard.id} className="flex items-center gap-2 rounded-lg border border-slate-200 p-3 text-sm">
                          <input
                            type="checkbox"
                            checked={eventAssignedGuardIds.includes(guard.id)}
                            onChange={(change) => setEventAssignedGuardIds((previous) => change.target.checked
                              ? [...previous, guard.id]
                              : previous.filter((id) => id !== guard.id))}
                          />
                          <span><span className="block font-semibold">{guard.name}</span><span className="text-xs text-slate-500">{guard.badgeId || guard.assignedGate || 'Guard'}</span></span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-900">No active guard profiles are available. Add/activate guards before confirming this event.</p>
                  )}
                </div>
                <div>
                  <label htmlFor="event-entry-gate" className="mb-1 block text-xs font-bold text-slate-700">Approved entrance *</label>
                  <select id="event-entry-gate" required value={eventEntryGate} onChange={(event) => setEventEntryGate(event.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-sm">
                    <option value="">Select entrance</option>
                    {['Main Gate 1', 'Service Gate 2', 'Tower B Gate'].map((gate) => <option key={gate} value={gate}>{gate}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="event-parking-area" className="mb-1 block text-xs font-bold text-slate-700">Approved parking area *</label>
                  <select id="event-parking-area" required value={eventParkingArea} onChange={(event) => setEventParkingArea(event.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-sm">
                    <option value="">Select parking area</option>
                    {['Visitor Parking Bays', 'Basement Visitor Parking', 'Clubhouse Drop-off Zone', 'Tower A Visitor Bays', 'Tower B Visitor Bays', 'Custom / See parking protocol'].map((area) => <option key={area} value={area}>{area}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="event-entry-protocol" className="mb-1 block text-xs font-bold text-slate-700">Guest entry protocol *</label>
                  <textarea id="event-entry-protocol" rows={3} required maxLength={800} value={eventGuestProtocol} onChange={(event) => setEventGuestProtocol(event.target.value)} placeholder="How guards verify event guests and where they direct them." className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-sm" />
                </div>
                <div>
                  <label htmlFor="event-parking-plan" className="mb-1 block text-xs font-bold text-slate-700">Parking protocol *</label>
                  <textarea id="event-parking-plan" rows={3} required maxLength={800} value={eventParkingPlan} onChange={(event) => setEventParkingPlan(event.target.value)} placeholder="Visitor parking location, traffic flow, and areas to keep clear." className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-sm" />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="event-guard-notes" className="mb-1 block text-xs font-bold text-slate-700">Additional guard instructions</label>
                  <textarea id="event-guard-notes" rows={2} maxLength={500} value={eventGuardNotes} onChange={(event) => setEventGuardNotes(event.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-sm" />
                </div>
                {eventPlanFeedback && <p role="alert" className="text-xs font-semibold text-rose-700 md:col-span-2">{eventPlanFeedback}</p>}
                <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 md:col-span-2">
                  <button type="button" onClick={() => setEditingSecurityEventId(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600">Cancel</button>
                  <button type="submit" disabled={!activeGuards.length} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">
                    {editingSecurityEventId.startsWith('booking:') &&
                    societyBookings.some((booking) => `booking:${booking.id}` === editingSecurityEventId && booking.status === 'pending')
                      ? 'Approve & Confirm Booking'
                      : 'Admin Final Confirmation'}
                  </button>
                </div>
              </form>
            </section>
          </div>
        );
      })()}

      {showAmenityForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-3 backdrop-blur-sm sm:p-5">
          <section role="dialog" aria-modal="true" aria-labelledby="amenity-form-title" className="max-h-[94vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <header className="sticky top-0 z-10 flex items-center justify-between bg-[#102b49] px-5 py-3.5 text-white sm:px-7">
              <div className="flex items-center gap-3">
                <span className="rounded-lg bg-emerald-500/15 p-2 text-emerald-400"><Building2 className="h-5 w-5" /></span>
                <div>
                  <h3 id="amenity-form-title" className="text-base font-bold">{editingAmenityId ? 'Edit Amenity' : 'Add New Amenity'}</h3>
                  <p className="mt-0.5 text-[11px] text-slate-300">{editingAmenityId ? 'Update amenity details and booking availability' : 'Create a new amenity for your gated community'}</p>
                </div>
              </div>
              <button type="button" aria-label="Close amenity form" onClick={() => setShowAmenityForm(false)} className="rounded-lg p-1 text-slate-300 transition hover:bg-white/10 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </header>
            <form onSubmit={handleSaveAmenity} className="space-y-4 px-5 py-5 text-xs sm:px-7">
              <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="amenity-name" className="mb-1.5 flex items-center gap-2 font-bold text-slate-700"><Tag className="h-3.5 w-3.5" /> Amenity Name *</label>
                  <input id="amenity-name" value={amenityName} onChange={(event) => setAmenityName(event.target.value)} required maxLength={100} placeholder="e.g. Swimming Pool, Gym, Club House" className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
                </div>
                <div>
                  <label htmlFor="amenity-category" className="mb-1.5 flex items-center gap-2 font-bold text-slate-700"><LayoutGrid className="h-3.5 w-3.5" /> Category *</label>
                  <select id="amenity-category" value={amenityCategory} onChange={(event) => setAmenityCategory(event.target.value)} required className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100">
                    {['Recreation', 'Fitness', 'Sports', 'Utilities', 'Community'].map((category) => <option key={category} value={category}>{category}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="amenity-location" className="mb-1.5 flex items-center gap-2 font-bold text-slate-700"><MapPin className="h-3.5 w-3.5" /> Location *</label>
                  <input id="amenity-location" value={amenityLocation} onChange={(event) => setAmenityLocation(event.target.value)} required maxLength={120} placeholder="e.g. Club House, Block A, 1st Floor" className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
                </div>
                <div>
                  <label htmlFor="amenity-rate" className="mb-1.5 flex items-center gap-2 font-bold text-slate-700"><IndianRupee className="h-3.5 w-3.5" /> Hourly Rate (₹)</label>
                  <input id="amenity-rate" type="number" min="0" step="0.01" value={amenityRate} onChange={(event) => setAmenityRate(Number(event.target.value))} required className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
                </div>
                <div>
                  <label htmlFor="amenity-capacity" className="mb-1.5 flex items-center gap-2 font-bold text-slate-700"><UsersRound className="h-3.5 w-3.5" /> Maximum Capacity *</label>
                  <input id="amenity-capacity" type="number" min="1" step="1" value={amenityCapacity} onChange={(event) => setAmenityCapacity(Number(event.target.value))} required className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
                </div>

                <fieldset className="sm:col-span-2">
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <legend className="flex items-center gap-2 font-bold text-slate-700"><Timer className="h-3.5 w-3.5" /> Available Time Slots *</legend>
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <label htmlFor="amenity-custom-start" className="sr-only">Custom slot start time</label>
                      <input id="amenity-custom-start" type="time" value={customSlotStart} onChange={(event) => setCustomSlotStart(event.target.value)} className="rounded-md border border-slate-200 px-1.5 py-1" />
                      <span className="text-slate-400">to</span>
                      <label htmlFor="amenity-custom-end" className="sr-only">Custom slot end time</label>
                      <input id="amenity-custom-end" type="time" value={customSlotEnd} onChange={(event) => setCustomSlotEnd(event.target.value)} className="rounded-md border border-slate-200 px-1.5 py-1" />
                      <button
                        type="button"
                        disabled={customSlotEnd <= customSlotStart}
                        onClick={() => {
                          const slot = `${customSlotStart} - ${customSlotEnd}`;
                          if (!amenitySlots.includes(slot)) setAmenitySlots((slots) => [...slots, slot].sort());
                        }}
                        className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 px-2.5 py-1.5 font-bold text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Plus className="h-3 w-3" /> Add custom slot
                      </button>
                    </div>
                  </div>
                  <p className="mb-2 text-[10px] text-slate-500">Select all available booking times</p>
                  <div className="grid grid-cols-2 gap-2 rounded-xl border border-sky-100 bg-sky-50/60 p-3 sm:grid-cols-4">
                    {Array.from({ length: 16 }, (_, index) => {
                      const startHour = index + 6;
                      const endHour = startHour + 1;
                      const formatHour = (hour: number) => `${String(hour % 24).padStart(2, '0')}:00`;
                      const slot = `${formatHour(startHour)} - ${formatHour(endHour)}`;
                      const isSelected = amenitySlots.includes(slot);
                      return (
                        <button
                          key={slot}
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() => setAmenitySlots((slots) => isSelected ? slots.filter((item) => item !== slot) : [...slots, slot].sort())}
                          className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left text-[11px] font-semibold transition ${
                            isSelected ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-300'
                          }`}
                        >
                          {slot}
                          {isSelected && <CheckCircle2 className="h-3.5 w-3.5" />}
                        </button>
                      );
                    })}
                    {amenitySlots.filter((slot) => !Array.from({ length: 16 }, (_, index) => `${String(index + 6).padStart(2, '0')}:00 - ${String(index + 7).padStart(2, '0')}:00`).includes(slot)).map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        aria-pressed="true"
                        onClick={() => setAmenitySlots((slots) => slots.filter((item) => item !== slot))}
                        className="flex items-center justify-between rounded-lg border border-emerald-500 bg-emerald-50 px-3 py-2 text-left text-[11px] font-semibold text-emerald-800"
                      >
                        {slot}<CheckCircle2 className="h-3.5 w-3.5" />
                      </button>
                    ))}
                  </div>
                  {amenitySlots.length === 0 && <p className="mt-1.5 text-[11px] font-semibold text-rose-600">Select at least one available time slot.</p>}
                </fieldset>

                <div className="sm:col-span-2">
                  <label htmlFor="amenity-image" className="mb-1.5 flex items-center gap-2 font-bold text-slate-700"><Image className="h-3.5 w-3.5" /> Image URL</label>
                  <input id="amenity-image" type="url" value={amenityImage} onChange={(event) => setAmenityImage(event.target.value)} placeholder="https://example.com/amenity-image.jpg" className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="amenity-description" className="mb-1.5 flex items-center gap-2 font-bold text-slate-700"><FileText className="h-3.5 w-3.5" /> Description *</label>
                  <textarea id="amenity-description" rows={3} maxLength={500} value={amenityDescription} onChange={(event) => setAmenityDescription(event.target.value)} required placeholder="Enter a brief description of the amenity, features, rules, etc..." className="w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
                  <p className="mt-1 text-right text-[10px] text-slate-400">{amenityDescription.length}/500</p>
                </div>
              </div>
              <label className="flex items-center gap-2 font-semibold text-slate-700">
                <input type="checkbox" checked={amenityActive} onChange={(event) => setAmenityActive(event.target.checked)} className="h-4 w-4 accent-emerald-600" />
                Available for resident bookings
              </label>
              <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
                <button type="button" onClick={() => setShowAmenityForm(false)} className="rounded-lg border border-slate-200 px-4 py-2 font-bold text-slate-600 transition hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={amenitySlots.length === 0} className="rounded-lg bg-emerald-700 px-4 py-2 font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50">
                  <span className="inline-flex items-center gap-1.5"><Plus className="h-3.5 w-3.5" />{editingAmenityId ? 'Save Changes' : 'Create Amenity'}</span>
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {viewingAmenity && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <section role="dialog" aria-modal="true" aria-labelledby="amenity-details-title" className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <header className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 id="amenity-details-title" className="text-sm font-bold">Amenity Details</h3>
              <button type="button" aria-label="Close amenity details" onClick={() => setViewingAmenity(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </header>
            <div className="p-5 space-y-4 text-sm">
              {viewingAmenity.image && <img src={viewingAmenity.image} alt={viewingAmenity.name} className="h-44 w-full rounded-lg object-cover" />}
              <h4 className="text-lg font-bold">{viewingAmenity.name}</h4>
              <p className="text-slate-600">{viewingAmenity.description}</p>
              <dl className="grid grid-cols-2 gap-3 text-xs">
                <div><dt className="text-slate-500">Category</dt><dd className="mt-1 font-semibold">{viewingAmenity.category}</dd></div>
                <div><dt className="text-slate-500">Location</dt><dd className="mt-1 font-semibold">{viewingAmenity.location}</dd></div>
                <div><dt className="text-slate-500">Rate</dt><dd className="mt-1 font-semibold">{viewingAmenity.hourlyRate ? `₹${viewingAmenity.hourlyRate} per hour` : 'Free'}</dd></div>
                <div><dt className="text-slate-500">Maximum Capacity</dt><dd className="mt-1 font-semibold">{viewingAmenity.maxCapacity}</dd></div>
                <div className="col-span-2"><dt className="text-slate-500">Available Slots</dt><dd className="mt-1 font-semibold">{viewingAmenity.availableSlots.join(', ')}</dd></div>
                <div><dt className="text-slate-500">Booking Status</dt><dd className="mt-1 font-semibold">{viewingAmenity.isActive === false ? 'Inactive' : 'Active'}</dd></div>
              </dl>
              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                <button type="button" onClick={() => setViewingAmenity(null)} className="px-4 py-2 border border-slate-200 rounded-lg font-bold text-slate-600">Close</button>
                <button type="button" onClick={() => {
                  openAmenityForm(viewingAmenity);
                  setViewingAmenity(null);
                }} className="px-4 py-2 bg-slate-900 text-white rounded-lg font-bold">Edit Amenity</button>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ================= MODAL: ADD AMENITY GROUP ================= */}
      {showAddAmenityGroup && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">{editingAmenityGroupId === null ? 'Add New Amenity Group' : 'Edit Amenity Group'}</h3>
              <button type="button" onClick={() => {
                setShowAddAmenityGroup(false);
                setEditingAmenityGroupId(null);
              }} className="text-slate-400 hover:text-white">
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
                  onClick={() => {
                    setShowAddAmenityGroup(false);
                    setEditingAmenityGroupId(null);
                  }}
                  className="px-4 py-2 border border-slate-200 rounded-lg font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold"
                >
                  {editingAmenityGroupId === null ? 'Save Amenity Group' : 'Update Amenity Group'}
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
              <h3 className="text-sm font-bold">{editingCancellationId === null ? 'Add Amenity Cancellation Rule' : 'Edit Amenity Cancellation Rule'}</h3>
              <button type="button" onClick={() => {
                setShowAddCancellation(false);
                setEditingCancellationId(null);
              }} className="text-slate-400 hover:text-white">
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
                  onClick={() => {
                    setShowAddCancellation(false);
                    setEditingCancellationId(null);
                  }}
                  className="px-4 py-2 border border-slate-200 rounded-lg font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold"
                >
                  {editingCancellationId === null ? 'Create Rule' : 'Update Rule'}
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
              <h3 className="text-sm font-bold">{editingRecipientId === null ? 'Add Amenity Email Recipient' : 'Edit Amenity Email Recipient'}</h3>
              <button type="button" onClick={() => {
                setShowAddRecipient(false);
                setEditingRecipientId(null);
              }} className="text-slate-400 hover:text-white">
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
                  onClick={() => {
                    setShowAddRecipient(false);
                    setEditingRecipientId(null);
                  }}
                  className="px-4 py-2 border border-slate-200 rounded-lg font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold"
                >
                  {editingRecipientId === null ? 'Save Recipient' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Existing Modals: Bill Creation */}
      {showCreateBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-3 backdrop-blur-sm sm:p-5 animate-fade-in">
          <section role="dialog" aria-modal="true" aria-labelledby="issue-invoice-title" className="max-h-[94vh] w-full max-w-5xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <header className="sticky top-0 z-10 flex items-center justify-between bg-[#102b49] px-5 py-4 text-white sm:px-7">
              <div className="flex items-center gap-3">
                <span className="rounded-xl bg-emerald-500/15 p-2.5 text-emerald-300"><Receipt className="h-7 w-7" /></span>
                <div>
                  <h3 id="issue-invoice-title" className="text-base font-extrabold">Issue Maintenance Invoice</h3>
                  <p className="mt-1 text-[11px] text-slate-300">Create a maintenance invoice for the selected flat unit</p>
                </div>
              </div>
              <button type="button" aria-label="Close invoice form" onClick={() => setShowCreateBill(false)} className="rounded-lg p-1.5 text-slate-300 transition hover:bg-white/10 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </header>
            <form onSubmit={handleCreateBillSubmit} className="space-y-3.5 p-4 sm:p-5">
              <section className="rounded-xl border border-sky-100 bg-gradient-to-br from-sky-50/80 to-white p-4 sm:p-5">
                <div className="mb-4 flex items-center gap-3">
                  <House className="h-6 w-6 text-slate-700" />
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900">Property Details</h4>
                    <p className="mt-0.5 text-[11px] text-slate-500">Select the flat unit and enter billing information</p>
                  </div>
                </div>
                <div className="grid gap-x-5 gap-y-4 md:grid-cols-3">
                  <div>
                    <label htmlFor="bill-flat" className="mb-1.5 block font-bold text-slate-700">Flat Unit <span className="text-rose-600">*</span></label>
                    <select id="bill-flat" value={billFlat} onChange={(event) => setBillFlat(event.target.value)} required disabled={societyFlats.length === 0} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100">
                      {societyFlats.length === 0 && <option value="">No flats in this society</option>}
                      {societyFlats.map((flat) => <option key={flat.flatNumber} value={flat.flatNumber}>{flat.flatNumber} ({flat.ownerName})</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="bill-month" className="mb-1.5 block font-bold text-slate-700">Billing Month <span className="text-rose-600">*</span></label>
                    <input id="bill-month" type="month" value={(() => {
                      const parsedMonth = new Date(`${billMonth} 1`);
                      return Number.isNaN(parsedMonth.getTime()) ? '' : `${parsedMonth.getFullYear()}-${String(parsedMonth.getMonth() + 1).padStart(2, '0')}`;
                    })()} onChange={(event) => {
                      if (!event.target.value) return;
                      const [year, month] = event.target.value.split('-').map(Number);
                      setBillMonth(new Date(year, month - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }));
                    }} required className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100" />
                  </div>
                  <div>
                    <label htmlFor="bill-invoice-date" className="mb-1.5 block font-bold text-slate-700">Invoice Date <span className="text-rose-600">*</span></label>
                    <input id="bill-invoice-date" type="date" value={billInvoiceDate} onChange={(event) => setBillInvoiceDate(event.target.value)} required className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100" />
                  </div>
                  <div>
                    <label htmlFor="bill-type" className="mb-1.5 block font-bold text-slate-700">Invoice Type <span className="text-rose-600">*</span></label>
                    <select id="bill-type" value={billType} onChange={(event) => setBillType(event.target.value)} required className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100">
                      <option value="Maintenance">Maintenance</option>
                      <option value="Special Assessment">Special Assessment</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="bill-status" className="mb-1.5 block font-bold text-slate-700">Status <span className="text-rose-600">*</span></label>
                    <select id="bill-status" value={billStatus} onChange={(event) => setBillStatus(event.target.value as 'pending' | 'overdue')} className="w-full rounded-lg border border-emerald-200 bg-white px-3 py-2.5 text-xs outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100">
                      <option value="pending">Pending</option>
                      <option value="overdue">Overdue</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="bill-due-date" className="mb-1.5 block font-bold text-slate-700">Payment Due Date</label>
                    <input id="bill-due-date" type="date" value={billDueDate} onChange={(event) => setBillDueDate(event.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100" />
                  </div>
                </div>
              </section>

              <section className="rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50/70 to-white p-4 sm:p-5">
                <div className="mb-4 flex items-center gap-3">
                  <CircleDollarSign className="h-6 w-6 text-emerald-700" />
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900">Charges &amp; Amounts</h4>
                    <p className="mt-0.5 text-[11px] text-slate-500">Enter the maintenance and other applicable charges</p>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {[
                    { id: 'base-maintenance', label: 'Base Maintenance (₹)', value: baseMaint, setter: setBaseMaint, required: true, Icon: CircleDollarSign },
                    { id: 'water-charges', label: 'Water Charges (₹)', value: waterChg, setter: setWaterChg, required: true, Icon: Droplet },
                    { id: 'parking-charges', label: 'Parking Charges (₹)', value: parkingChg, setter: setParkingChg, required: false, Icon: CarFront },
                    { id: 'other-charges', label: 'Other Charges (₹)', value: clubChg, setter: setClubChg, required: false, Icon: CirclePlus },
                  ].map(({ id, label, value, setter, required, Icon }) => (
                    <div key={id}>
                      <label htmlFor={id} className="mb-1.5 block font-bold text-slate-700">{label}{required && <span className="ml-1 text-rose-600">*</span>}</label>
                      <div className="flex items-center overflow-hidden rounded-lg border border-slate-200 bg-white focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100">
                        <span className="border-r border-slate-100 bg-slate-50 px-2.5 py-2.5 text-slate-500"><Icon className="h-3.5 w-3.5" /></span>
                        <input id={id} type="number" min="0" step="0.01" value={value} onChange={(event) => setter(Number(event.target.value))} required={required} placeholder={required ? '0' : 'Enter amount (optional)'} className="min-w-0 flex-1 bg-transparent px-2.5 py-2.5 text-xs outline-none" />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-xl border border-sky-100 bg-gradient-to-br from-sky-50/70 to-white p-4 sm:p-5">
                <div className="mb-3 flex items-center gap-3">
                  <FileText className="h-6 w-6 text-slate-700" />
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900">Additional Information</h4>
                    <p className="mt-0.5 text-[11px] text-slate-500">Add any notes or remarks for this invoice</p>
                  </div>
                </div>
                <label htmlFor="bill-notes" className="sr-only">Invoice notes</label>
                <textarea id="bill-notes" rows={3} maxLength={500} value={billNotes} onChange={(event) => setBillNotes(event.target.value)} placeholder="e.g. Late fee applicable, maintenance details, etc..." className="w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100" />
                <p className="mt-1 text-right text-[10px] text-slate-400">{billNotes.length}/500</p>
              </section>

              <footer className="flex flex-col-reverse items-stretch justify-between gap-3 px-1 pt-1 sm:flex-row sm:items-center">
                <p className="flex items-center gap-2 rounded-lg border border-teal-100 bg-teal-50 px-3 py-2.5 text-[11px] text-teal-700">
                  <Info className="h-4 w-4 shrink-0" />
                  This invoice will be saved and can be viewed in the invoice history.
                </p>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setShowCreateBill(false)} className="rounded-lg border border-slate-200 px-4 py-2.5 font-bold text-slate-600 transition hover:bg-slate-50">Cancel</button>
                  <button type="submit" disabled={societyFlats.length === 0} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50">
                    <Receipt className="h-4 w-4" /> Issue Invoice
                  </button>
                </div>
              </footer>
            </form>
          </section>
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
              <div>
                <label className="block font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value as typeof expCategory)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                >
                  {['Security', 'Maintenance & Repairs', 'Utilities', 'Gardening', 'Elevator AMC', 'Events', 'Administrative'].map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Payment Mode</label>
                  <select
                    value={expMode}
                    onChange={(e) => setExpMode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                  >
                    {['Bank Transfer', 'UPI', 'Cash', 'Cheque', 'Card'].map((mode) => (
                      <option key={mode} value={mode}>{mode}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Expense Date</label>
                  <input
                    type="date"
                    value={expDate}
                    onChange={(e) => setExpDate(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Notes (optional)</label>
                <textarea
                  rows={2}
                  value={expNotes}
                  onChange={(e) => setExpNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                />
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

      {selectedBill && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="bill-details-title"
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-slate-200"
          >
            <header className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 id="bill-details-title" className="text-base font-bold">Maintenance Bill Details</h3>
                <p className="mt-1 text-xs text-slate-300">{selectedBill.id} · Flat {selectedBill.flatNumber}</p>
              </div>
              <button
                type="button"
                aria-label="Close bill details"
                onClick={() => setSelectedBill(null)}
                className="text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </header>
            <div className="p-5 space-y-5 text-sm">
              <dl className="grid grid-cols-2 gap-4">
                <div><dt className="text-xs text-slate-500">Resident</dt><dd className="mt-1 font-semibold">{selectedBill.ownerName}</dd></div>
                <div><dt className="text-xs text-slate-500">Billing Month</dt><dd className="mt-1 font-semibold">{selectedBill.monthYear}</dd></div>
                {selectedBill.invoiceType && <div><dt className="text-xs text-slate-500">Invoice Type</dt><dd className="mt-1 font-semibold">{selectedBill.invoiceType}</dd></div>}
                {selectedBill.invoiceDate && <div><dt className="text-xs text-slate-500">Invoice Date</dt><dd className="mt-1 font-semibold">{selectedBill.invoiceDate}</dd></div>}
                <div><dt className="text-xs text-slate-500">Due Date</dt><dd className="mt-1 font-semibold">{selectedBill.dueDate}</dd></div>
                <div>
                  <dt className="text-xs text-slate-500">Status</dt>
                  <dd className="mt-1 font-semibold capitalize">{selectedBill.status}</dd>
                </div>
              </dl>
              {selectedBill.notes && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <h4 className="text-xs font-bold text-slate-700">Additional Information</h4>
                  <p className="mt-1 whitespace-pre-wrap text-xs leading-5 text-slate-600">{selectedBill.notes}</p>
                </div>
              )}
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-4 py-3 bg-slate-50 font-bold text-slate-800">Charges</div>
                {[
                  ['Base maintenance', selectedBill.baseMaintenance],
                  ['Water charges', selectedBill.waterCharges],
                  ['Parking charges', selectedBill.parkingCharges],
                  ...(selectedBill.otherCharges !== undefined
                    ? [['Other charges', selectedBill.otherCharges] as [string, number]]
                    : [['Clubhouse fee', selectedBill.clubhouseFee] as [string, number]]),
                  ['Late fee', selectedBill.lateFee],
                ].map(([label, amount]) => (
                  <div key={label} className="flex justify-between gap-4 px-4 py-3 border-t border-slate-100">
                    <span className="text-slate-600">{label}</span>
                    <span className="font-medium">₹{Number(amount).toLocaleString('en-IN')}</span>
                  </div>
                ))}
                <div className="flex justify-between gap-4 px-4 py-3 bg-slate-900 text-white font-bold">
                  <span>Total</span>
                  <span>₹{selectedBill.totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
              {selectedBill.status === 'paid' && (
                <dl className="grid grid-cols-2 gap-4 rounded-xl bg-emerald-50 p-4">
                  <div><dt className="text-xs text-slate-500">Paid Date</dt><dd className="mt-1 font-semibold">{selectedBill.paidDate || 'Not recorded'}</dd></div>
                  <div><dt className="text-xs text-slate-500">Payment Method</dt><dd className="mt-1 font-semibold">{selectedBill.paymentMethod || 'Not recorded'}</dd></div>
                  {selectedBill.transactionRef && (
                    <div className="col-span-2"><dt className="text-xs text-slate-500">Transaction Reference</dt><dd className="mt-1 font-semibold break-all">{selectedBill.transactionRef}</dd></div>
                  )}
                </dl>
              )}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedBill(null)}
                  className="px-4 py-2 border border-slate-200 rounded-lg font-bold text-slate-600"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => downloadBillReceipt(selectedBill)}
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg font-bold"
                >
                  Download Receipt
                </button>
              </div>
            </div>
          </section>
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
