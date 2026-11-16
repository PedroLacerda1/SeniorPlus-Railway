import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { MedicationProvider, useMedication } from "./MedicationContext"
import { api } from "../../../tela-auth/src/services/api"

jest.mock("../../../tela-auth/src/contexts/AuthContext", () => ({
  useAuth: () => ({ currentUser: { id: 1, name: "Cuidador" } }),
}))
jest.mock("./UserContext", () => ({
  useUser: () => ({ elderlyData: { cpf: "12345678901", name: "Idoso" } }),
}))
jest.mock("../../../contexts/ToastContext", () => ({
  useToast: () => ({ showSuccess: jest.fn(), showError: jest.fn(), showWarning: jest.fn() }),
}))
jest.mock("../../../tela-auth/src/services/api", () => ({
  api: { listMedicamentos: jest.fn(), updateMedicamento: jest.fn() },
}))

function MedicationProbe() {
  const { medications, updateMedication } = useMedication()
  const medication = medications[0]
  if (!medication) return null
  return (
    <>
      <span>{medication.time}</span>
      <button onClick={() => updateMedication(medication.id, { time: "09:15, 21:15" })}>Alterar horários</button>
    </>
  )
}

test("keeps loaded medication times visible and sends edited times to the server", async () => {
  window.localStorage.clear()
  api.listMedicamentos.mockResolvedValue([{
    id: 1, nomeMedicamento: "Teste", dosagem: "Teste", dataInicio: "2026-11-16",
    horarios: ["10:47:00", "18:30:00"], status: "active",
  }])
  api.updateMedicamento.mockResolvedValue({})
  render(<MedicationProvider><MedicationProbe /></MedicationProvider>)

  expect(await screen.findByText("10:47, 18:30")).not.toBeNull()
  fireEvent.click(screen.getByText("Alterar horários"))
  await waitFor(() => expect(api.updateMedicamento).toHaveBeenCalledWith(
    1, expect.objectContaining({ horarios: ["09:15", "21:15"] }),
  ))
  expect(screen.getByText("09:15, 21:15")).not.toBeNull()
})
