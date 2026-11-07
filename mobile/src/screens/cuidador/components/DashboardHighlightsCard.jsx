import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../../contexts/ThemeContext';

export default function DashboardHighlightsCard({
  totalMeds = 0,
  pendingMeds = 0,
  totalEvents = 0,
  pendingEvents = 0,
  emergencyCount = 0,
}) {
  const { colors, darkMode } = useTheme();

  return (
    <View style={styles.container}>
      {/* Card 1: Medicamentos */}
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
        <View
          style={[
            styles.iconWrapper,
            { backgroundColor: darkMode ? 'rgba(0, 200, 133, 0.15)' : '#e6f8f1' },
          ]}
        >
          <Feather name="clock" size={20} color={colors.primary} />
        </View>
        <View style={styles.textWrapper}>
          <Text style={[styles.label, { color: colors.subtitle }]}>Doses hoje</Text>
          <Text style={[styles.value, { color: colors.text }]}>{totalMeds}</Text>
          <Text style={[styles.subValue, { color: pendingMeds > 0 ? '#f59e0b' : colors.primary }]}>
            {pendingMeds > 0 ? `${pendingMeds} pendentes` : 'Tudo em dia ✓'}
          </Text>
        </View>
      </View>

      {/* Card 2: Eventos */}
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
        <View
          style={[
            styles.iconWrapper,
            { backgroundColor: darkMode ? 'rgba(59, 130, 246, 0.15)' : '#eff6ff' },
          ]}
        >
          <Feather name="calendar" size={20} color="#3b82f6" />
        </View>
        <View style={styles.textWrapper}>
          <Text style={[styles.label, { color: colors.subtitle }]}>Eventos</Text>
          <Text style={[styles.value, { color: colors.text }]}>{totalEvents}</Text>
          <Text style={[styles.subValue, { color: pendingEvents > 0 ? '#3b82f6' : colors.subtitle }]}>
            {pendingEvents > 0 ? `${pendingEvents} pendentes` : 'Concluídos'}
          </Text>
        </View>
      </View>

      {/* Card 3: Emergência */}
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
        <View
          style={[
            styles.iconWrapper,
            { backgroundColor: darkMode ? 'rgba(239, 68, 68, 0.15)' : '#fee2e2' },
          ]}
        >
          <Feather name="alert-triangle" size={20} color="#ef4444" />
        </View>
        <View style={styles.textWrapper}>
          <Text style={[styles.label, { color: colors.subtitle }]}>Socorro</Text>
          <Text style={[styles.value, { color: colors.text }]}>192</Text>
          <Text style={[styles.subValue, { color: '#ef4444' }]}>
            {emergencyCount > 0 ? `${emergencyCount} contatos` : 'SAMU ativo'}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  card: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    alignItems: 'center',
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  textWrapper: {
    alignItems: 'center',
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 2,
  },
  value: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  subValue: {
    fontSize: 10,
    fontWeight: '600',
  },
});

