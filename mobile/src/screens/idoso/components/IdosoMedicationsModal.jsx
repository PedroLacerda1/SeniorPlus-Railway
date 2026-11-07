import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../../contexts/ThemeContext';

export default function IdosoMedicationsModal({
  visible,
  onClose,
  medications = [],
  takenSlots = {},
  onToggleTaken,
  fontScale = 1,
}) {
  const { colors } = useTheme();

  // Expande e calcula doses totais e tomadas
  const { totalDoses, takenCount } = React.useMemo(() => {
    let total = 0;
    let taken = 0;
    medications.forEach((med) => {
      const times = Array.isArray(med.horarios)
        ? med.horarios
        : String(med.horarios || med.time || '')
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean);

      times.forEach((time) => {
        total += 1;
        const slotKey = `${med.id || med.nomeMedicamento}-${time}`;
        if (takenSlots[slotKey]) taken += 1;
      });
    });
    return { totalDoses: total, takenCount: taken };
  }, [medications, takenSlots]);

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
              <View style={[styles.headerIconCircle, { backgroundColor: '#10b98122' }]}>
                <MaterialCommunityIcons name="pill" size={24 * fontScale} color="#10b981" />
              </View>
              <View>
                <Text style={[styles.title, { color: colors.text, fontSize: 20 * fontScale }]}>
                  Medicamentos de Hoje
                </Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary, fontSize: 13 * fontScale }]}>
                  {totalDoses === 0
                    ? 'Nenhum medicamento cadastrado'
                    : `${takenCount} de ${totalDoses} doses tomadas`}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeBtn, { backgroundColor: colors.background }]}
              accessibilityRole="button"
              accessibilityLabel="Fechar janela de medicamentos"
            >
              <Feather name="x" size={22} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Progress bar */}
          {totalDoses > 0 ? (
            <View style={styles.progressContainer}>
              <View style={[styles.progressBarBg, { backgroundColor: `${colors.primary}20` }]}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      backgroundColor: '#10b981',
                      width: `${Math.round((takenCount / totalDoses) * 100)}%`,
                    },
                  ]}
                />
              </View>
            </View>
          ) : null}

          {/* Body List */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentList}
          >
            {medications.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="pill-off" size={48} color={colors.textSecondary} />
                <Text style={[styles.emptyText, { color: colors.textSecondary, fontSize: 16 * fontScale }]}>
                  Não há remédios programados para o dia de hoje.
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
                    <View style={styles.medCardHeader}>
                      <Text style={[styles.medName, { color: colors.text, fontSize: 18 * fontScale }]}>
                        {med.nomeMedicamento}
                      </Text>
                      <Text style={[styles.medDosage, { color: colors.primary, fontSize: 14 * fontScale }]}>
                        {med.dosagem || 'Dose padrão'}
                      </Text>
                    </View>

                    {med.instrucoes ? (
                      <Text style={[styles.medInstructions, { color: colors.textSecondary, fontSize: 13 * fontScale }]}>
                        {med.instrucoes}
                      </Text>
                    ) : null}

                    {/* Horários e Botões Táteis */}
                    <View style={styles.slotsRow}>
                      {times.map((time) => {
                        const slotKey = `${med.id || med.nomeMedicamento}-${time}`;
                        const isTaken = !!takenSlots[slotKey];

                        return (
                          <TouchableOpacity
                            key={slotKey}
                            style={[
                              styles.slotButton,
                              {
                                backgroundColor: isTaken ? '#10b981' : colors.cardBackground,
                                borderColor: isTaken ? '#10b981' : colors.cardBorder,
                              },
                            ]}
                            onPress={() => onToggleTaken(slotKey)}
                            accessibilityRole="checkbox"
                            accessibilityState={{ checked: isTaken }}
                            accessibilityLabel={`Horário ${time} para ${med.nomeMedicamento}. ${
                              isTaken ? 'Dose tomada. Toque para desmarcar.' : 'Pendente. Toque para marcar como tomada.'
                            }`}
                          >
                            <Feather
                              name={isTaken ? 'check' : 'clock'}
                              size={18 * fontScale}
                              color={isTaken ? '#ffffff' : colors.text}
                            />
                            <Text
                              style={[
                                styles.slotTimeText,
                                {
                                  color: isTaken ? '#ffffff' : colors.text,
                                  fontSize: 16 * fontScale,
                                },
                              ]}
                            >
                              {time}
                            </Text>
                            <Text
                              style={[
                                styles.slotStatusSub,
                                {
                                  color: isTaken ? '#ffffff' : colors.textSecondary,
                                  fontSize: 11 * fontScale,
                                },
                              ]}
                            >
                              {isTaken ? 'Tomado' : 'Tocar p/ marcar'}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>

          {/* Bottom Confirmation Button */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.doneBtn, { backgroundColor: colors.primary }]}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Concluir e fechar"
            >
              <Text style={[styles.doneBtnText, { fontSize: 17 * fontScale }]}>
                Fechar
              </Text>
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
    maxHeight: '88%',
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
    fontWeight: '800',
  },
  subtitle: {
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
  progressContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  contentList: {
    padding: 20,
    gap: 14,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 14,
  },
  emptyText: {
    textAlign: 'center',
  },
  medCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
  },
  medCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  medName: {
    fontWeight: '800',
    flex: 1,
    marginRight: 8,
  },
  medDosage: {
    fontWeight: '700',
  },
  medInstructions: {
    marginBottom: 12,
    lineHeight: 18,
  },
  slotsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
  },
  slotButton: {
    borderRadius: 14,
    borderWidth: 1.5,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
    minWidth: 90,
  },
  slotTimeText: {
    fontWeight: '800',
    marginVertical: 2,
  },
  slotStatusSub: {
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  doneBtn: {
    minHeight: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doneBtnText: {
    color: '#ffffff',
    fontWeight: '800',
  },
});

