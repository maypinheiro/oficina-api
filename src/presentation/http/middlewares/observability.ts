import { randomUUID } from "node:crypto";
import { NextFunction, Request, Response } from "express";

import { log } from "../../../shared/observability/logger";
import { activeTraceId, metrics } from "../../../shared/observability/telemetry";

export function observeHttp(request: Request, response: Response, next: NextFunction): void {
  const startedAt = process.hrtime.bigint();
  const supplied = request.header("x-correlation-id");
  const correlationId = supplied && /^[\w.-]{1,128}$/.test(supplied) ? supplied : randomUUID();
  const traceId = activeTraceId();
  response.setHeader("x-correlation-id", correlationId);
  response.locals.correlationId = correlationId;
  response.locals.traceId = traceId;

  response.on("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
    const route = normalizedRoute(request);
    const tags = [`method:${request.method}`, `route:${route}`, `status:${response.statusCode}`];
    metrics.increment("http.requests", 1, tags);
    metrics.histogram("http.request.duration_ms", durationMs, tags);
    if (response.statusCode >= 500) metrics.increment("http.errors", 1, tags);
    if (request.method === "POST" && request.path === "/ordens-servico" && response.statusCode < 400) {
      metrics.increment("os.created", 1);
    }
    if (request.path.includes("/ordens-servico/") && response.statusCode >= 400) {
      metrics.increment("os.operation_errors", 1, tags);
    }
    log(response.statusCode >= 500 ? "error" : "info", "http_request_completed", {
      route, method: request.method, statusHttp: response.statusCode, durationMs,
      correlationId, traceId, numeroOs: extractOrderNumber(request.path),
      errorType: response.statusCode >= 500 ? "http_5xx" : undefined
    });
  });
  next();
}

function normalizedRoute(request: Request): string {
  return request.route?.path ? `${request.baseUrl}${String(request.route.path)}` : request.path;
}

function extractOrderNumber(path: string): string | undefined {
  return path.match(/\/ordens-servico\/([^/]+)/)?.[1];
}
