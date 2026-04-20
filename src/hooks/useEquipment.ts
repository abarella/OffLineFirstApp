import { useState, useEffect, useCallback } from 'react';
import { Equipment, EquipmentStatus } from '../types/Equipment';
import DatabaseService from '../services/DatabaseService';
import SyncService from '../services/SyncService';

export const useEquipment = () => {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState({
    pendingOperations: 0,
    lastSync: null as Date | null,
    isOnline: false,
    newRemoteChanges: 0,
  });

  // Load equipment from local database
  const loadEquipment = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      await DatabaseService.initDatabase();
      const data = await DatabaseService.getAllEquipment();
      setEquipment(data);
      
      // Update sync status
      const status = await SyncService.getSyncStatus();
      setSyncStatus(status);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar equipamentos');
    } finally {
      setLoading(false);
    }
  }, []);

  // Add new equipment
  const addEquipment = useCallback(async (newEquipment: Omit<Equipment, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus'>) => {
    try {
      setError(null);
      
      const equipmentData: Equipment = {
        ...newEquipment,
        syncStatus: 'pending_sync' as any
      };
      
      const id = await DatabaseService.insertEquipment(equipmentData);
      
      // Reload equipment list
      await loadEquipment();

      // If online, synchronize right away after local write.
      if (syncStatus.isOnline) {
        await SyncService.manualSync();
        await loadEquipment();
      }
      
      return id;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao adicionar equipamento');
      throw err;
    }
  }, [loadEquipment, syncStatus.isOnline]);

  // Update equipment
  const updateEquipment = useCallback(async (id: number, updates: Partial<Equipment>) => {
    try {
      setError(null);
      
      const existingEquipment = equipment.find(eq => eq.id === id);
      if (!existingEquipment) {
        throw new Error('Equipamento não encontrado');
      }
      
      const updatedEquipment: Equipment = {
        ...existingEquipment,
        ...updates,
        id
      };
      
      await DatabaseService.updateEquipment(updatedEquipment);
      
      // Reload equipment list
      await loadEquipment();

      // If online, synchronize right away after local write.
      if (syncStatus.isOnline) {
        await SyncService.manualSync();
        await loadEquipment();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar equipamento');
      throw err;
    }
  }, [equipment, loadEquipment, syncStatus.isOnline]);

  // Delete equipment
  const deleteEquipment = useCallback(async (id: number) => {
    try {
      setError(null);
      
      await DatabaseService.deleteEquipment(id);
      
      // Reload equipment list
      await loadEquipment();

      // If online, synchronize right away after local write.
      if (syncStatus.isOnline) {
        await SyncService.manualSync();
        await loadEquipment();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar equipamento');
      throw err;
    }
  }, [loadEquipment, syncStatus.isOnline]);

  // Manual sync
  const manualSync = useCallback(async () => {
    try {
      setError(null);
      await SyncService.manualSync();
      SyncService.acknowledgeRemoteChanges();
      setSyncStatus(prev => ({ ...prev, newRemoteChanges: 0 }));
      
      // Reload equipment and sync status
      await loadEquipment();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao sincronizar');
      throw err;
    }
  }, [loadEquipment]);

  // Set online status
  const setOnlineStatus = useCallback((online: boolean) => {
    SyncService.setOnlineStatus(online);
    setSyncStatus(prev => ({ ...prev, isOnline: online }));
  }, []);

  const acknowledgeRemoteChanges = useCallback(() => {
    SyncService.acknowledgeRemoteChanges();
    setSyncStatus(prev => ({ ...prev, newRemoteChanges: 0 }));
  }, []);

  const pingUrl = useCallback(async (url: string, expectedStatus?: number): Promise<boolean> => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(`${url}${url.includes('?') ? '&' : '?'}t=${Date.now()}`, {
        method: 'GET',
        cache: 'no-store',
        signal: controller.signal,
      });
      if (typeof expectedStatus === 'number') {
        return response.status === expectedStatus;
      }
      return response.ok;
    } catch {
      return false;
    } finally {
      clearTimeout(timeout);
    }
  }, []);

  const checkConnectivity = useCallback(async () => {
    const checks = await Promise.all([
      pingUrl('https://clients3.google.com/generate_204', 204),
      pingUrl('https://www.gstatic.com/generate_204', 204),
    ]);

    const hasInternet = checks.some(Boolean);
    setOnlineStatus(hasInternet);
  }, [pingUrl, setOnlineStatus]);

  // Keep online/offline state automatic based on real API reachability.
  useEffect(() => {
    checkConnectivity();
    const interval = setInterval(checkConnectivity, 15000);
    return () => clearInterval(interval);
  }, [checkConnectivity]);

  // Get equipment by ID
  const getEquipmentById = useCallback(async (id: number): Promise<Equipment | null> => {
    try {
      return await DatabaseService.getEquipmentById(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar equipamento');
      return null;
    }
  }, []);

  // Filter equipment by status
  const filterByStatus = useCallback((status: EquipmentStatus) => {
    return equipment.filter(eq => eq.status === status);
  }, [equipment]);

  // Search equipment
  const searchEquipment = useCallback((query: string) => {
    const lowerQuery = query.toLowerCase();
    return equipment.filter(eq => 
      eq.nome.toLowerCase().includes(lowerQuery) ||
      eq.enderecoIP.toLowerCase().includes(lowerQuery) ||
      eq.localizacao.toLowerCase().includes(lowerQuery) ||
      eq.tipoEquipamento.toLowerCase().includes(lowerQuery)
    );
  }, [equipment]);

  // Load equipment on mount
  useEffect(() => {
    loadEquipment();
  }, [loadEquipment]);

  // Update sync status periodically
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const status = await SyncService.getSyncStatus();
        setSyncStatus(status);
      } catch (err) {
        console.error('Error updating sync status:', err);
      }
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return {
    equipment,
    loading,
    error,
    syncStatus,
    addEquipment,
    updateEquipment,
    deleteEquipment,
    getEquipmentById,
    filterByStatus,
    searchEquipment,
    manualSync,
    setOnlineStatus,
    acknowledgeRemoteChanges,
    refresh: loadEquipment
  };
};
