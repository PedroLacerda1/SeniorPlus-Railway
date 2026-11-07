import React, { useState, useContext } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useFonts, DancingScript_700Bold } from '@expo-google-fonts/dancing-script';
import { AuthContext } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import ThemeToggle from '../../components/ThemeToggle';

export default function ForgotPasswordScreen({ onNavigateToLogin, navigation }) {
  const [mode, setMode] = useState('REQUEST'); // 'REQUEST' | 'RESET'
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [focusedField, setFocusedField] = useState(null);

  const { requestPasswordReset, confirmPasswordReset } = useContext(AuthContext);
  const { colors, darkMode } = useTheme();

  const [fontsLoaded] = useFonts({
    DancingScript_700Bold,
  });

  const handleRequestSubmit = async () => {
    setError('');
    setSuccessMessage('');

    if (!email.trim()) {
      setError('Por favor, digite seu email.');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email.trim())) {
      setError('Informe um e-mail válido.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await requestPasswordReset(email.trim());
      setIsLoading(false);

      if (result?.success) {
        setSuccessMessage(
          'Se o e-mail existir em nossa base, você receberá instruções com o código para redefinir sua senha.'
        );
      } else {
        setError(result?.message || 'Falha ao solicitar redefinição. Tente novamente.');
      }
    } catch (_err) {
      setIsLoading(false);
      setError('Erro ao conectar com o servidor.');
    }
  };

  const handleResetSubmit = async () => {
    setError('');
    setSuccessMessage('');

    if (!token.trim()) {
      setError('Por favor, informe o código de redefinição.');
      return;
    }

    if (!password || !confirmPassword) {
      setError('Por favor, preencha todos os campos de senha.');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await confirmPasswordReset(token.trim(), password);
      setIsLoading(false);

      if (result?.success) {
        setSuccessMessage('Senha redefinida com sucesso! Faça login com a nova senha.');
        setTimeout(() => {
          goToLogin();
        }, 2000);
      } else {
        setError(result?.message || 'Falha ao redefinir senha. Verifique o código.');
      }
    } catch (_err) {
      setIsLoading(false);
      setError('Erro ao conectar com o servidor.');
    }
  };

  const goToLogin = () => {
    if (onNavigateToLogin) {
      onNavigateToLogin();
    } else if (navigation?.navigate) {
      navigation.navigate('Login');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.keyboardContainer, { backgroundColor: colors.background }]}
    >
      <StatusBar style={darkMode ? 'light' : 'dark'} />
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { backgroundColor: colors.background }]}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
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
          {/* Header row with Theme Toggle */}
          <View style={styles.topBar}>
            <View style={{ width: 42 }} />
            <View style={styles.logoRow}>
              <Feather name="heart" size={28} color={colors.primary} style={styles.logoIcon} />
              <Text
                style={[
                  styles.logoText,
                  { color: colors.primary },
                  fontsLoaded && { fontFamily: 'DancingScript_700Bold' },
                ]}
              >
                Senior+
              </Text>
            </View>
            <ThemeToggle />
          </View>

          {/* Tab selector between Solicitar and Redefinir */}
          <View
            style={[
              styles.modeTabs,
              {
                backgroundColor: colors.roleInactiveBg,
                borderColor: colors.cardBorder,
              },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.modeTab,
                mode === 'REQUEST' && {
                  backgroundColor: colors.cardBackground,
                  borderColor: colors.cardBorder,
                  borderWidth: 1,
                },
              ]}
              onPress={() => {
                setMode('REQUEST');
                setError('');
                setSuccessMessage('');
              }}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.modeTabText,
                  {
                    color: mode === 'REQUEST' ? colors.primary : colors.subtitle,
                    fontWeight: mode === 'REQUEST' ? '700' : '500',
                  },
                ]}
              >
                Solicitar código
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modeTab,
                mode === 'RESET' && {
                  backgroundColor: colors.cardBackground,
                  borderColor: colors.cardBorder,
                  borderWidth: 1,
                },
              ]}
              onPress={() => {
                setMode('RESET');
                setError('');
                setSuccessMessage('');
              }}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.modeTabText,
                  {
                    color: mode === 'RESET' ? colors.primary : colors.subtitle,
                    fontWeight: mode === 'RESET' ? '700' : '500',
                  },
                ]}
              >
                Tenho um código
              </Text>
            </TouchableOpacity>
          </View>

          {/* Titles */}
          <Text style={[styles.title, { color: colors.text }]}>
            {mode === 'REQUEST' ? 'Esqueci minha senha' : 'Redefinir senha'}
          </Text>
          <Text style={[styles.subtitle, { color: colors.subtitle }]}>
            {mode === 'REQUEST'
              ? 'Digite seu email para receber as instruções de recuperação'
              : 'Informe o código recebido por e-mail e sua nova senha'}
          </Text>

          {/* Error Banner */}
          {error ? (
            <View
              style={[
                styles.banner,
                {
                  backgroundColor: colors.errorBackground,
                  borderColor: colors.errorBorder,
                },
              ]}
            >
              <Feather name="alert-circle" size={18} color="#f87171" style={styles.bannerIcon} />
              <Text style={[styles.bannerText, { color: colors.errorText }]}>{error}</Text>
            </View>
          ) : null}

          {/* Success Banner */}
          {successMessage ? (
            <View
              style={[
                styles.banner,
                {
                  backgroundColor: darkMode ? 'rgba(34, 197, 94, 0.15)' : '#c6f6d5',
                  borderColor: darkMode ? 'rgba(34, 197, 94, 0.3)' : '#9ae6b4',
                },
              ]}
            >
              <Feather
                name="check-circle"
                size={18}
                color={darkMode ? '#4ade80' : '#2f855a'}
                style={styles.bannerIcon}
              />
              <Text
                style={[
                  styles.bannerText,
                  { color: darkMode ? '#4ade80' : '#2f855a' },
                ]}
              >
                {successMessage}
              </Text>
            </View>
          ) : null}

          {/* MODE 1: REQUEST */}
          {mode === 'REQUEST' ? (
            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Feather name="mail" size={15} color={colors.labelIcon} />
                  <Text style={[styles.labelText, { color: colors.label }]}>Email</Text>
                </View>
                <View
                  style={[
                    styles.inputWrapper,
                    {
                      backgroundColor: colors.inputBackground,
                      borderColor:
                        focusedField === 'email'
                          ? colors.inputBorderFocused
                          : colors.inputBorder,
                    },
                  ]}
                >
                  <Feather
                    name="mail"
                    size={18}
                    color={focusedField === 'email' ? colors.primary : colors.inputIcon}
                    style={styles.inputInnerIcon}
                  />
                  <TextInput
                    style={[styles.textInput, { color: colors.inputText }]}
                    placeholder="seu@email.com"
                    placeholderTextColor={colors.inputPlaceholder}
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      if (error) setError('');
                    }}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoCorrect={false}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={styles.submitButtonContainer}
                onPress={handleRequestSubmit}
                disabled={isLoading}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={isLoading ? ['#94a3b8', '#64748b'] : colors.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.submitGradient}
                >
                  {isLoading ? (
                    <View style={styles.loadingRow}>
                      <ActivityIndicator color="#ffffff" size="small" />
                      <Text style={styles.submitButtonText}>Enviando...</Text>
                    </View>
                  ) : (
                    <Text style={styles.submitButtonText}>Enviar instruções</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {successMessage ? (
                <TouchableOpacity
                  style={[
                    styles.switchModeButton,
                    { borderColor: colors.primary },
                  ]}
                  onPress={() => setMode('RESET')}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.switchModeButtonText, { color: colors.primary }]}>
                    Já recebeu o código? Redefina aqui
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : (
            /* MODE 2: RESET */
            <View style={styles.formContainer}>
              {/* Field: Token */}
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Feather name="key" size={15} color={colors.labelIcon} />
                  <Text style={[styles.labelText, { color: colors.label }]}>
                    Código / Token de redefinição
                  </Text>
                </View>
                <View
                  style={[
                    styles.inputWrapper,
                    {
                      backgroundColor: colors.inputBackground,
                      borderColor:
                        focusedField === 'token'
                          ? colors.inputBorderFocused
                          : colors.inputBorder,
                    },
                  ]}
                >
                  <Feather
                    name="key"
                    size={18}
                    color={focusedField === 'token' ? colors.primary : colors.inputIcon}
                    style={styles.inputInnerIcon}
                  />
                  <TextInput
                    style={[styles.textInput, { color: colors.inputText }]}
                    placeholder="Código recebido por e-mail"
                    placeholderTextColor={colors.inputPlaceholder}
                    value={token}
                    onChangeText={(text) => {
                      setToken(text);
                      if (error) setError('');
                    }}
                    onFocus={() => setFocusedField('token')}
                    onBlur={() => setFocusedField(null)}
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {/* Field: Nova Senha */}
              <View style={[styles.inputGroup, { marginTop: 14 }]}>
                <View style={styles.labelRow}>
                  <Feather name="lock" size={15} color={colors.labelIcon} />
                  <Text style={[styles.labelText, { color: colors.label }]}>Nova senha</Text>
                </View>
                <View
                  style={[
                    styles.inputWrapper,
                    {
                      backgroundColor: colors.inputBackground,
                      borderColor:
                        focusedField === 'password'
                          ? colors.inputBorderFocused
                          : colors.inputBorder,
                    },
                  ]}
                >
                  <Feather
                    name="lock"
                    size={18}
                    color={focusedField === 'password' ? colors.primary : colors.inputIcon}
                    style={styles.inputInnerIcon}
                  />
                  <TextInput
                    style={[styles.textInput, { color: colors.inputText }]}
                    placeholder="••••••••"
                    placeholderTextColor={colors.inputPlaceholder}
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      if (error) setError('');
                    }}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                    activeOpacity={0.7}
                  >
                    <Feather
                      name={showPassword ? 'eye' : 'eye-off'}
                      size={18}
                      color={showPassword ? colors.primary : colors.eyeIcon}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Field: Confirmar Nova Senha */}
              <View style={[styles.inputGroup, { marginTop: 14 }]}>
                <View style={styles.labelRow}>
                  <Feather name="lock" size={15} color={colors.labelIcon} />
                  <Text style={[styles.labelText, { color: colors.label }]}>
                    Confirmar nova senha
                  </Text>
                </View>
                <View
                  style={[
                    styles.inputWrapper,
                    {
                      backgroundColor: colors.inputBackground,
                      borderColor:
                        focusedField === 'confirmPassword'
                          ? colors.inputBorderFocused
                          : colors.inputBorder,
                    },
                  ]}
                >
                  <Feather
                    name="lock"
                    size={18}
                    color={focusedField === 'confirmPassword' ? colors.primary : colors.inputIcon}
                    style={styles.inputInnerIcon}
                  />
                  <TextInput
                    style={[styles.textInput, { color: colors.inputText }]}
                    placeholder="••••••••"
                    placeholderTextColor={colors.inputPlaceholder}
                    value={confirmPassword}
                    onChangeText={(text) => {
                      setConfirmPassword(text);
                      if (error) setError('');
                    }}
                    onFocus={() => setFocusedField('confirmPassword')}
                    onBlur={() => setFocusedField(null)}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <TouchableOpacity
                style={styles.submitButtonContainer}
                onPress={handleResetSubmit}
                disabled={isLoading}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={isLoading ? ['#94a3b8', '#64748b'] : colors.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.submitGradient}
                >
                  {isLoading ? (
                    <View style={styles.loadingRow}>
                      <ActivityIndicator color="#ffffff" size="small" />
                      <Text style={styles.submitButtonText}>Redefinindo...</Text>
                    </View>
                  ) : (
                    <Text style={styles.submitButtonText}>Redefinir senha</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {/* Footer: Voltar ao login */}
          <View style={styles.footerRow}>
            <Text style={[styles.footerPrompt, { color: colors.footerText }]}>
              Lembrou da senha?{' '}
            </Text>
            <TouchableOpacity onPress={goToLogin} activeOpacity={0.7}>
              <Text style={[styles.footerLink, { color: colors.link }]}>Voltar ao login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 32,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 24,
    paddingHorizontal: 26,
    paddingVertical: 30,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logoIcon: {
    marginRight: 2,
  },
  logoText: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  modeTabs: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    marginBottom: 20,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeTabText: {
    fontSize: 13,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
    gap: 10,
  },
  bannerIcon: {
    marginRight: 2,
  },
  bannerText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  formContainer: {
    width: '100%',
  },
  inputGroup: {
    width: '100%',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  labelText: {
    fontSize: 14,
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    height: 50,
  },
  inputInnerIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    height: '100%',
  },
  eyeButton: {
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 20,
    shadowColor: '#00c885',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 6,
  },
  submitGradient: {
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  switchModeButton: {
    marginTop: 14,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 10,
  },
  switchModeButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  footerPrompt: {
    fontSize: 14,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});

