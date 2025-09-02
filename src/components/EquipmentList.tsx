import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
  Alert,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { Equipment, EquipmentStatus } from '../types/Equipment';

interface EquipmentListProps {
  equipment: Equipment[];
  loading: boolean;
  onEdit: (equipment: Equipment) => void;
  onDelete: (id: number) => void;
  onRefresh: () => void;
  onStatusFilter: (status: EquipmentStatus | null) => void;
  selectedStatusFilter: EquipmentStatus | null;
}

const EquipmentList: React.FC<EquipmentListProps> = ({
  equipment,
  loading,
  onEdit,
  onDelete,
  onRefresh,
  onStatusFilter,
  selectedStatusFilter
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const filteredEquipment = useMemo(() => {
    let filtered = equipment;

    // Filter by status
    if (selectedStatusFilter) {
      filtered = filtered.filter(eq => eq.status === selectedStatusFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(eq =>
        eq.nome.toLowerCase().includes(query) ||
        eq.enderecoIP.toLowerCase().includes(query) ||
        eq.localizacao.toLowerCase().includes(query) ||
        eq.tipoEquipamento.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [equipment, searchQuery, selectedStatusFilter]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  };

  const handleDelete = (id: number, nome: string) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Tem certeza que deseja excluir o equipamento "${nome}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => onDelete(id) }
      ]
    );
  };

  const getStatusColor = (status: EquipmentStatus) => {
    switch (status) {
      case EquipmentStatus.ATIVO:
        return '#4CAF50';
      case EquipmentStatus.INATIVO:
        return '#F44336';
      case EquipmentStatus.EM_MANUTENCAO:
        return '#FF9800';
      default:
        return '#757575';
    }
  };

  const getSyncStatusIcon = (syncStatus: string) => {
    switch (syncStatus) {
      case 'synced':
        return '✓';
      case 'pending_sync':
        return '⏳';
      case 'pending_update':
        return '🔄';
      case 'pending_delete':
        return '🗑️';
      default:
        return '❓';
    }
  };

  const renderEquipmentItem = ({ item }: { item: Equipment }) => (
    <View style={styles.equipmentCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.equipmentName} numberOfLines={1}>
          {item.nome}
        </Text>
        <View style={styles.syncStatus}>
          <Text style={styles.syncStatusText}>
            {getSyncStatusIcon(item.syncStatus)}
          </Text>
        </View>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>IP:</Text>
          <Text style={styles.infoValue}>{item.enderecoIP}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Localização:</Text>
          <Text style={styles.infoValue}>{item.localizacao}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Tipo:</Text>
          <Text style={styles.infoValue}>{item.tipoEquipamento}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Status:</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => onEdit(item)}
        >
          <Text style={styles.editButtonText}>Editar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDelete(item.id!, item.nome)}
        >
          <Text style={styles.deleteButtonText}>Excluir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStatusFilter = () => (
    <View style={styles.statusFilterContainer}>
      <TouchableOpacity
        style={[
          styles.statusFilterButton,
          !selectedStatusFilter && styles.statusFilterButtonActive
        ]}
        onPress={() => onStatusFilter(null)}
      >
        <Text style={[
          styles.statusFilterButtonText,
          !selectedStatusFilter && styles.statusFilterButtonTextActive
        ]}>
          Todos
        </Text>
      </TouchableOpacity>

      {Object.values(EquipmentStatus).map((status) => (
        <TouchableOpacity
          key={status}
          style={[
            styles.statusFilterButton,
            selectedStatusFilter === status && styles.statusFilterButtonActive
          ]}
          onPress={() => onStatusFilter(status)}
        >
          <Text style={[
            styles.statusFilterButtonText,
            selectedStatusFilter === status && styles.statusFilterButtonTextActive
          ]}>
            {status}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  if (loading && equipment.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Carregando equipamentos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Buscar equipamentos..."
          placeholderTextColor="#999"
        />
      </View>

      {/* Status Filter */}
      {renderStatusFilter()}

      {/* Equipment List */}
      <FlatList
        data={filteredEquipment}
        renderItem={renderEquipmentItem}
        keyExtractor={(item) => item.id?.toString() || '0'}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#2196F3']}
            tintColor="#2196F3"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery.trim() || selectedStatusFilter
                ? 'Nenhum equipamento encontrado com os filtros aplicados'
                : 'Nenhum equipamento cadastrado'}
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  statusFilterContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  statusFilterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  statusFilterButtonActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  statusFilterButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  statusFilterButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  equipmentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  equipmentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  syncStatus: {
    marginLeft: 8,
  },
  syncStatusText: {
    fontSize: 16,
  },
  cardContent: {
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    minWidth: 80,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  cardActions: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#2196F3',
  },
  deleteButton: {
    backgroundColor: '#F44336',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});

export default EquipmentList;
