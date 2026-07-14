import { supabase } from '../../supabase/client';

export interface SupportTicket {
  id: string;
  userId: string;
  message: string;
  status: 'open' | 'closed';
  createdAt: string;
}

export interface ITicketRepository {
  createTicket(userId: string, message: string): Promise<SupportTicket>;
  getTickets(userId?: string): Promise<SupportTicket[]>;
  updateTicketStatus(id: string, status: 'open' | 'closed'): Promise<void>;
}

export class SupabaseTicketRepository implements ITicketRepository {
  private mapTicket(data: any): SupportTicket {
    return {
      id: data.id,
      userId: data.user_id,
      message: data.message,
      status: data.status,
      createdAt: data.created_at
    };
  }

  async createTicket(userId: string, message: string): Promise<SupportTicket> {
    const { data, error } = await supabase
      .from('support_tickets')
      .insert({ user_id: userId, message, status: 'open' })
      .select()
      .single();

    if (error) throw error;
    return this.mapTicket(data);
  }

  async getTickets(userId?: string): Promise<SupportTicket[]> {
    let query = supabase
      .from('support_tickets')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(this.mapTicket);
  }

  async updateTicketStatus(id: string, status: 'open' | 'closed'): Promise<void> {
    const { error } = await supabase
      .from('support_tickets')
      .update({ status })
      .eq('id', id);

    if (error) throw error;
  }
}

export const ticketRepository = new SupabaseTicketRepository();
