import { describe, it, expect, vi, afterEach } from "vitest";
import { postJson } from "./postJson";

const reply = (status: number, body: string, ok = status < 400) =>
  ({ ok, status, text: async () => body }) as Response;

afterEach(() => vi.unstubAllGlobals());

describe("postJson", () => {
  it("returns the parsed body on success", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => reply(200, '{"ok":true}')));
    await expect(postJson("/x", {})).resolves.toEqual({ ok: true });
  });

  it("retries a 500 and succeeds without the caller ever seeing it", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(reply(500, ""))
      .mockResolvedValueOnce(reply(200, '{"ok":true}'));
    vi.stubGlobal("fetch", fetchMock);
    await expect(postJson("/x", {})).resolves.toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("retries a dropped connection", async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new TypeError("network"))
      .mockResolvedValueOnce(reply(200, "{}"));
    vi.stubGlobal("fetch", fetchMock);
    await expect(postJson("/x", {})).resolves.toEqual({});
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("does not retry a refusal, which would be just as refused next time", async () => {
    const fetchMock = vi.fn(async () => reply(401, '{"error":"That passcode is not right."}'));
    vi.stubGlobal("fetch", fetchMock);
    await expect(postJson("/x", {})).rejects.toThrow("That passcode is not right.");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("gives up after the last delay and reports the reason", async () => {
    const fetchMock = vi.fn(async () => reply(500, "<html>Gateway</html>"));
    vi.stubGlobal("fetch", fetchMock);
    await expect(postJson("/x", {})).rejects.toThrow(/server error 500/);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("surfaces the server's own message rather than the status", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => reply(400, '{"error":"A photo is required."}')));
    await expect(postJson("/x", {})).rejects.toThrow("A photo is required.");
  });
});
