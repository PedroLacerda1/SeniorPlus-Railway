import { api } from "./api"

const originalFetch = global.fetch
afterEach(() => {
  api.setAuthToken(null)
  global.fetch = originalFetch
  jest.restoreAllMocks()
})

test("loads only a valid private profile image through the authenticated API", async () => {
  const blob = new Blob(["photo"], { type: "image/png" })
  const fetchMock = jest.fn().mockResolvedValue({ ok: true, blob: async () => blob })
  global.fetch = fetchMock
  api.setAuthToken("test-token")
  const reference = "profile-image:idoso:11111111111:00000000-0000-0000-0000-000000000001"
  expect(await api.getProfileImage(reference)).toBe(blob)
  expect(fetchMock).toHaveBeenCalledWith(
    expect.stringMatching(/\/api\/v1\/profile-images\/idoso\/11111111111\/00000000-0000-0000-0000-000000000001$/),
    { headers: { Authorization: "Bearer test-token" } },
  )
  await expect(api.getProfileImage("profile-image:https://untrusted.example")).rejects.toThrow()
  expect(fetchMock).toHaveBeenCalledTimes(1)
})
