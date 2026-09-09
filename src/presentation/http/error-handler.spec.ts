import { Prisma } from "@prisma/client";
import { z } from "zod";

import { DomainError } from "../../shared/domain/domain-error";
import { errorHandler } from "./error-handler";
import { HttpError } from "./http-error";

function createResponse() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
  };
}

describe("errorHandler", () => {
  it("responde erro de validacao zod", () => {
    const response = createResponse();
    const result = z.object({ nome: z.string() }).safeParse({});

    if (result.success) {
      throw new Error("Teste invalido");
    }

    errorHandler(result.error, {} as never, response as never, jest.fn());

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith({
      message: "Dados invalidos",
      issues: result.error.issues
    });
  });

  it("responde HttpError", () => {
    const response = createResponse();

    errorHandler(new HttpError(404, "Nao encontrado"), {} as never, response as never, jest.fn());

    expect(response.status).toHaveBeenCalledWith(404);
    expect(response.json).toHaveBeenCalledWith({ message: "Nao encontrado" });
  });

  it("responde DomainError", () => {
    const response = createResponse();

    errorHandler(new DomainError("Regra invalida"), {} as never, response as never, jest.fn());

    expect(response.status).toHaveBeenCalledWith(422);
    expect(response.json).toHaveBeenCalledWith({ message: "Regra invalida" });
  });

  it("responde conflito em violacao unica do Prisma", () => {
    const response = createResponse();
    const error = new Prisma.PrismaClientKnownRequestError("Unique failed", {
      code: "P2002",
      clientVersion: "test"
    });

    errorHandler(error, {} as never, response as never, jest.fn());

    expect(response.status).toHaveBeenCalledWith(409);
  });

  it("responde not found em registro inexistente do Prisma", () => {
    const response = createResponse();
    const error = new Prisma.PrismaClientKnownRequestError("Not found", {
      code: "P2025",
      clientVersion: "test"
    });

    errorHandler(error, {} as never, response as never, jest.fn());

    expect(response.status).toHaveBeenCalledWith(404);
  });

  it("responde erro interno para erro inesperado", () => {
    const response = createResponse();

    errorHandler(new Error("boom"), {} as never, response as never, jest.fn());

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith({ message: "Erro interno" });
  });
});
