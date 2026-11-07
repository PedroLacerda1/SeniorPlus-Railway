import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../../contexts/ThemeContext';
import ThemeToggle from '../../../components/ThemeToggle';

export default function IdosoHeader({
  userName = 'Amigo',
  onOpenAccessibility,
  onLogout,
  fontScale = 1,
}) {
  const { colors } = useTheme();
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      });
      const dateStr = now.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
      });
      setCurrentTime(timeStr);
      setCurrentDate(dateStr.charAt(0).toUpperCase() + dateStr.slice(1));
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogoutPress = () => {
    Alert.alert(
      'Sair da Conta',
      'Deseja realmente sair do aplicativo?',
      [
        { text: 'Não', style: 'cancel' },
        { text: 'Sim, Sair', style: 'destructive', onPress: onLogout },
      ],
      { cancelable: true },
    );
  };

  const firstName = (userName || 'Idoso').split(' ')[0];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.cardBackground,
          borderColor: colors.cardBorder,
        },
      ]}
    >
      {/* Top row: Clock, Date and controls */}
      <View style={styles.topRow}>
        <View style={styles.timeBox}>
          <Feather name="clock" size={18 * fontScale} color={colors.primary} />
          <Text style={[styles.timeText, { color: colors.text, fontSize: 18 * fontScale }]}>
            {currentTime || '--:--'}
          </Text>
        </View>

        <View style={styles.controlsRow}>
          <TouchableOpacity
            style={[styles.iconButton, { borderColor: colors.cardBorder, backgroundColor: colors.background }]}
            onPress={onOpenAccessibility}
            accessibilityRole="button"
            accessibilityLabel="Acessibilidade e tamanho do texto"
          >
            <Feather name="type" size={18} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.themeWrapper}>
            <ThemeToggle />
          </View>

          <TouchableOpacity
            style={[styles.iconButton, styles.logoutBtn, { borderColor: '#ef444433' }]}
            onPress={handleLogoutPress}
            accessibilityRole="button"
            accessibilityLabel="Sair do aplicativo"
          >
            <Feather name="log-out" size={18} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Date display */}
      <Text style={[styles.dateText, { color: colors.textSecondary, fontSize: 14 * fontScale }]}>
        {currentDate}
      </Text>

      {/* Welcoming Greeting */}
      <View style={styles.greetingBox}>
        <Text style={[styles.greetingTitle, { color: colors.text, fontSize: 24 * fontScale }]}>
          Olá, <Text style={{ color: colors.primary }}>{firstName}</Text>!
        </Text>
        <Text style={[styles.greetingSub, { color: colors.textSecondary, fontSize: 15 * fontScale }]}>
          Sua rotina e cuidados de hoje estão organizados abaixo.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  timeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeText: {
    fontWeight: '700',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeWrapper: {
    transform: [{ scale: 0.9 }],
  },
  logoutBtn: {
    backgroundColor: '#ef444415',
  },
  dateText: {
    fontWeight: '500',
    marginBottom: 12,
  },
  greetingBox: {
    marginTop: 4,
  },
  greetingTitle: {
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  greetingSub: {
    lineHeight: 22,
  },
});

