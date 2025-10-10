import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for database tables
export interface CollectorHealthCheck {
  id: string
  name: string
  ip: string
  status: 'healthy' | 'warning' | 'critical' | 'not_connected'
  last_event_at?: string
  last_file_at?: string
  last_updated_at?: string
  client_id?: number
  created_at: string
  updated_at: string
}

// Meeting Tracking Types
export interface Meeting {
  id: string
  date: string
  subject: string
  purpose?: string
  summary?: string
  summary_mail_sent: boolean
  summary_mail_reason?: string
  thread_closed: boolean
  next_meeting_dependencies?: string
  client_id?: number
  created_at: string
  updated_at: string
}

export interface ActionGroup {
  id: string
  subject: string
  owner?: string
  meeting_id?: string
  client_id?: number
  created_at: string
  updated_at: string
}

export interface ActionItem {
  id: string
  action_group_id: string
  item: string
  due_date?: string
  status: 'Pending Client side' | 'Pending COR Side' | 'In progress' | 'Completed'
  created_at: string
  updated_at: string
}

// Meeting service functions
export const meetingService = {
  // Meetings
  async getMeetings(clientId?: number) {
    let query = supabase
      .from('meetings')
      .select('*')
      .order('date', { ascending: false });
    
    if (clientId) {
      query = query.eq('client_id', clientId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data as Meeting[];
  },

  async createMeeting(meeting: Omit<Meeting, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('meetings')
      .insert([meeting])
      .select()
      .single();
    
    if (error) throw error;
    return data as Meeting;
  },

  async updateMeeting(id: string, updates: Partial<Meeting>) {
    const { data, error } = await supabase
      .from('meetings')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Meeting;
  },

  async deleteMeeting(id: string) {
    const { error } = await supabase
      .from('meetings')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Action Groups
  async getActionGroups(clientId?: number) {
    let query = supabase
      .from('action_groups')
      .select(`
        *,
        action_items (*)
      `)
      .order('created_at', { ascending: false });
    
    if (clientId) {
      query = query.eq('client_id', clientId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async createActionGroup(group: Omit<ActionGroup, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('action_groups')
      .insert([group])
      .select()
      .single();
    
    if (error) throw error;
    return data as ActionGroup;
  },

  async updateActionGroup(id: string, updates: Partial<ActionGroup>) {
    const { data, error } = await supabase
      .from('action_groups')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as ActionGroup;
  },

  async deleteActionGroup(id: string) {
    const { error } = await supabase
      .from('action_groups')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Action Items
  async createActionItem(item: Omit<ActionItem, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('action_items')
      .insert([item])
      .select()
      .single();
    
    if (error) throw error;
    return data as ActionItem;
  },

  async updateActionItem(id: string, updates: Partial<ActionItem>) {
    const { data, error } = await supabase
      .from('action_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as ActionItem;
  },

  async deleteActionItem(id: string) {
    const { error } = await supabase
      .from('action_items')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // RPC function for atomic meeting creation
  async createMeetingWithActionGroup(meetingData: any, createActionGroup = true) {
    const { data, error } = await supabase
      .rpc('create_meeting_with_action_group', {
        meeting_data: meetingData,
        create_action_group: createActionGroup
      });
    
    if (error) throw error;
    return data;
  }
};