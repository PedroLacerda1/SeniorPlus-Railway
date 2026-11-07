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
import { eventService } from '../../../services/api';

const categories = ['Consulta', 'Atividade', 'Medicação', 'Social'];

export default function AddEventModal({
  visible,
  onClose,
  idosoCpf,
  onEventCreated,
}) {
  const { colors } = useTheme();
  const [titulo, setTitulo] = useState('');
  const [categoria, setCategoria] = useState('Consulta');
  const [data, setData] = useState(() => new Date().toISOString().split('T')[0]);
  const [horaInicio, setHoraInicio] = useState('09:00');
  const [horaFim, setHoraFim] = useState('10:00');
  const [localEvento, setLocalEvento] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!titulo.trim()) {
      setError('Por favor, informe o título do evento.');
      return;
    }
    if (!idosoCpf) {
      setError('Idoso não selecionado.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await eventService.create(idosoCpf, {
        titulo: titulo.trim(),
        categoria,
        data,
        horaInicio,
        horaFim,
        localEvento: localEvento.trim(),
        observacoes: observacoes.trim(),
        status: 'PENDENTE',
      });

      setTitulo('');
      setLocalEvento('');
      setObservacoes('');
      onClose();
      if (onEventCreated) onEventCreated();
    } catch (err) {
      setError(err.friendlyMessage || 'Erro ao salvar o evento.');
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
            <Text style={[styles.title, { color: colors.text }]}>Adicionar Evento</Text>
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

            {/* Título */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.label }]}>Título do Evento *</Text>
              <TextInput
                style={[styles.input, { color: colors.inputText, borderColor: colors.inputBorder }]}
                placeholder="Ex: Consulta com Cardiologista, Fisioterapia"
                placeholderTextColor={colors.inputPlaceholder}
                value={titulo}
                onChangeText={setTitulo}
              />
            </View>

            {/* Categoria */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.label }]}>Categoria</Text>
              <View style={styles.categoriesRow}>
                {categories.map((cat) => {
                  const isSelected = categoria === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.catBadge,
                        {
                          backgroundColor: isSelected ? colors.roleActiveBg : colors.roleInactiveBg,
                          borderColor: isSelected ? colors.primary : colors.cardBorder,
                        },
                      ]}
                      onPress={() => setCategoria(cat)}
                    >
                      <Text
                        style={[
                          styles.catText,
                          {
                            color: isSelected ? colors.primary : colors.subtitle,
                            fontWeight: isSelected ? '700' : '500',
                          },
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Data e Horários */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1.2 }]}>
                <Text style={[styles.label, { color: colors.label }]}>Data (AAAA-MM-DD)</Text>
                <TextInput
                  style={[styles.input, { color: colors.inputText, borderColor: colors.inputBorder }]}
                  placeholder="2026-10-22"
                  placeholderTextColor={colors.inputPlaceholder}
                  value={data}
                  onChangeText={setData}
                />
              </View>

              <View style={[styles.inputGroup, { flex: 0.9 }]}>
                <Text style={[styles.label, { color: colors.label }]}>Início</Text>
                <TextInput
                  style={[styles.input, { color: colors.inputText, borderColor: colors.inputBorder }]}
                  placeholder="09:00"
                  placeholderTextColor={colors.inputPlaceholder}
                  value={horaInicio}
                  onChangeText={setHoraInicio}
                />
              </View>

              <View style={[styles.inputGroup, { flex: 0.9 }]}>
                <Text style={[styles.label, { color: colors.label }]}>Fim</Text>
                <TextInput
                  style={[styles.input, { color: colors.inputText, borderColor: colors.inputBorder }]}
                  placeholder="10:00"
                  placeholderTextColor={colors.inputPlaceholder}
                  value={horaFim}
                  onChangeText={setHoraFim}
                />
              </View>
            </View>

            {/* Local */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.label }]}>Local / Endereço</Text>
              <TextInput
                style={[styles.input, { color: colors.inputText, borderColor: colors.inputBorder }]}
                placeholder="Ex: Clínica São Lucas, Sala 302, Em casa"
                placeholderTextColor={colors.inputPlaceholder}
                value={localEvento}
                onChangeText={setLocalEvento}
              />
            </View>

            {/* Observações */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.label }]}>Observações</Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  { color: colors.inputText, borderColor: colors.inputBorder },
                ]}
                placeholder="Ex: Levar exames anteriores e carteira do convênio"
                placeholderTextColor={colors.inputPlaceholder}
                value={observacoes}
                onChangeText={setObservacoes}
                multiline
                numberOfLines={3}
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
                <Text style={styles.submitBtnText}>Salvar Evento</Text>
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
    maxHeight: '90%',
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
  textArea: {
    height: 72,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  categoriesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  catBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  catText: {
    fontSize: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
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

