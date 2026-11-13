import { StatusOutbox } from "@prisma/client";
import { OutboxPublisher } from "./outbox-publisher";

describe("OutboxPublisher", () => {
  const message = {
    id: "message-1", aggregateId: "order-1", tipo: "CreateQuote", versao: 1,
    payload: { target: "billing", data: { value: 100 } }, correlationId: "correlation-1",
    sagaId: "saga-1", status: StatusOutbox.PENDENTE, tentativas: 0,
    proximaTentativaEm: null, criadoEm: new Date(), publicadoEm: null
  };

  it("publica comando e confirma a outbox", async () => {
    const prisma = {
      outboxMensagem: {
        findMany: jest.fn().mockResolvedValue([message]),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        update: jest.fn()
      }
    };
    const transport = { sendCommand: jest.fn().mockResolvedValue(undefined) };
    const publisher = new OutboxPublisher(prisma as never, transport as never, { billing: "billing-url", execution: "execution-url" });

    await expect(publisher.publishPending()).resolves.toBe(1);
    expect(transport.sendCommand).toHaveBeenCalledWith("billing-url", expect.objectContaining({
      messageId: "message-1", messageKind: "command", messageType: "CreateQuote", sagaId: "saga-1"
    }));
    expect(prisma.outboxMensagem.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ status: StatusOutbox.PUBLICADA })
    }));
  });

  it("agenda retentativa quando a publicacao falha", async () => {
    const prisma = {
      outboxMensagem: {
        findMany: jest.fn().mockResolvedValue([message]),
        updateMany: jest.fn(),
        update: jest.fn().mockResolvedValue(message)
      }
    };
    const transport = { sendCommand: jest.fn().mockRejectedValue(new Error("SQS indisponivel")) };
    const publisher = new OutboxPublisher(prisma as never, transport as never, { billing: "billing-url", execution: "execution-url" });

    await expect(publisher.publishPending()).resolves.toBe(1);
    expect(prisma.outboxMensagem.update).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ tentativas: 1, status: StatusOutbox.PENDENTE })
    }));
  });
});
