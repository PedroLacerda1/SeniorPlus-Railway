import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../../contexts/ThemeContext';

const formatCpf = (valor) => {
  if (!valor) return '--';
  const digits = String(valor).replace(/\D/g, '');
  if (digits.length !== 11) return valor;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
};

const maskCpf = (valor) => {
  const digits = String(valor || '').replace(/\D/g, '');
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.***-**`;
  }
  return '***.***.***-**';
};

const formatPhone = (valor) => {
  if (!valor) return '';
  const digits = String(valor).replace(/\D/g, '');
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return valor;
};

function getInitials(name) {
  const words = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return 'ID';
  return words.length === 1
    ? words[0].slice(0, 2).toUpperCase()
    : `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
}

function calculateAge(birthDate) {
  if (!birthDate) return null;
  const date = new Date(birthDate);
  if (Number.isNaN(date.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  if (
    today.getMonth() < date.getMonth() ||
    (today.getMonth() === date.getMonth() && today.getDate() < date.getDate())
  ) {
    age -= 1;
  }
  return age >= 0 ? age : null;
}

export default function ElderlyProfileCard({ elderly, onEditPress }) {
  const { colors, darkMode } = useTheme();
  const [cpfVisible, setCpfVisible] = useState(false);

  if (!elderly) {
    return (
      <View
        style={[
          styles.emptyCard,
          {
            backgroundColor: colors.cardBackground,
            borderColor: colors.cardBorder,
          },
        ]}
      >
        <Feather name="user-x" size={32} color={colors.subtitle} />
        <Text style={[styles.emptyTitle, { color: colors.text }]}>Nenhum idoso vinculado</Text>
        <Text style={[styles.emptySubtitle, { color: colors.subtitle }]}>
          Solicite o vínculo com o idoso para acompanhar o cuidado em tempo real.
        </Text>
      </View>
    );
  }

  const name = elderly.nome || 'Nome não informado';
  const age = elderly.idade ?? calculateAge(elderly.dataNascimento);
  const formattedCpf = cpfVisible
    ? formatCpf(elderly.cpf)
    : maskCpf(elderly.cpf);
  const phone = formatPhone(elderly.telefone);

  const allergiesRaw = Array.isArray(elderly.alergias)
    ? elderly.alergias
    : String(elderly.alergias || '')
        .split(',')
        .map((item) => item.trim());
  const allergyList = allergiesRaw.filter((item) => Boolean(item && item !== '-'));

  const handleCall = () => {
    if (elderly.telefone) {
      const cleanPhone = String(elderly.telefone).replace(/\D/g, '');
      Linking.openURL(`tel:${cleanPhone}`);
    }
  };

  return (
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
      {/* Top row: Avatar + Name + Edit button */}
      <View style={styles.headerRow}>
        <View style={[styles.avatar, { backgroundColor: colors.roleActiveBg, borderColor: colors.primary }]}>
          <Text style={[styles.avatarText, { color: colors.primary }]}>{getInitials(name)}</Text>
        </View>

        <View style={styles.headerInfo}>
          <Text numberOfLines={1} style={[styles.name, { color: colors.text }]}>{name}</Text>
          <View style={styles.cpfRow}>
            <Text style={[styles.cpfText, { color: colors.subtitle }]}>CPF: {formattedCpf}</Text>
            <TouchableOpacity
              onPress={() => setCpfVisible(!cpfVisible)}
              style={styles.cpfToggle}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Feather
                name={cpfVisible ? 'eye-off' : 'eye'}
                size={14}
                color={colors.primary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {onEditPress ? (
          <TouchableOpacity
            style={[styles.editButton, { backgroundColor: colors.roleInactiveBg, borderColor: colors.cardBorder }]}
            onPress={onEditPress}
            activeOpacity={0.7}
          >
            <Feather name="edit-2" size={15} color={colors.primary} />
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={[styles.divider, { backgroundColor: colors.dividerLine }]} />

      {/* Grid of Clinical Details */}
      <View style={styles.detailsGrid}>
        <View style={styles.detailItem}>
          <Feather name="calendar" size={14} color={colors.primary} />
          <Text style={[styles.detailLabel, { color: colors.subtitle }]}>Idade:</Text>
          <Text style={[styles.detailValue, { color: colors.text }]}>
            {age != null ? `${age} anos` : 'Não informada'}
          </Text>
        </View>

        <View style={styles.detailItem}>
          <Feather name="droplet" size={14} color="#ef4444" />
          <Text style={[styles.detailLabel, { color: colors.subtitle }]}>Tipo Sanguíneo:</Text>
          <Text style={[styles.detailValue, { color: colors.text }]}>
            {elderly.tipoSanguineo || 'Não inf.'}
          </Text>
        </View>

        <View style={styles.detailItem}>
          <Feather name="activity" size={14} color="#3b82f6" />
          <Text style={[styles.detailLabel, { color: colors.subtitle }]}>IMC:</Text>
          <Text style={[styles.detailValue, { color: colors.text }]}>
            {elderly.imc || (elderly.peso && elderly.altura ? (elderly.peso / ((elderly.altura/100)**2)).toFixed(1) : 'Não calc.')}
          </Text>
        </View>

        <View style={styles.detailItem}>
          <Feather name="phone" size={14} color={colors.primary} />
          <Text style={[styles.detailLabel, { color: colors.subtitle }]}>Telefone:</Text>
          <TouchableOpacity onPress={handleCall} disabled={!elderly.telefone}>
            <Text style={[styles.detailValue, { color: phone ? colors.primary : colors.text }]}>
              {phone || 'Não inf.'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Allergies section */}
      <View style={styles.allergiesContainer}>
        <Text style={[styles.allergyLabel, { color: colors.subtitle }]}>Alergias:</Text>
        <View style={styles.allergyList}>
          {allergyList.length > 0 ? (
            allergyList.map((allergy, index) => (
              <View
                key={index}
                style={[
                  styles.allergyBadge,
                  {
                    backgroundColor: darkMode ? 'rgba(239, 68, 68, 0.2)' : '#fee2e2',
                    borderColor: darkMode ? 'rgba(239, 68, 68, 0.4)' : '#fca5a5',
                  },
                ]}
              >
                <Feather name="alert-circle" size={11} color="#ef4444" />
                <Text style={styles.allergyText}>{allergy}</Text>
              </View>
            ))
          ) : (
            <Text style={[styles.noAllergyText, { color: colors.subtitle }]}>Nenhuma alergia relatada</Text>
          )}
        </View>
      </View>

      {/* Observation */}
      {elderly.observacao ? (
        <View
          style={[
            styles.obsBox,
            {
              backgroundColor: colors.roleInactiveBg,
              borderColor: colors.cardBorder,
            },
          ]}
        >
          <Feather name="info" size={13} color={colors.primary} />
          <Text style={[styles.obsText, { color: colors.subtitle }]}>
            {elderly.observacao}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    elevation: 3,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    width: '100%',
  },
  emptyCard: {
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  cpfRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cpfText: {
    fontSize: 13,
  },
  cpfToggle: {
    padding: 2,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 10,
  },
  detailItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailLabel: {
    fontSize: 12,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  allergiesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 4,
  },
  allergyLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  allergyList: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  allergyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  allergyText: {
    fontSize: 11,
    color: '#ef4444',
    fontWeight: '600',
  },
  noAllergyText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  obsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 10,
  },
  obsText: {
    fontSize: 11,
    flex: 1,
  },
});

