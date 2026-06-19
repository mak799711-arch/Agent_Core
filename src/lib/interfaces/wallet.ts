export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: 'reward' | 'withdrawal' | 'deposit' | 'fee';
  sessionId: string | null;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
}

export interface IWalletRepository {
  getBalance(userId: string): Promise<number>;
  getTransactions(userId: string): Promise<Transaction[]>;
  createTransaction(transaction: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction>;
  updateTransactionStatus(id: string, status: 'completed' | 'failed'): Promise<Transaction>;
}
