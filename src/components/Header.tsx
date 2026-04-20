import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert
} from 'react-native';

interface HeaderProps {
  title: string;
  syncStatus: {
    pendingOperations: number;
    lastSync: Date | null;
    isOnline: boolean;
    newRemoteChanges: number;
  };
  onManualSync: () => void;
  onToggleOnlineStatus: () => void;
}

const Header: React.FC<HeaderProps> = ({
  title,
  syncStatus,
  onManualSync,
  onToggleOnlineStatus
}) => {
  const handleManualSync = () => {
    if (!syncStatus.isOnline) {
      Alert.alert('Offline', 'Não é possível sincronizar enquanto offline');
      return;
    }
    onManualSync();
  };

  const formatLastSync = (date: Date | null): string => {
    if (!date) return 'Nunca';
    
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Agora mesmo';
    if (diffInMinutes < 60) return `${diffInMinutes} min atrás`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} dias atrás`;
  };

  const getStatusColor = (isOnline: boolean): string => {
    return isOnline ? '#4CAF50' : '#F44336';
  };

  const getStatusText = (isOnline: boolean): string => {
    return isOnline ? 'Online' : 'Offline';
  };

  return (
    <View style={styles.header}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.statusIndicator}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(syncStatus.isOnline) }]} />
          <Text style={[styles.statusText, { color: getStatusColor(syncStatus.isOnline) }]}>
            {getStatusText(syncStatus.isOnline)}
          </Text>
          {syncStatus.newRemoteChanges > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{syncStatus.newRemoteChanges}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.syncInfo}>
        <View style={styles.syncStatusRow}>
          <Text style={styles.syncLabel}>Sincronização:</Text>
          <Text style={styles.syncValue}>
            {syncStatus.pendingOperations > 0 
              ? `${syncStatus.pendingOperations} pendente(s)`
              : 'Sincronizado'
            }
          </Text>
        </View>

        <View style={styles.syncStatusRow}>
          <Text style={styles.syncLabel}>Última sincronização:</Text>
          <Text style={styles.syncValue}>
            {formatLastSync(syncStatus.lastSync)}
          </Text>
        </View>

        {syncStatus.newRemoteChanges > 0 && (
          <View style={styles.syncStatusRow}>
            <Text style={styles.syncLabel}>Novidades:</Text>
            <Text style={[styles.syncValue, { color: '#FF9800' }]}>
              {syncStatus.newRemoteChanges} atualização(ões) recebida(s)
            </Text>
          </View>
        )}

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[
              styles.syncButton,
              !syncStatus.isOnline && styles.syncButtonDisabled
            ]}
            onPress={handleManualSync}
            disabled={!syncStatus.isOnline}
          >
            <Text style={[
              styles.syncButtonText,
              !syncStatus.isOnline && styles.syncButtonTextDisabled
            ]}>
              🔄 Sincronizar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.onlineToggleButton,
              { backgroundColor: getStatusColor(syncStatus.isOnline) }
            ]}
            onPress={onToggleOnlineStatus}
          >
            <Text style={styles.onlineToggleButtonText}>
              {syncStatus.isOnline ? '🌐' : '📱'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  badge: {
    marginLeft: 8,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  syncInfo: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
  },
  syncStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  syncLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  syncValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 12,
  },
  syncButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  syncButtonDisabled: {
    backgroundColor: '#ccc',
  },
  syncButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  syncButtonTextDisabled: {
    color: '#999',
  },
  onlineToggleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  onlineToggleButtonText: {
    fontSize: 18,
  },
});

export default Header;
