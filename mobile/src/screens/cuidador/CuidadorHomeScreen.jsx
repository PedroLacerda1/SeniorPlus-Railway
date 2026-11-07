import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import { useFonts, DancingScript_700Bold } from '@expo-google-fonts/dancing-script';
import { AuthContext } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import ThemeToggle from '../../components/ThemeToggle';
import CaregiverDrawer from '../../components/CaregiverDrawer';
import ConfiguracoesScreen from './ConfiguracoesScreen';

// Modular Components
import DashboardHighlightsCard from './components/DashboardHighlightsCard';
import ElderlyProfileCard from './components/ElderlyProfileCard';
import TodayMedicationsCard from './components/TodayMedicationsCard';
import TodayEventsCard from './components/TodayEventsCard';
import QuickActionGrid from './components/QuickActionGrid';
import EmergencyModal from './components/EmergencyModal';
import AddEventModal from './components/AddEventModal';
import AddMedicationModal from './components/AddMedicationModal';
import EditElderlyModal from './components/EditElderlyModal';

import {
  elderlyService,
  eventService,
  medicationService,
  emergencyContactService,
} from '../../services/api';
import { storage } from '../../utils/storage';

const CAREGIVER_PROFILE_KEY = 'caregiverProfile';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

export default function CuidadorHomeScreen() {
  const { user } = useContext(AuthContext);
  const { colors, darkMode } = useTheme();

  // Data states
  const [elderly, setElderly] = useState(null);
  const [events, setEvents] = useState([]);
  const [medications, setMedications] = useState([]);
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [caregiverProfile, setCaregiverProfile] = useState(null);

  // UI / Loading states
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [activeScreen, setActiveScreen] = useState('dashboard');

  // Modals
  const [emergencyModalVisible, setEmergencyModalVisible] = useState(false);
  const [addEventModalVisible, setAddEventModalVisible] = useState(false);
  const [addMedModalVisible, setAddMedModalVisible] = useState(false);
  const [editElderlyModalVisible, setEditElderlyModalVisible] = useState(false);

  const [fontsLoaded] = useFonts({ DancingScript_700Bold });

  const accountName =
    user?.nome || user?.name || user?.fullName || user?.username || 'Cuidador';
  const caregiverName = caregiverProfile?.displayName || accountName;

  // Carrega todas as informações vinculadas ao idoso
  const loadDashboardData = useCallback(async () => {
    try {
      // 1. Dados do idoso vinculado
      let elderlyData = null;
      try {
        elderlyData = await elderlyService.getCurrent();
      } catch (err) {
        console.warn('Idoso não encontrado ou sem vínculo:', err.message);
      }
      setElderly(elderlyData);

      if (elderlyData?.cpf) {
        const cpf = elderlyData.cpf;

        // 2. Eventos do dia
        try {
          const eventsData = await eventService.listToday(cpf);
          setEvents(Array.isArray(eventsData) ? eventsData : []);
        } catch (_err) {
          try {
            const allEvents = await eventService.list(cpf);
            setEvents(Array.isArray(allEvents) ? allEvents : []);
          } catch (_e) {
            setEvents([]);
          }
        }

        // 3. Medicamentos
        try {
          const medsData = await medicationService.list(cpf);
          setMedications(Array.isArray(medsData) ? medsData : []);
        } catch (_err) {
          setMedications([]);
        }

        // 4. Contatos de Emergência
        try {
          const contactsData = await emergencyContactService.list(cpf);
          setEmergencyContacts(Array.isArray(contactsData) ? contactsData : []);
        } catch (_err) {
          setEmergencyContacts([]);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard do cuidador:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        await loadDashboardData();
      } catch (error) {
        if (active) {
          console.error('Erro no loadDashboardData:', error);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [loadDashboardData]);

  useEffect(() => {
    let active = true;
    storage.getItem(CAREGIVER_PROFILE_KEY).then((saved) => {
      if (!active || !saved) return;
      try {
        setCaregiverProfile(JSON.parse(saved));
      } catch (error) {
        console.error('Erro ao interpretar perfil local do cuidador:', error);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const handleToggleEventStatus = async (eventId, newStatus) => {
    try {
      const statusStr = newStatus ? 'CONCLUIDO' : 'PENDENTE';
      await eventService.updateStatus(eventId, statusStr);
      setEvents((prev) =>
        prev.map((ev) => (ev.id === eventId ? { ...ev, status: statusStr } : ev)),
      );
    } catch (err) {
      console.error('Erro ao alternar status do evento:', err);
    }
  };

  const handleActionPress = (actionId) => {
    switch (actionId) {
      case 'emergencia':
        setEmergencyModalVisible(true);
        break;
      case 'medicamentos':
        setAddMedModalVisible(true);
        break;
      case 'novo-evento':
      case 'agenda':
        setAddEventModalVisible(true);
        break;
      case 'atualizar-idoso':
        setEditElderlyModalVisible(true);
        break;
      case 'configuracoes':
        setActiveScreen('settings');
        break;
      default:
        break;
    }
  };

  const handleMenuSelect = (item) => {
    if (item === 'Configurações') {
      setActiveScreen('settings');
      return;
    }
    if (item === 'Emergência') {
      setEmergencyModalVisible(true);
      return;
    }
    if (item === 'Atualizar Dados do Idoso') {
      setEditElderlyModalVisible(true);
      return;
    }
    if (item === 'Medicamentos') {
      setAddMedModalVisible(true);
      return;
    }
    if (item === 'Registrar Eventos' || item === 'Agenda') {
      setAddEventModalVisible(true);
    }
  };

  const styles = useMemo(() => createStyles(colors), [colors]);

  if (activeScreen === 'settings') {
    return (
      <ConfiguracoesScreen
        onBack={() => setActiveScreen('dashboard')}
        onProfileUpdated={setCaregiverProfile}
      />
    );
  }

  // Estatísticas calculadas
  const pendingEventsCount = events.filter(
    (ev) => ev.status !== 'CONCLUIDO' && ev.status !== 'Concluído',
  ).length;

  return (
    <View style={styles.screen}>
      <StatusBar style={darkMode ? 'light' : 'dark'} />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header Bar */}
        <View style={styles.topBar}>
          <View style={styles.brandGroup}>
            <View style={styles.logoRow}>
              <Feather name="heart" size={24} color={colors.primary} />
              <Text
                style={[
                  styles.brand,
                  { color: colors.primary },
                  fontsLoaded && { fontFamily: 'DancingScript_700Bold' },
                ]}
              >
                Senior+
              </Text>
            </View>
            <Text style={[styles.roleLabel, { color: colors.subtitle }]}>PAINEL DO CUIDADOR</Text>
          </View>

          <View style={styles.topActions}>
            <ThemeToggle />
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Abrir menu"
              onPress={() => setDrawerVisible(true)}
              style={[styles.iconButton, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }]}
            >
              <Feather name="menu" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Hero Greeting */}
        <View style={styles.hero}>
          <View style={styles.heroTopRow}>
            <Text style={[styles.greeting, { color: colors.subtitle }]}>{getGreeting()},</Text>
            <View style={[styles.modeBadge, { backgroundColor: colors.roleActiveBg, borderColor: colors.primary }]}>
              <Feather name="shield" size={12} color={colors.primary} />
              <Text style={[styles.modeBadgeText, { color: colors.primary }]}>Modo Cuidador</Text>
            </View>
          </View>
          <Text style={[styles.heroTitle, { color: colors.text }]}>
            {caregiverName}
          </Text>
          <Text style={[styles.heroSubtitle, { color: colors.subtitle }]}>
            Acompanhe o bem-estar e a rotina do idoso em tempo real.
          </Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.subtitle }]}>
              Sincronizando com o servidor...
            </Text>
          </View>
        ) : (
          <>
            {/* 1. Dashboard Highlights (Métricas) */}
            <DashboardHighlightsCard
              totalMeds={medications.length}
              pendingMeds={medications.length}
              totalEvents={events.length}
              pendingEvents={pendingEventsCount}
              emergencyCount={emergencyContacts.length}
            />

            {/* 2. Elderly Profile Card (Dados do Idoso) */}
            <ElderlyProfileCard
              elderly={elderly}
              onEditPress={() => setEditElderlyModalVisible(true)}
            />

            {/* 3. Today's Medications (Remédios de Hoje) */}
            <TodayMedicationsCard
              medications={medications}
              onAddMedication={() => setAddMedModalVisible(true)}
            />

            {/* 4. Today's Events (Compromissos de Hoje) */}
            <TodayEventsCard
              events={events}
              onToggleStatus={handleToggleEventStatus}
              onAddEvent={() => setAddEventModalVisible(true)}
            />

            {/* 5. Quick Access Grid (Atalhos) */}
            <QuickActionGrid onActionPress={handleActionPress} />
          </>
        )}
      </ScrollView>

      {/* Floating Emergency SOS Button */}
      <TouchableOpacity
        style={styles.floatingSosBtn}
        onPress={() => setEmergencyModalVisible(true)}
        activeOpacity={0.85}
        accessibilityLabel="Botão de emergência rápida"
      >
        <Feather name="phone-call" size={22} color="#ffffff" />
        <Text style={styles.floatingSosText}>SOS</Text>
      </TouchableOpacity>

      {/* Side Menu Drawer */}
      <CaregiverDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        onSelect={handleMenuSelect}
        displayName={caregiverName}
      />

      {/* Modals */}
      <EmergencyModal
        visible={emergencyModalVisible}
        onClose={() => setEmergencyModalVisible(false)}
        idosoCpf={elderly?.cpf}
        contacts={emergencyContacts}
        onRefreshContacts={loadDashboardData}
      />

      <AddEventModal
        visible={addEventModalVisible}
        onClose={() => setAddEventModalVisible(false)}
        idosoCpf={elderly?.cpf}
        onEventCreated={loadDashboardData}
      />

      <AddMedicationModal
        visible={addMedModalVisible}
        onClose={() => setAddMedModalVisible(false)}
        idosoCpf={elderly?.cpf}
        onMedicationCreated={loadDashboardData}
      />

      <EditElderlyModal
        visible={editElderlyModalVisible}
        onClose={() => setEditElderlyModalVisible(false)}
        elderly={elderly}
        onUpdated={() => loadDashboardData()}
      />
    </View>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      paddingHorizontal: 18,
      paddingTop: 50,
      paddingBottom: 90,
      gap: 18,
    },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    brandGroup: {
      gap: 2,
    },
    logoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    brand: {
      fontSize: 26,
      fontWeight: '700',
      letterSpacing: 0.5,
    },
    roleLabel: {
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 1,
    },
    topActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    iconButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    hero: {
      gap: 4,
    },
    heroTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    greeting: {
      fontSize: 14,
      fontWeight: '500',
    },
    modeBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 12,
      borderWidth: 1,
    },
    modeBadgeText: {
      fontSize: 11,
      fontWeight: '600',
    },
    heroTitle: {
      fontSize: 22,
      fontWeight: '800',
    },
    heroSubtitle: {
      fontSize: 13,
    },
    loadingContainer: {
      paddingVertical: 50,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
    },
    loadingText: {
      fontSize: 14,
    },
    floatingSosBtn: {
      position: 'absolute',
      bottom: 24,
      right: 20,
      height: 52,
      paddingHorizontal: 18,
      borderRadius: 26,
      backgroundColor: '#ef4444',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      elevation: 6,
      shadowColor: '#ef4444',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
    },
    floatingSosText: {
      color: '#ffffff',
      fontSize: 15,
      fontWeight: '800',
      letterSpacing: 0.5,
    },
  });
}
