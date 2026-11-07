import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { storage } from '../utils/storage';

/**
 * Detecta dinamicamente a URL base do backend de acordo com a plataforma:
 * 1. EXPO_PUBLIC_API_URL configurado nas variáveis de ambiente
 * 2. Web: http://localhost:8080 (ou o hostname atual na porta 8080)
 * 3. Mobile físico (Expo Go na mesma rede Wi-Fi): IP do host via expoConfig.hostUri
 * 4. Emulador Android: 10.0.2.2:8080
 * 5. Simulador iOS: localhost:8080
 */
export const getApiBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL.replace(/\/+$/, '');
  }

  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.location?.hostname) {
      return `http://${window.location.hostname}:8080`;
    }
    return 'http://localhost:8080';
  }

  const hostUri = Constants.expoConfig?.hostUri || Constants.manifest2?.extra?.expoClient?.hostUri;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
      return `http://${ip}:8080`;
    }
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8080';
  }

  return 'http://localhost:8080';
};

// eslint-disable-next-line import/no-named-as-default-member
const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Interceptor de requisições: anexa token Bearer do storage seguro
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await storage.getItem('token');
      if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (_err) {}
    return config;
  },
  (error) => Promise.reject(error)
);

// Limpa mensagens formatadas no padrão Spring Boot ("400 BAD_REQUEST \"...\"")
const cleanErrorMessage = (raw) => {
  if (typeof raw !== 'string') return raw;
  let text = raw.trim();
  // Remove prefixos como 400 BAD_REQUEST " ou 409 CONFLICT "
  text = text.replace(/^\d+\s+[A-Z_]+\s*"?/, '');
  // Remove aspas no final
  text = text.replace(/"$/, '').trim();
  return text;
};

// Interceptor de respostas: formata mensagens amigáveis de erro do backend
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let friendlyMessage = 'Falha na comunicação com o servidor.';
    if (error.response?.data) {
      const data = error.response.data;
      const raw = data.detail || data.message || data.erro || data.error;
      if (raw) {
        friendlyMessage = cleanErrorMessage(raw);
      }
    } else if (error.message?.includes('Network Error')) {
      friendlyMessage = 'Servidor inacessível. Verifique se o backend está rodando na porta 8080.';
    } else if (error.code === 'ECONNABORTED') {
      friendlyMessage = 'Tempo limite de conexão esgotado. Tente novamente.';
    }
    error.friendlyMessage = friendlyMessage;
    return Promise.reject(error);
  }
);

/**
 * Endpoints públicos baseados em PublicController.java
 * GET / e GET /health
 */
export const publicService = {
  checkStatus: async () => {
    const response = await api.get('/');
    return response.data;
  },
  checkHealth: async () => {
    const response = await api.get('/health');
    return response.data;
  },
};

/**
 * Endpoints de autenticação baseados em AuthController.java
 * POST /api/v1/auth/login, POST /api/v1/auth/register, GET /api/v1/auth/conta
 */
export const authService = {
  login: async ({ email, senha }) => {
    let response;
    try {
      response = await api.post('/api/v1/auth/login', { email, senha });
    } catch (err) {
      if (err.response?.status === 404) {
        response = await api.post('/auth/login', { email, senha });
      } else {
        throw err;
      }
    }
    return response.data;
  },
  register: async (userData) => {
    let response;
    try {
      response = await api.post('/api/v1/auth/register', userData);
    } catch (err) {
      if (err.response?.status === 404) {
        response = await api.post('/auth/register', userData);
      } else {
        throw err;
      }
    }
    return response.data;
  },
  getConta: async (customToken) => {
    const headers = customToken ? { Authorization: `Bearer ${customToken}` } : {};
    const response = await api.get('/api/v1/auth/conta', { headers });
    return response.data;
  },
};

/**
 * Endpoints de recuperação de senha baseados em ResetSenhaController.java
 * POST /api/v1/reset-senha/solicitar, POST /api/v1/reset-senha/resetar
 */
export const resetPasswordService = {
  requestReset: async (email) => {
    const response = await api.post('/api/v1/reset-senha/solicitar', { email });
    return response.data;
  },
  resetPassword: async (token, novaSenha) => {
    const response = await api.post('/api/v1/reset-senha/resetar', {
      token,
      novaSenha,
    });
    return response.data;
  },
};

const requireIdentifier = (value, label = 'CPF do idoso') => {
  const identifier = String(value || '').replace(/\D/g, '');
  if (!identifier) {
    throw new Error(`${label} é obrigatório para esta operação.`);
  }
  return identifier;
};

const responseData = (response) => response.data;

export const elderlyService = {
  getCurrent: async () => responseData(await api.get('/api/v1/idoso/informacoesIdoso')),
  getByCpf: async (cpf) =>
    responseData(await api.get(`/api/v1/idoso/${requireIdentifier(cpf)}`)),
  listByCaregiverCpf: async (cpf) =>
    responseData(await api.get(`/api/v1/idoso/cuidador/${requireIdentifier(cpf, 'CPF do cuidador')}`)),
  create: async (payload) => responseData(await api.post('/api/v1/idoso', payload)),
  update: async (cpf, payload) =>
    responseData(await api.put(`/api/v1/idoso/${requireIdentifier(cpf)}`, payload)),
  unlinkCaregiver: async (cpf) =>
    responseData(await api.delete(`/api/v1/idoso/${requireIdentifier(cpf)}/cuidador`)),
  requestLink: async (idosoCpf, mensagem) =>
    responseData(
      await api.post('/api/v1/vinculos/solicitacoes', {
        idosoCpf: requireIdentifier(idosoCpf),
        mensagem,
      }),
    ),
  listLinkRequests: async () =>
    responseData(await api.get('/api/v1/vinculos/solicitacoes')),
  respondLinkRequest: async (solicitacaoId, acao) =>
    responseData(
      await api.post(`/api/v1/vinculos/solicitacoes/${solicitacaoId}/responder`, { acao }),
    ),
};

export const caregiverService = {
  list: async () => responseData(await api.get('/api/v1/cuidador')),
  getByCpf: async (cpf) =>
    responseData(await api.get(`/api/v1/cuidador/${requireIdentifier(cpf, 'CPF do cuidador')}`)),
  create: async (payload) => responseData(await api.post('/api/v1/cuidador', payload)),
  update: async (cpf, payload) =>
    responseData(
      await api.put(`/api/v1/cuidador/${requireIdentifier(cpf, 'CPF do cuidador')}`, payload),
    ),
  remove: async (cpf) =>
    responseData(await api.delete(`/api/v1/cuidador/${requireIdentifier(cpf, 'CPF do cuidador')}`)),
};

export const eventService = {
  list: async (idosoCpf) =>
    responseData(await api.get(`/api/v1/idosos/${requireIdentifier(idosoCpf)}/eventos`)),
  listToday: async (idosoCpf) =>
    responseData(await api.get(`/api/v1/idosos/${requireIdentifier(idosoCpf)}/eventos/hoje`)),
  create: async (idosoCpf, payload) =>
    responseData(
      await api.post(`/api/v1/idosos/${requireIdentifier(idosoCpf)}/eventos`, payload),
    ),
  update: async (eventId, payload) =>
    responseData(await api.put(`/api/v1/eventos/${encodeURIComponent(eventId)}`, payload)),
  updateStatus: async (eventId, status) =>
    responseData(
      await api.patch(`/api/v1/eventos/${encodeURIComponent(eventId)}/status`, { status }),
    ),
  remove: async (eventId) =>
    responseData(await api.delete(`/api/v1/eventos/${encodeURIComponent(eventId)}`)),
};

export const medicationService = {
  list: async (idosoCpf) =>
    responseData(await api.get(`/api/v1/idosos/${requireIdentifier(idosoCpf)}/medicamentos`)),
  create: async (idosoCpf, payload) =>
    responseData(
      await api.post(`/api/v1/idosos/${requireIdentifier(idosoCpf)}/medicamentos`, payload),
    ),
  update: async (medicationId, payload) =>
    responseData(
      await api.put(`/api/v1/medicamentos/${encodeURIComponent(medicationId)}`, payload),
    ),
  remove: async (medicationId) =>
    responseData(await api.delete(`/api/v1/medicamentos/${encodeURIComponent(medicationId)}`)),
};

export const emergencyContactService = {
  list: async (idosoCpf) =>
    responseData(
      await api.get(
        `/api/v1/idosos/${requireIdentifier(idosoCpf)}/contatos-emergencia`,
      ),
    ),
  create: async (idosoCpf, payload) =>
    responseData(
      await api.post(
        `/api/v1/idosos/${requireIdentifier(idosoCpf)}/contatos-emergencia`,
        payload,
      ),
    ),
  update: async (idosoCpf, contactId, payload) =>
    responseData(
      await api.put(
        `/api/v1/idosos/${requireIdentifier(idosoCpf)}/contatos-emergencia/${encodeURIComponent(contactId)}`,
        payload,
      ),
    ),
  remove: async (idosoCpf, contactId) =>
    responseData(
      await api.delete(
        `/api/v1/idosos/${requireIdentifier(idosoCpf)}/contatos-emergencia/${encodeURIComponent(contactId)}`,
      ),
    ),
};

export const messageService = {
  listForElderly: async (identifier) => {
    if (!identifier) throw new Error('Identificador do idoso é obrigatório.');
    const target = typeof identifier === 'object' ? identifier : { cpf: identifier };
    const params = {};
    if (target.cpf) params.idosoCpf = requireIdentifier(target.cpf);
    else if (target.id != null && target.id !== '') params.idosoId = String(target.id);
    else throw new Error('Informe o CPF ou ID do idoso.');
    return responseData(await api.get('/api/v1/mensagens', { params }));
  },
  send: async (identifier, payload) => {
    if (!identifier) throw new Error('Identificador do idoso é obrigatório.');
    const target = typeof identifier === 'object' ? identifier : { cpf: identifier };
    const request = { ...payload };
    if (target.cpf) request.idosoCpf = requireIdentifier(target.cpf);
    if (target.id != null && target.id !== '') request.idosoId = String(target.id);
    return responseData(await api.post('/api/v1/mensagens', request));
  },
};

export const whatsappService = {
  send: async (phone, message) =>
    responseData(await api.post('/api/whatsapp/send', { phone, message })),
};

export default api;