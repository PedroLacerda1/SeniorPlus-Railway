import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { Feather, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../../contexts/ThemeContext';

export default function IdosoProfileCard({
  elderly,
  fontScale = 1,
}) {
  const { colors } = useTheme();
  const [showCpf, setShowCpf] = useState(false);

  const formatCpf = (raw = '') => {
    const clean = String(raw).replace(/\D/g, '');
    if (clean.length !== 11) return raw;
    if (!showCpf) return `${clean.substring(0, 3)}.***.***-${clean.substring(9)}`;
    return `${clean.substring(0, 3)}.${clean.substring(3, 6)}.${clean.substring(6, 9)}-${clean.substring(9)}`;
  };

  const handleCall = (phone) => {
    if (!phone) {
      Alert.alert('Aviso', 'Telefone não informado para este cuidador.');
      return;
    }
    const clean = String(phone).replace(/\D/g, '');
    Linking.openURL(`tel:${clean}`);
  };

  const handleWhatsApp = (phone, name = 'Cuidador') => {
    if (!phone) {
      Alert.alert('Aviso', 'Telefone não informado para este cuidador.');
      return;
    }
    const clean = String(phone).replace(/\D/g, '');
    const num = clean.startsWith('55') ? clean : `55${clean}`;
    const msg = encodeURIComponent(`Olá ${name}, estou usando o aplicativo Senior+ e gostaria de falar com você.`);
    Linking.openURL(`https://wa.me/${num}?text=${msg}`);
  };

  // Extrai lista de cuidadores
  const caregivers = React.useMemo(() => {
    const list = [];
    if (elderly?.cuidador) list.push(elderly.cuidador);
    if (Array.isArray(elderly?.cuidadores)) list.push(...elderly.cuidadores);

    // Deduplica por cpf
    const unique = [];
    list.filter(Boolean).forEach((c) => {
      const cCpf = c.cpf || c.cuidadorCpf;
      if (!unique.some((u) => (u.cpf || u.cuidadorCpf) === cCpf)) {
        unique.push(c);
      }
    });
    return unique;
  }, [elderly]);

  // Alergias
  const allergies = React.useMemo(() => {
    if (!elderly?.alergias) return [];
    if (Array.isArray(elderly.alergias)) return elderly.alergias.filter(Boolean);
    return String(elderly.alergias)
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean);
  }, [elderly]);

  const initials = (elderly?.nome || 'Idoso')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('');

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
      {/* Header com avatar e nome */}
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={[styles.avatarText, { fontSize: 20 * fontScale }]}>{initials}</Text>
        </View>

        <View style={styles.headerInfo}>
          <Text style={[styles.name, { color: colors.text, fontSize: 18 * fontScale }]}>
            {elderly?.nome || 'Usuário'}
          </Text>

          <TouchableOpacity
            style={styles.cpfRow}
            onPress={() => setShowCpf(!showCpf)}
            accessibilityRole="button"
            accessibilityLabel={`CPF: ${formatCpf(elderly?.cpf)}. Toque para ${showCpf ? 'ocultar' : 'exibir'}.`}
          >
            <Text style={[styles.cpfText, { color: colors.textSecondary, fontSize: 13 * fontScale }]}>
              CPF: {formatCpf(elderly?.cpf)}
            </Text>
            <Feather
              name={showCpf ? 'eye-off' : 'eye'}
              size={14}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Grid com indicadores de saúde */}
      <View style={styles.healthGrid}>
        <View style={[styles.healthChip, { backgroundColor: colors.background, borderColor: colors.cardBorder }]}>
          <Text style={[styles.chipLabel, { color: colors.textSecondary, fontSize: 11 * fontScale }]}>
            SANGUE
          </Text>
          <Text style={[styles.chipValue, { color: '#ef4444', fontSize: 16 * fontScale }]}>
            {elderly?.tipoSanguineo || '--'}
          </Text>
        </View>

        <View style={[styles.healthChip, { backgroundColor: colors.background, borderColor: colors.cardBorder }]}>
          <Text style={[styles.chipLabel, { color: colors.textSecondary, fontSize: 11 * fontScale }]}>
            PESO
          </Text>
          <Text style={[styles.chipValue, { color: colors.text, fontSize: 16 * fontScale }]}>
            {elderly?.peso ? `${elderly.peso} kg` : '--'}
          </Text>
        </View>

        <View style={[styles.healthChip, { backgroundColor: colors.background, borderColor: colors.cardBorder }]}>
          <Text style={[styles.chipLabel, { color: colors.textSecondary, fontSize: 11 * fontScale }]}>
            ALTURA
          </Text>
          <Text style={[styles.chipValue, { color: colors.text, fontSize: 16 * fontScale }]}>
            {elderly?.altura ? `${elderly.altura} m` : '--'}
          </Text>
        </View>

        <View style={[styles.healthChip, { backgroundColor: colors.background, borderColor: colors.cardBorder }]}>
          <Text style={[styles.chipLabel, { color: colors.textSecondary, fontSize: 11 * fontScale }]}>
            IMC
          </Text>
          <Text style={[styles.chipValue, { color: colors.primary, fontSize: 16 * fontScale }]}>
            {elderly?.imc || '--'}
          </Text>
        </View>
      </View>

      {/* Alergias */}
      {allergies.length > 0 ? (
        <View style={styles.allergiesBox}>
          <View style={styles.allergiesTitleRow}>
            <MaterialCommunityIcons name="alert-decagram" size={16 * fontScale} color="#ef4444" />
            <Text style={[styles.allergiesTitle, { color: '#ef4444', fontSize: 13 * fontScale }]}>
              Alergias Identificadas
            </Text>
          </View>
          <View style={styles.allergiesWrap}>
            {allergies.map((allergy, idx) => (
              <View key={idx} style={styles.allergyTag}>
                <Text style={[styles.allergyTagText, { fontSize: 12 * fontScale }]}>
                  {allergy}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {/* Cuidadores Vinculados */}
      <View style={styles.caregiverSection}>
        <Text style={[styles.sectionTitle, { color: colors.text, fontSize: 16 * fontScale }]}>
          Cuidadores Vinculados
        </Text>

        {caregivers.length === 0 ? (
          <View style={[styles.emptyCaregiverBox, { backgroundColor: colors.background, borderColor: colors.cardBorder }]}>
            <Feather name="user-plus" size={20 * fontScale} color={colors.textSecondary} />
            <Text style={[styles.emptyCaregiverText, { color: colors.textSecondary, fontSize: 13 * fontScale }]}>
              Nenhum cuidador vinculado ainda. Informe seu CPF ao seu cuidador para que ele possa enviar uma solicitação de vínculo.
            </Text>
          </View>
        ) : (
          caregivers.map((c, index) => {
            const cName = c.nome || c.cuidadorNome || 'Cuidador Vinculado';
            const cPhone = c.telefone || c.phone;
            const cInitials = cName
              .split(' ')
              .filter(Boolean)
              .slice(0, 2)
              .map((n) => n[0].toUpperCase())
              .join('');

            return (
              <View
                key={c.cpf || index}
                style={[
                  styles.caregiverCard,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.cardBorder,
                  },
                ]}
              >
                <View style={[styles.caregiverAvatar, { backgroundColor: colors.primary }]}>
                  <Text style={styles.caregiverAvatarText}>{cInitials}</Text>
                </View>

                <View style={styles.caregiverInfo}>
                  <Text style={[styles.caregiverName, { color: colors.text, fontSize: 15 * fontScale }]}>
                    {cName}
                  </Text>
                  <Text style={[styles.caregiverRole, { color: colors.textSecondary, fontSize: 12 * fontScale }]}>
                    Cuidador Responsável
                  </Text>
                </View>

                <View style={styles.caregiverActions}>
                  {cPhone ? (
                    <>
                      <TouchableOpacity
                        style={[styles.actionBtn, styles.callBtn]}
                        onPress={() => handleCall(cPhone)}
                        accessibilityRole="button"
                        accessibilityLabel={`Ligar para ${cName}`}
                      >
                        <Feather name="phone" size={16 * fontScale} color="#ffffff" />
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.actionBtn, styles.waBtn]}
                        onPress={() => handleWhatsApp(cPhone, cName)}
                        accessibilityRole="button"
                        accessibilityLabel={`Enviar WhatsApp para ${cName}`}
                      >
                        <FontAwesome5 name="whatsapp" size={16 * fontScale} color="#ffffff" />
                      </TouchableOpacity>
                    </>
                  ) : null}
                </View>
              </View>
            );
          })
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontWeight: '800',
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontWeight: '800',
    marginBottom: 4,
  },
  cpfRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cpfText: {
    fontWeight: '600',
  },
  healthGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 14,
  },
  healthChip: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
  },
  chipLabel: {
    fontWeight: '700',
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  chipValue: {
    fontWeight: '800',
  },
  allergiesBox: {
    backgroundColor: '#ef444415',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  allergiesTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  allergiesTitle: {
    fontWeight: '700',
  },
  allergiesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  allergyTag: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  allergyTagText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  caregiverSection: {
    marginTop: 4,
  },
  sectionTitle: {
    fontWeight: '800',
    marginBottom: 10,
  },
  emptyCaregiverBox: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  emptyCaregiverText: {
    flex: 1,
    lineHeight: 18,
  },
  caregiverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginBottom: 8,
  },
  caregiverAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  caregiverAvatarText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 14,
  },
  caregiverInfo: {
    flex: 1,
  },
  caregiverName: {
    fontWeight: '700',
  },
  caregiverRole: {
    marginTop: 2,
  },
  caregiverActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  callBtn: {
    backgroundColor: '#2563eb',
  },
  waBtn: {
    backgroundColor: '#16a34a',
  },
});
