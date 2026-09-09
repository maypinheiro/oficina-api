import { Router } from "express";

import { asyncHandler } from "../async-handler";
import { criarOrdemSchema, listarOrdensQuerySchema, registrarProblemaSchema } from "./schemas/ordem-servico.schemas";
import { OrdemServicoController } from "../controllers/ordem-servico.controller";
import {
  apresentarHistoricoOrdemServico,
  apresentarListaOrdensServico,
  apresentarOrdemServico,
  apresentarStatusOrdemServico
} from "../presenters/ordem-servico.presenter";

export function createOrdensServicoRouter(controller: OrdemServicoController) {
  const router = Router();

  router.post(
    "/",
    asyncHandler(async (request, response) => {
      const orcamento = await controller.criar(criarOrdemSchema.parse(request.body));

      response.status(201).json(apresentarOrdemServico(orcamento));
    })
  );

  router.get(
    "/",
    asyncHandler(async (request, response) => {
      const query = listarOrdensQuerySchema.parse(request.query);

      response.status(200).json(apresentarListaOrdensServico(await controller.listar(query)));
    })
  );

  router.get(
    "/:numeroOs/status",
    asyncHandler(async (request, response) => {
      response.status(200).json(apresentarStatusOrdemServico(await controller.consultarStatus(String(request.params.numeroOs))));
    })
  );

  router.get(
    "/:numeroOs",
    asyncHandler(async (request, response) => {
      response.status(200).json(apresentarOrdemServico(await controller.buscar(String(request.params.numeroOs))));
    })
  );

  router.get(
    "/:numeroOs/historico",
    asyncHandler(async (request, response) => {
      response.status(200).json(apresentarHistoricoOrdemServico(await controller.listarHistorico(String(request.params.numeroOs))));
    })
  );

  router.patch(
    "/:numeroOs/iniciar-diagnostico",
    asyncHandler(async (request, response) => {
      response.status(200).json(apresentarOrdemServico(await controller.iniciarDiagnostico(String(request.params.numeroOs))));
    })
  );

  router.patch(
    "/:numeroOs/registrar-problema",
    asyncHandler(async (request, response) => {
      const input = registrarProblemaSchema.parse(request.body);

      response.status(200).json(apresentarOrdemServico(await controller.registrarProblema(String(request.params.numeroOs), input.problemaIdentificado)));
    })
  );

  router.patch(
    "/:numeroOs/iniciar-execucao",
    asyncHandler(async (request, response) => {
      response.status(200).json(apresentarOrdemServico(await controller.iniciarExecucao(String(request.params.numeroOs))));
    })
  );

  router.patch(
    "/:numeroOs/finalizar",
    asyncHandler(async (request, response) => {
      response.status(200).json(apresentarOrdemServico(await controller.finalizar(String(request.params.numeroOs))));
    })
  );

  router.patch(
    "/:numeroOs/entregar",
    asyncHandler(async (request, response) => {
      response.status(200).json(apresentarOrdemServico(await controller.entregar(String(request.params.numeroOs))));
    })
  );

  return router;
}
