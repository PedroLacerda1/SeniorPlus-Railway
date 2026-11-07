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

export default function RegisterScreen({ onNavigateToLogin, navigation }) {
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState(''); // 'ROLE_CUIDADOR' | 'ROLE_IDOSO'
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const { register } = useContext(AuthContext);
  const { colors, darkMode } = useTheme();

  const [fontsLoaded] = useFonts({
    DancingScript_700Bold,
  });

  const handleCpfChange = (text) => {
    const raw = text.replace(/\D/g, '').slice(0, 11);
    let formatted = raw;
    if (raw.length > 9) {
      formatted = `${raw.slice(0, 3)}.${raw.slice(3, 6)}.${raw.slice(6, 9)}-${raw.slice(9)}`;
    } else if (raw.length > 6) {
      formatted = `${raw.slice(0, 3)}.${raw.slice(3, 6)}.${raw.slice(6)}`;
    } else if (raw.length > 3) {
      formatted = `${raw.slice(0, 3)}.${raw.slice(3)}`;
    }
    setCpf(formatted);
    if (fieldErrors.cpf) {
      setFieldErrors((prev) => ({ ...prev, cpf: null }));
    }
  };

  const handleSubmit = async () => {
    setError('');
    setFieldErrors({});

    const nextErrors = {};

    if (!name.trim()) {
      nextErrors.name = 'Informe o nome completo.';
    }

    const cleanCpf = cpf.replace(/\D/g, '');
    if (!cleanCpf) {
      nextErrors.cpf = 'Informe o CPF com 11 dígitos.';
    } else if (cleanCpf.length !== 11) {
      nextErrors.cpf = 'O CPF deve conter 11 dígitos numéricos.';
    }

    if (!email.trim()) {
      nextErrors.email = 'Informe um e-mail válido.';
    } else if (!/\S+@\S+\.\S+/.test(email.trim())) {
      nextErrors.email = 'Informe um formato de e-mail válido.';
    }

    if (!role) {
      nextErrors.role = 'Selecione o seu perfil de acesso.';
    }

    if (password.length < 6) {
      nextErrors.password = 'A senha deve ter pelo menos 6 caracteres.';
    }

    if (password !== confirmPassword) {
      nextErrors.confirmPassword = 'As senhas precisam ser iguais.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      setError('Por favor, corrija os campos destacados.');
      return;
    }

    setIsLoading(true);

    try {
      const userData = {
        nome: name.trim(),
        cpf: cleanCpf,
        email: email.trim(),
        senha: password,
        tipoUsuario: role === 'ROLE_CUIDADOR' ? 'Cuidador' : 'Idoso',
      };

      const result = await register(userData);
      setIsLoading(false);

      if (!result?.success) {
        setError(result?.message || 'Falha ao registrar. Tente novamente.');
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

          {/* Title & Subtitle */}
          <Text style={[styles.title, { color: colors.text }]}>Crie sua conta</Text>
          <Text style={[styles.subtitle, { color: colors.subtitle }]}>
            Registre-se para começar a usar o Senior+
          </Text>

          {/* Error Banner */}
          {error ? (
            <View
              style={[
                styles.errorBanner,
                {
                  backgroundColor: colors.errorBackground,
                  borderColor: colors.errorBorder,
                },
              ]}
            >
              <Feather name="alert-circle" size={18} color="#f87171" style={styles.errorIcon} />
              <Text style={[styles.errorText, { color: colors.errorText }]}>{error}</Text>
            </View>
          ) : null}

          {/* Field: Nome completo */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Feather name="user" size={15} color={colors.labelIcon} />
              <Text style={[styles.labelText, { color: colors.label }]}>Nome completo</Text>
            </View>
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: fieldErrors.name
                    ? '#f87171'
                    : focusedField === 'name'
                    ? colors.inputBorderFocused
                    : colors.inputBorder,
                },
              ]}
            >
              <Feather
                name="user"
                size={18}
                color={focusedField === 'name' ? colors.primary : colors.inputIcon}
                style={styles.inputInnerIcon}
              />
              <TextInput
                style={[styles.textInput, { color: colors.inputText }]}
                placeholder="Seu nome completo"
                placeholderTextColor={colors.inputPlaceholder}
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: null }));
                }}
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField(null)}
              />
            </View>
            {fieldErrors.name ? (
              <Text style={styles.fieldErrorText}>{fieldErrors.name}</Text>
            ) : null}
          </View>

          {/* Field: CPF */}
          <View style={[styles.inputGroup, { marginTop: 14 }]}>
            <View style={styles.labelRow}>
              <Feather name="file-text" size={15} color={colors.labelIcon} />
              <Text style={[styles.labelText, { color: colors.label }]}>CPF</Text>
            </View>
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: fieldErrors.cpf
                    ? '#f87171'
                    : focusedField === 'cpf'
                    ? colors.inputBorderFocused
                    : colors.inputBorder,
                },
              ]}
            >
              <Feather
                name="file-text"
                size={18}
                color={focusedField === 'cpf' ? colors.primary : colors.inputIcon}
                style={styles.inputInnerIcon}
              />
              <TextInput
                style={[styles.textInput, { color: colors.inputText }]}
                placeholder="CPF (apenas números)"
                placeholderTextColor={colors.inputPlaceholder}
                value={cpf}
                onChangeText={handleCpfChange}
                onFocus={() => setFocusedField('cpf')}
                onBlur={() => setFocusedField(null)}
                keyboardType="numeric"
                maxLength={14}
              />
            </View>
            {fieldErrors.cpf ? (
              <Text style={styles.fieldErrorText}>{fieldErrors.cpf}</Text>
            ) : null}
          </View>

          {/* Field: Email */}
          <View style={[styles.inputGroup, { marginTop: 14 }]}>
            <View style={styles.labelRow}>
              <Feather name="mail" size={15} color={colors.labelIcon} />
              <Text style={[styles.labelText, { color: colors.label }]}>Email</Text>
            </View>
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: fieldErrors.email
                    ? '#f87171'
                    : focusedField === 'email'
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
                  if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: null }));
                }}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
              />
            </View>
            {fieldErrors.email ? (
              <Text style={styles.fieldErrorText}>{fieldErrors.email}</Text>
            ) : null}
          </View>

          {/* Field: Role / Você é um... */}
          <View style={[styles.inputGroup, { marginTop: 14 }]}>
            <View style={styles.labelRow}>
              <Feather name="users" size={15} color={colors.labelIcon} />
              <Text style={[styles.labelText, { color: colors.label }]}>Você é um...</Text>
            </View>
            <View style={styles.roleContainer}>
              <TouchableOpacity
                style={[
                  styles.roleCard,
                  {
                    backgroundColor:
                      role === 'ROLE_CUIDADOR' ? colors.roleActiveBg : colors.roleInactiveBg,
                    borderColor:
                      role === 'ROLE_CUIDADOR' ? colors.roleActiveBorder : colors.roleInactiveBorder,
                  },
                ]}
                onPress={() => {
                  setRole('ROLE_CUIDADOR');
                  if (fieldErrors.role) setFieldErrors((prev) => ({ ...prev, role: null }));
                }}
                activeOpacity={0.8}
              >
                <Feather
                  name="activity"
                  size={18}
                  color={role === 'ROLE_CUIDADOR' ? colors.primary : colors.subtitle}
                />
                <Text
                  style={[
                    styles.roleText,
                    {
                      color:
                        role === 'ROLE_CUIDADOR' ? colors.roleActiveText : colors.roleInactiveText,
                      fontWeight: role === 'ROLE_CUIDADOR' ? '700' : '500',
                    },
                  ]}
                >
                  Cuidador
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.roleCard,
                  {
                    backgroundColor:
                      role === 'ROLE_IDOSO' ? colors.roleActiveBg : colors.roleInactiveBg,
                    borderColor:
                      role === 'ROLE_IDOSO' ? colors.roleActiveBorder : colors.roleInactiveBorder,
                  },
                ]}
                onPress={() => {
                  setRole('ROLE_IDOSO');
                  if (fieldErrors.role) setFieldErrors((prev) => ({ ...prev, role: null }));
                }}
                activeOpacity={0.8}
              >
                <Feather
                  name="smile"
                  size={18}
                  color={role === 'ROLE_IDOSO' ? colors.primary : colors.subtitle}
                />
                <Text
                  style={[
                    styles.roleText,
                    {
                      color:
                        role === 'ROLE_IDOSO' ? colors.roleActiveText : colors.roleInactiveText,
                      fontWeight: role === 'ROLE_IDOSO' ? '700' : '500',
                    },
                  ]}
                >
                  Idoso
                </Text>
              </TouchableOpacity>
            </View>
            {fieldErrors.role ? (
              <Text style={styles.fieldErrorText}>{fieldErrors.role}</Text>
            ) : null}
          </View>

          {/* Field: Senha */}
          <View style={[styles.inputGroup, { marginTop: 14 }]}>
            <View style={styles.labelRow}>
              <Feather name="lock" size={15} color={colors.labelIcon} />
              <Text style={[styles.labelText, { color: colors.label }]}>Senha</Text>
            </View>
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: fieldErrors.password
                    ? '#f87171'
                    : focusedField === 'password'
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
                  if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: null }));
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
            {fieldErrors.password ? (
              <Text style={styles.fieldErrorText}>{fieldErrors.password}</Text>
            ) : null}
          </View>

          {/* Field: Confirmar senha */}
          <View style={[styles.inputGroup, { marginTop: 14 }]}>
            <View style={styles.labelRow}>
              <Feather name="lock" size={15} color={colors.labelIcon} />
              <Text style={[styles.labelText, { color: colors.label }]}>Confirmar senha</Text>
            </View>
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: fieldErrors.confirmPassword
                    ? '#f87171'
                    : focusedField === 'confirmPassword'
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
                  if (fieldErrors.confirmPassword) {
                    setFieldErrors((prev) => ({ ...prev, confirmPassword: null }));
                  }
                }}
                onFocus={() => setFocusedField('confirmPassword')}
                onBlur={() => setFocusedField(null)}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
            </View>
            {fieldErrors.confirmPassword ? (
              <Text style={styles.fieldErrorText}>{fieldErrors.confirmPassword}</Text>
            ) : null}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.submitButtonContainer}
            onPress={handleSubmit}
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
                  <Text style={styles.submitButtonText}>Registrando...</Text>
                </View>
              ) : (
                <Text style={styles.submitButtonText}>Registrar</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Footer: Já tem conta? Faça login */}
          <View style={styles.loginFooter}>
            <Text style={[styles.loginPrompt, { color: colors.footerText }]}>
              Já tem uma conta?{' '}
            </Text>
            <TouchableOpacity onPress={goToLogin} activeOpacity={0.7}>
              <Text style={[styles.loginLink, { color: colors.link }]}>Faça login</Text>
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
    paddingVertical: 28,
  },
  card: {
    width: '100%',
    maxWidth: 430,
    borderRadius: 24,
    paddingHorizontal: 26,
    paddingVertical: 28,
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
  title: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
    gap: 10,
  },
  errorIcon: {
    marginRight: 2,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
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
  fieldErrorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
    marginLeft: 4,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  roleCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  roleText: {
    fontSize: 15,
  },
  submitButtonContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 22,
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
  loginFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  loginPrompt: {
    fontSize: 14,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});

