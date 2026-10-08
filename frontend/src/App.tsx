/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { SocietyProvider, useSociety } from './context/SocietyContext';
import { Header } from './components/Header';
import { IncomingVisitorAlert } from './components/common/IncomingVisitorAlert';
import { ResidentView } from './components/resident/ResidentView';
import { GuardView } from './components/guard/GuardView';
import { AdminView } from './components/admin/AdminView';
import { GuestPassView } from './components/guest/GuestPassView';
import { AuthPortal } from './components/auth/AuthPortal';
import { SidebarPanel } from './components/navigation/SidebarPanel';
import { UserRole } from './types';

const MainAppContent: React.FC = () => {
  const { currentUser } = useSociety();
  const [vpassQueryToken, setVpassQueryToken] = useState<string | null>(null);
  const [initialPortal, setInitialPortal] = useState<UserRole>('resident');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('vpass');
      if (token) {
        setVpassQueryToken(token);
      }

      const portalParam = (params.get('portal') || params.get('role'))?.toLowerCase();
      if (portalParam === 'guard' || portalParam === 'security') {
        setInitialPortal('guard');
      } else if (portalParam === 'admin' || portalParam === 'committee') {
        setInitialPortal('admin');
      } else if (portalParam === 'resident' || portalParam === 'user') {
        setInitialPortal('resident');
      }
    }
  }, []);

  const handleExitGuestView = () => {
    setVpassQueryToken(null);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('vpass');
      window.history.replaceState({}, '', url.toString());
    }
  };

  // If visitor is viewing their gate QR pass via public link
  if (vpassQueryToken) {
    return <GuestPassView passToken={vpassQueryToken} onExit={handleExitGuestView} />;
  }

  if (!currentUser) {
    return <AuthPortal initialPortal={initialPortal} />;
  }

  return (
    <div className="h-dvh max-h-dvh w-full overflow-hidden bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-600 selection:text-white">
      <Header />
      <div className="flex-1 min-h-0 flex overflow-hidden">
        <SidebarPanel />
        <main className="flex-1 min-w-0 min-h-0 overflow-x-hidden overflow-y-auto overscroll-y-contain">
          {currentUser.role === 'resident' && <ResidentView />}
          {currentUser.role === 'guard' && <GuardView />}
          {currentUser.role === 'admin' && <AdminView />}
        </main>
      </div>
      {currentUser.role === 'resident' && <IncomingVisitorAlert />}
    </div>
  );
};

export default function App() {
  return (
    <SocietyProvider>
      <MainAppContent />
    </SocietyProvider>
  );
}
