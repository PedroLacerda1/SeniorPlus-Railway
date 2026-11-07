import React, { createContext, useState, useEffect } from 'react';
import { storage } from '../utils/storage';
import api, { authService, publicService, resetPasswordService } from '../services/api';

export const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [serverOnline, setServerOnline] = useState(null);

  useEffect(() => {
    async function initAuth() {
      // Checa saúde do backend via PublicController
      try {
        const health = await publicService.checkHealth();
        setServerOnline(health?.status === 'UP');
      } catch (_err) {
        setServerOnline(false);
      }

      // Checa dados e token salvos
      try {
        const storedToken = await storage.getItem('token');
        const storedUser = await storage.getItem('user');

        if (storedToken) {
          api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          // Tenta obter dados atualizados da conta pelo endpoint /api/v1/auth/conta
          try {
            const freshUser = await authService.getConta(storedToken);
            setUser(freshUser);
            await storage.setItem('user', JSON.stringify(freshUser));
          } catch (_contaErr) {
            if (storedUser) {
              setUser(JSON.parse(storedUser));
            }
          }
        }
      } catch (error) {
        console.error('Erro ao inicializar autenticação:', error);
      } finally {
        setLoading(false);
      }
    }

    initAuth();
  }, []);

  const login = async (email, senha) => {
    try {
      const authData = await authService.login({ email, senha });
      const { token } = authData || {};

      if (!token) {
        throw new Error('Token não retornado pelo servidor.');
      }

      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      await storage.setItem('token', token);

      let userData = { email };
      try {
        const freshUser = await authService.getConta(token);
        userData = freshUser;
      } catch (_err) {
        // Fallback se /conta falhar temporariamente
      }

      await storage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return { success: true, user: userData, role: userData.role };
    } catch (error) {
      console.error('Erro no login:', error);
      return {
        success: false,
        message:
          error.friendlyMessage ||
          error.response?.data?.erro ||
          error.response?.data?.message ||
          'Usuário ou senha inválidos.',
      };
    }
  };

  const register = async (userData) => {
    try {
      const authData = await authService.register(userData);
      let token = authData?.token;

      if (!token && userData.email && userData.senha) {
        try {
          const loginData = await authService.login({
            email: userData.email,
            senha: userData.senha,
          });
          token = loginData?.token;
        } catch (_loginErr) {}
      }

      let fullUser = {
        email: userData.email,
        nome: userData.nome,
        cpf: userData.cpf,
        role: userData.tipoUsuario === 'Cuidador' ? 'ROLE_CUIDADOR' : 'ROLE_IDOSO',
      };

      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        await storage.setItem('token', token);

        try {
          const freshUser = await authService.getConta(token);
          fullUser = freshUser;
        } catch (_err) {}

        await storage.setItem('user', JSON.stringify(fullUser));
        setUser(fullUser);
      }

      return { success: true, user: fullUser, role: fullUser.role };
    } catch (error) {
      console.error('Erro no registro:', error);
      const serverMsg = error.response?.data?.erro || error.response?.data?.message;
      let message = error.friendlyMessage || serverMsg || 'Falha ao registrar.';

      if (message.includes('CPF já cadastrado')) {
        message = 'Este CPF já está cadastrado no sistema.';
      } else if (message.includes('Email já cadastrado') || message.includes('E-mail já cadastrado')) {
        message = 'Este e-mail já está cadastrado no sistema.';
      }

      return {
        success: false,
        message,
      };
    }
  };

  const requestPasswordReset = async (email) => {
    try {
      await resetPasswordService.requestReset(email);
      return { success: true };
    } catch (error) {
      console.error('Erro na solicitação de reset:', error);
      return {
        success: false,
        message: error.friendlyMessage || 'Falha ao solicitar recuperação de senha.',
      };
    }
  };

  const confirmPasswordReset = async (token, novaSenha) => {
    try {
      await resetPasswordService.resetPassword(token, novaSenha);
      return { success: true };
    } catch (error) {
      console.error('Erro na redefinição de senha:', error);
      return {
        success: false,
        message: error.friendlyMessage || 'Falha ao redefinir senha. Verifique o código.',
      };
    }
  };

  const logout = async () => {
    await storage.deleteItem('token');
    await storage.deleteItem('user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        signed: !!user,
        user,
        loading,
        serverOnline,
        login,
        register,
        requestPasswordReset,
        confirmPasswordReset,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}