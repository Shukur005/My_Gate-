import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { VisitorPass } from '../../types';
import { useSociety } from '../../context/SocietyContext';
import {
  Copy,
  Check,
  Share2,
  Clock,
  Calendar,
  Building,
  User,
  Phone,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  MessageSquare,
  Key,
  Car,
  Sparkles,
  RefreshCw,
  Ban,
  PlusCircle,
} from 'lucide-react';

interface QRVisitorPassCardProps {
  pass: VisitorPass;
  showActions?: boolean;
  onClose?: () => void;
  onOpenPublicView?: (passToken: string) => void;
}

export const QRVisitorPassCard: React.FC<QRVisitorPassCardProps> = ({
  pass,
  showActions = true,
  onOpenPublicView,
}) => {
  const { extendPassValidity, revokeVisitorPass } = useSociety();
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [timeLeftStr, setTimeLeftStr] = useState<string>('');
  const [isExpired, setIsExpired] = useState(false);
  const [extendHours, setExtendHours] = useState(2);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Generate share URL
  const baseUrl = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '';
  const shareToken = pass.qrToken || pass.id;
  const shareUrl = `${baseUrl}?vpass=${encodeURIComponent(shareToken)}`;

  // Serialized QR Code Payload
  const qrPayload = JSON.stringify({
    vpassId: pass.id,
    token: pass.qrToken || pass.id,
    code: pass.passcode,
    flat: pass.flatNumber,
    host: pass.residentName,
    guest: pass.visitorName,
    exp: pass.expiresAt,
    cat: pass.category,
  });

  // Real-time Countdown Timer calculation
  useEffect(() => {
    const updateCountdown = () => {
      if (!pass.expiresAt) {
        setTimeLeftStr('Valid for Scheduled Date');
        setIsExpired(false);
        return;
      }

      const now = Date.now();
      const expTime = new Date(pass.expiresAt).getTime();
      const diffMs = expTime - now;

      if (diffMs <= 0) {
        const passedMins = Math.abs(Math.round(diffMs / 60000));
        setIsExpired(true);
        if (passedMins < 60) {
          setTimeLeftStr(`Expired ${passedMins}m ago`);
        } else {
          const passedHrs = Math.floor(passedMins / 60);
          setTimeLeftStr(`Expired ${passedHrs}h ${passedMins % 60}m ago`);
        }
      } else {
        setIsExpired(false);
        const mins = Math.floor(diffMs / 60000);
        const hours = Math.floor(mins / 60);
        const remainingMins = mins % 60;
        if (hours > 0) {
          setTimeLeftStr(`${hours}h ${remainingMins}m remaining`);
        } else {
          setTimeLeftStr(`${remainingMins}m remaining`);
        }
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 10000);
    return () => clearInterval(interval);
  }, [pass.expiresAt]);

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleCopyPasscode = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(pass.passcode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    }
  };

  const handleWhatsAppShare = () => {
    const expText = pass.expiresAt
      ? `Valid until: ${new Date(pass.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}`
      : `Valid on: ${pass.expectedDate}`;

    const text = encodeURIComponent(
      `🏢 *Greenwood Heights Visitor Pass*\n` +
      `Hello ${pass.visitorName}, here is your digital entry pass to visit Flat ${pass.flatNumber} (${pass.residentName}):\n\n` +
      `🔗 *Open Digital QR Pass:* ${shareUrl}\n\n` +
      `🔑 *Gate Backup Passcode:* ${pass.passcode}\n` +
      `⏳ *${expText}*\n\n` +
      `Show the QR code to security at Main Gate for instant entry.`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleExtend = (hrs: number) => {
    const res = extendPassValidity(pass.id, hrs);
    if (res.success) {
      setActionNotice(res.message);
      setTimeout(() => setActionNotice(null), 3000);
    }
  };

  const handleRevoke = () => {
    if (window.confirm(`Revoke entry pass for ${pass.visitorName}? Guard will block entry.`)) {
      const res = revokeVisitorPass(pass.id);
      setActionNotice(res.message);
      setTimeout(() => setActionNotice(null), 3000);
    }
  };

  const getStatusDisplay = () => {
    if (pass.status === 'in_gate') {
      return {
        label: 'In Society (Checked In)',
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-300',
        dot: 'bg-emerald-500',
      };
    }
    if (pass.status === 'checked_out') {
      return {
        label: 'Checked Out',
        bg: 'bg-slate-100 text-slate-700 border-slate-300',
        dot: 'bg-slate-400',
      };
    }
    if (pass.status === 'denied') {
      return {
        label: 'Pass Revoked / Denied',
        bg: 'bg-rose-50 text-rose-700 border-rose-300',
        dot: 'bg-rose-500',
      };
    }
    if (isExpired) {
      return {
        label: 'Pass Expired',
        bg: 'bg-amber-50 text-amber-800 border-amber-300',
        dot: 'bg-amber-500',
      };
    }
    return {
      label: 'Pre-Approved (Active)',
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
      dot: 'bg-emerald-500 animate-ping',
    };
  };

  const statusInfo = getStatusDisplay();

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-xl text-slate-800 transition-all">
      {/* Toast Notice */}
      {actionNotice && (
        <div className="bg-slate-900 text-white text-xs font-bold px-4 py-2 text-center animate-fade-in">
          {actionNotice}
        </div>
      )}

      {/* Ticket Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-4 sm:p-5 relative overflow-hidden">
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500 text-slate-950 rounded-xl font-black shadow-md">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 block">
                Greenwood Heights
              </span>
              <h3 className="font-extrabold text-sm sm:text-base text-white">Digital Visitor Gate Pass</h3>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Destination</span>
            <span className="text-sm font-black text-white bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
              Unit {pass.flatNumber}
            </span>
          </div>
        </div>
      </div>

      {/* Ticket Body */}
      <div className="p-5 sm:p-6 space-y-5">
        {/* Status & Validity Badge */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 border border-slate-200/80 rounded-2xl p-3">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${statusInfo.dot}`} />
            <span className="text-xs font-black text-slate-900">{statusInfo.label}</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold">
            <Clock className={`w-3.5 h-3.5 ${isExpired ? 'text-rose-600' : 'text-emerald-600'}`} />
            <span className={isExpired ? 'text-rose-600' : 'text-emerald-700'}>{timeLeftStr}</span>
          </div>
        </div>

        {/* QR Code Container */}
        <div className="flex flex-col items-center justify-center p-5 bg-gradient-to-b from-slate-50 to-white border-2 border-slate-200/80 rounded-3xl relative shadow-inner">
          <div className={`p-3.5 bg-white rounded-2xl border ${isExpired ? 'border-amber-300 opacity-60' : 'border-emerald-300 shadow-lg'}`}>
            <QRCodeSVG
              value={shareUrl}
              size={180}
              level="H"
              includeMargin={false}
              fgColor={isExpired ? '#64748b' : '#0f172a'}
            />
          </div>

          {/* Backup Passcode Strip */}
          <div className="mt-4 text-center space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Gate Backup Passcode / OTP
            </span>
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl sm:text-3xl font-mono font-black tracking-widest text-slate-900 select-all">
                {pass.passcode}
              </span>
              <button
                onClick={handleCopyPasscode}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors"
                title="Copy Passcode"
              >
                {copiedCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-slate-400">Security guard can scan the QR code or enter this 6-digit OTP code.</p>
          </div>
        </div>

        {/* Visitor & Pass Details Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50/80 border border-slate-200/70 p-3.5 rounded-2xl">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Visitor Name</span>
            <span className="font-extrabold text-slate-900 truncate block">{pass.visitorName}</span>
            <span className="text-[11px] text-slate-500 font-medium capitalize">{pass.companyOrRole || pass.category}</span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Host Resident</span>
            <span className="font-extrabold text-slate-900 truncate block">{pass.residentName}</span>
            <span className="text-[11px] text-emerald-700 font-bold">Flat {pass.flatNumber}</span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Scheduled Date & Time</span>
            <span className="font-bold text-slate-800">{pass.expectedDate}</span>
            <span className="text-[10px] text-slate-500 block">{pass.expectedTimeSlot || 'Anytime during validity'}</span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Expires At</span>
            <span className="font-bold text-slate-800">
              {pass.expiresAt
                ? new Date(pass.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })
                : 'End of Day'}
            </span>
          </div>

          {pass.vehicleNumber && (
            <div className="col-span-2 flex items-center gap-1.5 pt-1 border-t border-slate-200/60">
              <Car className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-[11px] text-slate-600 font-bold">Vehicle Permit:</span>
              <span className="text-[11px] font-mono font-black text-slate-900">{pass.vehicleNumber}</span>
            </div>
          )}
        </div>

        {/* Sharing & Action Controls */}
        {showActions && (
          <div className="space-y-3 pt-2">
            {/* Share Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleCopyLink}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4 text-emerald-400" />
                    <span>Copy Shareable Link</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleWhatsAppShare}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Share on WhatsApp</span>
              </button>
            </div>

            {/* Public Link Preview Trigger */}
            {onOpenPublicView && (
              <button
                type="button"
                onClick={() => onOpenPublicView(shareToken)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors border border-slate-200"
              >
                <ExternalLink className="w-3.5 h-3.5 text-slate-600" />
                <span>Preview Shared Guest Pass Page</span>
              </button>
            )}

            {/* Resident Pass Management: Extend or Revoke */}
            <div className="border-t border-slate-100 pt-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-500">Extend:</span>
                {[2, 6, 24].map((hrs) => (
                  <button
                    key={hrs}
                    type="button"
                    onClick={() => handleExtend(hrs)}
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] rounded-lg border border-slate-200 transition-colors"
                  >
                    +{hrs}h
                  </button>
                ))}
              </div>

              {pass.status === 'expected' && (
                <button
                  type="button"
                  onClick={handleRevoke}
                  className="text-rose-600 hover:text-rose-700 text-[11px] font-bold flex items-center gap-1 p-1 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>Revoke Pass</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
