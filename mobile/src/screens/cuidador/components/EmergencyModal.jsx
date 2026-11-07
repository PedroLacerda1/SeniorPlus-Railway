import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../../contexts/ThemeContext';
import { emergencyContactService } from '../../../services/api';

export default function EmergencyModal({
  visible,
  onClose,
  idosoCpf,
  contacts = [],
  onRefreshContacts,
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

  const handleWhatsApp = (number) => {
    const clean = String(number).replace(/\D/g, '');
    const phoneWithCountry = clean.startsWith('55') ? clean : `55${clean}`;
    Linking.openURL(`https://wa.me/${phoneWithCountry}?text=Ol%C3%A1%2C%20mensagem%20de%20urg%C3%AAncia%20do%20Senior%2B`);
  };

  const handleSaveContact = async () => {
    if (!nome.trim() || !telefone.trim() || !idosoCpf) return;
    setIsSaving(true);
    try {
      await emergencyContactService.create(idosoCpf, {
        nomeContato: nome.trim(),
        telefoneContato: telefone.trim(),
        grauParentesco: parentesco.trim() || 'Familiar',
      });
      setNome('');
      setTelefone('');
      setParentesco('');
      setShowAddContact(false);
      if (onRefreshContacts) onRefreshContacts();
    } catch (err) {
      console.error('Erro ao adicionar contato de emergência:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
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
            <View style={styles.titleRow}>
              <View style={styles.sosBadge}>
                <Feather name="alert-triangle" size={18} color="#ffffff" />
              </View>
              <Text style={[styles.title, { color: colors.text }]}>Central de Emergência</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Feather name="x" size={22} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            {/* Quick Public Emergency Numbers */}
            <Text style={[styles.sectionSubtitle, { color: colors.subtitle }]}>
              Serviços Públicos de Emergência
            </Text>
            <View style={styles.publicNumbersRow}>
              <TouchableOpacity
                style={[styles.sosCallBtn, { backgroundColor: '#ef4444' }]}
                onPress={() => handleCall('192')}
                activeOpacity={0.8}
              >
                <Feather name="phone-call" size={18} color="#ffffff" />
                <View>
                  <Text style={styles.sosNumberText}>SAMU 192</Text>
                  <Text style={styles.sosDescText}>Emergência Médica</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.sosCallBtn, { backgroundColor: '#d97706' }]}
                onPress={() => handleCall('193')}
                activeOpacity={0.8}
              >
                <Feather name="phone-call" size={18} color="#ffffff" />
                <View>
                  <Text style={styles.sosNumberText}>Bombeiros 193</Text>
                  <Text style={styles.sosDescText}>Resgate e Socorro</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Custom Contacts */}
            <View style={styles.contactsHeader}>
              <Text style={[styles.sectionSubtitle, { color: colors.subtitle }]}>
                Contatos de Emergência do Idoso
              </Text>
              <TouchableOpacity
                onPress={() => setShowAddContact(!showAddContact)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={[styles.addText, { color: colors.primary }]}>
                  {showAddContact ? 'Cancelar' : '+ Adicionar'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Add Contact Form */}
            {showAddContact ? (
              <View
                style={[
                  styles.addForm,
                  {
                    backgroundColor: colors.roleInactiveBg,
                    borderColor: colors.cardBorder,
                  },
                ]}
              >
                <TextInput
                  style={[styles.input, { color: colors.inputText, borderColor: colors.inputBorder }]}
                  placeholder="Nome do contato (ex: Filho, Dr. Médico)"
                  placeholderTextColor={colors.inputPlaceholder}
                  value={nome}
                  onChangeText={setNome}
                />
                <TextInput
                  style={[styles.input, { color: colors.inputText, borderColor: colors.inputBorder }]}
                  placeholder="Telefone com DDD"
                  placeholderTextColor={colors.inputPlaceholder}
                  value={telefone}
                  onChangeText={setTelefone}
                  keyboardType="phone-pad"
                />
                <TextInput
                  style={[styles.input, { color: colors.inputText, borderColor: colors.inputBorder }]}
                  placeholder="Grau de parentesco (ex: Filho, Irmã, Vizinho)"
                  placeholderTextColor={colors.inputPlaceholder}
                  value={parentesco}
                  onChangeText={setParentesco}
                />
                <TouchableOpacity
                  style={[styles.saveBtn, { backgroundColor: colors.primary }]}
                  onPress={handleSaveContact}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text style={styles.saveBtnText}>Salvar Contato</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : null}

            {/* Contacts list */}
            {contacts.length === 0 ? (
              <View style={styles.emptyContacts}>
                <Feather name="users" size={24} color={colors.subtitle} />
                <Text style={[styles.emptyContactsText, { color: colors.subtitle }]}>
                  Nenhum contato pessoal cadastrado ainda.
                </Text>
              </View>
            ) : (
              <View style={styles.contactList}>
                {contacts.map((contact, index) => (
                  <View
                    key={contact.id || index}
                    style={[
                      styles.contactCard,
                      {
                        backgroundColor: colors.inputBackground,
                        borderColor: colors.cardBorder,
                      },
                    ]}
                  >
                    <View style={styles.contactInfo}>
                      <Text style={[styles.contactName, { color: colors.text }]}>
                        {contact.nomeContato || contact.nome}
                      </Text>
                      <Text style={[styles.contactRole, { color: colors.subtitle }]}>
                        {contact.grauParentesco || 'Familiar'} • {contact.telefoneContato || contact.telefone}
                      </Text>
                    </View>

                    <View style={styles.contactActions}>
                      <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: '#10b981' }]}
                        onPress={() => handleWhatsApp(contact.telefoneContato || contact.telefone)}
                        activeOpacity={0.7}
                      >
                        <Feather name="message-circle" size={16} color="#ffffff" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: '#3b82f6' }]}
                        onPress={() => handleCall(contact.telefoneContato || contact.telefone)}
                        activeOpacity={0.7}
                      >
                        <Feather name="phone" size={16} color="#ffffff" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
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
    maxHeight: '85%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150, 150, 150, 0.15)',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sosBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  content: {
    paddingVertical: 16,
    gap: 14,
  },
  sectionSubtitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  publicNumbersRow: {
    flexDirection: 'row',
    gap: 10,
  },
  sosCallBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    gap: 10,
  },
  sosNumberText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  sosDescText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  contactsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  addText: {
    fontSize: 13,
    fontWeight: '600',
  },
  addForm: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
  },
  input: {
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 13,
  },
  saveBtn: {
    height: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContacts: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 6,
  },
  emptyContactsText: {
    fontSize: 13,
  },
  contactList: {
    gap: 10,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  contactInfo: {
    flex: 1,
    marginRight: 10,
  },
  contactName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  contactRole: {
    fontSize: 12,
  },
  contactActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

