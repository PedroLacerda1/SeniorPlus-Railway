import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import { useAuth } from "../../../tela-auth/src/contexts/AuthContext"
import { useToast } from "../../../contexts/ToastContext"
import { api } from "../../../tela-auth/src/services/api"

const CaregiverProfileContext = createContext()

const STORAGE_PREFIX = "seniorplus:caregiver-profile:"

const defaultProfile = {
  displayName: "",
  headline: "",
  about: "",
  photoUrl: "",
  phone: "",
  email: "",
  connectionMessage: "",
  updatedAt: null,
}

export const useCaregiverProfile = () => {
  const context = useContext(CaregiverProfileContext)
  if (!context) {
    throw new Error("useCaregiverProfile deve ser usado dentro de um CaregiverProfileProvider")
  }
  return context
}

const normalizeProfile = (raw = {}) => ({
  ...defaultProfile,
  ...raw,
})

export const CaregiverProfileProvider = ({ children }) => {
  const { currentUser } = useAuth()
  const { showError } = useToast()
  const showErrorRef = useRef(showError)
  showErrorRef.current = showError
  const accountIdentity = currentUser?.cpf || currentUser?.id || currentUser?.email || currentUser?.username || null
  const storageKey = accountIdentity ? `${STORAGE_PREFIX}${accountIdentity}` : null
  const activeStorageKey = useRef(storageKey)
  activeStorageKey.current = currentUser?.role === "caregiver" ? storageKey : null
  const [profileState, setProfileState] = useState({ storageKey: null, profile: normalizeProfile() })
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileUnavailable, setProfileUnavailable] = useState(false)
  const caregiverProfile = profileState.storageKey === storageKey
    ? profileState.profile
    : normalizeProfile()

  useEffect(() => {
    if (!storageKey || currentUser?.role !== "caregiver") {
      setProfileState({ storageKey, profile: normalizeProfile() })
      setProfileLoading(false)
      setProfileUnavailable(false)
      return
    }

    let cancelled = false
    let profile = normalizeProfile()
    try {
      const cached = localStorage.getItem(storageKey)
      if (cached) profile = normalizeProfile(JSON.parse(cached))
    } catch (error) {
      console.warn("Falha ao carregar perfil do cuidador do storage", error)
    }

    const name = currentUser.name || currentUser.nome || currentUser.fullName || currentUser.username || ""
    const emailFromUser = currentUser.email || ""
    const phoneFromUser = currentUser.telefone || currentUser.phone || ""
    const avatarFromUser = currentUser.photoUrl || currentUser.fotoUrl || ""

    profile = normalizeProfile({
      ...profile,
      displayName: profile.displayName || name,
      email: profile.email || emailFromUser,
      phone: profile.phone || phoneFromUser,
      photoUrl: profile.photoUrl || avatarFromUser,
    })
    setProfileState({ storageKey, profile })
    setProfileLoading(true)
    setProfileUnavailable(false)
    api.get("/api/v1/caregiver-profile")
      .then((remote) => {
        if (cancelled || !remote) return
        const next = normalizeProfile(remote)
        setProfileState({ storageKey, profile: next })
        try {
          localStorage.setItem(storageKey, JSON.stringify(next))
        } catch (error) {
          console.warn("Falha ao armazenar cópia local do perfil", error)
        }
      })
      .catch((error) => {
        if (!cancelled) {
          console.error("Erro ao carregar perfil do cuidador", error)
          setProfileUnavailable(true)
          showErrorRef.current?.("Não foi possível carregar o perfil do cuidador.")
        }
      })
      .finally(() => { if (!cancelled) setProfileLoading(false) })
    return () => { cancelled = true }
  }, [currentUser, storageKey])

  const updateCaregiverProfile = useCallback(
    async (updates = {}) => {
      if (!storageKey || currentUser?.role !== "caregiver") {
        throw new Error("Perfil de cuidador indisponível.")
      }
      const saved = await api.put("/api/v1/caregiver-profile", updates)
      if (!saved || typeof saved.displayName !== "string" || !saved.displayName.trim()) {
        throw new Error("O servidor não confirmou o perfil atualizado.")
      }
      const next = normalizeProfile(saved)
      if (activeStorageKey.current !== storageKey) return next
      setProfileState({ storageKey, profile: next })
      try {
        localStorage.setItem(storageKey, JSON.stringify(next))
      } catch (error) {
        console.warn("Falha ao armazenar cópia local do perfil", error)
      }
      return next
    },
    [currentUser?.role, storageKey],
  )

  const resetCaregiverProfile = useCallback(async () => {
    const base = normalizeProfile()
    if (currentUser) {
      base.displayName = currentUser.nome || currentUser.name || currentUser.fullName || currentUser.username || ""
      base.email = currentUser.email || ""
    }
    return updateCaregiverProfile(base)
  }, [currentUser, updateCaregiverProfile])

  const value = useMemo(
    () => ({
      caregiverProfile,
      profileLoading,
      profileUnavailable,
      updateCaregiverProfile,
      resetCaregiverProfile,
    }),
    [caregiverProfile, profileLoading, profileUnavailable, updateCaregiverProfile, resetCaregiverProfile],
  )

  return <CaregiverProfileContext.Provider value={value}>{children}</CaregiverProfileContext.Provider>
}
