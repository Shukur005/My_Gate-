import React, { useState } from 'react';
import { useSociety } from '../../context/SocietyContext';
import { SidebarNavId } from '../../types';
import {
  Search,
  LayoutGrid,
  Building,
  Users,
  Megaphone,
  MessageSquare,
  LifeBuoy,
  UserCheck,
  Calendar,
  Package,
  TrendingUp,
  Settings,
  X,
  ChevronLeft,
  ChevronRight,
  Send,
  CheckCircle2,
  Clock,
  ExternalLink,
  Shield,
  Home,
  Building2,
  Phone,
  Mail,
  Check,
  Trash2,
} from 'lucide-react';

interface SidebarItem {
  id: SidebarNavId;
  label: string;
  category: string;
  icon: (active: boolean) => React.ReactNode;
}

export const SidebarPanel: React.FC = () => {
  const {
    activeSidebarNav,
    setActiveSidebarNav,
    currentUser,
    role,
    flats,
    visitors,
    bills,
    notices,
    staff,
    activeFlat,
    currentSocietyName,
    updateVisitorStatus,
    deleteVisitorPass,
  } = useSociety();

  // Modals controlled by sidebar icons
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [menuFilter, setMenuFilter] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatMessages, setChatMessages] = useState<
    Array<{ id: string; sender: string; unit: string; text: string; time: string; role: string }>
  >([
    {
      id: 'msg-1',
      sender: 'Dr. Arvind Malhotra',
      unit: 'Admin HQ',
      text: 'Water tank deep-cleaning scheduled for tomorrow 10:00 AM - 12:00 PM. High pressure pumps will be paused.',
      time: '10:45 AM',
      role: 'Estate Manager',
    },
    {
      id: 'msg-2',
      sender: 'Alex Morgan',
      unit: 'Flat B-402',
      text: 'Received delivery parcel at Gate 1, thanks to Officer Suresh for keeping it secure.',
      time: '11:15 AM',
      role: 'Resident',
    },
    {
      id: 'msg-3',
      sender: 'Priya Sharma',
      unit: 'Flat A-101',
      text: 'Is clubhouse badminton court free today evening at 6 PM?',
      time: '12:02 PM',
      role: 'Resident',
    },
  ]);
  const [newChatText, setNewChatText] = useState('');

  const [showParcelsModal, setShowParcelsModal] = useState(false);

  // Deliveries list
  const recentDeliveries = visitors.filter((v) =>
    v.category === 'delivery' && v.societyName === currentSocietyName
  );

  const handleDeleteDelivery = (deliveryId: string, deliveryName: string) => {
    if (!window.confirm(`Delete the delivery record for "${deliveryName}"? This cannot be undone.`)) return;
    const result = deleteVisitorPass(deliveryId);
    if (!result.success) window.alert(result.message);
  };

  const handleNavClick = (id: SidebarNavId) => {
    if (id === 'search') {
      setShowSearchModal(true);
      return;
    }
    if (id === 'chat') {
      if (role === 'guard') {
        setActiveSidebarNav('chat');
        return;
      }
      setShowChatModal(true);
      return;
    }
    if (id === 'deliveries') {
      setShowParcelsModal(true);
      setActiveSidebarNav('deliveries');
      return;
    }
    setActiveSidebarNav(id);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatText.trim()) return;
    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: currentUser?.name || 'Resident',
      unit: role === 'resident' ? `Flat ${activeFlat}` : role === 'guard' ? 'Gate Security' : 'Admin HQ',
      text: newChatText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      role: role === 'resident' ? 'Resident' : role === 'guard' ? 'Security Guard' : 'Admin Officer',
    };
    setChatMessages((prev) => [...prev, newMsg]);
    setNewChatText('');
  };

  // Search results
  const filteredFlats = searchQuery.trim()
    ? flats.filter(
        (f) =>
          f.societyName === currentSocietyName &&
          (f.flatNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            f.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            f.phone.includes(searchQuery))
      )
    : [];

  const filteredBills = searchQuery.trim()
    ? bills.filter(
        (b) =>
          b.societyName === currentSocietyName &&
          (b.flatNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            b.monthYear.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  const filteredNotices = searchQuery.trim()
    ? notices.filter(
        (n) =>
          n.societyName === currentSocietyName &&
          (n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            n.category.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  const navItems: SidebarItem[] = [
    {
      id: 'search',
      label: 'Search Menu',
      category: 'Find',
      icon: (active) => <Search className={`w-5 h-5 transition-colors ${active ? 'text-slate-900' : 'text-slate-600 group-hover:text-slate-900'}`} strokeWidth={1.8} />,
    },
    {
      id: 'dashboard',
      label: 'Dashboard',
      category: 'Overview',
      icon: (active) => <LayoutGrid className={`w-5 h-5 transition-colors ${active ? 'text-slate-900' : 'text-slate-600 group-hover:text-slate-900'}`} strokeWidth={1.8} />,
    },
    {
      id: 'flats',
      label: 'Society',
      category: 'Properties',
      icon: (active) => <Building className={`w-5 h-5 transition-colors ${active ? 'text-slate-900' : 'text-slate-600 group-hover:text-slate-900'}`} strokeWidth={1.8} />,
    },
    {
      id: 'community',
      label: 'People Hub',
      category: 'People',
      icon: (active) => <Users className={`w-5 h-5 transition-colors ${active ? 'text-slate-900' : 'text-slate-600 group-hover:text-slate-900'}`} strokeWidth={1.8} />,
    },
    {
      id: 'notices',
      label: 'mygate Club',
      category: 'Broadcasts',
      icon: (active) => <Megaphone className={`w-5 h-5 transition-colors ${active ? 'text-slate-900' : 'text-slate-600 group-hover:text-slate-900'}`} strokeWidth={1.8} />,
    },
    {
      id: 'chat',
      label: 'Communications',
      category: 'Messages',
      icon: (active) => <MessageSquare className={`w-5 h-5 transition-colors ${active ? 'text-slate-900' : 'text-slate-600 group-hover:text-slate-900'}`} strokeWidth={1.8} />,
    },
    {
      id: 'helpdesk',
      label: 'Help Desk',
      category: 'Help Desk',
      icon: (active) => <LifeBuoy className={`w-5 h-5 transition-colors ${active ? 'text-slate-900' : 'text-slate-600 group-hover:text-slate-900'}`} strokeWidth={1.8} />,
    },
    {
      id: 'calendar',
      label: 'Amenities',
      category: 'Facilities',
      icon: (active) => <Calendar className={`w-5 h-5 transition-colors ${active ? 'text-slate-900' : 'text-slate-600 group-hover:text-slate-900'}`} strokeWidth={1.8} />,
    },
    {
      id: 'staff',
      label: role === 'resident' ? 'Household Staff' : 'Vendors',
      category: role === 'resident' ? 'My Home' : 'Services',
      icon: (active) => <UserCheck className={`w-5 h-5 transition-colors ${active ? 'text-slate-900' : 'text-slate-600 group-hover:text-slate-900'}`} strokeWidth={1.8} />,
    },
    {
      id: 'deliveries',
      label: 'Assets & Inventory',
      category: 'Logistics',
      icon: (active) => <Package className={`w-5 h-5 transition-colors ${active ? 'text-slate-900' : 'text-slate-600 group-hover:text-slate-900'}`} strokeWidth={1.8} />,
    },
    {
      id: 'accounting',
      label: 'Accounts',
      category: 'Finance',
      // Circle with Rupee sign inside - matching the red-boxed highlight in the screenshot!
      icon: (active) => (
        <div className="flex flex-col items-center justify-center">
          <div
            className={`w-6 h-6 rounded-full border border-current flex items-center justify-center font-bold text-xs leading-none transition-colors ${
              active ? 'text-slate-950 font-black' : 'text-slate-700 group-hover:text-slate-950'
            }`}
          >
            <span>₹</span>
          </div>
          {/* Active Gradient Underline Indicator exactly as in the user's image! */}
          {active && (
            <div className="w-6 h-1 rounded-full bg-gradient-to-r from-sky-400 via-teal-400 to-amber-300 mt-1 shadow-xs animate-fade-in" />
          )}
        </div>
      ),
    },
    {
      id: 'reports',
      label: 'Reports',
      category: 'Insights',
      icon: (active) => <TrendingUp className={`w-5 h-5 transition-colors ${active ? 'text-slate-900' : 'text-slate-600 group-hover:text-slate-900'}`} strokeWidth={1.8} />,
    },
    {
      id: 'settings',
      label: 'Settings',
      category: 'Preferences',
      icon: (active) => <Settings className={`w-5 h-5 transition-colors ${active ? 'text-slate-900' : 'text-slate-600 group-hover:text-slate-900'}`} strokeWidth={1.8} />,
    },
  ];

  return (
    <>
      <aside
        className={`relative h-full min-h-0 shrink-0 bg-white border-r border-slate-200/90 shadow-sm flex flex-col py-3 select-none z-30 transition-[width] duration-200 ${
          isExpanded ? 'w-64' : 'w-16'
        }`}
      >
        <div className={`mb-4 flex h-10 w-full items-center ${isExpanded ? 'justify-start px-4' : 'justify-center'}`}>
          <button
            type="button"
            onClick={() => setActiveSidebarNav('dashboard')}
            title="MyGate Society Portal"
            className={`flex h-10 items-center rounded-xl transition-transform hover:scale-[1.02] cursor-pointer ${
              isExpanded ? 'gap-2' : 'w-10 justify-center'
            }`}
          >
            <div className="grid h-8 w-8 shrink-0 grid-cols-2 gap-0.5 rounded-lg bg-gradient-to-tr from-[#7dd3fc] via-[#86efac] to-[#fde047] p-1 shadow-sm">
              <div className="rounded-[1.5px] bg-slate-950" />
              <div className="rounded-[1.5px] bg-slate-950" />
              <div className="rounded-[1.5px] bg-slate-950" />
              <div className="rounded-[1.5px] bg-slate-950" />
            </div>
            {isExpanded && <span className="whitespace-nowrap text-lg font-semibold tracking-tight text-slate-900">mygate</span>}
          </button>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded((expanded) => !expanded)}
          aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
          aria-expanded={isExpanded}
          title={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
          className="absolute -right-3 top-4 z-40 flex h-6 w-6 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-100 hover:text-slate-950"
        >
          {isExpanded ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>

        {isExpanded && (
          <div className="px-3 pb-3">
            <label className="flex h-10 items-center gap-2 rounded-xl border border-slate-300 px-3 text-slate-500 focus-within:border-slate-500">
              <Search className="h-4 w-4 shrink-0" />
              <input
                type="search"
                value={menuFilter}
                onChange={(event) => setMenuFilter(event.target.value)}
                placeholder="Search Menu"
                aria-label="Search sidebar menu"
                className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
              />
            </label>
          </div>
        )}

        <nav className={`flex-1 min-h-0 w-full space-y-1.5 overflow-y-auto overflow-x-hidden scrollbar-none py-1 ${isExpanded ? 'px-2' : ''}`}>
          {navItems.filter((item) =>
            (role !== 'resident' || item.id !== 'reports') &&
            (role !== 'guard' || (item.id !== 'accounting' && item.id !== 'reports')) &&
            item.label.toLowerCase().includes(menuFilter.trim().toLowerCase())
          ).map((item) => {
            const isActive = activeSidebarNav === item.id;
            const isRupeeItem = item.id === 'accounting';

            return (
              <div key={item.id} className={`relative group w-full flex ${isExpanded ? '' : 'justify-center'}`}>
                <button
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  aria-label={item.label}
                  className={`h-11 rounded-xl flex items-center transition-all cursor-pointer relative ${
                    isExpanded ? 'w-full justify-start gap-3 px-3' : 'w-11 justify-center'
                  } ${
                    isActive && !isRupeeItem
                      ? 'bg-slate-100 text-slate-950 shadow-inner'
                      : 'hover:bg-slate-50 text-slate-600 hover:text-slate-950'
                  }`}
                >
                  {item.icon(isActive)}
                  {isExpanded && <span className="truncate text-sm font-medium">{item.label}</span>}

                  {isActive && !isRupeeItem && (
                    <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-r-full bg-slate-900" />
                  )}
                </button>

                {!isExpanded && (
                  <div className="pointer-events-none absolute left-full z-50 ml-2 flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-white opacity-0 shadow-xl transition-all duration-150 group-hover:opacity-100">
                    <span>{item.label}</span>
                    {isActive && <span className="rounded bg-emerald-500/20 px-1.5 py-0.2 text-[10px] font-bold text-emerald-300">Active</span>}
                  </div>
                )}
              </div>
            );
          })}
          {isExpanded && menuFilter.trim() && !navItems.some((item) =>
            item.label.toLowerCase().includes(menuFilter.trim().toLowerCase()) &&
            (role !== 'resident' || item.id !== 'reports') &&
            (role !== 'guard' || (item.id !== 'accounting' && item.id !== 'reports'))
          ) && <p className="px-3 py-2 text-sm text-slate-500">No menu items found.</p>}
        </nav>

        <div className={`mt-auto flex w-full items-center gap-2 border-t border-slate-100 pt-2 ${isExpanded ? 'px-4' : 'flex-col'}`}>
          <div
            title={`Logged in as ${currentUser?.name || 'User'} (${role})`}
            className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black shadow-sm ring-1 ${
              role === 'resident'
                ? 'bg-emerald-100 text-emerald-800 ring-emerald-300'
                : role === 'guard'
                ? 'bg-sky-100 text-sky-800 ring-sky-300'
                : 'bg-indigo-100 text-indigo-800 ring-indigo-300'
            }`}
          >
            {currentUser?.name?.charAt(0) || (role === 'resident' ? 'R' : role === 'guard' ? 'G' : 'A')}
          </div>
          {isExpanded && (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-800">{currentUser?.name || 'User'}</p>
              <p className="truncate text-xs capitalize text-slate-500">{role}</p>
            </div>
          )}
        </div>
      </aside>

      {/* ================= QUICK SEARCH OVERLAY MODAL ================= */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-start justify-center pt-20 px-4 animate-fade-in">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh]">
            {/* Search Input Bar */}
            <div className="p-4 border-b border-slate-200 flex items-center gap-3">
              <Search className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search flat number, resident, vehicle, staff or bill..."
                className="flex-1 text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
              />
              <button
                onClick={() => setShowSearchModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Results Area */}
            <div className="p-4 overflow-y-auto space-y-4">
              {!searchQuery.trim() ? (
                <div className="py-8 text-center text-slate-400 space-y-2">
                  <Search className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-sm font-medium">Type a flat unit (e.g. B-402), resident name, or staff.</p>
                  <div className="flex flex-wrap justify-center gap-1.5 pt-2">
                    <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">B-402</span>
                    <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">Alex Morgan</span>
                    <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">Maintenance</span>
                    <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">Main Gate 1</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Flats Found */}
                  {filteredFlats.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Apartment Units ({filteredFlats.length})
                      </h4>
                      <div className="space-y-2">
                        {filteredFlats.map((f) => (
                          <div
                            key={f.flatNumber}
                            onClick={() => {
                              setActiveSidebarNav('flats');
                              setShowSearchModal(false);
                            }}
                            className="p-3 bg-slate-50 hover:bg-emerald-50 rounded-xl border border-slate-200 hover:border-emerald-300 flex items-center justify-between cursor-pointer transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <span className="w-8 h-8 rounded-lg bg-emerald-500 text-white font-bold flex items-center justify-center text-xs">
                                {f.flatNumber}
                              </span>
                              <div>
                                <div className="text-sm font-bold text-slate-900">{f.ownerName}</div>
                                <div className="text-xs text-slate-500">
                                  {f.wing} • {f.occupancyStatus} • {f.phone}
                                </div>
                              </div>
                            </div>
                            <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                              View <ChevronRight className="w-4 h-4" />
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bills Found */}
                  {filteredBills.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Bills & Ledger ({filteredBills.length})
                      </h4>
                      <div className="space-y-2">
                        {filteredBills.map((b) => (
                          <div
                            key={b.id}
                            onClick={() => {
                              setActiveSidebarNav('accounting');
                              setShowSearchModal(false);
                            }}
                            className="p-3 bg-slate-50 hover:bg-sky-50 rounded-xl border border-slate-200 hover:border-sky-300 flex items-center justify-between cursor-pointer transition-colors"
                          >
                            <div>
                              <div className="text-sm font-bold text-slate-900">
                                Flat {b.flatNumber} • {b.monthYear}
                              </div>
                              <div className="text-xs text-slate-500">Due: {b.dueDate}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-bold text-slate-900">₹{b.totalAmount.toLocaleString()}</div>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  b.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                }`}
                              >
                                {b.status.toUpperCase()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notices Found */}
                  {filteredNotices.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Notices ({filteredNotices.length})
                      </h4>
                      <div className="space-y-2">
                        {filteredNotices.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => {
                              setActiveSidebarNav('notices');
                              setShowSearchModal(false);
                            }}
                            className="p-3 bg-slate-50 hover:bg-purple-50 rounded-xl border border-slate-200 hover:border-purple-300 flex items-center justify-between cursor-pointer transition-colors"
                          >
                            <div>
                              <div className="text-sm font-bold text-slate-900">{n.title}</div>
                              <div className="text-xs text-slate-500">{n.category} • {n.date}</div>
                            </div>
                            <span className="text-xs text-purple-600 font-bold">Read</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {filteredFlats.length === 0 && filteredBills.length === 0 && filteredNotices.length === 0 && (
                    <div className="py-6 text-center text-slate-400 text-sm">
                      No matching records found for "{searchQuery}".
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= COMMUNITY DISCUSSIONS / CHAT MODAL ================= */}
      {showChatModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[600px]">
            {/* Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Community Chat & Resident Feed</h3>
                  <p className="text-[11px] text-slate-400">Emerald Palms Heights Society Board</p>
                </div>
              </div>
              <button
                onClick={() => setShowChatModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50">
              {chatMessages.map((msg) => (
                <div key={msg.id} className="p-3 bg-white rounded-2xl shadow-xs border border-slate-200/80 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">
                      {msg.sender} <span className="text-slate-400 font-normal">({msg.unit})</span>
                    </span>
                    <span className="text-[10px] text-slate-400">{msg.time}</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">{msg.text}</p>
                </div>
              ))}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendChat} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
              <input
                type="text"
                value={newChatText}
                onChange={(e) => setNewChatText(e.target.value)}
                placeholder="Post an update or question to the society..."
                className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-slate-800"
              />
              <button
                type="submit"
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Post</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= DELIVERIES & PARCELS MODAL ================= */}
      {showParcelsModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
          <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[88vh]">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Gate Parcel & Delivery Tracker</h3>
                  <p className="text-[11px] text-slate-400">Main Gate 1 & Service Gate 2 Logs</p>
                </div>
              </div>
              <button
                onClick={() => setShowParcelsModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-5 overflow-y-auto space-y-3">
              {recentDeliveries.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <Package className="mx-auto mb-3 h-8 w-8 text-slate-300" />
                  <p className="text-sm font-semibold">No delivery records found</p>
                  <p className="mt-1 text-xs text-slate-400">New gate deliveries will appear here.</p>
                </div>
              ) : (
                recentDeliveries.map((del) => (
                  <div
                    key={del.id}
                    className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{del.visitorName}</span>
                        <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                          {del.companyOrRole || 'Delivery'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500">
                        Destination: <strong>Flat {del.flatNumber}</strong> ({del.residentName})
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3" /> Passcode: {del.passcode}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 sm:justify-end">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          del.status === 'in_gate'
                            ? 'bg-emerald-100 text-emerald-800'
                            : del.status === 'expected'
                            ? 'bg-blue-100 text-blue-800'
                            : del.status === 'denied'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {del.status === 'in_gate'
                          ? 'At Gate'
                          : del.status === 'expected'
                          ? 'Expected'
                          : del.status === 'denied'
                          ? 'Denied'
                          : 'Delivered'}
                      </span>
                      <div className="flex items-center gap-2">
                        {del.status !== 'checked_out' && del.status !== 'denied' && (
                          <button
                            type="button"
                            onClick={() => updateVisitorStatus(del.id, 'checked_out')}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-800"
                          >
                            <Check className="h-3.5 w-3.5" />
                            Mark delivered
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteDelivery(del.id, del.visitorName)}
                          aria-label={`Delete ${del.visitorName} delivery record`}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
