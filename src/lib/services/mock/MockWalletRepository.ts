import { IWalletRepository, Transaction } from '../../interfaces/wallet';

export class MockWalletRepository implements IWalletRepository {
  private balances: Map<string, number> = new Map();
  private transactions: Transaction[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const storedBalances = localStorage.getItem('mock_balances');
        const storedTx = localStorage.getItem('mock_transactions');
        if (storedBalances && storedTx) {
          this.balances = new Map(JSON.parse(storedBalances));
          this.transactions = JSON.parse(storedTx);
        } else {
          this.seedInitialWalletData();
        }
      } catch (e) {
        console.error('Error loading mock wallet data:', e);
      }
    } else {
      this.seedInitialWalletData();
    }
  }

  private seedInitialWalletData() {
    const partnerId = 'mock-partner-uuid';
    const businessId = 'mock-business-uuid';

    this.balances.set(partnerId, 50.00);
    this.balances.set(businessId, 450.00);

    this.transactions = [
      {
        id: 'tx-seed-1',
        userId: businessId,
        amount: 500.00,
        type: 'deposit',
        sessionId: null,
        status: 'completed',
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'tx-seed-2-biz',
        userId: businessId,
        amount: 15.00,
        type: 'fee',
        sessionId: 'session-seed-1',
        status: 'completed',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'tx-seed-2-part',
        userId: partnerId,
        amount: 15.00,
        type: 'reward',
        sessionId: 'session-seed-1',
        status: 'completed',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'tx-seed-3-biz',
        userId: businessId,
        amount: 25.00,
        type: 'fee',
        sessionId: 'session-seed-2',
        status: 'completed',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'tx-seed-3-part',
        userId: partnerId,
        amount: 25.00,
        type: 'reward',
        sessionId: 'session-seed-2',
        status: 'completed',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'tx-seed-4-biz',
        userId: businessId,
        amount: 10.00,
        type: 'fee',
        sessionId: 'session-seed-3',
        status: 'completed',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'tx-seed-4-part',
        userId: partnerId,
        amount: 10.00,
        type: 'reward',
        sessionId: 'session-seed-3',
        status: 'completed',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    this.saveWalletData();
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
