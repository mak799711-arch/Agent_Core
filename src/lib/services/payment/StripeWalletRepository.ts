import { IWalletRepository, Transaction } from '../../interfaces/wallet';

/**
 * Stripe & Bank Integration Repository Template
 * 
 * To activate real bank payments, replace MockWalletRepository with this class in `@/lib/services/index.ts`.
 * This repository coordinates ledger balances on your database (e.g. Supabase) with real Stripe/Xendit API calls.
 */
export class StripeWalletRepository implements IWalletRepository {
  private apiBase = '/api/payments'; // Your backend route wrapping Stripe/Xendit SDKs

  /**
   * Fetches the current user balance from the database.
   */
  async getBalance(userId: string): Promise<number> {
    const res = await fetch(`${this.apiBase}/balance?userId=${userId}`);
    if (!res.ok) throw new Error('Failed to fetch balance');
    const data = await res.json();
    return data.balance;
  }

  /**
   * Retrieves all completed or pending transactions for the user from the database.
   */
  async getTransactions(userId: string): Promise<Transaction[]> {
    const res = await fetch(`${this.apiBase}/transactions?userId=${userId}`);
    if (!res.ok) throw new Error('Failed to fetch transactions');
    return await res.json();
  }

  /**
   * Handles deposits, withdrawals (card payouts), and escrow movements.
   */
  async createTransaction(transaction: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction> {
    // 1. Prepare payment parameters
    const body = {
      userId: transaction.userId,
      amount: transaction.amount,
      type: transaction.type, // 'reward' | 'withdrawal' | 'deposit' | 'escrow_hold' | 'escrow_release'
      sessionId: transaction.sessionId,
      status: transaction.status
    };

    // 2. Call your backend server route which calls the Stripe/Xendit API
    const res = await fetch(`${this.apiBase}/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'Payment system error');
    }

    return await res.json();
  }

  /**
   * Updates transaction status based on webhooks (e.g. Stripe Webhook for successful card charge/payout).
   */
  async updateTransactionStatus(id: string, status: 'completed' | 'failed'): Promise<Transaction> {
    const res = await fetch(`${this.apiBase}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactionId: id, status })
    });

    if (!res.ok) throw new Error('Failed to update payment status');
    return await res.json();
  }
}
