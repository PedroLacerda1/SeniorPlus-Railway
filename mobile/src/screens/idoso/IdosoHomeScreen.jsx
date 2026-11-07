import React, { useState, useEffect, useCallback, useContext } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthContext } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import {
  elderlyService,
  medicationService,
  eventService,
  emergencyContactService,
} from '../../services/api';
import { storage } from '../../utils/storage';

import IdosoHeader from './components/IdosoHeader';
import NextMedicationHeroCard from './components/NextMedicationHeroCard';
import NextEventCard from './components/NextEventCard';
import IdosoQuickActions from './components/IdosoQuickActions';
import IdosoProfileCard from './components/IdosoProfileCard';
import IdosoMedicationsModal from './components/IdosoMedicationsModal';
import IdosoEventsModal from './components/IdosoEventsModal';
import IdosoRequestsModal from './components/IdosoRequestsModal';
import IdosoEmergencyModal from './components/IdosoEmergencyModal';
import AccessibilityModal from './components/AccessibilityModal';

const FONT_SCALE_KEY = 'seniorplus_idoso_font_scale';

export default function IdosoHomeScreen() {
  const { user, logout } = useContext(AuthContext);
  const { colors, darkMode } = useTheme();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fontScale, setFontScale] = useState(1.0);

  // Dados do backend
  const [elderly, setElderly] = useState(null);
  const [medications, setMedications] = useState([]);
  const [events, setEvents] = useState([]);
  const [requests, setRequests] = useState([]);
  const [contacts, setContacts] = useState([]);

  // Doses tomadas hoje: { [slotKey]: boolean }
  const [takenSlots, setTakenSlots] = useState({});

  // Modais
  const [medicationsModalVisible, setMedicationsModalVisible] = useState(false);
  const [eventsModalVisible, setEventsModalVisible] = useState(false);
  const [requestsModalVisible, setRequestsModalVisible] = useState(false);
  const [emergencyModalVisible, setEmergencyModalVisible] = useState(false);
  const [accessibilityModalVisible, setAccessibilityModalVisible] = useState(false);

  const todayIso = new Date().toISOString().split('T')[0];
  const storageSlotsKey = `seniorplus_idoso_taken_${todayIso}`;

  // Carrega tamanho de fonte salvo e doses tomadas salvas
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const savedScale = await storage.getItem(FONT_SCALE_KEY);
        if (active && savedScale) {
          const parsed = parseFloat(savedScale);
          if (!Number.isNaN(parsed)) setFontScale(parsed);
        }

        const savedDoses = await storage.getItem(storageSlotsKey);
        if (active && savedDoses) {
          try {
            setTakenSlots(JSON.parse(savedDoses));
          } catch (_e) {}
        }
      } catch (err) {
        if (active) console.warn('Erro ao carregar preferências locais:', err);
      }
    })();

    return () => {
      active = false;
    };
  }, [storageSlotsKey]);

  // Altera e persiste tamanho de fonte
  const handleFontScaleChange = (scale) => {
    setFontScale(scale);
    storage.setItem(FONT_SCALE_KEY, String(scale)).catch(() => {});
  };

  // Alterna dose tomada/pendente e persiste
  const handleToggleTaken = (slotKey) => {
    setTakenSlots((prev) => {
      const updated = { ...prev, [slotKey]: !prev[slotKey] };
      storage.setItem(storageSlotsKey, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  };

  // Carregador central de dados do idoso
  const loadIdosoData = useCallback(async () => {
    try {
      // 1. Dados do idoso
      let currentElderly = null;
      try {
        currentElderly = await elderlyService.getCurrent();
      } catch (err) {
        console.warn('Idoso não encontrado via informacoesIdoso:', err.message);
      }

      setElderly(currentElderly);

      const effectiveCpf =
        currentElderly?.cpf || user?.cpf || user?.username || '';

      if (effectiveCpf) {
        const cleanCpf = String(effectiveCpf).replace(/\D/g, '');

        // 2. Medicamentos
        try {
          const medsData = await medicationService.list(cleanCpf);
          setMedications(Array.isArray(medsData) ? medsData : []);
        } catch (_err) {
          setMedications([]);
        }

        // 3. Eventos de hoje
        try {
          const eventsData = await eventService.listToday(cleanCpf);
          setEvents(Array.isArray(eventsData) ? eventsData : []);
        } catch (_err) {
          try {
            const allEvents = await eventService.list(cleanCpf);
            setEvents(Array.isArray(allEvents) ? allEvents : []);
          } catch (_e) {
            setEvents([]);
          }
        }

        // 4. Contatos de emergência
        try {
          const contactsData = await emergencyContactService.list(cleanCpf);
          setContacts(Array.isArray(contactsData) ? contactsData : []);
        } catch (_err) {
          setContacts([]);
        }
      }

      // 5. Solicitações de vínculo de cuidadores
      try {
        const reqData = await elderlyService.listLinkRequests();
        setRequests(Array.isArray(reqData) ? reqData : []);
      } catch (_err) {
        setRequests([]);
      }
    } catch (error) {
      console.error('Erro ao carregar dados da tela do idoso:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  // Carga inicial
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        await loadIdosoData();
      } catch (err) {
        if (active) console.error('Erro no loadIdosoData:', err);
      }
    })();

    return () => {
      active = false;
    };
  }, [loadIdosoData]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadIdosoData();
  };

  // Alterna status do evento (Pendente / Concluído)
  const handleToggleEventStatus = async (event) => {
    if (!event?.id) return;
    const currentStatus = (event.status || 'PENDENTE').toUpperCase();
    const newStatus = currentStatus === 'CONCLUIDO' ? 'PENDENTE' : 'CONCLUIDO';

    // Atualização otimista
    setEvents((prev) =>
      prev.map((e) => (e.id === event.id ? { ...e, status: newStatus } : e)),
    );

    try {
      await eventService.updateStatus(event.id, newStatus);
    } catch (err) {
      // Reverte em caso de falha
      setEvents((prev) =>
        prev.map((e) => (e.id === event.id ? { ...e, status: currentStatus } : e)),
      );
      Alert.alert('Erro', err.friendlyMessage || 'Não foi possível atualizar o compromisso.');
    }
  };

  // Contagem de solicitações pendentes
  const pendingRequestsCount = requests.filter(
    (r) =>
      (r.status || '').toUpperCase() === 'PENDING' ||
      (r.status || '').toUpperCase() === 'PENDENTE',
  ).length;

  const idosoCpf = elderly?.cpf || user?.cpf || '';

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text, fontSize: 16 * fontScale }]}>
          Carregando sua rotina...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar style={darkMode ? 'light' : 'dark'} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Cabeçalho do Idoso com Relógio, Data e Controles */}
        <IdosoHeader
          userName={elderly?.nome || user?.nome || 'Idoso'}
          onOpenAccessibility={() => setAccessibilityModalVisible(true)}
          onLogout={logout}
          fontScale={fontScale}
        />

        {/* Card Destaque: Próximo Medicamento */}
        <NextMedicationHeroCard
          medications={medications}
          takenSlots={takenSlots}
          onToggleTaken={handleToggleTaken}
          onOpenAllMedications={() => setMedicationsModalVisible(true)}
          fontScale={fontScale}
        />

        {/* Card Destaque: Próximo Evento / Agenda */}
        <NextEventCard
          events={events}
          onToggleStatus={handleToggleEventStatus}
          onOpenAllEvents={() => setEventsModalVisible(true)}
          fontScale={fontScale}
        />

        {/* Ações Rápidas com Botão de Emergência SOS */}
        <IdosoQuickActions
          pendingRequestsCount={pendingRequestsCount}
          onOpenMedications={() => setMedicationsModalVisible(true)}
          onOpenEvents={() => setEventsModalVisible(true)}
          onOpenRequests={() => setRequestsModalVisible(true)}
          onOpenProfile={() => {
            // Rola até o perfil de saúde
          }}
          onOpenEmergency={() => setEmergencyModalVisible(true)}
          fontScale={fontScale}
        />

        {/* Dados de Saúde e Cuidadores Vinculados */}
        <IdosoProfileCard
          elderly={elderly}
          fontScale={fontScale}
        />

        {/* Espaçamento para o botão flutuante */}
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Botão Flutuante de Emergência SOS */}
      <TouchableOpacity
        style={styles.floatingSos}
        onPress={() => setEmergencyModalVisible(true)}
        accessibilityRole="button"
        accessibilityLabel="Botão de Emergência SOS"
      >
        <MaterialCommunityIcons name="alarm-light" size={28} color="#ffffff" />
        <Text style={styles.floatingSosText}>SOS</Text>
      </TouchableOpacity>

      {/* Modal: Medicamentos Completos */}
      <IdosoMedicationsModal
        visible={medicationsModalVisible}
        onClose={() => setMedicationsModalVisible(false)}
        medications={medications}
        takenSlots={takenSlots}
        onToggleTaken={handleToggleTaken}
        fontScale={fontScale}
      />

      {/* Modal: Agenda Completa */}
      <IdosoEventsModal
        visible={eventsModalVisible}
        onClose={() => setEventsModalVisible(false)}
        events={events}
        onToggleStatus={handleToggleEventStatus}
        fontScale={fontScale}
      />

      {/* Modal: Solicitações de Cuidadores */}
      <IdosoRequestsModal
        visible={requestsModalVisible}
        onClose={() => setRequestsModalVisible(false)}
        requests={requests}
        onRefreshRequests={loadIdosoData}
        fontScale={fontScale}
      />

      {/* Modal: Emergência SOS com SAMU e Contatos */}
      <IdosoEmergencyModal
        visible={emergencyModalVisible}
        onClose={() => setEmergencyModalVisible(false)}
        idosoCpf={idosoCpf}
        contacts={contacts}
        onRefreshContacts={loadIdosoData}
        fontScale={fontScale}
      />

      {/* Modal: Preferências de Acessibilidade */}
      <AccessibilityModal
        visible={accessibilityModalVisible}
        onClose={() => setAccessibilityModalVisible(false)}
        fontScale={fontScale}
        onChangeFontScale={handleFontScaleChange}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontWeight: '700',
  },
  floatingSos: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    backgroundColor: '#dc2626',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 30,
    shadowColor: '#dc2626',
    shadowOpacity: 0.45,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 6,
  },
  floatingSosText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
