import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
} from 'react-native';
import { Feather, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../../contexts/ThemeContext';

export default function IdosoHealthCareModal({
  visible,
  onClose,
  elderly,
  fontScale = 1,
}) {
  const { colors } = useTheme();

  const handleCall = (phone) => {
    if (!phone) {
      Alert.alert('Aviso', 'Telefone não disponível.');
      return;
    }
    const clean = String(phone).replace(/\D/g, '');
    Linking.openURL(`tel:${clean}`);
  };

  const handleWhatsApp = (phone, name = 'Cuidador') => {
    if (!phone) {
      Alert.alert('Aviso', 'Telefone não disponível.');
      return;
    }
    const clean = String(phone).replace(/\D/g, '');
    const num = clean.startsWith('55') ? clean : `55${clean}`;
    const msg = encodeURIComponent(`Olá ${name}, estou entrando em contato pelo aplicativo Senior+.`);
    Linking.openURL(`https://wa.me/${num}?text=${msg}`);
  };

  // Cuidadores vinculados
  const caregivers = React.useMemo(() => {
    const list = [];
    if (elderly?.cuidador) list.push(elderly.cuidador);
    if (Array.isArray(elderly?.cuidadores)) list.push(...elderly.cuidadores);

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

  // Classificação do IMC
  const imcClassification = React.useMemo(() => {
    const imcNum = parseFloat(elderly?.imc);
    if (!imcNum || Number.isNaN(imcNum)) return null;
    if (imcNum < 22) return { label: 'Abaixo do peso ideal', color: '#f59e0b' };
    if (imcNum <= 27) return { label: 'Peso saudável para terceira idade', color: '#10b981' };
    return { label: 'Sobrepeso / Atenção médica', color: '#ef4444' };
  }, [elderly?.imc]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.cardBackground,
              borderColor: colors.cardBorder,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View style={[styles.headerIconCircle, { backgroundColor: '#8b5cf622' }]}>
                <FontAwesome5 name="heartbeat" size={22 * fontScale} color="#8b5cf6" />
              </View>
              <View>
                <Text style={[styles.title, { color: colors.text, fontSize: 19 * fontScale }]}>
                  Meus Cuidados de Saúde
                </Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary, fontSize: 13 * fontScale }]}>
                  Ficha médica e acompanhamento
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeBtn, { backgroundColor: colors.background }]}
              accessibilityRole="button"
              accessibilityLabel="Fechar ficha"
            >
              <Feather name="x" size={22} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentList}
          >
            {/* Cartão de Identificação */}
            <View style={[styles.sectionCard, { backgroundColor: colors.background, borderColor: colors.cardBorder }]}>
              <Text style={[styles.cardTitle, { color: colors.text, fontSize: 16 * fontScale }]}>
                Identificação do Paciente
              </Text>
              <View style={styles.grid2}>
                <View style={styles.gridItem}>
                  <Text style={[styles.itemLabel, { color: colors.textSecondary, fontSize: 12 * fontScale }]}>
                    NOME COMPLETO
                  </Text>
                  <Text style={[styles.itemValue, { color: colors.text, fontSize: 15 * fontScale }]}>
                    {elderly?.nome || 'Idoso'}
                  </Text>
                </View>

                <View style={styles.gridItem}>
                  <Text style={[styles.itemLabel, { color: colors.textSecondary, fontSize: 12 * fontScale }]}>
                    CONTATO
                  </Text>
                  <Text style={[styles.itemValue, { color: colors.text, fontSize: 15 * fontScale }]}>
                    {elderly?.telefone || 'Não informado'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Indicadores Físicos */}
            <View style={[styles.sectionCard, { backgroundColor: colors.background, borderColor: colors.cardBorder }]}>
              <Text style={[styles.cardTitle, { color: colors.text, fontSize: 16 * fontScale }]}>
                Indicadores Clínicos
              </Text>
              <View style={styles.biometricsRow}>
                <View style={[styles.bioBox, { borderColor: colors.cardBorder }]}>
                  <Text style={[styles.bioLabel, { color: colors.textSecondary, fontSize: 11 * fontScale }]}>
                    TIPO SANGUÍNEO
                  </Text>
                  <Text style={[styles.bioValue, { color: '#ef4444', fontSize: 20 * fontScale }]}>
                    {elderly?.tipoSanguineo || '--'}
                  </Text>
                </View>

                <View style={[styles.bioBox, { borderColor: colors.cardBorder }]}>
                  <Text style={[styles.bioLabel, { color: colors.textSecondary, fontSize: 11 * fontScale }]}>
                    PESO ATUAL
                  </Text>
                  <Text style={[styles.bioValue, { color: colors.text, fontSize: 20 * fontScale }]}>
                    {elderly?.peso ? `${elderly.peso} kg` : '--'}
                  </Text>
                </View>

                <View style={[styles.bioBox, { borderColor: colors.cardBorder }]}>
                  <Text style={[styles.bioLabel, { color: colors.textSecondary, fontSize: 11 * fontScale }]}>
                    ALTURA
                  </Text>
                  <Text style={[styles.bioValue, { color: colors.text, fontSize: 20 * fontScale }]}>
                    {elderly?.altura ? `${elderly.altura} m` : '--'}
                  </Text>
                </View>

                <View style={[styles.bioBox, { borderColor: colors.cardBorder }]}>
                  <Text style={[styles.bioLabel, { color: colors.textSecondary, fontSize: 11 * fontScale }]}>
                    ÍNDICE IMC
                  </Text>
                  <Text style={[styles.bioValue, { color: colors.primary, fontSize: 20 * fontScale }]}>
                    {elderly?.imc || '--'}
                  </Text>
                </View>
              </View>

              {imcClassification ? (
                <View style={styles.imcClassBox}>
                  <Feather name="info" size={14} color={imcClassification.color} />
                  <Text style={[styles.imcClassText, { color: imcClassification.color, fontSize: 13 * fontScale }]}>
                    {imcClassification.label}
                  </Text>
                </View>
              ) : null}
            </View>

            {/* Alergias Registradas */}
            <View style={[styles.sectionCard, { backgroundColor: colors.background, borderColor: colors.cardBorder }]}>
              <View style={styles.cardTitleRow}>
                <MaterialCommunityIcons name="alert-decagram" size={18 * fontScale} color="#ef4444" />
                <Text style={[styles.cardTitle, { color: '#ef4444', fontSize: 16 * fontScale }]}>
                  Alergias Registradas
                </Text>
              </View>
              {allergies.length === 0 ? (
                <Text style={[styles.emptySubtitle, { color: colors.textSecondary, fontSize: 13 * fontScale }]}>
                  Nenhuma alergia relatada no prontuário.
                </Text>
              ) : (
                <View style={styles.allergiesWrap}>
                  {allergies.map((allergy, idx) => (
                    <View key={idx} style={styles.allergyBadge}>
                      <Text style={[styles.allergyBadgeText, { fontSize: 13 * fontScale }]}>
                        {allergy}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Observações Clínicas / Recomendações */}
            {elderly?.observacao ? (
              <View style={[styles.sectionCard, { backgroundColor: colors.background, borderColor: colors.cardBorder }]}>
                <Text style={[styles.cardTitle, { color: colors.text, fontSize: 16 * fontScale }]}>
                  Observações e Recomendações
                </Text>
                <Text style={[styles.obsText, { color: colors.textSecondary, fontSize: 14 * fontScale }]}>
                  {elderly.observacao}
                </Text>
              </View>
            ) : null}

            {/* Cuidadores Vinculados com Ações Diretas */}
            <View style={[styles.sectionCard, { backgroundColor: colors.background, borderColor: colors.cardBorder }]}>
              <Text style={[styles.cardTitle, { color: colors.text, fontSize: 16 * fontScale }]}>
                Cuidadores Autorizados
              </Text>
              {caregivers.length === 0 ? (
                <Text style={[styles.emptySubtitle, { color: colors.textSecondary, fontSize: 13 * fontScale }]}>
                  Nenhum cuidador vinculado no momento.
                </Text>
              ) : (
                caregivers.map((c, index) => {
                  const cName = c.nome || c.cuidadorNome || 'Cuidador Vinculado';
                  const cPhone = c.telefone || c.phone;

                  return (
                    <View
                      key={c.cpf || index}
                      style={[
                        styles.caregiverRow,
                        {
                          borderBottomColor: `${colors.cardBorder}88`,
                          borderBottomWidth: index < caregivers.length - 1 ? StyleSheet.hairlineWidth : 0,
                        },
                      ]}
                    >
                      <View style={{ flex: 1, marginRight: 10 }}>
                        <Text style={[styles.caregiverName, { color: colors.text, fontSize: 16 * fontScale }]}>
                          {cName}
                        </Text>
                        <Text style={[styles.caregiverRole, { color: colors.textSecondary, fontSize: 12 * fontScale }]}>
                          Cuidador Principal
                        </Text>
                      </View>

                      {cPhone ? (
                        <View style={styles.contactButtonsRow}>
                          <TouchableOpacity
                            style={[styles.contactCircleBtn, styles.callBg]}
                            onPress={() => handleCall(cPhone)}
                            accessibilityRole="button"
                            accessibilityLabel={`Ligar para ${cName}`}
                          >
                            <Feather name="phone" size={16 * fontScale} color="#ffffff" />
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={[styles.contactCircleBtn, styles.waBg]}
                            onPress={() => handleWhatsApp(cPhone, cName)}
                            accessibilityRole="button"
                            accessibilityLabel={`WhatsApp para ${cName}`}
                          >
                            <FontAwesome5 name="whatsapp" size={16 * fontScale} color="#ffffff" />
                          </TouchableOpacity>
                        </View>
                      ) : null}
                    </View>
                  );
                })
              )}
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.doneBtn, { backgroundColor: colors.primary }]}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Fechar ficha"
            >
              <Text style={[styles.doneBtnText, { fontSize: 16 * fontScale }]}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderBottomWidth: 0,
    maxHeight: '90%',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#37415133',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontWeight: '800',
  },
  subtitle: {
    fontWeight: '600',
    marginTop: 2,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentList: {
    padding: 20,
    gap: 14,
  },
  sectionCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
  },
  cardTitle: {
    fontWeight: '800',
    marginBottom: 10,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  grid2: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  gridItem: {
    flex: 1,
  },
  itemLabel: {
    fontWeight: '700',
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  itemValue: {
    fontWeight: '700',
  },
  biometricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  bioBox: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  bioLabel: {
    fontWeight: '700',
    marginBottom: 2,
    letterSpacing: 0.3,
  },
  bioValue: {
    fontWeight: '800',
  },
  imcClassBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#37415133',
  },
  imcClassText: {
    fontWeight: '600',
  },
  emptySubtitle: {
    lineHeight: 18,
  },
  allergiesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  allergyBadge: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  allergyBadgeText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  obsText: {
    lineHeight: 20,
  },
  caregiverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  caregiverName: {
    fontWeight: '800',
  },
  caregiverRole: {
    marginTop: 2,
  },
  contactButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  contactCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  callBg: {
    backgroundColor: '#2563eb',
  },
  waBg: {
    backgroundColor: '#16a34a',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  doneBtn: {
    minHeight: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doneBtnText: {
    color: '#ffffff',
    fontWeight: '800',
  },
});

