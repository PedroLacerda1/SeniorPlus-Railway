import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../../contexts/ThemeContext';

export default function TodayMedicationsCard({
  medications = [],
  onTakeDose,
  onViewAll,
  onAddMedication,
}) {
  const { colors, darkMode } = useTheme();
  // Estado local para persistir doses tomadas na sessão
  const [takenDoses, setTakenDoses] = useState({});

  const handleToggleDose = (medId, time) => {
    const key = `${medId}_${time}`;
    const nextState = !takenDoses[key];
    setTakenDoses((prev) => ({ ...prev, [key]: nextState }));
    if (onTakeDose) {
      onTakeDose(medId, time, nextState);
    }
  };

  // Agrupar remédios por horário
  const grouped = {};
  medications.forEach((med) => {
    const rawTimes = Array.isArray(med.horarios)
      ? med.horarios
      : String(med.horarios || med.time || '08:00')
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean);

    rawTimes.forEach((time) => {
      if (!grouped[time]) grouped[time] = [];
      grouped[time].push(med);
    });
  });

  const sortedTimes = Object.keys(grouped).sort();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.cardBackground,
          borderColor: colors.cardBorder,
          shadowColor: colors.cardShadow,
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Feather name="activity" size={18} color={colors.primary} />
          <Text style={[styles.title, { color: colors.text }]}>Medicamentos de Hoje</Text>
        </View>

        <View style={styles.actionsRow}>
          {onAddMedication ? (
            <TouchableOpacity
              onPress={onAddMedication}
              style={[styles.smallAddBtn, { backgroundColor: colors.roleActiveBg, borderColor: colors.primary }]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Feather name="plus" size={14} color={colors.primary} />
            </TouchableOpacity>
          ) : null}
          {onViewAll ? (
            <TouchableOpacity onPress={onViewAll} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={[styles.viewAllText, { color: colors.primary }]}>Ver todos</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Content */}
      {sortedTimes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather name="check-circle" size={24} color={colors.primary} />
          <Text style={[styles.emptyText, { color: colors.subtitle }]}>
            Nenhum medicamento pendente para hoje.
          </Text>
        </View>
      ) : (
        <View style={styles.timesList}>
          {sortedTimes.map((time) => (
            <View key={time} style={styles.timeGroup}>
              <View style={[styles.timeBadge, { backgroundColor: colors.roleInactiveBg, borderColor: colors.cardBorder }]}>
                <Feather name="clock" size={12} color={colors.primary} />
                <Text style={[styles.timeText, { color: colors.primary }]}>{time}</Text>
              </View>

              <View style={styles.itemsColumn}>
                {grouped[time].map((med) => {
                  const key = `${med.id}_${time}`;
                  const isTaken = Boolean(takenDoses[key]);

                  return (
                    <View
                      key={key}
                      style={[
                        styles.medItem,
                        {
                          backgroundColor: isTaken
                            ? darkMode
                              ? 'rgba(0, 200, 133, 0.08)'
                              : '#f0fdf4'
                            : colors.inputBackground,
                          borderColor: isTaken ? colors.primary : colors.cardBorder,
                        },
                      ]}
                    >
                      <View style={styles.medDetails}>
                        <Text
                          style={[
                            styles.medName,
                            { color: colors.text },
                            isTaken && styles.medTakenName,
                          ]}
                        >
                          {med.nomeMedicamento || med.name}
                        </Text>
                        <Text style={[styles.medDosage, { color: colors.subtitle }]}>
                          {med.dosagem || med.dosage || 'Dosagem padrão'}
                          {med.instrucoes ? ` • ${med.instrucoes}` : ''}
                        </Text>
                      </View>

                      <TouchableOpacity
                        style={[
                          styles.checkButton,
                          {
                            backgroundColor: isTaken ? colors.primary : 'transparent',
                            borderColor: isTaken ? colors.primary : colors.checkboxBorder,
                          },
                        ]}
                        onPress={() => handleToggleDose(med.id, time)}
                        activeOpacity={0.7}
                        accessibilityLabel={isTaken ? 'Dose tomada' : 'Marcar dose como tomada'}
                      >
                        <Feather
                          name="check"
                          size={14}
                          color={isTaken ? '#ffffff' : colors.checkboxBorder}
                        />
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    elevation: 3,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  smallAddBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
  },
  emptyContainer: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
  },
  timesList: {
    gap: 12,
  },
  timeGroup: {
    gap: 8,
  },
  timeBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  itemsColumn: {
    gap: 8,
  },
  medItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  medDetails: {
    flex: 1,
    marginRight: 10,
  },
  medName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  medTakenName: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  medDosage: {
    fontSize: 12,
  },
  checkButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

