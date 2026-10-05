import { createContext, useState, useContext, useEffect, useMemo, useCallback } from "react"
import { v4 as uuidv4 } from "uuid"
import { useAuth } from "../../../tela-auth/src/contexts/AuthContext"
import { useToast } from "../../../contexts/ToastContext"
import { useUser } from "./UserContext"
import { toLocalISODate } from "../../../utils/date"
import { api } from "../../../tela-auth/src/services/api"

const EventsContext = createContext()

const STORAGE_PREFIX = "seniorplus:events:"

const normalizeCpf = (value) => {
  const digits = String(value || "").replace(/\D/g, "")
  return digits.length === 11 ? digits : null
}

const toApiStatus = (status) => (status === "ConcluÃ­do" ? "CONCLUIDO" : "PENDENTE")
const fromApiStatus = (status) => (String(status || "").toUpperCase().startsWith("CONCLU") ? "ConcluÃ­do" : "Pendente")

const fromApi = (event) => ({
  id: event.id,
  title: event.titulo,
  date: event.data,
  startTime: event.horaInicio ? String(event.horaInicio).slice(0, 5) : "",
  endTime: event.horaFim ? String(event.horaFim).slice(0, 5) : "",
  location: event.localEvento || "",
  description: event.descricao || "",
  category: event.categoria || "Outro",
  status: fromApiStatus(event.status),
})

const toApi = (event) => ({
  titulo: event.title,
  descricao: event.description || "",
  data: event.date,
  horaInicio: event.startTime || null,
  horaFim: event.endTime || null,
  categoria: event.category || "Outro",
  localEvento: event.location || "",
  observacoes: "",
  status: toApiStatus(event.status),
})

export const useEvents = () => useContext(EventsContext)

export const EventsProvider = ({ children }) => {
  const { currentUser } = useAuth()
  const { elderlyData } = useUser()
  const { showSuccess, showError, showInfo } = useToast()
  const residentCpf = normalizeCpf(elderlyData?.cpf || (currentUser?.role === "elderly" ? currentUser?.cpf : null))
  const accountKey = currentUser?.id || currentUser?.email || currentUser?.username || null
  const scopeKey = residentCpf || (accountKey ? `account:${accountKey}` : null)
  const scopedStorageKey = scopeKey ? `${STORAGE_PREFIX}${scopeKey}` : null

  const EVENT_STATUS = useMemo(
    () => ({
      PENDING: "Pendente",
      DONE: "ConcluÃ­do",
    }),
    [],
  )

  const normalizeEvent = useCallback((event) => {
    if (!event) return null
    const base = {
      id: event.id || uuidv4(),
      title: event.title || event.titulo || "",
      date: event.date || event.data || toLocalISODate(),
      startTime: event.startTime || event.horaInicio || event.start || "",
      endTime: event.endTime || event.horaFim || event.end || "",
      location: event.location || event.local || "",
      description: event.description || event.descricao || "",
      category: event.category || event.categoria || "Outro",
      createdAt: event.createdAt || event.criadoEm || new Date().toISOString(),
      updatedAt: event.updatedAt || event.atualizadoEm || new Date().toISOString(),
      status: event.status || EVENT_STATUS.PENDING,
    }

    if (base.status !== EVENT_STATUS.PENDING && base.status !== EVENT_STATUS.DONE) {
      base.status = EVENT_STATUS.PENDING
    }

    return base
  }, [EVENT_STATUS])

  const [eventState, setEventState] = useState({ scopeKey: null, events: [] })
  const events = eventState.scopeKey === scopeKey ? eventState.events : []

  const setScopedEvents = useCallback((update) => {
    if (!scopeKey) {
      setEventState({ scopeKey: null, events: [] })
      return
    }
    setEventState((previous) => {
      const current = previous.scopeKey === scopeKey ? previous.events : []
      const next = typeof update === "function" ? update(current) : update
      return { scopeKey, events: next }
    })
  }, [scopeKey])

  // Load only data explicitly scoped to the active resident/account.
  useEffect(() => {
    if (!scopedStorageKey || typeof window === "undefined") {
      setEventState({ scopeKey: null, events: [] })
      return
    }
    try {
      const parsed = JSON.parse(window.localStorage.getItem(scopedStorageKey) || "[]")
      const loaded = Array.isArray(parsed) ? parsed.map(normalizeEvent).filter(Boolean) : []
      setEventState({ scopeKey, events: loaded })
    } catch (error) {
      console.error("Erro ao interpretar eventos armazenados:", error)
      setEventState({ scopeKey, events: [] })
    }
  }, [normalizeEvent, scopeKey, scopedStorageKey])

  // Sincroniza com o backend para que cuidador e idoso vejam os mesmos eventos
  useEffect(() => {
    if (!residentCpf) return undefined
    let cancelled = false
    const fetchRemote = async () => {
      try {
        const remote = await api.listEventos(residentCpf)
        if (cancelled || !Array.isArray(remote)) return
        setEventState({ scopeKey, events: remote.map((evt) => normalizeEvent(fromApi(evt))).filter(Boolean) })
      } catch (error) {
        console.warn("Falha ao sincronizar eventos com o servidor", error)
      }
    }
    fetchRemote()
    const interval = setInterval(fetchRemote, 30000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [residentCpf, scopeKey, normalizeEvent])

  useEffect(() => {
    if (typeof window === "undefined") return undefined

    const handleStorage = (event) => {
      if (event.key !== scopedStorageKey || !event.newValue) return
      try {
        const parsed = JSON.parse(event.newValue)
        const list = Array.isArray(parsed) ? parsed : []
        setScopedEvents(list.map((evt) => normalizeEvent(evt)).filter(Boolean))
      } catch (error) {
        console.error("Erro ao sincronizar eventos compartilhados:", error)
      }
    }

    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [normalizeEvent, scopedStorageKey, setScopedEvents])

  // Salvar dados no localStorage quando mudarem
  useEffect(() => {
    if (typeof window === "undefined" || !scopedStorageKey || eventState.scopeKey !== scopeKey) return
    try {
      window.localStorage.setItem(scopedStorageKey, JSON.stringify(eventState.events))
    } catch (error) {
      console.warn("Falha ao persistir eventos do idoso atual", error)
    }
  }, [eventState, scopeKey, scopedStorageKey])

  const addEvent = (title, date, startTime, endTime, location, description, category) => {
    const newEvent = normalizeEvent({
      id: uuidv4(),
      title,
      date,
      startTime,
      endTime,
      location,
      description,
      category: category || "Outro",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: EVENT_STATUS.PENDING,
    })

    setScopedEvents((previous) => [...previous, newEvent])
    if (residentCpf) {
      api.createEvento(residentCpf, toApi(newEvent))
        .then((saved) => {
          if (!saved?.id) return
          setScopedEvents((previous) => previous.map((event) => (event.id === newEvent.id ? { ...event, id: saved.id } : event)))
        })
        .catch((error) => {
          setScopedEvents((previous) => previous.filter((event) => event.id !== newEvent.id))
          showError(error?.message || "NÃ£o foi possÃ­vel salvar o evento no servidor.")
        })
    }
    showSuccess(`Evento "${title}" adicionado com sucesso!`)
    return newEvent
  }

  const updateEvent = (id, updatedEvent) => {
    const current = events.find((event) => event.id === id)
    if (residentCpf && current && typeof id === "number") {
      const merged = normalizeEvent({ ...current, ...updatedEvent, id, status: updatedEvent.status || current.status })
      api.updateEvento(id, toApi(merged)).catch((error) => {
        showError(error?.message || "NÃ£o foi possÃ­vel atualizar o evento no servidor.")
      })
    }
    setScopedEvents((previous) =>
      previous.map((event) => {
        if (event.id === id) {
          return normalizeEvent({
            ...event,
            ...updatedEvent,
            updatedAt: new Date().toISOString(),
            status: updatedEvent.status || event.status,
          })
        }
        return event
      }),
    )
    showSuccess(`Evento atualizado com sucesso!`)
  }

  const deleteEvent = (id) => {
    const eventToDelete = events.find((event) => event.id === id)
    setScopedEvents((previous) => previous.filter((event) => event.id !== id))
    if (residentCpf && typeof id === "number") {
      api.deleteEvento(id).catch((error) => {
        showError(error?.message || "NÃ£o foi possÃ­vel remover o evento no servidor.")
      })
    }
    if (eventToDelete) {
      showSuccess(`Evento "${eventToDelete.title}" removido com sucesso!`)
    }
  }

  const toggleEventStatus = (id) => {
    const target = events.find((event) => event.id === id)
    if (residentCpf && target && typeof id === "number") {
      const next = target.status === EVENT_STATUS.DONE ? EVENT_STATUS.PENDING : EVENT_STATUS.DONE
      api.atualizarStatusEvento(id, toApiStatus(next)).catch((error) => {
        showError(error?.message || "NÃ£o foi possÃ­vel atualizar o status no servidor.")
      })
    }
    setScopedEvents((prev) =>
      prev.map((event) => {
        if (event.id !== id) return event
        const nextStatus = event.status === EVENT_STATUS.DONE ? EVENT_STATUS.PENDING : EVENT_STATUS.DONE
        const updated = {
          ...event,
          status: nextStatus,
          updatedAt: new Date().toISOString(),
        }
        showInfo(`Evento "${event.title}" marcado como ${nextStatus.toLowerCase()}.`)
        return updated
      }),
    )
  }

  const getTodayEvents = () => {
    const today = toLocalISODate()
    return events
      .filter((event) => event.date === today)
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
  }

  const getEventsByDate = (date) => {
    return events.filter((event) => event.date === date).sort((a, b) => a.startTime.localeCompare(b.startTime))
  }

  const getEventsByDateRange = (startDate, endDate) => {
    return events
      .filter((event) => {
        return event.date >= startDate && event.date <= endDate
      })
      .sort((a, b) => {
        // Primeiro ordenar por data
        if (a.date !== b.date) {
          return a.date.localeCompare(b.date)
        }
        // Se a data for a mesma, ordenar por hora de inÃ­cio
        return a.startTime.localeCompare(b.startTime)
      })
  }

  const getEventsByCategory = (category) => {
    return events.filter((event) => event.category === category).sort((a, b) => new Date(a.date) - new Date(b.date))
  }

  // FunÃ§Ã£o para importar eventos de CSV
  const importEventsFromCSV = (csvData) => {
    try {
      if (!csvData || !Array.isArray(csvData) || csvData.length === 0) {
        showError("Dados CSV invÃ¡lidos ou vazios")
        return []
      }

      // Processar os dados CSV e adicionar como eventos
      const newEvents = csvData.map((item) =>
        normalizeEvent({
          id: uuidv4(),
          title: item.titulo || item.title || "",
          date: item.data || item.date || toLocalISODate(),
          startTime: item.horaInicio || item.startTime || "",
          endTime: item.horaFim || item.endTime || "",
          location: item.local || item.location || "",
          description: item.descricao || item.description || "",
          category: item.categoria || item.category || "Outro",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: EVENT_STATUS.PENDING,
        }),
      )

      // Validar os dados antes de adicionar
      const validEvents = newEvents.filter((event) => event.title && event.date && event.startTime)

      if (validEvents.length === 0) {
        showError("Nenhum evento vÃ¡lido encontrado no arquivo CSV")
        return []
      }

      setScopedEvents((prev) => [...prev, ...validEvents])
      showSuccess(`${validEvents.length} eventos importados com sucesso!`)
      return validEvents
    } catch (error) {
      console.error("Erro ao importar eventos:", error)
      showError(`Erro ao importar eventos: ${error.message}`)
      return []
    }
  }

  return (
    <EventsContext.Provider
      value={{
        events,
        addEvent,
        updateEvent,
        deleteEvent,
  toggleEventStatus,
        getTodayEvents,
        getEventsByDate,
        getEventsByDateRange,
        getEventsByCategory,
        importEventsFromCSV,
      }}
    >
      {children}
    </EventsContext.Provider>
  )
}

export default EventsProvider
