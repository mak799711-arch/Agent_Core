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
    throw new Error("Wallet functionality deprecated in V4 (Zero-Trust)");
  }

  async getTransactions(userId: string): Promise<Transaction[]> {
    throw new Error("Wallet functionality deprecated in V4 (Zero-Trust)");
  }

  async createTransaction(transaction: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction> {
    throw new Error("Wallet functionality deprecated in V4 (Zero-Trust)");
  }

  async updateTransactionStatus(id: string, status: 'completed' | 'failed'): Promise<Transaction> {
    throw new Error("Wallet functionality deprecated in V4 (Zero-Trust)");
  }
}
