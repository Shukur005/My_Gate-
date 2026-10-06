import React, { useRef, useState } from 'react';
import { useSociety } from '../../context/SocietyContext';
import { UserRole } from '../../types';
import {
  Home,
  Shield,
  Building2,
  Lock,
  Mail,
  User,
  Phone,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Car,
  Users,
  Bell,
  Check,
  Clock,
  Radio,
  FileText,
  Trees,
  Headphones,
  Video,
  Package,
  ShieldAlert,
  Leaf,
  Calendar,
  MessageSquare,
  Wrench,
  Receipt,
  HelpCircle,
  Key,
  BarChart3,
  CreditCard,
  Zap,
} from 'lucide-react';

interface AuthPortalProps {
  initialPortal?: UserRole;
  onLoginSuccess?: () => void;
}

export const AuthPortal: React.FC<AuthPortalProps> = ({ initialPortal = 'resident', onLoginSuccess }) => {
  const {
    loginResident,
    loginGuard,
    loginAdmin,
  } = useSociety();

  // Screen state matching the 4 reference designs:
  // 'choose' -> Top main landing screen with 3 role cards
  // 'resident' -> Bottom-left "Welcome Home" resident login
  // 'guard' -> Bottom-center "Security Portal" terminal login
  // 'admin' -> Bottom-right "Community Administration" admin login
  const [currentScreen, setCurrentScreen] = useState<'choose' | 'resident' | 'guard' | 'admin'>('choose');
  const [showAccessControl, setShowAccessControl] = useState(false);
  const [showCommunityOverview, setShowCommunityOverview] = useState(false);
  const accessCardRef = useRef<HTMLDivElement>(null);
  const communityOverviewRef = useRef<HTMLElement>(null);

  const [authMethod, setAuthMethod] = useState<'password' | 'otp'>('password');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [helperNotice, setHelperNotice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [resIdentifier, setResIdentifier] = useState('alex.morgan@society.org');
  const [resPassword, setResPassword] = useState('resident123');

  const [guardBadgeInput, setGuardBadgeInput] = useState('GRD-701');
  const [guardPinInput, setGuardPinInput] = useState('guard123');

  const [adminEmailInput, setAdminEmailInput] = useState('admin@society.org');
  const [adminKeyInput, setAdminKeyInput] = useState('admin123');

  // Background photographic assets matching reference image
  const bgBuildings = '/src/assets/images/residency_buildings_bg_1791182297492.jpg';
  const bgGate = '/src/assets/images/security_gate_bg_1791182311466.jpg';
  const bgAdmin = '/src/assets/images/admin_clubhouse_bg_1791182326934.jpg';

  const thumbResident = '/src/assets/images/resident_card_thumb_1791182338823.jpg';
  const thumbSecurity = '/src/assets/images/security_card_thumb_1791182351106.jpg';
  const thumbAdmin = '/src/assets/images/admin_card_thumb_1791182414998.jpg';

  const navigateTo = (screen: 'choose' | 'resident' | 'guard' | 'admin') => {
    setCurrentScreen(screen);
    setShowAccessControl(false);
    setShowCommunityOverview(false);
    setErrorMessage(null);
    setSuccessMessage(null);
    setHelperNotice(null);
    setShowPassword(false);
  };

  const handleResidentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    if (authMethod === 'otp') {
      if (!otpSent) {
        setOtpSent(true);
        setIsLoading(false);
        setSuccessMessage('OTP code 8492 sent to your registered contact.');
        return;
      }
      if (otpCode !== '8492' && otpCode !== '1234') {
        setErrorMessage('Invalid OTP code. Please use 8492.');
        setIsLoading(false);
        return;
      }
    }

    const res = loginResident({
      emailOrFlat: resIdentifier,
      password: authMethod === 'password' ? resPassword : undefined,
    });
    setIsLoading(false);
    if (res.success) {
      setSuccessMessage(res.message);
      onLoginSuccess?.();
    } else {
      setErrorMessage(res.message);
    }
  };

  const handleGuardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    const res = loginGuard({ badgeIdOrPhone: guardBadgeInput, pin: guardPinInput });
    setIsLoading(false);
    if (res.success) {
      setSuccessMessage(res.message);
      onLoginSuccess?.();
    } else {
      setErrorMessage(res.message);
    }
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    const res = loginAdmin({ email: adminEmailInput, adminAccessCodeOrPassword: adminKeyInput });
    setIsLoading(false);
    if (res.success) {
      setSuccessMessage(res.message);
      onLoginSuccess?.();
    } else {
      setErrorMessage(res.message);
    }
  };

  const handleQuickLogin = (emailOrFlat: string, role: UserRole) => {
    if (role === 'resident') {
      const res = loginResident({ emailOrFlat });
      if (res.success) onLoginSuccess?.();
    } else if (role === 'guard') {
      const res = loginGuard({ badgeIdOrPhone: emailOrFlat });
      if (res.success) onLoginSuccess?.();
    } else if (role === 'admin') {
      const res = loginAdmin({ email: emailOrFlat });
      if (res.success) onLoginSuccess?.();
    }
  };

  return (
    <div className="min-h-screen w-full relative overflow-x-hidden font-sans select-none flex flex-col justify-between">
      {/* ========================================================================= */}
      {/* 1. TOP MAIN LANDING SCREEN: "CHOOSE YOUR ACCESS" (BIG & EXTENDED)        */}
      {/* ========================================================================= */}
      {currentScreen === 'choose' && (
        <div className="min-h-screen w-full relative flex flex-col justify-between animate-fade-in">
          {/* Background: Crisp, bright luxury residential community with pool and families */}
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            <img
              src={bgBuildings}
              alt="Green Valley Residency Community"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center"
            />
            {/* Luminous soft white gradient on the left so large typography shines crystal clear */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-transparent lg:w-3/5" />
            <div className="absolute inset-0 bg-black/10" />
          </div>

          {/* Top Header */}
          <header className="relative z-20 px-6 sm:px-12 lg:px-16 xl:px-20 py-6 flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-[#1b4332] text-white flex items-center justify-center shadow-md">
                <Leaf className="w-6 h-6 text-emerald-300" />
              </div>
              <div>
                <h2 className="text-2xl font-serif font-black text-[#0f3822] tracking-tight leading-tight">
                  Green Valley
                </h2>
                <span className="text-[11px] font-bold text-slate-700 tracking-[0.25em] block uppercase -mt-0.5">
                  Residency
                </span>
              </div>
            </div>

            {/* Right Tagline */}
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="hidden sm:flex items-center gap-4 text-sm font-bold text-slate-800 drop-shadow-sm">
                <span>Safe Community</span>
                <span className="text-slate-400">|</span>
                <span>Better Living</span>
                <span className="text-slate-400">|</span>
                <span>Together</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (showCommunityOverview) {
                    setShowCommunityOverview(false);
                    return;
                  }
                  setShowCommunityOverview(false);
                  if (showAccessControl) {
                    setShowAccessControl(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    return;
                  }
                  setShowAccessControl(true);
                  requestAnimationFrame(() => {
                    accessCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  });
                }}
                className="inline-flex items-center gap-2 rounded-full bg-[#1b4332] px-5 py-2.5 text-sm font-bold text-white shadow-lg transition hover:bg-[#123426] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"
              >
                {showAccessControl || showCommunityOverview ? <ArrowLeft className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                {showCommunityOverview ? 'Back to Home' : showAccessControl ? 'Back to Welcome' : 'Login'}
              </button>
            </div>
          </header>

          {/* Main Hero & Floating Access Card: Left-Aligned Big Typography, Preserved Card Size & Alignment */}
          {!showCommunityOverview && (
          <main className="relative z-10 flex-1 flex items-center justify-center px-6 sm:px-12 lg:px-16 xl:px-20 py-6 sm:py-10 my-auto">
            <div className="max-w-[1680px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-center">
              {/* Left Column: Moved firmly to the far left with big, bold, commanding typography */}
              {!showAccessControl && (
              <div className="lg:col-span-7 xl:col-span-7 space-y-4 -ml-1 sm:-ml-3 lg:-ml-6 xl:-ml-10 -translate-y-36">
                <span className="text-xl sm:text-2xl lg:text-3xl font-[cursive] italic font-semibold text-[#1b4332] tracking-[0.18em] block">
                  Welcome to
                </span>
                
                {/* BIG COMMANDING SERIF HEADING */}
                <h1 className="text-6xl sm:text-7xl lg:text-8xl xl:text-[92px] font-serif font-black text-[#08331e] tracking-tight leading-[1.0] drop-shadow-sm">
                  Green Valley <br />
                  Residency
                </h1>

                {/* BIG SUBTITLE */}
                <p className="text-xl sm:text-2xl lg:text-3xl font-serif font-semibold text-[#183e2b] max-w-2xl leading-snug drop-shadow-xs">
                  A premium gated community for a better tomorrow
                </p>

                {/* COMMUNITY FEATURES */}
                <div id="community-features" className="space-y-4 pt-3 -translate-x-[76px] text-slate-900 font-bold text-sm sm:text-base lg:text-lg scroll-mt-8">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 -translate-x-[60px]">
                    <div className="flex items-center justify-center gap-2.5 sm:col-start-1 sm:translate-x-[75px]">
                      <Shield className="w-5 h-5 sm:w-6 h-6 text-[#1b4332] shrink-0" />
                      <span>Gated Community</span>
                    </div>
                    <div className="flex items-center justify-center gap-2.5 sm:col-start-2 sm:translate-x-[55px]">
                      <Building2 className="w-5 h-5 sm:w-6 h-6 text-[#1b4332] shrink-0" />
                      <span>Modern Amenities</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex items-center justify-center gap-2.5">
                      <Shield className="w-5 h-5 sm:w-6 h-6 text-[#1b4332] shrink-0" />
                      <span>Secure Living</span>
                    </div>
                    <div className="flex items-center justify-center gap-2.5">
                      <Leaf className="w-5 h-5 sm:w-6 h-6 text-[#1b4332] shrink-0" />
                      <span>Eco Friendly</span>
                    </div>
                    <div className="flex items-center justify-center gap-2.5">
                      <Users className="w-5 h-5 sm:w-6 h-6 text-[#1b4332] shrink-0" />
                      <span>Happy Community</span>
                    </div>
                  </div>
                </div>
              </div>
              )}

              {!showAccessControl && (
                <div className="lg:col-span-5 xl:col-span-5 flex w-full justify-center lg:justify-end">
                  <div className="w-full max-w-[390px] rounded-2xl border border-white/45 bg-white/20 p-6 shadow-[0_18px_48px_-24px_rgba(10,45,30,0.5)] backdrop-blur-md sm:p-7">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#1b4332]/80">
                      Green Valley Residency
                    </p>
                    <h2 className="mt-3 font-serif text-3xl font-bold leading-tight text-[#08331e] drop-shadow-sm sm:text-4xl">
                      Experience Green Valley
                    </h2>
                    <p className="mt-2 text-base font-medium text-[#173b2a]">
                      Where modern living meets nature
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCommunityOverview(true);
                      }}
                      className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#1b4332]/35 bg-[#1b4332]/10 px-4 py-2.5 text-sm font-bold text-[#123b29] transition hover:bg-[#1b4332]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1b4332] focus-visible:ring-offset-2"
                    >
                      Explore Community
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Right Column: Neat, Compact Floating Card (Preserved Size & Alignment) */}
              {currentScreen === 'choose' && showAccessControl && (
              <div
                ref={accessCardRef}
                className={`${showAccessControl ? 'lg:col-span-8 lg:col-start-3 xl:col-span-8 xl:col-start-3 max-w-[700px] mx-auto' : 'lg:col-span-5 xl:col-span-5 max-w-[530px] ml-auto'} w-full bg-white/45 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-[0_16px_40px_-12px_rgba(0,0,0,0.2)] p-5 sm:p-6 lg:p-7 border border-white/55 transition-all duration-500`}
              >
                {showAccessControl && (
                  <div className="mb-5 flex items-center justify-center gap-3 rounded-2xl border border-emerald-800/15 bg-emerald-950/90 px-5 py-4 text-white shadow-lg sm:py-5">
                    <Lock className="h-6 w-6 text-emerald-200 sm:h-8 sm:w-8" />
                    <h2 className="text-2xl font-black tracking-[0.12em] sm:text-4xl">Access Control</h2>
                  </div>
                )}
                <div className="text-center mb-4">
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                    Choose Your Access
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 font-normal">
                    Select your role to continue
                  </p>
                </div>

                {/* 3 Role Cards Grid: Compact, Proportional & Crisp */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 items-stretch">
                  {/* 1. RESIDENT CARD */}
                  <div
                    onClick={() => navigateTo('resident')}
                    className="border border-emerald-300/80 rounded-xl p-2 sm:p-2.5 bg-white/25 backdrop-blur-sm hover:bg-white/40 hover:border-emerald-500 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col items-center text-center justify-between group"
                  >
                    <div className="w-full h-18 sm:h-20 rounded-lg overflow-hidden relative shadow-xs">
                      <img
                        src={thumbResident}
                        alt="Resident Family"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    {/* Round Green Home Icon overlapping photo */}
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#0c4a2f] text-white flex items-center justify-center -mt-3.5 sm:-mt-4 mb-1 shadow-sm border-2 border-white z-10 group-hover:scale-105 transition-transform">
                      <Home className="w-3.5 h-3.5 text-emerald-100" />
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
                      Resident
                    </h4>
                    <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 leading-snug font-medium line-clamp-2 px-0.5">
                      Services & amenities
                    </p>
                    <div className="mt-2 w-7 h-7 rounded-full bg-[#0c4a2f] hover:bg-[#073622] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                      <ArrowRight className="w-3 h-3 stroke-[2.5]" />
                    </div>
                  </div>

                  {/* 2. SECURITY CARD */}
                  <div
                    onClick={() => navigateTo('guard')}
                    className="border border-blue-300/80 rounded-xl p-2 sm:p-2.5 bg-white/25 backdrop-blur-sm hover:bg-white/40 hover:border-blue-500 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col items-center text-center justify-between group"
                  >
                    <div className="w-full h-18 sm:h-20 rounded-lg overflow-hidden relative shadow-xs">
                      <img
                        src={thumbSecurity}
                        alt="Security Checkpoint"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    {/* Round Blue Shield Icon overlapping photo */}
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#1b3d63] text-white flex items-center justify-center -mt-3.5 sm:-mt-4 mb-1 shadow-sm border-2 border-white z-10 group-hover:scale-105 transition-transform">
                      <Shield className="w-3.5 h-3.5 text-sky-100" />
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
                      Security
                    </h4>
                    <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 leading-snug font-medium line-clamp-2 px-0.5">
                      Gate & visitors
                    </p>
                    <div className="mt-2 w-7 h-7 rounded-full bg-[#1b3d63] hover:bg-[#132c47] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                      <ArrowRight className="w-3 h-3 stroke-[2.5]" />
                    </div>
                  </div>

                  {/* 3. ADMIN / STAFF CARD */}
                  <div
                    onClick={() => navigateTo('admin')}
                    className="border border-indigo-300/80 rounded-xl p-2 sm:p-2.5 bg-white/25 backdrop-blur-sm hover:bg-white/40 hover:border-indigo-500 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col items-center text-center justify-between group"
                  >
                    <div className="w-full h-18 sm:h-20 rounded-lg overflow-hidden relative shadow-xs">
                      <img
                        src={thumbAdmin}
                        alt="Admin Manager"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    {/* Round Purple User Icon overlapping photo */}
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#3d325a] text-white flex items-center justify-center -mt-3.5 sm:-mt-4 mb-1 shadow-sm border-2 border-white z-10 group-hover:scale-105 transition-transform">
                      <User className="w-3.5 h-3.5 text-purple-100" />
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
                      Admin / Staff
                    </h4>
                    <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 leading-snug font-medium line-clamp-2 px-0.5">
                      Operations & team
                    </p>
                    <div className="mt-2 w-7 h-7 rounded-full bg-[#3d325a] hover:bg-[#2b2340] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                      <ArrowRight className="w-3 h-3 stroke-[2.5]" />
                    </div>
                  </div>
                </div>

                {/* Quick 1-Click Demo Links */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-1.5 text-[11px] sm:text-xs">
                  <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
                    <span className="text-amber-500 font-bold">⚡</span>
                    <span>Quick Demo:</span>
                  </div>
                  <div className="flex items-center gap-2 font-bold">
                    <button
                      type="button"
                      onClick={() => handleQuickLogin('alex.morgan@society.org', 'resident')}
                      className="text-emerald-700 hover:text-emerald-900 hover:underline cursor-pointer"
                    >
                      Resident
                    </button>
                    <span className="text-slate-300">•</span>
                    <button
                      type="button"
                      onClick={() => handleQuickLogin('GRD-701', 'guard')}
                      className="text-sky-700 hover:text-sky-900 hover:underline cursor-pointer"
                    >
                      Security
                    </button>
                    <span className="text-slate-300">•</span>
                    <button
                      type="button"
                      onClick={() => handleQuickLogin('admin@society.org', 'admin')}
                      className="text-purple-700 hover:text-purple-900 hover:underline cursor-pointer"
                    >
                      Admin
                    </button>
                  </div>
                </div>
              </div>
              )}
            </div>
          </main>
          )}

          {showCommunityOverview && !showAccessControl && (
            <section
              ref={communityOverviewRef}
              className="relative z-10 mx-auto my-auto w-full max-w-[1400px] px-6 py-8 sm:px-12 lg:px-16 xl:px-20"
            >
              <div className="overflow-hidden rounded-3xl border border-white/50 bg-white/30 shadow-[0_24px_70px_-35px_rgba(9,43,29,0.55)] backdrop-blur-xl">
                <div className="relative min-h-[260px] overflow-hidden sm:min-h-[320px]">
                  <img
                    src={bgBuildings}
                    alt="Green Valley residences surrounded by landscaped gardens and a swimming pool"
                    className="absolute inset-0 h-full w-full object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#092d1e]/85 via-[#092d1e]/55 to-transparent" />
                  <div className="relative max-w-2xl px-6 py-10 text-white sm:px-10 sm:py-14">
                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-200">
                      A place to belong
                    </p>
                    <h2 className="mt-3 font-serif text-4xl font-bold leading-tight sm:text-5xl">
                      Discover Green Valley
                    </h2>
                    <p className="mt-4 max-w-xl text-base leading-relaxed text-white/90 sm:text-lg">
                      Thoughtfully planned homes, welcoming shared spaces, and a greener setting come together to make everyday living feel special.
                    </p>
                  </div>
                </div>

                <div className="grid gap-8 p-6 sm:p-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-800">
                      Community living
                    </p>
                    <h3 className="mt-2 font-serif text-3xl font-bold text-[#103b29]">
                      More than a home
                    </h3>
                    <p className="mt-3 max-w-2xl leading-relaxed text-slate-700">
                      Green Valley brings neighbors together in a comfortable residential environment, with spaces to unwind, room to connect, and thoughtful services that support day-to-day community life.
                    </p>

                    <h4 className="mt-7 text-sm font-extrabold uppercase tracking-[0.12em] text-[#1b4332]">
                      Community highlights
                    </h4>
                    <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                      {[
                        'Gated entry and visitor management',
                        'Landscaped gardens and green surroundings',
                        'Swimming pool and outdoor leisure spaces',
                        'Modern residences with shared amenities',
                        'On-site security and community support',
                        'Welcoming spaces for neighbors and families',
                      ].map((highlight) => (
                        <li key={highlight} className="flex items-start gap-2.5 text-sm leading-relaxed text-slate-700">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      type="button"
                      onClick={() => {
                        setShowCommunityOverview(false);
                      }}
                      className="mt-8 inline-flex items-center gap-2 rounded-full border border-[#1b4332]/30 bg-white/35 px-4 py-2.5 text-sm font-bold text-[#123b29] transition hover:bg-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1b4332] focus-visible:ring-offset-2"
                    >
                      Back to Welcome
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <img
                      src={thumbResident}
                      alt="Residents enjoying the landscaped community"
                      className="col-span-2 h-52 w-full rounded-2xl object-cover shadow-lg sm:h-64"
                    />
                    <img
                      src={bgAdmin}
                      alt="A welcoming shared community space"
                      className="h-36 w-full rounded-2xl object-cover shadow-md sm:h-44"
                    />
                    <img
                      src={bgGate}
                      alt="Secure community entrance"
                      className="h-36 w-full rounded-2xl object-cover shadow-md sm:h-44"
                    />
                  </div>
                </div>
              </div>
            </section>
          )}

          <footer className="relative z-10 px-6 sm:px-12 lg:px-16 xl:px-20 py-4 text-xs text-slate-700 flex items-center justify-between drop-shadow-xs">
            <div>Green Valley Residency Society Management • Registered #KA/BLR/2026/89</div>
            <div className="hidden sm:block">A Better Living Experience</div>
          </footer>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. RESIDENT LOGIN SCREEN: "WELCOME HOME" (BIG & EXTENDED)                  */}
      {/* ========================================================================= */}
      {currentScreen === 'resident' && (
        <div className="min-h-screen w-full relative flex flex-col justify-between animate-fade-in">
          {/* Background: Sunny luxury residency buildings with pool & gardens */}
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            <img
              src={bgBuildings}
              alt="Green Valley Residency"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/65 to-transparent lg:w-3/5" />
            <div className="absolute inset-0 bg-emerald-950/5" />
          </div>

          {/* Top Header */}
          <header className="relative z-20 px-6 sm:px-12 lg:px-16 xl:px-20 py-6 flex items-center justify-between">
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => navigateTo('choose')}
            >
              <div className="w-11 h-11 rounded-full bg-emerald-800 text-white flex items-center justify-center shadow-md">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-serif font-black text-slate-900 tracking-tight leading-tight">
                  Green Valley
                </h2>
                <span className="text-[11px] font-bold text-emerald-800 tracking-[0.25em] block uppercase -mt-0.5">
                  Residency
                </span>
              </div>
            </div>

            <button
              onClick={() => navigateTo('choose')}
              className="bg-white/85 hover:bg-white text-emerald-900 text-xs font-bold px-4 py-2 rounded-full border border-emerald-200 flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Choose Role</span>
            </button>
          </header>

          {/* Main Area: Moved to Left Side & Enlarged "Welcome Home" */}
          <main className="relative z-10 flex-1 flex items-center justify-center px-6 sm:px-12 lg:px-16 xl:px-20 py-6 sm:py-10 my-auto">
            <div className="max-w-[1680px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-center">
              {/* Left Side: Elegant "Welcome Home" anchored firmly on left */}
              <div className="lg:col-span-7 xl:col-span-7 space-y-4 -ml-1 sm:-ml-3 lg:-ml-6 xl:-ml-10 -translate-y-[30px]">
                <span className="text-base sm:text-lg lg:text-xl font-bold text-emerald-800 tracking-wider uppercase block">
                  Resident Member Portal
                </span>

                <h1 className="text-6xl sm:text-7xl lg:text-8xl xl:text-[92px] font-serif italic font-black text-emerald-950 tracking-tight drop-shadow-sm leading-[1.02]">
                  Welcome Home
                </h1>

                <p className="text-xl sm:text-2xl lg:text-3xl font-serif font-semibold text-emerald-950/80 max-w-2xl leading-snug drop-shadow-xs">
                  Stay connected with your community
                </p>

                {/* Sized up resident features list */}
                <div className="flex flex-wrap items-center gap-6 sm:gap-8 pt-3 text-slate-800 font-bold text-base sm:text-lg">
                  <div className="flex items-center gap-2.5">
                    <Key className="w-6 h-6 text-emerald-700 shrink-0" />
                    <span>Instant Gate Passes</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Receipt className="w-6 h-6 text-emerald-700 shrink-0" />
                    <span>Maintenance Bills</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-6 h-6 text-amber-600 shrink-0" />
                    <span>Clubhouse Amenities</span>
                  </div>
                </div>
              </div>

              {/* Right Side: Clean White Floating Login Card matching reference image */}
              <div className="lg:col-span-5 xl:col-span-5 bg-white rounded-3xl shadow-2xl p-7 sm:p-9 border border-white/90 max-w-md w-full ml-auto">
                <div className="mb-5">
                  <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Resident Login</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Your community. Your home.</p>
                </div>

                {errorMessage && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 mb-3">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {successMessage && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2 mb-3">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-700" />
                    <span>{successMessage}</span>
                  </div>
                )}

                {helperNotice && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 shrink-0 text-emerald-700" />
                      <span>{helperNotice}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setHelperNotice(null)}
                      className="text-emerald-700 hover:text-emerald-950 font-bold ml-1 text-sm leading-none cursor-pointer"
                    >
                      ×
                    </button>
                  </div>
                )}

                <form onSubmit={handleResidentSubmit} className="space-y-3.5">
                  <div>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        type="text"
                        value={resIdentifier}
                        onChange={(e) => setResIdentifier(e.target.value)}
                        placeholder="Username / Mobile Number / Email"
                        required
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-3.5 py-3 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 font-medium"
                      />
                    </div>
                  </div>

                  {authMethod === 'password' ? (
                    <div>
                      <div className="relative">
                        <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={resPassword}
                          onChange={(e) => setResPassword(e.target.value)}
                          placeholder="Password"
                          required
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-10 py-3 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 font-medium"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="relative">
                        <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                        <input
                          type="text"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value)}
                          placeholder="Enter OTP (use 8492)"
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-3.5 py-3 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 font-mono"
                        />
                      </div>
                    </div>
                  )}

                  {/* Radio options: Password / OTP */}
                  <div className="flex items-center gap-6 text-xs text-slate-700 pt-0.5">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="authMethod"
                        checked={authMethod === 'password'}
                        onChange={() => setAuthMethod('password')}
                        className="accent-emerald-700"
                      />
                      <span className="font-medium">Password</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="authMethod"
                        checked={authMethod === 'otp'}
                        onChange={() => setAuthMethod('otp')}
                        className="accent-emerald-700"
                      />
                      <span className="font-medium">OTP</span>
                    </label>
                  </div>

                  {/* Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between text-xs pt-0.5">
                    <label className="flex items-center gap-1.5 text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded accent-emerald-700"
                      />
                      <span>Remember Me</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setHelperNotice('Demo Resident Password: resident123')}
                      className="text-slate-700 hover:text-slate-950 hover:underline font-semibold cursor-pointer text-xs"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  {/* Resident green login action */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3.5 px-4 rounded-xl shadow-md shadow-emerald-900/20 transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 text-sm mt-2"
                  >
                    <span>{authMethod === 'otp' && !otpSent ? 'Send OTP Code' : 'Login'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="pt-1 text-center text-xs text-slate-600">
                    New Resident?{' '}
                    <span
                      onClick={() => setHelperNotice('Community Office: office@greenvalley.org • Ext 104 • Reception Block A')}
                      className="text-emerald-700 font-bold hover:text-emerald-950 hover:underline cursor-pointer"
                    >
                      Contact Community Office
                    </span>
                  </div>

                  {/* Bottom Shield Privacy Pill */}
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-500">
                    <Shield className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span>Your data is safe with us. We value your privacy.</span>
                  </div>

                  {/* Quick 1-click test button */}
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('alex.morgan@society.org', 'resident')}
                    className="w-full text-center text-xs text-emerald-800 font-semibold bg-emerald-50 hover:bg-emerald-100 py-1.5 rounded-lg border border-emerald-100 transition-colors cursor-pointer"
                  >
                    ⚡ Instant Demo: Alex Morgan (Flat B-402)
                  </button>
                </form>
              </div>
            </div>
          </main>

          {/* Bottom monochrome community links */}
          <footer className="relative z-10 bg-white/90 border-t border-slate-200 text-slate-700 px-6 sm:px-12 lg:px-16 xl:px-20 py-3.5 flex items-center justify-between text-xs sm:text-sm font-semibold">
            <div className="flex items-center gap-8 sm:gap-14 mx-auto">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-emerald-700" />
                <span>Amenities</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Calendar className="w-5 h-5 text-emerald-700" />
                <span>Events</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Bell className="w-5 h-5 text-amber-600" />
                <span>Notices</span>
              </div>
              <div className="flex items-center gap-2.5">
                <MessageSquare className="w-5 h-5 text-emerald-700" />
                <span>Community Chat</span>
              </div>
            </div>
          </footer>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SECURITY GATE LOGIN SCREEN: "SECURITY PORTAL" (BIG & EXTENDED)        */}
      {/* ========================================================================= */}
      {currentScreen === 'guard' && (
        <div className="min-h-screen w-full relative flex flex-col justify-between animate-fade-in text-white">
          {/* Background: Dusk/twilight security gate entrance with boom barrier and guard checkpoint */}
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            <img
              src={bgGate}
              alt="Green Valley Security Gate"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-blue-950/90 via-slate-950/45 to-blue-950/65" />
          </div>

          {/* Top Header */}
          <header className="relative z-20 px-6 sm:px-12 lg:px-16 xl:px-20 py-6 flex items-center justify-between">
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => navigateTo('choose')}
            >
              <div className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center shadow-md border border-white/20">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-serif font-black text-white tracking-tight leading-tight">
                  Green Valley
                </h2>
                <span className="text-[11px] font-bold text-sky-200 tracking-[0.25em] block uppercase -mt-0.5">
                  Residency
                </span>
              </div>
            </div>

            <div className="flex items-center gap-5">
              <div className="flex items-center gap-2.5 text-sm font-bold text-slate-200">
                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                <span>Gate: Main Entrance Checkpoint</span>
              </div>

              <button
                onClick={() => navigateTo('choose')}
                className="bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-4 py-2 rounded-full border border-white/30 flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Choose Role</span>
              </button>
            </div>
          </header>

          {/* Main Area: Moved to Left Side & Enlarged Security Section */}
          <main className="relative z-10 flex-1 flex items-center justify-center px-6 sm:px-12 lg:px-16 xl:px-20 py-6 sm:py-10 my-auto">
            <div className="max-w-[1680px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-center">
              {/* Left Column: Sized Up Security Headings & Feature List anchored to left */}
              <div className="lg:col-span-7 xl:col-span-7 space-y-5 -ml-1 sm:-ml-3 lg:-ml-6 xl:-ml-10 text-white">
                <div>
                  <span className="text-base sm:text-lg lg:text-xl font-bold text-sky-200 tracking-wider uppercase block mb-1">
                    Terminal Operations Checkpoint
                  </span>
                  <h1 className="text-6xl sm:text-7xl lg:text-8xl xl:text-[88px] font-serif font-black text-white tracking-tight leading-[1.02] drop-shadow-md">
                    Security Gate <br />
                    <span className="text-sky-200">Terminal</span>
                  </h1>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-medium text-slate-200 mt-2 max-w-2xl leading-relaxed">
                    24/7 Monitored Barrier, Optical Visitor Scans & SOS Hotline
                  </p>
                </div>

                {/* Sized up feature list with icons */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2 text-slate-100 font-bold text-base sm:text-lg">
                  <div className="flex items-center gap-2.5 hover:text-white transition-colors">
                    <Users className="w-6 h-6 text-sky-300 shrink-0" />
                    <span>Visitors</span>
                  </div>
                  <div className="flex items-center gap-2.5 hover:text-white transition-colors">
                    <Car className="w-6 h-6 text-cyan-300 shrink-0" />
                    <span>Vehicles</span>
                  </div>
                  <div className="flex items-center gap-2.5 hover:text-white transition-colors">
                    <Package className="w-6 h-6 text-amber-300 shrink-0" />
                    <span>Deliveries</span>
                  </div>
                  <div className="flex items-center gap-2.5 hover:text-white transition-colors">
                    <ShieldAlert className="w-6 h-6 text-rose-300 shrink-0" />
                    <span>Emergency</span>
                  </div>
                  <div className="flex items-center gap-2.5 hover:text-white transition-colors">
                    <Video className="w-6 h-6 text-blue-300 shrink-0" />
                    <span>CCTV</span>
                  </div>
                  <div className="flex items-center gap-2.5 hover:text-white transition-colors">
                    <Key className="w-6 h-6 text-emerald-300 shrink-0" />
                    <span>Gate Pass</span>
                  </div>
                </div>

                {/* Bottom Security First emblem (Large & Extended) */}
                <div className="pt-6 flex items-center gap-4 border-t border-white/20">
                  <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-300/40 flex items-center justify-center text-sky-200 shadow-md">
                    <Shield className="w-7 h-7" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-white uppercase tracking-wider">Security First</h5>
                    <p className="text-xs sm:text-sm text-slate-300">Safe Community, Strong Tomorrow</p>
                  </div>
                </div>
              </div>

              {/* Right Column: Security login card */}
              <div className="lg:col-span-5 xl:col-span-5 bg-white rounded-3xl shadow-2xl p-7 sm:p-9 border border-sky-100 max-w-md w-full ml-auto text-slate-900">
                <div className="flex items-center gap-3.5 mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700 shrink-0 shadow-xs">
                    <Shield className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-blue-950 tracking-tight">Security Portal</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Secure the community. Protect every resident.</p>
                  </div>
                </div>

                {errorMessage && (
                  <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2 mb-3">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {successMessage && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2 mb-3">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-700" />
                    <span>{successMessage}</span>
                  </div>
                )}

                {helperNotice && (
                  <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 text-blue-950 text-xs flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 shrink-0 text-sky-700" />
                      <span>{helperNotice}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setHelperNotice(null)}
                      className="text-sky-700 hover:text-blue-950 font-bold ml-1 text-sm leading-none cursor-pointer"
                    >
                      ×
                    </button>
                  </div>
                )}

                <form onSubmit={handleGuardSubmit} className="space-y-3.5">
                  <div>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        type="text"
                        value={guardBadgeInput}
                        onChange={(e) => setGuardBadgeInput(e.target.value)}
                        placeholder="Guard ID / Employee ID"
                        required
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-3.5 py-3 text-xs text-slate-900 focus:outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-100 font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={guardPinInput}
                        onChange={(e) => setGuardPinInput(e.target.value)}
                        placeholder="Password / PIN"
                        required
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-10 py-3 text-xs text-slate-900 focus:outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-100 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-900 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Security blue login action */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-800 hover:bg-blue-900 text-white font-bold py-3.5 px-4 rounded-xl shadow-md shadow-blue-900/20 transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 text-sm mt-2"
                  >
                    <span>Secure Login</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => setHelperNotice('Security PIN is: guard123')}
                      className="text-xs text-sky-700 hover:text-blue-950 cursor-pointer"
                    >
                      Forgot PIN?
                    </button>
                  </div>

                  {/* Emergency contact action */}
                  <button
                    type="button"
                    onClick={() => setHelperNotice('Emergency dispatch line: +91 98888 22222 (Gate Supervisor)')}
                    className="w-full bg-white hover:bg-sky-50 border border-sky-200 text-blue-900 text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5 text-sky-700" />
                    <span>Emergency Contact</span>
                  </button>

                  {/* Bottom On Duty & Shift Row */}
                  <div className="pt-2 flex items-center justify-between text-xs text-slate-600 border-t border-slate-200">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span>On Duty</span>
                    </div>
                    <span className="text-slate-500 font-mono text-[11px]">Shift: Day ⌄</span>
                  </div>

                  {/* 1-click test button */}
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('GRD-701', 'guard')}
                    className="w-full text-center text-xs text-blue-900 font-semibold bg-sky-50 hover:bg-sky-100 py-1.5 rounded-lg border border-sky-200 transition-colors cursor-pointer"
                  >
                    ⚡ Instant Demo: Suresh Rao (Gate 1)
                  </button>
                </form>
              </div>
            </div>
          </main>

          <footer className="relative z-10 px-6 sm:px-12 lg:px-16 xl:px-20 py-4 text-xs text-slate-400 flex items-center justify-between">
            <div>Gate Terminal 01 • Optical Scanner Ready</div>
            <div>24/7 Security Operations</div>
          </footer>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. ADMIN LOGIN SCREEN: "COMMUNITY ADMINISTRATION" (BIG & EXTENDED)        */}
      {/* ========================================================================= */}
      {currentScreen === 'admin' && (
        <div className="min-h-screen w-full relative flex flex-col justify-between animate-fade-in">
          {/* Background: Modern luxury clubhouse management office reception lobby */}
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            <img
              src={bgAdmin}
              alt="Community Administration HQ"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-transparent lg:w-3/5" />
            <div className="absolute inset-0 bg-indigo-950/5" />
          </div>

          {/* Top Header */}
          <header className="relative z-20 px-6 sm:px-12 lg:px-16 xl:px-20 py-6 flex items-center justify-between">
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => navigateTo('choose')}
            >
              <div className="w-11 h-11 rounded-full bg-indigo-800 text-white flex items-center justify-center shadow-md">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-serif font-black text-slate-900 tracking-tight leading-tight">
                  Green Valley
                </h2>
                <span className="text-[11px] font-bold text-indigo-800 tracking-[0.25em] block uppercase -mt-0.5">
                  Residency
                </span>
              </div>
            </div>

            <div className="flex items-center gap-5">
              <div className="hidden md:flex items-center gap-3 text-sm font-bold text-slate-800">
                <span>Manage</span>
                <span className="text-slate-400">|</span>
                <span>Maintain</span>
                <span className="text-slate-400">|</span>
                <span>Build a Better Community</span>
              </div>

              <button
                onClick={() => navigateTo('choose')}
                className="bg-white/85 hover:bg-white text-indigo-900 text-xs font-bold px-4 py-2 rounded-full border border-indigo-200 flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Choose Role</span>
              </button>
            </div>
          </header>

          {/* Main Area: Moved to Left Side & Enlarged Community Administration */}
          <main className="relative z-10 flex-1 flex items-center justify-center px-6 sm:px-12 lg:px-16 xl:px-20 py-6 sm:py-10 my-auto">
            <div className="max-w-[1680px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-center">
              {/* Left Column: Sized Up "Community Administration" + 9 Features anchored firmly to left */}
              <div className="lg:col-span-7 xl:col-span-7 space-y-4 -ml-1 sm:-ml-3 lg:-ml-6 xl:-ml-10">
                <div>
                  <span className="text-base sm:text-lg lg:text-xl font-bold text-indigo-800 tracking-wider uppercase block mb-1">
                    Estate Management Headquarters
                  </span>
                  <h1 className="text-6xl sm:text-7xl lg:text-8xl xl:text-[88px] font-serif font-black text-indigo-950 tracking-tight leading-[1.02]">
                    Community <br />
                    Administration
                  </h1>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-serif font-semibold text-indigo-900/80 mt-2 max-w-2xl leading-relaxed">
                    Manage your community smarter.
                  </p>
                </div>

                {/* 9 Features list matching reference image (Sized up 3-column grid) */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 pt-2 text-base sm:text-lg font-bold text-slate-900">
                  <div className="flex items-center gap-2.5">
                    <Users className="w-6 h-6 text-indigo-700 shrink-0" />
                    <span>Residents</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Wrench className="w-6 h-6 text-indigo-700 shrink-0" />
                    <span>Maintenance</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <User className="w-6 h-6 text-indigo-700 shrink-0" />
                    <span>Staff</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <MessageSquare className="w-6 h-6 text-violet-700 shrink-0" />
                    <span>Complaints</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CreditCard className="w-6 h-6 text-emerald-700 shrink-0" />
                    <span>Payments</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Building2 className="w-6 h-6 text-indigo-700 shrink-0" />
                    <span>Amenities</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-6 h-6 text-sky-700 shrink-0" />
                    <span>Visitor Desk</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <BarChart3 className="w-6 h-6 text-violet-700 shrink-0" />
                    <span>Reports</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Bell className="w-6 h-6 text-amber-600 shrink-0" />
                    <span>Notifications</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Admin login card */}
              <div className="lg:col-span-5 xl:col-span-5 bg-white rounded-3xl shadow-2xl p-7 sm:p-9 border border-indigo-100 max-w-md w-full ml-auto">
                <div className="mb-5">
                  <h3 className="text-2xl font-bold text-indigo-950 tracking-tight">Admin / Staff Login</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Authorized personnel only.</p>
                </div>

                {errorMessage && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 mb-3">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {successMessage && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2 mb-3">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-700" />
                    <span>{successMessage}</span>
                  </div>
                )}

                {helperNotice && (
                  <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-950 text-xs flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 shrink-0 text-indigo-700" />
                      <span>{helperNotice}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setHelperNotice(null)}
                      className="text-indigo-700 hover:text-indigo-950 font-bold ml-1 text-sm leading-none cursor-pointer"
                    >
                      ×
                    </button>
                  </div>
                )}

                <form onSubmit={handleAdminSubmit} className="space-y-3.5">
                  <div>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        type="email"
                        value={adminEmailInput}
                        onChange={(e) => setAdminEmailInput(e.target.value)}
                        placeholder="Admin Email / Employee ID"
                        required
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-3.5 py-3 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={adminKeyInput}
                        onChange={(e) => setAdminKeyInput(e.target.value)}
                        placeholder="Password"
                        required
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-10 py-3 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between text-xs pt-0.5">
                    <label className="flex items-center gap-1.5 text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded accent-indigo-700"
                      />
                      <span>Remember Me</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setHelperNotice('Demo Admin password is: admin123')}
                      className="text-indigo-700 hover:text-indigo-950 hover:underline font-semibold cursor-pointer text-xs"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  {/* Admin indigo login action */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-indigo-700 hover:bg-indigo-800 text-white font-bold py-3.5 px-4 rounded-xl shadow-md shadow-indigo-900/20 transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 text-sm mt-2"
                  >
                    <span>Login</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  {/* Contact IT Support button matching reference */}
                  <button
                    type="button"
                    onClick={() => setHelperNotice('IT Support: support@greenvalley.org • Helpline: 1800-MYGATE')}
                    className="w-full border border-indigo-200 hover:bg-indigo-50 text-indigo-900 text-xs font-semibold py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer mt-2"
                  >
                    <Headphones className="w-3.5 h-3.5 text-indigo-700" />
                    <span>Contact IT Support</span>
                  </button>

                  {/* 1-click test button */}
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('admin@society.org', 'admin')}
                    className="w-full text-center text-xs text-indigo-900 font-semibold bg-indigo-50 hover:bg-indigo-100 py-1.5 rounded-lg border border-indigo-100 transition-colors cursor-pointer"
                  >
                    ⚡ Instant Demo: Dr. Arvind Malhotra (Chairman)
                  </button>
                </form>
              </div>
            </div>
          </main>

          <footer className="relative z-10 px-6 sm:px-12 lg:px-16 xl:px-20 py-4 text-xs text-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-700" />
              <span>Efficient Management • Thriving Community</span>
            </div>
            <div>FY 2025-2026 Active Financial Year</div>
          </footer>
        </div>
      )}
    </div>
  );
};
