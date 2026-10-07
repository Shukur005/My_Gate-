import React, { useState, useEffect, useRef } from 'react';
import jsQR from 'jsqr';
import { useSociety } from '../../context/SocietyContext';
import { VisitorPass, QRVerificationResult } from '../../types';
import {
  QrCode,
  Camera,
  Upload,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Building,
  User,
  Phone,
  ShieldCheck,
  X,
  Volume2,
  VolumeX,
  Sparkles,
  Zap,
  ArrowRight,
  Car,
  Key,
  RefreshCw,
  Layers,
} from 'lucide-react';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({ isOpen, onClose }) => {
  const { visitors, verifyQRPassPayload, verifyAndCheckInVisitor } = useSociety();

  const [activeTab, setActiveTab] = useState<'camera' | 'upload' | 'demo' | 'manual'>('camera');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Manual input
  const [manualCode, setManualCode] = useState('');

  // Gate selector
  const [selectedGate, setSelectedGate] = useState('Main Gate 1');

  // Verification result state
  const [scanResult, setScanResult] = useState<QRVerificationResult | null>(null);
  const [checkInSuccess, setCheckInSuccess] = useState<string | null>(null);

  // Video & Canvas refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Active expected visitors for 1-click test simulation
  const expectedVisitors = visitors.filter((v) => v.status === 'expected' || v.status === 'pending_approval');

  // Play audio chime
  const playBeep = (isSuccess: boolean) => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = isSuccess ? 'sine' : 'sawtooth';
      osc.frequency.setValueAtTime(isSuccess ? 880 : 220, ctx.currentTime);
      if (isSuccess) {
        osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.15);
      }

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch (e) {
      // Audio playback ignored
    }
  };

  // Start live camera
  const startCamera = async () => {
    setCameraError(null);
    setScanResult(null);
    setCheckInSuccess(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported in this browser environment.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setCameraActive(true);
        requestAnimationFrame(tickScan);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to access camera.';
      setCameraError(msg);
      setCameraActive(false);
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  // Continuous frame scanner
  const tickScan = () => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const canvas = canvasRef.current || document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });

        if (code && code.data) {
          handleQRDetected(code.data);
          stopCamera();
          return;
        }
      }
    }

    if (cameraActive) {
      animationFrameId.current = requestAnimationFrame(tickScan);
    }
  };

  // Handle QR detected from camera, file upload, or simulation
  const handleQRDetected = (rawData: string) => {
    const result = verifyQRPassPayload(rawData);
    setScanResult(result);
    setCheckInSuccess(null);
    playBeep(result.success);
  };

  // Upload and decode image
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code && code.data) {
            handleQRDetected(code.data);
          } else {
            alert('No QR code detected in this image. Please upload a clear photo of the visitor pass QR code.');
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Perform entry check-in
  const handleGrantEntry = (pass: VisitorPass) => {
    const res = verifyAndCheckInVisitor(pass.qrToken || pass.passcode, selectedGate);
    if (res.success) {
      setCheckInSuccess(res.message);
      playBeep(true);
      setTimeout(() => {
        // Clear result after 2.5s and return to scanner
        setScanResult(null);
        setCheckInSuccess(null);
      }, 2500);
    } else {
      alert(res.message);
    }
  };

  // Clean up camera on unmount or tab switch
  useEffect(() => {
    if (isOpen && activeTab === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full overflow-hidden text-slate-800 shadow-2xl my-6 animate-fade-in relative">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500 text-slate-950 rounded-2xl font-black shadow-md">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">Security Guard QR Scanner Desk</h3>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                  Station 01
                </span>
              </div>
              <p className="text-xs text-slate-300">Optical scanner for instant time-limited visitor pass verification</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              title={soundEnabled ? 'Mute Chime' : 'Enable Chime'}
            >
              {soundEnabled ? <Volume2 className="w-5 h-5 text-emerald-400" /> : <VolumeX className="w-5 h-5 text-slate-500" />}
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scan Station Tabs */}
        <div className="bg-slate-100 p-2 flex items-center gap-1.5 border-b border-slate-200 text-xs font-bold">
          <button
            onClick={() => {
              setActiveTab('camera');
              setScanResult(null);
            }}
            className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'camera'
                ? 'bg-white text-emerald-800 shadow-xs border border-slate-200/80 font-black'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <Camera className="w-4 h-4 text-emerald-600" />
            <span>Live Camera</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('demo');
              setScanResult(null);
            }}
            className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'demo'
                ? 'bg-white text-emerald-800 shadow-xs border border-slate-200/80 font-black'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-600" />
            <span>1-Click Test Pass ({expectedVisitors.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('upload');
              setScanResult(null);
            }}
            className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'upload'
                ? 'bg-white text-emerald-800 shadow-xs border border-slate-200/80 font-black'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <Upload className="w-4 h-4 text-blue-600" />
            <span>Upload Image</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('manual');
              setScanResult(null);
            }}
            className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'manual'
                ? 'bg-white text-emerald-800 shadow-xs border border-slate-200/80 font-black'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <Key className="w-4 h-4 text-slate-600" />
            <span>Manual Code</span>
          </button>
        </div>

        {/* Scanner Content */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Gate Selector */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 border border-slate-200 p-3 rounded-2xl">
            <span className="text-xs font-bold text-slate-700">Select Active Gate Station:</span>
            <div className="flex gap-2">
              {['Main Gate 1', 'Tower B Gate', 'Service Gate 2'].map((gate) => (
                <button
                  key={gate}
                  type="button"
                  onClick={() => setSelectedGate(gate)}
                  className={`text-[11px] font-bold px-3 py-1.5 rounded-xl border transition-all ${
                    selectedGate === gate
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {gate}
                </button>
              ))}
            </div>
          </div>

          {/* TAB 1: LIVE CAMERA SCANNER */}
          {activeTab === 'camera' && !scanResult && (
            <div className="space-y-4">
              <div className="relative bg-slate-950 rounded-3xl overflow-hidden aspect-video sm:aspect-4/3 flex items-center justify-center border-2 border-slate-800 shadow-2xl">
                {/* Hidden canvas for decoding */}
                <canvas ref={canvasRef} className="hidden" />

                {/* Video element */}
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  playsInline
                />

                {/* Scanning Reticle & Overlay */}
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6">
                  {/* Outer dark vignette */}
                  <div className="w-56 h-56 sm:w-64 sm:h-64 border-2 border-emerald-400/80 rounded-3xl relative flex items-center justify-center shadow-[0_0_0_9999px_rgba(0,0,0,0.55)]">
                    {/* Laser scanning sweep line */}
                    <div className="absolute top-0 left-2 right-2 h-0.5 bg-emerald-400 shadow-[0_0_12px_#34d399] animate-bounce" />

                    {/* Corner Guides */}
                    <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-xl" />
                    <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-xl" />
                    <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-xl" />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-xl" />

                    <div className="text-center bg-slate-950/75 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-emerald-500/30">
                      <span className="text-[11px] font-extrabold text-emerald-300 uppercase tracking-wider block">
                        Position QR Code Here
                      </span>
                    </div>
                  </div>
                </div>

                {/* Camera Error Message */}
                {cameraError && (
                  <div className="absolute inset-0 bg-slate-950/90 text-white p-6 flex flex-col items-center justify-center text-center space-y-3 z-20">
                    <AlertTriangle className="w-10 h-10 text-amber-400" />
                    <div>
                      <h4 className="font-bold text-sm text-white">Camera Access Not Available</h4>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm">{cameraError}</p>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={startCamera}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all"
                      >
                        Retry Camera
                      </button>
                      <button
                        onClick={() => setActiveTab('demo')}
                        className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all"
                      >
                        Switch to 1-Click Simulation
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  Scanner active • Align guest phone QR pass
                </span>
                <button
                  type="button"
                  onClick={() => (cameraActive ? stopCamera() : startCamera())}
                  className="text-emerald-700 hover:underline font-bold flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{cameraActive ? 'Restart Stream' : 'Start Camera'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: 1-CLICK TEST PASSES */}
          {activeTab === 'demo' && !scanResult && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  Select Expected Pass to Simulate Scan
                </span>
                <span className="text-[11px] text-slate-400 font-bold">Fast Preview Testing</span>
              </div>

              {visitors.length > 0 ? (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {visitors.map((v) => {
                    const isExp = v.expiresAt && new Date() > new Date(v.expiresAt);
                    return (
                      <div
                        key={v.id}
                        className="bg-slate-50 border border-slate-200 hover:border-emerald-300 rounded-2xl p-3 flex items-center justify-between gap-3 transition-all hover:shadow-xs"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2.5 rounded-xl font-mono text-xs font-black ${
                              v.status === 'in_gate'
                                ? 'bg-blue-100 text-blue-800'
                                : v.status === 'checked_out'
                                ? 'bg-slate-100 text-slate-700'
                                : isExp
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            <QrCode className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-slate-900">{v.visitorName}</span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 uppercase">
                                Unit {v.flatNumber}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                              <span className="capitalize">{v.companyOrRole || v.category}</span>
                              <span>•</span>
                              <span className="font-mono text-slate-700 font-bold">OTP: {v.passcode}</span>
                              {v.expiresAt && (
                                <>
                                  <span>•</span>
                                  <span className={isExp ? 'text-rose-600 font-bold' : 'text-emerald-700 font-bold'}>
                                    {isExp ? 'Expired' : 'Active'}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleQRDetected(v.qrToken || v.id)}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1 shadow-xs transition-all active:scale-95 shrink-0"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          <span>Simulate Scan</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-slate-200">
                  No visitors found. Generate a visitor pass from the Resident View first.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: UPLOAD QR IMAGE */}
          {activeTab === 'upload' && !scanResult && (
            <div className="space-y-3">
              <label className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-slate-50 hover:bg-emerald-50/40">
                <Upload className="w-10 h-10 text-emerald-600 mb-3" />
                <span className="text-xs font-black text-slate-900 block">Click to upload QR Code screenshot or photo</span>
                <span className="text-[11px] text-slate-400 mt-1">Supports PNG, JPG, JPEG</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {/* TAB 4: MANUAL PASSCODE / TOKEN INPUT */}
          {activeTab === 'manual' && !scanResult && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (manualCode.trim()) handleQRDetected(manualCode.trim());
              }}
              className="space-y-3"
            >
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Enter 6-digit OTP Passcode or QR Token ID
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. 482019 or QR-VPASS-..."
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                  />
                  <button
                    type="submit"
                    className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md active:scale-95"
                  >
                    Verify
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* SCAN VERIFICATION RESULTS CARD */}
          {scanResult && (
            <div className="space-y-4 animate-fade-in">
              {/* Result Status Banner */}
              <div
                className={`p-4 rounded-2xl border flex items-center justify-between ${
                  scanResult.code === 'VALID'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : scanResult.code === 'EXPIRED'
                    ? 'bg-amber-50 border-amber-300 text-amber-950'
                    : scanResult.code === 'ALREADY_USED'
                    ? 'bg-blue-50 border-blue-300 text-blue-950'
                    : 'bg-rose-50 border-rose-300 text-rose-950'
                }`}
              >
                <div className="flex items-center gap-3">
                  {scanResult.code === 'VALID' ? (
                    <div className="p-2 bg-emerald-500 text-slate-950 rounded-xl font-black">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                  ) : scanResult.code === 'EXPIRED' ? (
                    <div className="p-2 bg-amber-500 text-slate-950 rounded-xl font-black">
                      <Clock className="w-6 h-6" />
                    </div>
                  ) : (
                    <div className="p-2 bg-rose-500 text-white rounded-xl font-black">
                      <XCircle className="w-6 h-6" />
                    </div>
                  )}

                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider block opacity-75">
                      Scanner Evaluation
                    </span>
                    <h4 className="text-base font-black">
                      {scanResult.code === 'VALID'
                        ? 'VERIFIED & PRE-APPROVED'
                        : scanResult.code === 'EXPIRED'
                        ? 'PASS EXPIRED'
                        : scanResult.code === 'ALREADY_USED'
                        ? 'ALREADY CHECKED IN'
                        : scanResult.code === 'DENIED'
                        ? 'ENTRY DENIED / REVOKED'
                        : 'UNRECOGNIZED PASS'}
                    </h4>
                  </div>
                </div>

                {scanResult.expiresInMinutes !== undefined && scanResult.code === 'VALID' && (
                  <span className="text-xs font-extrabold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-xl border border-emerald-300">
                    {Math.floor(scanResult.expiresInMinutes / 60)}h {scanResult.expiresInMinutes % 60}m valid
                  </span>
                )}
              </div>

              {/* Toast confirmation */}
              {checkInSuccess && (
                <div className="p-3.5 bg-emerald-600 text-white rounded-2xl font-extrabold text-xs flex items-center gap-2 shadow-lg animate-bounce">
                  <CheckCircle2 className="w-5 h-5 text-emerald-200" />
                  <span>{checkInSuccess}</span>
                </div>
              )}

              {/* Pass Details Preview */}
              {scanResult.pass ? (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-200/80">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Visitor Name</span>
                      <span className="text-sm font-black text-slate-900 block">{scanResult.pass.visitorName}</span>
                      <span className="text-[11px] text-slate-500 font-medium capitalize">
                        {scanResult.pass.companyOrRole || scanResult.pass.category}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Destination Flat</span>
                      <span className="text-sm font-black text-slate-900 block">Flat {scanResult.pass.flatNumber}</span>
                      <span className="text-[11px] text-emerald-700 font-bold">Resident: {scanResult.pass.residentName}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Scheduled Time Slot</span>
                      <span className="font-bold text-slate-800">{scanResult.pass.expectedTimeSlot || scanResult.pass.expectedDate}</span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Pass Expiry</span>
                      <span className="font-bold text-slate-800">
                        {scanResult.pass.expiresAt
                          ? new Date(scanResult.pass.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })
                          : 'Valid Today'}
                      </span>
                    </div>
                  </div>

                  {scanResult.pass.vehicleNumber && (
                    <div className="pt-2 border-t border-slate-200 flex items-center gap-2">
                      <Car className="w-4 h-4 text-slate-500" />
                      <span className="font-bold text-slate-700">Vehicle Permit:</span>
                      <span className="font-mono font-black text-slate-900">{scanResult.pass.vehicleNumber}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600">
                  {scanResult.message}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setScanResult(null);
                    setCheckInSuccess(null);
                    if (activeTab === 'camera') startCamera();
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Scan Another Pass</span>
                </button>

                {scanResult.code === 'VALID' && scanResult.pass && (
                  <button
                    type="button"
                    onClick={() => handleGrantEntry(scanResult.pass!)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Grant Entry & Open Barrier ({selectedGate})</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
