import { fireEvent, render, screen } from "@testing-library/react"
import Relatorios from "./Relatorios"

jest.mock("../contexts/EventsContext", () => ({
  useEvents: () => ({
    events: [{ id: 1, date: "2026-11-16", category: "Consulta", title: "Teste", startTime: "10:00", endTime: "11:00" }],
  }),
}))
jest.mock("../contexts/MedicationContext", () => ({
  useMedication: () => ({ medications: [], medicationHistory: [] }),
}))
jest.mock("../contexts/UserContext", () => ({ useUser: () => ({ user: { name: "Idoso", age: null } }) }))
jest.mock("../../../contexts/ToastContext", () => ({ useToast: () => ({ showSuccess: jest.fn(), showError: jest.fn() }) }))
jest.mock("../../../contexts/ThemeContext", () => ({ useTheme: () => ({ darkMode: false }) }))
jest.mock("../../../components/BackButton", () => () => null)

test("plots an event on its local calendar date", () => {
  const fillText = jest.fn()
  const context = {
    setTransform: jest.fn(), clearRect: jest.fn(), fillText, save: jest.fn(), restore: jest.fn(),
    setLineDash: jest.fn(), beginPath: jest.fn(), moveTo: jest.fn(), lineTo: jest.fn(), stroke: jest.fn(),
    fillRect: jest.fn(), arc: jest.fn(), fill: jest.fn(), closePath: jest.fn(),
    measureText: () => ({ width: 10 }),
    createLinearGradient: () => ({ addColorStop: jest.fn() }),
  }
  const getContext = jest.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(context)
  const dimensions = jest.spyOn(HTMLCanvasElement.prototype, "getBoundingClientRect").mockReturnValue({ width: 400, height: 300 })

  render(<Relatorios />)
  fireEvent.change(screen.getByLabelText("De:"), { target: { value: "2026-11-16" } })
  fireEvent.change(screen.getByLabelText("Até:"), { target: { value: "2026-11-16" } })

  expect(screen.getByText("Teste")).not.toBeNull()
  expect(screen.getByText("Idade: Não informada")).not.toBeNull()
  expect(fillText).toHaveBeenCalledWith("16/11", expect.any(Number), expect.any(Number))
  getContext.mockRestore()
  dimensions.mockRestore()
})
