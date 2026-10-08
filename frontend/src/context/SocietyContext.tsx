
import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserRole,
  VisitorPass,
  VisitorCategory,
  DomesticWorkerPass,
  DomesticWorkerVerificationResult,
  MaintenanceBill,
  BillPaymentMethod,
  SocietyExpense,
  Amenity,
  AmenityBooking,
  ComplaintTicket,
  SocietyNotice,
  DailyStaff,
  FlatDetail,
  FlatFamilyMember,
  FlatProfileDetails,
  EmergencyAlert,
  EmergencyContact,
  QRVerificationResult,
  QRPassPayload,
  GuardShiftLog,
  GuardChatMessage,
  GuardEventSecurityPlan,
  ShiftIncident,
  ShiftIncidentCategory,
  ShiftIncidentSeverity,
  AuthUser,
  SidebarNavId,
  SocietyProfile,
  SocietyBankDetails,
} from '../types';
import {
  DEFAULT_SOCIETY_NAME,
  INITIAL_FLATS,
  INITIAL_VISITORS,
  INITIAL_BILLS,
  INITIAL_EXPENSES,
  INITIAL_AMENITIES,
  INITIAL_BOOKINGS,
  INITIAL_COMPLAINTS,
  INITIAL_NOTICES,
  INITIAL_STAFF,
  INITIAL_SOS_ALERTS,
  INITIAL_SHIFT_LOGS,
  INITIAL_USERS,
  INITIAL_SOCIETIES,
} from '../data/initialData';

interface IncomingGateCall {
  visitor: VisitorPass;
  timestamp: string;
}

interface SocietyContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  activeFlat: string;
  setActiveFlat: (flat: string) => void;

  // Authentication & Multi-Role Sessions
  currentUser: AuthUser | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<AuthUser | null>>;
  users: AuthUser[];
  loginResident: (credentials: { emailOrFlat: string; password?: string }) => {
    success: boolean;
    message: string;
    user?: AuthUser;
  };
  registerResident: (data: {
    name: string;
    email?: string;
    phone: string;
    flatNumber: string;
    wing?: string;
    occupancyStatus?: 'Owner' | 'Tenant';
    familyMembersCount?: number;
    vehicleNumber?: string;
    password?: string;
  }) => { success: boolean; message: string; user?: AuthUser };
  loginGuard: (credentials: { badgeIdOrPhone: string; pin?: string }) => {
    success: boolean;
    message: string;
    user?: AuthUser;
  };
  registerGuard: (data: {
    name: string;
    phone?: string;
    badgeId: string;
    gateStation: string;
    shiftType?: 'Morning' | 'Afternoon' | 'Night' | 'Custom';
    pin?: string;
  }) => { success: boolean; message: string; user?: AuthUser };
  createGuard: (data: {
    name: string;
    phone: string;
    email?: string;
    badgeId: string;
    assignedGate: string;
    shiftType: 'Morning' | 'Afternoon' | 'Night' | 'Custom';
    assignedDuty: string;
    guardStatus?: 'active' | 'inactive';
    avatarUrl?: string;
    joiningDate: string;
    endDate?: string;
    employmentType: 'Full-time' | 'Part-time' | 'Contract';
    dateOfBirth?: string;
    gender?: string;
    bloodGroup?: string;
    address?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    identityProofType?: string;
    identityNumber?: string;
    guardNotes?: string;
    guardDocuments?: string[];
  }) => { success: boolean; message: string; guard?: AuthUser };
  updateGuard: (
    guardId: string,
    updates: Partial<Pick<AuthUser, 'name' | 'phone' | 'email' | 'assignedGate' | 'shiftType' | 'assignedDuty' | 'guardStatus' |
      'avatarUrl' | 'joiningDate' | 'endDate' | 'employmentType' | 'dateOfBirth' | 'gender' | 'bloodGroup' | 'address' |
      'emergencyContactName' | 'emergencyContactPhone' | 'identityProofType' | 'identityNumber' | 'guardNotes' | 'guardDocuments'>>
  ) => { success: boolean; message: string };
  loginAdmin: (credentials: {
    email?: string;
    adminAccessCodeOrPassword?: string;
  }) => { success: boolean; message: string; user?: AuthUser };
  registerAdmin: (data: {
    name: string;
    email: string;
    phone?: string;
    designation: string;
    adminAccessCode: string;
    password?: string;
  }) => { success: boolean; message: string; user?: AuthUser };
  logout: () => void;
  switchUserAccount: (userId: string) => void;
  
  flats: FlatDetail[];
  societies: SocietyProfile[];
  currentSocietyName: string;
  setCurrentSocietyName: (name: string) => void;
  addSociety: (data: Omit<SocietyProfile, 'id' | 'createdAt'>) => {
    success: boolean;
    message: string;
  };
  updateSocietyBankDetails: (societyId: string, data: SocietyBankDetails) => {
    success: boolean;
    message: string;
  };
  addApartment: (data: Pick<FlatDetail, 'flatNumber' | 'wing' | 'floor' | 'propertyAddress' | 'flatType'> & { societyName: string }) => {
    success: boolean;
    message: string;
  };
  updateApartmentAddress: (flatNumber: string, propertyAddress: string, societyName?: string) => { success: boolean; message: string };
  markFlatVacant: (flatNumber: string, societyName?: string) => { success: boolean; message: string };
  visitors: VisitorPass[];
  domesticWorkerPasses: DomesticWorkerPass[];
  createDomesticWorkerPass: (data: {
    firstName: string;
    lastName: string;
    workerPhone: string;
    whatsappNumber?: string;
    workType: string;
    workerAddress: string;
    maritalStatus: 'married' | 'single';
    spouseName?: string;
    idDocumentName: string;
    idDocumentDataUrl: string;
  }) => {
    success: boolean;
    message: string;
    pass?: DomesticWorkerPass;
  };
  renewDomesticWorkerPass: (passId: string) => { success: boolean; message: string };
  revokeDomesticWorkerPass: (passId: string) => { success: boolean; message: string };
  verifyDomesticWorkerPass: (passCode: string) => DomesticWorkerVerificationResult;
  recordDomesticWorkerGateAction: (passId: string, action: 'entry' | 'exit', gate?: string) => {
    success: boolean;
    message: string;
  };
  bills: MaintenanceBill[];
  expenses: SocietyExpense[];
  amenities: Amenity[];
  addAmenity: (data: Omit<Amenity, 'id'>) => void;
  updateAmenity: (amenityId: string, updates: Partial<Omit<Amenity, 'id'>>) => void;
  deleteAmenity: (amenityId: string) => void;
  bookings: AmenityBooking[];
  guardEventSecurityPlans: GuardEventSecurityPlan[];
  saveGuardEventSecurityPlan: (
    plan: Pick<GuardEventSecurityPlan, 'eventId' | 'guestProtocol' | 'parkingPlan' | 'guardNotes' | 'status'> &
      Partial<Pick<GuardEventSecurityPlan, 'assignedGuardCount' | 'assignedGuardIds' | 'assignedGuardNames' | 'entryGate' | 'parkingArea'>>
  ) => { success: boolean; message: string };
  complaints: ComplaintTicket[];
  notices: SocietyNotice[];
  staff: DailyStaff[];
  sosAlerts: EmergencyAlert[];
  shiftLogs: GuardShiftLog[];
  guardChatMessages: GuardChatMessage[];
  sendGuardChatMessage: (message: string) => { success: boolean; message: string };
  activeShift: GuardShiftLog | null;
  incomingCall: IncomingGateCall | null;
  setIncomingCall: React.Dispatch<React.SetStateAction<IncomingGateCall | null>>;

  // Helper actions
  startGuardShift: (data: {
    guardName: string;
    guardBadgeId: string;
    gateStation: string;
    shiftType: 'Morning' | 'Afternoon' | 'Night' | 'Custom';
    startTime?: string;
  }) => GuardShiftLog;

  endGuardShift: (
    shiftId: string,
    data: {
      endTime?: string;
      handoverNotes?: string;
      handedOverTo?: string;
    }
  ) => { success: boolean; message: string; shift?: GuardShiftLog };

  logShiftIncident: (incidentData: {
    shiftId?: string;
    guardName?: string;
    guardBadgeId?: string;
    gateStation?: string;
    shiftType?: GuardShiftLog['shiftType'];
    severity: ShiftIncidentSeverity;
    category: ShiftIncidentCategory;
    title: string;
    description: string;
    location: string;
    actionTaken: string;
    reportedBy?: string;
    flatNumber?: string;
    vehicleNumber?: string;
  }) => ShiftIncident;

  updateShiftIncident: (incidentId: string, updates: Partial<ShiftIncident>) => void;
  deleteShiftIncident: (incidentId: string) => void;

  preApproveVisitor: (data: {
    visitorName: string;
    phone: string;
    category: VisitorCategory;
    companyOrRole?: string;
    expectedDate: string;
    expectedTimeSlot?: string;
    validDurationHours?: number;
    purpose?: string;
    vehicleNumber?: string;
    eventId?: string;
  }) => { success: boolean; message: string; pass?: VisitorPass };

  verifyAndCheckInVisitor: (
    passcodeOrToken: string,
    entryGate?: string
  ) => { success: boolean; message: string; visitor?: VisitorPass; code?: string };

  verifyQRPassPayload: (payloadString: string) => QRVerificationResult;
  extendPassValidity: (visitorId: string, additionalHours: number) => { success: boolean; message: string };
  revokeVisitorPass: (visitorId: string) => { success: boolean; message: string };

  quickGateCheckIn: (data: {
    flatNumber: string;
    visitorName: string;
    phone: string;
    category: VisitorCategory;
    companyOrRole?: string;
    vehicleNumber?: string;
    entryGate?: string;
  }) => VisitorPass;

  checkOutVisitor: (visitorId: string) => void;
  approvePendingVisitor: (visitorId: string, leaveAtGate?: boolean) => void;
  denyPendingVisitor: (visitorId: string) => void;
  updateVisitorStatus: (visitorId: string, status: VisitorPass['status']) => void;
  deleteVisitorPass: (visitorId: string) => { success: boolean; message: string };

  addFlatWithMember: (data: {
    flatNumber: string;
    societyName: string;
    wing: string;
    floor: number;
    ownerName: string;
    occupancyStatus: 'Owner' | 'Tenant' | 'Vacant';
    phone: string;
    email: string;
    username: string;
    password: string;
    familyMembersCount: number;
    familyMembers?: FlatFamilyMember[];
    vehicles: { type: 'Car' | 'Bike'; number: string; makeModel?: string; color?: string; fastTag?: string }[];
    monthlyMaintenance: {
      baseMaintenance: number;
      waterCharges: number;
      parkingCharges: number;
      clubhouseFee: number;
      autoGenerateFirstBill?: boolean;
      monthYear?: string;
      dueDate?: string;
    };
    emergencyContacts?: EmergencyContact[];
    profileDetails?: FlatProfileDetails;
  }) => { success: boolean; message: string };
  updateResidentProfile: (
    flatNumber: string,
    updatedData: {
      ownerName: string;
      phone: string;
      email: string;
      occupancyStatus: 'Owner' | 'Tenant' | 'Vacant';
      familyMembersCount: number;
      vehicles: { type: 'Car' | 'Bike'; number: string }[];
      emergencyContacts: EmergencyContact[];
    }
  ) => { success: boolean; message: string };
  deleteFlat: (flatNumber: string) => void;

  payBill: (billId: string, paymentMethod: BillPaymentMethod) => void;
  createBill: (data: Omit<MaintenanceBill, 'id' | 'status'>) => void;

  addExpense: (data: Omit<SocietyExpense, 'id'>) => void;

  bookAmenity: (amenityId: string, date: string, timeSlot: string, guestsCount: number) => {
    success: boolean;
    message: string;
    booking?: AmenityBooking;
  };
  approveAmenityBooking: (bookingId: string) => { success: boolean; message: string };
  rejectAmenityBooking: (bookingId: string) => { success: boolean; message: string };
  cancelBooking: (bookingId: string) => void;

  submitComplaint: (data: Omit<ComplaintTicket, 'id' | 'createdAt' | 'status' | 'flatNumber' | 'residentName'>) => void;
  updateComplaintStatus: (ticketId: string, status: 'open' | 'in_progress' | 'resolved', assignedTo?: string, notes?: string) => void;

  addNotice: (data: Omit<SocietyNotice, 'id' | 'date'>) => void;
  deleteNotice: (noticeId: string) => void;

  toggleStaffAttendance: (staffId: string) => void;
  addSocietyStaff: (data: {
    firstName: string;
    lastName: string;
    role: string;
    phone: string;
    whatsappNumber?: string;
    address: string;
    maritalStatus: 'married' | 'single';
    spouseName?: string;
    identityProofType: string;
    identityNumber?: string;
    identityPhotoUrl: string;
    assignedDuties: string;
  }) => { success: boolean; message: string; staff?: DailyStaff };

  triggerSOS: (type: 'Medical' | 'Fire' | 'Security Threat' | 'Lift Trapped' | 'Panic Alert (Silent)' | 'Intrusion') => void;
  triggerPanicAlert: (notes?: string) => EmergencyAlert;
  dispatchGuardToEmergency: (alertId: string, guardName?: string) => void;
  resolveSOS: (alertId: string, resolutionNotes?: string) => void;

  activeSidebarNav: SidebarNavId;
  setActiveSidebarNav: (id: SidebarNavId) => void;

  resetToDefaultData: () => void;
}

const SocietyContext = createContext<SocietyContextType | undefined>(undefined);

export const SocietyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<AuthUser[]>(() => {
    const saved = localStorage.getItem('mygate_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('mygate_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeSidebarNav, setActiveSidebarNav] = useState<SidebarNavId>(() =>
    currentUser?.role === 'admin' ? 'dashboard' : 'accounting'
  );

  const [role, setRole] = useState<UserRole>(() => {
    const savedUser = localStorage.getItem('mygate_current_user');
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        if (u.role) return u.role;
      } catch {
        // fallback
      }
    }
    return 'resident';
  });

  const [activeFlat, setActiveFlat] = useState<string>(() => {
    const savedUser = localStorage.getItem('mygate_current_user');
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        if (u.flatNumber) return u.flatNumber;
      } catch {
        // fallback
      }
    }
    return 'B-402';
  });

  const [societies, setSocieties] = useState<SocietyProfile[]>(() => {
    const saved = localStorage.getItem('mygate_societies');
    if (!saved) return INITIAL_SOCIETIES;

    const savedSocieties = JSON.parse(saved) as SocietyProfile[];
    return [
      ...INITIAL_SOCIETIES.filter((initial) => !savedSocieties.some((society) => society.name === initial.name)),
      ...savedSocieties,
    ];
  });

  const [currentSocietyName, setCurrentSocietyName] = useState(() => {
    const saved = localStorage.getItem('mygate_current_society');
    return saved || DEFAULT_SOCIETY_NAME;
  });

  // Load state from localStorage or initial fallback
  const [flats, setFlats] = useState<FlatDetail[]>(() => {
    const saved = localStorage.getItem('mygate_flats');
    const storedFlats = saved ? JSON.parse(saved) as FlatDetail[] : INITIAL_FLATS;
    return storedFlats.map((flat) => ({
      ...flat,
      societyName: flat.societyName || DEFAULT_SOCIETY_NAME,
    }));
  });

  const [visitors, setVisitors] = useState<VisitorPass[]>(() => {
    const saved = localStorage.getItem('mygate_visitors');
    const stored = saved ? JSON.parse(saved) as VisitorPass[] : INITIAL_VISITORS;
    return stored.map((visitor) => ({
      ...visitor,
      societyName: visitor.societyName ||
        flats.find((flat) => flat.flatNumber.toUpperCase() === visitor.flatNumber.toUpperCase())?.societyName ||
        DEFAULT_SOCIETY_NAME,
    }));
  });

  const [domesticWorkerPasses, setDomesticWorkerPasses] = useState<DomesticWorkerPass[]>(() => {
    const saved = localStorage.getItem('mygate_domestic_worker_passes');
    return saved ? JSON.parse(saved) : [];
  });

  const [bills, setBills] = useState<MaintenanceBill[]>(() => {
    const saved = localStorage.getItem('mygate_bills');
    const stored = saved ? JSON.parse(saved) as MaintenanceBill[] : INITIAL_BILLS;
    return stored.map((bill) => ({
      ...bill,
      societyName: bill.societyName || flats.find((flat) => flat.flatNumber.toUpperCase() === bill.flatNumber.toUpperCase())?.societyName || DEFAULT_SOCIETY_NAME,
    }));
  });

  const [expenses, setExpenses] = useState<SocietyExpense[]>(() => {
    const saved = localStorage.getItem('mygate_expenses');
    const stored = saved ? JSON.parse(saved) as SocietyExpense[] : INITIAL_EXPENSES;
    return stored.map((expense) => ({ ...expense, societyName: expense.societyName || DEFAULT_SOCIETY_NAME }));
  });

  const [amenities, setAmenities] = useState<Amenity[]>(() => {
    const saved = localStorage.getItem('mygate_amenities');
    const stored = saved ? JSON.parse(saved) as Amenity[] : INITIAL_AMENITIES;
    return stored.map((amenity) => ({ ...amenity, societyName: amenity.societyName || DEFAULT_SOCIETY_NAME }));
  });

  const [bookings, setBookings] = useState<AmenityBooking[]>(() => {
    const saved = localStorage.getItem('mygate_bookings');
    const stored = saved ? JSON.parse(saved) as AmenityBooking[] : INITIAL_BOOKINGS;
    return stored.map((booking) => ({
      ...booking,
      societyName: booking.societyName ||
        flats.find((flat) => flat.flatNumber.toUpperCase() === booking.flatNumber.toUpperCase())?.societyName ||
        DEFAULT_SOCIETY_NAME,
    }));
  });

  const [guardEventSecurityPlans, setGuardEventSecurityPlans] = useState<GuardEventSecurityPlan[]>(() => {
    const saved = localStorage.getItem('mygate_guard_event_security_plans');
    return saved ? JSON.parse(saved) : [];
  });

  const [complaints, setComplaints] = useState<ComplaintTicket[]>(() => {
    const saved = localStorage.getItem('mygate_complaints');
    const stored = saved ? JSON.parse(saved) as ComplaintTicket[] : INITIAL_COMPLAINTS;
    return stored.map((ticket) => ({
      ...ticket,
      societyName: ticket.societyName ||
        flats.find((flat) => flat.flatNumber.toUpperCase() === ticket.flatNumber.toUpperCase())?.societyName ||
        DEFAULT_SOCIETY_NAME,
    }));
  });

  const [notices, setNotices] = useState<SocietyNotice[]>(() => {
    const saved = localStorage.getItem('mygate_notices');
    const stored = saved ? JSON.parse(saved) as SocietyNotice[] : INITIAL_NOTICES;
    return stored.map((notice) => ({ ...notice, societyName: notice.societyName || DEFAULT_SOCIETY_NAME }));
  });

  const [staff, setStaff] = useState<DailyStaff[]>(() => {
    const saved = localStorage.getItem('mygate_staff');
    const stored = saved ? JSON.parse(saved) as DailyStaff[] : INITIAL_STAFF;
    return stored.map((person) => ({
      ...person,
      societyName: person.societyName ||
        [...new Set(person.flatsAssigned.map((flatNumber) =>
          flats.find((flat) => flat.flatNumber.toUpperCase() === flatNumber.toUpperCase())?.societyName
        ).filter((name): name is string => Boolean(name)))][0] ||
        DEFAULT_SOCIETY_NAME,
    }));
  });

  const [sosAlerts, setSosAlerts] = useState<EmergencyAlert[]>(() => {
    const saved = localStorage.getItem('mygate_sos');
    return saved ? JSON.parse(saved) : INITIAL_SOS_ALERTS;
  });

  const [shiftLogs, setShiftLogs] = useState<GuardShiftLog[]>(() => {
    const saved = localStorage.getItem('mygate_shift_logs');
    return saved ? JSON.parse(saved) : INITIAL_SHIFT_LOGS;
  });

  const [guardChatMessages, setGuardChatMessages] = useState<GuardChatMessage[]>(() => {
    const saved = localStorage.getItem('mygate_guard_chat');
    return saved ? JSON.parse(saved) : [];
  });

  const activeShift = shiftLogs.find((s) => s.status === 'active') || null;

  const [incomingCall, setIncomingCall] = useState<IncomingGateCall | null>(null);

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem('mygate_societies', JSON.stringify(societies));
  }, [societies]);

  useEffect(() => {
    localStorage.setItem('mygate_current_society', currentSocietyName);
  }, [currentSocietyName]);

  useEffect(() => {
    localStorage.setItem('mygate_flats', JSON.stringify(flats));
  }, [flats]);

  useEffect(() => {
    localStorage.setItem('mygate_visitors', JSON.stringify(visitors));
  }, [visitors]);

  useEffect(() => {
    localStorage.setItem('mygate_domestic_worker_passes', JSON.stringify(domesticWorkerPasses));
  }, [domesticWorkerPasses]);

  useEffect(() => {
    const syncDomesticWorkerPasses = (event: StorageEvent) => {
      if (event.key !== 'mygate_domestic_worker_passes') return;
      try {
        setDomesticWorkerPasses(event.newValue ? JSON.parse(event.newValue) as DomesticWorkerPass[] : []);
      } catch (error) {
        console.error('Unable to sync permanent staff passes from browser storage.', error);
      }
    };

    window.addEventListener('storage', syncDomesticWorkerPasses);
    return () => window.removeEventListener('storage', syncDomesticWorkerPasses);
  }, []);

  useEffect(() => {
    localStorage.setItem('mygate_bills', JSON.stringify(bills));
  }, [bills]);

  useEffect(() => {
    localStorage.setItem('mygate_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('mygate_amenities', JSON.stringify(amenities));
  }, [amenities]);

  useEffect(() => {
    localStorage.setItem('mygate_bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('mygate_guard_event_security_plans', JSON.stringify(guardEventSecurityPlans));
  }, [guardEventSecurityPlans]);

  useEffect(() => {
    const syncGuardEventPlans = (event: StorageEvent) => {
      if (event.key !== 'mygate_guard_event_security_plans') return;
      if (!event.newValue) {
        setGuardEventSecurityPlans([]);
        return;
      }

      try {
        setGuardEventSecurityPlans(JSON.parse(event.newValue) as GuardEventSecurityPlan[]);
      } catch (error) {
        console.error('Unable to sync guard event security plans from browser storage.', error);
      }
    };

    window.addEventListener('storage', syncGuardEventPlans);
    return () => window.removeEventListener('storage', syncGuardEventPlans);
  }, []);

  useEffect(() => {
    localStorage.setItem('mygate_complaints', JSON.stringify(complaints));
  }, [complaints]);

  useEffect(() => {
    localStorage.setItem('mygate_notices', JSON.stringify(notices));
  }, [notices]);

  useEffect(() => {
    localStorage.setItem('mygate_staff', JSON.stringify(staff));
  }, [staff]);

  useEffect(() => {
    localStorage.setItem('mygate_sos', JSON.stringify(sosAlerts));
  }, [sosAlerts]);

  useEffect(() => {
    localStorage.setItem('mygate_shift_logs', JSON.stringify(shiftLogs));
  }, [shiftLogs]);

  useEffect(() => {
    localStorage.setItem('mygate_guard_chat', JSON.stringify(guardChatMessages));
  }, [guardChatMessages]);

  useEffect(() => {
    const syncGuardChat = (event: StorageEvent) => {
      if (event.key !== 'mygate_guard_chat') return;
      if (!event.newValue) {
        setGuardChatMessages([]);
        return;
      }

      try {
        setGuardChatMessages(JSON.parse(event.newValue) as GuardChatMessage[]);
      } catch (error) {
        console.error('Unable to sync guard chat messages from browser storage.', error);
      }
    };

    window.addEventListener('storage', syncGuardChat);
    return () => window.removeEventListener('storage', syncGuardChat);
  }, []);

  useEffect(() => {
    localStorage.setItem('mygate_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('mygate_current_user', JSON.stringify(currentUser));
      setRole(currentUser.role);
      if (currentUser.role === 'resident' && currentUser.flatNumber) {
        setActiveFlat(currentUser.flatNumber);
      }
    } else {
      localStorage.removeItem('mygate_current_user');
    }
  }, [currentUser]);

  // A resident's assigned flat is scoped to the society selected during assignment.
  const currentFlatObj = (role === 'resident' && currentUser?.flatNumber
    ? flats.find((flat) =>
        flat.flatNumber.toLowerCase() === currentUser.flatNumber?.toLowerCase() &&
        (currentUser.email
          ? flat.email.toLowerCase() === currentUser.email.toLowerCase()
          : flat.societyName === currentUser.societyName)
      ) || flats.find((flat) =>
        flat.flatNumber.toLowerCase() === currentUser.flatNumber?.toLowerCase() &&
        flat.societyName === currentUser.societyName
      )
    : undefined) || flats.find((flat) => flat.flatNumber === activeFlat) || flats[0];

  const getLocalDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const addMonthsToDate = (dateString: string, months: number) => {
    const [year, month, day] = dateString.split('-').map(Number);
    const targetMonth = month - 1 + months;
    const targetYear = year + Math.floor(targetMonth / 12);
    const normalizedMonth = ((targetMonth % 12) + 12) % 12;
    const lastDay = new Date(targetYear, normalizedMonth + 1, 0).getDate();
    return getLocalDateString(new Date(targetYear, normalizedMonth, Math.min(day, lastDay)));
  };

  const createDomesticWorkerPass = (data: {
    firstName: string;
    lastName: string;
    workerPhone: string;
    whatsappNumber?: string;
    workType: string;
    workerAddress: string;
    maritalStatus: 'married' | 'single';
    spouseName?: string;
    idDocumentName: string;
    idDocumentDataUrl: string;
  }) => {
    if (role !== 'resident' || currentUser?.role !== 'resident' || !currentUser.flatNumber || currentUser.flatNumber !== activeFlat) {
      return { success: false, message: 'Sign in to your resident account to register household staff.' };
    }
    const firstName = data.firstName.trim().replace(/\s+/g, ' ');
    const lastName = data.lastName.trim().replace(/\s+/g, ' ');
    const workerName = `${firstName} ${lastName}`.trim();
    const workerPhone = data.workerPhone.trim();
    const whatsappNumber = data.whatsappNumber?.trim() || '';
    const workType = data.workType.trim().replace(/\s+/g, ' ');
    const workerAddress = data.workerAddress.trim().replace(/\s+/g, ' ');
    const spouseName = data.spouseName?.trim().replace(/\s+/g, ' ') || '';
    const phoneDigits = workerPhone.replace(/\D/g, '');
    if (firstName.length < 2 || firstName.length > 60 || lastName.length < 1 || lastName.length > 60) {
      return { success: false, message: 'Enter the worker’s first and last name.' };
    }
    if (phoneDigits.length < 10 || phoneDigits.length > 15) {
      return { success: false, message: 'Enter a valid phone number (10–15 digits).'};
    }
    if (whatsappNumber && (whatsappNumber.replace(/\D/g, '').length < 10 || whatsappNumber.replace(/\D/g, '').length > 15)) {
      return { success: false, message: 'Enter a valid WhatsApp number or leave it blank.' };
    }
    if (workType.length < 2 || workType.length > 60) {
      return { success: false, message: 'Enter a job type such as maid, driver, cook, caregiver, or another role.' };
    }
    if (workerAddress.length < 5 || workerAddress.length > 300) {
      return { success: false, message: 'Enter the worker’s current address.' };
    }
    if (data.maritalStatus === 'married' && (spouseName.length < 2 || spouseName.length > 120)) {
      return { success: false, message: 'Enter the husband or wife’s name for a married worker.' };
    }
    if (!data.idDocumentName || !data.idDocumentDataUrl) {
      return { success: false, message: 'Upload a photo of the worker’s identity document.' };
    }
    if (domesticWorkerPasses.some(
      (pass) =>
        pass.flatNumber === activeFlat &&
        pass.status === 'active' &&
        pass.workerPhone.replace(/\D/g, '') === phoneDigits
    )) {
      return { success: false, message: 'This worker already has an active pass for your flat.' };
    }

    const usedCodes = new Set(domesticWorkerPasses.map((pass) => pass.passCode));
    let passCode = '';
    for (let attempt = 0; attempt < 100; attempt += 1) {
      const candidate = String(Math.floor(1000 + Math.random() * 9000));
      if (!usedCodes.has(candidate)) {
        passCode = candidate;
        break;
      }
    }
    if (!passCode) {
      return { success: false, message: 'Unable to issue a unique access code right now. Please try again.' };
    }

    const today = getLocalDateString(new Date());
    const pass: DomesticWorkerPass = {
      id: `DWP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      flatNumber: activeFlat,
      residentName: currentFlatObj?.ownerName || currentUser.name,
      workerName,
      firstName,
      lastName,
      workerPhone,
      ...(whatsappNumber ? { whatsappNumber } : {}),
      workType,
      workerAddress,
      maritalStatus: data.maritalStatus,
      ...(data.maritalStatus === 'married' ? { spouseName } : {}),
      idDocumentName: data.idDocumentName,
      idDocumentDataUrl: data.idDocumentDataUrl,
      passCode,
      status: 'active',
      validFrom: today,
      validThrough: addMonthsToDate(today, 1),
      createdAt: new Date().toISOString(),
      insideSociety: false,
    };
    const updatedPasses = [pass, ...domesticWorkerPasses];
    try {
      localStorage.setItem('mygate_domestic_worker_passes', JSON.stringify(updatedPasses));
    } catch (error) {
      console.error('Unable to save the household staff pass in browser storage.', error);
      return { success: false, message: 'The staff record could not be saved. Free up browser storage and try a smaller ID photo.' };
    }
    setDomesticWorkerPasses(updatedPasses);
    return {
      success: true,
      message: `Monthly entry pass created for ${workerName}. Resident registration is active until ${pass.validThrough}.`,
      pass,
    };
  };

  const renewDomesticWorkerPass = (passId: string) => {
    if (role !== 'resident' || currentUser?.role !== 'resident') {
      return { success: false, message: 'Only the resident can renew this household worker pass.' };
    }
    const pass = domesticWorkerPasses.find((item) => item.id === passId && item.flatNumber === activeFlat);
    if (!pass || pass.status !== 'active') {
      return { success: false, message: 'Active worker pass was not found for this flat.' };
    }
    const today = getLocalDateString(new Date());
    const renewalOpensOn = addMonthsToDate(pass.validThrough, 0);
    const openDate = new Date(`${renewalOpensOn}T00:00:00`);
    openDate.setDate(openDate.getDate() - 7);
    if (today < getLocalDateString(openDate)) {
      return { success: false, message: `Renewal opens on ${getLocalDateString(openDate)}.` };
    }
    const renewedThrough = addMonthsToDate(pass.validThrough < today ? today : pass.validThrough, 1);
    setDomesticWorkerPasses((previous) => previous.map((item) => (
      item.id === passId
        ? { ...item, validThrough: renewedThrough, renewedAt: new Date().toISOString() }
        : item
    )));
    return { success: true, message: `Monthly access renewed through ${renewedThrough}. The worker keeps the same 4-digit pass code.` };
  };

  const revokeDomesticWorkerPass = (passId: string) => {
    if (role !== 'resident' || currentUser?.role !== 'resident') {
      return { success: false, message: 'Only the resident can revoke this household worker pass.' };
    }
    const pass = domesticWorkerPasses.find((item) => item.id === passId && item.flatNumber === activeFlat);
    if (!pass || pass.status !== 'active') {
      return { success: false, message: 'Active worker pass was not found for this flat.' };
    }
    setDomesticWorkerPasses((previous) => previous.map((item) => (
      item.id === passId ? { ...item, status: 'revoked' } : item
    )));
    return { success: true, message: `Access pass for ${pass.workerName} has been revoked.` };
  };

  const verifyDomesticWorkerPass = (passCode: string): DomesticWorkerVerificationResult => {
    if (role !== 'guard' || currentUser?.role !== 'guard') {
      return { success: false, message: 'Permanent staff passes can only be checked by gate security.' };
    }
    const normalizedCode = passCode.trim();
    if (!/^\d{4}$/.test(normalizedCode)) {
      return { success: false, message: 'Enter the worker’s four-digit access code.' };
    }
    const workerPass = domesticWorkerPasses.find((pass) => pass.passCode === normalizedCode);
    if (!workerPass) {
      return { success: false, message: 'No household worker pass matches this code. Confirm the code with the resident.' };
    }
    if (workerPass.status !== 'active') {
      return { success: false, message: 'This household worker pass has been revoked. Do not allow entry.', worker: workerPass };
    }
    const today = getLocalDateString(new Date());
    if (today < workerPass.validFrom || today > workerPass.validThrough) {
      return { success: false, message: `This monthly pass expired on ${workerPass.validThrough}. Ask the resident to renew it.`, worker: workerPass };
    }
    return {
      success: true,
      message: `Verified: ${workerPass.workerName}, ${workerPass.workType}, registered to Flat ${workerPass.flatNumber} (${workerPass.residentName}).`,
      worker: workerPass,
    };
  };

  const recordDomesticWorkerGateAction = (passId: string, action: 'entry' | 'exit', gate = 'Main Gate 1') => {
    if (role !== 'guard' || currentUser?.role !== 'guard') {
      return { success: false, message: 'Only gate security can record household worker entry or exit.' };
    }
    const workerPass = domesticWorkerPasses.find((pass) => pass.id === passId);
    const today = getLocalDateString(new Date());
    if (!workerPass) {
      return { success: false, message: 'Worker pass was not found. Entry/exit was not recorded.' };
    }
    if (action === 'entry' && (
      workerPass.status !== 'active' || today < workerPass.validFrom || today > workerPass.validThrough
    )) {
      return { success: false, message: 'Worker pass is not active or has expired. Entry was not recorded.' };
    }
    if (action === 'entry' && workerPass.insideSociety) {
      return { success: false, message: `${workerPass.workerName} is already recorded inside the society.` };
    }
    if (action === 'exit' && !workerPass.insideSociety) {
      return { success: false, message: `${workerPass.workerName} is not currently recorded inside the society.` };
    }

    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setDomesticWorkerPasses((previous) => previous.map((pass) => (
      pass.id === passId
        ? {
            ...pass,
            insideSociety: action === 'entry',
            ...(action === 'entry'
              ? { lastEntryAt: now.toISOString(), lastEntryGate: gate }
              : { lastExitAt: now.toISOString() }),
          }
        : pass
    )));
    return {
      success: true,
      message: action === 'entry'
        ? `Entry recorded for ${workerPass.workerName} of Flat ${workerPass.flatNumber} at ${time}.`
        : `Exit recorded for ${workerPass.workerName} of Flat ${workerPass.flatNumber} at ${time}.`,
    };
  };

  // Helper to generate 6 digit random passcode
  const generatePasscode = () => Math.floor(100000 + Math.random() * 900000).toString();

  // Actions
  const preApproveVisitor = (data: {
    visitorName: string;
    phone: string;
    category: VisitorCategory;
    companyOrRole?: string;
    expectedDate: string;
    expectedTimeSlot?: string;
    validDurationHours?: number;
    purpose?: string;
    vehicleNumber?: string;
    eventId?: string;
  }): { success: boolean; message: string; pass?: VisitorPass } => {
    const selectedEvent = data.eventId?.startsWith('notice:')
      ? notices.find((notice) => `notice:${notice.id}` === data.eventId && notice.category === 'Event')
      : undefined;
    if (data.eventId && !selectedEvent) {
      return { success: false, message: 'The selected society event is no longer available.' };
    }
    if (selectedEvent) {
      const plan = guardEventSecurityPlans.find((item) => item.eventId === data.eventId);
      if (
        plan?.status !== 'ready' ||
        !plan.assignedGuardIds?.length ||
        !plan.entryGate ||
        !plan.parkingArea
      ) {
        return {
          success: false,
          message: 'This event pass is not available yet. The administrator must confirm the entrance, parking area, and assigned guards first.',
        };
      }
    }

    const passcode = generatePasscode();
    const duration = data.validDurationHours && data.validDurationHours > 0 ? data.validDurationHours : 6;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + duration * 60 * 60 * 1000).toISOString();
    const idNum = Math.floor(100 + Math.random() * 900);
    const passId = `VIS-${idNum}`;
    const qrToken = `QR-VPASS-${passcode}-${idNum}`;
    const confirmedEventPlan = selectedEvent
      ? guardEventSecurityPlans.find((item) => item.eventId === data.eventId)
      : undefined;
    const passSocietyName = currentFlatObj.societyName || currentSocietyName || DEFAULT_SOCIETY_NAME;
    const passSociety = societies.find((society) => society.name === passSocietyName);
    let eventPassCode: string | undefined;
    if (selectedEvent) {
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      do {
        const digits = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        const suffix = Array.from({ length: 2 }, () => letters[Math.floor(Math.random() * letters.length)]).join('');
        eventPassCode = `${digits}${suffix}`;
      } while (visitors.some((visitor) => visitor.eventPassCode === eventPassCode));
    }

    const newPass: VisitorPass = {
      id: passId,
      flatNumber: activeFlat,
      residentName: currentFlatObj.ownerName,
      visitorName: data.visitorName,
      phone: data.phone,
      category: data.category,
      companyOrRole: data.companyOrRole || (data.category === 'delivery' ? 'Delivery Agent' : 'Guest'),
      vehicleNumber: data.vehicleNumber,
      passcode,
      expectedDate: data.expectedDate,
      expectedTimeSlot: data.expectedTimeSlot,
      status: 'expected',
      approvedByResident: true,
      qrToken,
      generatedAt: now.toISOString(),
      expiresAt,
      validDurationHours: duration,
      isTimeLimited: true,
      purpose: data.purpose,
      eventId: selectedEvent ? data.eventId : undefined,
      eventName: selectedEvent?.title,
      societyName: selectedEvent ? passSocietyName : undefined,
      societyAddress: selectedEvent ? passSociety?.propertyAddress || passSocietyName : undefined,
      eventPassCode,
      eventEntryGate: confirmedEventPlan?.entryGate,
      eventParkingArea: confirmedEventPlan?.parkingArea,
      eventGuestProtocol: confirmedEventPlan?.guestProtocol,
      eventParkingPlan: confirmedEventPlan?.parkingPlan,
    };

    setVisitors((prev) => [newPass, ...prev]);
    return {
      success: true,
      message: selectedEvent ? `Event pass created for ${selectedEvent.title}.` : 'Visitor pass created.',
      pass: newPass,
    };
  };

  // Helper to parse input string which could be a raw passcode, QR token, URL with ?vpass=, or JSON payload
  const parseQRString = (input: string): string => {
    if (!input) return '';
    const trimmed = input.trim();
    
    // Check if input is a JSON string
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed.token) return parsed.token;
        if (parsed.vpassId) return parsed.vpassId;
        if (parsed.code) return parsed.code;
      } catch (err) {
        // Fallback to raw string
      }
    }

    // Check if URL contains query parameter e.g. ?vpass=... or #vpass=...
    if (trimmed.includes('vpass=')) {
      const match = trimmed.match(/[?&#]vpass=([^&]+)/);
      if (match && match[1]) {
        return decodeURIComponent(match[1]);
      }
    }

    return trimmed;
  };

  const verifyQRPassPayload = (payloadString: string): QRVerificationResult => {
    const query = parseQRString(payloadString);
    if (!query) {
      return {
        success: false,
        code: 'INVALID_QR',
        message: 'No readable QR code or token provided.',
      };
    }

    // Search by event pass code, passcode, QR token, id, or normalized phone.
    const target = visitors.find(
      (v) =>
        (v.qrToken && v.qrToken.toLowerCase() === query.toLowerCase()) ||
        (v.eventPassCode && v.eventPassCode.toLowerCase() === query.toLowerCase()) ||
        v.passcode === query ||
        v.id.toLowerCase() === query.toLowerCase()
    );

    if (!target) {
      return {
        success: false,
        code: 'NOT_FOUND',
        message: `No visitor pass found matching identifier "${query}". Please check with resident or register a new gate check-in.`,
      };
    }

    // Check expiration if time-limited
    if (target.expiresAt) {
      const now = new Date().getTime();
      const exp = new Date(target.expiresAt).getTime();
      if (now > exp) {
        return {
          success: false,
          code: 'EXPIRED',
          message: `Pass Expired! Validity lapsed on ${new Date(target.expiresAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            month: 'short',
            day: 'numeric',
          })}. Resident must extend or reissue pass.`,
          pass: target,
          expiresInMinutes: Math.round((exp - now) / 60000),
        };
      }
    }

    // Check Status
    if (target.status === 'in_gate') {
      return {
        success: false,
        code: 'ALREADY_USED',
        message: `Visitor "${target.visitorName}" has already checked in at ${target.checkInTime || 'the gate'}.`,
        pass: target,
      };
    }

    if (target.status === 'checked_out') {
      return {
        success: false,
        code: 'ALREADY_USED',
        message: `Pass has already been used and visitor checked out at ${target.checkOutTime || 'earlier'}. Single entry limit reached.`,
        pass: target,
      };
    }

    if (target.status === 'denied') {
      return {
        success: false,
        code: 'DENIED',
        message: `Entry for "${target.visitorName}" was marked as DENIED or revoked by Resident of Flat ${target.flatNumber}.`,
        pass: target,
      };
    }

    // Calculate time remaining in minutes
    let expiresInMinutes: number | undefined = undefined;
    if (target.expiresAt) {
      const remainingMs = new Date(target.expiresAt).getTime() - Date.now();
      expiresInMinutes = Math.max(0, Math.round(remainingMs / 60000));
    }

    return {
      success: true,
      code: 'VALID',
      message: `Verified! Valid pre-approved pass for Flat ${target.flatNumber} (${target.residentName}).`,
      pass: target,
      expiresInMinutes,
    };
  };

  const verifyAndCheckInVisitor = (
    passcodeOrToken: string,
    entryGate: string = 'Main Gate 1'
  ): { success: boolean; message: string; visitor?: VisitorPass; code?: string } => {
    const result = verifyQRPassPayload(passcodeOrToken);

    if (!result.success || !result.pass) {
      return {
        success: false,
        code: result.code,
        message: result.message,
        visitor: result.pass,
      };
    }

    const target = result.pass;
    const updatedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const checkedInVisitor: VisitorPass = {
      ...target,
      status: 'in_gate',
      checkInTime: updatedTime,
      entryGate: entryGate || target.entryGate || 'Main Gate 1',
      approvedByResident: true,
    };

    setVisitors((prev) =>
      prev.map((v) =>
        v.id === target.id
          ? {
              ...v,
              status: 'in_gate',
              checkInTime: updatedTime,
              entryGate: entryGate || v.entryGate || 'Main Gate 1',
              approvedByResident: true,
            }
          : v
      )
    );

    // If target flat matches active flat, trigger simulated gate bell
    if (target.flatNumber === activeFlat) {
      setIncomingCall({
        visitor: checkedInVisitor,
        timestamp: updatedTime,
      });
    }

    return {
      success: true,
      code: 'VALID',
      message: `Verified & Checked In! Entry granted for ${target.visitorName} to Flat ${target.flatNumber} via ${entryGate || 'Main Gate 1'}.`,
      visitor: checkedInVisitor,
    };
  };

  const extendPassValidity = (visitorId: string, additionalHours: number) => {
    const target = visitors.find((v) => v.id === visitorId);
    if (!target) {
      return { success: false, message: 'Visitor pass not found.' };
    }

    const currentExp = target.expiresAt ? new Date(target.expiresAt).getTime() : Date.now();
    // If currently expired, extend from now, otherwise extend from current expiry
    const baseTime = currentExp < Date.now() ? Date.now() : currentExp;
    const newExpiresAt = new Date(baseTime + additionalHours * 3600000).toISOString();

    setVisitors((prev) =>
      prev.map((v) =>
        v.id === visitorId
          ? {
              ...v,
              expiresAt: newExpiresAt,
              status: v.status === 'denied' ? 'expected' : v.status,
            }
          : v
      )
    );

    return {
      success: true,
      message: `Pass extended by ${additionalHours} hour(s)! Valid until ${new Date(newExpiresAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        month: 'short',
        day: 'numeric',
      })}`,
    };
  };

  const revokeVisitorPass = (visitorId: string) => {
    const target = visitors.find((v) => v.id === visitorId);
    if (!target) {
      return { success: false, message: 'Visitor pass not found.' };
    }

    setVisitors((prev) =>
      prev.map((v) => (v.id === visitorId ? { ...v, status: 'denied', approvedByResident: false } : v))
    );

    return {
      success: true,
      message: `Pass for ${target.visitorName} has been revoked. Security gate entry will be blocked.`,
    };
  };

  const quickGateCheckIn = (data: {
    flatNumber: string;
    visitorName: string;
    phone: string;
    category: VisitorCategory;
    companyOrRole?: string;
    vehicleNumber?: string;
    entryGate?: string;
  }) => {
    const flatObj = flats.find((f) => f.flatNumber === data.flatNumber);
    const updatedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const passcode = generatePasscode();

    // Check if delivery/cab fast auto-pass or needs resident approval
    const isPreApprovedCategory = data.category === 'cab' || data.category === 'delivery';

    const newPass: VisitorPass = {
      id: `VIS-${Math.floor(100 + Math.random() * 900)}`,
      flatNumber: data.flatNumber,
      residentName: flatObj ? flatObj.ownerName : 'Resident',
      visitorName: data.visitorName,
      phone: data.phone,
      category: data.category,
      companyOrRole: data.companyOrRole,
      vehicleNumber: data.vehicleNumber,
      passcode,
      expectedDate: new Date().toISOString().split('T')[0],
      status: isPreApprovedCategory ? 'in_gate' : 'pending_approval',
      checkInTime: updatedTime,
      entryGate: data.entryGate || 'Main Gate 1',
      approvedByResident: isPreApprovedCategory,
    };

    setVisitors((prev) => [newPass, ...prev]);

    // Trigger ring bell alert for resident
    if (data.flatNumber === activeFlat) {
      setIncomingCall({
        visitor: newPass,
        timestamp: updatedTime,
      });
    }

    return newPass;
  };

  const checkOutVisitor = (visitorId: string) => {
    const updatedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setVisitors((prev) =>
      prev.map((v) => (v.id === visitorId ? { ...v, status: 'checked_out', checkOutTime: updatedTime } : v))
    );
  };

  const approvePendingVisitor = (visitorId: string, leaveAtGate = false) => {
    const updatedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setVisitors((prev) =>
      prev.map((v) =>
        v.id === visitorId
          ? {
              ...v,
              status: 'in_gate',
              checkInTime: updatedTime,
              approvedByResident: true,
              deliveryInstruction: leaveAtGate && v.category === 'delivery' ? 'leave_at_gate' : v.deliveryInstruction,
            }
          : v
      )
    );
    if (incomingCall && incomingCall.visitor.id === visitorId) {
      setIncomingCall(null);
    }
  };

  const denyPendingVisitor = (visitorId: string) => {
    setVisitors((prev) =>
      prev.map((v) => (v.id === visitorId ? { ...v, status: 'denied', approvedByResident: false } : v))
    );
    if (incomingCall && incomingCall.visitor.id === visitorId) {
      setIncomingCall(null);
    }
  };

  const updateVisitorStatus = (visitorId: string, status: VisitorPass['status']) => {
    const updatedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setVisitors((prev) =>
      prev.map((v) => {
        if (v.id === visitorId) {
          const isApproved = status === 'in_gate';
          return {
            ...v,
            status,
            approvedByResident: isApproved,
            checkInTime: (status === 'in_gate' || status === 'pending_approval') && !v.checkInTime ? updatedTime : v.checkInTime,
            checkOutTime: status === 'checked_out' ? updatedTime : v.checkOutTime,
          };
        }
        return v;
      })
    );
  };

  const deleteVisitorPass = (visitorId: string) => {
    const visitor = visitors.find((item) => item.id === visitorId);
    if (!visitor) {
      return { success: false, message: 'Delivery record was not found.' };
    }
    setVisitors((prev) => prev.filter((item) => item.id !== visitorId));
    setIncomingCall((current) => (current?.visitor.id === visitorId ? null : current));
    return { success: true, message: 'Delivery record deleted.' };
  };

  const addFlatWithMember = (data: {
    flatNumber: string;
    societyName: string;
    wing: string;
    floor: number;
    ownerName: string;
    occupancyStatus: 'Owner' | 'Tenant' | 'Vacant';
    phone: string;
    email: string;
    username: string;
    password: string;
    familyMembersCount: number;
    familyMembers?: FlatFamilyMember[];
    vehicles: { type: 'Car' | 'Bike'; number: string; makeModel?: string; color?: string; fastTag?: string }[];
    monthlyMaintenance: {
      baseMaintenance: number;
      waterCharges: number;
      parkingCharges: number;
      clubhouseFee: number;
      autoGenerateFirstBill?: boolean;
      monthYear?: string;
      dueDate?: string;
    };
    emergencyContacts?: EmergencyContact[];
    profileDetails?: FlatProfileDetails;
  }) => {
    const formattedFlatNum = data.flatNumber.toUpperCase().trim();
    const cleanUsername = data.username.trim().toLowerCase();
    const cleanEmail = data.email.trim().toLowerCase();
    const existing = flats.find(
      (f) => f.flatNumber.toUpperCase() === formattedFlatNum && f.societyName === data.societyName
    );

    if (!existing) {
      return { success: false, message: `Apartment ${formattedFlatNum} is not in the inventory. Add it before assigning a resident.` };
    }
    if (existing.occupancyStatus !== 'Vacant') {
      return { success: false, message: `Apartment ${formattedFlatNum} is already occupied. Select a vacant apartment.` };
    }
    if (data.occupancyStatus === 'Vacant') {
      return { success: false, message: 'Choose Owner or Tenant when assigning a resident.' };
    }
    if (users.some((user) => user.username?.toLowerCase() === cleanUsername)) {
      return { success: false, message: `Username "${data.username.trim()}" is already in use. Please choose another.` };
    }
    if (cleanEmail && users.some((user) => user.email.toLowerCase() === cleanEmail)) {
      return { success: false, message: `Email address "${data.email.trim()}" is already in use. Please enter another.` };
    }

    const totalMonthly =
      Number(data.monthlyMaintenance.baseMaintenance || 0) +
      Number(data.monthlyMaintenance.waterCharges || 0) +
      Number(data.monthlyMaintenance.parkingCharges || 0) +
      Number(data.monthlyMaintenance.clubhouseFee || 0);

    const autoGenBill = data.monthlyMaintenance.autoGenerateFirstBill !== false;

    const newFlatEntry: FlatDetail = {
      ...existing,
      ownerName: data.ownerName.trim(),
      occupancyStatus: data.occupancyStatus,
      phone: data.phone.trim(),
      email: cleanEmail || `${cleanUsername}@resident.mygate.org`,
      vehicles: data.vehicles || [],
      familyMembersCount: Number(data.familyMembersCount) || 1,
      familyMembers: data.familyMembers || [],
      outstandingDues: existing.outstandingDues + (autoGenBill ? totalMonthly : 0),
      emergencyContacts: data.emergencyContacts || [],
      profileDetails: { ...existing.profileDetails, ...data.profileDetails },
    };

    setFlats((prev) => prev.map((f) =>
      f.flatNumber.toUpperCase() === formattedFlatNum && f.societyName === data.societyName ? newFlatEntry : f
    ));

    const residentUser: AuthUser = {
      id: `usr-res-${Date.now()}`,
      name: data.ownerName.trim(),
      username: cleanUsername,
      email: newFlatEntry.email,
      phone: data.phone.trim(),
      password: data.password,
      role: 'resident',
      flatNumber: formattedFlatNum,
      societyName: data.societyName,
      wing: newFlatEntry.wing,
      occupancyStatus: data.occupancyStatus,
      familyMembersCount: newFlatEntry.familyMembersCount,
      vehicleNumber: newFlatEntry.vehicles[0]?.number,
      createdAt: new Date().toISOString(),
    };
    setUsers((prev) => [...prev, residentUser]);

    // Auto-generate first monthly maintenance bill if requested
    if (autoGenBill) {
      const monthStr = data.monthlyMaintenance.monthYear || 'August 2026';
      const dueStr = data.monthlyMaintenance.dueDate || '2026-08-10';

      const newBill: MaintenanceBill = {
        id: `BILL-${Date.now().toString().slice(-6)}`,
        societyName: data.societyName,
        flatNumber: formattedFlatNum,
        ownerName: newFlatEntry.ownerName,
        monthYear: monthStr,
        dueDate: dueStr,
        baseMaintenance: Number(data.monthlyMaintenance.baseMaintenance || 0),
        waterCharges: Number(data.monthlyMaintenance.waterCharges || 0),
        parkingCharges: Number(data.monthlyMaintenance.parkingCharges || 0),
        clubhouseFee: Number(data.monthlyMaintenance.clubhouseFee || 0),
        lateFee: 0,
        totalAmount: totalMonthly,
        status: 'pending',
      };

      setBills((prev) => [newBill, ...prev]);
    }

    return {
      success: true,
      message: `Registered Flat ${formattedFlatNum} for ${newFlatEntry.ownerName} with ₹${totalMonthly.toLocaleString()}/month maintenance!`,
    };
  };

  const addSociety = (data: Omit<SocietyProfile, 'id' | 'createdAt'>) => {
    const name = data.name.trim();
    if (
      !name ||
      !data.wingBlock.trim() ||
      !data.flatType.trim() ||
      !data.ownerName.trim() ||
      !data.mobileNumber.trim() ||
      !data.propertyAddress.trim() ||
      !Number.isInteger(data.totalFlats) ||
      data.totalFlats < 1 ||
      !Number.isInteger(data.numberOfBlocks) ||
      data.numberOfBlocks < 1 ||
      !Number.isInteger(data.floors) ||
      data.floors < 1
    ) {
      return { success: false, message: 'Complete all required society details with valid counts.' };
    }
    if (societies.some((society) => society.name.toLowerCase() === name.toLowerCase())) {
      return { success: false, message: `Society "${name}" already exists.` };
    }

    const newSociety: SocietyProfile = {
      ...data,
      name,
      id: `society-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setSocieties((previous) => [...previous, newSociety]);
    setCurrentSocietyName(name);
    return { success: true, message: `Society "${name}" created.` };
  };

  const updateSocietyBankDetails = (societyId: string, data: SocietyBankDetails) => {
    if (role !== 'admin') {
      return { success: false, message: 'Only a society admin can update bank details.' };
    }
    const society = societies.find((item) => item.id === societyId);
    if (!society) {
      return { success: false, message: 'Select a valid society before saving its bank details.' };
    }

    const accountNumber = data.accountNumber.replace(/\s/g, '');
    const ifscCode = data.ifscCode.trim().toUpperCase();
    const upiId = data.upiId?.trim() || '';
    if (
      !data.accountHolderName.trim() ||
      !/^\d{6,18}$/.test(accountNumber) ||
      !data.bankName.trim() ||
      !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscCode) ||
      !data.branchName.trim() ||
      !data.bankAddress.trim() ||
      (data.accountType !== 'Savings' && data.accountType !== 'Current') ||
      (upiId && !/^[\w.-]{2,256}@[A-Za-z][A-Za-z0-9.-]{1,63}$/.test(upiId))
    ) {
      return { success: false, message: 'Enter valid account, bank, IFSC, branch, address, account type, and optional UPI details.' };
    }

    setSocieties((previous) => previous.map((item) =>
      item.id === societyId
        ? {
            ...item,
            bankDetails: {
              ...data,
              accountHolderName: data.accountHolderName.trim(),
              accountNumber,
              bankName: data.bankName.trim(),
              ifscCode,
              branchName: data.branchName.trim(),
              bankAddress: data.bankAddress.trim(),
              upiId,
            },
          }
        : item
    ));
    return { success: true, message: `Bank details saved for ${society.name}.` };
  };

  const addApartment = (data: Pick<FlatDetail, 'flatNumber' | 'wing' | 'floor' | 'propertyAddress' | 'flatType'> & { societyName: string }) => {
    const flatNumber = data.flatNumber.trim().toUpperCase();
    if (!flatNumber || !data.wing.trim() || !data.propertyAddress?.trim() || !data.societyName.trim()) {
      return { success: false, message: 'Enter the society, apartment number, wing, and property address.' };
    }
    if (!societies.some((society) => society.name === data.societyName)) {
      return { success: false, message: `Society "${data.societyName}" was not found.` };
    }
    if (flats.some((flat) => flat.flatNumber.toUpperCase() === flatNumber)) {
      return { success: false, message: `Apartment ${flatNumber} already exists in the apartment inventory.` };
    }

    const newApartment: FlatDetail = {
      flatNumber,
      societyName: data.societyName,
      flatType: data.flatType,
      wing: data.wing.trim(),
      floor: Number(data.floor) || 1,
      propertyAddress: data.propertyAddress.trim(),
      ownerName: '',
      occupancyStatus: 'Vacant',
      phone: '',
      email: '',
      vehicles: [],
      familyMembersCount: 0,
      familyMembers: [],
      outstandingDues: 0,
      emergencyContacts: [],
    };
    setFlats((prev) => [...prev, newApartment].sort((a, b) => a.flatNumber.localeCompare(b.flatNumber)));
    return { success: true, message: `Apartment ${flatNumber} added as vacant.` };
  };

  const updateApartmentAddress = (flatNumber: string, propertyAddress: string, societyName?: string) => {
    const normalizedAddress = propertyAddress.trim();
    if (!normalizedAddress) {
      return { success: false, message: 'Apartment address cannot be empty.' };
    }
    if (!flats.some((flat) => flat.flatNumber === flatNumber && (!societyName || flat.societyName === societyName))) {
      return { success: false, message: `Apartment ${flatNumber} was not found.` };
    }
    setFlats((prev) =>
      prev.map((flat) => (flat.flatNumber === flatNumber && (!societyName || flat.societyName === societyName)
        ? { ...flat, propertyAddress: normalizedAddress }
        : flat))
    );
    return { success: true, message: `Address for apartment ${flatNumber} updated.` };
  };

  const markFlatVacant = (flatNumber: string, societyName?: string) => {
    const apartment = flats.find((flat) => flat.flatNumber === flatNumber && (!societyName || flat.societyName === societyName));
    if (!apartment) return { success: false, message: `Apartment ${flatNumber} was not found.` };
    if (apartment.occupancyStatus === 'Vacant') {
      return { success: false, message: `Apartment ${flatNumber} is already vacant.` };
    }

    setFlats((prev) =>
      prev.map((flat) =>
        flat.flatNumber === flatNumber && (!societyName || flat.societyName === societyName)
          ? {
              ...flat,
              ownerName: '',
              occupancyStatus: 'Vacant',
              phone: '',
              email: '',
              vehicles: [],
              familyMembersCount: 0,
              emergencyContacts: [],
              profileDetails: undefined,
            }
          : flat
      )
    );
    setUsers((prev) =>
      prev.map((user) =>
        user.role === 'resident' &&
        user.flatNumber === flatNumber &&
        (user.societyName === apartment.societyName ||
          (!user.societyName && apartment.societyName === DEFAULT_SOCIETY_NAME))
          ? { ...user, flatNumber: undefined, wing: undefined, occupancyStatus: undefined, familyMembersCount: undefined, vehicleNumber: undefined }
          : user
      )
    );
    return { success: true, message: `Apartment ${flatNumber} is now marked vacant.` };
  };

  const deleteFlat = (flatNumber: string) => {
    setFlats((prev) => prev.filter((f) => f.flatNumber !== flatNumber));
  };

  const payBill = (billId: string, paymentMethod: BillPaymentMethod) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const txnRef = `${paymentMethod}-${Math.floor(1000000000 + Math.random() * 9000000000)}`;

    setBills((prev) =>
      prev.map((b) => {
        if (b.id === billId) {
          // Update flat's outstanding dues
          setFlats((prevFlats) =>
            prevFlats.map((f) =>
              f.flatNumber === b.flatNumber &&
              (!b.societyName || f.societyName === b.societyName)
                ? { ...f, outstandingDues: Math.max(0, f.outstandingDues - b.totalAmount) }
                : f
            )
          );
          return {
            ...b,
            status: 'paid',
            paidDate: todayStr,
            paymentMethod,
            transactionRef: txnRef,
          };
        }
        return b;
      })
    );
  };

  const createBill = (data: Omit<MaintenanceBill, 'id' | 'status'>) => {
    const newBill: MaintenanceBill = {
      ...data,
      societyName: data.societyName || flats.find((flat) =>
        flat.flatNumber.toUpperCase() === data.flatNumber.toUpperCase() &&
        flat.societyName === currentSocietyName
      )?.societyName || currentSocietyName,
      id: `BILL-${Date.now().toString().slice(-6)}`,
      status: 'pending',
    };
    setBills((prev) => [newBill, ...prev]);

    // Update flat dues
    setFlats((prevFlats) =>
      prevFlats.map((f) =>
        f.flatNumber === data.flatNumber &&
        (!newBill.societyName || f.societyName === newBill.societyName)
          ? { ...f, outstandingDues: f.outstandingDues + data.totalAmount }
          : f
      )
    );
  };

  const addExpense = (data: Omit<SocietyExpense, 'id'>) => {
    const newExp: SocietyExpense = {
      ...data,
      societyName: currentSocietyName,
      id: `EXP-${Date.now().toString().slice(-5)}`,
    };
    setExpenses((prev) => [newExp, ...prev]);
  };

  const addAmenity = (data: Omit<Amenity, 'id'>) => {
    setAmenities((prev) => [...prev, { ...data, societyName: currentSocietyName, id: `AM-${Date.now()}` }]);
  };

  const updateAmenity = (amenityId: string, updates: Partial<Omit<Amenity, 'id'>>) => {
    setAmenities((prev) => prev.map((amenity) => (
      amenity.id === amenityId ? { ...amenity, ...updates } : amenity
    )));
  };

  const deleteAmenity = (amenityId: string) => {
    setAmenities((prev) => prev.filter((amenity) => amenity.id !== amenityId));
  };

  const bookAmenity = (amenityId: string, date: string, timeSlot: string, guestsCount: number) => {
    const targetAmenity = amenities.find((a) => a.id === amenityId);
    if (!targetAmenity) return { success: false, message: 'Amenity not found.' };
    if (targetAmenity.isActive === false) return { success: false, message: 'This amenity is currently unavailable.' };

    // Check existing booking conflict
    const conflict = bookings.find(
      (b) => b.amenityId === amenityId && b.date === date && b.timeSlot === timeSlot &&
        b.status !== 'cancelled' && b.status !== 'rejected'
    );

    if (conflict) {
      return { success: false, message: 'Selected time slot is already booked by another resident.' };
    }

    const price = targetAmenity.hourlyRate;
    const newBooking: AmenityBooking = {
      id: `BK-${Math.floor(1000 + Math.random() * 9000)}`,
      societyName: targetAmenity.societyName || currentFlatObj.societyName || currentSocietyName,
      amenityId,
      amenityName: targetAmenity.name,
      flatNumber: activeFlat,
      residentName: currentFlatObj.ownerName,
      date,
      timeSlot,
      guestsCount,
      amountPaid: price,
      status: 'pending',
      bookingDate: new Date().toISOString().split('T')[0],
    };

    setBookings((prev) => [newBooking, ...prev]);
    return {
      success: true,
      message: `Your ${targetAmenity.name} booking request was sent to the society administrator for approval.`,
      booking: newBooking,
    };
  };

  const approveAmenityBooking = (bookingId: string): { success: boolean; message: string } => {
    if (role !== 'admin' || currentUser?.role !== 'admin') {
      return { success: false, message: 'Only a signed-in society administrator can approve amenity bookings.' };
    }
    const booking = bookings.find((item) => item.id === bookingId && item.societyName === currentSocietyName);
    if (!booking) return { success: false, message: 'Amenity booking was not found for this society.' };
    if (booking.status !== 'pending') return { success: false, message: 'This booking request is no longer awaiting approval.' };
    const confirmedConflict = bookings.some((item) =>
      item.id !== bookingId &&
      item.amenityId === booking.amenityId &&
      item.date === booking.date &&
      item.timeSlot === booking.timeSlot &&
      item.status !== 'cancelled' &&
      item.status !== 'rejected'
    );
    if (confirmedConflict) {
      return { success: false, message: 'This time slot has already been confirmed for another booking.' };
    }
    setBookings((previous) => previous.map((item) =>
      item.id === bookingId ? { ...item, status: 'confirmed' } : item
    ));
    return { success: true, message: `${booking.amenityName} booking for ${booking.residentName} approved.` };
  };

  const rejectAmenityBooking = (bookingId: string): { success: boolean; message: string } => {
    if (role !== 'admin' || currentUser?.role !== 'admin') {
      return { success: false, message: 'Only a signed-in society administrator can reject amenity bookings.' };
    }
    const booking = bookings.find((item) => item.id === bookingId && item.societyName === currentSocietyName);
    if (!booking) return { success: false, message: 'Amenity booking was not found for this society.' };
    if (booking.status !== 'pending') return { success: false, message: 'This booking request is no longer awaiting approval.' };
    setBookings((previous) => previous.map((item) =>
      item.id === bookingId ? { ...item, status: 'rejected' } : item
    ));
    return { success: true, message: `${booking.amenityName} booking request for ${booking.residentName} was rejected.` };
  };

  const cancelBooking = (bookingId: string) => {
    setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled' } : b)));
  };

  const saveGuardEventSecurityPlan = (
    plan: Pick<GuardEventSecurityPlan, 'eventId' | 'guestProtocol' | 'parkingPlan' | 'guardNotes' | 'status'> &
      Partial<Pick<GuardEventSecurityPlan, 'assignedGuardCount' | 'assignedGuardIds' | 'assignedGuardNames' | 'entryGate' | 'parkingArea'>>
  ): { success: boolean; message: string } => {
    const isAdmin = role === 'admin' && currentUser?.role === 'admin';
    if (!isAdmin) {
      return { success: false, message: 'Only a signed-in society administrator can confirm event security plans.' };
    }
    if (
      !plan.eventId ||
      !plan.guestProtocol.trim() ||
      !plan.parkingPlan.trim() ||
      !plan.entryGate?.trim() ||
      !plan.parkingArea?.trim()
    ) {
      return { success: false, message: 'Select the event entrance and parking area, and add guest-entry and parking instructions.' };
    }
    const assignedGuardIds = [...new Set(plan.assignedGuardIds || [])];
    const assignedGuards = users.filter((user) => assignedGuardIds.includes(user.id) && user.role === 'guard' && user.guardStatus !== 'inactive');
    if (assignedGuards.length < 1) {
      return { success: false, message: 'Assign at least one active guard before confirming the event.' };
    }
    const isKnownSocietyEvent = plan.eventId.startsWith('notice:')
      ? notices.some((notice) => `notice:${notice.id}` === plan.eventId && notice.category === 'Event')
      : plan.eventId.startsWith('booking:')
        ? bookings.some((booking) => `booking:${booking.id}` === plan.eventId && booking.status === 'confirmed')
        : false;
    if (!isKnownSocietyEvent) {
      return { success: false, message: 'The selected society event was not found or is no longer active.' };
    }

    const updatedPlan: GuardEventSecurityPlan = {
      ...plan,
      guestProtocol: plan.guestProtocol.trim(),
      parkingPlan: plan.parkingPlan.trim(),
      guardNotes: plan.guardNotes.trim(),
      assignedGuardCount: assignedGuards.length,
      assignedGuardIds: assignedGuards.map((guard) => guard.id),
      assignedGuardNames: assignedGuards.map((guard) => guard.name),
      entryGate: plan.entryGate.trim(),
      parkingArea: plan.parkingArea.trim(),
      updatedBy: currentUser.name,
      updatedAt: new Date().toISOString(),
    };

    setGuardEventSecurityPlans((previous) => [
      updatedPlan,
      ...previous.filter((existing) => existing.eventId !== updatedPlan.eventId),
    ]);
    return { success: true, message: 'Admin confirmation saved. Assigned guards and residents can now see the final event details.' };
  };

  const submitComplaint = (data: Omit<ComplaintTicket, 'id' | 'createdAt' | 'status' | 'flatNumber' | 'residentName'>) => {
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const newTkt: ComplaintTicket = {
      id: `TKT-${Math.floor(100 + Math.random() * 900)}`,
      flatNumber: activeFlat,
      residentName: currentFlatObj.ownerName,
      createdAt: nowStr,
      status: 'open',
      ...data,
      societyName: currentFlatObj.societyName || currentSocietyName,
    };
    setComplaints((prev) => [newTkt, ...prev]);
  };

  const updateComplaintStatus = (
    ticketId: string,
    status: 'open' | 'in_progress' | 'resolved',
    assignedTo?: string,
    notes?: string
  ) => {
    setComplaints((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              status,
              assignedTo: assignedTo ?? t.assignedTo,
              resolutionNotes: notes ?? t.resolutionNotes,
            }
          : t
      )
    );
  };

  const addNotice = (data: Omit<SocietyNotice, 'id' | 'date'>) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const newNotice: SocietyNotice = {
      id: `NOT-${Math.floor(100 + Math.random() * 900)}`,
      date: todayStr,
      ...data,
      societyName: currentSocietyName,
    };
    setNotices((prev) => [newNotice, ...prev]);
  };

  const sendGuardChatMessage = (message: string): { success: boolean; message: string } => {
    const text = message.trim();
    if (!text) return { success: false, message: 'Enter a message before sending.' };
    if (role !== 'guard' || currentUser?.role !== 'guard') {
      return { success: false, message: 'Only signed-in guards can send messages in this chat.' };
    }

    const userShift = shiftLogs.find((shift) =>
      shift.status === 'active' &&
      ((currentUser.badgeId && shift.guardBadgeId === currentUser.badgeId) ||
        shift.guardName.trim().toLowerCase() === currentUser.name.trim().toLowerCase())
    );
    const newMessage: GuardChatMessage = {
      id: `GCHAT-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      guardName: currentUser.name,
      badgeId: currentUser.badgeId,
      gateStation: userShift?.gateStation || currentUser.assignedGate || 'Gate not recorded',
      message: text,
      sentAt: new Date().toISOString(),
    };

    setGuardChatMessages((previous) => [...previous, newMessage]);
    return { success: true, message: 'Message sent to the guard team.' };
  };

  const deleteNotice = (noticeId: string) => {
    setNotices((prev) => prev.filter((n) => n.id !== noticeId));
  };

  const toggleStaffAttendance = (staffId: string) => {
    const updatedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setStaff((prev) =>
      prev.map((s) => {
        if (s.id === staffId) {
          const nextPresent = !s.isPresentToday;
          return {
            ...s,
            isPresentToday: nextPresent,
            checkInTime: nextPresent ? updatedTime : undefined,
          };
        }
        return s;
      })
    );
  };

  const addSocietyStaff = (data: {
    firstName: string;
    lastName: string;
    role: string;
    phone: string;
    whatsappNumber?: string;
    address: string;
    maritalStatus: 'married' | 'single';
    spouseName?: string;
    identityProofType: string;
    identityNumber?: string;
    identityPhotoUrl: string;
    assignedDuties: string;
  }): { success: boolean; message: string; staff?: DailyStaff } => {
    if (role !== 'admin' || currentUser?.role !== 'admin') {
      return { success: false, message: 'Only a signed-in administrator can add society staff or assign duties.' };
    }

    const firstName = data.firstName.trim().replace(/\s+/g, ' ');
    const lastName = data.lastName.trim().replace(/\s+/g, ' ');
    const roleName = data.role.trim().replace(/\s+/g, ' ');
    const phone = data.phone.trim();
    const whatsappNumber = data.whatsappNumber?.trim() || '';
    const address = data.address.trim().replace(/\s+/g, ' ');
    const spouseName = data.spouseName?.trim().replace(/\s+/g, ' ') || '';
    const assignedDuties = data.assignedDuties.trim().replace(/\s+/g, ' ');

    if (firstName.length < 2 || firstName.length > 60 || lastName.length < 1 || lastName.length > 60) {
      return { success: false, message: 'Enter the staff member’s first and last name.' };
    }
    if (roleName.length < 2 || roleName.length > 80) {
      return { success: false, message: 'Enter the staff member’s job title.' };
    }
    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length < 10 || phoneDigits.length > 15) {
      return { success: false, message: 'Enter a valid mobile number (10–15 digits).' };
    }
    const whatsappDigits = whatsappNumber.replace(/\D/g, '');
    if (whatsappNumber && (whatsappDigits.length < 10 || whatsappDigits.length > 15)) {
      return { success: false, message: 'Enter a valid WhatsApp number or leave it blank.' };
    }
    if (address.length < 5 || address.length > 300 || assignedDuties.length < 3 || assignedDuties.length > 500) {
      return { success: false, message: 'Enter the staff member’s address and assigned duties.' };
    }
    if (data.maritalStatus === 'married' && (spouseName.length < 2 || spouseName.length > 120)) {
      return { success: false, message: 'Enter the husband or wife’s name for a married staff member.' };
    }
    if (!data.identityProofType.trim() || !data.identityPhotoUrl) {
      return { success: false, message: 'Select an ID proof type and upload its photo.' };
    }

    const name = `${firstName} ${lastName}`;
    if (staff.some((person) => person.phone.replace(/\D/g, '') === phoneDigits && person.name.toLowerCase() === name.toLowerCase())) {
      return { success: false, message: 'This staff member is already registered.' };
    }
    const newStaff: DailyStaff = {
      id: `ST-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      societyName: currentSocietyName,
      name,
      firstName,
      lastName,
      role: roleName,
      phone,
      ...(whatsappNumber ? { whatsappNumber } : {}),
      address,
      maritalStatus: data.maritalStatus,
      ...(data.maritalStatus === 'married' ? { spouseName } : {}),
      identityProofType: data.identityProofType.trim(),
      ...(data.identityNumber?.trim() ? { identityNumber: data.identityNumber.trim() } : {}),
      identityPhotoUrl: data.identityPhotoUrl,
      assignedDuties,
      rating: 0,
      flatsAssigned: [],
      isPresentToday: false,
    };
    const updatedStaff = [newStaff, ...staff];
    try {
      localStorage.setItem('mygate_staff', JSON.stringify(updatedStaff));
    } catch (error) {
      console.error('Unable to save society staff in browser storage.', error);
      return { success: false, message: 'Could not save the staff record. Free up browser storage and try a smaller ID photo.' };
    }
    setStaff(updatedStaff);
    return { success: true, message: `${name} has been added to the society staff roster.`, staff: newStaff };
  };

  const triggerSOS = (type: 'Medical' | 'Fire' | 'Security Threat' | 'Lift Trapped' | 'Panic Alert (Silent)' | 'Intrusion') => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const targetFlat = currentFlatObj;
    const newSOS: EmergencyAlert = {
      id: `SOS-${Date.now().toString().slice(-4)}`,
      flatNumber: activeFlat,
      residentName: targetFlat.ownerName,
      phone: targetFlat.phone,
      wing: targetFlat.wing,
      floor: targetFlat.floor,
      emergencyContacts: targetFlat.emergencyContacts,
      type,
      isSilentPanic: type === 'Panic Alert (Silent)',
      triggeredAt: nowTime,
      status: 'active',
    };
    setSosAlerts((prev) => [newSOS, ...prev]);
  };

  const triggerPanicAlert = (notes?: string): EmergencyAlert => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const targetFlat = currentFlatObj;
    const panicAlert: EmergencyAlert = {
      id: `PANIC-${Date.now().toString().slice(-4)}`,
      flatNumber: activeFlat,
      residentName: targetFlat.ownerName,
      phone: targetFlat.phone,
      wing: targetFlat.wing,
      floor: targetFlat.floor,
      emergencyContacts: targetFlat.emergencyContacts || [],
      type: 'Panic Alert (Silent)',
      isSilentPanic: true,
      notes: notes || 'Resident initiated silent duress panic alarm. Immediate gate response required.',
      triggeredAt: nowTime,
      status: 'active',
    };

    setSosAlerts((prev) => [panicAlert, ...prev]);

    // Also persist in localStorage
    try {
      const currentAlerts = JSON.parse(localStorage.getItem('mygate_sos') || '[]');
      localStorage.setItem('mygate_sos', JSON.stringify([panicAlert, ...currentAlerts]));
    } catch {
      // ignore
    }

    return panicAlert;
  };

  const dispatchGuardToEmergency = (alertId: string, guardName: string = 'Security Guard Desk (Gate 1)') => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setSosAlerts((prev) =>
      prev.map((s) => {
        if (s.id === alertId) {
          const currentGuards = s.dispatchedGuards || [];
          return {
            ...s,
            dispatchedGuards: [...currentGuards, guardName],
            dispatchedAt: nowTime,
          };
        }
        return s;
      })
    );
  };

  const resolveSOS = (alertId: string, resolutionNotes?: string) => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setSosAlerts((prev) =>
      prev.map((s) =>
        s.id === alertId
          ? {
              ...s,
              status: 'resolved',
              resolvedBy: 'Security Station Gate 1',
              resolvedAt: nowTime,
              notes: resolutionNotes ? `${s.notes ? s.notes + ' • ' : ''}Resolved: ${resolutionNotes}` : s.notes,
            }
          : s
      )
    );
  };

  const updateResidentProfile = (
    flatNumber: string,
    updatedData: {
      ownerName: string;
      phone: string;
      email: string;
      occupancyStatus: 'Owner' | 'Tenant' | 'Vacant';
      familyMembersCount: number;
      vehicles: { type: 'Car' | 'Bike'; number: string }[];
      emergencyContacts: EmergencyContact[];
    }
  ) => {
    setFlats((prev) =>
      prev.map((f) => {
        if (f.flatNumber === flatNumber) {
          return {
            ...f,
            ...updatedData,
          };
        }
        return f;
      })
    );

    // Also update ownerName in maintenance bills for this flat
    setBills((prev) =>
      prev.map((b) => (b.flatNumber === flatNumber ? { ...b, ownerName: updatedData.ownerName } : b))
    );

    return { success: true, message: `Profile details for Flat ${flatNumber} updated successfully!` };
  };

  const startGuardShift = (data: {
    guardName: string;
    guardBadgeId: string;
    gateStation: string;
    shiftType: 'Morning' | 'Afternoon' | 'Night' | 'Custom';
    startTime?: string;
  }): GuardShiftLog => {
    const now = new Date();
    const formattedTime =
      data.startTime ||
      now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    const formattedDate = now.toISOString().split('T')[0];

    const newShift: GuardShiftLog = {
      id: `SHIFT-${Date.now().toString().slice(-6)}`,
      guardName: data.guardName,
      guardBadgeId: data.guardBadgeId || 'SEC-01',
      gateStation: data.gateStation || 'Main Gate 1',
      shiftType: data.shiftType || 'Morning',
      date: formattedDate,
      startTime: formattedTime,
      status: 'active',
      totalVisitorsProcessed: 0,
      deniedEntriesCount: 0,
      incidents: [],
    };

    // Close out any other currently active shift
    setShiftLogs((prev) => [
      newShift,
      ...prev.map((s) =>
        s.status === 'active'
          ? {
              ...s,
              status: 'handed_over' as const,
              endTime: formattedTime,
              handedOverTo: data.guardName,
            }
          : s
      ),
    ]);

    return newShift;
  };

  const endGuardShift = (
    shiftId: string,
    data: {
      endTime?: string;
      handoverNotes?: string;
      handedOverTo?: string;
    }
  ): { success: boolean; message: string; shift?: GuardShiftLog } => {
    const now = new Date();
    const formattedTime =
      data.endTime ||
      now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

    let updatedShift: GuardShiftLog | undefined;

    // Calculate processed visitors during this shift
    const currentVisitorsCount = visitors.length;
    const currentDeniedCount = visitors.filter((v) => v.status === 'denied').length;

    setShiftLogs((prev) =>
      prev.map((s) => {
        if (s.id === shiftId) {
          updatedShift = {
            ...s,
            endTime: formattedTime,
            status: data.handedOverTo ? 'handed_over' : 'completed',
            handoverNotes: data.handoverNotes || s.handoverNotes,
            handedOverTo: data.handedOverTo || s.handedOverTo,
            totalVisitorsProcessed: currentVisitorsCount,
            deniedEntriesCount: currentDeniedCount,
          };
          return updatedShift;
        }
        return s;
      })
    );

    return {
      success: true,
      message: `Shift #${shiftId} successfully concluded at ${formattedTime}.`,
      shift: updatedShift,
    };
  };

  const logShiftIncident = (incidentData: {
    shiftId?: string;
    guardName?: string;
    guardBadgeId?: string;
    gateStation?: string;
    shiftType?: GuardShiftLog['shiftType'];
    severity: ShiftIncidentSeverity;
    category: ShiftIncidentCategory;
    title: string;
    description: string;
    location: string;
    actionTaken: string;
    reportedBy?: string;
    flatNumber?: string;
    vehicleNumber?: string;
  }): ShiftIncident => {
    const now = new Date();
    const timestampStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    const dateStr = now.toISOString().split('T')[0];

    const matchingGuardShift = incidentData.guardBadgeId
      ? shiftLogs.find((shift) =>
          shift.status === 'active' &&
          shift.guardBadgeId === incidentData.guardBadgeId
        )
      : incidentData.guardName
        ? shiftLogs.find((shift) =>
            shift.status === 'active' &&
            shift.guardName.trim().toLowerCase() === incidentData.guardName?.trim().toLowerCase()
          )
        : undefined;
    const activeOrFirstShift = incidentData.guardBadgeId || incidentData.guardName
      ? matchingGuardShift
      : shiftLogs.find((s) => s.status === 'active') || shiftLogs[0];
    const targetShiftId =
      incidentData.shiftId ||
      activeOrFirstShift?.id ||
      `SHIFT-${incidentData.guardBadgeId || Date.now().toString().slice(-6)}-${dateStr}`;

    const newIncident: ShiftIncident = {
      id: `INC-${Math.floor(100 + Math.random() * 900)}`,
      shiftId: targetShiftId,
      timestamp: timestampStr,
      date: dateStr,
      severity: incidentData.severity,
      category: incidentData.category,
      title: incidentData.title,
      description: incidentData.description,
      location: incidentData.location,
      actionTaken: incidentData.actionTaken,
      reportedBy: incidentData.reportedBy || incidentData.guardName || activeOrFirstShift?.guardName || 'Security Guard',
      resolved: false,
      flatNumber: incidentData.flatNumber,
      vehicleNumber: incidentData.vehicleNumber,
    };

    setShiftLogs((prev) => {
      const exists = prev.some((s) => s.id === targetShiftId);
      if (exists) {
        return prev.map((s) => {
          if (s.id === targetShiftId) {
            return {
              ...s,
              incidents: [newIncident, ...s.incidents],
            };
          }
          return s;
        });
      } else {
        // Create an active shift if none exists
        const adHocShift: GuardShiftLog = {
          id: targetShiftId,
          guardName: incidentData.guardName || incidentData.reportedBy || 'Duty Guard Officer',
          guardBadgeId: incidentData.guardBadgeId || 'Not recorded',
          gateStation: incidentData.gateStation || 'Gate not recorded',
          shiftType: incidentData.shiftType || 'Custom',
          date: dateStr,
          startTime: timestampStr,
          status: 'active',
          incidents: [newIncident],
        };
        return [adHocShift, ...prev];
      }
    });

    return newIncident;
  };

  const updateShiftIncident = (incidentId: string, updates: Partial<ShiftIncident>) => {
    setShiftLogs((prev) =>
      prev.map((s) => ({
        ...s,
        incidents: s.incidents.map((inc) => {
          if (inc.id === incidentId) {
            return {
              ...inc,
              ...updates,
            };
          }
          return inc;
        }),
      }))
    );
  };

  const deleteShiftIncident = (incidentId: string) => {
    setShiftLogs((prev) =>
      prev.map((s) => ({
        ...s,
        incidents: s.incidents.filter((inc) => inc.id !== incidentId),
      }))
    );
  };

  // Auth Operations
  const loginResident = (credentials: { emailOrFlat: string; password?: string }) => {
    const term = credentials.emailOrFlat.trim().toLowerCase();
    let matched = users.find(
      (u) =>
        u.role === 'resident' &&
        (u.username?.toLowerCase() === term ||
          u.email.toLowerCase() === term ||
          u.phone?.replace(/\D/g, '') === term.replace(/\D/g, '') ||
          (u.flatNumber && u.flatNumber.toLowerCase() === term) ||
          u.name.toLowerCase() === term)
    );

    // If not found in users table, but exists in registered flats:
    if (!matched) {
      const flat = flats.find((f) => f.flatNumber.toLowerCase() === term || f.email.toLowerCase() === term);
      if (flat) {
        matched = {
          id: `usr-res-${Date.now()}`,
          name: flat.ownerName,
          email: flat.email,
          phone: flat.phone,
          role: 'resident',
          flatNumber: flat.flatNumber,
          societyName: flat.societyName,
          wing: flat.wing,
          occupancyStatus: flat.occupancyStatus === 'Vacant' ? 'Owner' : flat.occupancyStatus,
          familyMembersCount: flat.familyMembersCount,
          vehicleNumber: flat.vehicles[0]?.number,
          createdAt: new Date().toISOString(),
        };
        setUsers((prev) => [...prev, matched!]);
      }
    }

    if (!matched) {
      return {
        success: false,
        message: `No registered resident account found for "${credentials.emailOrFlat}". Please check the username, phone, email, or flat number.`,
      };
    }

    if (matched.password && credentials.password !== undefined && matched.password !== credentials.password) {
      return { success: false, message: 'Incorrect password. Please check your password and try again.' };
    }

    setRole('resident');
    if (matched.flatNumber) {
      setActiveFlat(matched.flatNumber);
    }
    const residentFlat = flats.find((flat) =>
      flat.flatNumber.toLowerCase() === matched!.flatNumber?.toLowerCase() &&
      (matched!.email ? flat.email.toLowerCase() === matched!.email.toLowerCase() : flat.ownerName === matched!.name)
    ) || flats.find((flat) => flat.flatNumber.toLowerCase() === matched!.flatNumber?.toLowerCase());
    const residentSocietyName = residentFlat?.societyName || matched.societyName;
    if (residentSocietyName) {
      matched = { ...matched, societyName: residentSocietyName };
      setUsers((previous) => previous.map((user) =>
        user.id === matched!.id ? { ...user, societyName: residentSocietyName } : user
      ));
      setCurrentSocietyName(residentSocietyName);
    }
    setCurrentUser(matched);
    return {
      success: true,
      message: `Welcome back, ${matched.name}! Authenticated for Flat ${matched.flatNumber}.`,
      user: matched,
    };
  };

  const registerResident = (data: {
    name: string;
    email?: string;
    phone: string;
    flatNumber: string;
    wing?: string;
    occupancyStatus?: 'Owner' | 'Tenant';
    familyMembersCount?: number;
    vehicleNumber?: string;
    password?: string;
  }) => {
    const cleanFlat = data.flatNumber.trim().toUpperCase();
    const normalizedEmail = data.email?.trim().toLowerCase();

    if (!normalizedEmail) {
      return {
        success: false,
        message: 'Resident email is required to register an account.',
      };
    }

    const existing = users.find(
      (u) => u.email.toLowerCase() === normalizedEmail && u.role === 'resident'
    );
    if (existing) {
      return {
        success: false,
        message: `An account with email ${normalizedEmail} already exists. Please sign in instead.`,
      };
    }

    const wing = data.wing || `${cleanFlat.charAt(0) || 'B'} Wing`;
    const newUser: AuthUser = {
      id: `usr-res-${Date.now()}`,
      name: data.name.trim(),
      email: normalizedEmail,
      phone: data.phone.trim(),
      role: 'resident',
      flatNumber: cleanFlat,
      societyName: currentSocietyName,
      wing,
      occupancyStatus: data.occupancyStatus || 'Owner',
      familyMembersCount: data.familyMembersCount || 2,
      vehicleNumber: data.vehicleNumber?.trim(),
      password: data.password || 'resident123',
      createdAt: new Date().toISOString(),
    };

    // Ensure flat exists in flats directory
    const existingFlatIndex = flats.findIndex(
      (flat) => flat.flatNumber.toLowerCase() === cleanFlat.toLowerCase() && flat.societyName === currentSocietyName
    );
    if (existingFlatIndex === -1) {
      const newFlat: FlatDetail = {
        flatNumber: cleanFlat,
        societyName: currentSocietyName,
        wing,
        floor: parseInt(cleanFlat.replace(/\D/g, '').charAt(0) || '1', 10),
        ownerName: data.name.trim(),
        occupancyStatus: data.occupancyStatus || 'Owner',
        phone: data.phone.trim(),
        email: normalizedEmail,
        vehicles: data.vehicleNumber ? [{ type: 'Car', number: data.vehicleNumber.trim() }] : [],
        familyMembersCount: data.familyMembersCount || 2,
        outstandingDues: 0,
        emergencyContacts: [],
      };
      setFlats((prev) => [newFlat, ...prev]);
    }

    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    setRole('resident');
    setActiveFlat(cleanFlat);

    return {
      success: true,
      message: `Resident account registered successfully! Welcome to Emerald Palms, ${newUser.name}.`,
      user: newUser,
    };
  };

  const loginGuard = (credentials: { badgeIdOrPhone: string; pin?: string }) => {
    const term = credentials.badgeIdOrPhone.trim().toLowerCase();
    const guardUser = users.find(
      (u) =>
        u.role === 'guard' &&
        ((u.badgeId && u.badgeId.toLowerCase() === term) ||
          (u.phone && u.phone.includes(term)) ||
          u.name.toLowerCase().includes(term) ||
          u.email.toLowerCase() === term)
    );

    if (!guardUser) {
      return {
        success: false,
        message: `Security officer badge ID or credentials "${credentials.badgeIdOrPhone}" not found in duty roster.`,
      };
    }

    if (guardUser.guardStatus === 'inactive') {
      return {
        success: false,
        message: `Security officer ${guardUser.name} is inactive. Contact an administrator for access.`,
      };
    }

    setCurrentUser(guardUser);
    setRole('guard');

    // Ensure there is an active duty shift for this guard if none exists
    const currentActiveShift = shiftLogs.find((s) => s.status === 'active');
    if (!currentActiveShift) {
      startGuardShift({
        guardName: guardUser.name,
        guardBadgeId: guardUser.badgeId || 'GRD-701',
        gateStation: guardUser.assignedGate || 'Main Gate 1',
        shiftType: guardUser.shiftType || 'Morning',
      });
    }

    return {
      success: true,
      message: `Officer ${guardUser.name} (${guardUser.badgeId || 'Gate Duty'}) verified. Security Terminal unlocked.`,
      user: guardUser,
    };
  };

  const createGuard = (data: {
    name: string;
    phone: string;
    email?: string;
    badgeId: string;
    assignedGate: string;
    shiftType: 'Morning' | 'Afternoon' | 'Night' | 'Custom';
    assignedDuty: string;
    guardStatus?: 'active' | 'inactive';
    avatarUrl?: string;
    joiningDate: string;
    endDate?: string;
    employmentType: 'Full-time' | 'Part-time' | 'Contract';
    dateOfBirth?: string;
    gender?: string;
    bloodGroup?: string;
    address?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    identityProofType?: string;
    identityNumber?: string;
    guardNotes?: string;
    guardDocuments?: string[];
  }) => {
    const cleanBadge = data.badgeId.trim().toUpperCase();
    if (users.some((user) => user.role === 'guard' && user.badgeId?.toUpperCase() === cleanBadge)) {
      return { success: false, message: `Badge ID ${cleanBadge} is already assigned to a guard.` };
    }

    const emailBadge = cleanBadge.toLowerCase().replace(/[^a-z0-9]+/g, '.');
    const cleanEmail = data.email?.trim().toLowerCase() || `${emailBadge}@security.emerald.org`;
    if (users.some((user) => user.email.toLowerCase() === cleanEmail)) {
      return { success: false, message: `Email address ${cleanEmail} is already assigned to an account.` };
    }
    const guard: AuthUser = {
      id: `usr-grd-${Date.now()}`,
      name: data.name.trim(),
      email: cleanEmail,
      phone: data.phone.trim(),
      role: 'guard',
      societyName: currentSocietyName,
      password: 'guard123',
      badgeId: cleanBadge,
      assignedGate: data.assignedGate.trim(),
      shiftType: data.shiftType,
      assignedDuty: data.assignedDuty.trim(),
      guardStatus: data.guardStatus || 'active',
      avatarUrl: data.avatarUrl,
      joiningDate: data.joiningDate,
      endDate: data.endDate,
      employmentType: data.employmentType,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      bloodGroup: data.bloodGroup,
      address: data.address,
      emergencyContactName: data.emergencyContactName,
      emergencyContactPhone: data.emergencyContactPhone,
      identityProofType: data.identityProofType,
      identityNumber: data.identityNumber,
      guardNotes: data.guardNotes,
      guardDocuments: data.guardDocuments || [],
      createdAt: new Date().toISOString(),
    };

    setUsers((prev) => [...prev, guard]);
    return { success: true, message: `${guard.name} was added to the guard roster.`, guard };
  };

  const updateGuard = (
    guardId: string,
    updates: Partial<Pick<AuthUser, 'name' | 'phone' | 'email' | 'assignedGate' | 'shiftType' | 'assignedDuty' | 'guardStatus' |
      'avatarUrl' | 'joiningDate' | 'endDate' | 'employmentType' | 'dateOfBirth' | 'gender' | 'bloodGroup' | 'address' |
      'emergencyContactName' | 'emergencyContactPhone' | 'identityProofType' | 'identityNumber' | 'guardNotes' | 'guardDocuments'>>
  ) => {
    const guard = users.find((user) => user.id === guardId && user.role === 'guard');
    if (!guard) {
      return { success: false, message: 'Guard could not be found in the roster.' };
    }

    const normalizedUpdates = {
      ...updates,
      ...(updates.name !== undefined ? { name: updates.name.trim() } : {}),
      ...(updates.phone !== undefined ? { phone: updates.phone.trim() } : {}),
      ...(updates.email !== undefined ? { email: updates.email.trim().toLowerCase() } : {}),
      ...(updates.assignedGate !== undefined ? { assignedGate: updates.assignedGate.trim() } : {}),
      ...(updates.assignedDuty !== undefined ? { assignedDuty: updates.assignedDuty.trim() } : {}),
    };
    if (updates.email && users.some((user) => user.id !== guardId && user.email.toLowerCase() === updates.email?.trim().toLowerCase())) {
      return { success: false, message: `Email address ${updates.email} is already assigned to another account.` };
    }
    setUsers((prev) => prev.map((user) => (user.id === guardId ? { ...user, ...normalizedUpdates } : user)));
    setCurrentUser((current) => (current?.id === guardId ? { ...current, ...normalizedUpdates } : current));

    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    setShiftLogs((prev) =>
      prev.map((shift) => {
        if (shift.guardBadgeId !== guard.badgeId || shift.status !== 'active') return shift;
        if (updates.guardStatus === 'inactive') {
          return {
            ...shift,
            status: 'completed',
            endTime: time,
            handoverNotes: shift.handoverNotes || 'Duty closed when the guard was deactivated by an administrator.',
          };
        }
        return {
          ...shift,
          guardName: normalizedUpdates.name || shift.guardName,
          gateStation: normalizedUpdates.assignedGate || shift.gateStation,
          shiftType: normalizedUpdates.shiftType || shift.shiftType,
        };
      })
    );

    return { success: true, message: `${guard.name}'s roster details were updated.` };
  };

  const registerGuard = (data: {
    name: string;
    phone?: string;
    badgeId: string;
    gateStation: string;
    shiftType?: 'Morning' | 'Afternoon' | 'Night' | 'Custom';
    pin?: string;
  }) => {
    const cleanBadge = data.badgeId.trim().toUpperCase();
    const existing = users.find((u) => u.badgeId?.toUpperCase() === cleanBadge);
    if (existing) {
      return {
        success: false,
        message: `Security Badge ID ${cleanBadge} is already issued to an active personnel.`,
      };
    }

    const newGuard: AuthUser = {
      id: `usr-grd-${Date.now()}`,
      name: data.name.trim(),
      email: `${cleanBadge.toLowerCase()}@security.emerald.org`,
      phone: data.phone?.trim() || '+1 (555) 019-0000',
      role: 'guard',
      societyName: currentSocietyName,
      badgeId: cleanBadge,
      assignedGate: data.gateStation || 'Main Gate 1',
      shiftType: data.shiftType || 'Morning',
      guardStatus: 'active',
      password: data.pin || 'guard123',
      createdAt: new Date().toISOString(),
    };

    setUsers((prev) => [...prev, newGuard]);
    setCurrentUser(newGuard);
    setRole('guard');

    startGuardShift({
      guardName: newGuard.name,
      guardBadgeId: cleanBadge,
      gateStation: data.gateStation || 'Main Gate 1',
      shiftType: data.shiftType || 'Morning',
    });

    return {
      success: true,
      message: `Security Officer ${newGuard.name} (${cleanBadge}) registered to ${data.gateStation}.`,
      user: newGuard,
    };
  };

  const loginAdmin = (credentials: {
    email?: string;
    adminAccessCodeOrPassword?: string;
  }) => {
    const term = (credentials.email || '').trim().toLowerCase();
    const adminUser = users.find(
      (u) =>
        u.role === 'admin' &&
        (u.email.toLowerCase() === term || u.name.toLowerCase().includes(term))
    );

    if (!adminUser) {
      return {
        success: false,
        message: `No administrator or committee member registered under "${credentials.email}".`,
      };
    }

    setCurrentUser(adminUser);
    setRole('admin');
    setActiveSidebarNav('dashboard');
    return {
      success: true,
      message: `Authenticated as ${adminUser.designation || 'Estate Administrator'}: ${adminUser.name}.`,
      user: adminUser,
    };
  };

  const registerAdmin = (data: {
    name: string;
    email: string;
    phone?: string;
    designation: string;
    adminAccessCode: string;
    password?: string;
  }) => {
    const expectedCode = 'EMERALD-ADMIN-2026';
    const provided = data.adminAccessCode.trim().toUpperCase();
    if (provided !== expectedCode && provided !== 'ADMIN123' && provided !== 'ADMIN') {
      return {
        success: false,
        message: 'Invalid Society Master Authorization Code. Use code EMERALD-ADMIN-2026 for onboarding.',
      };
    }

    const existing = users.find(
      (u) => u.email.toLowerCase() === data.email.trim().toLowerCase() && u.role === 'admin'
    );
    if (existing) {
      return {
        success: false,
        message: `An administrator account with email ${data.email} already exists.`,
      };
    }

    const newAdmin: AuthUser = {
      id: `usr-adm-${Date.now()}`,
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone?.trim() || '+1 (555) 019-8800',
      role: 'admin',
      designation: data.designation.trim() || 'Managing Committee Member',
      adminAccessCode: data.adminAccessCode.trim(),
      password: data.password || 'admin123',
      createdAt: new Date().toISOString(),
    };

    setUsers((prev) => [...prev, newAdmin]);
    setCurrentUser(newAdmin);
    setRole('admin');
    setActiveSidebarNav('dashboard');

    return {
      success: true,
      message: `Executive Administrator profile registered: ${newAdmin.name} (${newAdmin.designation}).`,
      user: newAdmin,
    };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('mygate_current_user');
  };

  const switchUserAccount = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (target) {
      setCurrentUser(target);
      setRole(target.role);
      if (target.role === 'admin') {
        setActiveSidebarNav('dashboard');
      }
      if (target.role === 'resident' && target.flatNumber) {
        setActiveFlat(target.flatNumber);
      }
    }
  };

  const resetToDefaultData = () => {
    localStorage.clear();
    setSocieties(INITIAL_SOCIETIES);
    setCurrentSocietyName(DEFAULT_SOCIETY_NAME);
    setFlats(INITIAL_FLATS);
    setVisitors(INITIAL_VISITORS);
    setDomesticWorkerPasses([]);
    setBills(INITIAL_BILLS);
    setExpenses(INITIAL_EXPENSES);
    setAmenities(INITIAL_AMENITIES);
    setBookings(INITIAL_BOOKINGS);
    setComplaints(INITIAL_COMPLAINTS);
    setNotices(INITIAL_NOTICES);
    setStaff(INITIAL_STAFF);
    setSosAlerts(INITIAL_SOS_ALERTS);
    setShiftLogs(INITIAL_SHIFT_LOGS);
    setUsers(INITIAL_USERS);
    setCurrentUser(null);
    setGuardChatMessages([]);
    setGuardEventSecurityPlans([]);
    setRole('resident');
    setActiveFlat('B-402');
    setIncomingCall(null);
  };

  return (
    <SocietyContext.Provider
      value={{
        role,
        setRole,
        activeFlat,
        setActiveFlat,
        currentUser,
        setCurrentUser,
        users,
        loginResident,
        registerResident,
        loginGuard,
        registerGuard,
        createGuard,
        updateGuard,
        loginAdmin,
        registerAdmin,
        logout,
        switchUserAccount,
        flats,
        societies,
        currentSocietyName,
        setCurrentSocietyName,
        addSociety,
        updateSocietyBankDetails,
        addApartment,
        updateApartmentAddress,
        markFlatVacant,
        visitors,
        domesticWorkerPasses,
        createDomesticWorkerPass,
        renewDomesticWorkerPass,
        revokeDomesticWorkerPass,
        verifyDomesticWorkerPass,
        recordDomesticWorkerGateAction,
        bills,
        expenses,
        amenities,
        addAmenity,
        updateAmenity,
        deleteAmenity,
        bookings,
        guardEventSecurityPlans,
        saveGuardEventSecurityPlan,
        complaints,
        notices,
        staff,
        sosAlerts,
        shiftLogs,
        guardChatMessages,
        sendGuardChatMessage,
        activeShift,
        incomingCall,
        setIncomingCall,
        startGuardShift,
        endGuardShift,
        logShiftIncident,
        updateShiftIncident,
        deleteShiftIncident,
        preApproveVisitor,
        verifyAndCheckInVisitor,
        verifyQRPassPayload,
        extendPassValidity,
        revokeVisitorPass,
        quickGateCheckIn,
        checkOutVisitor,
        approvePendingVisitor,
        denyPendingVisitor,
        updateVisitorStatus,
        deleteVisitorPass,
        addFlatWithMember,
        updateResidentProfile,
        deleteFlat,
        payBill,
        createBill,
        addExpense,
        bookAmenity,
        approveAmenityBooking,
        rejectAmenityBooking,
        cancelBooking,
        submitComplaint,
        updateComplaintStatus,
        addNotice,
        deleteNotice,
        toggleStaffAttendance,
        addSocietyStaff,
        triggerSOS,
        triggerPanicAlert,
        dispatchGuardToEmergency,
        resolveSOS,
        activeSidebarNav,
        setActiveSidebarNav,
        resetToDefaultData,
      }}
    >
      {children}
    </SocietyContext.Provider>
  );
};

export const useSociety = () => {
  const context = useContext(SocietyContext);
  if (!context) {
    throw new Error('useSociety must be used within a SocietyProvider');
  }
  return context;
};
