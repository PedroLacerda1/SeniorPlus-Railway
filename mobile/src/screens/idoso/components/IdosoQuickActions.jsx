import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Feather, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '../../../contexts/ThemeContext';

export default function IdosoQuickActions({
  pendingRequestsCount = 0,
  onOpenMedications,
  onOpenEvents,
  onOpenRequests,
  onOpenProfile,
  onOpenEmergency,
  fontScale = 1,
}) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.text, fontSize: 18 * fontScale }]}>
        Ações Rápidas
      </Text>

      {/* Main Grid: 2 columns with generous touch targets */}
      <View style={styles.grid}>
        {/* Remédios */}
        <TouchableOpacity
          style={[
            styles.actionCard,
            {
              backgroundColor: colors.cardBackground,
              borderColor: colors.cardBorder,
            },
          ]}
          onPress={onOpenMedications}
          accessibilityRole="button"
          accessibilityLabel="Abrir remédios de hoje"
        >
          <View style={[styles.iconWrap, { backgroundColor: '#10b98122' }]}>
            <MaterialCommunityIcons name="pill" size={26 * fontScale} color="#10b981" />
          </View>
          <Text style={[styles.actionLabel, { color: colors.text, fontSize: 16 * fontScale }]}>
            Remédios
          </Text>
          <Text style={[styles.actionSub, { color: colors.textSecondary, fontSize: 12 * fontScale }]}>
            Ver horários do dia
          </Text>
        </TouchableOpacity>

        {/* Agenda */}
        <TouchableOpacity
          style={[
            styles.actionCard,
            {
              backgroundColor: colors.cardBackground,
              borderColor: colors.cardBorder,
            },
          ]}
          onPress={onOpenEvents}
          accessibilityRole="button"
          accessibilityLabel="Abrir agenda de compromissos"
        >
          <View style={[styles.iconWrap, { backgroundColor: '#3b82f622' }]}>
            <Feather name="calendar" size={24 * fontScale} color="#3b82f6" />
          </View>
          <Text style={[styles.actionLabel, { color: colors.text, fontSize: 16 * fontScale }]}>
            Minha Agenda
          </Text>
          <Text style={[styles.actionSub, { color: colors.textSecondary, fontSize: 12 * fontScale }]}>
            Compromissos
          </Text>
        </TouchableOpacity>

        {/* Solicitações de Cuidadores */}
        <TouchableOpacity
          style={[
            styles.actionCard,
            {
              backgroundColor: colors.cardBackground,
              borderColor: pendingRequestsCount > 0 ? '#f59e0b' : colors.cardBorder,
            },
          ]}
          onPress={onOpenRequests}
          accessibilityRole="button"
          accessibilityLabel={`Solicitações de cuidadores. ${pendingRequestsCount} pendentes.`}
        >
          <View style={[styles.iconWrap, { backgroundColor: '#f59e0b22' }]}>
            <FontAwesome5 name="user-check" size={22 * fontScale} color="#f59e0b" />
            {pendingRequestsCount > 0 ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{pendingRequestsCount}</Text>
              </View>
            ) : null}
          </View>
          <Text style={[styles.actionLabel, { color: colors.text, fontSize: 16 * fontScale }]}>
            Solicitações
          </Text>
          <Text style={[styles.actionSub, { color: colors.textSecondary, fontSize: 12 * fontScale }]}>
            {pendingRequestsCount > 0 ? `${pendingRequestsCount} convite(s)` : 'Novos cuidadores'}
          </Text>
        </TouchableOpacity>

        {/* Meus Dados e Cuidadores */}
        <TouchableOpacity
          style={[
            styles.actionCard,
            {
              backgroundColor: colors.cardBackground,
              borderColor: colors.cardBorder,
            },
          ]}
          onPress={onOpenProfile}
          accessibilityRole="button"
          accessibilityLabel="Ver dados de saúde e cuidadores vinculados"
        >
          <View style={[styles.iconWrap, { backgroundColor: '#8b5cf622' }]}>
            <FontAwesome5 name="heartbeat" size={22 * fontScale} color="#8b5cf6" />
          </View>
          <Text style={[styles.actionLabel, { color: colors.text, fontSize: 16 * fontScale }]}>
            Meus Cuidados
          </Text>
          <Text style={[styles.actionSub, { color: colors.textSecondary, fontSize: 12 * fontScale }]}>
            Dados e cuidadores
          </Text>
        </TouchableOpacity>
      </View>

      {/* Destaque Gigante: Botão de Emergência SOS */}
      <TouchableOpacity
        style={styles.emergencyCard}
        onPress={onOpenEmergency}
        accessibilityRole="button"
        accessibilityLabel="Chamar emergência agora. Abre opções para SAMU 192 e contatos."
      >
        <View style={styles.emergencyIconCircle}>
          <MaterialCommunityIcons name="alarm-light" size={32 * fontScale} color="#ffffff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.emergencyTitle, { fontSize: 20 * fontScale }]}>
            EMERGÊNCIA SOS
          </Text>
          <Text style={[styles.emergencySubtitle, { fontSize: 14 * fontScale }]}>
            Ligar para o SAMU 192 ou pedir ajuda ao cuidador
          </Text>
        </View>
        <Feather name="phone-call" size={24 * fontScale} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontWeight: '800',
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 14,
  },
  actionCard: {
    width: '48%',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    minHeight: 110,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#ef4444',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
  actionLabel: {
    fontWeight: '700',
    marginBottom: 2,
  },
  actionSub: {
    fontWeight: '500',
  },
  emergencyCard: {
    backgroundColor: '#dc2626',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    minHeight: 74,
    shadowColor: '#dc2626',
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 4,
  },
  emergencyIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emergencyTitle: {
    color: '#ffffff',
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  emergencySubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
  },
});

