import { API_CONFIG } from '../config/database';
import { Equipment } from '../types/Equipment';

class ApiService {
  private baseUrl = API_CONFIG.baseUrl;
  private headers = API_CONFIG.headers;

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        ...this.headers,
        ...(init?.headers || {}),
      },
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      try {
        const body = await response.json();
        errorMessage = body?.message || errorMessage;
      } catch {
        // Ignore JSON parse error and keep default HTTP message.
      }
      throw new Error(errorMessage);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  }

  async createEquipment(equipment: Equipment): Promise<Equipment> {
    return this.request<Equipment>(API_CONFIG.endpoints.equipment, {
      method: 'POST',
      body: JSON.stringify(equipment),
    });
  }

  async updateEquipment(equipment: Equipment): Promise<void> {
    if (!equipment.id) throw new Error('updateEquipment: equipment.id is required');

    await this.request<void>(`${API_CONFIG.endpoints.equipment}/${equipment.id}`, {
      method: 'PUT',
      body: JSON.stringify(equipment),
    });
  }

  async deleteEquipment(id: number): Promise<void> {
    await this.request<void>(`${API_CONFIG.endpoints.equipment}/${id}`, {
      method: 'DELETE',
    });
  }
}

export default new ApiService();
