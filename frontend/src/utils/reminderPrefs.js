const KEY = "seniorplus:reminder-prefs"
const DEFAULTS = { notificationsEnabled: true, soundEnabled: true, reminderMinutes: 30 }

export const getReminderPrefs = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || "{}")
    const minutes = Number(parsed.reminderMinutes)
    return {
      notificationsEnabled: parsed.notificationsEnabled !== false,
      soundEnabled: parsed.soundEnabled !== false,
      reminderMinutes: Number.isFinite(minutes) && minutes > 0 ? minutes : DEFAULTS.reminderMinutes,
    }
  } catch (_) {
    return { ...DEFAULTS }
  }
}

export const saveReminderPrefs = (prefs) => {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...DEFAULTS, ...prefs }))
  } catch (_) {
    // armazenamento indisponível
  }
}
