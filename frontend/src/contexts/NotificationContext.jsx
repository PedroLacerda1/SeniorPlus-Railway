import { createContext, useState, useContext, useEffect, useRef, useCallback, useMemo } from "react"
import { useMedication } from "../tela-cuidador/src/contexts/MedicationContext"
import { useEvents } from "../tela-cuidador/src/contexts/EventsContext"
import { emitEmergencyNotification } from "../utils/emergency"
import { useToast } from "./ToastContext"
import { useAuth } from "../tela-auth/src/contexts/AuthContext"
import { useUser } from "../tela-cuidador/src/contexts/UserContext"
import { parseLocalDate, toLocalISODate } from "../utils/date"
import { getReminderPrefs, reminderPrefsScope } from "../utils/reminderPrefs"

const NotificationContext = createContext()

export const useNotification = () => useContext(NotificationContext)

export const NotificationProvider = ({ children }) => {
  const { currentUser } = useAuth()
  const { elderlyData } = useUser()
  const residentCpf = String(
    elderlyData?.cpf || (currentUser?.role === "elderly" ? currentUser?.cpf : "") || "",
  ).replace(/\D/g, "")
  const ownerKey = residentCpf.length === 11
    ? `cpf:${residentCpf}`
    : currentUser?.id || currentUser?.email || currentUser?.username || null
  const storageKey = currentUser && ownerKey ? `notifications:${ownerKey}` : null
  const reminderScope = reminderPrefsScope(currentUser)

  const [notificationState, setNotificationState] = useState({ storageKey: null, items: [] })
  const notifications = useMemo(
    () => notificationState.storageKey === storageKey ? notificationState.items : [],
    [notificationState, storageKey],
  )
  const setNotifications = useCallback((update) => {
    setNotificationState((previous) => {
      const current = previous.storageKey === storageKey ? previous.items : []
      const items = typeof update === "function" ? update(current) : update
      return { storageKey, items }
    })
  }, [storageKey])

  const [unreadCount, setUnreadCount] = useState(0)
  const [permission, setPermission] = useState("default")
  const { medications } = useMedication()
  const { events } = useEvents()
  const notificationLockRef = useRef(new Set())
  const audioContextRef = useRef(null)
  const lastSoundRef = useRef(0)
  const reminderChecksRef = useRef({})

  // Salvar notificações no localStorage
  useEffect(() => {
    notificationLockRef.current.clear()
    if (!currentUser) {
      setNotificationState({ storageKey: null, items: [] })
      setUnreadCount(0)
      return
    }

    const raw = storageKey ? localStorage.getItem(storageKey) : null
    if (!raw) {
      setNotificationState({ storageKey, items: [] })
      return
    }

    try {
      const parsed = JSON.parse(raw)
      setNotificationState({ storageKey, items: Array.isArray(parsed) ? parsed : [] })
    } catch (_) {
      setNotificationState({ storageKey, items: [] })
    }
  }, [currentUser, storageKey])

  useEffect(() => {
    if (!currentUser || !storageKey || notificationState.storageKey !== storageKey) return
    localStorage.setItem(storageKey, JSON.stringify(notificationState.items))
  }, [currentUser, notificationState, storageKey])

  useEffect(() => {
    const count = notifications.filter((notification) => !notification.read).length
    setUnreadCount(count)
  }, [notifications])

  // Verificar permissão de notificações
  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission)
    } else {
      setPermission("unsupported")
    }
  }, [])

  const playNotificationSound = useCallback(() => {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext
      if (!AudioContextClass) {
        return
      }

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContextClass()
      }

      const ctx = audioContextRef.current
      if (ctx.state === "suspended") {
        ctx.resume().catch((error) => console.warn("Não foi possível ativar o áudio de notificações", error))
      }

      const now = Date.now()
      if (now - lastSoundRef.current < 2500) {
        return
      }

      const oscillator = ctx.createOscillator()
      const gain = ctx.createGain()

      oscillator.type = "triangle"
      const startTime = ctx.currentTime
      oscillator.frequency.setValueAtTime(880, startTime)
      oscillator.frequency.exponentialRampToValueAtTime(660, startTime + 0.4)

      gain.gain.setValueAtTime(0.0001, startTime)
      gain.gain.exponentialRampToValueAtTime(0.2, startTime + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.9)

      oscillator.connect(gain)
      gain.connect(ctx.destination)

      oscillator.start(startTime)
      oscillator.stop(startTime + 0.95)

      lastSoundRef.current = now
    } catch (error) {
      console.warn("Falha ao tocar alerta sonoro", error)
    }
  }, [])

  // Verificar medicamentos e eventos para criar notificações
  useEffect(() => {
    reminderChecksRef.current.checkMedicationReminders?.()
    reminderChecksRef.current.checkEventReminders?.()

    // Configurar verificação periódica
    const interval = setInterval(() => {
      reminderChecksRef.current.checkMedicationReminders?.()
      reminderChecksRef.current.checkEventReminders?.()
    }, 30000)

    return () => clearInterval(interval)
  }, [medications, events, notifications])

  const isSameDay = (dateA, dateB) => toLocalISODate(dateA) === toLocalISODate(dateB)

  const hasNotification = (predicate) => notifications.some(predicate)

  const purgeObsoleteLocks = (todayISO) => {
    notificationLockRef.current.forEach((rawKey) => {
      try {
        const parsed = JSON.parse(rawKey)
        if (!parsed?.date || parsed.date === todayISO) {
          return
        }
        notificationLockRef.current.delete(rawKey)
      } catch (error) {
        // Se a chave não for JSON válido, remove para evitar crescimento infinito
        notificationLockRef.current.delete(rawKey)
      }
    })
  }

  // Solicitar permissão para notificações

  const { showSuccess, showError } = useToast() || {}

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.warn('API Notification não suportada neste navegador')
      return 'unsupported'
    }
    if (Notification.permission === 'granted') {
      setPermission("granted")
      return 'granted'
    }
    if (Notification.permission === 'denied') {
      setPermission("denied")
      return 'denied'
    }
    try {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        setPermission("granted")
        if (showSuccess) showSuccess('Notificações do sistema ativadas.')
      } else if (permission === 'denied') {
        if (showError) showError('Permissão negada para notificações.')
      }
      setPermission(permission)
      return permission
    } catch (e) {
      console.warn('Falha ao solicitar permissão de notificação', e)
      return 'default'
    }
  }, [showSuccess, showError])

  // Verificar medicamentos para lembretes
  const checkMedicationReminders = () => {
    if (!medications || medications.length === 0) return
    const prefs = getReminderPrefs(reminderScope)
    if (!prefs.notificationsEnabled) return

    const now = new Date()
    const todayISO = toLocalISODate(now)

    purgeObsoleteLocks(todayISO)

    medications.forEach((medication) => {
      if (medication.status !== "active" || medication.reminders === false) return
      if (medication.startDate && medication.startDate > todayISO) return
      if (medication.endDate && medication.endDate < todayISO) return

      const timeSlots = Array.isArray(medication.times) ? medication.times : String(medication.time || "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)

      timeSlots.forEach((timeSlot) => {
        if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(timeSlot)) return
        const [slotHour, slotMinute] = timeSlot.split(":").map(Number)
        const scheduledAt = new Date(now)
        scheduledAt.setHours(slotHour, slotMinute, 0, 0)
        const minutesLate = (now.getTime() - scheduledAt.getTime()) / 60000
        if (minutesLate < 0 || minutesLate > 5) return

        const notificationKey = JSON.stringify({
          type: "medication",
          target: medication.id,
          time: timeSlot,
          date: todayISO,
        })
        if (notificationLockRef.current.has(notificationKey)) return

        const alreadyExists = hasNotification(
          (notification) =>
            notification.type === "medication" &&
            notification.data?.medicationId === medication.id &&
            notification.data?.scheduleTime === timeSlot &&
            (notification.data?.scheduledDate === todayISO ||
              (!notification.data?.scheduledDate && isSameDay(new Date(notification.time), now))),
        )

        if (alreadyExists) {
          notificationLockRef.current.add(notificationKey)
          return
        }

        const notification = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          type: "medication",
          title: "Lembrete de Medicamento",
          message: `Hora de tomar ${medication.name} - ${medication.dosage}`,
          time: new Date().toISOString(),
          read: false,
          data: {
            medicationId: medication.id,
            medicationName: medication.name,
            scheduleTime: timeSlot,
            scheduledDate: todayISO,
          },
        }

        // Adicionar à lista de notificações
        addNotification(notification)
        if (prefs.soundEnabled && permission !== "granted") playNotificationSound()
        notificationLockRef.current.add(notificationKey)

        // Enviar notificação do navegador se permitido
        if (permission === "granted") {
          sendBrowserNotification(notification.title, notification.message, { silent: !prefs.soundEnabled })
        }
      })
    })
  }

  // Verificar eventos para lembretes
  const formatLead = (minutes) => {
    if (minutes >= 1440) return `${Math.round(minutes / 1440)} dia(s)`
    if (minutes >= 60) return `${Math.round(minutes / 60)} hora(s)`
    return `${minutes} minutos`
  }

  const checkEventReminders = () => {
    if (!events || events.length === 0) return
    const prefs = getReminderPrefs(reminderScope)
    if (!prefs.notificationsEnabled) return
    const lead = prefs.reminderMinutes

    const now = new Date()
    const today = toLocalISODate(now)
    purgeObsoleteLocks(today)

    events.forEach((event) => {
      if (String(event.status || "").toLowerCase().startsWith("conclu")) return
      const eventTime = event.startTime || "00:00"
      const [eventHour, eventMinute] = eventTime.split(":").map(Number)
      if (!Number.isInteger(eventHour) || !Number.isInteger(eventMinute)) return

      const eventDate = parseLocalDate(event.date)
      if (Number.isNaN(eventDate.getTime())) return
      eventDate.setHours(eventHour, eventMinute, 0, 0)

      const timeDiff = (eventDate.getTime() - now.getTime()) / (1000 * 60)

      // Notificar com a antecedência escolhida nas preferências
      if (timeDiff <= lead && timeDiff >= lead - 5) {
        const notificationKey = JSON.stringify({
          type: "event",
          target: event.id,
          time: eventTime,
          date: event.date,
        })
        if (notificationLockRef.current.has(notificationKey)) return

        const alreadyExists = hasNotification(
          (notification) =>
            notification.type === "event" &&
            notification.data?.eventId === event.id &&
            notification.data?.eventTitle === event.title &&
            notification.data?.scheduledDate === event.date,
        )

        if (alreadyExists) {
          notificationLockRef.current.add(notificationKey)
          return
        }

        // Criar notificação
        const notification = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          type: "event",
          title: "Lembrete de Evento",
          message: `${event.title} começa em ${formatLead(lead)} (${event.startTime})`,
          time: new Date().toISOString(),
          read: false,
          data: {
            eventId: event.id,
            eventTitle: event.title,
            scheduleTime: event.startTime,
            scheduledDate: event.date,
          },
        }

        // Adicionar à lista de notificações
        addNotification(notification)
        if (prefs.soundEnabled && permission !== "granted") playNotificationSound()
        notificationLockRef.current.add(notificationKey)

        // Enviar notificação do navegador se permitido
        if (permission === "granted") {
          sendBrowserNotification(notification.title, notification.message, { silent: !prefs.soundEnabled })
        }
      }
    })
  }

  // Enviar notificação do navegador
  const sendBrowserNotification = (title, message, options = {}) => {
    if (!("Notification" in window) || Notification.permission !== "granted") {
      return
    }

    try {
      new Notification(title, {
        body: message,
        icon: "/logo.png",
        silent: options.silent ?? false,
      })
    } catch (error) {
      console.error("Erro ao enviar notificação:", error)
    }
  }

  // Adicionar notificação
  const addNotification = useCallback((notification) => {
    setNotifications((prev) => [notification, ...prev])
  }, [setNotifications])

  // Registrar ações de emergência com helper centralizado
  const notifyEmergencyAction = useCallback(
    (payload) => {
      emitEmergencyNotification({ ...payload, addNotification })
      const prefs = getReminderPrefs(reminderScope)
      if (prefs.notificationsEnabled) {
        const title = payload.title || "Emergência"
        const contactName = payload.contact?.name || "contato de emergência"
        const message = payload.action === "whatsapp"
          ? `WhatsApp enviado para ${contactName}`
          : payload.action === "ligacao"
            ? `Ligação acionada para ${contactName}`
            : `Ação de emergência com ${contactName}`
        if (prefs.soundEnabled && permission !== "granted") playNotificationSound()
        if (permission === "granted") {
          sendBrowserNotification(title, message, { silent: !prefs.soundEnabled })
        }
      }
    },
    [addNotification, permission, playNotificationSound, reminderScope],
  )

  // Marcar notificação como lida
  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }

  // Marcar todas as notificações como lidas
  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
  }

  // Remover notificação
  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id))
  }

  // Limpar todas as notificações
  const clearAllNotifications = () => {
    setNotifications([])
  }

  // Criar notificação manual
  const createNotification = (title, message, type = "info") => {
    const notification = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type,
      title,
      message,
      time: new Date().toISOString(),
      read: false,
    }

    addNotification(notification)

    const prefs = getReminderPrefs(reminderScope)
    if (prefs.notificationsEnabled && permission === "granted") {
      sendBrowserNotification(title, message, { silent: !prefs.soundEnabled })
    }

    return notification.id
  }

  reminderChecksRef.current = { checkMedicationReminders, checkEventReminders }

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        permission,
        requestPermission,
        addNotification,
  notifyEmergencyAction,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAllNotifications,
        createNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}
