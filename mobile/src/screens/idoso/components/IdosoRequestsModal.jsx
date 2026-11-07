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
import { elderlyService } from '../../../services/api';

export default function IdosoRequestsModal({
  visible,
  onClose,
  requests = [],
  onRefreshRequests,
  fontScale = 1,
}) {
  const { colors } = useTheme();
  const [actingId, setActingId] = useState(null);

  const handleRespond = async (id, acao) => {
    const acaoLabel = acao === 'aceitar' ? 'aceitar' : 'recusar';
    Alert.alert(
      `${acao === 'aceitar' ? 'Aceitar' : 'Recusar'} Solicitação`,
      `Tem certeza de que deseja ${acaoLabel} o vínculo com este cuidador?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          style: acao === 'recusar' ? 'destructive' : 'default',
          onPress: async () => {
            setActingId(id);
            try {
              await elderlyService.respondLinkRequest(id, acao);
              Alert.alert(
                'Sucesso',
                acao === 'aceitar'
                  ? 'Cuidador vinculado com sucesso! Agora ele poderá acompanhar sua rotina.'
                  : 'Solicitação recusada.',
              );
              if (onRefreshRequests) onRefreshRequests();
            } catch (err) {
              Alert.alert('Erro', err.friendlyMessage || 'Não foi possível responder à solicitação.');
            } finally {
              setActingId(null);
            }
          },
        },
      ],
    );
  };

  const pendingRequests = requests.filter(
    (r) => (r.status || '').toUpperCase() === 'PENDING' || (r.status || '').toUpperCase() === 'PENDENTE',
  );

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
              <View style={[styles.headerIconCircle, { backgroundColor: '#f59e0b22' }]}>
                <FontAwesome5 name="user-check" size={22 * fontScale} color="#f59e0b" />
              </View>
              <View>
                <Text style={[styles.title, { color: colors.text, fontSize: 19 * fontScale }]}>
                  Solicitações de Vínculo
                </Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary, fontSize: 13 * fontScale }]}>
                  {pendingRequests.length === 0
                    ? 'Nenhum convite pendente'
                    : `${pendingRequests.length} cuidador(es) aguardando sua resposta`}
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

          {/* Body */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentList}
          >
            {requests.length === 0 ? (
              <View style={styles.emptyState}>
                <Feather name="users" size={48} color={colors.textSecondary} />
                <Text style={[styles.emptyText, { color: colors.textSecondary, fontSize: 15 * fontScale }]}>
                  Nenhum cuidador solicitou vínculo com você recentemente.
                </Text>
              </View>
            ) : (
              requests.map((item, index) => {
                const isPending =
                  (item.status || '').toUpperCase() === 'PENDING' ||
                  (item.status || '').toUpperCase() === 'PENDENTE';
                const isProcessing = actingId === item.id;

                return (
                  <View
                    key={item.id || index}
                    style={[
                      styles.requestCard,
                      {
                        backgroundColor: colors.background,
                        borderColor: isPending ? '#f59e0b66' : colors.cardBorder,
                      },
                    ]}
                  >
                    <View style={styles.requestTop}>
                      <View style={[styles.cuidadorAvatar, { backgroundColor: colors.primary }]}>
                        <Text style={styles.avatarLetter}>
                          {(item.cuidadorNome || 'C')[0].toUpperCase()}
                        </Text>
                      </View>

                      <View style={{ flex: 1 }}>
                        <Text style={[styles.cuidadorName, { color: colors.text, fontSize: 17 * fontScale }]}>
                          {item.cuidadorNome || 'Cuidador Solicitante'}
                        </Text>
                        <Text style={[styles.cuidadorRole, { color: colors.textSecondary, fontSize: 12 * fontScale }]}>
                          CPF: {item.cuidadorCpf ? `${item.cuidadorCpf.substring(0, 3)}.***.***-${item.cuidadorCpf.substring(9)}` : '--'}
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.statusBadge,
                          {
                            backgroundColor: isPending
                              ? '#f59e0b20'
                              : (item.status || '').toUpperCase() === 'ACCEPTED'
                              ? '#10b98120'
                              : '#ef444420',
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusBadgeText,
                            {
                              color: isPending
                                ? '#f59e0b'
                                : (item.status || '').toUpperCase() === 'ACCEPTED'
                                ? '#10b981'
                                : '#ef4444',
                              fontSize: 11 * fontScale,
                            },
                          ]}
                        >
                          {isPending
                            ? 'Pendente'
                            : (item.status || '').toUpperCase() === 'ACCEPTED'
                            ? 'Aceito'
                            : 'Recusado'}
                        </Text>
                      </View>
                    </View>

                    {item.mensagem ? (
                      <View style={[styles.msgBox, { backgroundColor: colors.cardBackground }]}>
                        <Text style={[styles.msgText, { color: colors.text, fontSize: 13 * fontScale }]}>
                          &quot;{item.mensagem}&quot;
                        </Text>
                      </View>
                    ) : null}

                    {/* Actions if pending */}
                    {isPending ? (
                      <View style={styles.actionsRow}>
                        <TouchableOpacity
                          style={[styles.btn, styles.declineBtn]}
                          onPress={() => handleRespond(item.id, 'recusar')}
                          disabled={isProcessing}
                          accessibilityRole="button"
                          accessibilityLabel="Recusar cuidador"
                        >
                          <Feather name="x" size={16 * fontScale} color="#ef4444" />
                          <Text style={[styles.declineBtnText, { fontSize: 14 * fontScale }]}>
                            Recusar
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.btn, styles.acceptBtn]}
                          onPress={() => handleRespond(item.id, 'aceitar')}
                          disabled={isProcessing}
                          accessibilityRole="button"
                          accessibilityLabel="Aceitar cuidador"
                        >
                          {isProcessing ? (
                            <ActivityIndicator size="small" color="#ffffff" />
                          ) : (
                            <>
                              <Feather name="check" size={16 * fontScale} color="#ffffff" />
                              <Text style={[styles.acceptBtnText, { fontSize: 14 * fontScale }]}>
                                Aceitar Cuidador
                              </Text>
                            </>
                          )}
                        </TouchableOpacity>
                      </View>
                    ) : null}
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
  requestCard: {
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 16,
  },
  requestTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  cuidadorAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLetter: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 16,
  },
  cuidadorName: {
    fontWeight: '800',
  },
  cuidadorRole: {
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontWeight: '700',
  },
  msgBox: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  msgText: {
    fontStyle: 'italic',
    lineHeight: 18,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  btn: {
    flex: 1,
    minHeight: 48,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  declineBtn: {
    borderWidth: 1.5,
    borderColor: '#ef4444',
  },
  declineBtnText: {
    color: '#ef4444',
    fontWeight: '700',
  },
  acceptBtn: {
    backgroundColor: '#10b981',
  },
  acceptBtnText: {
    color: '#ffffff',
    fontWeight: '800',
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

