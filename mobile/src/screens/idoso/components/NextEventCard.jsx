import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '../../../contexts/ThemeContext';

export default function NextEventCard({
  events = [],
  onToggleStatus,
  onOpenAllEvents,
  fontScale = 1,
}) {
  const { colors } = useTheme();

  // Encontra o próximo evento pendente ou o primeiro
  const nextEvent = React.useMemo(() => {
    if (!events || events.length === 0) return null;
    const pending = events.find(
      (e) => (e.status || 'PENDENTE').toUpperCase() === 'PENDENTE',
    );
    return pending || events[0];
  }, [events]);

  const totalEvents = events?.length || 0;
  const isDone = (nextEvent?.status || '').toUpperCase() === 'CONCLUIDO';

  if (totalEvents === 0) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.cardBackground,
            borderColor: colors.cardBorder,
          },
        ]}
      >
        <View style={styles.emptyRow}>
          <View style={[styles.iconCircle, { backgroundColor: '#3b82f620' }]}>
            <Feather name="calendar" size={24 * fontScale} color="#3b82f6" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: colors.text, fontSize: 17 * fontScale }]}>
              Agenda de Hoje
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary, fontSize: 13 * fontScale }]}>
              Nenhum compromisso agendado para hoje. Aproveite para descansar!
            </Text>
          </View>
        </View>
      </View>
    );
  }

  const getCategoryIcon = (categoria = '') => {
    const cat = categoria.toLowerCase();
    if (cat.includes('consulta') || cat.includes('médico') || cat.includes('medico')) {
      return <FontAwesome5 name="user-md" size={18 * fontScale} color="#3b82f6" />;
    }
    if (cat.includes('remédio') || cat.includes('medicamento')) {
      return <FontAwesome5 name="pills" size={18 * fontScale} color="#10b981" />;
    }
    if (cat.includes('atividade') || cat.includes('exercício') || cat.includes('fisioterapia')) {
      return <FontAwesome5 name="walking" size={18 * fontScale} color="#f59e0b" />;
    }
    return <Feather name="calendar" size={20 * fontScale} color="#8b5cf6" />;
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.cardBackground,
          borderColor: isDone ? '#10b98155' : colors.cardBorder,
        },
      ]}
    >
      <View style={styles.headerRow}>
        <View style={styles.titleInfo}>
          <View style={[styles.iconCircle, { backgroundColor: '#3b82f622' }]}>
            {getCategoryIcon(nextEvent?.categoria)}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.sectionTag, { color: '#3b82f6', fontSize: 12 * fontScale }]}>
              PRÓXIMO COMPROMISSO
            </Text>
            <Text style={[styles.title, { color: colors.text, fontSize: 18 * fontScale }]}>
              {nextEvent?.titulo || nextEvent?.descricao || 'Compromisso'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.statusButton,
            {
              backgroundColor: isDone ? '#10b98120' : colors.background,
              borderColor: isDone ? '#10b981' : colors.cardBorder,
            },
          ]}
          onPress={() => onToggleStatus(nextEvent)}
          accessibilityRole="button"
          accessibilityLabel={`Status do evento: ${isDone ? 'Concluído' : 'Pendente'}. Toque para alternar.`}
        >
          <Feather
            name={isDone ? 'check-circle' : 'circle'}
            size={16 * fontScale}
            color={isDone ? '#10b981' : colors.textSecondary}
          />
          <Text
            style={[
              styles.statusButtonText,
              {
                color: isDone ? '#10b981' : colors.text,
                fontSize: 12 * fontScale,
              },
            ]}
          >
            {isDone ? 'Realizado' : 'Marcar feito'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Horário e Localização */}
      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Feather name="clock" size={15 * fontScale} color={colors.primary} />
          <Text style={[styles.metaText, { color: colors.text, fontSize: 14 * fontScale }]}>
            {nextEvent?.horario || nextEvent?.dataHora?.substring(11, 16) || 'Horário a combinar'}
          </Text>
        </View>

        {nextEvent?.local ? (
          <View style={styles.metaItem}>
            <Feather name="map-pin" size={15 * fontScale} color="#ef4444" />
            <Text
              style={[styles.metaText, { color: colors.textSecondary, fontSize: 13 * fontScale }]}
              numberOfLines={1}
            >
              {nextEvent.local}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Rodapé com atalho */}
      <View style={styles.footerRow}>
        <Text style={[styles.footerCount, { color: colors.textSecondary, fontSize: 13 * fontScale }]}>
          {totalEvents === 1 ? '1 compromisso hoje' : `${totalEvents} compromissos agendados hoje`}
        </Text>

        <TouchableOpacity
          style={styles.seeAllBtn}
          onPress={onOpenAllEvents}
          accessibilityRole="button"
          accessibilityLabel="Abrir agenda completa"
        >
          <Text style={[styles.seeAllText, { color: colors.primary, fontSize: 14 * fontScale }]}>
            Ver agenda
          </Text>
          <Feather name="chevron-right" size={16 * fontScale} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  titleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 8,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTag: {
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  title: {
    fontWeight: '700',
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
  },
  statusButtonText: {
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#37415133',
    paddingTop: 10,
  },
  footerCount: {
    fontWeight: '500',
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  seeAllText: {
    fontWeight: '700',
  },
  emptyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  emptySubtitle: {
    marginTop: 4,
  },
});

