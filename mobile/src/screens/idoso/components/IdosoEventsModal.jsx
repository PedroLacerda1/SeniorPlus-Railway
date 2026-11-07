import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '../../../contexts/ThemeContext';

export default function IdosoEventsModal({
  visible,
  onClose,
  events = [],
  onToggleStatus,
  fontScale = 1,
}) {
  const { colors } = useTheme();

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
    return <Feather name="calendar" size={18 * fontScale} color="#8b5cf6" />;
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
              <View style={[styles.headerIconCircle, { backgroundColor: '#3b82f622' }]}>
                <Feather name="calendar" size={24 * fontScale} color="#3b82f6" />
              </View>
              <View>
                <Text style={[styles.title, { color: colors.text, fontSize: 20 * fontScale }]}>
                  Minha Agenda de Hoje
                </Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary, fontSize: 13 * fontScale }]}>
                  {events.length === 0
                    ? 'Nenhum compromisso agendado'
                    : `${events.length} compromisso(s) na rotina`}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeBtn, { backgroundColor: colors.background }]}
              accessibilityRole="button"
              accessibilityLabel="Fechar agenda"
            >
              <Feather name="x" size={22} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Events List */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentList}
          >
            {events.length === 0 ? (
              <View style={styles.emptyState}>
                <Feather name="calendar" size={48} color={colors.textSecondary} />
                <Text style={[styles.emptyText, { color: colors.textSecondary, fontSize: 16 * fontScale }]}>
                  Nenhum compromisso marcado para hoje.
                </Text>
              </View>
            ) : (
              events.map((event, index) => {
                const isDone = (event.status || '').toUpperCase() === 'CONCLUIDO';

                return (
                  <View
                    key={event.id || index}
                    style={[
                      styles.eventCard,
                      {
                        backgroundColor: colors.background,
                        borderColor: isDone ? '#10b98166' : colors.cardBorder,
                      },
                    ]}
                  >
                    <View style={styles.cardTopRow}>
                      <View style={styles.eventCategoryRow}>
                        {getCategoryIcon(event.categoria)}
                        <Text style={[styles.categoryText, { color: colors.textSecondary, fontSize: 12 * fontScale }]}>
                          {event.categoria || 'Compromisso'}
                        </Text>
                      </View>

                      <View style={styles.timeTag}>
                        <Feather name="clock" size={14 * fontScale} color={colors.primary} />
                        <Text style={[styles.timeText, { color: colors.text, fontSize: 14 * fontScale }]}>
                          {event.horario || event.dataHora?.substring(11, 16) || '--:--'}
                        </Text>
                      </View>
                    </View>

                    <Text style={[styles.eventTitle, { color: colors.text, fontSize: 17 * fontScale }]}>
                      {event.titulo || event.descricao || 'Compromisso'}
                    </Text>

                    {event.local ? (
                      <View style={styles.locRow}>
                        <Feather name="map-pin" size={14 * fontScale} color="#ef4444" />
                        <Text style={[styles.locText, { color: colors.textSecondary, fontSize: 13 * fontScale }]}>
                          {event.local}
                        </Text>
                      </View>
                    ) : null}

                    {/* Toggle Button */}
                    <TouchableOpacity
                      style={[
                        styles.toggleDoneBtn,
                        {
                          backgroundColor: isDone ? '#10b981' : colors.cardBackground,
                          borderColor: isDone ? '#10b981' : colors.cardBorder,
                        },
                      ]}
                      onPress={() => onToggleStatus(event)}
                      accessibilityRole="button"
                      accessibilityLabel={`Marcar evento como ${isDone ? 'pendente' : 'realizado'}`}
                    >
                      <Feather
                        name={isDone ? 'check-circle' : 'circle'}
                        size={18 * fontScale}
                        color={isDone ? '#ffffff' : colors.text}
                      />
                      <Text
                        style={[
                          styles.toggleDoneText,
                          {
                            color: isDone ? '#ffffff' : colors.text,
                            fontSize: 15 * fontScale,
                          },
                        ]}
                      >
                        {isDone ? 'Compromisso Realizado ✓' : 'Marcar como Feito'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })
            )}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.doneBtn, { backgroundColor: colors.primary }]}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Fechar janela"
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
  eventCard: {
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 16,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventCategoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryText: {
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontWeight: '700',
  },
  eventTitle: {
    fontWeight: '800',
    marginBottom: 8,
  },
  locRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  locText: {
    fontWeight: '500',
  },
  toggleDoneBtn: {
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    marginTop: 4,
  },
  toggleDoneText: {
    fontWeight: '700',
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

