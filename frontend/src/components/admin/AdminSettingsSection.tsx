import React, { useEffect, useMemo, useState } from 'react';
import {
  Bell,
  Building2,
  CalendarDays,
  ChevronRight,
  Clock3,
  Cloud,
  CreditCard,
  Database,
  Download,
  Globe2,
  HardDriveDownload,
  MessageSquare,
  Settings,
  Shield,
  ShieldCheck,
  Users,
  UserRound,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import { useSociety } from '../../context/SocietyContext';

type SettingsCategory =
  | 'General Settings'
  | 'Society Details'
  | 'Maintenance'
  | 'Notifications'
  | 'Gate & Access'
  | 'Integrations'
  | 'Backup & Data';

type SettingKey =
  | 'visitorPreApproval'
  | 'visitorOtp'
  | 'vehicleAccess'
  | 'securityAlerts'
  | 'smsNotifications'
  | 'emailNotifications'
  | 'appNotifications'
  | 'noticeBoard'
  | 'autoReminders';

const categories: SettingsCategory[] = [
  'General Settings',
  'Society Details',
  'Maintenance',
  'Notifications',
  'Gate & Access',
  'Integrations',
  'Backup & Data',
];

const preferenceDefaults: Record<SettingKey, boolean> = {
  visitorPreApproval: true,
  visitorOtp: true,
  vehicleAccess: true,
  securityAlerts: true,
  smsNotifications: true,
  emailNotifications: true,
  appNotifications: true,
  noticeBoard: true,
  autoReminders: true,
};

const categoryForPanel: Record<string, SettingsCategory> = {
  'Society Information': 'Society Details',
  'Profile & Access': 'General Settings',
  'Manage Members & Roles': 'Society Details',
  'Visitor & Security Settings': 'Gate & Access',
  'Communication Settings': 'Notifications',
  'Billing & Accounts': 'Maintenance',
  'System & Application Settings': 'Integrations',
  'Data & Backup': 'Backup & Data',
};

const readPreferences = (storageKey: string): Record<SettingKey, boolean> => {
  try {
    const saved = localStorage.getItem(storageKey);
    return saved ? { ...preferenceDefaults, ...JSON.parse(saved) as Partial<Record<SettingKey, boolean>> } : preferenceDefaults;
  } catch (error) {
    console.error('Could not read saved admin settings.', error);
    return preferenceDefaults;
  }
};

export const AdminSettingsSection: React.FC = () => {
  const {
    bills,
    currentUser,
    currentSocietyName,
    flats,
    setActiveSidebarNav,
    societies,
    staff,
    users,
  } = useSociety();
  const [activeCategory, setActiveCategory] = useState<SettingsCategory>('General Settings');
  const preferenceStorageKey = `mygate-admin-settings:${currentSocietyName}`;
  const [preferences, setPreferences] = useState<Record<SettingKey, boolean>>(() => readPreferences(preferenceStorageKey));
  const [notice, setNotice] = useState('');

  const society = societies.find((entry) => entry.name === currentSocietyName);
  const societyFlats = flats.filter((flat) => flat.societyName === currentSocietyName);
  const residents = users.filter((user) => user.role === 'resident' && user.societyName === currentSocietyName);
  const societyStaff = staff.filter((person) => person.societyName === currentSocietyName);
  const societyBills = bills.filter((bill) => bill.societyName === currentSocietyName);

  useEffect(() => {
    try {
      localStorage.setItem(preferenceStorageKey, JSON.stringify(preferences));
    } catch (error) {
      console.error('Could not save admin settings.', error);
      setNotice('Settings could not be saved in this browser.');
    }
  }, [preferences, preferenceStorageKey]);

  const visiblePanels = useMemo(() => {
    const panels = [
      'Society Information',
      'Profile & Access',
      'Manage Members & Roles',
      'Visitor & Security Settings',
      'Communication Settings',
      'Billing & Accounts',
      'System & Application Settings',
      'Data & Backup',
    ];
    if (activeCategory === 'General Settings') return panels;
    return panels.filter((panel) => categoryForPanel[panel] === activeCategory);
  }, [activeCategory]);

  const setPreference = (key: SettingKey) => {
    setPreferences((current) => ({ ...current, [key]: !current[key] }));
  };

  const downloadSocietyData = () => {
    const content = {
      exportedAt: new Date().toISOString(),
      society: society || { name: currentSocietyName },
      flats: societyFlats,
      residents,
      staff: societyStaff,
      maintenanceBills: societyBills,
    };
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' }));
    link.download = `${currentSocietyName.replace(/[^a-z0-9-_]/gi, '-')}-mygate-export.json`;
    link.click();
    URL.revokeObjectURL(link.href);
    setNotice('Society data export downloaded.');
  };

  const goToCategory = (category: SettingsCategory) => {
    setActiveCategory(category);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const Toggle = ({ settingKey, label, description }: { settingKey: SettingKey; label: string; description: string }) => (
    <button
      aria-checked={preferences[settingKey]}
      aria-label={`${label}: ${preferences[settingKey] ? 'Enabled' : 'Disabled'}`}
      className="flex w-full items-center justify-between gap-3 rounded-lg px-1 py-1.5 text-left transition hover:bg-slate-50"
      onClick={() => setPreference(settingKey)}
      role="switch"
      type="button"
    >
      <span className="flex min-w-0 items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
          <ShieldCheck className="h-4 w-4" />
        </span>
        <span className="min-w-0">
          <span className="block text-[11px] font-medium text-slate-700">{label}</span>
          <span className="block text-[10px] text-slate-400">{description}</span>
        </span>
      </span>
      <span className={`relative h-3.5 w-6 shrink-0 rounded-full transition-colors ${preferences[settingKey] ? 'bg-emerald-500' : 'bg-slate-300'}`}>
        <span className={`absolute top-0.5 h-2.5 w-2.5 rounded-full bg-white shadow-sm transition-transform ${preferences[settingKey] ? 'translate-x-3' : 'translate-x-0.5'}`} />
      </span>
    </button>
  );

  const Panel = ({
    title,
    description,
    icon: Icon,
    action,
    children,
    className = '',
  }: {
    title: string;
    description: string;
    icon: LucideIcon;
    action?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
  }) => (
    <section className={`rounded-2xl border border-sky-100 bg-white p-4 shadow-sm sm:p-5 ${className}`}>
      <div className="mb-3.5 flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-blue-700"><Icon className="h-5 w-5" /></span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-bold text-slate-900">{title}</span>
            <span className="block truncate text-xs text-slate-500">{description}</span>
          </span>
        </div>
        {action}
      </div>
      {children}
    </section>
  );

  const ManageButton = ({ category }: { category: SettingsCategory }) => (
    <button
      className="shrink-0 rounded-md border border-blue-200 px-2.5 py-1 text-[10px] font-semibold text-blue-700 transition hover:bg-blue-50"
      onClick={() => goToCategory(category)}
      type="button"
    >
      Manage
    </button>
  );

  return (
    <div className="mx-auto w-full max-w-none space-y-4 px-4 py-5 sm:px-6 lg:px-8 2xl:px-10">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Admin Settings</h1>
          <p className="mt-1 text-sm text-slate-500">Manage your society settings, preferences and configurations.</p>
        </div>
        <span className="hidden h-16 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-100 to-blue-50 text-blue-500 sm:flex">
          <Settings className="h-9 w-9" />
        </span>
      </header>

      <nav aria-label="Settings categories" className="flex gap-1 overflow-x-auto rounded-lg border border-sky-100 bg-white p-1.5">
        {categories.map((category) => (
          <button
            aria-current={activeCategory === category ? 'page' : undefined}
            className={`shrink-0 border-b-2 px-3 py-2 text-[10px] font-semibold transition sm:text-[11px] ${activeCategory === category ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-blue-700'}`}
            key={category}
            onClick={() => setActiveCategory(category)}
            type="button"
          >
            {category}
          </button>
        ))}
      </nav>

      {notice && (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800" role="status">
          {notice}
        </p>
      )}

      <div className="grid items-stretch gap-4 xl:grid-cols-6">
        {visiblePanels.includes('Society Information') && (
          <Panel
            className="xl:col-span-3"
            description="Update your society basic details and contact information."
            icon={Building2}
            title="Society Information"
            action={<ManageButton category="Society Details" />}
          >
            <div className="grid gap-x-4 sm:grid-cols-2">
              <dl className="space-y-2 text-[10px]">
                <div><dt className="text-slate-400">Society Name</dt><dd className="mt-0.5 font-medium text-slate-800">{society?.name || currentSocietyName}</dd></div>
                <div><dt className="text-slate-400">Address</dt><dd className="mt-0.5 font-medium text-slate-700">{society?.propertyAddress || 'Not recorded'}</dd></div>
                <div><dt className="text-slate-400">Phone</dt><dd className="mt-0.5 font-medium text-slate-700">{society?.mobileNumber || 'Not recorded'}</dd></div>
                <div><dt className="text-slate-400">Email</dt><dd className="mt-0.5 font-medium text-slate-700">{currentUser?.email || 'Not recorded'}</dd></div>
              </dl>
              <dl className="space-y-2 border-t border-slate-100 pt-2 text-[10px] sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
                <div><dt className="text-slate-400">Total Flats</dt><dd className="mt-0.5 font-medium text-slate-800">{society?.totalFlats || societyFlats.length}</dd></div>
                <div><dt className="text-slate-400">Total Members</dt><dd className="mt-0.5 font-medium text-slate-800">{residents.length + societyStaff.length}</dd></div>
                <div><dt className="text-slate-400">Active Residents</dt><dd className="mt-0.5 font-medium text-slate-800">{residents.length}</dd></div>
                <div><dt className="text-slate-400">Society Type</dt><dd className="mt-0.5 font-medium text-slate-800">{society?.flatType || 'Not recorded'}</dd></div>
              </dl>
            </div>
          </Panel>
        )}

        {visiblePanels.includes('Profile & Access') && (
          <Panel className="xl:col-span-3" description="Manage admin profile and access control." icon={Shield} title="Profile & Access" action={<ManageButton category="General Settings" />}>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-2.5 border-r border-slate-100 pr-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500 text-base font-bold text-white">{currentUser?.name?.charAt(0).toUpperCase() || 'A'}</span>
                <dl className="min-w-0 space-y-1 text-[10px]">
                  <div><dt className="text-slate-400">Admin Name</dt><dd className="truncate font-semibold text-slate-800">{currentUser?.name || 'Admin'}</dd></div>
                  <div><dt className="text-slate-400">Role</dt><dd className="font-medium text-slate-700">Society Admin</dd></div>
                  <div><dt className="text-slate-400">Email</dt><dd className="truncate font-medium text-slate-700">{currentUser?.email || 'Not recorded'}</dd></div>
                </dl>
              </div>
              <ul className="divide-y divide-slate-100 text-[10px] text-slate-600">
                {['Change Password', 'Two-Factor Authentication', 'Login Activity', 'Login Devices'].map((item, index) => (
                  <li className="flex items-center justify-between gap-2 py-1.5 first:pt-0 last:pb-0" key={item}>
                    <span>{item}</span>
                    {index === 1 ? <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[9px] font-semibold text-white">Enabled</span> : <ChevronRight className="h-3.5 w-3.5 text-slate-400" />}
                  </li>
                ))}
              </ul>
            </div>
          </Panel>
        )}

        {visiblePanels.includes('Manage Members & Roles') && (
          <Panel className="xl:col-span-2" description="Add or remove members and manage their roles." icon={Users} title="Manage Members & Roles" action={<ManageButton category="Society Details" />}>
            <div className="space-y-1.5">
              {[
                { label: 'Family Members', value: `${residents.length} members`, icon: Users, nav: 'community' as const },
                { label: 'Staff Members', value: `${societyStaff.length} members`, icon: UserRound, nav: 'staff' as const },
                { label: 'Roles & Permissions', value: 'Manage access roles', icon: ShieldCheck, nav: 'staff' as const },
              ].map(({ label, value, icon: Icon, nav }) => (
                <button className="flex w-full items-center gap-2.5 rounded-lg px-1 py-1.5 text-left hover:bg-slate-50" key={label} onClick={() => setActiveSidebarNav(nav)} type="button">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-700"><Icon className="h-3.5 w-3.5" /></span>
                  <span className="min-w-0 flex-1"><span className="block text-[10px] font-medium text-slate-700">{label}</span><span className="block text-[9px] text-slate-400">{value}</span></span>
                  <ChevronRight className="h-3 w-3 text-slate-400" />
                </button>
              ))}
            </div>
          </Panel>
        )}

        {visiblePanels.includes('Visitor & Security Settings') && (
          <Panel className="xl:col-span-2" description="Configure visitor access and security preferences." icon={ShieldCheck} title="Visitor & Security Settings" action={<ManageButton category="Gate & Access" />}>
            <div className="space-y-0.5">
              <Toggle settingKey="visitorPreApproval" label="Visitor Pre-Approval" description="Require resident approval" />
              <Toggle settingKey="visitorOtp" label="OTP for Visitors" description="Verify visitor at entry" />
              <Toggle settingKey="vehicleAccess" label="Vehicle Access" description="Allow vehicle registration" />
              <Toggle settingKey="securityAlerts" label="Security Alerts" description="Notify on security events" />
            </div>
          </Panel>
        )}

        {visiblePanels.includes('Communication Settings') && (
          <Panel className="xl:col-span-2" description="Manage notifications and communication preferences." icon={MessageSquare} title="Communication Settings" action={<ManageButton category="Notifications" />}>
            <div className="space-y-0.5">
              <Toggle settingKey="smsNotifications" label="SMS Notifications" description="Resident and admin SMS" />
              <Toggle settingKey="emailNotifications" label="Email Notifications" description="Updates by email" />
              <Toggle settingKey="appNotifications" label="App Notifications" description="In-app alerts" />
              <Toggle settingKey="noticeBoard" label="Notice Board" description="Publish society notices" />
            </div>
          </Panel>
        )}

        {visiblePanels.includes('Billing & Accounts') && (
          <Panel className="xl:col-span-2" description="Manage dues, payments and account settings." icon={CreditCard} title="Billing & Accounts" action={<ManageButton category="Maintenance" />}>
            <div className="space-y-1.5">
              {[
                { label: 'Maintenance Dues', value: `${societyBills.length} bills`, icon: Users },
                { label: 'Payment Gateway', value: 'Payment configuration', icon: CreditCard },
              ].map(({ label, value, icon: Icon }) => (
                <button className="flex w-full items-center gap-2.5 rounded-lg px-1 py-1.5 text-left hover:bg-slate-50" key={label} onClick={() => setActiveSidebarNav('accounting')} type="button">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-700"><Icon className="h-3.5 w-3.5" /></span>
                  <span className="min-w-0 flex-1"><span className="block text-[10px] font-medium text-slate-700">{label}</span><span className="block text-[9px] text-slate-400">{value}</span></span>
                  <ChevronRight className="h-3 w-3 text-slate-400" />
                </button>
              ))}
              <Toggle settingKey="autoReminders" label="Auto Reminders" description="Send maintenance reminders" />
            </div>
          </Panel>
        )}

        {visiblePanels.includes('System & Application Settings') && (
          <Panel className="xl:col-span-2" description="Configure system behavior and application settings." icon={Wrench} title="System & Application Settings" action={<ManageButton category="Integrations" />}>
            <div className="space-y-1.5">
              {[
                { label: 'Language', value: 'English', icon: Globe2 },
                { label: 'Date & Time', value: new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date()), icon: CalendarDays },
                { label: 'Time Zone', value: Intl.DateTimeFormat().resolvedOptions().timeZone, icon: Clock3 },
                { label: 'Theme', value: 'Light', icon: Bell },
              ].map(({ label, value, icon: Icon }) => (
                <div className="flex items-center gap-2.5 px-1 py-1" key={label}>
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-700"><Icon className="h-3.5 w-3.5" /></span>
                  <span className="min-w-0 flex-1 text-[10px] text-slate-600">{label}</span>
                  <span className="truncate text-[9px] text-slate-500">{value}</span>
                  <ChevronRight className="h-3 w-3 text-slate-400" />
                </div>
              ))}
            </div>
          </Panel>
        )}

        {visiblePanels.includes('Data & Backup') && (
          <Panel className="xl:col-span-2" description="Manage your data and create backups." icon={Database} title="Data & Backup" action={<ManageButton category="Backup & Data" />}>
            <div className="space-y-1.5">
              <button className="flex w-full items-center gap-2.5 rounded-lg px-1 py-1.5 text-left hover:bg-slate-50" onClick={downloadSocietyData} type="button">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-700"><Cloud className="h-3.5 w-3.5" /></span>
                <span className="min-w-0 flex-1"><span className="block text-[10px] font-medium text-slate-700">Backup Now</span><span className="block text-[9px] text-slate-400">Download a society data backup</span></span>
                <ChevronRight className="h-3 w-3 text-slate-400" />
              </button>
              <button className="flex w-full items-center gap-2.5 rounded-lg px-1 py-1.5 text-left hover:bg-slate-50" onClick={downloadSocietyData} type="button">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-700"><Download className="h-3.5 w-3.5" /></span>
                <span className="min-w-0 flex-1"><span className="block text-[10px] font-medium text-slate-700">Data Export</span><span className="block text-[9px] text-slate-400">Export society data as JSON</span></span>
                <ChevronRight className="h-3 w-3 text-slate-400" />
              </button>
              <div className="flex items-center gap-2.5 px-1 py-1.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-700"><HardDriveDownload className="h-3.5 w-3.5" /></span>
                <span className="min-w-0 flex-1"><span className="block text-[10px] font-medium text-slate-700">Restore Data</span><span className="block text-[9px] text-slate-400">Restore from a server backup</span></span>
                <span className="text-[9px] text-slate-400">Unavailable</span>
              </div>
            </div>
          </Panel>
        )}
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-2 text-[9px] text-slate-400">
        <span>MyGate · Society Administration</span>
        <span>Society preferences are saved in this browser.</span>
      </footer>
    </div>
  );
};
