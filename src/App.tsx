import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import ClientsOverview from './pages/clients/ClientsOverview';
import DocsPage from './pages/docs/DocsPage';
import ArsenalPage from './pages/arsenal/ArsenalPage';
import OnboardingQuestionnaire from './pages/resources/OnboardingQuestionnaire';
import AssetComparator from './pages/infrastructure/AssetComparator';
import UnknownTracer from './pages/infrastructure/UnknownTracer';
import DailyHealthCheck from './components/tabs/DailyHealthCheck';
import HealthStatus from './components/tabs/HealthStatus';
import PeriodicInitiatives from './components/tabs/PeriodicInitiatives';
import TaskTracking from './components/tabs/TaskTracking';
import MeetingTracking from './components/tabs/MeetingTracking';
import IgnoredLogTypes from './components/tabs/IgnoredLogTypes';
import IgnoredDevices from './components/tabs/IgnoredDevices';
import AlternativeIPs from './components/tabs/AlternativeIPs';
import AgentStatusPage from './pages/agents/AgentStatusPage';
import { mockClientDetails } from './data/mockData';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppShell />}>
          {/* Default redirect */}
          <Route index element={<Navigate to="/clients" replace />} />
          
          {/* Client routes */}
          <Route path="clients" element={<ClientsOverview />} />
          <Route path="clients/:clientId/daily" element={
            <DailyHealthCheck client={mockClientDetails[0]} />
          } />
          <Route path="clients/:clientId/weekly" element={
            <HealthStatus client={mockClientDetails[0]} />
          } />
          <Route path="clients/:clientId/initiatives" element={<PeriodicInitiatives />} />
          <Route path="clients/:clientId/tasks" element={<TaskTracking />} />
          <Route path="clients/:clientId/meetings" element={<MeetingTracking />} />
          <Route path="clients/:clientId/ignored-logs" element={
            <IgnoredLogTypes client={mockClientDetails[0]} />
          } />
          <Route path="clients/:clientId/ignored-devices" element={
            <IgnoredDevices client={mockClientDetails[0]} />
          } />
          <Route path="clients/:clientId/alternative-ips" element={
            <AlternativeIPs client={mockClientDetails[0]} />
          } />
          <Route path="clients/:clientId/agent-status" element={<AgentStatusPage />} />

          {/* Other routes */}
          <Route path="docs" element={<DocsPage />} />
          <Route path="arsenal" element={<ArsenalPage />} />
          <Route path="resources/onboarding" element={<OnboardingQuestionnaire />} />
          <Route path="infrastructure/asset-comparator" element={<AssetComparator />} />
          <Route path="unknown-tracer" element={<UnknownTracer />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;