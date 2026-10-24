import React, { useState } from 'react';
import { useAuth } from '../store/authStore.js';
import { Building2, User, Lock, ArrowRight, ShieldCheck, HardHat, Sparkles } from 'lucide-react';

interface LoginProps {
  onNavigate: (tab: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onNavigate }) => {
  const { login, quickSwitchUser } = useAuth();
  const [email, setEmail] = useState('citizen@city.gov');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await login(email, password);
      onNavigate('home');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = async (role: 'CITIZEN' | 'OFFICER' | 'ADMIN') => {
    setIsLoading(true);
    try {
      await quickSwitchUser(role);
      onNavigate(role === 'ADMIN' ? 'admin-dashboard' : 'home');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-6 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
          <Building2 className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Sign in to CivicResolve</h1>
        <p className="text-xs text-slate-500">
          Municipal Grievance Redressal and Officer Dispatch System
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 text-xs p-3 rounded-xl">
          {error}
        </div>
      )}

      {/* 1-Click Quick Demo Switcher */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>Quick 1-Click Demo Profiles</span>
        </div>
        <div className="grid grid-cols-1 gap-2">
          <button
            type="button"
            onClick={() => handleQuickDemo('CITIZEN')}
            className="w-full px-3 py-2 rounded-xl bg-white hover:bg-emerald-100/50 border border-emerald-200 text-left text-xs font-medium text-slate-800 flex items-center justify-between cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-600" />
              <div>
                <p className="font-semibold text-slate-900">Resident Citizen</p>
                <p className="text-[10px] text-slate-500">Sarah Jenkins (Ward 4)</p>
              </div>
            </div>
            <span className="text-emerald-700 font-bold text-xs">Enter →</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickDemo('OFFICER')}
            className="w-full px-3 py-2 rounded-xl bg-white hover:bg-emerald-100/50 border border-emerald-200 text-left text-xs font-medium text-slate-800 flex items-center justify-between cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-2">
              <HardHat className="w-4 h-4 text-amber-600" />
              <div>
                <p className="font-semibold text-slate-900">Field Ward Officer</p>
                <p className="text-[10px] text-slate-500">Er. Rajesh Verma (Roads)</p>
              </div>
            </div>
            <span className="text-amber-700 font-bold text-xs">Enter →</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickDemo('ADMIN')}
            className="w-full px-3 py-2 rounded-xl bg-white hover:bg-emerald-100/50 border border-emerald-200 text-left text-xs font-medium text-slate-800 flex items-center justify-between cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              <div>
                <p className="font-semibold text-slate-900">Municipal Commissioner</p>
                <p className="text-[10px] text-slate-500">Robert Sterling (City HQ)</p>
              </div>
            </div>
            <span className="text-purple-700 font-bold text-xs">Enter →</span>
          </button>
        </div>
      </div>

      <div className="relative flex py-1 items-center">
        <div className="flex-grow border-t border-slate-200" />
        <span className="flex-shrink mx-3 text-slate-400 text-xs uppercase font-semibold tracking-wider">
          Or Enter Credentials
        </span>
        <div className="flex-grow border-t border-slate-200" />
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4"
      >
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Registered Email
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:border-emerald-500 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:border-emerald-500 outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <span>{isLoading ? 'Verifying...' : 'Sign In to Portal'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
