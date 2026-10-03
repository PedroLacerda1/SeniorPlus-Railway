import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { useAuth } from "../../../tela-auth/src/contexts/AuthContext"

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
  const { currentUser, updateCurrentUser } = useAuth()
  const accountIdentity = currentUser?.cpf || currentUser?.id || currentUser?.email || currentUser?.username || null
  const storageKey = accountIdentity ? `${STORAGE_PREFIX}${accountIdentity}` : null
  const [profileState, setProfileState] = useState({ storageKey: null, profile: normalizeProfile() })
  const caregiverProfile = profileState.storageKey === storageKey
    ? profileState.profile
    : normalizeProfile()

  const persist = useCallback((value) => {
    if (!storageKey || currentUser?.role !== "caregiver") return
    setProfileState((previous) => {
      const previousProfile = previous.storageKey === storageKey ? previous.profile : normalizeProfile()
      const next = normalizeProfile(typeof value === "function" ? value(previousProfile) : value)
      try {
        localStorage.setItem(storageKey, JSON.stringify(next))
      } catch (error) {
        console.warn("Falha ao persistir perfil do cuidador", error)
      }
      return { storageKey, profile: next }
    })
  }, [currentUser?.role, storageKey])

  useEffect(() => {
    if (!storageKey || currentUser?.role !== "caregiver") {
      setProfileState({ storageKey, profile: normalizeProfile() })
      return
    }

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
    localStorage.setItem(storageKey, JSON.stringify(profile))
  }, [currentUser, storageKey])

  const updateCaregiverProfile = useCallback(
    (updates = {}) => {
      if (!updates || typeof updates !== "object") return

      persist((prev) => {
        const next = normalizeProfile({
          ...prev,
          ...updates,
          updatedAt: new Date().toISOString(),
        })

        if (updateCurrentUser) {
          const patch = {}
          if (updates.displayName) patch.name = updates.displayName
          if (updates.photoUrl !== undefined) patch.photoUrl = updates.photoUrl
          if (updates.email) patch.email = updates.email
          if (updates.phone) patch.phone = updates.phone
          updateCurrentUser(patch)
        }

        return next
      })
    },
    [persist, updateCurrentUser],
  )

  const resetCaregiverProfile = useCallback(() => {
    const base = normalizeProfile()
    if (currentUser) {
      base.displayName = currentUser.name || currentUser.nome || currentUser.fullName || currentUser.username || ""
      base.email = currentUser.email || ""
    }
    persist({ ...base, updatedAt: new Date().toISOString() })
  }, [currentUser, persist])

  const value = useMemo(
    () => ({
      caregiverProfile,
      updateCaregiverProfile,
      resetCaregiverProfile,
    }),
    [caregiverProfile, updateCaregiverProfile, resetCaregiverProfile],
  )

  return <CaregiverProfileContext.Provider value={value}>{children}</CaregiverProfileContext.Provider>
}
