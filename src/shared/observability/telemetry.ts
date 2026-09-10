import tracer from "dd-trace";
import StatsD from "hot-shots";

tracer.init({
  service: process.env.DD_SERVICE ?? "oficina-api",
  env: process.env.DD_ENV ?? process.env.NODE_ENV ?? "local",
  version: process.env.DD_VERSION,
  logInjection: true,
  runtimeMetrics: true,
  sampleRate: Number(process.env.DD_TRACE_SAMPLE_RATE ?? "1")
});

export const metrics = new StatsD({
  host: process.env.DD_AGENT_HOST ?? "127.0.0.1",
  port: Number(process.env.DD_DOGSTATSD_PORT ?? "8125"),
  prefix: "oficina.",
  globalTags: {
    service: process.env.DD_SERVICE ?? "oficina-api",
    env: process.env.DD_ENV ?? process.env.NODE_ENV ?? "local"
  },
  errorHandler: (error) => console.warn(JSON.stringify({
    timestamp: new Date().toISOString(), level: "warn", service: "oficina-api",
    message: "dogstatsd_error", errorType: error.name
  }))
});

export function activeTraceId(): string | undefined {
  return tracer.scope().active()?.context().toTraceId();
}
