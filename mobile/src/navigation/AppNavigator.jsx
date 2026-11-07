import React, { useContext, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import CuidadorHomeScreen from '../screens/cuidador/CuidadorHomeScreen';
import IdosoHomeScreen from '../screens/idoso/IdosoHomeScreen';

export default function AppNavigator() {
  const { signed, loading, user } = useContext(AuthContext);
  const { colors } = useTheme();
  const [authScreen, setAuthScreen] = useState('LOGIN'); // 'LOGIN' | 'REGISTER' | 'FORGOT_PASSWORD'

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Se não estiver logado, alterna entre Login, Cadastro e Recuperação de Senha
  if (!signed) {
    const navigationMock = {
      navigate: (screen) => {
        if (screen === 'Register') setAuthScreen('REGISTER');
        if (screen === 'Login') setAuthScreen('LOGIN');
        if (screen === 'ForgotPassword') setAuthScreen('FORGOT_PASSWORD');
      },
    };

    if (authScreen === 'REGISTER') {
      return (
        <RegisterScreen
          onNavigateToLogin={() => setAuthScreen('LOGIN')}
          navigation={navigationMock}
        />
      );
    }

    if (authScreen === 'FORGOT_PASSWORD') {
      return (
        <ForgotPasswordScreen
          onNavigateToLogin={() => setAuthScreen('LOGIN')}
          navigation={navigationMock}
        />
      );
    }

    return (
      <LoginScreen
        onNavigateToRegister={() => setAuthScreen('REGISTER')}
        onNavigateToForgotPassword={() => setAuthScreen('FORGOT_PASSWORD')}
        navigation={navigationMock}
      />
    );
  }

  // Se estiver logado, direciona de acordo com o perfil/Role
  if (user?.role === 'ROLE_IDOSO' || user?.role === 'IDOSO') {
    return <IdosoHomeScreen />;
  }

  return <CuidadorHomeScreen />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
});