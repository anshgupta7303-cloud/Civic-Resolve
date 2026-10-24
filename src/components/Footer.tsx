import React from 'react';
import { Building2, PhoneCall, ShieldCheck, Clock, MapPin, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand & Municipal Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-lg">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                <Building2 className="w-4 h-4" />
              </div>
              <span>CivicResolve</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Official Digital Municipal Grievance Redressal and Citizen Service Monitoring Platform.
              Empowering citizens with AI-assisted ticket classification and transparent SLA tracking.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>ISO 9001:2025 Municipal Certified</span>
            </div>
          </div>

          {/* Col 2: SLA Commitments */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">
              Citizen Charter & SLAs
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center justify-between">
                <span>Critical Safety & Water Burst</span>
                <span className="text-emerald-400 font-mono">6 - 8 Hours</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Solid Waste & Garbage Overflow</span>
                <span className="text-emerald-400 font-mono">12 Hours</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Street Lighting & Dark Corridors</span>
                <span className="text-emerald-400 font-mono">24 Hours</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Road Repair & Potholes</span>
                <span className="text-emerald-400 font-mono">24 - 48 Hours</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Park Safety & Horticulture</span>
                <span className="text-emerald-400 font-mono">48 - 72 Hours</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Emergency Municipal Numbers */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">
              Emergency Numbers
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2">
                <PhoneCall className="w-3.5 h-3.5 text-red-400" />
                <span>Central Control Room: <strong>1800-CITY-HELP</strong></span>
              </li>
              <li className="flex items-center gap-2">
                <PhoneCall className="w-3.5 h-3.5 text-blue-400" />
                <span>Water Supply Emergency: <strong>1916</strong></span>
              </li>
              <li className="flex items-center gap-2">
                <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
                <span>Electrical Hazard Hotline: <strong>1912</strong></span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>grievances@citymunicipal.gov</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Ward Headquarters */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">
              Municipal Secretariat
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-2">
              City Civic Administrative Complex, Block B, 4th Cross, Municipal Plaza.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-slate-300 mb-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Counter Timings: Mon - Sat 9:00 AM - 5:30 PM</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>Covering Wards 1 through 12</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-6 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Municipal Corporation. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Right to Service Act</span>
            <span className="hover:text-slate-400 cursor-pointer">Grievance Charter</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
