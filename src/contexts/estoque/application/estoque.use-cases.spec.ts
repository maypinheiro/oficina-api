import {
  ConsumirPecaUseCase,
  LiberarPecaReservadaUseCase,
  LiberarReservasDaOsUseCase,
  ReservarPecaUseCase
} from "./estoque.use-cases";
import { EstoqueRepository } from "./estoque.repository";

describe("Estoque use cases", () => {
  const repository: jest.Mocked<EstoqueRepository> = {
    reservarPeca: jest.fn(),
    liberarPecaReservada: jest.fn(),
    liberarReservasDaOs: jest.fn(),
    consumirPeca: jest.fn()
  };

  beforeEach(() => jest.clearAllMocks());

  it("delegam operacoes para o repositorio", async () => {
    await new ReservarPecaUseCase(repository).execute("Filtro de oleo", 1);
    await new LiberarPecaReservadaUseCase(repository).execute("Filtro de oleo", 1);
    await new LiberarReservasDaOsUseCase(repository).execute("OS-1");
    await new ConsumirPecaUseCase(repository).execute("Filtro de oleo", 1);

    expect(repository.reservarPeca).toHaveBeenCalledWith("Filtro de oleo", 1);
    expect(repository.liberarPecaReservada).toHaveBeenCalledWith("Filtro de oleo", 1);
    expect(repository.liberarReservasDaOs).toHaveBeenCalledWith("OS-1");
    expect(repository.consumirPeca).toHaveBeenCalledWith("Filtro de oleo", 1);
  });
});
