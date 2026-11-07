import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../../contexts/ThemeContext';
import { elderlyService } from '../../../services/api';

const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

function EditElderlyForm({ elderly, onClose, onUpdated, colors }) {
  const [nome, setNome] = useState(elderly?.nome || '');
  const [telefone, setTelefone] = useState(elderly?.telefone || '');
  const [tipoSanguineo, setTipoSanguineo] = useState(elderly?.tipoSanguineo || 'O+');
  const [peso, setPeso] = useState(elderly?.peso ? String(elderly.peso) : '');
  const [altura, setAltura] = useState(elderly?.altura ? String(elderly.altura) : '');
  const [alergias, setAlergias] = useState(
    Array.isArray(elderly?.alergias)
      ? elderly.alergias.join(', ')
      : String(elderly?.alergias || ''),
  );
  const [observacao, setObservacao] = useState(elderly?.observacao || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!elderly?.cpf) {
      setError('Idoso não encontrado.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const pesoNum = peso ? parseFloat(peso.replace(',', '.')) : null;
      const alturaNum = altura ? parseFloat(altura.replace(',', '.')) : null;

      let imc = null;
      if (pesoNum && alturaNum) {
        const altMeters = alturaNum > 3 ? alturaNum / 100 : alturaNum;
        imc = (pesoNum / (altMeters * altMeters)).toFixed(1);
      }

      const updated = await elderlyService.update(elderly.cpf, {
        nome: nome.trim(),
        telefone: telefone.trim(),
        tipoSanguineo,
        peso: pesoNum,
        altura: alturaNum,
        imc,
        alergias: alergias.trim(),
        observacao: observacao.trim(),
      });

      onClose();
      if (onUpdated) onUpdated(updated);
    } catch (err) {
      setError(err.friendlyMessage || 'Erro ao atualizar dados do idoso.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View
      style={[
        styles.sheet,
        {
          backgroundColor: colors.cardBackground,
          borderColor: colors.cardBorder,
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Atualizar Dados do Idoso</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Feather name="x" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {error ? (
          <View style={styles.errorBanner}>
            <Feather name="alert-circle" size={15} color="#ef4444" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Nome */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.label }]}>Nome Completo</Text>
          <TextInput
            style={[styles.input, { color: colors.inputText, borderColor: colors.inputBorder }]}
            value={nome}
            onChangeText={setNome}
            placeholder="Nome do idoso"
            placeholderTextColor={colors.placeholder}
          />
        </View>

        {/* Telefone */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.label }]}>Telefone / Contato</Text>
          <TextInput
            style={[styles.input, { color: colors.inputText, borderColor: colors.inputBorder }]}
            value={telefone}
            onChangeText={setTelefone}
            placeholder="(11) 99999-9999"
            placeholderTextColor={colors.placeholder}
            keyboardType="phone-pad"
          />
        </View>

        {/* Tipo Sanguíneo */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.label }]}>Tipo Sanguíneo</Text>
          <View style={styles.bloodTypeRow}>
            {bloodTypes.map((type) => {
              const isSelected = tipoSanguineo === type;
              return (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.bloodChip,
                    {
                      borderColor: isSelected ? colors.primary : colors.cardBorder,
                      backgroundColor: isSelected ? `${colors.primary}20` : colors.badgeBg,
                    },
                  ]}
                  onPress={() => setTipoSanguineo(type)}
                >
                  <Text
                    style={[
                      styles.bloodChipText,
                      { color: isSelected ? colors.primary : colors.text },
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Peso e Altura */}
        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.flex1]}>
            <Text style={[styles.label, { color: colors.label }]}>Peso (kg)</Text>
            <TextInput
              style={[styles.input, { color: colors.inputText, borderColor: colors.inputBorder }]}
              value={peso}
              onChangeText={setPeso}
              placeholder="Ex: 68.5"
              placeholderTextColor={colors.placeholder}
              keyboardType="decimal-pad"
            />
          </View>

          <View style={[styles.inputGroup, styles.flex1, { marginLeft: 12 }]}>
            <Text style={[styles.label, { color: colors.label }]}>Altura (cm ou m)</Text>
            <TextInput
              style={[styles.input, { color: colors.inputText, borderColor: colors.inputBorder }]}
              value={altura}
              onChangeText={setAltura}
              placeholder="Ex: 1.65"
              placeholderTextColor={colors.placeholder}
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        {/* Alergias */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.label }]}>Alergias (separadas por vírgula)</Text>
          <TextInput
            style={[styles.input, { color: colors.inputText, borderColor: colors.inputBorder }]}
            value={alergias}
            onChangeText={setAlergias}
            placeholder="Ex: Dipirona, Frutos do mar, Penicilina"
            placeholderTextColor={colors.placeholder}
          />
        </View>

        {/* Observações Clínicas */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.label }]}>Observações Clínicas / Recomendações</Text>
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              { color: colors.inputText, borderColor: colors.inputBorder },
            ]}
            value={observacao}
            onChangeText={setObservacao}
            placeholder="Ex: Histórico de hipertensão, prefere banho pela manhã..."
            placeholderTextColor={colors.placeholder}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Actions */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.btn, styles.cancelBtn, { borderColor: colors.cardBorder }]}
            onPress={onClose}
            disabled={isSubmitting}
          >
            <Text style={[styles.cancelBtnText, { color: colors.textSecondary }]}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, styles.saveBtn, { backgroundColor: colors.primary }]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.saveBtnText}>Salvar Alterações</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

export default function EditElderlyModal({
  visible,
  onClose,
  elderly,
  onUpdated,
}) {
  const { colors } = useTheme();

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        {visible ? (
          <EditElderlyForm
            key={elderly?.cpf || 'edit-elderly'}
            elderly={elderly}
            onClose={onClose}
            onUpdated={onUpdated}
            colors={colors}
          />
        ) : null}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderBottomWidth: 0,
    maxHeight: '90%',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#37415133',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ef444415',
    padding: 10,
    borderRadius: 8,
    marginBottom: 14,
    gap: 8,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 13,
    flex: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
  },
  flex1: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
  },
  textArea: {
    minHeight: 70,
  },
  bloodTypeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  bloodChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  bloodChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  btn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    borderWidth: 1,
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  saveBtn: {
    shadowColor: '#2563eb',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
