import React from 'react';
import { ArrowLeft, Mail, Phone, Globe, FileText } from 'lucide-react';
import { Client } from '../types';

interface ClientHeaderProps {
  client: Client;
  onBack: () => void;
}

const statusConfig = {
  planning: { color: 'bg-purple-500/10 text-purple-400 border-purple-500/20', label: 'Planning' },
  development: { color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20', label: 'Development' },
  testing: { color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', label: 'Testing' },
  staging: { color: 'bg-orange-500/10 text-orange-400 border-orange-500/20', label: 'Staging' },
  production: { color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', label: 'Production' },
  maintenance: { color: 'bg-slate-500/10 text-slate-400 border-slate-500/20', label: 'Maintenance' }
};

const ClientHeader: React.FC<ClientHeaderProps> = ({ client, onBack }) => {
  return (
    <header className="bg-[#111726]/90 backdrop-blur-xl border-b border-white/8 shadow-[0_20px_60px_rgba(0,0,0,0.45)] sticky top-0 z-50 relative">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          {/* Left side - Breadcrumb and client info */}
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 text-[#A7B0C0] hover:text-[#E9EEF6] hover:bg-[#0B0F1A]/50 rounded-xl transition-all duration-200 hover:scale-105"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            
            {/* Breadcrumb */}
            <nav className="flex items-center space-x-2 text-sm">
              <button 
                onClick={onBack}
                className="text-[#A7B0C0] hover:text-[#E9EEF6] transition-colors duration-200"
              >
                Clients
              </button>
              <span className="text-[#A7B0C0]/50">›</span>
              <span className="text-[#E9EEF6] font-medium">{client.companyName}</span>
            </nav>
            
            {/* Client avatar and info */}
            <div className="flex items-center space-x-3 ml-4">
              <img
                src={client.logo}
                alt={client.companyName}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-white/10"
              />
              <div>
                <h1 className="text-xl font-semibold text-[#E9EEF6]">{client.companyName}</h1>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${statusConfig[client.status].color}`}>
                    {statusConfig[client.status].label}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Action buttons */}
          <div className="flex items-center space-x-2">
            <a
              href={`mailto:${client.email}`}
              className="p-2 text-white/70 hover:text-[#14D8C4] hover:bg-[#14D8C4]/10 rounded-xl transition-all duration-200 hover:scale-110"
              title="Send email"
            >
              <Mail className="h-5 w-5" />
            </a>
            <a
              href={`tel:${client.phone}`}
              className="p-2 text-white/70 hover:text-[#2EA8FF] hover:bg-[#2EA8FF]/10 rounded-xl transition-all duration-200 hover:scale-110"
              title="Call"
            >
              <Phone className="h-5 w-5" />
            </a>
            <a
              href={`https://${client.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-white/70 hover:text-[#7C4DFF] hover:bg-[#7C4DFF]/10 rounded-xl transition-all duration-200 hover:scale-110"
              title="Visit website"
            >
              <Globe className="h-5 w-5" />
            </a>
            <button
              className="p-2 text-white/70 hover:text-[#F4A814] hover:bg-[#F4A814]/10 rounded-xl transition-all duration-200 hover:scale-110"
              title="Notes"
            >
              <FileText className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default ClientHeader;