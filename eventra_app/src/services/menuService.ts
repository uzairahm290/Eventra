import { apiService } from './api';

export interface Menu {
  id: number;
  eventId: number;
  name: string;
  category?: string;
  description?: string;
  pricePerPerson: number;
  minimumGuests: number;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  allergenInfo?: string;
  isAvailable: boolean;
  createdAt: string;
}

export interface CreateMenuRequest {
  eventId: number;
  name: string;
  category?: string;
  description?: string;
  pricePerPerson: number;
  minimumGuests: number;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  allergenInfo?: string;
  isAvailable: boolean;
}

export interface UpdateMenuRequest extends CreateMenuRequest {
  id: number;
}

class MenuService {
  async getAllMenus(): Promise<Menu[]> {
    return await apiService.get('/Menus');
  }

  async getMenuById(id: number): Promise<Menu> {
    return await apiService.get(`/Menus/${id}`);
  }

  async getMenusByEvent(eventId: number): Promise<Menu[]> {
    return await apiService.get(`/Menus/event/${eventId}`);
  }

  async getAvailableMenusByEvent(eventId: number): Promise<Menu[]> {
    const menus = await this.getMenusByEvent(eventId);
    return menus.filter(m => m.isAvailable);
  }

  async createMenu(menuData: CreateMenuRequest): Promise<Menu> {
    return await apiService.post('/Menus', menuData);
  }

  async updateMenu(menuData: UpdateMenuRequest): Promise<Menu> {
    return await apiService.put(`/Menus/${menuData.id}`, menuData);
  }

  async deleteMenu(id: number): Promise<void> {
    return await apiService.delete(`/Menus/${id}`);
  }

  getDietaryTags(menu: Menu): string[] {
    const tags: string[] = [];
    if (menu.isVegan) tags.push('Vegan');
    else if (menu.isVegetarian) tags.push('Vegetarian');
    if (menu.isGlutenFree) tags.push('Gluten-Free');
    return tags;
  }
}

export const menuService = new MenuService();
