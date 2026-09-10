import { PrismaClient } from "@prisma/client";
import { AddressInfo } from "net";

import { OrdemDeServico } from "../contexts/atendimento/domain/ordem-de-servico";
import { StatusOrdemServico } from "../contexts/atendimento/domain/status-ordem-servico";
import { CpfCnpj } from "../contexts/cadastro/domain/value-objects/cpf-cnpj";
import { Email } from "../contexts/cadastro/domain/value-objects/email";
import { Placa } from "../contexts/cadastro/domain/value-objects/placa";
import { Telefone } from "../contexts/cadastro/domain/value-objects/telefone";
import { Estoque } from "../contexts/estoque/domain/estoque";
import { Orcamento } from "../contexts/orcamento/domain/orcamento";
import { StatusOrcamento } from "../contexts/orcamento/domain/status-orcamento";
import { createServer } from "../presentation/http/server";

function gerarCpf(seed: number) {
  const base = String(Math.abs(seed)).padStart(9, "0").slice(-9).split("").map(Number);
  const primeiroDigito = calcularDigitoCpf(base, 10);
  const segundoDigito = calcularDigitoCpf([...base, primeiroDigito], 11);

  return [...base, primeiroDigito, segundoDigito].join("");
}

function calcularDigitoCpf(digitos: number[], pesoInicial: number) {
  const soma = digitos.reduce((acc, digito, indice) => acc + digito * (pesoInicial - indice), 0);
  const resto = soma % 11;

  return resto < 2 ? 0 : 11 - resto;
}

const describeIf = process.env.RUN_INTEGRATION_TESTS === "true" ? describe : describe.skip;
const baseSeed = Number(String(Date.now()).slice(-9));
const cpfIntegracao = gerarCpf(baseSeed + 1);
const cpfRejeicao = gerarCpf(baseSeed + 2);
const cpfPublico = gerarCpf(baseSeed + 3);
const cpfCrud = gerarCpf(baseSeed + 4);
const servicoIntegracao = `Troca de pastilha ${baseSeed + 1}`;
const pecaIntegracao = `Pastilha ${baseSeed + 1}`;
const servicoRejeicao = `Diagnostico eletrico ${baseSeed + 2}`;
const pecaRejeicao = `Modulo eletrico ${baseSeed + 2}`;
const servicoPublico = `Revisao ${baseSeed + 3}`;
const pecaPublico = `Filtro ${baseSeed + 3}`;
const servicoCrud = `Alinhamento CRUD ${baseSeed + 4}`;
const pecaCrud = `Filtro CRUD ${baseSeed + 4}`;

describeIf("fluxo completo da oficina", () => {
  let prisma: PrismaClient;
  let server: ReturnType<ReturnType<typeof createServer>["listen"]>;
  let baseUrl = "";
  let token = "";

  beforeAll(async () => {
    prisma = new PrismaClient();
    const app = createServer({ prisma });
    server = app.listen(0);
    baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;

    await prisma.historicoStatusOS.deleteMany();
    await prisma.orcamentoPeca.deleteMany();
    await prisma.orcamentoServico.deleteMany();
    await prisma.orcamento.deleteMany();
    await prisma.ordemDeServico.deleteMany();
    await prisma.estoque.deleteMany();
    await prisma.peca.deleteMany();
    await prisma.servico.deleteMany();
    await prisma.clienteVeiculo.deleteMany();
    await prisma.veiculo.deleteMany();
    await prisma.cliente.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    server.close();
  });

  it("executa cadastro, OS, diagnostico, orcamento, aprovacao, execucao e status publico", async () => {
    const login = await post("/auth/login", {
      username: "admin",
      password: "admin"
    });
    token = login.token;

    await post(
      "/clientes",
      {
        nome: "Cliente Integracao",
        cpfCnpj: cpfIntegracao,
        email: "cliente.integracao@email.com",
        telefone: "(11) 99999-9999"
      },
      true
    );

    await post(
      "/veiculos",
      {
        placa: "ABC1D23",
        marca: "Fiat",
        modelo: "Uno",
        ano: 2020,
        cpfCnpj: cpfIntegracao
      },
      true
    );

    const servico = await post("/servicos", { nome: servicoIntegracao, preco: 150 }, true);
    const peca = await post("/pecas", { nome: pecaIntegracao, preco: 90, quantidade: 4 }, true);

    const ordem = await post(
      "/ordens-servico",
      {
        cpfCnpj: cpfIntegracao,
        placa: "ABC1D23",
        descricaoProblemaCliente: "Barulho ao frear",
        servicos: [servico.nome],
        pecas: [{ nome: peca.nome, quantidade: 2 }]
      },
      true
    );
    const numeroOs = ordem.ordemServico?.numeroOs ?? ordem.numeroOs;

    await patch(`/orcamentos/${numeroOs}/aprovar`, {}, true);
    await patch(`/ordens-servico/${numeroOs}/iniciar-execucao`, {}, true);
    await patch(`/ordens-servico/${numeroOs}/finalizar`, {}, true);
    await patch(`/ordens-servico/${numeroOs}/entregar`, {}, true);

    const status = await get(`/public/ordens-servico/${numeroOs}/status`);

    expect(status).toMatchObject({
      numeroOs,
      statusAtual: "ENTREGUE"
    });
  });

  it("mantem reserva ao rejeitar orcamento e libera estoque por acao da atendente", async () => {
    const login = await post("/auth/login", {
      username: "admin",
      password: "admin"
    });
    token = login.token;

    await post(
      "/clientes",
      {
        nome: "Cliente Rejeicao",
        cpfCnpj: cpfRejeicao,
        email: "rejeicao@email.com",
        telefone: "(11) 98888-8888"
      },
      true
    );

    await post(
      "/veiculos",
      {
        cpfCnpj: cpfRejeicao,
        placa: "DEF1G23",
        marca: "Volkswagen",
        modelo: "Gol",
        ano: 2021
      },
      true
    );

    const servico = await post("/servicos", { nome: servicoRejeicao, preco: 120 }, true);
    const peca = await post("/pecas", { nome: pecaRejeicao, preco: 200, quantidade: 3 }, true);

    const ordem = await post(
      "/ordens-servico",
      {
        cpfCnpj: cpfRejeicao,
        placa: "DEF1G23",
        descricaoProblemaCliente: "Falha intermitente",
        servicos: [servico.nome],
        pecas: [{ nome: peca.nome, quantidade: 2 }]
      },
      true
    );
    const numeroOs = ordem.ordemServico?.numeroOs ?? ordem.numeroOs;

    const rejeitada = await patch(`/orcamentos/${numeroOs}/rejeitar`, {}, true);

    expect(rejeitada.status).toBe("ORCAMENTO_REJEITADO");

    const consulta = await get("/ordens-servico?status=ORCAMENTO_REJEITADO&page=1&pageSize=5", true);

    expect(consulta.items.some((item: { numeroOs: string }) => item.numeroOs === numeroOs)).toBe(true);

    await post("/estoque/reservas/liberar-os", { numeroOs }, true);

    const pecas = await get("/pecas", true);
    const pecaAtualizada = pecas.find((item: { nome: string }) => item.nome === peca.nome);

    expect(pecaAtualizada.estoque.quantidadeDisponivel).toBe(3);
    expect(pecaAtualizada.estoque.quantidadeReservada).toBe(0);
  });

  it("aceita decisao externa de aprovacao pelo endpoint publico", async () => {
    const login = await post("/auth/login", {
      username: "admin",
      password: "admin"
    });
    token = login.token;

    await post(
      "/clientes",
      {
        nome: "Cliente Publico",
        cpfCnpj: cpfPublico,
        email: "publico@email.com",
        telefone: "(11) 91111-1111"
      },
      true
    );

    await post(
      "/veiculos",
      {
        cpfCnpj: cpfPublico,
        placa: "JKL1M23",
        marca: "Toyota",
        modelo: "Corolla",
        ano: 2022
      },
      true
    );

    await post("/servicos", { nome: servicoPublico, preco: 200 }, true);
    await post("/pecas", { nome: pecaPublico, preco: 50, quantidade: 2 }, true);

    const ordem = await post(
      "/ordens-servico",
      {
        cpfCnpj: cpfPublico,
        placa: "JKL1M23",
        descricaoProblemaCliente: "Revisao geral",
        servicos: [servicoPublico],
        pecas: [{ nome: pecaPublico, quantidade: 1 }]
      },
      true
    );
    const numeroOs = ordem.ordemServico?.numeroOs ?? ordem.numeroOs;

    const respostaPublica = await request("POST", "/public/orcamentos/notificacoes/aprovacao", {
      numeroOs,
      decisao: "APROVADO",
      origem: "webhook"
    });

    expect(respostaPublica.status).toBe(200);
    expect(respostaPublica.body.status).toBe("APROVADA");

    const status = await get(`/public/ordens-servico/${numeroOs}/status`);
    expect(status.statusAtual).toBe("APROVADA");
  });

  it("valida seguranca, erros HTTP e operacoes auxiliares de cadastro, catalogo, estoque e metricas", async () => {
    const semToken = await request("GET", "/clientes");
    expect(semToken.status).toBe(401);
    expect(semToken.body.message).toBe("Token JWT obrigatorio");

    token = "token-invalido";
    const tokenInvalido = await request("GET", "/clientes", undefined, true);
    expect(tokenInvalido.status).toBe(401);
    expect(tokenInvalido.body.message).toBe("Token JWT invalido");

    const loginInvalido = await request("POST", "/auth/login", {
      username: "admin",
      password: "senha-errada"
    });
    expect(loginInvalido.status).toBe(401);
    expect(loginInvalido.body.message).toBe("Credenciais invalidas");

    const login = await post("/auth/login", {
      username: "admin",
      password: "admin"
    });
    token = login.token;

    const rotaInexistente = await request("GET", "/rota-inexistente");
    expect(rotaInexistente.status).toBe(404);

    const clienteInvalido = await request(
      "POST",
      "/clientes",
      {
        nome: "",
        cpfCnpj: "",
        email: "",
        telefone: ""
      },
      true
    );
    expect(clienteInvalido.status).toBe(400);
    expect(clienteInvalido.body.message).toBe("Dados invalidos");

    const cliente = await post(
      "/clientes",
      {
        nome: "Cliente CRUD",
        cpfCnpj: cpfCrud,
        email: "crud@email.com",
        telefone: "(21) 97777-7777"
      },
      true
    );

    const duplicado = await request(
      "POST",
      "/clientes",
      {
        nome: "Cliente CRUD",
        cpfCnpj: cpfCrud,
        email: "crud.duplicado@email.com",
        telefone: "(21) 96666-6666"
      },
      true
    );
    expect(duplicado.status).toBe(409);
    expect(duplicado.body.message).toBe("Registro duplicado");

    const clientes = await get("/clientes", true);
    expect(clientes.some((item: { cpfCnpj: string }) => item.cpfCnpj === cliente.cpfCnpj)).toBe(true);

    const clientePorCpf = await get(`/clientes/cpf-cnpj/${cpfCrud}`, true);
    expect(clientePorCpf.id).toBe(cliente.id);

    const clientePorId = await get(`/clientes/${cliente.id}`, true);
    expect(clientePorId.cpfCnpj).toBe(cliente.cpfCnpj);
    expect(clientePorId.status).toBe("ATIVO");

    const clienteAtualizado = await patch(
      `/clientes/cpf-cnpj/${cpfCrud}`,
      {
        nome: "Cliente CRUD Atualizado",
        email: "crud.atualizado@email.com",
        status: "INATIVO"
      },
      true
    );
    expect(clienteAtualizado.nome).toBe("Cliente CRUD Atualizado");
    expect(clienteAtualizado.status).toBe("INATIVO");

    const veiculo = await post(
      "/veiculos",
      {
        placa: "GHI1J23",
        marca: "Honda",
        modelo: "Fit",
        ano: 2019,
        cpfCnpj: cpfCrud
      },
      true
    );
    expect(veiculo.placa).toBe("GHI1J23");

    const veiculos = await get("/veiculos", true);
    expect(veiculos.some((item: { placa: string }) => item.placa === "GHI1J23")).toBe(true);

    const veiculoAtualizado = await patch("/veiculos/GHI1J23", { modelo: "City", ano: 2022 }, true);
    expect(veiculoAtualizado.modelo).toBe("City");

    const servico = await post("/servicos", { nome: servicoCrud, preco: 80 }, true);
    expect(servico.nome).toBe(servicoCrud);

    const servicoAtualizado = await patch(`/servicos/${servicoCrud}`, { preco: 95 }, true);
    expect(Number(servicoAtualizado.preco)).toBe(95);

    const servicos = await get("/servicos", true);
    expect(servicos.some((item: { nome: string }) => item.nome === servicoCrud)).toBe(true);

    const peca = await post(
      "/pecas",
      {
        nome: pecaCrud,
        preco: 45,
        quantidade: 1,
        estoqueMinimo: 2
      },
      true
    );
    expect(peca.estoqueBaixo).toBe(true);

    const pecaAtualizada = await patch(`/pecas/${pecaCrud}`, { nome: `${pecaCrud} Atualizado`, quantidade: 5 }, true);
    expect(pecaAtualizada.nome).toBe(`${pecaCrud} Atualizado`);
    expect(pecaAtualizada.estoqueBaixo).toBe(false);

    const estoqueAtualizado = await patch(`/estoque/pecas/${pecaCrud} Atualizado`, { quantidadeDisponivel: 1 }, true);
    expect(estoqueAtualizado.estoqueBaixo).toBe(true);

    const estoqueBaixo = await get("/estoque/pecas?baixo=true", true);
    expect(estoqueBaixo.some((item: { nome: string }) => item.nome === `${pecaCrud} Atualizado`)).toBe(true);

    const estoqueItem = await get(`/estoque/pecas/${pecaCrud} Atualizado`, true);
    expect(estoqueItem.nome).toBe(`${pecaCrud} Atualizado`);

    await patch(`/pecas/${pecaCrud} Atualizado/estoque`, { quantidadeDisponivel: 5 }, true);
    await post("/estoque/reservas", { nome: `${pecaCrud} Atualizado`, quantidade: 2 }, true);
    await post("/estoque/reservas/liberar", { nome: `${pecaCrud} Atualizado`, quantidade: 1 }, true);
    await post("/estoque/consumos", { nome: `${pecaCrud} Atualizado`, quantidade: 1 }, true);

    const metricas = await get("/metricas/tempo-medio", true);
    expect(metricas.ordensFinalizadas).toBeGreaterThanOrEqual(1);

    const metricasServicos = await get("/metricas/tempo-medio-servicos", true);
    expect(metricasServicos.some((item: { servico: string }) => item.servico === servicoIntegracao)).toBe(true);

    const ordens = await get("/ordens-servico?page=1&pageSize=10", true);
    const numeroOsComHistorico = ordens.items[0].numeroOs;

    const historico = await get(`/ordens-servico/${numeroOsComHistorico}/historico`, true);
    expect(historico.length).toBeGreaterThan(0);

    const ordem = await get(`/ordens-servico/${numeroOsComHistorico}`, true);
    expect(ordem.numeroOs).toBe(numeroOsComHistorico);

    const publicoInexistente = await request("GET", "/public/ordens-servico/OS-INEXISTENTE/status");
    expect(publicoInexistente.status).toBe(404);

    await request("DELETE", `/pecas/${pecaCrud} Atualizado`, undefined, true);
    await request("DELETE", `/servicos/${servicoCrud}`, undefined, true);
    await request("DELETE", "/veiculos/GHI1J23", undefined, true);
    await request("DELETE", `/clientes/cpf-cnpj/${cpfCrud}`, undefined, true);
  }, 20000);

  it("garante regras de negocio das entidades de dominio usadas no fluxo da oficina", () => {
    const ordem = OrdemDeServico.create("os-dominio", {
      numeroOs: "OS-DOMINIO",
      clienteId: "cliente-dominio",
      veiculoId: "veiculo-dominio",
      descricaoProblemaCliente: "Falha em teste"
    });

    expect(ordem.status).toBe(StatusOrdemServico.Recebida);
    expect(ordem.historico).toHaveLength(1);
    expect(() => ordem.registrarProblemaTecnico("Sem diagnostico")).toThrow("Diagnostico deve estar em andamento");
    expect(() => ordem.iniciarExecucao()).toThrow("Execucao somente apos aprovacao do orcamento");
    expect(() => ordem.finalizar()).toThrow("Servico deve estar em execucao para finalizar");

    ordem.iniciarDiagnostico();
    ordem.registrarProblemaTecnico("Problema confirmado");
    ordem.iniciarExecucao();
    ordem.finalizar();

    expect(ordem.status).toBe(StatusOrdemServico.Finalizada);
    expect(ordem.historico.at(-1)?.status).toBe(StatusOrdemServico.Finalizada);
    expect(ordem.historico.at(-1)?.dataHora).toBeInstanceOf(Date);

    const orcamento = Orcamento.create("orcamento-dominio", {
      ordemServicoId: "os-dominio",
      valorTotal: 100
    });

    expect(orcamento.status).toBe(StatusOrcamento.Pendente);
    orcamento.aprovar();
    expect(orcamento.status).toBe(StatusOrcamento.Aprovado);
    expect(() => orcamento.rejeitar()).toThrow("Somente orcamento pendente pode ser rejeitado");
    expect(() => Orcamento.create("orcamento-negativo", { ordemServicoId: "os-dominio", valorTotal: -1 })).toThrow(
      "Valor do orcamento nao pode ser negativo"
    );

    const orcamentoRejeitado = Orcamento.create("orcamento-rejeitado", {
      ordemServicoId: "os-dominio",
      valorTotal: 50
    });
    orcamentoRejeitado.rejeitar();
    expect(orcamentoRejeitado.status).toBe(StatusOrcamento.Rejeitado);
    expect(() => orcamentoRejeitado.aprovar()).toThrow("Somente orcamento pendente pode ser aprovado");

    const estoque = Estoque.create("estoque-dominio", {
      pecaId: "peca-dominio",
      quantidadeDisponivel: 5,
      quantidadeReservada: 0
    });

    estoque.reservar(3);
    expect(estoque.quantidadeDisponivel).toBe(2);
    expect(estoque.quantidadeReservada).toBe(3);

    estoque.liberarReserva(1);
    expect(estoque.quantidadeDisponivel).toBe(3);
    expect(estoque.quantidadeReservada).toBe(2);

    estoque.consumirReserva(2);
    expect(estoque.quantidadeReservada).toBe(0);

    expect(() => Estoque.create("estoque-negativo", { pecaId: "peca", quantidadeDisponivel: -1, quantidadeReservada: 0 })).toThrow(
      "Quantidade de estoque nao pode ser negativa"
    );
    expect(() => Estoque.create("reserva-negativa", { pecaId: "peca", quantidadeDisponivel: 0, quantidadeReservada: -1 })).toThrow(
      "Quantidade de estoque nao pode ser negativa"
    );
    expect(() => estoque.reservar(0)).toThrow("Quantidade para reserva deve ser positiva");
    expect(() => estoque.reservar(10)).toThrow("Estoque insuficiente para reserva");
    expect(() => estoque.liberarReserva(0)).toThrow("Quantidade para liberacao deve ser positiva");
    expect(() => estoque.liberarReserva(1)).toThrow("Reserva insuficiente para liberacao");
    expect(() => estoque.consumirReserva(0)).toThrow("Quantidade para consumo deve ser positiva");
    expect(() => estoque.consumirReserva(1)).toThrow("Reserva insuficiente para consumo");

    expect(CpfCnpj.create("529.982.247-25").equals(CpfCnpj.create("52998224725"))).toBe(true);
    expect(() => CpfCnpj.create("111.111.111-11")).toThrow("CPF/CNPJ invalido");
    expect(() => CpfCnpj.create("123")).toThrow("CPF/CNPJ invalido");
    expect(() => CpfCnpj.create("529.982.247-00")).toThrow("CPF/CNPJ invalido");
    expect(() => CpfCnpj.create("04.252.011/0001-00")).toThrow("CPF/CNPJ invalido");

    expect(Email.create("dominio@email.com").value).toBe("dominio@email.com");
    expect(() => Email.create("")).toThrow("Email invalido");
    expect(() => Email.create("email invalido")).toThrow("Email invalido");
    expect(() => Email.create("dominio@")).toThrow("Email invalido");

    expect(Placa.create("abc1d23").value).toBe("ABC1D23");
    expect(() => Placa.create("ABC123")).toThrow("Placa invalida");

    expect(Telefone.create("(11) 99999-9999").value).toBe("11999999999");
    expect(() => Telefone.create("123")).toThrow("Telefone invalido");
  });

  async function get(path: string, authenticated = false) {
    const response = await fetch(`${baseUrl}${path}`, {
      headers: headers(authenticated)
    });
    return response.json();
  }

  async function request(method: string, path: string, body?: unknown, authenticated = false) {
    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: headers(authenticated),
      ...(body !== undefined ? { body: JSON.stringify(body) } : {})
    });

    const text = await response.text();

    return {
      status: response.status,
      ok: response.ok,
      body: text ? JSON.parse(text) : null
    };
  }

  async function post(path: string, body: unknown, authenticated = false) {
    const response = await fetch(`${baseUrl}${path}`, {
      method: "POST",
      headers: headers(authenticated),
      body: JSON.stringify(body)
    });

    expect(response.ok).toBe(true);
    return response.json();
  }

  async function patch(path: string, body: unknown, authenticated = false) {
    const response = await fetch(`${baseUrl}${path}`, {
      method: "PATCH",
      headers: headers(authenticated),
      body: JSON.stringify(body)
    });

    expect(response.ok).toBe(true);
    return response.json();
  }

  function headers(authenticated: boolean) {
    return {
      "Content-Type": "application/json",
      ...(authenticated ? { Authorization: `Bearer ${token}` } : {})
    };
  }

});
