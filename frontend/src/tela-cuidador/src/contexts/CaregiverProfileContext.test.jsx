import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom"
import { CaregiverProfileProvider, useCaregiverProfile } from "./CaregiverProfileContext"
import { api } from "../../../tela-auth/src/services/api"

let mockUser
const mockShowError = jest.fn()
jest.mock("../../../tela-auth/src/contexts/AuthContext", () => ({
  useAuth: () => ({ currentUser: mockUser }),
}))
jest.mock("../../../contexts/ToastContext", () => ({
  useToast: () => ({ showError: mockShowError }),
}))
jest.mock("../../../tela-auth/src/services/api", () => ({
  api: { get: jest.fn(), put: jest.fn() },
}))

function Probe() {
  const { caregiverProfile, profileLoading, profileUnavailable, updateCaregiverProfile } = useCaregiverProfile()
  return <>
    <span>{caregiverProfile.displayName}</span>
    <span>{profileLoading ? "carregando" : profileUnavailable ? "indisponível" : "pronto"}</span>
    <button onClick={() => updateCaregiverProfile({ ...caregiverProfile, displayName: "Atualizado" }).catch(() => {})}>Salvar</button>
  </>
}

beforeEach(() => {
  localStorage.clear()
  jest.clearAllMocks()
  mockUser = { id: 1, cpf: "11111111111", role: "caregiver", name: "Original" }
})

test("preserves legacy data until a successful server save and reloads the remote profile", async () => {
  localStorage.setItem("seniorplus:caregiver-profile:11111111111", JSON.stringify({ displayName: "Legado" }))
  api.get.mockResolvedValueOnce(null).mockResolvedValueOnce({ displayName: "Atualizado" })
  api.put.mockResolvedValue({ displayName: "Atualizado" })
  const view = render(<CaregiverProfileProvider><Probe /></CaregiverProfileProvider>)
  expect(await screen.findByText("pronto")).toBeInTheDocument()
  expect(screen.getByText("Legado")).toBeInTheDocument()
  fireEvent.click(screen.getByText("Salvar"))
  await waitFor(() => expect(screen.getByText("Atualizado")).toBeInTheDocument())
  expect(api.put).toHaveBeenCalledWith("/api/v1/caregiver-profile", expect.objectContaining({ displayName: "Atualizado" }))
  view.unmount()
  render(<CaregiverProfileProvider><Probe /></CaregiverProfileProvider>)
  expect(await screen.findByText("Atualizado")).toBeInTheDocument()
  await waitFor(() => expect(api.get).toHaveBeenCalledTimes(2))
})

test("does not commit a failed save and reports a failed load", async () => {
  api.get.mockResolvedValueOnce(null).mockRejectedValueOnce(new Error("offline"))
  api.put.mockRejectedValue(new Error("offline"))
  const log = jest.spyOn(console, "error").mockImplementation(() => {})
  const view = render(<CaregiverProfileProvider><Probe /></CaregiverProfileProvider>)
  await screen.findByText("pronto")
  fireEvent.click(screen.getByText("Salvar"))
  await waitFor(() => expect(api.put).toHaveBeenCalled())
  expect(screen.getByText("Original")).toBeInTheDocument()
  view.unmount()
  render(<CaregiverProfileProvider><Probe /></CaregiverProfileProvider>)
  expect(await screen.findByText("indisponível")).toBeInTheDocument()
  expect(mockShowError).toHaveBeenCalled()
  log.mockRestore()
})

test("does not load a caregiver profile for an elderly user", async () => {
  mockUser = { id: 2, cpf: "22222222222", role: "elderly", name: "Idoso" }
  render(<CaregiverProfileProvider><Probe /></CaregiverProfileProvider>)
  await screen.findByText("pronto")
  expect(api.get).not.toHaveBeenCalled()
})

test("ignores an earlier account's response after switching accounts", async () => {
  let resolveFirst
  api.get.mockImplementationOnce(() => new Promise((resolve) => { resolveFirst = resolve }))
    .mockResolvedValueOnce({ displayName: "Segundo cuidador" })
  const view = render(<CaregiverProfileProvider><Probe /></CaregiverProfileProvider>)
  mockUser = { id: 2, cpf: "22222222222", role: "caregiver", name: "Segundo" }
  view.rerender(<CaregiverProfileProvider><Probe /></CaregiverProfileProvider>)
  expect(await screen.findByText("Segundo cuidador")).toBeInTheDocument()
  await act(async () => { resolveFirst({ displayName: "Resposta antiga" }) })
  expect(screen.getByText("Segundo cuidador")).toBeInTheDocument()
  expect(localStorage.getItem("seniorplus:caregiver-profile:11111111111")).toBeNull()
})

test("does not replace the new account's profile when an earlier save completes", async () => {
  let resolveSave
  api.get.mockResolvedValueOnce(null).mockResolvedValueOnce({ displayName: "Segundo cuidador" })
  api.put.mockImplementationOnce(() => new Promise((resolve) => { resolveSave = resolve }))
  const view = render(<CaregiverProfileProvider><Probe /></CaregiverProfileProvider>)
  await screen.findByText("pronto")
  fireEvent.click(screen.getByText("Salvar"))
  mockUser = { id: 2, cpf: "22222222222", role: "caregiver", name: "Segundo" }
  view.rerender(<CaregiverProfileProvider><Probe /></CaregiverProfileProvider>)
  expect(await screen.findByText("Segundo cuidador")).toBeInTheDocument()
  await act(async () => { resolveSave({ displayName: "Atualizado" }) })
  expect(screen.getByText("Segundo cuidador")).toBeInTheDocument()
})
