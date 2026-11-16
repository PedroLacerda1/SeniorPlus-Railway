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
  expect(screen.getByText(/não substitui profissionais de saúde/i)).toBeInTheDocument()
  fireEvent.submit(screen.getByRole("button", { name: "Registrar" }).closest("form"))
  expect(mockRegister).not.toHaveBeenCalled()
  expect(screen.getByText("É necessário aceitar os termos de uso.")).toBeInTheDocument()
  fireEvent.click(screen.getByLabelText("Li e aceito os termos de uso."))
  fireEvent.submit(screen.getByRole("button", { name: "Registrar" }).closest("form"))
  await waitFor(() => expect(mockRegister).toHaveBeenCalledWith(expect.objectContaining({
    aceitaTermos: true, versaoTermos: "1.0-minuta", tipoUsuario: "Cuidador",
  })))
})
