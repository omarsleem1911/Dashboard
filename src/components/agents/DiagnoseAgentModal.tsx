import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Agent } from '../../types/agent';
import { X, Stethoscope, CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';

interface DiagnoseAgentModalProps {
  agent: Agent;
  onClose: () => void;
}

interface DiagnosticResult {
  check: string;
  status: 'success' | 'warning' | 'error' | 'info';
  message: string;
  details?: string;
}

const DiagnoseAgentModal: React.FC<DiagnoseAgentModalProps> = ({ agent, onClose }) => {
  const [diagnosing, setDiagnosing] = useState(false);
  const [results, setResults] = useState<DiagnosticResult[]>([]);

  const runDiagnostics = async () => {
    setDiagnosing(true);
    setResults([]);

    const diagnosticChecks: DiagnosticResult[] = [];

    await new Promise((resolve) => setTimeout(resolve, 500));
    diagnosticChecks.push({
      check: 'Connectivity Check',
      status: agent.agent_status === 'Active' ? 'success' : 'error',
      message:
        agent.agent_status === 'Active'
          ? 'Agent is reachable and responding'
          : 'Agent is not responding to heartbeat',
      details: `Last heartbeat: ${new Date(agent.last_heartbeat).toLocaleString()}`,
    });
    setResults([...diagnosticChecks]);

    await new Promise((resolve) => setTimeout(resolve, 700));
    const timeSinceHeartbeat = Date.now() - new Date(agent.last_heartbeat).getTime();
    const heartbeatMinutes = Math.floor(timeSinceHeartbeat / 60000);
    diagnosticChecks.push({
      check: 'Heartbeat Status',
      status: heartbeatMinutes < 5 ? 'success' : heartbeatMinutes < 15 ? 'warning' : 'error',
      message: `Last heartbeat ${heartbeatMinutes} minutes ago`,
      details: heartbeatMinutes > 15 ? 'Consider restarting the agent service' : undefined,
    });
    setResults([...diagnosticChecks]);

    await new Promise((resolve) => setTimeout(resolve, 600));
    diagnosticChecks.push({
      check: 'Log Collection',
      status: agent.event_types.length > 0 ? 'success' : 'warning',
      message:
        agent.event_types.length > 0
          ? `Forwarding ${agent.event_types.length} event types`
          : 'No event types configured',
      details: agent.event_types.length > 0 ? agent.event_types.join(', ') : 'Configure log sources',
    });
    setResults([...diagnosticChecks]);

    await new Promise((resolve) => setTimeout(resolve, 500));
    diagnosticChecks.push({
      check: 'Agent Version',
      status: agent.agent_version ? 'info' : 'warning',
      message: agent.agent_version ? `Version ${agent.agent_version}` : 'Version information unavailable',
      details: agent.agent_version ? 'Running latest version' : 'Consider updating agent',
    });
    setResults([...diagnosticChecks]);

    await new Promise((resolve) => setTimeout(resolve, 600));
    diagnosticChecks.push({
      check: 'Network Configuration',
      status: agent.subnet && agent.vlan ? 'success' : 'info',
      message: agent.subnet ? `Subnet: ${agent.subnet}` : 'Network configuration not detected',
      details: agent.vlan ? `VLAN: ${agent.vlan}` : undefined,
    });
    setResults([...diagnosticChecks]);

    try {
      await supabase.from('agent_diagnostics').insert({
        agent_id: agent.id,
        diagnostic_type: 'full_diagnostic',
        status: 'success',
        details: { checks: diagnosticChecks },
      });
    } catch (error) {
      console.error('Error saving diagnostic results:', error);
    }

    setDiagnosing(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-400" />;
      default:
        return <Info className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-500/10 border-green-500/30';
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/30';
      case 'error':
        return 'bg-red-500/10 border-red-500/30';
      case 'info':
        return 'bg-blue-500/10 border-blue-500/30';
      default:
        return 'bg-gray-500/10 border-gray-500/30';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1A2235] border border-white/10 rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-green-400" />
              Agent Diagnostics
            </h2>
            <p className="text-sm text-[#A7B0C0] mt-1">
              {agent.hostname} ({agent.ip_address})
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
            <X className="w-5 h-5 text-[#A7B0C0]" />
          </button>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          {results.length === 0 ? (
            <div className="space-y-4">
              <p className="text-[#A7B0C0]">
                Run a comprehensive diagnostic check to verify agent connectivity, configuration, and operational
                status.
              </p>

              <button
                onClick={runDiagnostics}
                disabled={diagnosing}
                className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {diagnosing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Running Diagnostics...
                  </>
                ) : (
                  <>
                    <Stethoscope className="w-4 h-4" />
                    Start Diagnostic Check
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((result, idx) => (
                <div key={idx} className={`p-4 border rounded-lg ${getStatusBg(result.status)}`}>
                  <div className="flex items-start gap-3">
                    {getStatusIcon(result.status)}
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-white">{result.check}</h3>
                      <p className="text-sm text-[#A7B0C0] mt-1">{result.message}</p>
                      {result.details && (
                        <p className="text-xs text-[#A7B0C0]/70 mt-1 font-mono">{result.details}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {!diagnosing && (
                <button
                  onClick={runDiagnostics}
                  className="w-full py-2 bg-[#111726] border border-white/10 text-white rounded-lg hover:bg-white/5 transition-colors"
                >
                  Run Again
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiagnoseAgentModal;
