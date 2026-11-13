import "./shared/observability/telemetry";

import { createServer } from "./presentation/http/server";
import { loadEnv } from "./shared/config/env";
import { log } from "./shared/observability/logger";
import { getPrismaClient } from "./shared/infra/prisma-client";
import { PrismaSagaOrchestrator } from "./contexts/saga/infra/prisma-saga-orchestrator";
import { OutboxPublisher } from "./contexts/saga/infra/outbox-publisher";
import { SqsSagaEventWorker } from "./contexts/saga/infra/sqs-saga-event-worker";
import { AwsMessageTransport } from "./shared/messaging/aws-transport";
import { SQSClient } from "@aws-sdk/client-sqs";

const env = loadEnv();
const prisma = getPrismaClient();
const app = createServer({ prisma });

app.listen(env.port, () => {
  log("info", "application_started", { port: env.port });
});

if (env.sagaEnabled && env.osEventsQueueUrl && env.billingCommandQueueUrl && env.executionCommandQueueUrl) {
  const orchestrator = new PrismaSagaOrchestrator(prisma);
  const outbox = new OutboxPublisher(prisma, new AwsMessageTransport(), {
    billing: env.billingCommandQueueUrl,
    execution: env.executionCommandQueueUrl
  });
  const events = new SqsSagaEventWorker(new SQSClient({}), env.osEventsQueueUrl, orchestrator);
  void outbox.start();
  void events.start();
  for (const signal of ["SIGTERM", "SIGINT"] as const) {
    process.once(signal, () => { outbox.stop(); events.stop(); });
  }
} else {
  log("warn", "saga_runtime_disabled", { reason: "Saga disabled or queue URLs not configured" });
}
