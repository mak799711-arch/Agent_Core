import { IWalletRepository, Transaction } from '../../interfaces/wallet';
import { supabase } from '../../supabase/client';

export class SupabaseWalletRepository implements IWalletRepository {

  private mapTransaction(data: any): Transaction {
    return {
      id: data.id,
      userId: data.user_id,
      amount: Number(data.amount),
      type: data.type as any,
      sessionId: data.session_id,
      status: data.status as any,
      createdAt: data.created_at
    };
  }

  async getBalance(userId: string): Promise<number> {
    // We calculate balance by summing up completed transactions
    // reward, deposit, escrow_release add to balance
    // withdrawal, fee, escrow_hold subtract from balance
    const { data, error } = await supabase
      .from('transactions')
      .select('amount, type')
      .eq('user_id', userId)
      .eq('status', 'completed');

    if (error) throw error;

    let balance = 0;
    for (const tx of data) {
      const amt = Number(tx.amount);
      if (['reward', 'deposit', 'escrow_release'].includes(tx.type)) {
        balance += amt;
      } else if (['withdrawal', 'fee', 'escrow_hold'].includes(tx.type)) {
        balance -= amt;
      }
    }
    return balance;
  }

  async getTransactions(userId: string): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(this.mapTransaction);
  }

  async createTransaction(transaction: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction> {
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id: transaction.userId,
        amount: transaction.amount,
        type: transaction.type,
        session_id: transaction.sessionId,
        status: transaction.status
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapTransaction(data);
  }

  async updateTransactionStatus(id: string, status: 'completed' | 'failed'): Promise<Transaction> {
    const { data, error } = await supabase
      .from('transactions')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this.mapTransaction(data);
  }
}
