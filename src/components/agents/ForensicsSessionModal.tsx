import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Agent, ForensicsSession } from '../../types/agent';
import { X, Terminal, Download, Clock, CheckCircle, XCircle } from 'lucide-react';

interface ForensicsSessionModalProps {
  agent: Agent;
  onClose: () => void;
}

const ForensicsSessionModal: React.FC<ForensicsSessionModalProps> = ({ agent, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<ForensicsSession | null>(null);
  const [sessionLog, setSessionLog] = useState<string[]>([]);

  useEffect(() => {
    checkExistingSession();
  }, [agent.id]);

  const checkExistingSession = async () => {
    try {
      const { data, error } = await supabase
        .from('forensics_sessions')
        .select('*')
        .eq('agent_id', agent.id)
        .eq('status', 'active')
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSession(data);
        setSessionLog(['Session already active', `Started at: ${new Date(data.started_at).toLocaleString()}`]);
      }
    } catch (error) {
      console.error('Error checking session:', error);
    }
  };

  const startSession = async () => {
    setLoading(true);
    try {
      const sessionToken = `forensics-${agent.id}-${Date.now()}`;

      const { data, error } = await supabase
        .from('forensics_sessions')
        .insert({
          agent_id: agent.id,
          session_token: sessionToken,
          status: 'active',
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      setSession(data);
      setSessionLog([
        'Forensics session initiated',
        `Agent: ${agent.hostname} (${agent.ip_address})`,
        'Collecting system information...',
        'Capturing memory snapshot...',
        'Analyzing running processes...',
        'Examining network connections...',
        'Checking file system integrity...',
        'Session ready for analysis',
      ]);
    } catch (error) {
      console.error('Error starting session:', error);
      setSessionLog(['Error starting forensics session']);
    } finally {
      setLoading(false);
    }
  };

  const endSession = async () => {
    if (!session) return;

    try {
      const { error } = await supabase
        .from('forensics_sessions')
        .update({
          status: 'closed',
          ended_at: new Date().toISOString(),
        })
        .eq('id', session.id);

      if (error) throw error;

      setSessionLog([...sessionLog, 'Session closed successfully']);
      setTimeout(() => onClose(), 1500);
    } catch (error) {
      console.error('Error ending session:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1A2235] border border-white/10 rounded-xl shadow-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Terminal className="w-5 h-5 text-[#7C4DFF]" />
              Remote Forensics Session
            </h2>
            <p className="text-sm text-[#A7B0C0] mt-1">
              {agent.hostname} ({agent.ip_address})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-[#A7B0C0]" />
          </button>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          {!session ? (
            <div className="space-y-4">
              <p className="text-[#A7B0C0]">
                Start a remote forensics session to collect system information, analyze processes, and investigate
                security incidents on this agent.
              </p>

              <div className="bg-[#111726] border border-white/10 rounded-lg p-4 space-y-2">
                <h3 className="text-sm font-medium text-white">Session will collect:</h3>
                <ul className="text-sm text-[#A7B0C0] space-y-1 list-disc list-inside">
                  <li>System information and configuration</li>
                  <li>Running processes and services</li>
                  <li>Network connections and listening ports</li>
                  <li>Recent log entries</li>
                  <li>File system metadata</li>
                  <li>Memory analysis (if enabled)</li>
                </ul>
              </div>

              <button
                onClick={startSession}
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-[#7C4DFF] to-[#7C4DFF]/80 text-white rounded-lg hover:from-[#7C4DFF]/90 hover:to-[#7C4DFF]/70 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Initiating Session...
                  </>
                ) : (
                  <>
                    <Terminal className="w-4 h-4" />
                    Start Forensics Session
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-sm font-medium text-green-400">Session Active</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#A7B0C0]">
                  <Clock className="w-4 h-4" />
                  {new Date(session.started_at).toLocaleString()}
                </div>
              </div>

              <div className="bg-[#111726] border border-white/10 rounded-lg p-4">
                <h3 className="text-sm font-medium text-white mb-3">Session Log</h3>
                <div className="space-y-1 font-mono text-xs text-green-400 max-h-64 overflow-y-auto">
                  {sessionLog.map((log, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-[#A7B0C0]">[{new Date().toLocaleTimeString()}]</span>
                      <span>{log}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  className="py-2 px-4 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export Data
                </button>
                <button
                  onClick={endSession}
                  className="py-2 px-4 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors flex items-center justify-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  End Session
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForensicsSessionModal;
