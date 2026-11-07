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
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { useFonts, DancingScript_700Bold } from '@expo-google-fonts/dancing-script';
import { AuthContext } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import ThemeToggle from '../../components/ThemeToggle';

export default function LoginScreen({
  onNavigateToRegister,
  onNavigateToForgotPassword,
  navigation,
}) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useContext(AuthContext);
  const { colors, darkMode } = useTheme();

  const [fontsLoaded] = useFonts({
    DancingScript_700Bold,
  });

  const handleLogin = async () => {
    setError('');

    if (!email.trim() || !senha.trim()) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true);
    try {
      const result = await login(email.trim(), senha);
      setLoading(false);

      if (!result?.success) {
        setError(result?.message || 'Usuário ou senha inválidos.');
      }
    } catch (_err) {
      setLoading(false);
      setError('Erro ao conectar com o servidor.');
    }
  };

  const handleForgotPassword = () => {
    if (onNavigateToForgotPassword) {
      onNavigateToForgotPassword();
    } else if (navigation?.navigate) {
      navigation.navigate('ForgotPassword');
    }
  };

  const handleRegister = () => {
    if (onNavigateToRegister) {
      onNavigateToRegister();
    } else if (navigation?.navigate) {
      navigation.navigate('Register');
    }
  };

  const handleSocialLogin = (provider) => {
    Alert.alert('Login Social', `Login com ${provider} estará disponível em breve.`);
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
          {/* Top Bar with Theme Toggle */}
          <View style={styles.topBar}>
            <View style={{ width: 42 }} />
            <View style={styles.logoRow}>
              <Feather name="heart" size={30} color={colors.primary} style={styles.logoIcon} />
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
          <Text style={[styles.title, { color: colors.text }]}>Bem-vindo de volta</Text>
          <Text style={[styles.subtitle, { color: colors.subtitle }]}>
            Faça login para continuar
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

          {/* Email Group */}
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
                  borderColor: emailFocused ? colors.inputBorderFocused : colors.inputBorder,
                },
              ]}
            >
              <Feather
                name="mail"
                size={18}
                color={emailFocused ? colors.primary : colors.inputIcon}
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
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Password Group */}
          <View style={[styles.inputGroup, { marginTop: 16 }]}>
            <View style={styles.labelRow}>
              <Feather name="lock" size={15} color={colors.labelIcon} />
              <Text style={[styles.labelText, { color: colors.label }]}>Senha</Text>
            </View>
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: passwordFocused ? colors.inputBorderFocused : colors.inputBorder,
                },
              ]}
            >
              <Feather
                name="lock"
                size={18}
                color={passwordFocused ? colors.primary : colors.inputIcon}
                style={styles.inputInnerIcon}
              />
              <TextInput
                style={[styles.textInput, { color: colors.inputText }]}
                placeholder="••••••••"
                placeholderTextColor={colors.inputPlaceholder}
                value={senha}
                onChangeText={(text) => {
                  setSenha(text);
                  if (error) setError('');
                }}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Feather
                  name={showPassword ? 'eye' : 'eye-off'}
                  size={18}
                  color={showPassword ? colors.primary : colors.eyeIcon}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Options: Remember-me & Forgot Password */}
          <View style={styles.optionsRow}>
            <TouchableOpacity
              style={styles.rememberMeContainer}
              onPress={() => setRememberMe(!rememberMe)}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.checkbox,
                  {
                    borderColor: rememberMe ? colors.primary : colors.checkboxBorder,
                    backgroundColor: rememberMe ? colors.primary : 'transparent',
                  },
                ]}
              >
                {rememberMe && <Feather name="check" size={12} color="#ffffff" />}
              </View>
              <Text style={[styles.rememberMeText, { color: colors.checkboxText }]}>
                Lembrar-me
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleForgotPassword} activeOpacity={0.7}>
              <Text style={[styles.forgotPasswordText, { color: colors.link }]}>
                Esqueci a senha
              </Text>
            </TouchableOpacity>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.submitButtonContainer}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={loading ? ['#64748b', '#475569'] : colors.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.submitGradient}
            >
              {loading ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator color="#ffffff" size="small" />
                  <Text style={styles.submitButtonText}>Entrando...</Text>
                </View>
              ) : (
                <Text style={styles.submitButtonText}>Entrar</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Social Divider */}
          <View style={styles.dividerRow}>
            <View style={[styles.dividerLine, { backgroundColor: colors.dividerLine }]} />
            <Text style={[styles.dividerText, { color: colors.dividerText }]}>ou continue com</Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.dividerLine }]} />
          </View>

          {/* Social Buttons */}
          <View style={styles.socialRow}>
            <TouchableOpacity
              style={[
                styles.socialButton,
                {
                  backgroundColor: colors.socialBackground,
                  borderColor: colors.socialBorder,
                },
              ]}
              onPress={() => handleSocialLogin('Google')}
              activeOpacity={0.7}
            >
              <FontAwesome name="google" size={17} color={colors.socialText} />
              <Text style={[styles.socialButtonText, { color: colors.socialText }]}>Google</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.socialButton,
                {
                  backgroundColor: colors.socialBackground,
                  borderColor: colors.socialBorder,
                },
              ]}
              onPress={() => handleSocialLogin('Facebook')}
              activeOpacity={0.7}
            >
              <FontAwesome name="facebook" size={17} color={colors.socialText} />
              <Text style={[styles.socialButtonText, { color: colors.socialText }]}>Facebook</Text>
            </TouchableOpacity>
          </View>

          {/* Register Footer */}
          <View style={styles.registerFooter}>
            <Text style={[styles.registerPrompt, { color: colors.footerText }]}>
              Ainda não tem uma conta?{' '}
            </Text>
            <TouchableOpacity onPress={handleRegister} activeOpacity={0.7}>
              <Text style={[styles.registerLink, { color: colors.link }]}>Cadastre-se</Text>
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
    paddingVertical: 32,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 8,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  logoIcon: {
    marginRight: 4,
  },
  logoText: {
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 24,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 18,
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
    marginBottom: 8,
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
    height: 52,
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
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 22,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  rememberMeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '500',
  },
  submitButtonContainer: {
    borderRadius: 12,
    overflow: 'hidden',
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
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 26,
    marginBottom: 22,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 13,
    marginHorizontal: 12,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 12,
  },
  socialButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  socialButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  registerFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 26,
  },
  registerPrompt: {
    fontSize: 14,
  },
  registerLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});