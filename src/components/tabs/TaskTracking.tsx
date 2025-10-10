import React, { useState } from 'react';
import { Plus, Trash2, X, Calendar, User, AlertTriangle, Eye, Edit } from 'lucide-react';

interface Task {
  id: string;
  startDate: string;
  status: 'Not started' | 'In progress' | 'Pending Client Action' | 'Pending Client Response' | 'Pending Manager Approval' | 'Completed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  taskName: string;
  description: string;
  emailSubject: string;
  deviceTechnology: string;
  dependencies: string;
  collaborators: string;
  notes: string;
  endDate: string;
}

const TaskTracking: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 'task-1',
      startDate: '2025-01-17',
      status: 'In progress',
      priority: 'high',
      taskName: 'Tune Trading API health threshold',
      description: 'Review and adjust health check thresholds for trading API to reduce false positives',
      emailSubject: 'DIFC - Trading API Health Threshold Adjustment',
      deviceTechnology: 'API Gateway',
      dependencies: 'Database team approval',
      collaborators: 'Omar Sleem, Ahmed Al Mansouri',
      notes: 'Client requested lower sensitivity',
      endDate: '2025-01-20'
    }
  ]);

  // Task Form State
  const [taskForm, setTaskForm] = useState({
    startDate: '',
    status: 'Not started' as Task['status'],
    priority: 'medium' as Task['priority'],
    taskName: '',
    description: '',
    emailSubject: '',
    deviceTechnology: '',
    dependencies: '',
    collaborators: '',
    notes: '',
    endDate: ''
  });

  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [viewingTask, setViewingTask] = useState<Task | null>(null);

  const statusOptions = [
    'Not started',
    'In progress', 
    'Pending Client Action',
    'Pending Client Response',
    'Pending Manager Approval',
    'Completed'
  ];

  const priorityOptions = ['low', 'medium', 'high', 'critical'];

  const priorityColors = {
    low: 'text-slate-400',
    medium: 'text-amber-400',
    high: 'text-orange-400',
    critical: 'text-red-400'
  };

  const statusColors = {
    'Not started': 'text-slate-400',
    'In progress': 'text-cyan-400',
    'Pending Client Action': 'text-amber-400',
    'Pending Client Response': 'text-amber-400',
    'Pending Manager Approval': 'text-violet-400',
    'Completed': 'text-emerald-400'
  };

  const calculateDuration = (startDate: string, endDate: string): number | null => {
    if (!startDate || !endDate) return null;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) {
      return null;
    }
    
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  // Task Form Handlers
  const resetTaskForm = () => {
    setTaskForm({
      startDate: '',
      status: 'Not started',
      priority: 'medium',
      taskName: '',
      description: '',
      emailSubject: '',
      deviceTechnology: '',
      dependencies: '',
      collaborators: '',
      notes: '',
      endDate: ''
    });
    setEditingTaskId(null);
  };

  const validateTaskForm = () => {
    const errors: string[] = [];
    if (!taskForm.startDate) errors.push('Start date is required');
    if (!taskForm.taskName.trim()) errors.push('Task name is required');
    if (taskForm.startDate && taskForm.endDate) {
      const start = new Date(taskForm.startDate);
      const end = new Date(taskForm.endDate);
      if (end < start) errors.push('End date must be after start date');
    }
    return errors;
  };

  const saveTask = async () => {
    const errors = validateTaskForm();
    if (errors.length > 0) {
      alert('Please fix the following errors:\n' + errors.join('\n'));
      return;
    }

    if (editingTaskId) {
      // Update existing task
      setTasks(prev => prev.map(task => 
        task.id === editingTaskId 
          ? { ...task, ...taskForm }
          : task
      ));
    } else {
      // Create new task
      const newTask: Task = {
        id: `task-${Date.now()}`,
        ...taskForm
      };
      setTasks(prev => [...prev, newTask]);
    }

    resetTaskForm();
  };

  const editTask = (task: Task) => {
    setTaskForm({
      startDate: task.startDate,
      status: task.status,
      priority: task.priority,
      taskName: task.taskName,
      description: task.description,
      emailSubject: task.emailSubject,
      deviceTechnology: task.deviceTechnology,
      dependencies: task.dependencies,
      collaborators: task.collaborators,
      notes: task.notes,
      endDate: task.endDate
    });
    setEditingTaskId(task.id);
  };

  const deleteTask = (id: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      setTasks(prev => prev.filter(task => task.id !== id));
    }
  };

  const hasDateError = (task: Task): boolean => {
    if (!task.startDate || !task.endDate) return false;
    const start = new Date(task.startDate);
    const end = new Date(task.endDate);
    return end < start;
  };

  const hasValidationError = (task: Task, field: 'taskName' | 'startDate'): boolean => {
    return !task[field] || task[field].trim() === '';
  };

  // Parse tags from string (comma or space separated)
  const parseTags = (value: string): string[] => {
    return value.split(/[,\s]+/).filter(tag => tag.trim().length > 0);
  };

  // Render tag input
  const renderTagInput = (value: string, onChange: (value: string) => void, placeholder: string) => {
    const tags = parseTags(value);
    
    return (
      <div className="space-y-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-[#0B0F1A]/50 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-200"
        />
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-[#0B0F1A]/50 text-[#A7B0C0] border border-white/10"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="mx-auto px-6 w-full max-w-[1800px] 2xl:max-w-[2000px] py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-[#E9EEF6]">Task Tracking</h1>
          <p className="text-[#A7B0C0] mt-2">Manage and track project tasks and deliverables</p>
        </div>
      </div>

      {/* Task Form Card */}
      <div className="bg-[#111726]/80 backdrop-blur-sm rounded-2xl border border-white/8 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <h3 className="text-lg font-medium text-[#E9EEF6] mb-4">
          {editingTaskId ? 'Edit Task' : 'Add New Task'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-[#A7B0C0] mb-2">
              Start Date <span className="text-red-400">*</span>
            </label>
            <input
              type="date"
              value={taskForm.startDate}
              onChange={(e) => setTaskForm(prev => ({ ...prev, startDate: e.target.value }))}
              className="w-full bg-[#0B0F1A]/50 border border-white/20 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-200"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[#A7B0C0] mb-2">
              End Date
            </label>
            <input
              type="date"
              value={taskForm.endDate}
              onChange={(e) => setTaskForm(prev => ({ ...prev, endDate: e.target.value }))}
              className="w-full bg-[#0B0F1A]/50 border border-white/20 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-200"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-[#A7B0C0] mb-2">Status</label>
            <select
              value={taskForm.status}
              onChange={(e) => setTaskForm(prev => ({ ...prev, status: e.target.value as Task['status'] }))}
              className="w-full bg-[#0B0F1A]/50 border border-white/20 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-200"
            >
              {statusOptions.map(status => (
                <option key={status} value={status} className="bg-[#111726] text-white">
                  {status}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[#A7B0C0] mb-2">Priority</label>
            <select
              value={taskForm.priority}
              onChange={(e) => setTaskForm(prev => ({ ...prev, priority: e.target.value as Task['priority'] }))}
              className="w-full bg-[#0B0F1A]/50 border border-white/20 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-200"
            >
              {priorityOptions.map(priority => (
                <option key={priority} value={priority} className="bg-[#111726] text-white capitalize">
                  {priority}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-[#A7B0C0] mb-2">
            Task Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={taskForm.taskName}
            onChange={(e) => setTaskForm(prev => ({ ...prev, taskName: e.target.value }))}
            placeholder="Enter task name..."
            className="w-full bg-[#0B0F1A]/50 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-200"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-[#A7B0C0] mb-2">Description</label>
            <textarea
              rows={3}
              value={taskForm.description}
              onChange={(e) => setTaskForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Task description..."
              className="w-full bg-[#0B0F1A]/50 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-200 resize-none"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[#A7B0C0] mb-2">Email Subject</label>
            <input
              type="text"
              value={taskForm.emailSubject}
              onChange={(e) => setTaskForm(prev => ({ ...prev, emailSubject: e.target.value }))}
              placeholder="Email subject line..."
              className="w-full bg-[#0B0F1A]/50 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-200"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-[#A7B0C0] mb-2">Device/Technology</label>
            {renderTagInput(
              taskForm.deviceTechnology,
              (value) => setTaskForm(prev => ({ ...prev, deviceTechnology: value })),
              "e.g., Windows Agent, API Gateway"
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[#A7B0C0] mb-2">Dependencies</label>
            {renderTagInput(
              taskForm.dependencies,
              (value) => setTaskForm(prev => ({ ...prev, dependencies: value })),
              "Dependencies..."
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[#A7B0C0] mb-2">Collaborators</label>
            {renderTagInput(
              taskForm.collaborators,
              (value) => setTaskForm(prev => ({ ...prev, collaborators: value })),
              "Names, emails..."
            )}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-[#A7B0C0] mb-2">Notes</label>
          <textarea
            rows={2}
            value={taskForm.notes}
            onChange={(e) => setTaskForm(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Additional notes..."
            className="w-full bg-[#0B0F1A]/50 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-200 resize-none"
          />
        </div>

        {/* Duration Display */}
        {taskForm.startDate && taskForm.endDate && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-[#A7B0C0] mb-2">Duration (Days)</label>
            <div className="bg-[#0B0F1A]/30 border border-white/10 rounded-lg px-3 py-2 text-[#A7B0C0]">
              {calculateDuration(taskForm.startDate, taskForm.endDate) || '—'}
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-3">
          {editingTaskId && (
            <button
              onClick={resetTaskForm}
              className="px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors duration-200"
            >
              Cancel
            </button>
          )}
          <button
            onClick={saveTask}
            className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-6 py-2 rounded-lg transition-all duration-200 font-medium"
          >
            {editingTaskId ? 'Update Task' : 'Add Task'}
          </button>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="w-full bg-[#111726]/80 backdrop-blur-sm rounded-2xl border border-white/8 shadow-[0_20px_60px_rgba(0,0,0,0.45)] overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        
        <div className="p-6">
          <h2 className="text-xl font-semibold text-[#E9EEF6] mb-6">Tasks ({tasks.length})</h2>

          <div className="w-full">
            <table className="w-full">
              <colgroup>
                <col className="w-[120px]" />   {/* Start Date */}
                <col className="w-[140px]" />   {/* Status */}
                <col className="w-[100px]" />   {/* Priority */}
                <col className="w-[260px]" />   {/* Task Name */}
                <col className="w-[420px]" />   {/* Description */}
                <col className="w-[320px]" />   {/* Email Subject */}
                <col className="w-[200px]" />   {/* Device/Technology */}
                <col className="w-[200px]" />   {/* Dependencies */}
                <col className="w-[200px]" />   {/* Collaborators */}
                <col className="w-[200px]" />   {/* Notes */}
                <col className="w-[120px]" />   {/* End Date */}
                <col className="w-[100px]" />   {/* Duration */}
                <col className="w-[120px]" />   {/* Actions */}
              </colgroup>
              <thead>
                <tr className="border-b border-white/8">
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#A7B0C0]">Start Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#A7B0C0]">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#A7B0C0]">Priority</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#A7B0C0]">Task Name</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#A7B0C0]">Description</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#A7B0C0]">Email Subject</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#A7B0C0]">Device/Technology</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#A7B0C0]">Dependencies</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#A7B0C0]">Collaborators</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#A7B0C0]">Notes</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#A7B0C0]">End Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#A7B0C0]">Duration (Days)</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#A7B0C0]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id} className="border-b border-white/5 hover:bg-[#0B0F1A]/30 transition-colors duration-200">
                    <td className="py-3 px-4 text-sm text-[#E9EEF6]">
                      {task.startDate ? new Date(task.startDate).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                        task.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        task.status === 'In progress' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' :
                        task.status.includes('Pending') ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        'bg-slate-500/10 text-slate-400 border-slate-500/20'
                      }`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border capitalize ${
                        task.priority === 'critical' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                        task.priority === 'high' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                        task.priority === 'medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        'bg-slate-500/10 text-slate-400 border-slate-500/20'
                      }`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-[#E9EEF6] font-medium max-w-xs">
                      <div className="line-clamp-2 leading-tight" title={task.taskName}>
                        {task.taskName}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-[#A7B0C0] max-w-xs">
                      <div className="line-clamp-3 leading-tight text-xs" title={task.description}>
                        {task.description || '—'}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-[#A7B0C0] max-w-xs">
                      <div className="line-clamp-2 leading-tight" title={task.emailSubject}>
                        {task.emailSubject || '—'}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-[#A7B0C0]">
                      {task.deviceTechnology && (
                        <div className="flex flex-wrap gap-1 max-h-12 overflow-hidden">
                          {parseTags(task.deviceTechnology).slice(0, 2).map((tag, index) => (
                            <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-[#0B0F1A]/50 text-[#A7B0C0] border border-white/10">
                              {tag}
                            </span>
                          ))}
                          {parseTags(task.deviceTechnology).length > 2 && (
                            <span className="text-xs text-[#A7B0C0]">+{parseTags(task.deviceTechnology).length - 2}</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-[#A7B0C0]">
                      {task.dependencies && (
                        <div className="flex flex-wrap gap-1 max-h-12 overflow-hidden">
                          {parseTags(task.dependencies).slice(0, 2).map((tag, index) => (
                            <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-[#0B0F1A]/50 text-[#A7B0C0] border border-white/10">
                              {tag}
                            </span>
                          ))}
                          {parseTags(task.dependencies).length > 2 && (
                            <span className="text-xs text-[#A7B0C0]">+{parseTags(task.dependencies).length - 2}</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-[#A7B0C0]">
                      {task.collaborators && (
                        <div className="flex flex-wrap gap-1 max-h-12 overflow-hidden">
                          {parseTags(task.collaborators).slice(0, 2).map((tag, index) => (
                            <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-[#0B0F1A]/50 text-[#A7B0C0] border border-white/10">
                              {tag}
                            </span>
                          ))}
                          {parseTags(task.collaborators).length > 2 && (
                            <span className="text-xs text-[#A7B0C0]">+{parseTags(task.collaborators).length - 2}</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-[#A7B0C0] max-w-xs">
                      <div className="line-clamp-2 leading-tight text-xs" title={task.notes}>
                        {task.notes || '—'}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-[#E9EEF6]">
                      {task.endDate ? new Date(task.endDate).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-3 px-4 text-sm text-[#A7B0C0] text-center">
                      {calculateDuration(task.startDate, task.endDate) || '—'}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setViewingTask(task)}
                          className="p-1 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded transition-colors"
                          title="View task details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => editTask(task)}
                          className="p-1 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded transition-colors"
                          title="Edit task"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                          title="Delete task"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {tasks.length === 0 && (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-white/70 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-[#E9EEF6] mb-2">No tasks created yet</h3>
              <p className="text-[#A7B0C0]">Use the form above to add your first task.</p>
            </div>
          )}
        </div>
      </div>

      {/* View Task Modal */}
      {viewingTask && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-[#111726]/95 backdrop-blur-md border border-white/8 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.45)] relative max-h-[90vh] overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/8">
              <h2 className="text-xl font-semibold text-[#E9EEF6]">Task Details</h2>
              <button
                onClick={() => setViewingTask(null)}
                className="p-2 text-[#A7B0C0] hover:text-[#E9EEF6] hover:bg-[#0B0F1A]/50 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="space-y-6">
                {/* Date and Status Row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#A7B0C0] mb-2">Start Date</label>
                    <div className="bg-[#0B0F1A]/30 border border-white/8 rounded-lg px-3 py-2 text-[#E9EEF6]">
                      {viewingTask.startDate ? new Date(viewingTask.startDate).toLocaleDateString() : '—'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#A7B0C0] mb-2">End Date</label>
                    <div className="bg-[#0B0F1A]/30 border border-white/8 rounded-lg px-3 py-2 text-[#E9EEF6]">
                      {viewingTask.endDate ? new Date(viewingTask.endDate).toLocaleDateString() : '—'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#A7B0C0] mb-2">Status</label>
                    <div className="bg-[#0B0F1A]/30 border border-white/8 rounded-lg px-3 py-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                        viewingTask.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        viewingTask.status === 'In progress' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' :
                        viewingTask.status.includes('Pending') ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        'bg-slate-500/10 text-slate-400 border-slate-500/20'
                      }`}>
                        {viewingTask.status}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#A7B0C0] mb-2">Priority</label>
                    <div className="bg-[#0B0F1A]/30 border border-white/8 rounded-lg px-3 py-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border capitalize ${
                        viewingTask.priority === 'critical' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                        viewingTask.priority === 'high' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                        viewingTask.priority === 'medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        'bg-slate-500/10 text-slate-400 border-slate-500/20'
                      }`}>
                        {viewingTask.priority}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Task Name */}
                <div>
                  <label className="block text-sm font-medium text-[#A7B0C0] mb-2">Task Name</label>
                  <div className="bg-[#0B0F1A]/30 border border-white/8 rounded-lg px-3 py-2 text-[#E9EEF6]">
                    {viewingTask.taskName}
                  </div>
                </div>

                {/* Description and Email Subject */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#A7B0C0] mb-2">Description</label>
                    <div className="bg-[#0B0F1A]/30 border border-white/8 rounded-lg px-3 py-2 text-[#E9EEF6] min-h-[80px] max-h-[200px] overflow-y-auto">
                      {viewingTask.description || '—'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#A7B0C0] mb-2">Email Subject</label>
                    <div className="bg-[#0B0F1A]/30 border border-white/8 rounded-lg px-3 py-2 text-[#E9EEF6]">
                      {viewingTask.emailSubject || '—'}
                    </div>
                  </div>
                </div>

                {/* Tag Fields */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#A7B0C0] mb-2">Device/Technology</label>
                    <div className="bg-[#0B0F1A]/30 border border-white/8 rounded-lg px-3 py-2 min-h-[40px]">
                      {viewingTask.deviceTechnology ? (
                        <div className="flex flex-wrap gap-1">
                          {parseTags(viewingTask.deviceTechnology).map((tag, index) => (
                            <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-[#0B0F1A]/50 text-[#A7B0C0] border border-white/10">
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[#A7B0C0]">—</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#A7B0C0] mb-2">Dependencies</label>
                    <div className="bg-[#0B0F1A]/30 border border-white/8 rounded-lg px-3 py-2 min-h-[40px]">
                      {viewingTask.dependencies ? (
                        <div className="flex flex-wrap gap-1">
                          {parseTags(viewingTask.dependencies).map((tag, index) => (
                            <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-[#0B0F1A]/50 text-[#A7B0C0] border border-white/10">
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[#A7B0C0]">—</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#A7B0C0] mb-2">Collaborators</label>
                    <div className="bg-[#0B0F1A]/30 border border-white/8 rounded-lg px-3 py-2 min-h-[40px]">
                      {viewingTask.collaborators ? (
                        <div className="flex flex-wrap gap-1">
                          {parseTags(viewingTask.collaborators).map((tag, index) => (
                            <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-[#0B0F1A]/50 text-[#A7B0C0] border border-white/10">
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[#A7B0C0]">—</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-[#A7B0C0] mb-2">Notes</label>
                  <div className="bg-[#0B0F1A]/30 border border-white/8 rounded-lg px-3 py-2 text-[#E9EEF6] min-h-[60px] max-h-[150px] overflow-y-auto">
                    {viewingTask.notes || '—'}
                  </div>
                </div>

                {/* Duration Display */}
                {viewingTask.startDate && viewingTask.endDate && (
                  <div>
                    <label className="block text-sm font-medium text-[#A7B0C0] mb-2">Duration</label>
                    <div className="bg-[#0B0F1A]/30 border border-white/8 rounded-lg px-3 py-2 text-[#E9EEF6]">
                      {calculateDuration(viewingTask.startDate, viewingTask.endDate)} days
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end p-6 border-t border-white/8">
              <button
                onClick={() => setViewingTask(null)}
                className="px-4 py-2 text-[#A7B0C0] hover:text-[#E9EEF6] hover:bg-[#0B0F1A]/50 rounded-lg transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskTracking;