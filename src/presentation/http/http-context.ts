import { PrismaClient } from "@prisma/client";

import { AtualizarClienteUseCase, BuscarClientePorCpfCnpjUseCase, BuscarClientePorIdUseCase, CriarClienteUseCase, ListarClientesUseCase, RemoverClienteUseCase, AtualizarVeiculoUseCase, CriarVeiculoUseCase, ListarVeiculosUseCase, RemoverVeiculoUseCase } from "../../contexts/cadastro/application/cadastro.use-cases";
import { PrismaClienteCadastroRepository } from "../../contexts/cadastro/infra/prisma-cliente-cadastro.repository";
import { PrismaVeiculoCadastroRepository } from "../../contexts/cadastro/infra/prisma-veiculo-cadastro.repository";
import { AtualizarEstoqueUseCase, AtualizarPecaUseCase, AtualizarServicoUseCase, CriarPecaUseCase, CriarServicoUseCase, ListarPecasUseCase, ListarServicosUseCase, RemoverPecaUseCase, RemoverServicoUseCase, ConsultarEstoqueUseCase, ListarEstoqueUseCase } from "../../contexts/catalogo/application/catalogo.use-cases";
import { PrismaEstoqueCatalogoRepository } from "../../contexts/catalogo/infra/prisma-estoque-catalogo.repository";
import { PrismaPecaCatalogoRepository } from "../../contexts/catalogo/infra/prisma-peca-catalogo.repository";
import { PrismaServicoCatalogoRepository } from "../../contexts/catalogo/infra/prisma-servico-catalogo.repository";
import { ConsumirPecaUseCase, LiberarPecaReservadaUseCase, LiberarReservasDaOsUseCase, ReservarPecaUseCase } from "../../contexts/estoque/application/estoque.use-cases";
import { PrismaEstoqueRepository } from "../../contexts/estoque/infra/prisma-estoque.repository";
import { CalcularTempoMedioOrdensUseCase, CalcularTempoMedioServicosUseCase } from "../../contexts/metricas/application/metricas.use-cases";
import { PrismaMetricasRepository } from "../../contexts/metricas/infra/prisma-metricas.repository";
import { AprovarOrcamentoUseCase } from "../../contexts/orcamento/application/aprovar-orcamento.use-case";
import { CriarOrcamentoUseCase } from "../../contexts/orcamento/application/criar-orcamento.use-case";
import { NotificarDecisaoOrcamentoUseCase } from "../../contexts/orcamento/application/notificar-decisao-orcamento.use-case";
import { RejeitarOrcamentoUseCase } from "../../contexts/orcamento/application/rejeitar-orcamento.use-case";
import { PrismaOrcamentoRepository } from "../../contexts/orcamento/infra/prisma-orcamento.repository";
import { BuscarOrdemServicoUseCase, ConsultarStatusOrdemServicoUseCase, CriarOrdemServicoUseCase, EntregarVeiculoUseCase, FinalizarServicoUseCase, IniciarDiagnosticoUseCase, IniciarExecucaoUseCase, ListarHistoricoOrdemServicoUseCase, ListarOrdensServicoUseCase, RegistrarProblemaUseCase } from "../../contexts/atendimento/application/ordem-servico.use-cases";
import { PrismaAtualizarStatusOrdemServicoRepository } from "../../contexts/atendimento/infra/prisma-atualizar-status-ordem-servico.repository";
import { PrismaConsultarOrdemServicoRepository } from "../../contexts/atendimento/infra/prisma-consultar-ordem-servico.repository";
import { PrismaCriarOrdemServicoRepository } from "../../contexts/atendimento/infra/prisma-criar-ordem-servico.repository";
import { AuthController } from "./controllers/auth.controller";
import { CadastroController } from "./controllers/cadastro.controller";
import { CatalogoController } from "./controllers/catalogo.controller";
import { EstoqueController } from "./controllers/estoque.controller";
import { HealthController } from "./controllers/health.controller";
import { MetricasController } from "./controllers/metricas.controller";
import { OrcamentoController } from "./controllers/orcamento.controller";
import { OrdemServicoController } from "./controllers/ordem-servico.controller";
import { PublicController } from "./controllers/public.controller";
import { VeiculoController } from "./controllers/veiculo.controller";

export type HttpContext = {
  authController: AuthController;
  cadastroController: CadastroController;
  veiculoController: VeiculoController;
  catalogoController: CatalogoController;
  estoqueController: EstoqueController;
  healthController: HealthController;
  metricaController: MetricasController;
  orcamentoController: OrcamentoController;
  ordemServicoController: OrdemServicoController;
  publicController: PublicController;
};

export function createHttpContext(prisma: PrismaClient): HttpContext {
  const clienteRepository = new PrismaClienteCadastroRepository(prisma);
  const veiculoRepository = new PrismaVeiculoCadastroRepository(prisma);
  const servicoRepository = new PrismaServicoCatalogoRepository(prisma);
  const pecaRepository = new PrismaPecaCatalogoRepository(prisma);
  const estoqueCatalogoRepository = new PrismaEstoqueCatalogoRepository(prisma);
  const estoqueRepository = new PrismaEstoqueRepository(prisma);
  const metricaRepository = new PrismaMetricasRepository(prisma);
  const orcamentoRepository = new PrismaOrcamentoRepository(prisma);
  const ordemCriacaoRepository = new PrismaCriarOrdemServicoRepository(prisma);
  const ordemConsultaRepository = new PrismaConsultarOrdemServicoRepository(prisma);
  const ordemStatusRepository = new PrismaAtualizarStatusOrdemServicoRepository(prisma);

  return {
    authController: new AuthController(),
    healthController: new HealthController(),
    cadastroController: new CadastroController(
      new CriarClienteUseCase(clienteRepository),
      new ListarClientesUseCase(clienteRepository),
      new BuscarClientePorCpfCnpjUseCase(clienteRepository),
      new BuscarClientePorIdUseCase(clienteRepository),
      new AtualizarClienteUseCase(clienteRepository),
      new RemoverClienteUseCase(clienteRepository)
    ),
    veiculoController: new VeiculoController(
      new CriarVeiculoUseCase(veiculoRepository),
      new ListarVeiculosUseCase(veiculoRepository),
      new AtualizarVeiculoUseCase(veiculoRepository),
      new RemoverVeiculoUseCase(veiculoRepository)
    ),
    catalogoController: new CatalogoController(
      new CriarServicoUseCase(servicoRepository),
      new ListarServicosUseCase(servicoRepository),
      new AtualizarServicoUseCase(servicoRepository),
      new RemoverServicoUseCase(servicoRepository),
      new CriarPecaUseCase(pecaRepository),
      new ListarPecasUseCase(pecaRepository),
      new AtualizarPecaUseCase(pecaRepository),
      new RemoverPecaUseCase(pecaRepository),
      new AtualizarEstoqueUseCase(estoqueCatalogoRepository)
    ),
    estoqueController: new EstoqueController(
      new ListarEstoqueUseCase(estoqueCatalogoRepository),
      new ConsultarEstoqueUseCase(estoqueCatalogoRepository),
      new AtualizarEstoqueUseCase(estoqueCatalogoRepository),
      new ReservarPecaUseCase(estoqueRepository),
      new LiberarPecaReservadaUseCase(estoqueRepository),
      new LiberarReservasDaOsUseCase(estoqueRepository),
      new ConsumirPecaUseCase(estoqueRepository)
    ),
    metricaController: new MetricasController(
      new CalcularTempoMedioOrdensUseCase(metricaRepository),
      new CalcularTempoMedioServicosUseCase(metricaRepository)
    ),
    orcamentoController: new OrcamentoController(
      {
        criarOrcamento: new CriarOrcamentoUseCase(orcamentoRepository),
        aprovarOrcamento: new AprovarOrcamentoUseCase(orcamentoRepository),
        rejeitarOrcamento: new RejeitarOrcamentoUseCase(orcamentoRepository),
        notificarDecisao: new NotificarDecisaoOrcamentoUseCase(orcamentoRepository)
      }
    ),
    ordemServicoController: new OrdemServicoController({
      criarOrdem: new CriarOrdemServicoUseCase(ordemCriacaoRepository),
      listarOrdens: new ListarOrdensServicoUseCase(ordemConsultaRepository),
      buscarOrdem: new BuscarOrdemServicoUseCase(ordemConsultaRepository),
      consultarStatus: new ConsultarStatusOrdemServicoUseCase(ordemConsultaRepository),
      listarHistorico: new ListarHistoricoOrdemServicoUseCase(ordemConsultaRepository),
      iniciarDiagnostico: new IniciarDiagnosticoUseCase(ordemStatusRepository),
      registrarProblema: new RegistrarProblemaUseCase(ordemStatusRepository),
      iniciarExecucao: new IniciarExecucaoUseCase(ordemStatusRepository),
      finalizarServico: new FinalizarServicoUseCase(ordemStatusRepository),
      entregarVeiculo: new EntregarVeiculoUseCase(ordemStatusRepository)
    }),
    publicController: new PublicController({
      consultarStatusOrdemServico: new ConsultarStatusOrdemServicoUseCase(ordemConsultaRepository),
      notificarDecisaoOrcamento: new NotificarDecisaoOrcamentoUseCase(orcamentoRepository)
    })
  };
}
