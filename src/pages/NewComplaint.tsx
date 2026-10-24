import React, { useState, useEffect, useRef } from 'react';
import { api } from '../lib/api.js';
import { useAuth } from '../store/authStore.js';
import { DuplicatePreview, DepartmentId, Priority } from '../types.js';
import { getDepartmentLabel } from '../lib/utils.js';
import {
  Upload,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  Camera,
  FileText,
  Building,
  User,
  Phone,
  Mail,
  ArrowRight,
  ExternalLink,
  X,
} from 'lucide-react';

interface NewComplaintProps {
  onNavigate: (tab: string, complaintId?: string) => void;
  initialCategory?: string;
}

const WARDS = [
  'Ward 1',
  'Ward 2',
  'Ward 3',
  'Ward 4',
  'Ward 5',
  'Ward 6',
  'Ward 7',
  'Ward 8',
  'Ward 9',
  'Ward 10',
  'Ward 11',
  'Ward 12',
];

export const NewComplaint: React.FC<NewComplaintProps> = ({
  onNavigate,
  initialCategory,
}) => {
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(initialCategory || '');
  const [ward, setWard] = useState(user?.ward || 'Ward 4');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [citizenName, setCitizenName] = useState(user?.name || '');
  const [citizenPhone, setCitizenPhone] = useState(user?.phone || '');
  const [citizenEmail, setCitizenEmail] = useState(user?.email || '');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [duplicates, setDuplicates] = useState<DuplicatePreview[]>([]);
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update user details if user changes
  useEffect(() => {
    if (user) {
      setCitizenName(user.name);
      setCitizenPhone(user.phone || '');
      setCitizenEmail(user.email || '');
      if (user.ward) setWard(user.ward);
    }
  }, [user]);

  // Debounced duplicate check
  useEffect(() => {
    if (!title.trim() || title.length < 5 || !ward) {
      setDuplicates([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsCheckingDuplicates(true);
      try {
        const res = await api.checkDuplicates({
          title,
          description,
          ward,
          department: category || undefined,
          address,
          landmark,
        });
        setDuplicates(res.duplicates);
      } catch {
        // Ignore
      } finally {
        setIsCheckingDuplicates(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [title, description, ward, address, landmark, category]);

  // Handle file drop / upload
  const handleFileChange = (file: File) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !description.trim() || !address.trim() || !ward) {
      setError('Please fill in all mandatory fields (Title, Description, Ward, and Address).');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.createComplaint({
        title: title.trim(),
        description: description.trim(),
        category: category || undefined,
        ward,
        address: address.trim(),
        landmark: landmark.trim() || undefined,
        imageUrl: imagePreview || undefined,
        citizenName: citizenName.trim() || undefined,
        citizenPhone: citizenPhone.trim() || undefined,
        citizenEmail: citizenEmail.trim() || undefined,
      });

      setSubmittedId(res.complaint.id);
    } catch (err: any) {
      setError(err.message || 'Failed to submit grievance. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submittedId) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-lg text-center space-y-6 animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Grievance Successfully Lodged!
          </h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            Your complaint has been registered in the municipal database. The AI triage engine has
            notified the appropriate ward engineer.
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 max-w-md mx-auto space-y-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Tracking Reference ID
          </span>
          <div className="text-2xl font-extrabold font-mono text-emerald-700 select-all">
            {submittedId}
          </div>
          <p className="text-[11px] text-slate-400">
            Keep this reference code to track real-time resolution progress and field updates.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => onNavigate('track-complaint', submittedId)}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Track Grievance Live</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setSubmittedId(null);
              setTitle('');
              setDescription('');
              setAddress('');
              setLandmark('');
              setImagePreview(null);
            }}
            className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-colors cursor-pointer"
          >
            File Another Grievance
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          File a Public Grievance
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Submit details and photos of civic issues. Our AI system ensures automated department routing and SLA assignment.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-800 text-sm flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Duplicate Alert Banner */}
      {duplicates.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-5 shadow-xs space-y-3 animate-in fade-in duration-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-amber-950 text-sm">
                Potential Duplicate Grievance Detected in {ward}
              </h4>
              <p className="text-xs text-amber-900 mt-0.5">
                Another resident has already reported a very similar issue at this location.
                You can view and endorse the existing ticket to boost its priority instead of creating a duplicate work order:
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {duplicates.map((dup) => (
              <div
                key={dup.id}
                className="bg-white/80 rounded-xl p-3 border border-amber-200 flex flex-col justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-mono font-bold text-slate-800">{dup.id}</span>
                    <span className="text-amber-700 font-semibold">{dup.status}</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-900 line-clamp-1">{dup.title}</p>
                  <p className="text-[11px] text-slate-500 truncate">{dup.address}</p>
                </div>
                <div className="mt-2 pt-2 border-t border-amber-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Match score: {Math.round(dup.similarityScore * 100)}%</span>
                  <button
                    type="button"
                    onClick={() => onNavigate('track-complaint', dup.id)}
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                  >
                    <span>View Ticket</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        {/* Grievance Title */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Grievance Title <span className="text-red-500">*</span>
          </label>
          <input
            id="complaint-title-input"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Broken water pipe gushing on 4th Main Road"
            className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-slate-900 text-sm outline-none transition-all"
          />
          <p className="text-[11px] text-slate-400">
            Be specific with the hazard type for rapid AI priority routing.
          </p>
        </div>

        {/* Category & Ward Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Department / Category (Optional)
            </label>
            <select
              id="complaint-category-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
            >
              <option value="">Auto-Detect via AI Engine</option>
              <option value="ROADS">Roads & Potholes (RBP)</option>
              <option value="WASTE">Solid Waste & Garbage (SWM)</option>
              <option value="WATER">Water Supply & Sewerage (WSSB)</option>
              <option value="ELECTRICITY">Street Lighting & Power (SLMP)</option>
              <option value="HEALTH">Public Health & Vector Control (PHVC)</option>
              <option value="PARKS">Parks & Horticulture (PHUG)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Municipal Ward Zone <span className="text-red-500">*</span>
            </label>
            <select
              id="complaint-ward-select"
              required
              value={ward}
              onChange={(e) => setWard(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
            >
              {WARDS.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Detailed Description */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Detailed Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="complaint-description-input"
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Explain the extent of the damage, how long it has persisted, public safety risks, and if traffic or drinking water is affected..."
            className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-slate-900 text-sm outline-none transition-all leading-relaxed"
          />
        </div>

        {/* Address & Landmark */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Exact Street Address / Location <span className="text-red-500">*</span>
            </label>
            <input
              id="complaint-address-input"
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. 4th Main Road, Corner of 9th Cross"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-slate-900 text-sm outline-none transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Nearest Landmark
            </label>
            <input
              id="complaint-landmark-input"
              type="text"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              placeholder="e.g. Opposite St. Jude Elementary School"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-slate-900 text-sm outline-none transition-all"
            />
          </div>
        </div>

        {/* Photo Upload with Drag & Drop */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Attach Evidence Photo (Recommended)
          </label>

          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-6 text-center transition-colors bg-slate-50/50"
          >
            {imagePreview ? (
              <div className="relative inline-block">
                <img
                  src={imagePreview}
                  alt="Evidence Preview"
                  className="max-h-48 rounded-xl object-cover border border-slate-300 shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setImagePreview(null)}
                  className="absolute -top-2 -right-2 bg-red-600 text-white p-1 rounded-full shadow-md hover:bg-red-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Camera className="w-8 h-8 text-slate-400 mx-auto" />
                <div className="text-xs text-slate-600">
                  <span
                    onClick={() => fileInputRef.current?.click()}
                    className="text-emerald-600 font-semibold hover:underline cursor-pointer"
                  >
                    Click to upload
                  </span>{' '}
                  or drag and drop photo here
                </div>
                <p className="text-[11px] text-slate-400">PNG, JPG, or WEBP up to 10MB</p>
                <div className="pt-2 flex justify-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setImagePreview(
                        'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80'
                      )
                    }
                    className="text-[11px] px-2.5 py-1 rounded bg-slate-200 text-slate-700 hover:bg-slate-300 cursor-pointer font-medium"
                  >
                    Use Sample Pothole Photo
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setImagePreview(
                        'https://images.unsplash.com/photo-1542013936693-884638332954?w=600&auto=format&fit=crop&q=80'
                      )
                    }
                    className="text-[11px] px-2.5 py-1 rounded bg-slate-200 text-slate-700 hover:bg-slate-300 cursor-pointer font-medium"
                  >
                    Use Sample Water Leak Photo
                  </button>
                </div>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileChange(e.target.files[0]);
                }
              }}
            />
          </div>
        </div>

        {/* Citizen Contact Section */}
        <div className="pt-4 border-t border-slate-200">
          <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider mb-3">
            Complainant Information
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Full Name</label>
              <input
                id="citizen-name-input"
                type="text"
                value={citizenName}
                onChange={(e) => setCitizenName(e.target.value)}
                placeholder="Sarah Jenkins"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs focus:border-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Phone Number</label>
              <input
                id="citizen-phone-input"
                type="tel"
                value={citizenPhone}
                onChange={(e) => setCitizenPhone(e.target.value)}
                placeholder="+1 (555) 234-5678"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs focus:border-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Email Address</label>
              <input
                id="citizen-email-input"
                type="email"
                value={citizenEmail}
                onChange={(e) => setCitizenEmail(e.target.value)}
                placeholder="citizen@city.gov"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs focus:border-emerald-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Submission Button */}
        <div className="pt-4 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="px-5 py-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            id="submit-complaint-btn"
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Analyzing & Submitting...</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Submit Grievance</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
