import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Stethoscope,
  Sparkles,
  Receipt,
  FileText,
  Settings,
  LogOut,
  Menu,
  Bell,
  Wifi,
  WifiOff,
  CheckCheck,
  Globe,
  ShieldBan,
  Eraser,
  RotateCcw,
  Loader2,
} from 'lucide-react';
import { authApi } from '../services/authApi';
import { notificationApi } from '../services/contentApi';
import { useRealtimeNotifications } from '../hooks/useRealtimeNotifications';
import { clearBrowserCache } from '../utils/clearCache';

const NAV_ITEMS = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/appointments', label: 'Appointments', icon: CalendarDays },
  { path: '/admin/patients', label: 'Patients', icon: Users },
  { path: '/admin/doctors', label: 'Doctors', icon: Stethoscope },
  { path: '/admin/services', label: 'Services', icon: Sparkles },
  { path: '/admin/billing', label: 'Billing', icon: Receipt },
  { path: '/admin/content', label: 'Content', icon: FileText },
  { path: '/admin/settings', label: 'Settings', icon: Settings },
  { path: '/admin/support', label: 'Support', icon: Globe },
  { path: '/admin/ip-blocking', label: 'IP Blocking', icon: ShieldBan },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const { connected, lastNotification, unread, setUnread, clearUnread, modalNotification, dismissModal } = useRealtimeNotifications();
  const [cacheOpen, setCacheOpen] = useState(false);
  const [cacheBusy, setCacheBusy] = useState(false);
  const [cacheMsg, setCacheMsg] = useState('');

  const handleClearCache = async () => {
    setCacheBusy(true);
    setCacheMsg('');
    try {
      const cleared = await clearBrowserCache();
      setCacheMsg(cleared.length ? `Cleared: ${cleared.join(', ')}.` : 'No cache stores or service workers found.');
      setTimeout(() => window.location.reload(), 600);
    } catch (err) {
      setCacheMsg('Could not clear cache: ' + (err.message || 'unknown error'));
      setCacheBusy(false);
    }
  };

  useEffect(() => {
    if (lastNotification) {
      setNotifications((prev) => [lastNotification, ...prev].slice(0, 20));
    }
  }, [lastNotification]);

  useEffect(() => {
    notificationApi.list({ limit: 20 }).then((r) => {
      setNotifications(r.data?.items || []);
      setUnread(r.data?.unreadCount || 0);
    }).catch(() => { });
  }, [setUnread]);

  const loadMe = useCallback(async () => {
    setChecking(true);
    try {
      const res = await authApi.getMe();
      setUser(res.data?.user || null);
    } catch (err) {
      setUser(null);
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    authApi.initSession({
      onUnauthorized: () => {
        setUser(null);
        setChecking(false);
        navigate('/admin/login', { replace: true });
      },
    });
  }, [navigate]);

  useEffect(() => {
    loadMe();
  }, [loadMe]);

  const handleLogout = async () => {
    try { await authApi.logout(); } catch (err) { }
    navigate('/admin/login');
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-[#D6E8F7] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-6 h-6 border-2 border-[#2299D6] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-[#5A7A9A]">Checking session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    navigate('/admin/login', { replace: true });
    return null;
  }

  const currentTitle = NAV_ITEMS.find((n) => location.pathname === n.path)?.label || 'Management';

  return (
    <div className="min-h-screen bg-[#D6E8F7]">
      {/* Sidebar - desktop */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-[#0A2255] border-r border-[#B8D8EE] z-40 flex flex-col transition-transform duration-200 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center gap-2.5 px-5 h-16 border-b border-[#B8D8EE]">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#14357B] to-[#2299D6] flex items-center justify-center">
            <Stethoscope className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold font-display text-white leading-tight">Nahol Dental</p>
            <p className="text-[11px] text-[#5A7A9A] leading-tight">Admin Panel</p>
          </div>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${active
                  ? 'bg-[#2299D6]/15 text-[#2299D6]'
                  : 'text-[#5A7A9A] hover:bg-[#F0F7FD] hover:text-black'
                  }`}
              >
                <Icon className="w-4.5 h-4.5 w-5 h-5" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-[#B8D8EE] p-3 space-y-1">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#5A7A9A] hover:bg-[#F0F7FD] hover:text-rose-400 transition-colors">
            <LogOut className="w-5 h-5" />
            Logout
          </button>
          <div className="px-3 py-2">
            <p className="text-xs font-semibold text-white truncate">{user.name}</p>
            <p className="text-[11px] text-[#5A7A9A] truncate">{user.email} · {user.role}</p>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main area */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="sticky top-0 z-20 h-16 bg-white/80 backdrop-blur border-b border-[#B8D8EE] flex items-center gap-4 px-4 sm:px-6">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-[#5A7A9A] hover:text-[#0A2255]">
            <Menu className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-bold font-display text-[#0A2255]">{currentTitle}</h2>
          <div className="ml-auto flex items-center gap-2">
            {/* Connection status */}
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" title={connected ? 'Realtime connected' : 'Reconnecting...'}>
              {connected ? (
                <span className="inline-flex items-center gap-1 text-[#2299D6]"><Wifi className="w-3 h-3" /> Live</span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[#5A7A9A]"><WifiOff className="w-3 h-3" /> Offline</span>
              )}
            </span>

            {/* Notification bell */}
            <div className="relative">
              <button
                onClick={() => { setNotifOpen(!notifOpen); if (!notifOpen) clearUnread(); }}
                className="relative p-2 text-[#5A7A9A] hover:text-[#0A2255]"
              >
                <Bell className="w-5 h-5" />
                {unread > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </button>

              {notifOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-80 max-h-[400px] overflow-y-auto bg-white border border-[#B8D8EE] rounded-2xl shadow-2xl z-50">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-[#B8D8EE]">
                      <h3 className="text-sm font-bold">Notifications</h3>
                      <button onClick={clearUnread} className="text-xs text-[#2299D6] font-semibold flex items-center gap-1">
                        <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                      </button>
                    </div>
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-sm text-[#5A7A9A]">No notifications yet</div>
                    ) : (
                      <div className="divide-y divide-[#B8D8EE]">
                        {notifications.map((n, i) => (
                          <div key={n.id || i} className="px-4 py-3 hover:bg-[#EDF7FC] transition-colors ">
                            <div className="flex items-start gap-3">
                              <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${n.state === 'UNREAD' ? 'bg-[#2299D6]' : 'bg-transparent'}`} />
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-[#0A2255] truncate">{n.title}</p>
                                <p className="text-xs text-[#5A7A9A] mt-0.5 line-clamp-2">{n.message}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

                        <button
              onClick={() => setCacheOpen(true)}
              className="p-2 text-[#5A7A9A] hover:text-[#0A2255]"
              title="Clear browser cache & reload"
            >
              <Eraser className="w-5 h-5" />
            </button>

            <a href="/" target='_blank' className="p-2 text-[#5A7A9A] hover:text-[#0A2255]" title="View site">
              <Globe className="w-5 h-5" />
            </a>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Clear cache confirmation modal */}
      {cacheOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => { if (!cacheBusy) setCacheOpen(false); }}>
          <div className="bg-white border border-[#B8D8EE] rounded-2xl shadow-2xl max-w-sm w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-3">
              <span className="w-10 h-10 rounded-xl bg-[#D6E8F7] flex items-center justify-center text-[#14357B]">
                {cacheBusy ? <Loader2 className="w-5 h-5 animate-spin" /> : <Eraser className="w-5 h-5" />}
              </span>
              <h3 className="text-base font-bold text-[#0A2255]">Clear cache & reload?</h3>
            </div>
            <p className="text-sm text-[#5A7A9A] mb-5">
              This clears cached files and service workers so the latest version of the site is loaded, then refreshes the page. Your session will be kept.
            </p>
            {cacheMsg && <p className="text-sm text-[#14357B] mb-4">{cacheMsg}</p>}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setCacheOpen(false)}
                disabled={cacheBusy}
                className="px-4 py-2 rounded-xl text-sm font-semibold border border-[#B8D8EE] text-[#0A2255] hover:bg-[#EDF7FC] disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={handleClearCache}
                disabled={cacheBusy}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-[#14357B] to-[#2299D6] text-white shadow-md hover:from-[#0F2A5E] hover:to-[#1A7DB3] disabled:opacity-60"
              >
                <RotateCcw className="w-4 h-4" />
                {cacheBusy ? 'Clearing...' : 'Clear & Reload'}
              </button>
            </div>
          </div>
        </div>
      )}
    {/* New appointment notification modal (blocks the UI until closed) */}
      {modalNotification && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" role="alertdialog" aria-modal="true">
          <div className="bg-white border border-[#B8D8EE] rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-[#14357B] to-[#2299D6]">
              <span className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center">
                <CalendarDays className="w-5 h-5 text-white" />
              </span>
              <div>
                <h3 className="text-white font-bold font-display">New Appointment</h3>
                <p className="text-[#C7E3F7] text-xs">A new booking just arrived</p>
              </div>
            </div>
            <div className="p-5 space-y-3">
              <p className="text-sm text-[#0A2255] leading-relaxed">{modalNotification.message}</p>
              {modalNotification.meta && (
                <div className="rounded-xl bg-[#EDF7FC] border border-[#B8D8EE] divide-y divide-[#B8D8EE]">
                  {modalNotification.meta.patientName && (
                    <div className="flex items-center justify-between px-4 py-2">
                      <span className="text-xs text-[#5A7A9A]">Patient</span>
                      <span className="text-sm font-semibold text-[#0A2255]">{modalNotification.meta.patientName}</span>
                    </div>
                  )}
                  {(modalNotification.meta.date || modalNotification.meta.time) && (
                    <div className="flex items-center justify-between px-4 py-2">
                      <span className="text-xs text-[#5A7A9A]">Date & Time</span>
                      <span className="text-sm font-semibold text-[#0A2255]">{modalNotification.meta.date} at {modalNotification.meta.time}</span>
                    </div>
                  )}
                  {modalNotification.meta.doctorName && (
                    <div className="flex items-center justify-between px-4 py-2">
                      <span className="text-xs text-[#5A7A9A]">Doctor</span>
                      <span className="text-sm font-semibold text-[#0A2255]">{modalNotification.meta.doctorName}</span>
                    </div>
                  )}
                  {modalNotification.meta.patientPhone && (
                    <div className="flex items-center justify-between px-4 py-2">
                      <span className="text-xs text-[#5A7A9A]">Phone</span>
                      <span className="text-sm font-semibold text-[#0A2255]" dir="ltr">{modalNotification.meta.patientPhone}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="px-5 py-4 border-t border-[#B8D8EE] flex justify-end">
              <button
                onClick={dismissModal}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-[#14357B] to-[#2299D6] text-white shadow-md hover:from-[#0F2A5E] hover:to-[#1A7DB3] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}