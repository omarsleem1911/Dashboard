import React, { useState } from 'react';
import { NavLink, useLocation, useMatch, useParams } from 'react-router-dom';
import {
  Users,
  BookOpen,
  Wrench,
  ChevronLeft,
  ChevronRight,
  Activity,
  BarChart3,
  TrendingUp,
  CheckSquare,
  Calendar,
  User,
  ShieldX,
  FileX,
  MonitorX,
  Network
} from 'lucide-react';
import Brand from './Brand';

function itemClass(active: boolean, isSubItem = false) {
  return [
    'flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 group relative',
    active
      ? 'bg-gradient-to-r from-[#14D8C4]/20 to-[#7C4DFF]/20 text-white border border-[#14D8C4]/30 shadow-[0_0_20px_rgba(20,216,196,0.15)]'
      : 'text-[#A7B0C0] hover:bg-white/5 hover:text-[#E9EEF6]',
    isSubItem ? 'ml-4 text-sm' : ''
  ].join(' ');
}

const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const { clientId } = useParams();

  // base path for client routes
  const base = clientId ? `/clients/${clientId}` : '/clients';
  const isInClientSection = location.pathname.startsWith('/clients') && !!clientId;

  // exact matches per tab (only the correct one is truthy)
  const mDaily   = useMatch('/clients/:clientId/daily/*');
  const mWeekly  = useMatch('/clients/:clientId/weekly/*');
  const mInit    = useMatch('/clients/:clientId/initiatives/*');
  const mTasks   = useMatch('/clients/:clientId/tasks/*');
  const mMeet    = useMatch('/clients/:clientId/meetings/*');
  const mIgnoredLogs = useMatch('/clients/:clientId/ignored-logs/*');
  const mIgnoredDevices = useMatch('/clients/:clientId/ignored-devices/*');
  const mAlternativeIps = useMatch('/clients/:clientId/alternative-ips/*');

  return (
    <aside
      className={`${
        isCollapsed ? 'w-20' : 'w-72'
      } shrink-0 bg-[#111726]/90 backdrop-blur-xl border-r border-white/8 transition-all duration-300 flex flex-col relative`}
    >
      <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-white/15 to-transparent" />

      {/* Header */}
      <div className="p-4 border-b border-white/8">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div>
              <Brand />
              <p className="text-xs text-[#A7B0C0] px-4 -mt-1">Deployment Dashboard</p>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 text-[#A7B0C0] hover:text-[#E9EEF6] hover:bg-white/5 rounded-lg transition-colors duration-200"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-4 space-y-6">
        {/* Main Navigation */}
        <div>
          {!isCollapsed && (
            <div className="text-xs uppercase tracking-wider text-[#A7B0C0] mb-3 px-3">Navigation</div>
          )}

          <div className="space-y-1">
            {/* Client list root — only active on exact /clients */}
            <NavLink
              to="/clients"
              end
              className={({ isActive }) => itemClass(isActive)}
            >
              <Users className="w-5 h-5 shrink-0" />
              <span className="truncate">Client Profiles</span>
            </NavLink>

            {/* Client sub-items (visible inside a specific client) */}
            {isInClientSection && !isCollapsed && (
              <div className="space-y-1 mt-2">
                <NavLink to={`${base}/daily`} className={() => itemClass(!!mDaily, true)}>
                  <Activity className="w-4 h-4 shrink-0" />
                  <span className="truncate">Daily Health Check</span>
                </NavLink>

                <NavLink to={`${base}/weekly`} className={() => itemClass(!!mWeekly, true)}>
                  <BarChart3 className="w-4 h-4 shrink-0" />
                  <span className="truncate">Weekly Health Status</span>
                </NavLink>

                <NavLink to={`${base}/initiatives`} className={() => itemClass(!!mInit, true)}>
                  <TrendingUp className="w-4 h-4 shrink-0" />
                  <span className="truncate">Periodic Initiatives</span>
                </NavLink>

                <NavLink to={`${base}/tasks`} className={() => itemClass(!!mTasks, true)}>
                  <CheckSquare className="w-4 h-4 shrink-0" />
                  <span className="truncate">Task Tracking</span>
                </NavLink>

                <NavLink to={`${base}/meetings`} className={() => itemClass(!!mMeet, true)}>
                  <Calendar className="w-4 h-4 shrink-0" />
                  <span className="truncate">Meeting Tracking</span>
                </NavLink>

                {/* Ignored Checks Sub-section */}
                <div className="mt-4 mb-2">
                  <div className="text-xs uppercase tracking-wider text-[#A7B0C0] px-3 mb-2 flex items-center">
                    <ShieldX className="w-3 h-3 mr-2" />
                    Ignored Checks
                  </div>
                  <div className="space-y-1">
                    <NavLink to={`${base}/ignored-logs`} className={() => itemClass(!!mIgnoredLogs, true)}>
                      <FileX className="w-4 h-4 shrink-0" />
                      <span className="truncate">Ignored Log Types</span>
                    </NavLink>

                    <NavLink to={`${base}/ignored-devices`} className={() => itemClass(!!mIgnoredDevices, true)}>
                      <MonitorX className="w-4 h-4 shrink-0" />
                      <span className="truncate">Ignored Devices</span>
                    </NavLink>

                    <NavLink to={`${base}/alternative-ips`} className={() => itemClass(!!mAlternativeIps, true)}>
                      <Network className="w-4 h-4 shrink-0" />
                      <span className="truncate">Alternative IPs</span>
                    </NavLink>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Resources Section */}
        {!isCollapsed && (
          <div className="text-xs uppercase tracking-wider text-[#A7B0C0] mb-3 px-3">Resources</div>
        )}
        <div className="space-y-1">
          <NavLink to="/docs" end className={({ isActive }) => itemClass(isActive)}>
            <BookOpen className="w-5 h-5 shrink-0" />
            <span className="truncate">Documentation Library</span>
          </NavLink>
          <NavLink to="/arsenal" end className={({ isActive }) => itemClass(isActive)}>
            <Wrench className="w-5 h-5 shrink-0" />
            <span className="truncate">Deployment Arsenal</span>
          </NavLink>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-[#14D8C4] to-[#7C4DFF] rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-[#E9EEF6] truncate">Omar Sleem</div>
              <div className="text-xs text-[#A7B0C0] truncate">Deployment Engineer</div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
