import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom"
import Register from "./Register"

const mockRegister = jest.fn()
const mockLogout = jest.fn()
jest.mock("react-router-dom", () => ({
  Link: ({ children, to }) => <a href={to}>{children}</a>,
  useNavigate: () => jest.fn(),
}), { virtual: true })
jest.mock("../contexts/AuthContext", () => ({
  useAuth: () => ({ register: mockRegister, logout: mockLogout }),
}))
jest.mock("../../../contexts/ToastContext", () => ({
  useToast: () => ({ showSuccess: jest.fn(), showError: jest.fn() }),
}))

test("requires acceptance and submits the accepted version with the registration", async () => {
  mockRegister.mockResolvedValue({ name: "Teste" })
  mockLogout.mockResolvedValue()
  render(<Register />)
  fireEvent.change(screen.getByLabelText("Nome completo"), { target: { value: "Teste" } })
  fireEvent.change(screen.getByLabelText("CPF"), { target: { value: "12345678901" } })
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: "teste@example.invalid" } })
  fireEvent.change(screen.getByLabelText("Você é um..."), { target: { value: "ROLE_CUIDADOR" } })
  fireEvent.change(screen.getByLabelText("Senha"), { target: { value: "senha123" } })
  fireEvent.change(screen.getByLabelText("Confirmar senha"), { target: { value: "senha123" } })
  fireEvent.submit(screen.getByRole("button", { name: "Registrar" }).closest("form"))
  expect(mockRegister).not.toHaveBeenCalled()
  expect(screen.getByText("É necessário aceitar os termos de uso.")).toBeInTheDocument()
  fireEvent.click(screen.getByLabelText("Li e aceito os termos de uso."))
  expect(screen.queryByText("É necessário aceitar os termos de uso.")).not.toBeInTheDocument()
  fireEvent.submit(screen.getByRole("button", { name: "Registrar" }).closest("form"))
  await waitFor(() => expect(mockRegister).toHaveBeenCalledWith(expect.objectContaining({
    aceitaTermos: true, versaoTermos: "1.0-minuta", tipoUsuario: "Cuidador",
  })))
})

test("opens and closes the terms without accepting them or submitting the form", () => {
  const { container } = render(<Register />)
  const dialog = container.querySelector("dialog")
  dialog.showModal = () => { dialog.setAttribute("open", "") }
  dialog.close = () => {
    dialog.removeAttribute("open")
    fireEvent(dialog, new Event("close"))
  }
  const trigger = screen.getByRole("button", { name: "Ler termos de uso" })
  const checkbox = screen.getByRole("checkbox", { name: "Li e aceito os termos de uso." })

  fireEvent.click(trigger)
  expect(screen.getByRole("dialog", { name: "Termos de uso" })).toBeVisible()
  expect(screen.getByText(/não substitui profissionais de saúde/i)).toBeVisible()
  expect(screen.getByRole("heading", { name: "Termos de uso" })).toHaveFocus()
  fireEvent.click(screen.getByRole("button", { name: "Fechar termos" }))
  expect(dialog).not.toBeVisible()
  expect(trigger).toHaveFocus()
  expect(checkbox).not.toBeChecked()

  fireEvent.click(trigger)
  fireEvent.click(screen.getByRole("button", { name: "Voltar ao cadastro" }))
  expect(dialog).not.toBeVisible()
  expect(checkbox).not.toBeChecked()

  fireEvent.click(trigger)
  fireEvent.keyDown(dialog, { key: "Escape" })
  expect(dialog).not.toBeVisible()
  expect(trigger).toHaveFocus()
  expect(checkbox).not.toBeChecked()
})
