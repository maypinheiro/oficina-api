import { Prisma } from "@prisma/client";
import { ErrorRequestHandler } from "express";
import { ZodError } from "zod";

import { DomainError } from "../../shared/domain/domain-error";
import { ApplicationError } from "../../shared/application/application-error";
import { HttpError } from "./http-error";
import { log } from "../../shared/observability/logger";
import { metrics } from "../../shared/observability/telemetry";

export const errorHandler: ErrorRequestHandler = (error, request, response, _next) => {
  void _next;
  const errorType = error instanceof Error ? error.name : "UnknownError";
  log("error", "request_failed", {
    route: request.path, method: request.method, correlationId: response.locals?.correlationId,
    traceId: response.locals?.traceId, errorType
  });
  metrics.increment("application.errors", 1, [`error_type:${errorType}`, `route:${request.path}`]);

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
