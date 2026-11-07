import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

export default function ThemeToggle({ style }) {
  const { darkMode, toggleDarkMode, colors } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: colors.themeToggleBg,
          borderColor: colors.themeToggleBorder,
        },
        style,
      ]}
      onPress={toggleDarkMode}
      activeOpacity={0.7}
      accessibilityLabel={darkMode ? 'Ativar modo claro' : 'Ativar modo escuro'}
    >
      <Feather
        name={darkMode ? 'sun' : 'moon'}
        size={20}
        color={darkMode ? '#f59e0b' : colors.primary}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
});

