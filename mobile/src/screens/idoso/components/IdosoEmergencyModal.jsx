import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Linking,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Feather, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../../contexts/ThemeContext';
import { emergencyContactService } from '../../../services/api';

export default function IdosoEmergencyModal({
  visible,
  onClose,
  idosoCpf,
  contacts = [],
  onRefreshContacts,
  fontScale = 1,
}) {
  const { colors } = useTheme();
  const [showAddContact, setShowAddContact] = useState(false);
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [parentesco, setParentesco] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleCall = (number) => {
    const clean = String(number).replace(/\D/g, '');
    Linking.openURL(`tel:${clean}`);
  };

  const handleWhatsAppEmergency = (contactPhone) => {
    if (!contactPhone) {
      Alert.alert('Aviso', 'Nenhum telefone informado para este contato.');
      return;
    }
    const clean = String(contactPhone).replace(/\D/g, '');
    const num = clean.startsWith('55') ? clean : `55${clean}`;
    const text = encodeURIComponent(
      '🚨 EMERGÊNCIA SENIOR+: Preciso de ajuda imediata! Por favor, entre em contato comigo agora mesmo.',
    );
    Linking.openURL(`https://wa.me/${num}?text=${text}`);
  };

  const handleSaveContact = async () => {
    if (!nome.trim() || !telefone.trim()) {
      Alert.alert('Campos obrigatórios', 'Preencha o nome e o telefone do contato.');
      return;
    }
    if (!idosoCpf) {
      Alert.alert('Erro', 'CPF do idoso não identificado.');
      return;
    }

    setIsSaving(true);
    try {
      await emergencyContactService.create(idosoCpf, {
        nome: nome.trim(),
        telefone: telefone.trim(),
        parentesco: parentesco.trim() || 'Familiar',
      });
      setNome('');
      setTelefone('');
      setParentesco('');
      setShowAddContact(false);
      Alert.alert('Sucesso', 'Contato de emergência adicionado com sucesso!');
      if (onRefreshContacts) onRefreshContacts();
    } catch (err) {
      Alert.alert('Erro', err.friendlyMessage || 'Erro ao cadastrar contato.');
    } finally {
      setIsSaving(false);
    }
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
          {/* Header de Emergência com Sirene */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View style={styles.sirenCircle}>
                <MaterialCommunityIcons name="alarm-light" size={26 * fontScale} color="#ffffff" />
              </View>
              <View>
                <Text style={[styles.title, { fontSize: 20 * fontScale }]}>
                  Central de Ajuda SOS
                </Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary, fontSize: 13 * fontScale }]}>
                  Ligue agora para socorro ou familiares
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeBtn, { backgroundColor: colors.background }]}
              accessibilityRole="button"
              accessibilityLabel="Fechar emergência"
            >
              <Feather name="x" size={22} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentList}
          >
            {/* Botões Gigantes dos Serviços Públicos */}
            <View style={styles.publicServicesRow}>
              {/* SAMU 192 */}
              <TouchableOpacity
                style={[styles.bigCallButton, styles.samuBtn]}
                onPress={() => handleCall('192')}
                accessibilityRole="button"
                accessibilityLabel="Ligar imediatamente para o SAMU 192"
              >
                <FontAwesome5 name="ambulance" size={28 * fontScale} color="#ffffff" />
                <Text style={[styles.bigCallText, { fontSize: 22 * fontScale }]}>
                  SAMU 192
                </Text>
                <Text style={styles.bigCallSub}>Ambulância e Socorro</Text>
              </TouchableOpacity>

              {/* Bombeiros 193 */}
              <TouchableOpacity
                style={[styles.bigCallButton, styles.fireBtn]}
                onPress={() => handleCall('193')}
                accessibilityRole="button"
                accessibilityLabel="Ligar imediatamente para os Bombeiros 193"
              >
                <FontAwesome5 name="fire-extinguisher" size={28 * fontScale} color="#ffffff" />
                <Text style={[styles.bigCallText, { fontSize: 22 * fontScale }]}>
                  193
                </Text>
                <Text style={styles.bigCallSub}>Corpo de Bombeiros</Text>
              </TouchableOpacity>
            </View>

            {/* Seção Contatos Cadastrados */}
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text, fontSize: 16 * fontScale }]}>
                Contatos da Família e Cuidador
              </Text>
              <TouchableOpacity
                style={styles.addContactToggle}
                onPress={() => setShowAddContact(!showAddContact)}
                accessibilityRole="button"
                accessibilityLabel="Adicionar novo telefone de emergência"
              >
                <Feather
                  name={showAddContact ? 'chevron-up' : 'user-plus'}
                  size={16 * fontScale}
                  color={colors.primary}
                />
                <Text style={[styles.addContactToggleText, { color: colors.primary, fontSize: 13 * fontScale }]}>
                  {showAddContact ? 'Fechar' : 'Adicionar'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Formulário para adicionar contato */}
            {showAddContact ? (
              <View style={[styles.formCard, { backgroundColor: colors.background, borderColor: colors.cardBorder }]}>
                <Text style={[styles.formTitle, { color: colors.text, fontSize: 14 * fontScale }]}>
                  Novo Contato de Emergência
                </Text>

                <TextInput
                  style={[styles.input, { color: colors.inputText, borderColor: colors.inputBorder }]}
                  placeholder="Nome (Ex: Filho Carlos)"
                  placeholderTextColor={colors.placeholder}
                  value={nome}
                  onChangeText={setNome}
                />

                <TextInput
                  style={[styles.input, { color: colors.inputText, borderColor: colors.inputBorder }]}
                  placeholder="Telefone com DDD (Ex: 11 99999-9999)"
                  placeholderTextColor={colors.placeholder}
                  keyboardType="phone-pad"
                  value={telefone}
                  onChangeText={setTelefone}
                />

                <TextInput
                  style={[styles.input, { color: colors.inputText, borderColor: colors.inputBorder }]}
                  placeholder="Parentesco (Ex: Filho, Vizinho, Cuidador)"
                  placeholderTextColor={colors.placeholder}
                  value={parentesco}
                  onChangeText={setParentesco}
                />

                <TouchableOpacity
                  style={[styles.saveBtn, { backgroundColor: colors.primary }]}
                  onPress={handleSaveContact}
                  disabled={isSaving}
                  accessibilityRole="button"
                  accessibilityLabel="Salvar novo contato de emergência"
                >
                  {isSaving ? (
                    <ActivityIndicator color="#ffffff" size="small" />
                  ) : (
                    <Text style={styles.saveBtnText}>Salvar Contato</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : null}

            {/* Lista de Contatos */}
            {contacts.length === 0 ? (
              <View style={[styles.emptyBox, { backgroundColor: colors.background, borderColor: colors.cardBorder }]}>
                <Feather name="phone-off" size={24} color={colors.textSecondary} />
                <Text style={[styles.emptyText, { color: colors.textSecondary, fontSize: 14 * fontScale }]}>
                  Nenhum telefone de emergência cadastrado ainda. Toque em &quot;Adicionar&quot; acima para incluir seus parentes.
                </Text>
              </View>
            ) : (
              contacts.map((contact, index) => (
                <View
                  key={contact.id || index}
                  style={[
                    styles.contactCard,
                    {
                      backgroundColor: colors.background,
                      borderColor: colors.cardBorder,
                    },
                  ]}
                >
                  <View style={styles.contactInfo}>
                    <Text style={[styles.contactName, { color: colors.text, fontSize: 16 * fontScale }]}>
                      {contact.nome}
                    </Text>
                    <Text style={[styles.contactRole, { color: colors.textSecondary, fontSize: 12 * fontScale }]}>
                      {contact.parentesco || 'Contato de Emergência'} • {contact.telefone}
                    </Text>
                  </View>

                  <View style={styles.contactActions}>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.callBtn]}
                      onPress={() => handleCall(contact.telefone)}
                      accessibilityRole="button"
                      accessibilityLabel={`Ligar agora para ${contact.nome}`}
                    >
                      <Feather name="phone" size={18 * fontScale} color="#ffffff" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionBtn, styles.waBtn]}
                      onPress={() => handleWhatsAppEmergency(contact.telefone)}
                      accessibilityRole="button"
                      accessibilityLabel={`Enviar WhatsApp de socorro para ${contact.nome}`}
                    >
                      <FontAwesome5 name="whatsapp" size={18 * fontScale} color="#ffffff" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.doneBtn, { backgroundColor: colors.primary }]}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Fechar tela de emergência"
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
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
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
  sirenCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#dc2626',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontWeight: '900',
    color: '#dc2626',
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
    gap: 16,
  },
  publicServicesRow: {
    flexDirection: 'row',
    gap: 12,
  },
  bigCallButton: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 110,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
  },
  samuBtn: {
    backgroundColor: '#dc2626',
  },
  fireBtn: {
    backgroundColor: '#ea580c',
  },
  bigCallText: {
    color: '#ffffff',
    fontWeight: '900',
    marginTop: 6,
  },
  bigCallSub: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  sectionTitle: {
    fontWeight: '800',
  },
  addContactToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 4,
  },
  addContactToggleText: {
    fontWeight: '700',
  },
  formCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  formTitle: {
    fontWeight: '700',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
  },
  saveBtn: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  saveBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  emptyBox: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    alignItems: 'center',
    gap: 8,
  },
  emptyText: {
    textAlign: 'center',
    lineHeight: 20,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontWeight: '700',
  },
  contactRole: {
    marginTop: 2,
  },
  contactActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  callBtn: {
    backgroundColor: '#2563eb',
  },
  waBtn: {
    backgroundColor: '#16a34a',
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

