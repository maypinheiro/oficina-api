import { gerarNumeroOs } from "./numero-os";

describe("Numero da ordem de servico", () => {
  it("gera numero baseado no timestamp", () => {
    expect(gerarNumeroOs(new Date(1_700_000_000_000))).toBe("OS-1700000000000");
  });
});
