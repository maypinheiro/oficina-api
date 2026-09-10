import cors from "cors";
import express, { Request, Response } from "express";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";

import { getPrismaClient } from "../../shared/infra/prisma-client";
import { authenticate } from "./middlewares/authenticate";
import { errorHandler } from "./error-handler";
import { openApiDocument } from "./swagger";
import { createAuthRouter } from "./routes/auth.routes";
import { createServicosRouter, createPecasRouter } from "./routes/catalogo.routes";
import { createClientesRouter } from "./routes/clientes.routes";
import { createEstoqueRouter } from "./routes/estoque.routes";
import { createHealthRouter } from "./routes/health.routes";
import { createMetricasRouter } from "./routes/metricas.routes";
import { createOrcamentosRouter } from "./routes/orcamentos.routes";
import { createOrdensServicoRouter } from "./routes/ordens-servico.routes";
import { createPublicRouter } from "./routes/public.routes";
import { createVeiculosRouter } from "./routes/veiculos.routes";
import { loadEnv } from "../../shared/config/env";
import { createHttpContext } from "./http-context";
import { observeHttp } from "./middlewares/observability";

type ServerOptions = {
  prisma?: ReturnType<typeof getPrismaClient>;
};

export function createServer(options: ServerOptions = {}) {
  const app = express();
  const prisma = options.prisma ?? getPrismaClient();
  const env = loadEnv();
  const httpContext = createHttpContext(prisma);

  app.use(helmet());
  app.use(cors({ origin: env.corsOrigin }));
  app.use(express.json());
  app.use(observeHttp);

  app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));
  app.use("/health", createHealthRouter(httpContext.healthController));
  app.use("/auth", createAuthRouter(httpContext.authController));
  app.use("/public", createPublicRouter(httpContext.publicController));
  app.use("/clientes", authenticate, createClientesRouter(httpContext.cadastroController));
  app.use("/veiculos", authenticate, createVeiculosRouter(httpContext.veiculoController));
  app.use("/servicos", authenticate, createServicosRouter(httpContext.catalogoController));
  app.use("/pecas", authenticate, createPecasRouter(httpContext.catalogoController));
  app.use("/estoque", authenticate, createEstoqueRouter(httpContext.estoqueController));
  app.use("/ordens-servico", authenticate, createOrdensServicoRouter(httpContext.ordemServicoController));
  app.use("/orcamentos", authenticate, createOrcamentosRouter(httpContext.orcamentoController));
  app.use("/metricas", authenticate, createMetricasRouter(httpContext.metricaController));

  app.use((_request: Request, response: Response) => {
    response.status(404).json({
      message: "Rota nao encontrada"
    });
  });

  app.use(errorHandler);

  return app;
}
