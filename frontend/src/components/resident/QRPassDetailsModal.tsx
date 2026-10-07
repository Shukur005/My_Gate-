import React from 'react';
import { VisitorPass } from '../../types';
import { QRVisitorPassCard } from '../common/QRVisitorPassCard';
import { X, QrCode } from 'lucide-react';

interface QRPassDetailsModalProps {
  pass: VisitorPass | null;
  onClose: () => void;
  onOpenPublicView?: (passToken: string) => void;
}

export const QRPassDetailsModal: React.FC<QRPassDetailsModalProps> = ({
  pass,
  onClose,
  onOpenPublicView,
}) => {
  if (!pass) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full overflow-hidden text-slate-800 shadow-2xl my-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500 text-slate-950 rounded-xl font-black">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-white">Visitor Pass & QR Code</h3>
              <p className="text-[11px] text-slate-300">Share or manage access pass for {pass.visitorName}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 max-h-[80vh] overflow-y-auto">
          <QRVisitorPassCard
            pass={pass}
            showActions={true}
            onOpenPublicView={onOpenPublicView}
          />
        </div>
      </div>
    </div>
  );
};
