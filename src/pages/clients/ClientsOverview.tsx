import React, { useState } from 'react';
import { Search, Filter, Building2, Activity, CheckCircle, AlertCircle, Clock, Plus, Mail, Phone, ExternalLink, Settings, Globe, MessageSquare, User, Shield, Server, Lock, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Client } from '../../types';
import OnboardClientModal from '../../components/forms/OnboardClientModal';

const mockClients: Client[] = [
  {
    id: 1,
    companyName: 'Sample Client (With Agents)',
    contactPerson: 'Ahmed Al Mansouri, IT Director',
    email: 'ahmed.almansouri',
    phone: '+971 4 362 2222',
    deploymentEngineer: 'Omar Sleem',
    deploymentEngineerSlack: '@omar.sleem',
    project: 'Financial Trading Platform',
    status: 'production',
    team: 'Alpha',
    lastDeployment: '2 days ago',
    nextMilestone: 'Security compliance audit',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQbY-b_vPyemUa8xXInkAKH__I89wqw296iEQ&s',
    industry: 'Financial Services',
    website: 'difc.ae'
  },
  {
    id: 2,
    companyName: 'Y',
    contactPerson: 'Fatima Al Zahra, CTO',
    email: 'fatima.alzahra',
    phone: '+971 2 505 8000',
    deploymentEngineer: 'Omar Sleem',
    deploymentEngineerSlack: '@khalid.ahmed',
    project: 'Supply Chain Management System',
    status: 'testing',
    team: 'Beta',
    lastDeployment: '5 days ago',
    nextMilestone: 'Load testing completion',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQbY-b_vPyemUa8xXInkAKH__I89wqw296iEQ&s',
    industry: 'Food & Beverage',
    website: 'agthia.com'
  },

  {
    id: 4,
    companyName: 'Z',
    contactPerson: 'Ali Al Rashid, Head of IT',
    email: 'ali.alrashid',
    phone: '+971 6 519 9000',
    deploymentEngineer: 'Omar Darwish',
    deploymentEngineerSlack: '@omar.sleem',
    project: 'Energy Management System',
    status: 'development',
    team: 'Alpha',
    lastDeployment: '3 weeks ago',
    nextMilestone: 'API integration testing',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQbY-b_vPyemUa8xXInkAKH__I89wqw296iEQ&s',
    industry: 'Oil & Gas',
    website: 'danagas.com'
  },
  {
    id: 5,
    companyName: 'L',
    contactPerson: 'Nadia Al Mansoori, IT Manager',
    email: 'nadia.almansoori',
    phone: '+971 4 390 0000',
    deploymentEngineer: 'Omar Sleem',
    deploymentEngineerSlack: '@khalid.ahmed',
    project: 'Enterprise Resource Planning',
    status: 'planning',
    team: 'Beta',
    lastDeployment: 'Never',
    nextMilestone: 'Technical architecture review',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQbY-b_vPyemUa8xXInkAKH__I89wqw296iEQ&s',
    industry: 'Technology Solutions',
    website: 'gbm.ae'
  },
  {
    id: 6,
    companyName: 'B',
    contactPerson: 'Rashid Al Maktoum, Operations Director',
    email: 'rashid.almaktoum',
    phone: '+971 4 881 5000',
    deploymentEngineer: 'Omar Sleem',
    deploymentEngineerSlack: '@sara.ibrahim',
    project: 'Logistics Tracking System',
    status: 'maintenance',
    team: 'Gamma',
    lastDeployment: '1 day ago',
    nextMilestone: 'Performance optimization',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQbY-b_vPyemUa8xXInkAKH__I89wqw296iEQ&s',
    industry: 'Logistics & Shipping',
    website: 'houseofshipping.ae'
  }
];

const statusConfig = {
  planning: { color: 'bg-purple-500/10 text-purple-400 border-purple-500/20 shadow-purple-500/10', icon: Clock, label: 'Planning' },
  development: { color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 shadow-cyan-500/10', icon: Activity, label: 'Development' },
  testing: { color: 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-amber-500/10', icon: AlertCircle, label: 'Testing' },
  staging: { color: 'bg-orange-500/10 text-orange-400 border-orange-500/20 shadow-orange-500/10', icon: ExternalLink, label: 'Staging' },
  production: { color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-500/10', icon: CheckCircle, label: 'Production' },
  maintenance: { color: 'bg-slate-500/10 text-slate-400 border-slate-500/20 shadow-slate-500/10', icon: Settings, label: 'Maintenance' }
};

const ClientsOverview: React.FC = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [engineerFilter, setEngineerFilter] = useState<string>('all');
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.deploymentEngineer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    const matchesEngineer = engineerFilter === 'all' || client.deploymentEngineer === engineerFilter;
    
    return matchesSearch && matchesStatus && matchesEngineer;
  });

  const getStatusStats = () => {
    const stats = clients.reduce((acc, client) => {
      acc[client.status] = (acc[client.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return stats;
  };

  const statusStats = getStatusStats();
  const engineers = [...new Set(clients.map(client => client.deploymentEngineer))];

  const handleClientClick = (clientId: number) => {
    const clientUuid = clientId === 1 ? '550e8400-e29b-41d4-a716-446655440000' : clientId.toString();
    navigate(`/clients/${clientUuid}/daily`);
  };

  const handleOnboardClient = (newClientData: any) => {
    // Generate new ID
    const newId = Math.max(...clients.map(c => c.id)) + 1;
    
    // Create new client object matching the existing Client interface
    const newClient: Client = {
      id: newId,
      companyName: newClientData.name,
      contactPerson: `${newClientData.pocEmail.split('@')[0]}, Contact Person`, // Placeholder
      email: newClientData.pocEmail,
      phone: '+971 4 000 0000', // Placeholder
      deploymentEngineer: newClientData.deploymentEngineer,
      deploymentEngineerSlack: `@${newClientData.deploymentEngineer.toLowerCase().replace(' ', '.')}`,
      project: 'New Project', // Placeholder
      status: 'planning',
      team: 'Alpha', // Placeholder
      lastDeployment: 'Never',
      nextMilestone: 'Initial setup',
      logo: newClientData.logoUrl || 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop&crop=center',
      industry: newClientData.industry,
      website: newClientData.host.includes('.') ? newClientData.host : 'example.com'
    };

    setClients(prev => [...prev, newClient]);
    setShowOnboardModal(false);
    
    // Show success toast
    setToastMessage('Client onboarded successfully!');
    setTimeout(() => setToastMessage(null), 3000);
  };
  return (
    <>
      <div className="mx-auto px-6 w-full max-w-[1800px] 2xl:max-w-[2000px]">
        {/* Header with Onboard Button */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-[#E9EEF6]">Client Profiles</h1>
            <p className="text-[#A7B0C0] mt-2">Manage and monitor your client deployments</p>
          </div>
          <button
            onClick={() => setShowOnboardModal(true)}
            className="bg-gradient-to-r from-[#14D8C4] to-[#7C4DFF] hover:from-[#14D8C4]/80 hover:to-[#7C4DFF]/80 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-all duration-200 font-medium"
          >
            <Plus className="h-5 w-5" />
            <span>Onboard Client</span>
          </button>
        </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {Object.entries(statusConfig).map(([status, config]) => {
          const Icon = config.icon;
          const count = statusStats[status] || 0;
          return (
            <div key={status} className="bg-[#111726]/80 backdrop-blur-sm rounded-2xl p-4 border border-white/8 hover:border-[#14D8C4]/30 transition-all duration-200 hover:bg-[#111726] hover:scale-[1.02] shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#A7B0C0]">{config.label}</p>
                  <p className="text-2xl font-bold text-[#E9EEF6]">{count}</p>
                </div>
                <Icon className="h-8 w-8 text-white/70 hover:text-[#14D8C4] transition-colors duration-200" style={{ filter: 'drop-shadow(0 0 8px rgba(20, 216, 196, 0.3))' }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-[#111726]/80 backdrop-blur-sm rounded-2xl border border-white/8 p-6 mb-8 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/70" />
            <input
              type="text"
              placeholder="Search companies or engineers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[#0B0F1A]/50 border border-white/8 rounded-2xl text-[#E9EEF6] placeholder-[#A7B0C0] focus:ring-2 focus:ring-[#14D8C4]/50 focus:border-[#14D8C4]/50 transition-all duration-200"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-white/70" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-[#0B0F1A]/50 border border-white/8 rounded-2xl px-4 py-2 text-[#E9EEF6] focus:ring-2 focus:ring-[#14D8C4]/50 focus:border-[#14D8C4]/50 transition-all duration-200"
              >
                <option value="all">All Statuses</option>
                {Object.entries(statusConfig).map(([status, config]) => (
                  <option key={status} value={status}>{config.label}</option>
                ))}
              </select>
            </div>

            <select
              value={engineerFilter}
              onChange={(e) => setEngineerFilter(e.target.value)}
              className="bg-[#0B0F1A]/50 border border-white/8 rounded-2xl px-4 py-2 text-[#E9EEF6] focus:ring-2 focus:ring-[#14D8C4]/50 focus:border-[#14D8C4]/50 transition-all duration-200"
            >
              <option value="all">All Engineers</option>
              {engineers.map(engineer => (
                <option key={engineer} value={engineer}>{engineer}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Client Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {filteredClients.map((client) => {
          const StatusIcon = statusConfig[client.status].icon;
          return (
            <div
              key={client.id}
              onClick={() => handleClientClick(client.id)}
              className="min-w-0 bg-[#111726]/80 backdrop-blur-sm rounded-2xl border border-white/8 hover:shadow-[0_20px_60px_rgba(20,216,196,0.15)] transition-all duration-300 hover:border-[#14D8C4]/30 hover:bg-[#111726] hover:scale-[1.02] group shadow-[0_20px_60px_rgba(0,0,0,0.45)] relative cursor-pointer"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={client.logo}
                      alt={client.companyName}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-white/10 group-hover:ring-[#14D8C4]/50 transition-all duration-300"
                    />
                    <div>
                      <h3 className="font-semibold text-[#E9EEF6] group-hover:text-[#14D8C4] transition-colors duration-200">{client.companyName}</h3>
                      <p className="text-xs text-[#A7B0C0] group-hover:text-[#A7B0C0] transition-colors duration-200">{client.industry}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border shadow-lg ${statusConfig[client.status].color}`}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {statusConfig[client.status].label}
                  </span>
                </div>

                {/* Project Info */}
                <div className="space-y-3 mb-4">
                  <div>
                    <p className="text-sm font-medium text-[#A7B0C0]">Point of Contact</p>
                    <a href={`mailto:${client.email}`} className="text-sm text-[#14D8C4] hover:text-[#14D8C4]/80 transition-colors duration-200">
                      {client.email}
                    </a>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#A7B0C0]">Deployment Engineer</p>
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-white/70" />
                      <span className="text-sm text-[#E9EEF6] group-hover:text-[#14D8C4] transition-colors duration-200">{client.deploymentEngineer}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`slack://user?team=T1234567890&id=${client.deploymentEngineerSlack.replace('@', '')}`);
                        }}
                        className="p-1 text-white/70 hover:text-[#14D8C4] hover:bg-[#14D8C4]/10 rounded-lg transition-all duration-200 hover:scale-110"
                        title={`Contact ${client.deploymentEngineer} on Slack`}
                      >
                        <MessageSquare className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#A7B0C0]">Customer Success Manager</p>
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-white/70" />
                      <span className="text-sm text-[#E9EEF6] group-hover:text-[#14D8C4] transition-colors duration-200">Alaa Najem</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#A7B0C0]">Weekly Call</p>
                    <span className="text-sm text-[#E9EEF6] group-hover:text-[#14D8C4] transition-colors duration-200">Every Tuesday, 3:00 PM GST</span>
                  </div>
                </div>

                {/* Contact Actions */}
                <div className="flex justify-between items-center pt-4 border-t border-white/8">
                  <div className="flex space-x-2">
                    <a
                      href={`mailto:${client.email}`}
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 text-white/70 hover:text-[#14D8C4] hover:bg-[#14D8C4]/10 rounded-lg transition-all duration-200 hover:scale-110"
                      title="Send email"
                    >
                      <Mail className="h-4 w-4" />
                    </a>
                    <a
                      href={`tel:${client.phone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 text-white/70 hover:text-[#2EA8FF] hover:bg-[#2EA8FF]/10 rounded-lg transition-all duration-200 hover:scale-110"
                      title="Call"
                    >
                      <Phone className="h-4 w-4" />
                    </a>
                    <a
                      href={`https://${client.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 text-white/70 hover:text-[#7C4DFF] hover:bg-[#7C4DFF]/10 rounded-lg transition-all duration-200 hover:scale-110"
                      title="Visit website"
                    >
                      <Globe className="h-4 w-4" />
                    </a>
                  </div>
                  <span className="text-sm text-[#14D8C4] hover:text-[#14D8C4]/80 font-medium transition-colors duration-200 hover:underline">
                    View Details
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredClients.length === 0 && (
        <div className="text-center py-12">
          <Shield className="h-12 w-12 text-white/70 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-[#E9EEF6] mb-2">No companies found</h3>
          <p className="text-[#A7B0C0]">Try adjusting your search or filter criteria.</p>
        </div>
      )}
      </div>

      {/* Onboard Client Modal */}
      <OnboardClientModal
        isOpen={showOnboardModal}
        onClose={() => setShowOnboardModal(false)}
        onSave={handleOnboardClient}
        existingClients={clients}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 z-50 bg-[#14D8C4] text-white px-6 py-3 rounded-lg shadow-lg animate-in slide-in-from-bottom-2 duration-300">
          {toastMessage}
        </div>
      )}
    </>
  );
};

export default ClientsOverview;