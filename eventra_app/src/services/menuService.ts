import { apiService } from './api';


export interface Menu {
  id: number;
  eventId?: number | null;  // Optional - menus can exist without event assignment
  name: string;
  category: string;
  description: string;
  pricePerPerson: number;
  minimumGuests: number;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  allergenInfo: string;
  isAvailable: boolean;
}

export interface CreateMenuDto {
  eventId?: number | null;  // Optional - menus are catalog items
  name: string;
  category: string;
  description: string;
  pricePerPerson: number;
  minimumGuests: number;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  allergenInfo: string;
}

// apiService already prefixes endpoints with '/api', so basePath must be relative
const basePath = '/Menus';

export const menuService = {
  getAll: async (): Promise<Menu[]> => {
    return apiService.get(`${basePath}`);
  },
  getByEvent: async (eventId: number): Promise<Menu[]> => {
    return apiService.get(`${basePath}/event/${eventId}`);
  },
  getById: async (id: number): Promise<Menu> => {
    return apiService.get(`${basePath}/${id}`);
  },
  create: async (payload: CreateMenuDto): Promise<Menu> => {
    return apiService.post(`${basePath}`, payload);
  },
  update: async (id: number, payload: CreateMenuDto): Promise<void> => {
    return apiService.put(`${basePath}/${id}`, payload);
  },
  delete: async (id: number): Promise<void> => {
    return apiService.delete(`${basePath}/${id}`);
  },
  setAvailability: async (id: number, isAvailable: boolean): Promise<{ message: string }> => {
    // Fallback to POST to a dedicated route if PATCH isn't supported by apiService
    return apiService.post(`${basePath}/${id}/availability`, isAvailable as unknown as Record<string, unknown>);
  },
};

export default menuService;
 
