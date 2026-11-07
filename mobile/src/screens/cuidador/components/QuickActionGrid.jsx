import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../../contexts/ThemeContext';

export default function QuickActionGrid({ onActionPress }) {
  const { colors, darkMode } = useTheme();

  const actions = [
    {
      id: 'emergencia',
      title: 'Emergência',
      subtitle: 'SAMU 192 e contatos',
      icon: 'alert-triangle',
      color: '#ef4444',
      isEmergency: true,
    },
    {
      id: 'medicamentos',
      title: 'Medicamentos',
      subtitle: 'Prescrições e horários',
      icon: 'activity',
      color: colors.primary,
    },
    {
      id: 'agenda',
      title: 'Agenda',
      subtitle: 'Consultas e atividades',
      icon: 'calendar',
      color: '#3b82f6',
    },
    {
      id: 'novo-evento',
      title: 'Novo Evento',
      subtitle: 'Registrar compromisso',
      icon: 'plus-circle',
      color: '#10b981',
    },
    {
      id: 'atualizar-idoso',
      title: 'Dados do Idoso',
      subtitle: 'Saúde, IMC e alergias',
      icon: 'user-check',
      color: '#8b5cf6',
    },
    {
      id: 'configuracoes',
      title: 'Configurações',
      subtitle: 'Perfil e preferências',
      icon: 'settings',
      color: colors.subtitle,
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Acesso Rápido</Text>
      <View style={styles.grid}>
        {actions.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.tile,
              {
                backgroundColor: item.isEmergency
                  ? darkMode
                    ? 'rgba(239, 68, 68, 0.12)'
                    : '#fee2e2'
                  : colors.cardBackground,
                borderColor: item.isEmergency
                  ? darkMode
                    ? 'rgba(239, 68, 68, 0.35)'
                    : '#fca5a5'
                  : colors.cardBorder,
                shadowColor: colors.cardShadow,
              },
            ]}
            onPress={() => onActionPress && onActionPress(item.id)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.iconBox,
                {
                  backgroundColor: item.isEmergency
                    ? '#ef4444'
                    : darkMode
                    ? `${item.color}25`
                    : `${item.color}15`,
                },
              ]}
            >
              <Feather
                name={item.icon}
                size={18}
                color={item.isEmergency ? '#ffffff' : item.color}
              />
            </View>

            <View style={styles.tileText}>
              <Text
                style={[
                  styles.tileTitle,
                  { color: item.isEmergency ? '#ef4444' : colors.text },
                ]}
              >
                {item.title}
              </Text>
              <Text
                numberOfLines={1}
                style={[
                  styles.tileSubtitle,
                  { color: item.isEmergency ? '#b91c1c' : colors.subtitle },
                ]}
              >
                {item.subtitle}
              </Text>
            </View>

            <Feather
              name="chevron-right"
              size={14}
              color={item.isEmergency ? '#ef4444' : colors.subtitle}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tile: {
    width: '48.5%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    gap: 8,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileText: {
    flex: 1,
  },
  tileTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  tileSubtitle: {
    fontSize: 10,
  },
});

