import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom"
import ChatModal from "./ChatModal"
import { api } from "../tela-auth/src/services/api"

const mockShowError = jest.fn()
const mockIsCaregiver = () => true
const mockElderly = { cpf: "12345678901", name: "Idoso" }
const mockUser = { id: 1, cpf: "11111111111", name: "Cuidador", role: "caregiver" }
jest.mock("../tela-cuidador/src/contexts/UserContext", () => ({
  useUser: () => ({ elderlyData: mockElderly, isCareGiver: mockIsCaregiver }),
}))
jest.mock("../tela-auth/src/contexts/AuthContext", () => ({
  useAuth: () => ({ currentUser: mockUser }),
}))
jest.mock("../contexts/ThemeContext", () => ({ useTheme: () => ({ darkMode: false }) }))
jest.mock("../contexts/ChatContext", () => ({ useChat: () => ({ isOpen: true, closeChat: jest.fn() }) }))
jest.mock("../contexts/ToastContext", () => ({ useToast: () => ({ showError: mockShowError }) }))
jest.mock("../tela-auth/src/services/api", () => ({
  api: { get: jest.fn(), getMensagensDoIdoso: jest.fn(), enviarMensagem: jest.fn() },
}))

beforeEach(() => {
  jest.clearAllMocks()
  HTMLElement.prototype.scrollTo = jest.fn()
  api.get.mockResolvedValue([mockElderly])
  api.getMensagensDoIdoso.mockResolvedValue([])
})

test("sends a caregiver message to the selected resident", async () => {
  api.enviarMensagem.mockResolvedValue({ id: 12, conteudo: "Olá", idosoCpf: mockElderly.cpf })
  render(<ChatModal />)
  const input = await screen.findByPlaceholderText("Digite sua mensagem...")
  fireEvent.change(input, { target: { value: "Olá" } })
  fireEvent.submit(input.closest("form"))
  await waitFor(() => expect(api.enviarMensagem).toHaveBeenCalledWith(
    expect.objectContaining({ cpf: mockElderly.cpf }), expect.objectContaining({ conteudo: "Olá" }),
  ))
})

test("removes the optimistic message and restores the draft if sending fails", async () => {
  api.enviarMensagem.mockRejectedValue(new Error("Falha no envio"))
  const log = jest.spyOn(console, "error").mockImplementation(() => {})
  render(<ChatModal />)
  const input = await screen.findByPlaceholderText("Digite sua mensagem...")
  fireEvent.change(input, { target: { value: "Mensagem de teste" } })
  fireEvent.submit(input.closest("form"))
  await waitFor(() => expect(mockShowError).toHaveBeenCalledWith("Falha no envio"))
  expect(input).toHaveValue("Mensagem de teste")
  expect(screen.queryByText("Mensagem de teste")).not.toBeInTheDocument()
  log.mockRestore()
})
