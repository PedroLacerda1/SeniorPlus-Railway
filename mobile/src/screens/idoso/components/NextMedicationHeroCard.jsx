import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../../contexts/ThemeContext';

export default function NextMedicationHeroCard({
  medications = [],
  takenSlots = {},
  onToggleTaken,
  onOpenAllMedications,
  fontScale = 1,
}) {
  const { colors } = useTheme();

  // Expande medicamentos em pares [medicamento, horario]
  const allDoses = React.useMemo(() => {
    const doses = [];
    medications.forEach((med) => {
      const times = Array.isArray(med.horarios)
        ? med.horarios
        : String(med.horarios || med.time || '')
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean);

      times.forEach((time) => {
        const slotKey = `${med.id || med.nomeMedicamento}-${time}`;
        doses.push({
          med,
          time,
          slotKey,
          isTaken: !!takenSlots[slotKey],
        });
      });
    });

    // Ordena por horário HH:mm
    return doses.sort((a, b) => a.time.localeCompare(b.time));
  }, [medications, takenSlots]);

  // Encontra a próxima dose não tomada ou a mais próxima
  const nextDose = React.useMemo(() => {
    if (allDoses.length === 0) return null;
    const now = new Date();
    const currentHhMm = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes(),
    ).padStart(2, '0')}`;

    // 1º tenta a próxima não tomada depois de agora
    const upcomingUntaken = allDoses.find(
      (d) => !d.isTaken && d.time >= currentHhMm,
    );
    if (upcomingUntaken) return upcomingUntaken;

    // 2º tenta qualquer não tomada de hoje (mesmo que horário já tenha passado)
    const anyUntaken = allDoses.find((d) => !d.isTaken);
    if (anyUntaken) return anyUntaken;

    // 3º se todas foram tomadas, retorna a última ou a primeira
    return allDoses[0];
  }, [allDoses]);

  const totalDoses = allDoses.length;
  const takenCount = allDoses.filter((d) => d.isTaken).length;
  const remainingCount = totalDoses - takenCount;

  if (totalDoses === 0) {
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
        <View style={styles.emptyHeader}>
          <View style={[styles.iconCircle, { backgroundColor: '#10b98120' }]}>
            <MaterialCommunityIcons name="pill" size={28 * fontScale} color="#10b981" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: colors.text, fontSize: 18 * fontScale }]}>
              Medicamentos de Hoje
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary, fontSize: 14 * fontScale }]}>
              Nenhum medicamento cadastrado para hoje.
            </Text>
          </View>
        </View>
      </View>
    );
  }

  const isCurrentTaken = nextDose?.isTaken;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.cardBackground,
          borderColor: isCurrentTaken ? '#10b98155' : colors.primary,
        },
      ]}
    >
      {/* Top Tag & Header */}
      <View style={styles.cardHeader}>
        <View style={styles.titleRow}>
          <View
            style={[
              styles.iconCircle,
              {
                backgroundColor: isCurrentTaken ? '#10b98122' : `${colors.primary}22`,
              },
            ]}
          >
            <MaterialCommunityIcons
              name="pill"
              size={26 * fontScale}
              color={isCurrentTaken ? '#10b981' : colors.primary}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.sectionTag, { color: colors.primary, fontSize: 13 * fontScale }]}>
              {isCurrentTaken ? 'DOSE CONFIRMADA' : 'PRÓXIMO MEDICAMENTO'}
            </Text>
            <Text style={[styles.title, { color: colors.text, fontSize: 20 * fontScale }]}>
              {nextDose?.med?.nomeMedicamento || 'Medicamento'}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: isCurrentTaken ? '#10b98120' : '#f59e0b20',
              borderColor: isCurrentTaken ? '#10b98166' : '#f59e0b66',
            },
          ]}
        >
          <Feather
            name={isCurrentTaken ? 'check-circle' : 'clock'}
            size={14 * fontScale}
            color={isCurrentTaken ? '#10b981' : '#f59e0b'}
          />
          <Text
            style={[
              styles.statusText,
              {
                color: isCurrentTaken ? '#10b981' : '#f59e0b',
                fontSize: 12 * fontScale,
              },
            ]}
          >
            {isCurrentTaken ? 'Tomado' : 'Pendente'}
          </Text>
        </View>
      </View>

      {/* Main Details Grid */}
      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <Text style={[styles.detailLabel, { color: colors.textSecondary, fontSize: 13 * fontScale }]}>
            Horário
          </Text>
          <View style={styles.timeTag}>
            <Feather name="clock" size={16 * fontScale} color={colors.text} />
            <Text style={[styles.timeText, { color: colors.text, fontSize: 18 * fontScale }]}>
              {nextDose?.time}
            </Text>
          </View>
        </View>

        <View style={styles.detailItem}>
          <Text style={[styles.detailLabel, { color: colors.textSecondary, fontSize: 13 * fontScale }]}>
            Dosagem
          </Text>
          <Text style={[styles.dosageText, { color: colors.text, fontSize: 16 * fontScale }]}>
            {nextDose?.med?.dosagem || 'Conforme receita'}
          </Text>
        </View>
      </View>

      {/* Instructions if available */}
      {nextDose?.med?.instrucoes ? (
        <View style={[styles.instructionsBox, { backgroundColor: colors.background, borderColor: colors.cardBorder }]}>
          <Feather name="info" size={15} color={colors.primary} />
          <Text style={[styles.instructionsText, { color: colors.textSecondary, fontSize: 13 * fontScale }]}>
            {nextDose.med.instrucoes}
          </Text>
        </View>
      ) : null}

      {/* Big Action Button for Elderly */}
      <TouchableOpacity
        style={[
          styles.bigActionButton,
          {
            backgroundColor: isCurrentTaken ? '#10b981' : colors.primary,
          },
        ]}
        onPress={() => onToggleTaken(nextDose?.slotKey)}
        accessibilityRole="button"
        accessibilityLabel={
          isCurrentTaken
            ? `Dose de ${nextDose?.med?.nomeMedicamento} já marcada como tomada. Toque para desmarcar.`
            : `Marcar dose de ${nextDose?.med?.nomeMedicamento} das ${nextDose?.time} como tomada.`
        }
      >
        <Feather
          name={isCurrentTaken ? 'check' : 'check-circle'}
          size={24 * fontScale}
          color="#ffffff"
        />
        <Text style={[styles.bigActionText, { fontSize: 18 * fontScale }]}>
          {isCurrentTaken ? 'Dose Tomada ✓' : 'Já Tomei este Remédio'}
        </Text>
      </TouchableOpacity>

      {/* Bottom Footer: remaining doses & button to see all */}
      <View style={styles.footerRow}>
        <Text style={[styles.remainingText, { color: colors.textSecondary, fontSize: 13 * fontScale }]}>
          {remainingCount === 0
            ? 'Todas as doses de hoje tomadas!'
            : `${remainingCount} de ${totalDoses} doses restantes hoje`}
        </Text>

        <TouchableOpacity
          style={styles.seeAllButton}
          onPress={onOpenAllMedications}
          accessibilityRole="button"
          accessibilityLabel="Ver lista completa de medicamentos"
        >
          <Text style={[styles.seeAllText, { color: colors.primary, fontSize: 14 * fontScale }]}>
            Ver todos
          </Text>
          <Feather name="chevron-right" size={16 * fontScale} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1.5,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 8,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTag: {
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  title: {
    fontWeight: '800',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusText: {
    fontWeight: '700',
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontWeight: '600',
    marginBottom: 4,
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeText: {
    fontWeight: '800',
  },
  dosageText: {
    fontWeight: '700',
  },
  instructionsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14,
  },
  instructionsText: {
    flex: 1,
    lineHeight: 18,
  },
  bigActionButton: {
    minHeight: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
  },
  bigActionText: {
    color: '#ffffff',
    fontWeight: '800',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#37415133',
    paddingTop: 12,
  },
  remainingText: {
    fontWeight: '600',
    flex: 1,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  seeAllText: {
    fontWeight: '700',
  },
  emptyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  emptySubtitle: {
    marginTop: 4,
  },
});

