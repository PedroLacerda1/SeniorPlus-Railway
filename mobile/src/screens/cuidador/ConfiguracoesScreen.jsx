import React, { useContext, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { AuthContext } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { caregiverService } from '../../services/api';
import { storage } from '../../utils/storage';

const PROFILE_KEY = 'caregiverProfile';

export default function ConfiguracoesScreen({ onBack, onProfileUpdated }) {
  const { user } = useContext(AuthContext);
  const { colors, darkMode, toggleDarkMode } = useTheme();
  const [form, setForm] = useState(() => getDefaultProfile(user));
  const styles = useMemo(() => createStyles(colors), [colors]);

  useEffect(() => {
    let active = true;
    const loadProfile = async () => {
      try {
        const saved = await storage.getItem(PROFILE_KEY);
        if (saved && active) {
          setForm({ ...getDefaultProfile(user), ...JSON.parse(saved) });
        }
      } catch (error) {
        console.error('Erro ao carregar perfil do cuidador:', error);
        Alert.alert('Erro', 'Não foi possível carregar o perfil salvo.');
      }
    };
    loadProfile();
    return () => {
      active = false;
    };
  }, [user]);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const saveProfile = async () => {
    try {
      await storage.setItem(PROFILE_KEY, JSON.stringify(form));
      onProfileUpdated?.(form);
      if (user?.cpf) {
        try {
          await caregiverService.update(user.cpf, {
            cpf: user.cpf,
            nome: form.displayName || user?.nome || user?.name || '',
            email: form.email,
            telefone: form.phone,
          });
          Alert.alert(
            'Perfil atualizado',
            'As informações de contato foram atualizadas no servidor. Preferências adicionais foram salvas neste dispositivo.',
          );
        } catch (error) {
          console.error('Erro ao atualizar perfil no servidor:', error);
          Alert.alert(
            'Perfil salvo parcialmente',
            `As preferências foram salvas neste dispositivo, mas os dados de contato não foram atualizados no servidor. ${error.friendlyMessage || error.message || ''}`,
          );
        }
      } else {
        Alert.alert(
          'Perfil atualizado',
          'As informações foram salvas neste dispositivo. O CPF da conta não está disponível para sincronizar os dados com o servidor.',
        );
      }
    } catch (error) {
      console.error('Erro ao salvar perfil do cuidador:', error);
      Alert.alert('Erro', 'Não foi possível salvar o perfil.');
    }
  };

  const restoreProfile = async () => {
    try {
      await storage.deleteItem(PROFILE_KEY);
      const defaultProfile = getDefaultProfile(user);
      setForm(defaultProfile);
      onProfileUpdated?.(defaultProfile);
      Alert.alert('Perfil restaurado', 'Os dados foram restaurados para os valores da conta.');
    } catch (error) {
      console.error('Erro ao restaurar perfil do cuidador:', error);
      Alert.alert('Erro', 'Não foi possível restaurar o perfil.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.screen}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Voltar ao painel"
            onPress={onBack}
            style={styles.backButton}
          >
            <Feather name="arrow-left" size={20} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerCopy}>
            <Text style={styles.title}>Configurações</Text>
            <Text style={styles.subtitle}>Personalize seu perfil e preferências.</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Perfil do cuidador</Text>
          <Text style={styles.helper}>
            Nome e contato são sincronizados com o servidor quando o CPF da conta está disponível. Área de atuação, mensagem e descrição ficam salvas neste dispositivo.
          </Text>

          <Text style={styles.fieldLabel}>Nome exibido</Text>
          <TextInput
            accessibilityLabel="Nome exibido"
            onChangeText={(value) => updateField('displayName', value)}
            placeholder="Nome completo ou apelido"
            placeholderTextColor={colors.inputPlaceholder}
            style={styles.input}
            value={form.displayName}
          />

          <Text style={styles.fieldLabel}>Área de atuação</Text>
          <TextInput
            accessibilityLabel="Área de atuação"
            onChangeText={(value) => updateField('headline', value)}
            placeholder="Ex.: Cuidador especializado em mobilidade"
            placeholderTextColor={colors.inputPlaceholder}
            style={styles.input}
            value={form.headline}
          />

          <Text style={styles.fieldLabel}>Telefone de contato</Text>
          <TextInput
            accessibilityLabel="Telefone de contato"
            keyboardType="phone-pad"
            onChangeText={(value) => updateField('phone', value)}
            placeholder="(00) 00000-0000"
            placeholderTextColor={colors.inputPlaceholder}
            style={styles.input}
            value={form.phone}
          />

          <Text style={styles.fieldLabel}>E-mail</Text>
          <TextInput
            accessibilityLabel="E-mail"
            autoCapitalize="none"
            keyboardType="email-address"
            onChangeText={(value) => updateField('email', value)}
            placeholder="cuidador@exemplo.com"
            placeholderTextColor={colors.inputPlaceholder}
            style={styles.input}
            value={form.email}
          />

          <Text style={styles.fieldLabel}>Mensagem de conexão</Text>
          <TextInput
            accessibilityLabel="Mensagem de conexão"
            maxLength={240}
            multiline
            onChangeText={(value) => updateField('connectionMessage', value)}
            placeholder="Mensagem exibida ao idoso em uma solicitação de vínculo"
            placeholderTextColor={colors.inputPlaceholder}
            style={[styles.input, styles.multilineInput]}
            textAlignVertical="top"
            value={form.connectionMessage}
          />

          <Text style={styles.fieldLabel}>Descrição</Text>
          <TextInput
            accessibilityLabel="Descrição do cuidador"
            maxLength={300}
            multiline
            onChangeText={(value) => updateField('about', value)}
            placeholder="Conte um pouco sobre sua experiência e cuidados."
            placeholderTextColor={colors.inputPlaceholder}
            style={[styles.input, styles.multilineInput]}
            textAlignVertical="top"
            value={form.about}
          />

          <View style={styles.buttonRow}>
            <TouchableOpacity
              accessibilityRole="button"
              onPress={restoreProfile}
              style={styles.secondaryButton}
            >
              <Text style={styles.secondaryButtonText}>Restaurar padrão</Text>
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityRole="button"
              onPress={saveProfile}
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>Salvar perfil</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aparência</Text>
          <View style={styles.preferenceRow}>
            <View style={styles.preferenceCopy}>
              <Text style={styles.preferenceTitle}>Modo escuro</Text>
              <Text style={styles.helper}>
                Reduz o cansaço visual em ambientes com pouca luz.
              </Text>
            </View>
            <Switch
              accessibilityLabel="Alternar modo escuro"
              onValueChange={toggleDarkMode}
              trackColor={{ false: colors.inputBorder, true: colors.primary }}
              thumbColor={colors.cardBackground}
              value={darkMode}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function getDefaultProfile(user) {
  return {
    displayName: user?.name || user?.nome || user?.fullName || user?.username || '',
    headline: '',
    about: '',
    photoUrl: '',
    phone: user?.telefone || user?.phone || '',
    email: user?.email || '',
    connectionMessage: '',
  };
}

function createStyles(colors) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    content: { padding: 20, paddingTop: 54, paddingBottom: 40, gap: 20 },
    header: { flexDirection: 'row', alignItems: 'center', gap: 13 },
    backButton: {
      width: 42,
      height: 42,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.cardBackground,
      borderColor: colors.cardBorder,
      borderWidth: 1,
    },
    headerCopy: { flex: 1 },
    title: { color: colors.text, fontSize: 22, fontWeight: '800' },
    subtitle: { color: colors.subtitle, fontSize: 12, marginTop: 4 },
    section: {
      padding: 17,
      borderRadius: 20,
      backgroundColor: colors.cardBackground,
      borderColor: colors.cardBorder,
      borderWidth: 1,
    },
    sectionTitle: {
      color: colors.text,
      fontSize: 17,
      fontWeight: '700',
      marginBottom: 8,
    },
    helper: { color: colors.subtitle, fontSize: 12, lineHeight: 18 },
    fieldLabel: {
      color: colors.label,
      fontSize: 13,
      fontWeight: '600',
      marginTop: 15,
      marginBottom: 7,
    },
    input: {
      minHeight: 48,
      paddingHorizontal: 13,
      paddingVertical: 11,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      backgroundColor: colors.inputBackground,
      color: colors.inputText,
      fontSize: 14,
    },
    multilineInput: { minHeight: 88 },
    buttonRow: { flexDirection: 'row', gap: 10, marginTop: 19 },
    secondaryButton: {
      flex: 1,
      minHeight: 46,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      paddingHorizontal: 8,
    },
    secondaryButtonText: { color: colors.text, fontSize: 12, fontWeight: '700' },
    primaryButton: {
      flex: 1,
      minHeight: 46,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 12,
      backgroundColor: colors.primary,
      paddingHorizontal: 8,
    },
    primaryButtonText: { color: colors.buttonText, fontSize: 13, fontWeight: '700' },
    preferenceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginTop: 8,
    },
    preferenceCopy: { flex: 1 },
    preferenceTitle: { color: colors.text, fontSize: 14, fontWeight: '700', marginBottom: 4 },
  });
}
