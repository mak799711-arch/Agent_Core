export interface Business {
  id: string;
  ownerId: string;
  name: string;
  description: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  reserveBalance: number;
  isVerified: boolean;
  createdAt: string;
}

export interface IBusinessRepository {
  getBusinessByOwnerId(ownerId: string): Promise<Business | null>;
  createBusiness(data: Omit<Business, 'id' | 'createdAt' | 'reserveBalance' | 'isVerified'>): Promise<Business>;
  updateBusiness(id: string, updates: Partial<Omit<Business, 'id' | 'ownerId' | 'createdAt'>>): Promise<Business>;
}
