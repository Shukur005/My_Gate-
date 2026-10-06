import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserRole,
  VisitorPass,
  VisitorCategory,
  MaintenanceBill,
  SocietyExpense,
  Amenity,
  AmenityBooking,
  ComplaintTicket,
  SocietyNotice,
  DailyStaff,
  FlatDetail,
  FlatProfileDetails,
  EmergencyAlert,
  EmergencyContact,
  QRVerificationResult,
  QRPassPayload,
  GuardShiftLog,
  ShiftIncident,
  ShiftIncidentCategory,
  ShiftIncidentSeverity,
  AuthUser,
  SidebarNavId,
} from '../types';
import {
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
  visitors: VisitorPass[];
  bills: MaintenanceBill[];
  expenses: SocietyExpense[];
  amenities: Amenity[];
  bookings: AmenityBooking[];
  complaints: ComplaintTicket[];
  notices: SocietyNotice[];
  staff: DailyStaff[];
  sosAlerts: EmergencyAlert[];
  shiftLogs: GuardShiftLog[];
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
  }) => VisitorPass;

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
  approvePendingVisitor: (visitorId: string) => void;
  denyPendingVisitor: (visitorId: string) => void;
  updateVisitorStatus: (visitorId: string, status: VisitorPass['status']) => void;
  deleteVisitorPass: (visitorId: string) => { success: boolean; message: string };

  addFlatWithMember: (data: {
    flatNumber: string;
    wing: string;
    floor: number;
    ownerName: string;
    occupancyStatus: 'Owner' | 'Tenant' | 'Vacant';
    phone: string;
    email: string;
    username: string;
    password: string;
    familyMembersCount: number;
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

  payBill: (billId: string, paymentMethod: 'UPI' | 'Card' | 'NetBanking') => void;
  createBill: (data: Omit<MaintenanceBill, 'id' | 'status'>) => void;

  addExpense: (data: Omit<SocietyExpense, 'id'>) => void;

  bookAmenity: (amenityId: string, date: string, timeSlot: string, guestsCount: number) => { success: boolean; message: string };
  cancelBooking: (bookingId: string) => void;

  submitComplaint: (data: Omit<ComplaintTicket, 'id' | 'createdAt' | 'status' | 'flatNumber' | 'residentName'>) => void;
  updateComplaintStatus: (ticketId: string, status: 'open' | 'in_progress' | 'resolved', assignedTo?: string, notes?: string) => void;

  addNotice: (data: Omit<SocietyNotice, 'id' | 'date'>) => void;
  deleteNotice: (noticeId: string) => void;

  toggleStaffAttendance: (staffId: string) => void;

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

  const [activeSidebarNav, setActiveSidebarNav] = useState<SidebarNavId>('accounting');

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

  // Load state from localStorage or initial fallback
  const [flats, setFlats] = useState<FlatDetail[]>(() => {
    const saved = localStorage.getItem('mygate_flats');
    return saved ? JSON.parse(saved) : INITIAL_FLATS;
  });

  const [visitors, setVisitors] = useState<VisitorPass[]>(() => {
    const saved = localStorage.getItem('mygate_visitors');
    return saved ? JSON.parse(saved) : INITIAL_VISITORS;
  });

  const [bills, setBills] = useState<MaintenanceBill[]>(() => {
    const saved = localStorage.getItem('mygate_bills');
    return saved ? JSON.parse(saved) : INITIAL_BILLS;
  });

  const [expenses, setExpenses] = useState<SocietyExpense[]>(() => {
    const saved = localStorage.getItem('mygate_expenses');
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [amenities] = useState<Amenity[]>(INITIAL_AMENITIES);

  const [bookings, setBookings] = useState<AmenityBooking[]>(() => {
    const saved = localStorage.getItem('mygate_bookings');
    return saved ? JSON.parse(saved) : INITIAL_BOOKINGS;
  });

  const [complaints, setComplaints] = useState<ComplaintTicket[]>(() => {
    const saved = localStorage.getItem('mygate_complaints');
    return saved ? JSON.parse(saved) : INITIAL_COMPLAINTS;
  });

  const [notices, setNotices] = useState<SocietyNotice[]>(() => {
    const saved = localStorage.getItem('mygate_notices');
    return saved ? JSON.parse(saved) : INITIAL_NOTICES;
  });

  const [staff, setStaff] = useState<DailyStaff[]>(() => {
    const saved = localStorage.getItem('mygate_staff');
    return saved ? JSON.parse(saved) : INITIAL_STAFF;
  });

  const [sosAlerts, setSosAlerts] = useState<EmergencyAlert[]>(() => {
    const saved = localStorage.getItem('mygate_sos');
    return saved ? JSON.parse(saved) : INITIAL_SOS_ALERTS;
  });

  const [shiftLogs, setShiftLogs] = useState<GuardShiftLog[]>(() => {
    const saved = localStorage.getItem('mygate_shift_logs');
    return saved ? JSON.parse(saved) : INITIAL_SHIFT_LOGS;
  });

  const activeShift = shiftLogs.find((s) => s.status === 'active') || null;

  const [incomingCall, setIncomingCall] = useState<IncomingGateCall | null>(null);

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem('mygate_flats', JSON.stringify(flats));
  }, [flats]);

  useEffect(() => {
    localStorage.setItem('mygate_visitors', JSON.stringify(visitors));
  }, [visitors]);

  useEffect(() => {
    localStorage.setItem('mygate_bills', JSON.stringify(bills));
  }, [bills]);

  useEffect(() => {
    localStorage.setItem('mygate_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('mygate_bookings', JSON.stringify(bookings));
  }, [bookings]);

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

  // Current Flat details
  const currentFlatObj = flats.find((f) => f.flatNumber === activeFlat) || flats[0];

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
  }): VisitorPass => {
    const passcode = generatePasscode();
    const duration = data.validDurationHours && data.validDurationHours > 0 ? data.validDurationHours : 6;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + duration * 60 * 60 * 1000).toISOString();
    const idNum = Math.floor(100 + Math.random() * 900);
    const passId = `VIS-${idNum}`;
    const qrToken = `QR-VPASS-${passcode}-${idNum}`;

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
    };

    setVisitors((prev) => [newPass, ...prev]);
    return newPass;
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

    // Search by passcode, qrToken, id, or normalized phone
    const target = visitors.find(
      (v) =>
        (v.qrToken && v.qrToken.toLowerCase() === query.toLowerCase()) ||
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

  const verifyAndCheckInVisitor = (passcodeOrToken: string, entryGate: string = 'Main Gate 1') => {
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
        visitor: { ...target, status: 'in_gate', checkInTime: updatedTime, entryGate: entryGate || 'Main Gate 1' },
        timestamp: updatedTime,
      });
    }

    return {
      success: true,
      code: 'VALID',
      message: `Verified & Checked In! Entry granted for ${target.visitorName} to Flat ${target.flatNumber} via ${entryGate || 'Main Gate 1'}.`,
      visitor: { ...target, status: 'in_gate', checkInTime: updatedTime, entryGate: entryGate || 'Main Gate 1' },
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

  const approvePendingVisitor = (visitorId: string) => {
    const updatedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setVisitors((prev) =>
      prev.map((v) =>
        v.id === visitorId ? { ...v, status: 'in_gate', checkInTime: updatedTime, approvedByResident: true } : v
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
    wing: string;
    floor: number;
    ownerName: string;
    occupancyStatus: 'Owner' | 'Tenant' | 'Vacant';
    phone: string;
    email: string;
    username: string;
    password: string;
    familyMembersCount: number;
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
    if (users.some((user) => user.username?.toLowerCase() === cleanUsername)) {
      return { success: false, message: `Username "${data.username.trim()}" is already in use. Please choose another.` };
    }
    if (cleanEmail && users.some((user) => user.email.toLowerCase() === cleanEmail)) {
      return { success: false, message: `Email address "${data.email.trim()}" is already in use. Please enter another.` };
    }
    const existing = flats.find((f) => f.flatNumber === formattedFlatNum);

    const totalMonthly =
      Number(data.monthlyMaintenance.baseMaintenance || 0) +
      Number(data.monthlyMaintenance.waterCharges || 0) +
      Number(data.monthlyMaintenance.parkingCharges || 0) +
      Number(data.monthlyMaintenance.clubhouseFee || 0);

    const autoGenBill = data.monthlyMaintenance.autoGenerateFirstBill !== false;

    const newFlatEntry: FlatDetail = {
      flatNumber: formattedFlatNum,
      wing: data.wing.toUpperCase().trim(),
      floor: Number(data.floor) || 1,
      ownerName: data.ownerName.trim(),
      occupancyStatus: data.occupancyStatus,
      phone: data.phone.trim(),
      email: cleanEmail || `${cleanUsername}@resident.mygate.org`,
      vehicles: data.vehicles || [],
      familyMembersCount: Number(data.familyMembersCount) || 1,
      outstandingDues: autoGenBill ? totalMonthly : 0,
      emergencyContacts: data.emergencyContacts || [],
      profileDetails: data.profileDetails,
    };

    if (existing) {
      // Update existing flat entry
      setFlats((prev) => prev.map((f) => (f.flatNumber === formattedFlatNum ? newFlatEntry : f)));
    } else {
      // Add new flat entry
      setFlats((prev) => [newFlatEntry, ...prev]);
    }

    if (data.occupancyStatus !== 'Vacant') {
      const residentUser: AuthUser = {
        id: `usr-res-${Date.now()}`,
        name: data.ownerName.trim(),
        username: cleanUsername,
        email: newFlatEntry.email,
        phone: data.phone.trim(),
        password: data.password,
        role: 'resident',
        flatNumber: formattedFlatNum,
        wing: newFlatEntry.wing,
        occupancyStatus: data.occupancyStatus,
        familyMembersCount: newFlatEntry.familyMembersCount,
        vehicleNumber: newFlatEntry.vehicles[0]?.number,
        createdAt: new Date().toISOString(),
      };
      setUsers((prev) => [...prev, residentUser]);
    }

    // Auto-generate first monthly maintenance bill if requested
    if (autoGenBill) {
      const monthStr = data.monthlyMaintenance.monthYear || 'August 2026';
      const dueStr = data.monthlyMaintenance.dueDate || '2026-08-10';

      const newBill: MaintenanceBill = {
        id: `BILL-${Date.now().toString().slice(-6)}`,
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

  const deleteFlat = (flatNumber: string) => {
    setFlats((prev) => prev.filter((f) => f.flatNumber !== flatNumber));
  };

  const payBill = (billId: string, paymentMethod: 'UPI' | 'Card' | 'NetBanking') => {
    const todayStr = new Date().toISOString().split('T')[0];
    const txnRef = `${paymentMethod}-${Math.floor(1000000000 + Math.random() * 9000000000)}`;

    setBills((prev) =>
      prev.map((b) => {
        if (b.id === billId) {
          // Update flat's outstanding dues
          setFlats((prevFlats) =>
            prevFlats.map((f) =>
              f.flatNumber === b.flatNumber
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
      id: `BILL-${Date.now().toString().slice(-6)}`,
      status: 'pending',
    };
    setBills((prev) => [newBill, ...prev]);

    // Update flat dues
    setFlats((prevFlats) =>
      prevFlats.map((f) =>
        f.flatNumber === data.flatNumber ? { ...f, outstandingDues: f.outstandingDues + data.totalAmount } : f
      )
    );
  };

  const addExpense = (data: Omit<SocietyExpense, 'id'>) => {
    const newExp: SocietyExpense = {
      ...data,
      id: `EXP-${Date.now().toString().slice(-5)}`,
    };
    setExpenses((prev) => [newExp, ...prev]);
  };

  const bookAmenity = (amenityId: string, date: string, timeSlot: string, guestsCount: number) => {
    const targetAmenity = amenities.find((a) => a.id === amenityId);
    if (!targetAmenity) return { success: false, message: 'Amenity not found.' };

    // Check existing booking conflict
    const conflict = bookings.find(
      (b) => b.amenityId === amenityId && b.date === date && b.timeSlot === timeSlot && b.status === 'confirmed'
    );

    if (conflict) {
      return { success: false, message: 'Selected time slot is already booked by another resident.' };
    }

    const price = targetAmenity.hourlyRate;
    const newBooking: AmenityBooking = {
      id: `BK-${Math.floor(1000 + Math.random() * 9000)}`,
      amenityId,
      amenityName: targetAmenity.name,
      flatNumber: activeFlat,
      residentName: currentFlatObj.ownerName,
      date,
      timeSlot,
      guestsCount,
      amountPaid: price,
      status: 'confirmed',
      bookingDate: new Date().toISOString().split('T')[0],
    };

    setBookings((prev) => [newBooking, ...prev]);
    return { success: true, message: `Booking confirmed for ${targetAmenity.name}!` };
  };

  const cancelBooking = (bookingId: string) => {
    setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled' } : b)));
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
    };
    setNotices((prev) => [newNotice, ...prev]);
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

  const triggerSOS = (type: 'Medical' | 'Fire' | 'Security Threat' | 'Lift Trapped' | 'Panic Alert (Silent)' | 'Intrusion') => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const targetFlat = flats.find((f) => f.flatNumber === activeFlat) || currentFlatObj;
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
    const targetFlat = flats.find((f) => f.flatNumber === activeFlat) || currentFlatObj;
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

    const activeOrFirstShift = shiftLogs.find((s) => s.status === 'active') || shiftLogs[0];
    const targetShiftId =
      incidentData.shiftId ||
      (activeOrFirstShift ? activeOrFirstShift.id : `SHIFT-${Date.now().toString().slice(-6)}`);

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
      reportedBy: incidentData.reportedBy || activeOrFirstShift?.guardName || 'Security Guard',
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
          guardName: incidentData.reportedBy || 'Duty Guard Officer',
          guardBadgeId: 'SEC-01',
          gateStation: 'Main Gate 1',
          shiftType: 'Morning',
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

    setCurrentUser(matched);
    setRole('resident');
    if (matched.flatNumber) {
      setActiveFlat(matched.flatNumber);
    }
    return {
      success: true,
      message: `Welcome back, ${matched.name}! Authenticated for Flat ${matched.flatNumber}.`,
      user: matched,
    };
  };

  const registerResident = (data: {
    name: string;
    email: string;
    phone: string;
    flatNumber: string;
    wing?: string;
    occupancyStatus?: 'Owner' | 'Tenant';
    familyMembersCount?: number;
    vehicleNumber?: string;
    password?: string;
  }) => {
    const cleanFlat = data.flatNumber.trim().toUpperCase();
    const existing = users.find(
      (u) => u.email.toLowerCase() === data.email.trim().toLowerCase() && u.role === 'resident'
    );
    if (existing) {
      return {
        success: false,
        message: `An account with email ${data.email} already exists. Please sign in instead.`,
      };
    }

    const wing = data.wing || `${cleanFlat.charAt(0) || 'B'} Wing`;
    const newUser: AuthUser = {
      id: `usr-res-${Date.now()}`,
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone.trim(),
      role: 'resident',
      flatNumber: cleanFlat,
      wing,
      occupancyStatus: data.occupancyStatus || 'Owner',
      familyMembersCount: data.familyMembersCount || 2,
      vehicleNumber: data.vehicleNumber?.trim(),
      password: data.password || 'resident123',
      createdAt: new Date().toISOString(),
    };

    // Ensure flat exists in flats directory
    const existingFlatIndex = flats.findIndex((f) => f.flatNumber.toLowerCase() === cleanFlat.toLowerCase());
    if (existingFlatIndex === -1) {
      const newFlat: FlatDetail = {
        flatNumber: cleanFlat,
        wing,
        floor: parseInt(cleanFlat.replace(/\D/g, '').charAt(0) || '1', 10),
        ownerName: data.name.trim(),
        occupancyStatus: data.occupancyStatus || 'Owner',
        phone: data.phone.trim(),
        email: data.email.trim().toLowerCase(),
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
    email: string;
    adminAccessCodeOrPassword?: string;
  }) => {
    const term = credentials.email.trim().toLowerCase();
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
      if (target.role === 'resident' && target.flatNumber) {
        setActiveFlat(target.flatNumber);
      }
    }
  };

  const resetToDefaultData = () => {
    localStorage.clear();
    setFlats(INITIAL_FLATS);
    setVisitors(INITIAL_VISITORS);
    setBills(INITIAL_BILLS);
    setExpenses(INITIAL_EXPENSES);
    setBookings(INITIAL_BOOKINGS);
    setComplaints(INITIAL_COMPLAINTS);
    setNotices(INITIAL_NOTICES);
    setStaff(INITIAL_STAFF);
    setSosAlerts(INITIAL_SOS_ALERTS);
    setShiftLogs(INITIAL_SHIFT_LOGS);
    setUsers(INITIAL_USERS);
    setCurrentUser(null);
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
        visitors,
        bills,
        expenses,
        amenities,
        bookings,
        complaints,
        notices,
        staff,
        sosAlerts,
        shiftLogs,
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
        cancelBooking,
        submitComplaint,
        updateComplaintStatus,
        addNotice,
        deleteNotice,
        toggleStaffAttendance,
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
