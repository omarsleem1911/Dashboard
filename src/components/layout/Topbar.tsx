import React, { useState } from 'react';
import { Search, Bell, ChevronRight } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const Topbar: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();

  // Generate breadcrumbs based on current path
  const getBreadcrumbs = () => {
    const path = location.pathname;
    const segments = path.split('/').filter(Boolean);
    
    const breadcrumbs = [];
    
    if (segments[0] === 'clients') {
      breadcrumbs.push({ label: 'Client Profiles', path: '/clients' });
      
      if (segments[1]) {
        const pageMap: Record<string, string> = {
          'daily': 'Daily Health Check',
          'weekly': 'Weekly Health Status',
          'initiatives': 'Periodic Initiatives',
          'tasks': 'Task Tracking',
          'meetings': 'Meeting Tracking'
        };
        
        if (pageMap[segments[1]]) {
          breadcrumbs.push({ 
            label: pageMap[segments[1]], 
            path: `/clients/${segments[1]}` 
          });
        }
      }
    } else if (segments[0] === 'docs') {
      breadcrumbs.push({ label: 'Documentation Library', path: '/docs' });
      if (segments[1]) {
        breadcrumbs.push({ label: 'Document Details', path: `/docs/${segments[1]}` });
      }
    } else if (segments[0] === 'arsenal') {
      breadcrumbs.push({ label: 'Deployment Arsenal', path: '/arsenal' });
      if (segments[1]) {
        breadcrumbs.push({ label: 'Arsenal Item', path: `/arsenal/${segments[1]}` });
      }
    }
    
    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  // Handle global search focus with "/" key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        const searchInput = document.getElementById('global-search');
        searchInput?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="bg-[#111726]/90 backdrop-blur-xl border-b border-white/8 shadow-[0_20px_60px_rgba(0,0,0,0.45)] relative">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Breadcrumbs */}
          <div className="flex items-center space-x-2 text-sm">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={crumb.path}>
                {index > 0 && (
                  <ChevronRight className="h-4 w-4 text-[#A7B0C0]/50" />
                )}
                <span 
                  className={index === breadcrumbs.length - 1 
                    ? "text-[#E9EEF6] font-medium" 
                    : "text-[#A7B0C0] hover:text-[#E9EEF6] cursor-pointer transition-colors"
                  }
                >
                  {crumb.label}
                </span>
              </React.Fragment>
            ))}
          </div>

          {/* Search and Actions */}
          <div className="flex items-center space-x-4">
            {/* Global Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#A7B0C0]" />
              <input
                id="global-search"
                type="text"
                placeholder="Search... (Press / to focus)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-10 pr-4 py-2 bg-[#0B0F1A]/50 border border-white/8 rounded-xl text-[#E9EEF6] placeholder-[#A7B0C0] focus:ring-2 focus:ring-[#14D8C4]/50 focus:border-[#14D8C4]/50 transition-all duration-200"
              />
            </div>

            {/* Notifications */}
            <button className="p-2 text-[#A7B0C0] hover:text-[#E9EEF6] hover:bg-white/5 rounded-xl transition-all duration-200 relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#FF2D78] rounded-full flex items-center justify-center">
                <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;