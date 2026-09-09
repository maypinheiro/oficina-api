import { AddressInfo } from "net";

import { createServer } from "./server";

describe("HTTP server", () => {
  it("responde health check", async () => {
    const app = createServer();
    const server = app.listen(0);
    const address = server.address() as AddressInfo;

    try {
      const response = await fetch(`http://127.0.0.1:${address.port}/health`);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body).toEqual({
        status: "ok",
        service: "oficina-api"
      });
    } finally {
      server.close();
    }
  });

  it("responde 404 para rota desconhecida", async () => {
    const app = createServer();
    const server = app.listen(0);
    const address = server.address() as AddressInfo;

    try {
      const response = await fetch(`http://127.0.0.1:${address.port}/rota-inexistente`);
      const body = await response.json();

      expect(response.status).toBe(404);
      expect(body).toEqual({
        message: "Rota nao encontrada"
      });
    } finally {
      server.close();
    }
  });
});
