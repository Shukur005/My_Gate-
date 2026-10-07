
import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useSociety } from '../../context/SocietyContext';
import { VisitorPass } from '../../types';
import {
  Building,
  ShieldCheck,
  Clock,
  MapPin,
  Phone,
  User,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ArrowLeft,
  Share2,
  Navigation,
  Key,
  Car,
  Sparkles,
} from 'lucide-react';

interface GuestPassViewProps {
  passToken?: string;
  onExit?: () => void;
}

export const GuestPassView: React.FC<GuestPassViewProps> = ({ passToken, onExit }) => {
  const { visitors, flats } = useSociety();
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isExpired, setIsExpired] = useState(false);

  // Extract passToken from props or current URL
  const queryToken = passToken || (typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('vpass') : null);

  // Locate the pass
  const pass = visitors.find(
    (v) =>
      (queryToken && v.qrToken && v.qrToken.toLowerCase() === queryToken.toLowerCase()) ||
      (queryToken && v.id.toLowerCase() === queryToken.toLowerCase()) ||
      (queryToken && v.passcode === queryToken)
  ) || visitors[0]; // fallback to first visitor for demonstration if queryToken is invalid

  const flatObj = flats.find((f) => f.flatNumber === pass?.flatNumber);

  // Real-time Countdown calculation
  useEffect(() => {
    if (!pass?.expiresAt) {
      setTimeLeft('Valid for Scheduled Date');
      setIsExpired(false);
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      const expTime = new Date(pass.expiresAt!).getTime();
      const diffMs = expTime - now;

      if (diffMs <= 0) {
        setIsExpired(true);
        const passedMins = Math.abs(Math.round(diffMs / 60000));
        setTimeLeft(`Expired ${passedMins} mins ago`);
      } else {
        setIsExpired(false);
        const totalMins = Math.floor(diffMs / 60000);
        const hours = Math.floor(totalMins / 60);
        const mins = totalMins % 60;
        if (hours > 0) {
          setTimeLeft(`${hours}h ${mins}m remaining`);
        } else {
          setTimeLeft(`${mins}m remaining`);
        }
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 10000);
    return () => clearInterval(interval);
  }, [pass?.expiresAt]);

  const handleCopyCode = () => {
    if (pass?.passcode && navigator.clipboard) {
      navigator.clipboard.writeText(pass.passcode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  if (!pass) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center space-y-4 shadow-2xl">
          <div className="w-14 h-14 bg-rose-500/20 text-rose-400 rounded-2xl flex items-center justify-center mx-auto border border-rose-500/30">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-white">Visitor Pass Not Found</h2>
          <p className="text-xs text-slate-400">
            The pass link you opened may have been deleted, revoked, or formatted incorrectly.
          </p>
          {onExit && (
            <button
              onClick={onExit}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all"
            >
              Return to Application
            </button>
          )}
        </div>
      </div>
    );
  }

  const isCheckedIn = pass.status === 'in_gate';
  const isCheckedOut = pass.status === 'checked_out';
  const isDenied = pass.status === 'denied';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex flex-col items-center justify-center p-3 sm:p-6 py-8">
      {/* Top Bar / Back button */}
      <div className="w-full max-w-md flex items-center justify-between mb-4">
        {onExit ? (
          <button
            onClick={onExit}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white bg-slate-800/80 border border-slate-700/80 px-3 py-2 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to App</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 text-xs font-black text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Official Gate Pass</span>
          </div>
        )}

        <button
          onClick={handleCopyLink}
          className="flex items-center gap-1 text-xs font-bold text-slate-300 hover:text-white bg-slate-800/80 border border-slate-700/80 px-3 py-2 rounded-xl transition-colors"
          title="Share Pass Link"
        >
          {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-emerald-400" />}
          <span>{copiedLink ? 'Copied' : 'Share'}</span>
        </button>
      </div>

      {/* Main Digital Ticket */}
      <div className="w-full max-w-md bg-white text-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-200 animate-fade-in relative">
        {/* Pass Top Branding Banner */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white p-5 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500 text-slate-950 rounded-2xl font-black shadow-md">
                <Building className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold tracking-widest text-emerald-400 uppercase block">
                  Greenwood Heights
                </span>
                <h1 className="text-base font-black text-white">Digital Visitor Gate Pass</h1>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Destination</span>
              <span className="text-sm font-black text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 px-2.5 py-1 rounded-xl">
                Flat {pass.flatNumber}
              </span>
            </div>
          </div>
        </div>

        {/* Status Strip */}
        <div className="p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between bg-slate-50 border border-slate-200/90 rounded-2xl p-3">
            <div className="flex items-center gap-2">
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  isCheckedIn
                    ? 'bg-blue-500'
                    : isCheckedOut
                    ? 'bg-slate-400'
                    : isDenied
                    ? 'bg-rose-500'
                    : isExpired
                    ? 'bg-amber-500'
                    : 'bg-emerald-500 animate-ping'
                }`}
              />
              <span className="text-xs font-black text-slate-900">
                {isCheckedIn
                  ? 'Checked In (In-Gate)'
                  : isCheckedOut
                  ? 'Checked Out'
                  : isDenied
                  ? 'Pass Revoked'
                  : isExpired
                  ? 'Pass Expired'
                  : 'Pre-Approved Entry Pass'}
              </span>
            </div>

            <div className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span>{timeLeft}</span>
            </div>
          </div>

          {/* QR Code Presentation Box */}
          <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-b from-slate-50 to-white border-2 border-slate-200 rounded-3xl relative">
            <div
              className={`p-4 bg-white rounded-2xl border-2 transition-all ${
                isExpired
                  ? 'border-amber-300 opacity-60'
                  : isDenied
                  ? 'border-rose-300 opacity-50'
                  : 'border-emerald-500 shadow-xl ring-4 ring-emerald-500/20'
              }`}
            >
              <QRCodeSVG
                value={typeof window !== 'undefined' ? window.location.href : (pass.qrToken || pass.id)}
                size={200}
                level="H"
                includeMargin={false}
                fgColor={isExpired || isDenied ? '#64748b' : '#0f172a'}
              />
            </div>

            <div className="mt-4 text-center space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
                Backup Passcode / OTP
              </span>
              <div className="flex items-center justify-center gap-2">
                <span className="text-3xl font-mono font-black tracking-widest text-slate-900 select-all">
                  {pass.passcode}
                </span>
                <button
                  onClick={handleCopyCode}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors"
                  title="Copy Passcode"
                >
                  {copiedCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Hold your phone in front of the security guard's QR scanner at the entrance gate.
              </p>
            </div>
          </div>

          {/* Visitor Details Card */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-200/70">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Visitor</span>
                <span className="font-black text-slate-900 text-sm block">{pass.visitorName}</span>
                <span className="text-[11px] text-slate-500 capitalize">{pass.companyOrRole || pass.category}</span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Host Resident</span>
                <span className="font-black text-slate-900 text-sm block">{pass.residentName}</span>
                <span className="text-[11px] text-emerald-700 font-bold">Unit {pass.flatNumber}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Scheduled Date</span>
                <span className="font-bold text-slate-900">{pass.expectedDate}</span>
                <span className="text-[10px] text-slate-500 block">{pass.expectedTimeSlot || 'Standard Slot'}</span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Validity Expires</span>
                <span className="font-bold text-slate-900">
                  {pass.expiresAt
                    ? new Date(pass.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })
                    : 'End of Day'}
                </span>
              </div>
            </div>

            {pass.vehicleNumber && (
              <div className="pt-2 border-t border-slate-200/70 flex items-center gap-2">
                <Car className="w-4 h-4 text-slate-500" />
                <span className="text-[11px] text-slate-600 font-semibold">Registered Vehicle:</span>
                <span className="text-[11px] font-mono font-black text-slate-900">{pass.vehicleNumber}</span>
              </div>
            )}
          </div>

          {/* Gate Location and Contact Info */}
          <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-3.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                <Navigation className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-emerald-950 block">Greenwood Heights Gate 1</span>
                <span className="text-[10px] text-emerald-700">Main Entrance & Visitor Check-In Desk</span>
              </div>
            </div>

            {flatObj?.phone && (
              <a
                href={`tel:${flatObj.phone}`}
                className="bg-emerald-600 hover:bg-emerald-700 text-white p-2.5 rounded-xl shadow-xs flex items-center gap-1 font-bold text-xs"
                title="Call Host Resident"
              >
                <Phone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Call Host</span>
              </a>
            )}
          </div>
        </div>

        {/* Security Seal Footer */}
        <div className="bg-slate-900 text-slate-400 px-5 py-3 text-center text-[10px] font-medium border-t border-slate-800 flex items-center justify-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Verified Security Gate Token • ID: {pass.id}</span>
        </div>
      </div>
    </div>
  );
};
