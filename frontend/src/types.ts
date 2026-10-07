export type UserRole = 'resident' | 'guard' | 'admin';

export type VisitorCategory = 'guest' | 'delivery' | 'cab' | 'staff' | 'service';
export type VisitorStatus = 'expected' | 'in_gate' | 'checked_out' | 'denied' | 'pending_approval';

export interface VisitorPass {
  id: string;
  flatNumber: string;
  residentName: string;
  visitorName: string;
  phone: string;
  category: VisitorCategory;
  companyOrRole?: string; // e.g. Swiggy, Uber, Maid, Plumber
  vehicleNumber?: string;
  passcode: string; // 6-digit OTP code
  expectedDate: string;
  expectedTimeSlot?: string;
  status: VisitorStatus;
  checkInTime?: string;
  checkOutTime?: string;
  approvedByResident?: boolean;
  deliveryInstruction?: 'leave_at_gate';
  notes?: string;
  entryGate?: string;
  // QR Pass details
  qrToken?: string;
  generatedAt?: string; // ISO String
  expiresAt?: string; // ISO String for time-limited pass
  validDurationHours?: number; // e.g. 2, 4, 8, 24
  isTimeLimited?: boolean;
  purpose?: string;
  eventId?: string;
  eventName?: string;
  societyName?: string;
  societyAddress?: string;
  eventPassCode?: string;
  eventEntryGate?: string;
  eventParkingArea?: string;
  eventGuestProtocol?: string;
  eventParkingPlan?: string;
}

export interface DomesticWorkerPass {
  id: string;
  flatNumber: string;
  residentName: string;
  workerName: string;
  firstName?: string;
  lastName?: string;
  workerPhone: string;
  whatsappNumber?: string;
  workType: string;
  workerAddress?: string;
  maritalStatus?: 'married' | 'single';
  spouseName?: string;
  idDocumentName?: string;
  idDocumentDataUrl?: string;
  passCode: string;
  status: 'active' | 'revoked';
  validFrom: string;
  validThrough: string;
  createdAt: string;
  renewedAt?: string;
  insideSociety: boolean;
  lastEntryAt?: string;
  lastExitAt?: string;
  lastEntryGate?: string;
}

export interface DomesticWorkerVerificationResult {
  success: boolean;
  message: string;
  worker?: DomesticWorkerPass;
}

export interface QRPassPayload {
  vpassId: string;
  token: string;
  code: string;
  flat: string;
  host: string;
  guest: string;
  exp: string;
  cat: VisitorCategory;
}

export interface QRVerificationResult {
  success: boolean;
  code: 'VALID' | 'EXPIRED' | 'ALREADY_USED' | 'DENIED' | 'NOT_FOUND' | 'INVALID_QR';
  message: string;
  pass?: VisitorPass;
  expiresInMinutes?: number;
}

export interface MaintenanceBill {
  id: string;
  societyName?: string;
  flatNumber: string;
  ownerName: string;
  monthYear: string; // e.g. "August 2026"
  dueDate: string;
  baseMaintenance: number;
  waterCharges: number;
  parkingCharges: number;
  clubhouseFee: number;
  lateFee: number;
  totalAmount: number;
  status: 'paid' | 'pending' | 'overdue';
  paidDate?: string;
  paymentMethod?: BillPaymentMethod;
  transactionRef?: string;
}

export type BillPaymentMethod = 'UPI' | 'Card' | 'NetBanking' | 'PhonePe' | 'Google Pay' | 'BHIM' | 'Super Money';

export interface SocietyExpense {
  id: string;
  societyName?: string;
  title: string;
  category: 'Security' | 'Maintenance & Repairs' | 'Utilities' | 'Gardening' | 'Elevator AMC' | 'Events' | 'Administrative';
  amount: number;
  date: string;
  paidTo: string;
  paymentMode: string;
  approvedBy: string;
  receiptNumber?: string;
  notes?: string;
}

export interface Amenity {
  id: string;
  societyName?: string;
  name: string;
  category: string;
  location: string;
  hourlyRate: number;
  isActive?: boolean;
  maxCapacity: number;
  image: string;
  availableSlots: string[];
  description: string;
}

export interface AmenityBooking {
  id: string;
  societyName?: string;
  amenityId: string;
  amenityName: string;
  flatNumber: string;
  residentName: string;
  date: string;
  timeSlot: string;
  guestsCount: number;
  amountPaid: number;
  status: 'confirmed' | 'cancelled';
  bookingDate: string;
}

export interface GuardEventSecurityPlan {
  eventId: string;
  guestProtocol: string;
  parkingPlan: string;
  entryGate?: string;
  parkingArea?: string;
  guardNotes: string;
  assignedGuardCount?: number;
  assignedGuardIds?: string[];
  assignedGuardNames?: string[];
  status: 'planning' | 'ready' | 'completed';
  updatedBy: string;
  updatedAt: string;
}

export interface ComplaintTicket {
  id: string;
  societyName?: string;
  flatNumber: string;
  residentName: string;
  category: 'Plumbing' | 'Electrical' | 'Elevator' | 'Security' | 'Noise/Disturbance' | 'Cleanliness' | 'Other';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved';
  createdAt: string;
  assignedTo?: string;
  resolutionNotes?: string;
}

export interface SocietyNotice {
  id: string;
  societyName?: string;
  title: string;
  category: 'General' | 'Maintenance' | 'Emergency' | 'Event' | 'Financial';
  content: string;
  date: string;
  author: string;
  isImportant: boolean;
}

export interface GuardChatMessage {
  id: string;
  guardName: string;
  badgeId?: string;
  gateStation: string;
  message: string;
  sentAt: string;
}

export interface DailyStaff {
  id: string;
  societyName?: string;
  name: string;
  firstName?: string;
  lastName?: string;
  role: string;
  phone: string;
  whatsappNumber?: string;
  address?: string;
  maritalStatus?: 'married' | 'single';
  spouseName?: string;
  identityProofType?: string;
  identityNumber?: string;
  identityPhotoUrl?: string;
  assignedDuties?: string;
  rating: number;
  flatsAssigned: string[];
  isPresentToday: boolean;
  checkInTime?: string;
  photoUrl?: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  alternatePhone?: string;
  bloodGroup?: string;
  medicalNotes?: string;
}

export interface FlatProfileDetails {
  fatherOrSpouseName?: string;
  dateOfBirth?: string;
  gender?: string;
  alternatePhone?: string;
  governmentIdLastFour?: string;
  occupation?: string;
  company?: string;
  ownershipType?: string;
  possessionDate?: string;
  moveInDate?: string;
  permanentAddress?: string;
  numberOfAdults?: number;
  numberOfChildren?: number;
  seniorCitizens?: number;
  pets?: string;
  notes?: string;
  specialInstructions?: string;
  parkingSlot?: string;
  currentDues?: number;
  previousDues?: number;
  lastPaymentDate?: string;
  lastPaymentAmount?: number;
  paymentStatus?: string;
  paymentMethod?: string;
  documents?: string[];
}

export interface FlatDetail {
  flatNumber: string;
  wing: string;
  floor: number;
  societyName?: string;
  flatType?: string;
  propertyAddress?: string;
  ownerName: string;
  occupancyStatus: 'Owner' | 'Tenant' | 'Vacant';
  phone: string;
  email: string;
  vehicles: { type: 'Car' | 'Bike'; number: string; makeModel?: string; color?: string; fastTag?: string }[];
  familyMembersCount: number;
  familyMembers?: FlatFamilyMember[];
  outstandingDues: number;
  emergencyContacts?: EmergencyContact[];
  profileDetails?: FlatProfileDetails;
}

export interface SocietyProfile {
  id: string;
  name: string;
  totalFlats: number;
  numberOfBlocks: number;
  wingBlock: string;
  floors: number;
  flatType: string;
  ownerName: string;
  mobileNumber: string;
  propertyAddress: string;
  createdAt: string;
  bankDetails?: SocietyBankDetails;
}

export interface SocietyBankDetails {
  accountHolderName: string;
  accountNumber: string;
  bankName: string;
  ifscCode: string;
  branchName: string;
  bankAddress: string;
  accountType: 'Savings' | 'Current';
  upiId?: string;
}

export interface FlatFamilyMember {
  id: string;
  name: string;
  relationship: string;
  age?: number;
  phone?: string;
}

export interface EmergencyAlert {
  id: string;
  flatNumber: string;
  residentName: string;
  phone?: string;
  wing?: string;
  floor?: number;
  emergencyContacts?: EmergencyContact[];
  type: 'Medical' | 'Fire' | 'Security Threat' | 'Lift Trapped' | 'Panic Alert (Silent)' | 'Intrusion';
  isSilentPanic?: boolean;
  notes?: string;
  dispatchedGuards?: string[];
  dispatchedAt?: string;
  triggeredAt: string;
  status: 'active' | 'resolved';
  resolvedBy?: string;
  resolvedAt?: string;
}

export type ShiftIncidentSeverity = 'low' | 'medium' | 'high' | 'critical';

export type ShiftIncidentCategory =
  | 'Security Breach'
  | 'Unauthorized Vehicle'
  | 'Noise / Disturbance'
  | 'Medical / SOS'
  | 'Gate Barrier Fault'
  | 'Suspicious Package'
  | 'Resident Dispute'
  | 'Staff Misconduct'
  | 'Lost & Found'
  | 'Other';

export interface ShiftIncident {
  id: string;
  shiftId: string;
  timestamp: string;
  date: string;
  severity: ShiftIncidentSeverity;
  category: ShiftIncidentCategory;
  title: string;
  description: string;
  location: string;
  actionTaken: string;
  reportedBy: string;
  resolved: boolean;
  resolvedAt?: string;
  resolutionNotes?: string;
  flatNumber?: string;
  vehicleNumber?: string;
}

export interface GuardShiftLog {
  id: string;
  guardName: string;
  guardBadgeId: string;
  gateStation: string;
  shiftType: 'Morning' | 'Afternoon' | 'Night' | 'Custom';
  date: string;
  startTime: string; // HH:MM or ISO
  endTime?: string; // HH:MM or ISO
  status: 'active' | 'completed' | 'handed_over';
  handoverNotes?: string;
  handedOverTo?: string;
  totalVisitorsProcessed?: number;
  deniedEntriesCount?: number;
  incidents: ShiftIncident[];
}

export type SidebarNavId =
  | 'search'
  | 'dashboard'
  | 'flats'
  | 'community'
  | 'notices'
  | 'chat'
  | 'helpdesk'
  | 'calendar'
  | 'staff'
  | 'deliveries'
  | 'accounting'
  | 'reports'
  | 'settings';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  password?: string;
  username?: string;
  // Resident details
  flatNumber?: string;
  societyName?: string;
  wing?: string;
  occupancyStatus?: 'Owner' | 'Tenant';
  familyMembersCount?: number;
  vehicleNumber?: string;
  // Guard details
  badgeId?: string;
  assignedGate?: string;
  shiftType?: 'Morning' | 'Afternoon' | 'Night' | 'Custom';
  assignedDuty?: string;
  guardStatus?: 'active' | 'inactive';
  joiningDate?: string;
  endDate?: string;
  employmentType?: 'Full-time' | 'Part-time' | 'Contract';
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
  // Admin details
  designation?: string;
  adminAccessCode?: string;
  avatarUrl?: string;
  createdAt: string;
}
