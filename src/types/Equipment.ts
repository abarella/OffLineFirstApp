export interface Equipment {
  id?: number;
  nome: string;
  enderecoIP: string;
  localizacao: string;
  tipoEquipamento: string;
  status: EquipmentStatus;
  createdAt?: Date;
  updatedAt?: Date;
  syncStatus: SyncStatus;
}

export enum EquipmentStatus {
  ATIVO = 'Ativo',
  INATIVO = 'Inativo',
  EM_MANUTENCAO = 'Em Manutenção'
}

export enum SyncStatus {
  SYNCED = 'synced',
  PENDING_SYNC = 'pending_sync',
  PENDING_UPDATE = 'pending_update',
  PENDING_DELETE = 'pending_delete'
}

export interface SyncOperation {
  id: string;
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  equipmentId: number;
  data?: Equipment;
  timestamp: Date;
}
