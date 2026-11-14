const KEY_PREFIX = "seniorplus:reminder-prefs:"
const DEFAULTS = { notificationsEnabled: true, soundEnabled: true, reminderMinutes: 30 }

export const reminderPrefsScope = (user) => {
  if (!user) return null
  const identity = user.id || user.email || user.username
  if (!identity) return null
  return `${user.role || "user"}:${identity}`
}

const getStorageKey = (scope) => {
  if (!scope) return null
  return `${KEY_PREFIX}${encodeURIComponent(scope)}`
}

export const getReminderPrefs = (scope) => {
  const key = getStorageKey(scope)
  if (!key) return { ...DEFAULTS }

  let raw
  try {
    raw = localStorage.getItem(key)
  } catch (error) {
    console.error("Não foi possível ler as preferências de lembrete deste dispositivo.", error)
    return { ...DEFAULTS }
  }
  if (!raw) return { ...DEFAULTS }

  try {
    const parsed = JSON.parse(raw)
    const minutes = Number(parsed.reminderMinutes)
    return {
      notificationsEnabled: parsed.notificationsEnabled !== false,
      soundEnabled: parsed.soundEnabled !== false,
      reminderMinutes: Number.isFinite(minutes) && minutes > 0 ? minutes : DEFAULTS.reminderMinutes,
    }
  } catch (error) {
    console.warn("Preferências de lembrete inválidas; usando padrões.", error)
    return { ...DEFAULTS }
  }
}

export const saveReminderPrefs = (prefs, scope) => {
  const key = getStorageKey(scope)
  if (!key) throw new Error("Não foi possível identificar a conta para salvar as preferências.")
  localStorage.setItem(key, JSON.stringify({ ...DEFAULTS, ...prefs }))
}
