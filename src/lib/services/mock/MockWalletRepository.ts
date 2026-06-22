import { IWalletRepository, Transaction } from '../../interfaces/wallet';

export class MockWalletRepository implements IWalletRepository {
  private balances: Map<string, number> = new Map();
  private transactions: Transaction[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const storedBalances = localStorage.getItem('mock_balances');
        if (storedBalances) {
          this.balances = new Map(JSON.parse(storedBalances));
        }
        const storedTx = localStorage.getItem('mock_transactions');
        if (storedTx) {
          this.transactions = JSON.parse(storedTx);
        }
      } catch (e) {
        console.error('Error loading mock wallet data:', e);
      }
    }
  }

  private saveWalletData() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('mock_balances', JSON.stringify(Array.from(this.balances.entries())));
        localStorage.setItem('mock_transactions', JSON.stringify(this.transactions));
      } catch (e) {
        console.error('Error saving mock wallet data:', e);
      }
    }
  }

  async getBalance(userId: string): Promise<number> {
    return this.balances.get(userId) || 0.00;
  }

  async getTransactions(userId: string): Promise<Transaction[]> {
    return this.transactions.filter(t => t.userId === userId);
  }

  async createTransaction(transaction: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction> {
    const newTx: Transaction = {
      ...transaction,
      id: `tx-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    };
    this.transactions.push(newTx);

    // Обновляем баланс
    if (newTx.status === 'completed') {
      const currentBalance = this.balances.get(newTx.userId) || 0;
      if (newTx.type === 'reward' || newTx.type === 'deposit' || newTx.type === 'escrow_release') {
        this.balances.set(newTx.userId, currentBalance + newTx.amount);
      } else if (newTx.type === 'withdrawal' || newTx.type === 'fee' || newTx.type === 'escrow_hold') {
        this.balances.set(newTx.userId, currentBalance - newTx.amount);
      }
    }

    this.saveWalletData();
    return newTx;
  }

  async updateTransactionStatus(id: string, status: 'completed' | 'failed'): Promise<Transaction> {
    const idx = this.transactions.findIndex(t => t.id === id);
    if (idx === -1) throw new Error('Transaction not found');
    
    const tx = this.transactions[idx];
    if (tx.status === 'pending' && status === 'completed') {
      const currentBalance = this.balances.get(tx.userId) || 0;
      if (tx.type === 'reward' || tx.type === 'deposit' || tx.type === 'escrow_release') {
        this.balances.set(tx.userId, currentBalance + tx.amount);
      } else if (tx.type === 'withdrawal' || tx.type === 'fee' || tx.type === 'escrow_hold') {
        this.balances.set(tx.userId, currentBalance - tx.amount);
      }
    }
    
    tx.status = status;
    this.saveWalletData();
    return tx;
  }
}
