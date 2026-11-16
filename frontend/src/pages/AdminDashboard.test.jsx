import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom"
import AdminDashboard from "./AdminDashboard"
import { api } from "../tela-auth/src/services/api"

jest.mock("../tela-auth/src/contexts/AuthContext", () => ({
  useAuth: () => ({ currentUser: { name: "Admin", role: "admin" } }),
}))
jest.mock("../tela-auth/src/services/api", () => ({
  api: { listAdminUsers: jest.fn(), listAdminLinks: jest.fn(), getAdminReminderQueue: jest.fn() },
}))

test("shows both approximate queue counts after an administrator checks them", async () => {
  api.listAdminUsers.mockResolvedValue([])
  api.listAdminLinks.mockResolvedValue([])
  api.getAdminReminderQueue.mockResolvedValue({
    nome: "lembretes-medicacao", quantidadeAproximada: 2,
    filaFalhas: "lembretes-medicacao-failed", falhasAproximadas: 1,
  })
  render(<AdminDashboard />)
  fireEvent.click(screen.getByRole("button", { name: "Consultar fila" }))
  await waitFor(() => expect(screen.getByText(/Fila de falhas: lembretes-medicacao-failed/)).toBeInTheDocument())
  expect(screen.getByText(/Fila: lembretes-medicacao · Mensagens aproximadas: 2/)).toBeInTheDocument()
})
