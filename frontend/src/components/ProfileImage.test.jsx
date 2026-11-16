import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom"
import ProfileImage from "./ProfileImage"
import { api } from "../tela-auth/src/services/api"

let mockUser = { id: 1 }
jest.mock("../tela-auth/src/contexts/AuthContext", () => ({ useAuth: () => ({ currentUser: mockUser }) }))
jest.mock("../tela-auth/src/services/api", () => ({ api: { getProfileImage: jest.fn() } }))

beforeEach(() => {
  mockUser = { id: 1 }
  jest.clearAllMocks()
  URL.createObjectURL = jest.fn(() => "blob:profile-photo")
  URL.revokeObjectURL = jest.fn()
})

test("loads private profile photos through the authenticated API and revokes the object URL", async () => {
  const reference = "profile-image:idoso:11111111111:00000000-0000-0000-0000-000000000001"
  api.getProfileImage.mockResolvedValue(new Blob(["image"], { type: "image/png" }))
  const view = render(<ProfileImage src={reference} alt="Perfil" />)
  await waitFor(() => expect(screen.getByAltText("Perfil")).toHaveAttribute("src", "blob:profile-photo"))
  expect(api.getProfileImage).toHaveBeenCalledWith(reference)
  view.unmount()
  expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:profile-photo")
})

test("preserves ordinary images and reports private image errors to the fallback", async () => {
  const onError = jest.fn()
  const log = jest.spyOn(console, "error").mockImplementation(() => {})
  api.getProfileImage.mockRejectedValue(new Error("offline"))
  const view = render(<ProfileImage src="data:image/png;base64,abc" alt="Perfil" onError={onError} />)
  expect(screen.getByAltText("Perfil")).toHaveAttribute("src", "data:image/png;base64,abc")
  fireEvent.error(screen.getByAltText("Perfil"))
  expect(onError).toHaveBeenCalledTimes(1)
  view.rerender(<ProfileImage src="profile-image:idoso:11111111111:00000000-0000-0000-0000-000000000001" alt="Perfil" onError={onError} />)
  await waitFor(() => expect(onError).toHaveBeenCalledTimes(2))
  log.mockRestore()
})
