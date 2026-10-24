import React from 'react';
import { useAuth } from '../store/authStore.js';
import { NotificationCenter } from './NotificationCenter.js';
import {
  Building2,
  PlusCircle,
  Search,
  FileText,
  ShieldAlert,
  Home,
  UserCheck,
  LogOut,
  ChevronDown,
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onNavigate: (tab: string, complaintId?: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onNavigate }) => {
  const { user, logout, quickSwitchUser } = useAuth();
  const [roleDropdownOpen, setRoleDropdownOpen] = React.useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'new-complaint', label: 'File Grievance', icon: PlusCircle, primary: true },
    { id: 'track-complaint', label: 'Track Ticket', icon: Search },
    { id: 'my-complaints', label: 'My Grievances', icon: FileText },
    { id: 'admin-dashboard', label: 'Admin Command', icon: ShieldAlert, adminOnly: false },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Top Municipal Banner */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 sm:px-6 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-medium text-slate-200">
              City Municipal Corporation • Grievance Redressal System 2025
            </span>
            <span className="hidden sm:inline text-slate-500">|</span>
            <span className="hidden sm:inline text-slate-400">Citizen Helpline: 1800-CITY-HELP</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Demo Role Switcher */}
            <div className="relative">
              <button
                id="role-switcher-btn"
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-colors cursor-pointer border border-slate-700"
              >
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Role: <strong>{user?.role || 'CITIZEN'}</strong></span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {roleDropdownOpen && (
                <div className="absolute right-0 mt-1 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-slate-800 text-xs">
                  <div className="px-3 py-1 font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
                    Switch Demo Persona
                  </div>
                  <button
                    onClick={() => {
                      quickSwitchUser('CITIZEN');
                      setRoleDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-100 flex items-center justify-between cursor-pointer"
                  >
                    <span>Citizen (Sarah Jenkins)</span>
                    {user?.role === 'CITIZEN' && <span className="text-emerald-600 font-bold">✓</span>}
                  </button>
                  <button
                    onClick={() => {
                      quickSwitchUser('OFFICER');
                      setRoleDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-100 flex items-center justify-between cursor-pointer"
                  >
                    <span>Ward Officer (Er. Rajesh)</span>
                    {user?.role === 'OFFICER' && <span className="text-emerald-600 font-bold">✓</span>}
                  </button>
                  <button
                    onClick={() => {
                      quickSwitchUser('ADMIN');
                      setRoleDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-100 flex items-center justify-between cursor-pointer"
                  >
                    <span>Municipal Admin (Commissioner)</span>
                    {user?.role === 'ADMIN' && <span className="text-emerald-600 font-bold">✓</span>}
                  </button>
                </div>
              )}
            </div>

            {user ? (
              <button
                onClick={logout}
                className="text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
              >
                <LogOut className="w-3 h-3" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            ) : (
              <button
                onClick={() => onNavigate('login')}
                className="text-emerald-400 hover:text-emerald-300 font-medium cursor-pointer"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <div
            onClick={() => onNavigate('home')}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg text-slate-900 tracking-tight">CivicResolve</span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-slate-500 -mt-0.5">Municipal Grievance Redressal</p>
            </div>
          </div>

          {/* Nav items */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              if (item.primary) {
                return (
                  <button
                    key={item.id}
                    id={`nav-${item.id}`}
                    onClick={() => onNavigate(item.id)}
                    className="ml-2 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow transition-all cursor-pointer"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              }

              return (
                <button
                  key={item.id}
                  id={`nav-${item.id}`}
                  onClick={() => onNavigate(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-slate-100 text-slate-900 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Controls: Notifications & User profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            <NotificationCenter
              onSelectComplaint={(id) => onNavigate('track-complaint', id)}
            />

            {user ? (
              <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover border border-slate-200"
                  referrerPolicy="no-referrer"
                />
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-semibold text-slate-800 leading-tight">{user.name}</p>
                  <p className="text-[11px] text-slate-500 leading-tight">{user.ward || user.role}</p>
                </div>
              </div>
            ) : (
              <button
                onClick={() => onNavigate('login')}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 cursor-pointer"
              >
                Sign In
              </button>
            )}
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="md:hidden flex items-center justify-around border-t border-slate-100 bg-white py-2 px-2 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex flex-col items-center gap-1 px-3 py-1 text-xs rounded-lg ${
                  isActive ? 'text-emerald-600 font-semibold' : 'text-slate-500'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[11px]">{item.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>
    </div>
  );
};
