import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../../contexts/ThemeContext';
import { medicationService } from '../../../services/api';

export default function ManageMedicationsModal({
  visible,
  onClose,
  medications = [],
  onRefresh,
  onOpenAddMedication,
}) {
  const { colors } = useTheme();
  const [deletingId, setDeletingId] = useState(null);

  const handleDeleteMedication = (med) => {
    Alert.alert(
      'Excluir Medicamento',
      `Deseja realmente remover "${med.nomeMedicamento}" da rotina do idoso?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            setDeletingId(med.id);
            try {
              await medicationService.remove(med.id);
              Alert.alert('Sucesso', 'Medicamento removido.');
              if (onRefresh) onRefresh();
            } catch (err) {
              Alert.alert('Erro', err.friendlyMessage || 'Não foi possível excluir o medicamento.');
            } finally {
              setDeletingId(null);
            }
          },
        },
      ],
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
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
            <View style={styles.headerTitleRow}>
              <View style={[styles.headerIconCircle, { backgroundColor: `${colors.primary}22` }]}>
                <MaterialCommunityIcons name="pill" size={24} color={colors.primary} />
              </View>
              <View>
                <Text style={[styles.title, { color: colors.text }]}>
                  Medicamentos Prescritos
                </Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                  {medications.length === 0
                    ? 'Nenhum medicamento ativo'
                    : `${medications.length} medicamento(s) cadastrado(s)`}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeBtn, { backgroundColor: colors.background }]}
              accessibilityRole="button"
              accessibilityLabel="Fechar janela"
            >
              <Feather name="x" size={22} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Botão de Adicionar Medicamento */}
          <View style={styles.topActionRow}>
            <TouchableOpacity
              style={[styles.addNewButton, { backgroundColor: colors.primary }]}
              onPress={() => {
                onClose();
                onOpenAddMedication();
              }}
              accessibilityRole="button"
              accessibilityLabel="Cadastrar nova medicação"
            >
              <Feather name="plus" size={18} color="#ffffff" />
              <Text style={styles.addNewButtonText}>Prescrever Novo Medicamento</Text>
            </TouchableOpacity>
          </View>

          {/* Lista de Medicamentos */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentList}
          >
            {medications.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="pill-off" size={48} color={colors.textSecondary} />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                  Nenhum medicamento cadastrado
                </Text>
                <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                  Toque no botão acima para adicionar a primeira prescrição com horários e dosagem.
                </Text>
              </View>
            ) : (
              medications.map((med, index) => {
                const times = Array.isArray(med.horarios)
                  ? med.horarios
                  : String(med.horarios || med.time || '')
                      .split(',')
                      .map((t) => t.trim())
                      .filter(Boolean);

                const isDeleting = deletingId === med.id;

                return (
                  <View
                    key={med.id || index}
                    style={[
                      styles.medCard,
                      {
                        backgroundColor: colors.background,
                        borderColor: colors.cardBorder,
                      },
                    ]}
                  >
                    <View style={styles.cardHeader}>
                      <View style={{ flex: 1, marginRight: 8 }}>
                        <Text style={[styles.medName, { color: colors.text }]}>
                          {med.nomeMedicamento}
                        </Text>
                        <Text style={[styles.medDosage, { color: colors.primary }]}>
                          {med.dosagem || 'Dosagem padrão'}
                        </Text>
                      </View>

                      {/* Botão Excluir */}
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDeleteMedication(med)}
                        disabled={isDeleting}
                        accessibilityRole="button"
                        accessibilityLabel={`Excluir medicamento ${med.nomeMedicamento}`}
                      >
                        {isDeleting ? (
                          <ActivityIndicator size="small" color="#ef4444" />
                        ) : (
                          <Feather name="trash-2" size={18} color="#ef4444" />
                        )}
                      </TouchableOpacity>
                    </View>

                    {/* Frequência */}
                    {med.frequencia || med.frequency ? (
                      <View style={styles.infoRow}>
                        <Feather name="repeat" size={14} color={colors.textSecondary} />
                        <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                          Frequência: {med.frequencia || med.frequency}
                        </Text>
                      </View>
                    ) : null}

                    {/* Instruções */}
                    {med.instrucoes ? (
                      <View style={styles.infoRow}>
                        <Feather name="info" size={14} color={colors.textSecondary} />
                        <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                          {med.instrucoes}
                        </Text>
                      </View>
                    ) : null}

                    {/* Badges de Horários */}
                    <View style={styles.timesSection}>
                      <Text style={[styles.timesLabel, { color: colors.textSecondary }]}>
                        Horários de administração:
                      </Text>
                      <View style={styles.timesWrap}>
                        {times.map((t, idx) => (
                          <View
                            key={idx}
                            style={[
                              styles.timeBadge,
                              {
                                backgroundColor: `${colors.primary}20`,
                                borderColor: `${colors.primary}55`,
                              },
                            ]}
                          >
                            <Feather name="clock" size={12} color={colors.primary} />
                            <Text style={[styles.timeBadgeText, { color: colors.primary }]}>
                              {t}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.doneBtn, { backgroundColor: colors.background, borderColor: colors.cardBorder }]}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Fechar modal"
            >
              <Text style={[styles.doneBtnText, { color: colors.text }]}>Fechar</Text>
            </TouchableOpacity>
          </View>
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
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
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
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topActionRow: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 4,
  },
  addNewButton: {
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  addNewButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  contentList: {
    padding: 20,
    gap: 14,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 18,
  },
  medCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  medName: {
    fontSize: 17,
    fontWeight: '800',
  },
  medDosage: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ef444415',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  infoText: {
    fontSize: 13,
    flex: 1,
  },
  timesSection: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#37415133',
  },
  timesLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  timesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  timeBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  doneBtn: {
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doneBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
});

