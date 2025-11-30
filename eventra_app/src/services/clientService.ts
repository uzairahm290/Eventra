import { apiService } from './api';

export interface Client {
  id: string;
  firstName: string;
  secondName: string;
  email: string | null;
  userName: string | null;
  dateRegistered: string;
}

class ClientService {
  async getAllClients(): Promise<Client[]> {
    return await apiService.get('/Clients');
  }

  async getClientById(id: string): Promise<Client> {
    return await apiService.get(`/Clients/${id}`);
  }

  async deleteClient(id: string): Promise<void> {
    await apiService.delete(`/Clients/${id}`);
  }
}

export const clientService = new ClientService();
