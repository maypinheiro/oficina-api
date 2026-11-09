import { DeleteMessageCommand, ReceiveMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
import { parseQueueBody } from "../../../shared/messaging/message-envelope";
import { log } from "../../../shared/observability/logger";
import { PrismaSagaOrchestrator } from "./prisma-saga-orchestrator";

const wait = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));

export class SqsSagaEventWorker {
  private running = false;
  constructor(private readonly client: SQSClient, private readonly queueUrl: string, private readonly orchestrator: PrismaSagaOrchestrator) {}

  async start(): Promise<void> {
    if (this.running) return;
    this.running = true;
    log("info", "saga_event_worker_started", { queueUrl: this.queueUrl });
    while (this.running) {
      try {
        const result = await this.client.send(new ReceiveMessageCommand({ QueueUrl: this.queueUrl, MaxNumberOfMessages: 10, WaitTimeSeconds: 20, VisibilityTimeout: 60, MessageAttributeNames: ["All"] }));
        for (const message of result.Messages ?? []) {
          if (!message.Body || !message.ReceiptHandle) continue;
          await this.orchestrator.consume(parseQueueBody(message.Body));
          await this.client.send(new DeleteMessageCommand({ QueueUrl: this.queueUrl, ReceiptHandle: message.ReceiptHandle }));
        }
      } catch (error) {
        log("error", "saga_event_worker_iteration_failed", { errorType: error instanceof Error ? error.name : "UnknownError" });
        if (this.running) await wait(1000);
      }
    }
  }
  stop(): void { this.running = false; }
}
