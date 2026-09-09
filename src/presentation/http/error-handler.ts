import { Prisma } from "@prisma/client";
import { ErrorRequestHandler } from "express";
import { ZodError } from "zod";

import { DomainError } from "../../shared/domain/domain-error";
import { ApplicationError } from "../../shared/application/application-error";
import { HttpError } from "./http-error";

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  void _next;

  if (error instanceof ZodError) {
    response.status(400).json({
      message: "Dados invalidos",
      issues: error.issues
    });
    return;
  }

  if (error instanceof HttpError) {
    response.status(error.statusCode).json({
      message: error.message
    });
    return;
  }

  if (error instanceof ApplicationError) {
    response.status(error.statusCode).json({
      message: error.message
    });
    return;
  }

  if (error instanceof DomainError) {
    response.status(422).json({
      message: error.message
    });
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      response.status(409).json({
        message: "Registro duplicado"
      });
      return;
    }

    if (error.code === "P2025") {
      response.status(404).json({
        message: "Registro nao encontrado"
      });
      return;
    }
  }

  response.status(500).json({
    message: "Erro interno"
  });
};
