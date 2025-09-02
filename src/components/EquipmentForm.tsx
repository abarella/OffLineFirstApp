import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Equipment, EquipmentStatus } from '../types/Equipment';

interface EquipmentFormProps {
  equipment?: Equipment;
  onSave: (equipment: Omit<Equipment, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus'>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const EquipmentForm: React.FC<EquipmentFormProps> = ({
  equipment,
  onSave,
  onCancel,
  loading = false
}) => {
  const [nome, setNome] = useState('');
  const [enderecoIP, setEnderecoIP] = useState('');
  const [localizacao, setLocalizacao] = useState('');
  const [tipoEquipamento, setTipoEquipamento] = useState('');
  const [status, setStatus] = useState<EquipmentStatus>(EquipmentStatus.ATIVO);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!equipment;

  useEffect(() => {
    if (equipment) {
      setNome(equipment.nome);
      setEnderecoIP(equipment.enderecoIP);
      setLocalizacao(equipment.localizacao);
      setTipoEquipamento(equipment.tipoEquipamento);
      setStatus(equipment.status);
    }
  }, [equipment]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!nome.trim()) {
      newErrors.nome = 'Nome do equipamento é obrigatório';
    }

    if (!enderecoIP.trim()) {
      newErrors.enderecoIP = 'Endereço IP é obrigatório';
    } else if (!isValidIP(enderecoIP.trim())) {
      newErrors.enderecoIP = 'Endereço IP inválido';
    }

    if (!localizacao.trim()) {
      newErrors.localizacao = 'Localização é obrigatória';
    }

    if (!tipoEquipamento.trim()) {
      newErrors.tipoEquipamento = 'Tipo de equipamento é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidIP = (ip: string): boolean => {
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipRegex.test(ip);
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      await onSave({
        nome: nome.trim(),
        enderecoIP: enderecoIP.trim(),
        localizacao: localizacao.trim(),
        tipoEquipamento: tipoEquipamento.trim(),
        status
      });

      Alert.alert(
        'Sucesso',
        isEditing ? 'Equipamento atualizado com sucesso!' : 'Equipamento adicionado com sucesso!'
      );
    } catch (error) {
      Alert.alert('Erro', 'Erro ao salvar equipamento. Tente novamente.');
    }
  };

  const getStatusColor = (statusOption: EquipmentStatus) => {
    switch (statusOption) {
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

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>
          {isEditing ? 'Editar Equipamento' : 'Novo Equipamento'}
        </Text>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome do Equipamento *</Text>
            <TextInput
              style={[styles.input, errors.nome ? styles.inputError : null]}
              value={nome}
              onChangeText={setNome}
              placeholder="Digite o nome do equipamento"
              placeholderTextColor="#999"
            />
            {errors.nome && <Text style={styles.errorText}>{errors.nome}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Endereço IP *</Text>
            <TextInput
              style={[styles.input, errors.enderecoIP ? styles.inputError : null]}
              value={enderecoIP}
              onChangeText={setEnderecoIP}
              placeholder="Ex: 192.168.1.100"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
            {errors.enderecoIP && <Text style={styles.errorText}>{errors.enderecoIP}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Localização *</Text>
            <TextInput
              style={[styles.input, errors.localizacao ? styles.inputError : null]}
              value={localizacao}
              onChangeText={setLocalizacao}
              placeholder="Digite a localização"
              placeholderTextColor="#999"
            />
            {errors.localizacao && <Text style={styles.errorText}>{errors.localizacao}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tipo de Equipamento *</Text>
            <TextInput
              style={[styles.input, errors.tipoEquipamento ? styles.inputError : null]}
              value={tipoEquipamento}
              onChangeText={setTipoEquipamento}
              placeholder="Digite o tipo de equipamento"
              placeholderTextColor="#999"
            />
            {errors.tipoEquipamento && <Text style={styles.errorText}>{errors.tipoEquipamento}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Status *</Text>
            <View style={styles.statusContainer}>
              {Object.values(EquipmentStatus).map((statusOption) => (
                <TouchableOpacity
                  key={statusOption}
                  style={[
                    styles.statusButton,
                    status === statusOption && styles.statusButtonActive,
                    { borderColor: getStatusColor(statusOption) }
                  ]}
                  onPress={() => setStatus(statusOption)}
                >
                  <Text
                    style={[
                      styles.statusButtonText,
                      status === statusOption && styles.statusButtonTextActive,
                      { color: status === statusOption ? getStatusColor(statusOption) : '#666' }
                    ]}
                  >
                    {statusOption}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onCancel}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.saveButton, loading && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            <Text style={styles.saveButtonText}>
              {loading ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Salvar')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
    textAlign: 'center',
  },
  form: {
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  inputError: {
    borderColor: '#F44336',
  },
  errorText: {
    color: '#F44336',
    fontSize: 14,
    marginTop: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusButton: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginHorizontal: 4,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  statusButtonActive: {
    backgroundColor: '#f0f8ff',
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusButtonTextActive: {
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#2196F3',
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EquipmentForm;
