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
import { medicationService } from '../../../services/api';

export default function AddMedicationModal({
  visible,
  onClose,
  idosoCpf,
  onMedicationCreated,
}) {
  const { colors } = useTheme();
  const [nomeMedicamento, setNomeMedicamento] = useState('');
  const [dosagem, setDosagem] = useState('');
  const [horarios, setHorarios] = useState('08:00');
  const [instrucoes, setInstrucoes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!nomeMedicamento.trim()) {
      setError('Informe o nome do medicamento.');
      return;
    }
    if (!idosoCpf) {
      setError('Idoso não selecionado.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await medicationService.create(idosoCpf, {
        nomeMedicamento: nomeMedicamento.trim(),
        dosagem: dosagem.trim() || 'Conforme prescrição',
        horarios: horarios.trim(),
        instrucoes: instrucoes.trim(),
        repetirDiariamente: true,
      });

      setNomeMedicamento('');
      setDosagem('');
      setHorarios('08:00');
      setInstrucoes('');
      onClose();
      if (onMedicationCreated) onMedicationCreated();
    } catch (err) {
      setError(err.friendlyMessage || 'Erro ao cadastrar medicamento.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
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
            <Text style={[styles.title, { color: colors.text }]}>Novo Medicamento</Text>
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
              <Text style={[styles.label, { color: colors.label }]}>Nome do Remédio *</Text>
              <TextInput
                style={[styles.input, { color: colors.inputText, borderColor: colors.inputBorder }]}
                placeholder="Ex: Losartana, Metformina, Dipirona"
                placeholderTextColor={colors.inputPlaceholder}
                value={nomeMedicamento}
                onChangeText={setNomeMedicamento}
              />
            </View>

            {/* Dosagem */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.label }]}>Dosagem</Text>
              <TextInput
                style={[styles.input, { color: colors.inputText, borderColor: colors.inputBorder }]}
                placeholder="Ex: 50mg, 1 comprimido, 20 gotas"
                placeholderTextColor={colors.inputPlaceholder}
                value={dosagem}
                onChangeText={setDosagem}
              />
            </View>

            {/* Horários */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.label }]}>Horários (separados por vírgula)</Text>
              <TextInput
                style={[styles.input, { color: colors.inputText, borderColor: colors.inputBorder }]}
                placeholder="Ex: 08:00, 14:00, 20:00"
                placeholderTextColor={colors.inputPlaceholder}
                value={horarios}
                onChangeText={setHorarios}
              />
            </View>

            {/* Instruções */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.label }]}>Instruções de administração</Text>
              <TextInput
                style={[styles.input, { color: colors.inputText, borderColor: colors.inputBorder }]}
                placeholder="Ex: Tomar em jejum, com água, após almoço"
                placeholderTextColor={colors.inputPlaceholder}
                value={instrucoes}
                onChangeText={setInstrucoes}
              />
            </View>

            {/* Submit */}
            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: colors.primary }]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.submitBtnText}>Salvar Prescrição</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '85%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150, 150, 150, 0.15)',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  content: {
    paddingVertical: 16,
    gap: 14,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    padding: 10,
    borderRadius: 8,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
  input: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  submitBtn: {
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});

