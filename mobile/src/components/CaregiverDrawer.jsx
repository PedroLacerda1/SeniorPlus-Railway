import React, { useContext, useMemo } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { AuthContext } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const menuItems = [
  { title: 'Início', icon: 'home' },
  { title: 'Atualizar Dados do Idoso', icon: 'user' },
  { title: 'Medicamentos', icon: 'activity' },
  { title: 'Registrar Eventos', icon: 'calendar' },
  { title: 'Agenda', icon: 'calendar' },
  { title: 'Relatórios', icon: 'file-text' },
  { title: 'Emergência', icon: 'alert-triangle', danger: true },
  { title: 'Chat', icon: 'message-circle' },
  { title: 'Configurações', icon: 'settings' },
];

function getInitials(name) {
  const words = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return 'U';
  return words.length === 1
    ? words[0].slice(0, 2).toUpperCase()
    : `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
}

export default function CaregiverDrawer({ visible, onClose, onSelect, displayName }) {
  const { user, logout } = useContext(AuthContext);
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const name =
    displayName || user?.name || user?.nome || user?.fullName || user?.username || 'Usuário';

  const handleSelect = (title) => {
    onClose();
    if (title !== 'Início') onSelect(title);
  };

  const handleLogout = async () => {
    onClose();
    await logout();
  };

  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <View style={styles.overlay}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fechar menu"
          onPress={onClose}
          style={styles.backdrop}
        />
        <View style={styles.drawer}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Menu</Text>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Fechar menu"
              onPress={onClose}
              style={styles.closeButton}
            >
              <Feather name="x" size={22} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.userCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials(name)}</Text>
            </View>
            <View style={styles.userDetails}>
              <Text numberOfLines={1} style={styles.userName}>{name}</Text>
              <Text style={styles.userRole}>Cuidador</Text>
            </View>
          </View>

          <ScrollView
            contentContainerStyle={styles.menuContent}
            showsVerticalScrollIndicator={false}
          >
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.title}
                accessibilityRole="button"
                onPress={() => handleSelect(item.title)}
                style={styles.menuItem}
              >
                <Feather
                  name={item.icon}
                  size={19}
                  color={item.danger ? colors.errorText : colors.subtitle}
                />
                <Text style={[styles.menuLabel, item.danger && styles.dangerLabel]}>
                  {item.title}
                </Text>
                <Feather name="chevron-right" size={17} color={colors.subtitle} />
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity
            accessibilityRole="button"
            onPress={handleLogout}
            style={styles.logoutItem}
          >
            <Feather name="log-out" size={19} color={colors.errorText} />
            <Text style={styles.dangerLabel}>Sair</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(8, 15, 25, 0.55)',
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
    },
    drawer: {
      width: '84%',
      maxWidth: 360,
      height: '100%',
      paddingTop: 52,
      paddingHorizontal: 20,
      paddingBottom: 20,
      backgroundColor: colors.background,
      borderTopLeftRadius: 24,
      borderBottomLeftRadius: 24,
      borderLeftWidth: 1,
      borderColor: colors.cardBorder,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 22,
    },
    headerTitle: {
      color: colors.text,
      fontSize: 22,
      fontWeight: '800',
    },
    closeButton: {
      width: 40,
      height: 40,
      borderRadius: 13,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.cardBackground,
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },
    userCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 15,
      marginBottom: 15,
      borderRadius: 18,
      backgroundColor: colors.cardBackground,
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },
    avatar: {
      width: 46,
      height: 46,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.roleActiveBg,
    },
    avatarText: {
      color: colors.primary,
      fontSize: 15,
      fontWeight: '800',
    },
    userDetails: {
      flex: 1,
    },
    userName: {
      color: colors.text,
      fontSize: 15,
      fontWeight: '700',
    },
    userRole: {
      color: colors.subtitle,
      fontSize: 12,
      marginTop: 4,
    },
    menuContent: {
      gap: 5,
      paddingBottom: 12,
    },
    menuItem: {
      minHeight: 49,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 13,
      paddingHorizontal: 11,
      borderRadius: 13,
    },
    menuLabel: {
      flex: 1,
      color: colors.text,
      fontSize: 14,
      fontWeight: '600',
    },
    dangerLabel: {
      flex: 1,
      color: colors.errorText,
      fontSize: 14,
      fontWeight: '700',
    },
    logoutItem: {
      minHeight: 52,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 13,
      paddingHorizontal: 11,
      borderTopWidth: 1,
      borderTopColor: colors.dividerLine,
    },
  });
}
