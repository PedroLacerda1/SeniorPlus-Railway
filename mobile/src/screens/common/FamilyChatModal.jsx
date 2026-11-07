import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { messageService } from '../../services/api';

const ELDERLY_QUICK_REPLIES = [
  '👍 Tudo bem por aqui!',
  '💊 Já tomei os remédios',
  '💧 Estou bebendo água',
  '❤️ Obrigado pelo carinho!',
];

const CAREGIVER_QUICK_REPLIES = [
  'Lembre-se de tomar água hoje! 💧',
  'Como você está se sentindo agora?',
  'Não se esqueça do remédio das horas certas 💊',
  'Passo na sua casa mais tarde! ❤️',
];

export default function FamilyChatModal({
  visible,
  onClose,
  idosoCpf,
  currentUserName = 'Usuário',
  isCaregiver = false,
  fontScale = 1,
}) {
  const { colors } = useTheme();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  const fetchMessages = useCallback(async () => {
    if (!idosoCpf) return;
    try {
      const data = await messageService.listForElderly(idosoCpf);
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Erro ao carregar mensagens:', err.message);
    }
  }, [idosoCpf]);

  useEffect(() => {
    if (visible && idosoCpf) {
      let active = true;
      (async () => {
        try {
          const data = await messageService.listForElderly(idosoCpf);
          if (active) setMessages(Array.isArray(data) ? data : []);
        } catch (_e) {}
      })();
      return () => {
        active = false;
      };
    }
  }, [visible, idosoCpf]);

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputText).trim();
    if (!text || !idosoCpf) return;

    setSending(true);
    try {
      const payload = {
        conteudo: text,
        remetente: currentUserName,
        destinatario: isCaregiver ? 'Idoso' : 'Cuidador',
        idosoCpf: String(idosoCpf).replace(/\D/g, ''),
        lida: false,
      };

      await messageService.send(idosoCpf, payload);
      setInputText('');
      await fetchMessages();
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
    } finally {
      setSending(false);
    }
  };

  const quickReplies = isCaregiver ? CAREGIVER_QUICK_REPLIES : ELDERLY_QUICK_REPLIES;

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
              <View style={[styles.headerIconCircle, { backgroundColor: `${colors.primary}22` }]}>
                <Feather name="message-circle" size={24 * fontScale} color={colors.primary} />
              </View>
              <View>
                <Text style={[styles.title, { color: colors.text, fontSize: 19 * fontScale }]}>
                  Mural da Família
                </Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary, fontSize: 13 * fontScale }]}>
                  Recados e mensagens de carinho
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeBtn, { backgroundColor: colors.background }]}
              accessibilityRole="button"
              accessibilityLabel="Fechar mensagens"
            >
              <Feather name="x" size={22} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Quick Replies Bar */}
          <View style={styles.quickRepliesContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickRepliesList}>
              {quickReplies.map((reply, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[styles.quickReplyChip, { backgroundColor: colors.background, borderColor: colors.cardBorder }]}
                  onPress={() => handleSendMessage(reply)}
                  disabled={sending}
                  accessibilityRole="button"
                  accessibilityLabel={`Enviar resposta rápida: ${reply}`}
                >
                  <Text style={[styles.quickReplyText, { color: colors.text, fontSize: 13 * fontScale }]}>
                    {reply}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Lista de Mensagens */}
          <ScrollView
            ref={scrollRef}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentList}
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
          >
            {loading ? (
              <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 30 }} />
            ) : messages.length === 0 ? (
              <View style={styles.emptyState}>
                <Feather name="message-square" size={44} color={colors.textSecondary} />
                <Text style={[styles.emptyTitle, { color: colors.text, fontSize: 16 * fontScale }]}>
                  Nenhuma mensagem ainda
                </Text>
                <Text style={[styles.emptySubtitle, { color: colors.textSecondary, fontSize: 13 * fontScale }]}>
                  Deixe uma mensagem de carinho ou toque em uma das frases rápidas acima.
                </Text>
              </View>
            ) : (
              messages.map((msg, index) => {
                const isMe =
                  msg.remetente === currentUserName ||
                  (isCaregiver && msg.remetente?.toLowerCase().includes('cuidador')) ||
                  (!isCaregiver && !msg.remetente?.toLowerCase().includes('cuidador'));

                return (
                  <View
                    key={msg.id || index}
                    style={[
                      styles.messageBubbleWrapper,
                      isMe ? styles.alignRight : styles.alignLeft,
                    ]}
                  >
                    <View
                      style={[
                        styles.messageBubble,
                        isMe
                          ? [styles.myBubble, { backgroundColor: colors.primary }]
                          : [styles.otherBubble, { backgroundColor: colors.background, borderColor: colors.cardBorder }],
                      ]}
                    >
                      <Text
                        style={[
                          styles.senderText,
                          {
                            color: isMe ? 'rgba(255,255,255,0.85)' : colors.primary,
                            fontSize: 11 * fontScale,
                          },
                        ]}
                      >
                        {msg.remetente || (isMe ? 'Você' : 'Família')}
                      </Text>
                      <Text
                        style={[
                          styles.messageContent,
                          {
                            color: isMe ? '#ffffff' : colors.text,
                            fontSize: 15 * fontScale,
                          },
                        ]}
                      >
                        {msg.conteudo}
                      </Text>
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>

          {/* Barra de Envio */}
          <View style={[styles.inputRow, { backgroundColor: colors.background, borderColor: colors.cardBorder }]}>
            <TextInput
              style={[styles.textInput, { color: colors.inputText }]}
              placeholder="Digite um recado..."
              placeholderTextColor={colors.placeholder}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={280}
            />
            <TouchableOpacity
              style={[
                styles.sendBtn,
                {
                  backgroundColor: inputText.trim() ? colors.primary : `${colors.primary}55`,
                },
              ]}
              onPress={() => handleSendMessage()}
              disabled={!inputText.trim() || sending}
              accessibilityRole="button"
              accessibilityLabel="Enviar mensagem"
            >
              {sending ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Feather name="send" size={18} color="#ffffff" />
              )}
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
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
  quickRepliesContainer: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#37415133',
  },
  quickRepliesList: {
    paddingHorizontal: 20,
    gap: 8,
  },
  quickReplyChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  quickReplyText: {
    fontWeight: '600',
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
    fontWeight: '700',
  },
  emptySubtitle: {
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 18,
  },
  messageBubbleWrapper: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  alignRight: {
    justifyContent: 'flex-end',
  },
  alignLeft: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '82%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  myBubble: {
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    borderBottomLeftRadius: 4,
    borderWidth: 1,
  },
  senderText: {
    fontWeight: '700',
    marginBottom: 2,
  },
  messageContent: {
    lineHeight: 20,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 6,
    gap: 8,
  },
  textInput: {
    flex: 1,
    maxHeight: 80,
    fontSize: 15,
    paddingVertical: 6,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

