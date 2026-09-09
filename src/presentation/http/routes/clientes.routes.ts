import { Router } from "express";

import { asyncHandler } from "../async-handler";
import { CadastroController } from "../controllers/cadastro.controller";
import { apresentarCadastro } from "../presenters/cadastro.presenter";
import { atualizarClienteSchema, clienteSchema } from "./schemas/cadastro.schemas";

export function createClientesRouter(controller: CadastroController) {
  const router = Router();

  router.post(
    "/",
    asyncHandler(async (request, response) => {
      response.status(201).json(apresentarCadastro(await controller.criarCliente(clienteSchema.parse(request.body))));
    })
  );

  router.get(
    "/",
    asyncHandler(async (_request, response) => {
      response.status(200).json(apresentarCadastro(await controller.listarClientes()));
    })
  );

  router.get(
    "/cpf-cnpj/:valor",
    asyncHandler(async (request, response) => {
      response.status(200).json(apresentarCadastro(await controller.buscarClientePorCpfCnpj(String(request.params.valor))));
    })
  );

  router.patch(
    "/cpf-cnpj/:valor",
    asyncHandler(async (request, response) => {
      response.status(200).json(
        apresentarCadastro(await controller.atualizarCliente(String(request.params.valor), atualizarClienteSchema.parse(request.body)))
      );
    })
  );

  router.delete(
    "/cpf-cnpj/:valor",
    asyncHandler(async (request, response) => {
      response.status(200).json(apresentarCadastro(await controller.removerCliente(String(request.params.valor))));
    })
  );

  router.get(
    "/:id",
    asyncHandler(async (request, response) => {
      response.status(200).json(apresentarCadastro(await controller.buscarClientePorId(String(request.params.id))));
    })
  );

  return router;
}
