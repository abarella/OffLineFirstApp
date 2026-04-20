import { API_CONFIG } from '../config/database';
import { Equipment } from '../types/Equipment';

let fcmTokenForHeaders: string | null = null;

/** Permite que o servidor exclua este dispositivo do broadcast FCM após mutações feitas pelo próprio app. */
export function setFcmTokenForApiHeaders(token: string | null): void {
  fcmTokenForHeaders = token;
}

class ApiService {
  private baseUrl = API_CONFIG.baseUrl;
  private headers = API_CONFIG.headers;

  private toApiPayload(equipment: Equipment, includeId = false) {
    const payload: Record<string, unknown> = {
      nome: equipment.nome,
      enderecoIP: equipment.enderecoIP,
      localizacao: equipment.localizacao,
      tipoEquipamento: equipment.tipoEquipamento,
      status: equipment.status,
    };

    if (includeId && equipment.id != null) {
      payload.id = equipment.id;
    }

    return payload;
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const merged: Record<string, string> = {
      ...this.headers,
      ...(init?.headers as Record<string, string> | undefined),
    };
    if (fcmTokenForHeaders) {
      merged['X-Fcm-Token'] = fcmTokenForHeaders;
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: merged,
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      try {
        const text = await response.text();
        if (text) {
          try {
            const body = JSON.parse(text);
            const serverMessage = [body?.message, body?.error].filter(Boolean).join(' - ');
            errorMessage = serverMessage || text || errorMessage;
          } catch {
            errorMessage = text;
          }
        }
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
      body: JSON.stringify(this.toApiPayload(equipment, true)),
    });
  }

  async getEquipmentList(): Promise<Equipment[]> {
    return this.request<Equipment[]>(API_CONFIG.endpoints.equipment);
  }

  async updateEquipment(equipment: Equipment): Promise<void> {
    if (!equipment.id) throw new Error('updateEquipment: equipment.id is required');

    await this.request<void>(`${API_CONFIG.endpoints.equipment}/${equipment.id}`, {
      method: 'PUT',
      body: JSON.stringify(this.toApiPayload(equipment)),
    });
  }

  async deleteEquipment(id: number): Promise<void> {
    await this.request<void>(`${API_CONFIG.endpoints.equipment}/${id}`, {
      method: 'DELETE',
    });
  }

  async registerFcmToken(token: string): Promise<void> {
    await this.request<void>(API_CONFIG.endpoints.fcmTokens, {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }
}

export default new ApiService();
