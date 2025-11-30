import { apiService } from './api';

export interface Client {
  id: number;
  firstName: string;
  secondName: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  address?: string | null;
  dateRegistered: string;
  isActive: boolean;
}

export interface CreateClientDto {
  firstName: string;
  secondName: string;
  email: string;
  phone?: string;
  company?: string;
  address?: string;
}

export interface UpdateClientDto extends CreateClientDto {
  isActive: boolean;
}

class ClientService {
  async getAllClients(): Promise<Client[]> {
    return await apiService.get('/Clients');
  }

  async getClientById(id: number): Promise<Client> {
    return await apiService.get(`/Clients/${id}`);
  }

  async createClient(client: CreateClientDto): Promise<Client> {
    return await apiService.post('/Clients', client);
  }

  async updateClient(id: number, client: UpdateClientDto): Promise<void> {
    await apiService.put(`/Clients/${id}`, client);
  }

  async deleteClient(id: number): Promise<void> {
    await apiService.delete(`/Clients/${id}`);
  }
}

export const clientService = new ClientService();
