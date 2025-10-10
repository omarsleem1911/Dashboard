import React, { useState } from 'react';
import { Calendar, Plus, Edit, Trash2, ChevronDown, ChevronUp, Copy, Download, CheckCircle, Clock, User, AlertCircle, Eye, Maximize2, Minimize2, FileText } from 'lucide-react';

// Types for the component
interface Meeting {
  id: string;
  date: string;
  subject: string;
  purpose?: string;
  summary?: string;
  summary_mail_sent: boolean;
  summary_mail_reason?: string;
  thread_closed: boolean;
  next_meeting_dependencies?: string;
  client_id?: number;
  created_at: string;
  updated_at: string;
}

interface ActionGroup {
  id: string;
  subject: string;
  owner?: string;
  meeting_id?: string;
  client_id?: number;
  created_at: string;
  updated_at: string;
}

interface ActionItem {
  id: string;
  action_group_id: string;
  item: string;
  due_date?: string;
  status: 'Pending Client side' | 'Pending COR Side' | 'In progress' | 'Completed';
  created_at: string;
  updated_at: string;
}

// Extended types for UI state
interface UIActionGroup extends ActionGroup {
  items: ActionItem[];
}

// Mock data
const mockMeetings: Meeting[] = [
  {
    id: 'meeting-1',
    date: '2025-01-15',
    subject: 'Weekly Security Review',
    purpose: 'Review security incidents and system health',
    summary: 'Discussed recent security alerts and planned system updates. All critical issues resolved.',
    summary_mail_sent: true,
    summary_mail_reason: '',
    thread_closed: true,
    next_meeting_dependencies: '',
    client_id: 2,
    created_at: '2025-01-15T10:00:00Z',
    updated_at: '2025-01-15T10:00:00Z'
  },
  {
    id: 'meeting-2',
    date: '2025-01-08',
    subject: 'Incident Response Planning',
    purpose: 'Plan response procedures for security incidents',
    summary: 'Outlined incident response workflow and assigned responsibilities.',
    summary_mail_sent: false,
    summary_mail_reason: 'Client requested internal distribution only',
    thread_closed: false,
    next_meeting_dependencies: 'Waiting for client approval on new procedures',
    client_id: 2,
    created_at: '2025-01-08T14:00:00Z',
    updated_at: '2025-01-08T14:00:00Z'
  }
];

const mockActionGroups: UIActionGroup[] = [
  {
    id: 'group-1',
    subject: 'Security System Updates',
    owner: 'Omar Sleem',
    meeting_id: 'meeting-1',
    client_id: 2,
    created_at: '2025-01-15T10:00:00Z',
    updated_at: '2025-01-15T10:00:00Z',
    items: [
      {
        id: 'item-1',
        action_group_id: 'group-1',
        item: 'Update firewall rules for new application',
        due_date: '2025-01-20',
        status: 'In progress',
        created_at: '2025-01-15T10:00:00Z',
        updated_at: '2025-01-15T10:00:00Z'
      },
      {
        id: 'item-2',
        action_group_id: 'group-1',
        item: 'Review and approve security patches',
        due_date: '2025-01-18',
        status: 'Pending Client side',
        created_at: '2025-01-15T10:00:00Z',
        updated_at: '2025-01-15T10:00:00Z'
      }
    ]
  },
  {
    id: 'group-2',
    subject: 'Incident Response Procedures',
    owner: 'Sara Ibrahim',
    meeting_id: 'meeting-2',
    client_id: 2,
    created_at: '2025-01-08T14:00:00Z',
    updated_at: '2025-01-08T14:00:00Z',
    items: [
      {
        id: 'item-3',
        action_group_id: 'group-2',
        item: 'Draft incident response playbook',
        due_date: '2025-01-25',
        status: 'Pending COR Side',
        created_at: '2025-01-08T14:00:00Z',
        updated_at: '2025-01-08T14:00:00Z'
      },
      {
        id: 'item-4',
        action_group_id: 'group-2',
        item: 'Schedule incident response training',
        due_date: '2025-01-30',
        status: 'Completed',
        created_at: '2025-01-08T14:00:00Z',
        updated_at: '2025-01-08T14:00:00Z'
      }
    ]
  }
];

const MeetingTracking: React.FC = () => {
  // Initialize with mock data
  const [meetings, setMeetings] = useState<Meeting[]>(mockMeetings);
  const [actionGroups, setActionGroups] = useState<UIActionGroup[]>(mockActionGroups);

  // Meeting Form State
  const [meetingForm, setMeetingForm] = useState({
    date: '',
    subject: '',
    purpose: '',
    summary: '',
    summary_mail_sent: true,
    summary_mail_reason: '',
    thread_closed: true,
    next_meeting_dependencies: ''
  });

  const [editingMeetingId, setEditingMeetingId] = useState<string | null>(null);

  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [viewingText, setViewingText] = useState<{type: string, content: string} | null>(null);
  const [showToast, setShowToast] = useState(false);

  // Meeting Form Handlers
  const resetMeetingForm = () => {
    setMeetingForm({
      date: '',
      subject: '',
      purpose: '',
      summary: '',
      summary_mail_sent: true,
      summary_mail_reason: '',
      thread_closed: true,
      next_meeting_dependencies: ''
    });
    setEditingMeetingId(null);
  };

  const validateMeetingForm = () => {
    const errors: string[] = [];
    if (!meetingForm.date) errors.push('Date is required');
    if (!meetingForm.subject.trim()) errors.push('Subject is required');
    if (!meetingForm.summary_mail_sent && !meetingForm.summary_mail_reason.trim()) {
      errors.push('Reason is required when Summary Mail not sent');
    }
    if (!meetingForm.thread_closed && !meetingForm.next_meeting_dependencies.trim()) {
      errors.push('Next Meeting Dependencies required when thread not closed');
    }
    return errors;
  };

  const saveMeeting = async () => {
    const errors = validateMeetingForm();
    if (errors.length > 0) {
      alert('Please fix the following errors:\n' + errors.join('\n'));
      return;
    }

    const now = new Date().toISOString();
    const meetingData = {
      ...meetingForm,
      client_id: 2 // Static client ID for demo
    };

    if (editingMeetingId) {
      // Update existing meeting
      setMeetings(prev => prev.map(meeting => 
        meeting.id === editingMeetingId 
          ? { ...meeting, ...meetingData, updated_at: now }
          : meeting
      ));
    } else {
      // Create new meeting
      const newMeeting: Meeting = {
        id: `meeting-${Date.now()}`,
        ...meetingData,
        created_at: now,
        updated_at: now
      };
      setMeetings(prev => [...prev, newMeeting]);

      // Create associated action group
      const newActionGroup: UIActionGroup = {
        id: `group-${Date.now()}`,
        subject: `${meetingData.subject} - Action Items`,
        owner: '',
        meeting_id: newMeeting.id,
        client_id: 2,
        created_at: now,
        updated_at: now,
        items: []
      };
      setActionGroups(prev => [...prev, newActionGroup]);
    }

    resetMeetingForm();
  };

  const editMeeting = (meeting: Meeting) => {
    setMeetingForm({
      date: meeting.date,
      subject: meeting.subject,
      purpose: meeting.purpose || '',
      summary: meeting.summary || '',
      summary_mail_sent: meeting.summary_mail_sent,
      summary_mail_reason: meeting.summary_mail_reason || '',
      thread_closed: meeting.thread_closed,
      next_meeting_dependencies: meeting.next_meeting_dependencies || ''
    });
    setEditingMeetingId(meeting.id);
  };

  const deleteMeeting = async (id: string) => {
    if (confirm('Are you sure you want to delete this meeting?')) {
      setMeetings(prev => prev.filter(meeting => meeting.id !== id));
      // Also remove associated action groups
      setActionGroups(prev => prev.filter(group => group.meeting_id !== id));
    }
  };

  // Action Groups Handlers
  const toggleGroupExpansion = (groupId: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

  const addActionGroup = async () => {
    const now = new Date().toISOString();
    const newGroup = {
      id: `group-${Date.now()}`,
      subject: '',
      owner: '',
      client_id: 2,
      created_at: now,
      updated_at: now,
      items: []
    };
    
    setActionGroups(prev => [...prev, newGroup]);
    setEditingGroupId(newGroup.id);
    setExpandedGroups(prev => new Set([...prev, newGroup.id]));
  };

  const updateActionGroup = async (groupId: string, field: keyof ActionGroup, value: any) => {
    const now = new Date().toISOString();
    setActionGroups(prev => prev.map(group => 
      group.id === groupId 
        ? { ...group, [field]: value, updated_at: now }
        : group
    ));
  };

  const deleteActionGroup = async (groupId: string) => {
    if (confirm('Are you sure you want to delete this action group?')) {
      setActionGroups(prev => prev.filter(group => group.id !== groupId));
      setExpandedGroups(prev => {
        const newSet = new Set(prev);
        newSet.delete(groupId);
        return newSet;
      });
    }
  };

  const addActionItem = async (groupId: string) => {
    const now = new Date().toISOString();
    const newItem = {
      id: `item-${Date.now()}`,
      action_group_id: groupId,
      item: '',
      due_date: '',
      status: 'Pending COR Side' as const,
      created_at: now,
      updated_at: now
    };
    
    setActionGroups(prev => prev.map(group => 
      group.id === groupId 
        ? { ...group, items: [...group.items, newItem] }
        : group
    ));
  };

  const updateActionItem = async (itemId: string, field: keyof ActionItem, value: any) => {
    const now = new Date().toISOString();
    setActionGroups(prev => prev.map(group => ({
      ...group,
      items: group.items.map(item => 
        item.id === itemId 
          ? { ...item, [field]: value, updated_at: now }
          : item
      )
    })));
  };

  const deleteActionItem = async (itemId: string) => {
    setActionGroups(prev => prev.map(group => ({
      ...group,
      items: group.items.filter(item => item.id !== itemId)
    })));
  };

  const markItemCompleted = (itemId: string) => {
    updateActionItem(itemId, 'status', 'Completed');
  };

  const getGroupCounts = (group: UIActionGroup) => {
    const open = group.items.filter(item => item.status !== 'Completed').length;
    const completed = group.items.filter(item => item.status === 'Completed').length;
    return { open, completed };
  };

  const getNextDueDate = (group: UIActionGroup) => {
    const openItems = group.items.filter(item => item.status !== 'Completed' && item.due_date);
    if (openItems.length === 0) return null;
    return openItems.sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())[0].due_date;
  };

  const sortedActionGroups = [...actionGroups].sort((a, b) => {
    const aNextDue = getNextDueDate(a);
    const bNextDue = getNextDueDate(b);
    if (!aNextDue && !bNextDue) return 0;
    if (!aNextDue) return 1;
    if (!bNextDue) return -1;
    return new Date(aNextDue).getTime() - new Date(bNextDue).getTime();
  });

  const statusColors = {
    'Pending Client side': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    'Pending COR Side': 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    'In progress': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    'Completed': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const scrollToActionGroup = (meetingId: string) => {
    const group = actionGroups.find(g => g.meeting_id === meetingId);
    if (group) {
      // Expand the group if it exists
      setExpandedGroups(prev => new Set([...prev, group.id]));
      
      // Scroll to action items section (you can adjust selector as needed)
      const actionItemsSection = document.querySelector('[data-section="action-items"]');
      if (actionItemsSection) {
        actionItemsSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Handle ESC key for full-screen mode
  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isFullScreen) setIsFullScreen(false);
        if (viewingText) setViewingText(null);
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isFullScreen, viewingText]);

  return (
    <>
    <div className="mx-auto px-6 w-full max-w-[1800px] 2xl:max-w-[2000px] py-8 space-y-8">
      {/* Meeting Log Section */}
        
        {/* Meeting Form */}
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 mb-6">
          <h3 className="text-lg font-medium text-white mb-4">
            {editingMeetingId ? 'Edit Meeting' : 'Log New Meeting'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Date <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                value={meetingForm.date}
                onChange={(e) => setMeetingForm(prev => ({ ...prev, date: e.target.value }))}
                className="w-full bg-[#0B0F1A]/50 border border-white/20 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-200"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Subject <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={meetingForm.subject}
                onChange={(e) => setMeetingForm(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Meeting subject..."
                className="w-full bg-[#0B0F1A]/50 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Purpose</label>
              <textarea
                rows={3}
                value={meetingForm.purpose}
                onChange={(e) => setMeetingForm(prev => ({ ...prev, purpose: e.target.value }))}
                placeholder="Meeting purpose..."
                className="w-full bg-[#0B0F1A]/50 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-200 resize-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Summary</label>
              <textarea
                rows={3}
                value={meetingForm.summary}
                onChange={(e) => setMeetingForm(prev => ({ ...prev, summary: e.target.value }))}
                placeholder="Meeting summary..."
                className="w-full bg-[#0B0F1A]/50 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-200 resize-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Summary Mail Sent? <span className="text-red-400">*</span>
              </label>
              <div className="flex space-x-6 mb-3">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="summaryMailSent"
                    checked={meetingForm.summary_mail_sent === true}
                    onChange={() => setMeetingForm(prev => ({ ...prev, summary_mail_sent: true, summary_mail_reason: '' }))}
                    className="w-4 h-4 text-cyan-600 bg-[#0B0F1A] border-white/20 focus:ring-cyan-500/50"
                  />
                  <span className="text-white">Yes</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="summaryMailSent"
                    checked={meetingForm.summary_mail_sent === false}
                    onChange={() => setMeetingForm(prev => ({ ...prev, summary_mail_sent: false }))}
                    className="w-4 h-4 text-cyan-600 bg-[#0B0F1A] border-white/20 focus:ring-cyan-500/50"
                  />
                  <span className="text-white">No</span>
                </label>
              </div>
              
              {!meetingForm.summary_mail_sent && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Reason <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={meetingForm.summary_mail_reason}
                    onChange={(e) => setMeetingForm(prev => ({ ...prev, summary_mail_reason: e.target.value }))}
                    placeholder="Why wasn't summary mail sent?"
                    className="w-full bg-[#0B0F1A]/50 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-200 resize-none"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Thread is closed? <span className="text-red-400">*</span>
              </label>
              <div className="flex space-x-6 mb-3">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="threadClosed"
                    checked={meetingForm.thread_closed === true}
                    onChange={() => setMeetingForm(prev => ({ ...prev, thread_closed: true, next_meeting_dependencies: '' }))}
                    className="w-4 h-4 text-cyan-600 bg-[#0B0F1A] border-white/20 focus:ring-cyan-500/50"
                  />
                  <span className="text-white">Yes</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="threadClosed"
                    checked={meetingForm.thread_closed === false}
                    onChange={() => setMeetingForm(prev => ({ ...prev, thread_closed: false }))}
                    className="w-4 h-4 text-cyan-600 bg-[#0B0F1A] border-white/20 focus:ring-cyan-500/50"
                  />
                  <span className="text-white">No</span>
                </label>
              </div>
              
              {!meetingForm.thread_closed && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Next Meeting Dependencies <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={meetingForm.next_meeting_dependencies}
                    onChange={(e) => setMeetingForm(prev => ({ ...prev, next_meeting_dependencies: e.target.value }))}
                    placeholder="What needs to happen before next meeting?"
                    className="w-full bg-[#0B0F1A]/50 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-200 resize-none"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            {editingMeetingId && (
              <button
                onClick={resetMeetingForm}
                className="px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
            )}
            <button
              onClick={saveMeeting}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-6 py-2 rounded-lg transition-all duration-200 font-medium"
            >
              {editingMeetingId ? 'Update Meeting' : 'Save Meeting'}
            </button>
          </div>
        </div>

        {/* Meetings List */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Date</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Subject</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Purpose</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Summary Mail Sent</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Thread Closed</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Next Meeting Dependencies</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Reason</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Last Updated</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {meetings.map((meeting) => (
                <tr key={meeting.id} className="border-b border-slate-700/30 hover:bg-slate-800/30 transition-colors duration-200">
                  <td className="py-3 px-4 text-sm text-white">
                    {new Date(meeting.date).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-sm text-white font-medium">
                    {meeting.subject}
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-300 max-w-xs truncate">
                    {meeting.purpose || '—'}
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                      meeting.summary_mail_sent 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                      {meeting.summary_mail_sent ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                      meeting.thread_closed 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                      {meeting.thread_closed ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-300 max-w-xs truncate" title={meeting.next_meeting_dependencies}>
                    {meeting.thread_closed ? '—' : (meeting.next_meeting_dependencies || '—')}
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-300 max-w-xs truncate" title={meeting.summary_mail_reason}>
                    {meeting.summary_mail_sent ? '—' : (meeting.summary_mail_reason || '—')}
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-300">
                    {new Date(meeting.updated_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <div className="flex items-center space-x-2">
                      {meeting.summary && (
                        <button
                          onClick={() => copyToClipboard(meeting.summary)}
                          className="p-1 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded transition-colors"
                          title="Copy summary to clipboard"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => scrollToActionGroup(meeting.id)}
                        className="p-1 text-violet-400 hover:text-violet-300 hover:bg-violet-500/10 rounded transition-colors"
                        title="Open action items for this meeting"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => editMeeting(meeting)}
                        className="p-1 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded transition-colors"
                        title="Edit meeting"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteMeeting(meeting.id)}
                        className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                        title="Delete meeting"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {meetings.length === 0 && (
            <div className="text-center py-8">
              <p className="text-slate-400">No meetings logged yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Action Items Section */}
      <div className="bg-[#0B1220]/80 backdrop-blur-md border border-white/10 rounded-[18px] shadow-[0_8px_32px_rgba(0,0,0,0.35)] p-6" data-section="action-items">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Action Items</h2>
          <button 
            onClick={addActionGroup}
            className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200"
          >
            <Plus className="h-4 w-4" />
            <span>Add Group</span>
          </button>
        </div>

        <div className="space-y-4">
          {sortedActionGroups.map((group) => {
            const isExpanded = expandedGroups.has(group.id);
            const isEditing = editingGroupId === group.id;
            const counts = getGroupCounts(group);
            
            return (
              <div key={group.id} className="bg-slate-800/50 rounded-xl border border-slate-700/50">
                {/* Group Header */}
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <button
                        onClick={() => toggleGroupExpansion(group.id)}
                        className="p-1 text-slate-400 hover:text-white transition-colors"
                      >
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                      
                      {isEditing ? (
                        <div className="flex items-center space-x-3 flex-1">
                          <input
                            type="text"
                            value={group.subject}
                            onChange={(e) => updateActionGroup(group.id, 'subject', e.target.value)}
                            placeholder="Group subject..."
                            className="flex-1 bg-[#0B0F1A]/50 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-200"
                          />
                          <input
                            type="text"
                            value={group.owner || ''}
                            onChange={(e) => updateActionGroup(group.id, 'owner', e.target.value)}
                            placeholder="Owner (optional)..."
                            className="w-48 bg-[#0B0F1A]/50 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-200"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center space-x-4 flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-lg font-medium text-white">{group.subject || 'Untitled Group'}</h3>
                            {group.meeting_id && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border bg-violet-500/10 text-violet-400 border-violet-500/20">
                                Meeting
                              </span>
                            )}
                          </div>
                          {group.owner && (
                            <div className="flex items-center space-x-1 text-sm text-slate-300">
                              <User className="h-4 w-4" />
                              <span>{group.owner}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-2 text-sm text-slate-400">
                            <span>{counts.open} open</span>
                            <span>•</span>
                            <span>{counts.completed} completed</span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {isEditing ? (
                        <>
                          <button
                            onClick={() => setEditingGroupId(null)}
                            className="px-3 py-1 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors text-sm"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => setEditingGroupId(null)}
                            className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors text-sm"
                          >
                            Save
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => setEditingGroupId(group.id)}
                            className="p-1 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded transition-colors"
                            title="Edit group"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteActionGroup(group.id)}
                            className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                            title="Delete group"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Items */}
                {isExpanded && (
                  <div className="border-t border-slate-700/50 p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-sm font-medium text-slate-300">Items</h4>
                      <button
                        onClick={() => addActionItem(group.id)}
                        className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-1 rounded-lg flex items-center space-x-1 transition-colors text-sm"
                      >
                        <Plus className="h-3 w-3" />
                        <span>Add Item</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {group.items
                        .sort((a, b) => new Date(a.due_date || '').getTime() - new Date(b.due_date || '').getTime())
                        .map((item) => (
                        <div key={item.id} className="bg-[#0B0F1A]/50 rounded-lg p-3 border border-white/10">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
                            <div className="md:col-span-1">
                              <input
                                type="text"
                                value={item.item}
                                onChange={(e) => updateActionItem(item.id, 'item', e.target.value)}
                                placeholder="Action item..."
                                className="w-full bg-transparent border border-white/20 rounded-lg px-2 py-1 text-sm text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-200"
                              />
                            </div>
                            
                            <div>
                              <input
                                type="date"
                                value={item.due_date || ''}
                                onChange={(e) => updateActionItem(item.id, 'due_date', e.target.value)}
                                className="w-full bg-transparent border border-white/20 rounded-lg px-2 py-1 text-sm text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-200"
                              />
                            </div>
                            
                            <div>
                              <select
                                value={item.status}
                                onChange={(e) => updateActionItem(item.id, 'status', e.target.value)}
                                className={`w-full bg-[#0B0F1A]/50 border border-white/20 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-200 ${
                                  statusColors[item.status]?.includes('text-') ? statusColors[item.status].split(' ')[1] : 'text-white'
                                }`}
                              >
                                <option value="Pending Client side" className="bg-[#111726] text-white">Pending Client side</option>
                                <option value="Pending COR Side" className="bg-[#111726] text-white">Pending COR Side</option>
                                <option value="In progress" className="bg-[#111726] text-white">In progress</option>
                                <option value="Completed" className="bg-[#111726] text-white">Completed</option>
                              </select>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              {item.status !== 'Completed' && (
                                <button
                                  onClick={() => markItemCompleted(item.id)}
                                  className="p-1 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded transition-colors"
                                  title="Mark completed"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </button>
                              )}
                              <button
                                onClick={() => deleteActionItem(item.id)}
                                className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                                title="Delete item"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {group.items.length === 0 && (
                        <div className="text-center py-4 text-slate-400 text-sm">
                          No items in this group yet
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          
          {actionGroups.length === 0 && (
            <div className="text-center py-8">
              <p className="text-slate-400">No action groups created yet</p>
            </div>
          )}
        </div>
      </div>
    
    {/* Full-screen Modal */}
    {isFullScreen && (
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="w-[min(1400px,95vw)] h-[90vh] bg-[#111726]/95 backdrop-blur-md border border-white/8 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.45)] flex flex-col overflow-hidden">
          {/* Modal Header */}
          <div className="sticky top-0 bg-[#111726]/95 backdrop-blur border-b border-white/8 p-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[#E9EEF6]">Meeting Tracking - Full Screen</h2>
            <button
              onClick={() => setIsFullScreen(false)}
              className="p-2 text-[#A7B0C0] hover:text-[#E9EEF6] hover:bg-[#0B0F1A]/50 rounded-lg transition-colors"
              aria-label="Close full screen"
            >
              <Minimize2 className="h-5 w-5" />
            </button>
          </div>
          
          {/* Modal Content */}
          <div className="flex-1 overflow-auto p-6">
            {/* renderMeetingContent() */}
          </div>
        </div>
      </div>
    )}

    {/* Text Viewer Modal */}
    {viewingText && (
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-end">
        <div className="w-96 h-full bg-[#111726]/95 backdrop-blur-md border-l border-white/8 shadow-[0_20px_60px_rgba(0,0,0,0.45)] flex flex-col">
          <div className="p-6 border-b border-white/8 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[#E9EEF6]">{viewingText.type}</h3>
            <button
              onClick={() => setViewingText(null)}
              className="p-2 text-[#A7B0C0] hover:text-[#E9EEF6] hover:bg-[#0B0F1A]/50 rounded-lg transition-colors"
            >
              ×
            </button>
          </div>
          <div className="flex-1 p-6 overflow-auto">
            <p className="text-[#E9EEF6] whitespace-pre-wrap">{viewingText.content}</p>
          </div>
        </div>
      </div>
    )}

    {/* Toast Notification */}
    {showToast && (
      <div className="fixed bottom-4 right-4 z-50 bg-[#14D8C4] text-white px-4 py-2 rounded-lg shadow-lg animate-in slide-in-from-bottom-2 duration-300">
        Copied to clipboard!
      </div>
    )}
  </>
  );
};

export default MeetingTracking;