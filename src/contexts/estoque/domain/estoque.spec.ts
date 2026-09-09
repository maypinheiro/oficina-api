import { DomainError } from "../../../shared/domain/domain-error";
import { Estoque } from "./estoque";

describe("Estoque", () => {
  it("reserva pecas movendo quantidade disponivel para reservada", () => {
    const estoque = Estoque.create("estoque-1", {
      pecaId: "peca-1",
      quantidadeDisponivel: 10,
      quantidadeReservada: 0
    });

    estoque.reservar(3);

    expect(estoque.quantidadeDisponivel).toBe(7);
    expect(estoque.quantidadeReservada).toBe(3);
  });

  it("libera reserva devolvendo quantidade para disponivel", () => {
    const estoque = Estoque.create("estoque-1", {
      pecaId: "peca-1",
      quantidadeDisponivel: 7,
      quantidadeReservada: 3
    });

    estoque.liberarReserva(2);

    expect(estoque.quantidadeDisponivel).toBe(9);
    expect(estoque.quantidadeReservada).toBe(1);
  });

  it("consome reserva removendo quantidade reservada", () => {
    const estoque = Estoque.create("estoque-1", {
      pecaId: "peca-1",
      quantidadeDisponivel: 7,
      quantidadeReservada: 3
    });

    estoque.consumirReserva(3);

    expect(estoque.quantidadeDisponivel).toBe(7);
    expect(estoque.quantidadeReservada).toBe(0);
  });

  it("rejeita reserva maior que o estoque disponivel", () => {
    const estoque = Estoque.create("estoque-1", {
      pecaId: "peca-1",
      quantidadeDisponivel: 1,
      quantidadeReservada: 0
    });

    expect(() => estoque.reservar(2)).toThrow(DomainError);
  });

  it("rejeita estoque com quantidade negativa", () => {
    expect(() =>
      Estoque.create("estoque-1", {
        pecaId: "peca-1",
        quantidadeDisponivel: -1,
        quantidadeReservada: 0
      })
    ).toThrow(DomainError);
  });

  it("rejeita operacoes com quantidade nao positiva", () => {
    const estoque = Estoque.create("estoque-1", {
      pecaId: "peca-1",
      quantidadeDisponivel: 1,
      quantidadeReservada: 1
    });

    expect(() => estoque.reservar(0)).toThrow(DomainError);
    expect(() => estoque.liberarReserva(0)).toThrow(DomainError);
    expect(() => estoque.consumirReserva(0)).toThrow(DomainError);
  });

  it("rejeita liberar ou consumir reserva inexistente", () => {
    const estoque = Estoque.create("estoque-1", {
      pecaId: "peca-1",
      quantidadeDisponivel: 1,
      quantidadeReservada: 0
    });

    expect(() => estoque.liberarReserva(1)).toThrow(DomainError);
    expect(() => estoque.consumirReserva(1)).toThrow(DomainError);
  });
});
