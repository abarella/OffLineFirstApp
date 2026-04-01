import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Alert,
  StatusBar,
  Text
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEquipment } from '../hooks/useEquipment';
import Header from '../components/Header';
import EquipmentList from '../components/EquipmentList';
import EquipmentForm from '../components/EquipmentForm';
import { Equipment, EquipmentStatus } from '../types/Equipment';

const EquipmentScreen: React.FC = () => {
  const {
    equipment,
    loading,
    error,
    syncStatus,
    addEquipment,
    updateEquipment,
    deleteEquipment,
    manualSync,
    refresh
  } = useEquipment();

  const [showForm, setShowForm] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | undefined>();
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<EquipmentStatus | null>(null);

  const handleAddEquipment = useCallback(() => {
    setEditingEquipment(undefined);
    setShowForm(true);
  }, []);

  const handleEditEquipment = useCallback((equipment: Equipment) => {
    setEditingEquipment(equipment);
    setShowForm(true);
  }, []);

  const handleSaveEquipment = useCallback(async (equipmentData: Omit<Equipment, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus'>) => {
    try {
      if (editingEquipment) {
        await updateEquipment(editingEquipment.id!, equipmentData);
      } else {
        await addEquipment(equipmentData);
      }
      setShowForm(false);
      setEditingEquipment(undefined);
    } catch (error) {
      console.error('Error saving equipment:', error);
    }
  }, [editingEquipment, addEquipment, updateEquipment]);

  const handleCancelForm = useCallback(() => {
    setShowForm(false);
    setEditingEquipment(undefined);
  }, []);

  const handleDeleteEquipment = useCallback(async (id: number) => {
    try {
      await deleteEquipment(id);
    } catch (error) {
      console.error('Error deleting equipment:', error);
    }
  }, [deleteEquipment]);

  const handleManualSync = useCallback(async () => {
    try {
      await manualSync();
      Alert.alert('Sucesso', 'Sincronização realizada com sucesso!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao sincronizar. Tente novamente.';
      Alert.alert('Erro', message);
    }
  }, [manualSync]);

  const handleToggleOnlineStatus = useCallback(() => {
    Alert.alert(
      'Status automático',
      'O modo online/offline agora segue automaticamente a conexão de rede do dispositivo.'
    );
  }, []);

  const handleStatusFilter = useCallback((status: EquipmentStatus | null) => {
    setSelectedStatusFilter(status);
  }, []);

  const handleRefresh = useCallback(async () => {
    await refresh();
  }, [refresh]);

  // Show error if any
  if (error) {
    Alert.alert('Erro', error);
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <Header
        title="Gestão de Equipamentos"
        syncStatus={syncStatus}
        onManualSync={handleManualSync}
        onToggleOnlineStatus={handleToggleOnlineStatus}
      />

      <View style={styles.content}>
        <EquipmentList
          equipment={equipment}
          loading={loading}
          onEdit={handleEditEquipment}
          onDelete={handleDeleteEquipment}
          onRefresh={handleRefresh}
          onStatusFilter={handleStatusFilter}
          selectedStatusFilter={selectedStatusFilter}
        />
      </View>

      {/* Floating Action Button */}
      <View style={styles.fabContainer}>
        <View style={styles.fab} onTouchEnd={handleAddEquipment}>
          <Text style={styles.fabText}>+</Text>
        </View>
      </View>

      {/* Form Modal */}
      <Modal
        visible={showForm}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <EquipmentForm
          equipment={editingEquipment}
          onSave={handleSaveEquipment}
          onCancel={handleCancelForm}
          loading={loading}
        />
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 1000,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default EquipmentScreen;
