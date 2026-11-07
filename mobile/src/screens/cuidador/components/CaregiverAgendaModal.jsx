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
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '../../../contexts/ThemeContext';
import { eventService } from '../../../services/api';

const CATEGORIES = ['Todos', 'Consulta', 'Medicação', 'Atividade', 'Social'];

export default function CaregiverAgendaModal({
  visible,
  onClose,
  events = [],
  onRefresh,
  onOpenAddEvent,
}) {
  const { colors } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [deletingId, setDeletingId] = useState(null);

  const filteredEvents = React.useMemo(() => {
    if (selectedCategory === 'Todos') return events;
    return events.filter(
      (e) => (e.categoria || '').toLowerCase() === selectedCategory.toLowerCase(),
    );
  }, [events, selectedCategory]);

  const handleToggleStatus = async (event) => {
    const current = (event.status || 'PENDENTE').toUpperCase();
    const nextStatus = current === 'CONCLUIDO' ? 'PENDENTE' : 'CONCLUIDO';
    try {
      await eventService.updateStatus(event.id, nextStatus);
      if (onRefresh) onRefresh();
    } catch (err) {
      Alert.alert('Erro', err.friendlyMessage || 'Erro ao alterar status do compromisso.');
    }
  };

  const handleDeleteEvent = (event) => {
    Alert.alert(
      'Excluir Compromisso',
      `Deseja realmente remover o compromisso "${event.titulo || event.descricao}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            setDeletingId(event.id);
            try {
              await eventService.remove(event.id);
              Alert.alert('Sucesso', 'Compromisso removido.');
              if (onRefresh) onRefresh();
            } catch (err) {
              Alert.alert('Erro', err.friendlyMessage || 'Erro ao excluir compromisso.');
            } finally {
              setDeletingId(null);
            }
          },
        },
      ],
    );
  };

  const getCategoryIcon = (categoria = '') => {
    const cat = categoria.toLowerCase();
    if (cat.includes('consulta') || cat.includes('médico') || cat.includes('medico')) {
      return <FontAwesome5 name="user-md" size={15} color="#3b82f6" />;
    }
    if (cat.includes('remédio') || cat.includes('medicamento')) {
      return <FontAwesome5 name="pills" size={15} color="#10b981" />;
    }
    if (cat.includes('atividade') || cat.includes('exercício') || cat.includes('fisioterapia')) {
      return <FontAwesome5 name="walking" size={15} color="#f59e0b" />;
    }
    return <Feather name="calendar" size={15} color="#8b5cf6" />;
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
                <Feather name="calendar" size={24} color="#3b82f6" />
              </View>
              <View>
                <Text style={[styles.title, { color: colors.text }]}>
                  Agenda de Cuidados
                </Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                  {events.length === 0
                    ? 'Nenhum compromisso agendado'
                    : `${events.length} compromisso(s) registrado(s)`}
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

          {/* Botão Novo Evento */}
          <View style={styles.topActionRow}>
            <TouchableOpacity
              style={[styles.addNewButton, { backgroundColor: '#3b82f6' }]}
              onPress={() => {
                onClose();
                onOpenAddEvent();
              }}
              accessibilityRole="button"
              accessibilityLabel="Registrar novo compromisso"
            >
              <Feather name="plus" size={18} color="#ffffff" />
              <Text style={styles.addNewButtonText}>Agendar Novo Compromisso</Text>
            </TouchableOpacity>
          </View>

          {/* Chips de Categorias */}
          <View style={styles.categoriesContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesList}>
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryChip,
                      {
                        backgroundColor: isSelected ? '#3b82f6' : colors.background,
                        borderColor: isSelected ? '#3b82f6' : colors.cardBorder,
                      },
                    ]}
                    onPress={() => setSelectedCategory(cat)}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        { color: isSelected ? '#ffffff' : colors.text },
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Lista de Eventos */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentList}
          >
            {filteredEvents.length === 0 ? (
              <View style={styles.emptyState}>
                <Feather name="calendar" size={48} color={colors.textSecondary} />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                  Nenhum compromisso nesta categoria
                </Text>
                <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                  Toque em &quot;Agendar Novo Compromisso&quot; para registrar consultas, exames ou atividades.
                </Text>
              </View>
            ) : (
              filteredEvents.map((event, index) => {
                const isDone = (event.status || '').toUpperCase() === 'CONCLUIDO';
                const isDeleting = deletingId === event.id;

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
                    <View style={styles.cardHeader}>
                      <View style={styles.catRow}>
                        {getCategoryIcon(event.categoria)}
                        <Text style={[styles.catName, { color: colors.textSecondary }]}>
                          {event.categoria || 'Geral'}
                        </Text>
                      </View>

                      <View style={styles.headerActions}>
                        {/* Status Toggle */}
                        <TouchableOpacity
                          style={[
                            styles.statusBtn,
                            {
                              backgroundColor: isDone ? '#10b98120' : colors.cardBackground,
                              borderColor: isDone ? '#10b981' : colors.cardBorder,
                            },
                          ]}
                          onPress={() => handleToggleStatus(event)}
                          accessibilityRole="button"
                          accessibilityLabel={`Marcar como ${isDone ? 'pendente' : 'concluído'}`}
                        >
                          <Feather
                            name={isDone ? 'check-circle' : 'circle'}
                            size={14}
                            color={isDone ? '#10b981' : colors.textSecondary}
                          />
                          <Text
                            style={[
                              styles.statusText,
                              { color: isDone ? '#10b981' : colors.text },
                            ]}
                          >
                            {isDone ? 'Concluído' : 'Pendente'}
                          </Text>
                        </TouchableOpacity>

                        {/* Delete button */}
                        <TouchableOpacity
                          style={styles.deleteBtn}
                          onPress={() => handleDeleteEvent(event)}
                          disabled={isDeleting}
                          accessibilityRole="button"
                          accessibilityLabel="Excluir compromisso"
                        >
                          {isDeleting ? (
                            <ActivityIndicator size="small" color="#ef4444" />
                          ) : (
                            <Feather name="trash-2" size={16} color="#ef4444" />
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>

                    <Text style={[styles.eventTitle, { color: colors.text }]}>
                      {event.titulo || event.descricao || 'Compromisso'}
                    </Text>

                    {/* Metadados: Data/Hora e Local */}
                    <View style={styles.metaRow}>
                      <View style={styles.metaItem}>
                        <Feather name="clock" size={13} color={colors.primary} />
                        <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                          {event.horario || event.dataHora?.substring(11, 16) || 'Horário definido'}
                        </Text>
                      </View>

                      {event.local ? (
                        <View style={styles.metaItem}>
                          <Feather name="map-pin" size={13} color="#ef4444" />
                          <Text style={[styles.metaText, { color: colors.textSecondary }]} numberOfLines={1}>
                            {event.local}
                          </Text>
                        </View>
                      ) : null}
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
              accessibilityLabel="Fechar agenda"
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
    paddingBottom: 8,
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
  categoriesContainer: {
    paddingVertical: 8,
  },
  categoriesList: {
    paddingHorizontal: 20,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  contentList: {
    padding: 20,
    gap: 12,
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
  eventCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  catName: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ef444415',
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '500',
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

