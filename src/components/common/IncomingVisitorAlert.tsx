import React from 'react';
import { useSociety } from '../../context/SocietyContext';
import { PhoneCall, Check, X, PackageCheck, Shield, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const IncomingVisitorAlert: React.FC = () => {
  const { incomingCall, setIncomingCall, approvePendingVisitor, denyPendingVisitor } = useSociety();

  if (!incomingCall) return null;

  const visitor = incomingCall.visitor;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-slate-900 border-2 border-emerald-500 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden text-white"
        >
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2.5 rounded-full animate-pulse">
                <PhoneCall className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xs font-bold text-emerald-200 tracking-wider uppercase">
                  Gate Security Intercom
                </span>
                <h3 className="text-lg font-extrabold text-white">Visitor Arrived at Gate!</h3>
              </div>
            </div>
            <span className="bg-slate-950/40 text-xs font-bold px-2.5 py-1 rounded-full text-emerald-300">
              {incomingCall.timestamp}
            </span>
          </div>

          {/* Body Content */}
          <div className="p-6 space-y-4">
            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-xl font-bold text-white">{visitor.visitorName}</h4>
                  <p className="text-sm font-medium text-emerald-400 capitalize">
                    Category: {visitor.category} {visitor.companyOrRole ? `(${visitor.companyOrRole})` : ''}
                  </p>
                </div>
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold px-2.5 py-1 rounded-full">
                  Gate 1 Check-In
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 pt-2 border-t border-slate-700/60">
                <div>
                  <span className="text-slate-400 block">Flat Destination:</span>
                  <span className="font-bold text-white">Flat {visitor.flatNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Phone:</span>
                  <span className="font-semibold text-slate-200">{visitor.phone}</span>
                </div>
                {visitor.vehicleNumber && (
                  <div className="col-span-2">
                    <span className="text-slate-400 block">Vehicle #:</span>
                    <span className="font-mono text-emerald-300 bg-slate-900 px-2 py-0.5 rounded text-xs border border-slate-700 inline-block">
                      {visitor.vehicleNumber}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <p className="text-xs text-slate-400 text-center flex items-center justify-center gap-1">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              Guard verified contact details at Gate Station.
            </p>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => approvePendingVisitor(visitor.id)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/40 active:scale-95"
              >
                <Check className="w-5 h-5" />
                <span>Approve Entry</span>
              </button>

              <button
                onClick={() => denyPendingVisitor(visitor.id)}
                className="bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-900/40 active:scale-95"
              >
                <X className="w-5 h-5" />
                <span>Deny Entry</span>
              </button>

              {visitor.category === 'delivery' && (
                <button
                  onClick={() => approvePendingVisitor(visitor.id, true)}
                  className="col-span-2 bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold py-2.5 px-4 rounded-xl border border-amber-500/30 flex items-center justify-center gap-2 text-xs transition-all"
                >
                  <PackageCheck className="w-4 h-4 text-amber-400" />
                  <span>Leave Package at Gate Desk</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
