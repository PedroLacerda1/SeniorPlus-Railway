import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../../contexts/ThemeContext';
import ThemeToggle from '../../../components/ThemeToggle';

const FONT_OPTIONS = [
  { label: 'Padrão (1x)', scale: 1.0, sub: 'Tamanho padrão de leitura' },
  { label: 'Grande (1.15x)', scale: 1.15, sub: 'Letras maiores e mais visíveis' },
  { label: 'Extra Grande (1.3x)', scale: 1.3, sub: 'Máxima legibilidade' },
];

export default function AccessibilityModal({
  visible,
  onClose,
  fontScale = 1.0,
  onChangeFontScale,
}) {
  const { colors } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.cardBackground,
              borderColor: colors.cardBorder,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View style={[styles.headerIconCircle, { backgroundColor: `${colors.primary}22` }]}>
                <Feather name="type" size={22} color={colors.primary} />
              </View>
              <Text style={[styles.title, { color: colors.text }]}>
                Acessibilidade Visual
              </Text>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeBtn, { backgroundColor: colors.background }]}
              accessibilityRole="button"
              accessibilityLabel="Fechar preferências"
            >
              <Feather name="x" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Theme Option */}
          <View style={[styles.sectionBox, { backgroundColor: colors.background, borderColor: colors.cardBorder }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.sectionLabel, { color: colors.text }]}>
                Contraste / Modo Escuro
              </Text>
              <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
                Alterne entre visual claro ou escuro com alto contraste
              </Text>
            </View>
            <ThemeToggle />
          </View>

          {/* Font Scaling Options */}
          <Text style={[styles.groupTitle, { color: colors.text }]}>
            Tamanho das Letras
          </Text>

          <View style={styles.fontOptionsList}>
            {FONT_OPTIONS.map((opt) => {
              const isSelected = Math.abs(fontScale - opt.scale) < 0.05;

              return (
                <TouchableOpacity
                  key={opt.scale}
                  style={[
                    styles.fontOptionCard,
                    {
                      backgroundColor: colors.background,
                      borderColor: isSelected ? colors.primary : colors.cardBorder,
                      borderWidth: isSelected ? 2 : 1,
                    },
                  ]}
                  onPress={() => onChangeFontScale(opt.scale)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={`Selecionar tamanho de texto ${opt.label}`}
                >
                  <View style={styles.radioRow}>
                    <View
                      style={[
                        styles.radioCircle,
                        {
                          borderColor: isSelected ? colors.primary : colors.textSecondary,
                          backgroundColor: isSelected ? colors.primary : 'transparent',
                        },
                      ]}
                    >
                      {isSelected ? <View style={styles.radioDot} /> : null}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.fontOptionLabel, { color: colors.text, fontSize: 16 * opt.scale }]}>
                        {opt.label}
                      </Text>
                      <Text style={[styles.fontOptionSub, { color: colors.textSecondary }]}>
                        {opt.sub}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Close */}
          <TouchableOpacity
            style={[styles.confirmBtn, { backgroundColor: colors.primary }]}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Concluir"
          >
            <Text style={styles.confirmBtnText}>Salvar Preferências</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  sectionSub: {
    fontSize: 12,
    marginTop: 2,
  },
  groupTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 10,
  },
  fontOptionsList: {
    gap: 10,
    marginBottom: 20,
  },
  fontOptionCard: {
    borderRadius: 14,
    padding: 14,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffffff',
  },
  fontOptionLabel: {
    fontWeight: '700',
  },
  fontOptionSub: {
    fontSize: 12,
    marginTop: 2,
  },
  confirmBtn: {
    minHeight: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
});

