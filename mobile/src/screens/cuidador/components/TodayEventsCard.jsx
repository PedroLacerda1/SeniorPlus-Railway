import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../../contexts/ThemeContext';

const getCategoryColor = (categoria) => {
  switch (String(categoria || '').toLowerCase()) {
    case 'consulta':
    case 'médico':
      return '#3b82f6';
    case 'atividade':
    case 'exercício':
      return '#00c885';
    case 'social':
      return '#a855f7';
    case 'medicação':
      return '#f59e0b';
    default:
      return '#64748b';
  }
};

const getCategoryIcon = (categoria) => {
  switch (String(categoria || '').toLowerCase()) {
    case 'consulta':
    case 'médico':
      return 'user-check';
    case 'atividade':
    case 'exercício':
      return 'trending-up';
    case 'social':
      return 'users';
    case 'medicação':
      return 'activity';
    default:
      return 'calendar';
  }
};

export default function TodayEventsCard({
  events = [],
  onToggleStatus,
  onAddEvent,
  onViewAll,
}) {
  const { colors, darkMode } = useTheme();

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
          <Feather name="calendar" size={18} color="#3b82f6" />
          <Text style={[styles.title, { color: colors.text }]}>Eventos de Hoje</Text>
        </View>

        <View style={styles.actionsRow}>
          {onAddEvent ? (
            <TouchableOpacity
              onPress={onAddEvent}
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

      {/* Events List */}
      {events.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather name="calendar" size={24} color={colors.subtitle} />
          <Text style={[styles.emptyText, { color: colors.subtitle }]}>
            Nenhum evento agendado para hoje.
          </Text>
        </View>
      ) : (
        <View style={styles.eventsList}>
          {events.map((event) => {
            const isCompleted =
              event.status === 'CONCLUIDO' ||
              event.status === 'Concluído' ||
              event.status === 'COMPLETED';
            const catColor = getCategoryColor(event.categoria);
            const catIcon = getCategoryIcon(event.categoria);

            return (
              <View
                key={event.id || `${event.titulo}_${event.horaInicio}`}
                style={[
                  styles.eventItem,
                  {
                    backgroundColor: isCompleted
                      ? darkMode
                        ? 'rgba(0, 200, 133, 0.08)'
                        : '#f0fdf4'
                      : colors.inputBackground,
                    borderColor: isCompleted ? colors.primary : colors.cardBorder,
                  },
                ]}
              >
                <View style={[styles.categoryIcon, { backgroundColor: `${catColor}20` }]}>
                  <Feather name={catIcon} size={16} color={catColor} />
                </View>

                <View style={styles.eventInfo}>
                  <Text
                    style={[
                      styles.eventTitle,
                      { color: colors.text },
                      isCompleted && styles.completedTitle,
                    ]}
                  >
                    {event.titulo}
                  </Text>
                  <View style={styles.metaRow}>
                    <Feather name="clock" size={11} color={colors.subtitle} />
                    <Text style={[styles.metaText, { color: colors.subtitle }]}>
                      {event.horaInicio || 'Horário livre'}
                      {event.horaFim ? ` - ${event.horaFim}` : ''}
                      {event.localEvento ? ` • ${event.localEvento}` : ''}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor: isCompleted ? colors.primary : colors.roleInactiveBg,
                      borderColor: isCompleted ? colors.primary : colors.cardBorder,
                    },
                  ]}
                  onPress={() => onToggleStatus && onToggleStatus(event.id, !isCompleted)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: isCompleted ? '#ffffff' : colors.subtitle },
                    ]}
                  >
                    {isCompleted ? 'Concluído ✓' : 'Pendente'}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
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
  eventsList: {
    gap: 10,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
});

