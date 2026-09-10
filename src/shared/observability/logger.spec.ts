import { log } from "./logger";

describe("observability logger", () => {
  afterEach(() => jest.restoreAllMocks());

  it("gera JSON estruturado e remove campos sensiveis", () => {
    const output = jest.spyOn(console, "info").mockImplementation();

    log("info", "request", { correlationId: "corr-1", token: "jwt", cpf: "52998224725" });

    const entry = JSON.parse(String(output.mock.calls[0][0]));
    expect(entry).toMatchObject({ level: "info", service: "oficina-api", correlationId: "corr-1" });
    expect(entry.token).toBe("[REDACTED]");
    expect(entry.cpf).toBe("[REDACTED]");
    expect(entry.timestamp).toBeDefined();
  });
});
