import React, { useState, useEffect } from 'react';
import { X, Plus, Copy, Check, AlertCircle } from 'lucide-react';

type ClientType = 'MT Hetzner' | 'MT Azure' | 'Standalone';
type Weekday = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

interface WeeklyCall {
  weekday: Weekday;
  time: string;
  timezone: 'Asia/Dubai';
}

interface NewClientPayload {
  name: string;
  logoUrl?: string;
  industry: string;
  type: ClientType;
  host: string;
  clientId?: number;
  pocEmail: string;
  ccEmails: string[];
  deploymentEngineer: string;
  customerSuccessManager: string;
  weeklyCall: WeeklyCall;
  createdAt: string;
}

interface OnboardClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (client: NewClientPayload) => void;
  existingClients: Array<{ companyName: string }>;
}

const industries = [
  'Technology',
  'Finance',
  'Healthcare',
  'Retail',
  'Government',
  'Education',
  'Telecom',
  'Other'
];

const weekdays: Weekday[] = [
  'Monday',
  'Tuesday', 
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

const teamMembers = [
  'Omar Sleem',
  'Roni Ghosn',
  'Ali Alaa',
  'Ramy Gamil',
  'Omar Darwish',
  'Mohamed Monteser',
  'Charbel Loutfi',
  'Ahmed Hamdan',
  'Ahmed Tabara'
];

const customerSuccessManagers = [
  'Alaa Najm',
  'Habiba Emad',
  'Bachier Elset'
];

const OnboardClientModal: React.FC<OnboardClientModalProps> = ({
  isOpen,
  onClose,
  onSave,
  existingClients
}) => {
  const [formData, setFormData] = useState({
    name: '',
    logoUrl: '',
    industry: '',
    type: '' as ClientType | '',
    host: '',
    pocEmail: '',
    ccEmails: [] as string[],
    deploymentEngineer: '',
    customerSuccessManager: '',
    weeklyCall: {
      weekday: '' as Weekday | '',
      time: '',
      timezone: 'Asia/Dubai' as const
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [ccInput, setCcInput] = useState('');
  const [showCopied, setShowCopied] = useState(false);
  const [logoPreviewError, setLogoPreviewError] = useState(false);

  // Auto-fill host and clientId based on type
  useEffect(() => {
    if (formData.type === 'MT Azure') {
      setFormData(prev => ({ ...prev, host: 'mdraz.cor.xyz' }));
    } else if (formData.type === 'MT Hetzner') {
      setFormData(prev => ({ ...prev, host: 'mdr.cor.xyz' }));
    } else if (formData.type === 'Standalone') {
      setFormData(prev => ({ ...prev, host: '' }));
    }
  }, [formData.type]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateIPv4 = (ip: string): boolean => {
    const ipRegex = /^(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)$/;
    return ipRegex.test(ip);
  };

  const validateURL = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.name.trim()) {
      newErrors.name = 'Client name is required';
    } else if (formData.name.length > 120) {
      newErrors.name = 'Client name must be 120 characters or less';
    } else {
      // Check for duplicate name (case-insensitive)
      const nameExists = existingClients.some(
        client => client.companyName.toLowerCase() === formData.name.trim().toLowerCase()
      );
      if (nameExists) {
        newErrors.name = 'Client name already exists';
      }
    }

    if (!formData.industry) {
      newErrors.industry = 'Industry is required';
    }

    if (!formData.type) {
      newErrors.type = 'Client type is required';
    }

    // Host validation based on type
    if (formData.type === 'Standalone') {
      if (!formData.host) {
        newErrors.host = 'IP address is required for Standalone clients';
      } else if (!validateIPv4(formData.host)) {
        newErrors.host = 'Please enter a valid IPv4 address';
      }
    }

    if (!formData.pocEmail) {
      newErrors.pocEmail = 'Point of contact email is required';
    } else if (!validateEmail(formData.pocEmail)) {
      newErrors.pocEmail = 'Please enter a valid email address';
    }

    if (!formData.deploymentEngineer) {
      newErrors.deploymentEngineer = 'Deployment engineer is required';
    }

    if (!formData.customerSuccessManager) {
      newErrors.customerSuccessManager = 'Customer success manager is required';
    }

    if (!formData.weeklyCall.weekday) {
      newErrors.weeklyCallDay = 'Weekly call day is required';
    }

    if (!formData.weeklyCall.time) {
      newErrors.weeklyCallTime = 'Weekly call time is required';
    }

    // Optional URL validation
    if (formData.logoUrl && !validateURL(formData.logoUrl)) {
      newErrors.logoUrl = 'Please enter a valid URL (http:// or https://)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddCcEmail = () => {
    const email = ccInput.trim();
    if (email && validateEmail(email) && !formData.ccEmails.includes(email)) {
      setFormData(prev => ({
        ...prev,
        ccEmails: [...prev.ccEmails, email]
      }));
      setCcInput('');
    }
  };

  const handleRemoveCcEmail = (emailToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      ccEmails: prev.ccEmails.filter(email => email !== emailToRemove)
    }));
  };

  const handleCcInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === ' ') {
      e.preventDefault();
      handleAddCcEmail();
    }
  };

  const copyPocEmail = async () => {
    if (formData.pocEmail) {
      try {
        await navigator.clipboard.writeText(formData.pocEmail);
        setShowCopied(true);
        setTimeout(() => setShowCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy email:', err);
      }
    }
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    const payload: NewClientPayload = {
      name: formData.name.trim(),
      logoUrl: formData.logoUrl || undefined,
      industry: formData.industry,
      type: formData.type as ClientType,
      host: formData.host,
      clientId: formData.type === 'Standalone' ? 1 : undefined,
      pocEmail: formData.pocEmail,
      ccEmails: formData.ccEmails,
      deploymentEngineer: formData.deploymentEngineer,
      customerSuccessManager: formData.customerSuccessManager,
      weeklyCall: {
        weekday: formData.weeklyCall.weekday as Weekday,
        time: formData.weeklyCall.time,
        timezone: 'Asia/Dubai'
      },
      createdAt: new Date().toISOString()
    };

    onSave(payload);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-[#111726]/95 backdrop-blur-md border border-white/8 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.45)] relative max-h-[90vh] overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/8">
          <h2 className="text-xl font-semibold text-[#E9EEF6]">Onboard New Client</h2>
          <button
            onClick={onClose}
            className="p-2 text-[#A7B0C0] hover:text-[#E9EEF6] hover:bg-[#0B0F1A]/50 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-6">
            {/* Client Name */}
            <div>
              <label className="block text-sm font-medium text-[#E9EEF6] mb-2">
                Client Name <span className="text-[#FF2D78]">*</span>
              </label>
              <input
                type="text"
                maxLength={120}
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className={`w-full bg-[#0B0F1A]/50 border rounded-lg px-3 py-2 text-[#E9EEF6] placeholder-[#A7B0C0] focus:ring-2 focus:ring-[#14D8C4]/50 transition-all duration-200 ${
                  errors.name ? 'border-red-500/50' : 'border-white/8'
                }`}
                placeholder="Enter client name..."
              />
              {errors.name && (
                <p className="text-red-400 text-xs mt-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Client Logo URL */}
            <div>
              <label className="block text-sm font-medium text-[#E9EEF6] mb-2">
                Client Logo URL
              </label>
              <div className="flex space-x-4">
                <div className="flex-1">
                  <input
                    type="url"
                    value={formData.logoUrl}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, logoUrl: e.target.value }));
                      setLogoPreviewError(false);
                    }}
                    className={`w-full bg-[#0B0F1A]/50 border rounded-lg px-3 py-2 text-[#E9EEF6] placeholder-[#A7B0C0] focus:ring-2 focus:ring-[#14D8C4]/50 transition-all duration-200 ${
                      errors.logoUrl ? 'border-red-500/50' : 'border-white/8'
                    }`}
                    placeholder="https://example.com/logo.png"
                  />
                  {errors.logoUrl && (
                    <p className="text-red-400 text-xs mt-1 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.logoUrl}
                    </p>
                  )}
                </div>
                <div className="w-16 h-16 bg-[#0B0F1A]/50 border border-white/8 rounded-lg flex items-center justify-center">
                  {formData.logoUrl && !logoPreviewError ? (
                    <img
                      src={formData.logoUrl}
                      alt="Logo preview"
                      className="w-full h-full object-cover rounded-lg"
                      onError={() => setLogoPreviewError(true)}
                    />
                  ) : (
                    <span className="text-[#A7B0C0] text-xs font-medium">
                      {formData.name ? getInitials(formData.name) : '?'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Client Industry */}
            <div>
              <label className="block text-sm font-medium text-[#E9EEF6] mb-2">
                Client Industry <span className="text-[#FF2D78]">*</span>
              </label>
              <select
                value={formData.industry}
                onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                className={`w-full bg-[#0B0F1A]/50 border rounded-lg px-3 py-2 text-[#E9EEF6] focus:ring-2 focus:ring-[#14D8C4]/50 transition-all duration-200 ${
                  errors.industry ? 'border-red-500/50' : 'border-white/8'
                }`}
              >
                <option value="">Select industry...</option>
                {industries.map(industry => (
                  <option key={industry} value={industry} className="bg-[#111726] text-white">
                    {industry}
                  </option>
                ))}
              </select>
              {errors.industry && (
                <p className="text-red-400 text-xs mt-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.industry}
                </p>
              )}
            </div>

            {/* Type of Client */}
            <div>
              <label className="block text-sm font-medium text-[#E9EEF6] mb-3">
                Type of Client <span className="text-[#FF2D78]">*</span>
              </label>
              <div className="space-y-3">
                {(['MT Hetzner', 'MT Azure', 'Standalone'] as ClientType[]).map(type => (
                  <label key={type} className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="clientType"
                      value={type}
                      checked={formData.type === type}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as ClientType }))}
                      className="w-4 h-4 text-[#14D8C4] bg-[#0B0F1A] border-white/20 focus:ring-[#14D8C4]/50"
                    />
                    <span className="text-[#E9EEF6]">{type}</span>
                  </label>
                ))}
              </div>
              {errors.type && (
                <p className="text-red-400 text-xs mt-2 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.type}
                </p>
              )}
            </div>

            {/* Client Host */}
            <div>
              <label className="block text-sm font-medium text-[#E9EEF6] mb-2">
                Client Host <span className="text-[#FF2D78]">*</span>
              </label>
              {formData.type === 'Standalone' ? (
                <input
                  type="text"
                  value={formData.host}
                  onChange={(e) => setFormData(prev => ({ ...prev, host: e.target.value }))}
                  className={`w-full bg-[#0B0F1A]/50 border rounded-lg px-3 py-2 text-[#E9EEF6] placeholder-[#A7B0C0] focus:ring-2 focus:ring-[#14D8C4]/50 transition-all duration-200 ${
                    errors.host ? 'border-red-500/50' : 'border-white/8'
                  }`}
                  placeholder="192.168.1.100"
                />
              ) : (
                <input
                  type="text"
                  value={formData.host}
                  readOnly
                  className="w-full bg-[#0B0F1A]/30 border border-white/8 rounded-lg px-3 py-2 text-[#A7B0C0] cursor-not-allowed"
                />
              )}
              {errors.host && (
                <p className="text-red-400 text-xs mt-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.host}
                </p>
              )}
            </div>

            {/* Client ID */}
            <div>
              <label className="block text-sm font-medium text-[#E9EEF6] mb-2">
                Client ID
              </label>
              <input
                type="text"
                value={formData.type === 'Standalone' ? '1' : 'Auto'}
                readOnly
                className="w-full bg-[#0B0F1A]/30 border border-white/8 rounded-lg px-3 py-2 text-[#A7B0C0] cursor-not-allowed"
              />
            </div>

            {/* Point of Contact Email */}
            <div>
              <label className="block text-sm font-medium text-[#E9EEF6] mb-2">
                Client Point of Contact (Email) <span className="text-[#FF2D78]">*</span>
              </label>
              <div className="flex space-x-2">
                <input
                  type="email"
                  value={formData.pocEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, pocEmail: e.target.value }))}
                  className={`flex-1 bg-[#0B0F1A]/50 border rounded-lg px-3 py-2 text-[#E9EEF6] placeholder-[#A7B0C0] focus:ring-2 focus:ring-[#14D8C4]/50 transition-all duration-200 ${
                    errors.pocEmail ? 'border-red-500/50' : 'border-white/8'
                  }`}
                  placeholder="contact@client.com"
                />
                <button
                  type="button"
                  onClick={copyPocEmail}
                  disabled={!formData.pocEmail}
                  className="p-2 text-[#A7B0C0] hover:text-[#14D8C4] hover:bg-[#14D8C4]/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Copy email"
                >
                  {showCopied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
              {errors.pocEmail && (
                <p className="text-red-400 text-xs mt-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.pocEmail}
                </p>
              )}
            </div>

            {/* Client CC */}
            <div>
              <label className="block text-sm font-medium text-[#E9EEF6] mb-2">
                Client CC
              </label>
              <div className="space-y-2">
                <input
                  type="email"
                  value={ccInput}
                  onChange={(e) => setCcInput(e.target.value)}
                  onKeyDown={handleCcInputKeyDown}
                  onBlur={handleAddCcEmail}
                  className="w-full bg-[#0B0F1A]/50 border border-white/8 rounded-lg px-3 py-2 text-[#E9EEF6] placeholder-[#A7B0C0] focus:ring-2 focus:ring-[#14D8C4]/50 transition-all duration-200"
                  placeholder="Add CC emails (comma, space, or Enter to add)"
                />
                {formData.ccEmails.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.ccEmails.map((email, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-[#14D8C4]/20 text-[#14D8C4] border border-[#14D8C4]/30"
                      >
                        {email}
                        <button
                          type="button"
                          onClick={() => handleRemoveCcEmail(email)}
                          className="ml-1 p-0.5 hover:bg-[#14D8C4]/30 rounded-full transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Deployment Engineer */}
            <div>
              <label className="block text-sm font-medium text-[#E9EEF6] mb-2">
                Deployment Engineer <span className="text-[#FF2D78]">*</span>
              </label>
              <select
                value={formData.deploymentEngineer}
                onChange={(e) => setFormData(prev => ({ ...prev, deploymentEngineer: e.target.value }))}
                className={`w-full bg-[#0B0F1A]/50 border rounded-lg px-3 py-2 text-[#E9EEF6] focus:ring-2 focus:ring-[#14D8C4]/50 transition-all duration-200 ${
                  errors.deploymentEngineer ? 'border-red-500/50' : 'border-white/8'
                }`}
              >
                <option value="">Select engineer...</option>
                {teamMembers.map(member => (
                  <option key={member} value={member} className="bg-[#111726] text-white">
                    {member}
                  </option>
                ))}
              </select>
              {errors.deploymentEngineer && (
                <p className="text-red-400 text-xs mt-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.deploymentEngineer}
                </p>
              )}
            </div>

            {/* Customer Success Manager */}
            <div>
              <label className="block text-sm font-medium text-[#E9EEF6] mb-2">
                Customer Success Manager <span className="text-[#FF2D78]">*</span>
              </label>
              <select
                value={formData.customerSuccessManager}
                onChange={(e) => setFormData(prev => ({ ...prev, customerSuccessManager: e.target.value }))}
                className={`w-full bg-[#0B0F1A]/50 border rounded-lg px-3 py-2 text-[#E9EEF6] focus:ring-2 focus:ring-[#14D8C4]/50 transition-all duration-200 ${
                  errors.customerSuccessManager ? 'border-red-500/50' : 'border-white/8'
                }`}
              >
                <option value="">Select manager...</option>
                {customerSuccessManagers.map(member => (
                  <option key={member} value={member} className="bg-[#111726] text-white">
                    {member}
                  </option>
                ))}
              </select>
              {errors.customerSuccessManager && (
                <p className="text-red-400 text-xs mt-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.customerSuccessManager}
                </p>
              )}
            </div>

            {/* Weekly Call Date */}
            <div>
              <label className="block text-sm font-medium text-[#E9EEF6] mb-2">
                Weekly Call Date <span className="text-[#FF2D78]">*</span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#A7B0C0] mb-1">Day of Week</label>
                  <select
                    value={formData.weeklyCall.weekday}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      weeklyCall: { ...prev.weeklyCall, weekday: e.target.value as Weekday }
                    }))}
                    className={`w-full bg-[#0B0F1A]/50 border rounded-lg px-3 py-2 text-[#E9EEF6] focus:ring-2 focus:ring-[#14D8C4]/50 transition-all duration-200 ${
                      errors.weeklyCallDay ? 'border-red-500/50' : 'border-white/8'
                    }`}
                  >
                    <option value="">Select day...</option>
                    {weekdays.map(day => (
                      <option key={day} value={day} className="bg-[#111726] text-white">
                        {day}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-[#A7B0C0] mb-1">Time</label>
                  <input
                    type="time"
                    value={formData.weeklyCall.time}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      weeklyCall: { ...prev.weeklyCall, time: e.target.value }
                    }))}
                    className={`w-full bg-[#0B0F1A]/50 border rounded-lg px-3 py-2 text-[#E9EEF6] focus:ring-2 focus:ring-[#14D8C4]/50 transition-all duration-200 ${
                      errors.weeklyCallTime ? 'border-red-500/50' : 'border-white/8'
                    }`}
                  />
                </div>
              </div>
              <p className="text-xs text-[#A7B0C0] mt-1">Timezone: Asia/Dubai (UTC+4)</p>
              {(errors.weeklyCallDay || errors.weeklyCallTime) && (
                <p className="text-red-400 text-xs mt-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.weeklyCallDay || errors.weeklyCallTime}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-white/8">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[#A7B0C0] hover:text-[#E9EEF6] hover:bg-[#0B0F1A]/50 rounded-lg transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-gradient-to-r from-[#14D8C4] to-[#7C4DFF] hover:from-[#14D8C4]/80 hover:to-[#7C4DFF]/80 text-white px-6 py-2 rounded-lg transition-all duration-200 font-medium"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardClientModal;