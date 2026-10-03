import { createContext, useState, useContext, useEffect, useCallback } from "react"
import { useAuth } from "../../../tela-auth/src/contexts/AuthContext"

const UserContext = createContext()

export const useUser = () => useContext(UserContext)

export const UserProvider = ({ children }) => {
  const { currentUser } = useAuth()
  const accountKey = currentUser?.cpf || currentUser?.id || currentUser?.email || currentUser?.username || null
  const storageKey = accountKey ? `seniorplus:elderly-data:${accountKey}` : null

  const [elderlyState, setElderlyState] = useState({ accountKey: null, data: null })
  const elderlyData = elderlyState.accountKey === accountKey ? elderlyState.data : null

  const isCareGiver = useCallback(() => {
    if (!currentUser) return false
    return currentUser.role === "caregiver"
  }, [currentUser])

  // Atualiza elderlyData quando currentUser mudar
  useEffect(() => {
    if (!accountKey || !storageKey) {
      setElderlyState({ accountKey: null, data: null })
      return
    }

    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) {
        setElderlyState({ accountKey, data: JSON.parse(raw) })
        return
      }
    } catch (error) {
      console.warn("Falha ao carregar dados do idoso da conta atual", error)
    }

    const emptyData = isCareGiver() ? {
      name: "",
      id: "",
      age: "",
      cpf: "",
      bloodType: "",
      maritalStatus: "",
      gender: "",
      allergies: [],
      address: "",
      phone: "",
      email: "",
      emergencyContact: "",
      emergencyContactName: "",
      medicalConditions: [],
      medications: [],
    } : null
    setElderlyState({ accountKey, data: emptyData })
  }, [accountKey, isCareGiver, storageKey])

  // Persist only data owned by the currently authenticated account.
  useEffect(() => {
    if (!storageKey || elderlyState.accountKey !== accountKey || !elderlyState.data) {
      return
    }
    localStorage.setItem(storageKey, JSON.stringify(elderlyState.data))
  }, [accountKey, elderlyState, storageKey])

  const setElderlyData = useCallback((update) => {
    if (!accountKey) return
    setElderlyState((previous) => {
      const previousData = previous.accountKey === accountKey ? previous.data : null
      const data = typeof update === "function" ? update(previousData) : update
      return { accountKey, data }
    })
  }, [accountKey])

  // Atualiza dados do idoso de forma merge
  const updateElderlyData = useCallback((data) => {
    setElderlyData((prev) => {
      const updatedData = { ...prev, ...data }
      return updatedData
    })
  }, [setElderlyData])

  // Função para verificar se o usuário atual é idoso
  const isElderly = () => {
    if (!currentUser) return false
    return currentUser.role === "elderly"
  }

  return (
    <UserContext.Provider
      value={{
        elderlyData,
        updateElderlyData,
        user: elderlyData, // para compatibilidade com código existente
        isCareGiver,
        isElderly,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export default UserProvider
