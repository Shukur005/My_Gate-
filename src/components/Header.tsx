import React, { useState } from 'react';
import { useSociety } from '../context/SocietyContext';
import {
  ChevronRight,
  AlertTriangle,
  RotateCcw,
  LogOut,
  HelpCircle,
  X,
  ChevronDown,
  Building2,
  Home,
  Shield,
  Phone,
  CheckCircle2,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    role,
    activeFlat,
    sosAlerts,
    triggerSOS,
    resetToDefaultData,
    currentUser,
    logout,
  } = useSociety();

  const [societyName, setSocietyName] = useState('Vedanta Niwas');
  const [financialYear, setFinancialYear] = useState('2025-2026');
  const [showFAQ, setShowFAQ] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

  const activeSOS = sosAlerts.filter((s) => s.status === 'active');

  const handleSignOut = () => {
    logout();
    setShowSignOutConfirm(false);
  };

  return (
    <>
      {/* Crisp, Professional White Header Matching MyGate ERP Screenshot */}
      <header className="bg-white border-b border-slate-200/90 text-slate-800 sticky top-0 z-40 shadow-xs select-none">
        <div className="w-full px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
          {/* Left: Expand button + Society Name as seen in screenshot */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              title="Expand / Collapse Navigation"
              className="w-7 h-7 rounded-full border border-slate-300 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:border-slate-400 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  {societyName}
                </span>
                <select
                  value={societyName}
                  onChange={(e) => setSocietyName(e.target.value)}
                  className="text-[11px] text-slate-400 hover:text-slate-600 bg-transparent border-0 cursor-pointer focus:outline-none"
                >
                  <option value="Vedanta Niwas">Vedanta Niwas</option>
                  <option value="Emerald Palms Heights">Emerald Palms Heights</option>
                </select>
              </div>
              <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
                MyGate ERP Society Suite
              </p>
            </div>
          </div>

          {/* Center / Role Information for Resident Unit */}
          {role === 'resident' && (
            <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 text-xs">
              <span className="text-slate-500 font-medium">Apartment Unit:</span>
              <span className="text-slate-900 font-bold px-2 py-0.5">
                {activeFlat} ({currentUser?.name || 'Resident'})
              </span>
            </div>
          )}

          {/* Right Controls: Financial Year, FAQ, User Avatar, Sign Out */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Financial Year Selector (Exactly as in screenshot: 2025-2026 ▼ Financial Year) */}
            <div className="hidden sm:flex flex-col items-end text-right">
              <div className="flex items-center gap-1 text-xs font-bold text-slate-800 cursor-pointer">
                <span>{financialYear}</span>
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </div>
              <span className="text-[10px] text-slate-400 font-medium leading-none">
                Financial Year
              </span>
            </div>

            {/* FAQ Pill Button */}
            <button
              type="button"
              onClick={() => setShowFAQ(true)}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3 py-1 rounded-full shadow-xs transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>FAQ</span>
            </button>

            {/* Emergency SOS Alarm Indicator */}
            {activeSOS.length > 0 ? (
              <button
                onClick={() => triggerSOS('Security Threat')}
                className="bg-rose-600 hover:bg-rose-500 text-white text-xs px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 animate-pulse shadow-sm"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{activeSOS.length} SOS ACTIVE</span>
              </button>
            ) : (
              <button
                onClick={() => triggerSOS('Medical')}
                title="Trigger Emergency SOS Alert to Gate 1"
                className="hidden lg:flex items-center gap-1.5 text-xs text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                <span>Emergency SOS</span>
              </button>
            )}

            {/* User Profile Avatar Circle matching screenshot ("T" inside circle) */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div
                title={`Signed in as ${currentUser?.name || 'User'} (${role})`}
                className="w-8 h-8 rounded-full bg-slate-200/90 text-slate-700 border border-slate-300 flex items-center justify-center font-bold text-xs shadow-xs"
              >
                {currentUser?.name?.charAt(0) || (role === 'admin' ? 'T' : role === 'resident' ? 'R' : 'G')}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-slate-900 leading-tight">
                  {currentUser?.name || (role === 'admin' ? 'Society Admin' : 'Resident')}
                </div>
                <div className="text-[10px] text-slate-500 font-medium leading-none">
                  {role === 'admin' && (currentUser?.designation || 'Society Admin')}
                  {role === 'resident' && `Flat ${activeFlat} • Resident`}
                  {role === 'guard' && (currentUser?.badgeId || 'Security Officer')}
                </div>
              </div>
            </div>

            {/* Logout / Switch Portal */}
            <button
              onClick={handleSignOut}
              title="Sign Out to Login Portal"
              className="text-slate-500 hover:text-rose-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>

            {/* Reset Sample Data Button */}
            <button
              onClick={resetToDefaultData}
              title="Reset Sample Data"
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* ================= FAQ MODAL ================= */}
      {showFAQ && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center font-bold text-xs">
                  FAQ
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">MyGate ERP Knowledge Base & Help</h3>
                  <p className="text-[11px] text-slate-400">Frequently Asked Questions & Guidelines</p>
                </div>
              </div>
              <button
                onClick={() => setShowFAQ(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-700">
              <div className="space-y-1 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-900 text-sm">How do Amenity Groups work?</h4>
                <p className="text-slate-600">
                  Amenities (such as Tennis Courts, Guest Rooms, Swimming Pool, Clubhouse) can be grouped together based on defined rules or location in settings. Residents can reserve slots with automated confirmation.
                </p>
              </div>

              <div className="space-y-1 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-900 text-sm">What are Amenity Cancellation Charges?</h4>
                <p className="text-slate-600">
                  Rules can be set up for paid amenities to attract additional charges upon cancellation. These charges are auto-deducted from the booking amount refund.
                </p>
              </div>

              <div className="space-y-1 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-900 text-sm">How are Maintenance Bills calculated?</h4>
                <p className="text-slate-600">
                  Bills are automatically compiled on the 1st of each month with base maintenance (₹3,500), water utility, and parking bays. Receipts can be downloaded in PDF format instantly.
                </p>
              </div>

              <div className="space-y-1 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-900 text-sm">How does Gate Security QR Scanning work?</h4>
                <p className="text-slate-600">
                  When a resident generates a Pre-Approved Pass, a unique QR code and 6-digit OTP are created. The guard terminal scans the QR to verify identity and unlock the boom barrier.
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-100 border-t border-slate-200 text-right">
              <button
                onClick={() => setShowFAQ(false)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer"
              >
                Close FAQ
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
