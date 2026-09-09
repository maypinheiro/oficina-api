const json = (schema: unknown, example?: unknown) => ({
  required: true,
  content: {
    "application/json": {
      schema,
      ...(example ? { example } : {})
    }
  }
});

const bearer = [{ bearerAuth: [] }];

export const openApiDocument = {
  openapi: "3.0.0",
  info: {
    title: "Oficina API",
    version: "0.1.0",
    description: "API REST para oficina mecanica conforme SSD do Tech Challenge."
  },
  servers: [{ url: "http://localhost:3000" }],
  tags: [
    { name: "Saude", description: "Disponibilidade da API" },
    { name: "Autenticacao", description: "JWT administrativo" },
    { name: "Publico", description: "Rotas sem autenticacao para cliente" },
    { name: "Cadastro", description: "Clientes e veiculos" },
    { name: "Catalogo", description: "Cadastro de servicos e pecas ofertados" },
    { name: "Estoque", description: "Consulta, atualizacao, alerta, reserva, liberacao e consumo" },
    { name: "Atendimento", description: "Ordens de servico e diagnostico" },
    { name: "Orcamento", description: "Orcamentos e aprovacao" },
    { name: "Metricas", description: "Indicadores operacionais" }
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" }
    },
    schemas: {
      Login: {
        type: "object",
        properties: { username: { type: "string" }, password: { type: "string" } },
        required: ["username", "password"]
      },
      ClienteInput: {
        type: "object",
        properties: {
          nome: { type: "string" },
          cpfCnpj: { type: "string" },
          email: { type: "string" },
          telefone: { type: "string" }
        },
        required: ["nome", "cpfCnpj", "email", "telefone"]
      },
      ClienteAtualizacaoInput: {
        type: "object",
        properties: {
          nome: { type: "string" },
          cpfCnpj: { type: "string" },
          email: { type: "string" },
          telefone: { type: "string" }
        }
      },
      VeiculoInput: {
        type: "object",
        properties: {
          cpfCnpj: { type: "string" },
          placa: { type: "string" },
          marca: { type: "string" },
          modelo: { type: "string" },
          ano: { type: "integer" }
        },
        required: ["cpfCnpj", "placa", "marca", "modelo", "ano"]
      },
      VeiculoAtualizacaoInput: {
        type: "object",
        properties: {
          placa: { type: "string" },
          marca: { type: "string" },
          modelo: { type: "string" },
          ano: { type: "integer" }
        }
      },
      ServicoInput: {
        type: "object",
        properties: { nome: { type: "string" }, preco: { type: "number" } },
        required: ["nome", "preco"]
      },
      ServicoAtualizacaoInput: {
        type: "object",
        properties: { nome: { type: "string" }, preco: { type: "number" } }
      },
      PecaInput: {
        type: "object",
        properties: {
          nome: { type: "string" },
          preco: { type: "number" },
          quantidade: { type: "integer" },
          estoqueMinimo: { type: "integer" }
        },
        required: ["nome", "preco", "quantidade"]
      },
      PecaAtualizacaoInput: {
        type: "object",
        properties: {
          nome: { type: "string" },
          preco: { type: "number" },
          quantidade: { type: "integer" },
          estoqueMinimo: { type: "integer" }
        }
      },
      EstoqueAtualizacaoInput: {
        type: "object",
        properties: { quantidadeDisponivel: { type: "integer" } },
        required: ["quantidadeDisponivel"]
      },
      EstoqueMovimentoInput: {
        type: "object",
        properties: { nome: { type: "string" }, quantidade: { type: "integer" } },
        required: ["nome", "quantidade"]
      },
      LiberarReservasOsInput: {
        type: "object",
        properties: { numeroOs: { type: "string" } },
        required: ["numeroOs"]
      },
      OrdemServicoInput: {
        type: "object",
        properties: {
          cpfCnpj: { type: "string" },
          placa: { type: "string" },
          descricaoProblemaCliente: { type: "string" },
          servicos: { type: "array", minItems: 1, items: { type: "string" } },
          pecas: {
            type: "array",
            items: {
              type: "object",
              properties: { nome: { type: "string" }, quantidade: { type: "integer" } },
              required: ["nome", "quantidade"]
            }
          }
        },
        required: ["cpfCnpj", "placa", "descricaoProblemaCliente", "servicos", "pecas"]
      },
      ProblemaTecnicoInput: {
        type: "object",
        properties: { problemaIdentificado: { type: "string" } },
        required: ["problemaIdentificado"]
      },
      NotificacaoDecisaoOrcamentoInput: {
        type: "object",
        properties: {
          numeroOs: { type: "string" },
          decisao: { type: "string", enum: ["APROVADO", "REJEITADO"] },
          origem: { type: "string" }
        },
        required: ["numeroOs", "decisao"]
      },
      OrcamentoInput: {
        type: "object",
        properties: {
          numeroOs: { type: "string" },
          servicos: { type: "array", items: { type: "string" } },
          pecas: {
            type: "array",
            items: {
              type: "object",
              properties: { nome: { type: "string" }, quantidade: { type: "integer" } },
              required: ["nome", "quantidade"]
            }
          }
        },
        required: ["numeroOs"]
      }
    }
  },
  paths: {
    "/health": {
      get: {
        tags: ["Saude"],
        summary: "Health check",
        responses: {
          "200": {
            description: "Servico ativo",
            content: { "application/json": { example: { status: "ok", service: "oficina-api" } } }
          }
        }
      }
    },
    "/auth/login": {
      post: {
        tags: ["Autenticacao"],
        summary: "Gera JWT administrativo",
        requestBody: json({ $ref: "#/components/schemas/Login" }, { username: "admin", password: "admin" }),
        responses: {
          "200": {
            description: "Token gerado",
            content: { "application/json": { example: { token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." } } }
          },
          "401": { description: "Credenciais invalidas" }
        }
      }
    },
    "/public/ordens-servico/{numeroOs}/status": {
      get: {
        tags: ["Publico"],
        summary: "Consulta publica de status da OS",
        parameters: [{ name: "numeroOs", in: "path", required: true, schema: { type: "string" }, example: "OS-SEED-004" }],
        responses: {
          "200": {
            description: "Status sem dados sensiveis",
            content: {
              "application/json": {
                example: {
                  numeroOs: "OS-SEED-004",
                  statusAtual: "ORCAMENTO_REJEITADO",
                  dataCriacao: "2026-05-02T22:00:00.000Z",
                  ultimaAtualizacaoStatus: "2026-05-02T22:10:00.000Z"
                }
              }
            }
          },
          "404": { description: "OS nao encontrada" }
        }
      }
    },
    "/clientes": {
      get: {
        tags: ["Cadastro"],
        security: bearer,
        summary: "Lista clientes",
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                example: [{
                  nome: "Cliente Seed Oficina",
                  cpfCnpj: "11222333000181",
                  email: "seed.oficina@email.com",
                  telefone: "11999999999"
                }]
              }
            }
          }
        }
      },
      post: {
        tags: ["Cadastro"],
        security: bearer,
        summary: "Cria cliente",
        requestBody: json({ $ref: "#/components/schemas/ClienteInput" }, {
          nome: "Maria Silva",
          cpfCnpj: "529.982.247-25",
          email: "maria@email.com",
          telefone: "(11) 99999-9999"
        }),
        responses: { "201": { description: "Criado" }, "409": { description: "CPF/CNPJ duplicado" } }
      }
    },
    "/clientes/cpf-cnpj/{valor}": {
      get: {
        tags: ["Cadastro"],
        security: bearer,
        summary: "Busca cliente por CPF/CNPJ",
        parameters: [{ name: "valor", in: "path", required: true, schema: { type: "string" }, example: "529.982.247-25" }],
        responses: { "200": { description: "OK" }, "404": { description: "Nao encontrado" } }
      },
      patch: {
        tags: ["Cadastro"],
        security: bearer,
        summary: "Atualiza cliente por CPF/CNPJ",
        parameters: [{ name: "valor", in: "path", required: true, schema: { type: "string" }, example: "529.982.247-25" }],
        requestBody: json({ $ref: "#/components/schemas/ClienteAtualizacaoInput" }, {
          nome: "Maria Silva Atualizada",
          email: "maria.novo@email.com",
          telefone: "(11) 98888-7777"
        }),
        responses: { "200": { description: "Atualizado" }, "404": { description: "Cliente nao encontrado" } }
      },
      delete: {
        tags: ["Cadastro"],
        security: bearer,
        summary: "Remove cliente por CPF/CNPJ",
        description: "Clientes com ordens de servico nao sao removidos para preservar historico.",
        parameters: [{ name: "valor", in: "path", required: true, schema: { type: "string" }, example: "529.982.247-25" }],
        responses: {
          "200": { description: "Removido", content: { "application/json": { example: { message: "Cliente removido" } } } },
          "409": { description: "Cliente possui ordens de servico" }
        }
      }
    },
    "/veiculos": {
      get: {
        tags: ["Cadastro"],
        security: bearer,
        summary: "Lista veiculos",
        responses: { "200": { description: "OK", content: { "application/json": { example: [] } } } }
      },
      post: {
        tags: ["Cadastro"],
        security: bearer,
        summary: "Cria ou vincula veiculo ao cliente por CPF/CNPJ",
        requestBody: json({ $ref: "#/components/schemas/VeiculoInput" }, {
          cpfCnpj: "529.982.247-25",
          placa: "ABC1D23",
          marca: "Fiat",
          modelo: "Uno",
          ano: 2020
        }),
        responses: { "201": { description: "Criado ou vinculado" }, "404": { description: "Cliente nao encontrado" } }
      }
    },
    "/veiculos/{placa}": {
      patch: {
        tags: ["Cadastro"],
        security: bearer,
        summary: "Atualiza veiculo por placa",
        parameters: [{ name: "placa", in: "path", required: true, schema: { type: "string" }, example: "ABC1D23" }],
        requestBody: json({ $ref: "#/components/schemas/VeiculoAtualizacaoInput" }, {
          marca: "Fiat",
          modelo: "Argo",
          ano: 2021
        }),
        responses: { "200": { description: "Atualizado" }, "404": { description: "Veiculo nao encontrado" } }
      },
      delete: {
        tags: ["Cadastro"],
        security: bearer,
        summary: "Remove veiculo por placa",
        description: "Veiculos com ordens de servico nao sao removidos para preservar historico.",
        parameters: [{ name: "placa", in: "path", required: true, schema: { type: "string" }, example: "ABC1D23" }],
        responses: {
          "200": { description: "Removido", content: { "application/json": { example: { message: "Veiculo removido" } } } },
          "409": { description: "Veiculo possui ordens de servico" }
        }
      }
    },
    "/servicos": {
      get: {
        tags: ["Catalogo"],
        security: bearer,
        summary: "Lista servicos",
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                example: [
                  {
                    nome: "Troca de pastilha",
                    preco: "150",
                    execucoesConsideradas: 1,
                    tempoMedioExecucaoHoras: 6,
                    mensagemTempoMedio: "Tempo medio calculado com base no intervalo entre EM_EXECUCAO e FINALIZADA."
                  },
                  {
                    nome: "Alinhamento",
                    preco: "120",
                    execucoesConsideradas: 0,
                    tempoMedioExecucaoHoras: null,
                    mensagemTempoMedio: "Servico ainda nao possui execucoes finalizadas para calculo do tempo medio."
                  }
                ]
              }
            }
          }
        }
      },
      post: {
        tags: ["Catalogo"],
        security: bearer,
        summary: "Cria servico",
        requestBody: json({ $ref: "#/components/schemas/ServicoInput" }, { nome: "Troca de pastilha", preco: 150 }),
        responses: { "201": { description: "Criado" } }
      }
    },
    "/servicos/{nome}": {
      patch: {
        tags: ["Catalogo"],
        security: bearer,
        summary: "Atualiza servico por nome",
        parameters: [{ name: "nome", in: "path", required: true, schema: { type: "string" }, example: "Troca de pastilha" }],
        requestBody: json({ $ref: "#/components/schemas/ServicoAtualizacaoInput" }, {
          nome: "Troca de pastilhas",
          preco: 180
        }),
        responses: { "200": { description: "Atualizado" }, "404": { description: "Servico nao encontrado" } }
      },
      delete: {
        tags: ["Catalogo"],
        security: bearer,
        summary: "Remove servico por nome",
        description: "Servicos vinculados a orcamentos nao sao removidos para preservar historico financeiro da OS.",
        parameters: [{ name: "nome", in: "path", required: true, schema: { type: "string" }, example: "Troca de pastilha" }],
        responses: {
          "200": { description: "Removido", content: { "application/json": { example: { message: "Servico removido" } } } },
          "409": { description: "Servico possui orcamentos" }
        }
      }
    },
    "/pecas": {
      get: {
        tags: ["Catalogo"],
        security: bearer,
        summary: "Lista pecas cadastradas",
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                example: [{
                  nome: "Pastilha",
                  preco: "90",
                  quantidade: 4,
                  estoqueMinimo: 2,
                  estoqueBaixo: false,
                  alertaEstoque: "Estoque em nivel adequado."
                }]
              }
            }
          }
        }
      },
      post: {
        tags: ["Catalogo"],
        security: bearer,
        summary: "Cria peca e estoque inicial",
        description: "Faz sentido porque a peca nasce no catalogo e ja cria o saldo inicial de estoque para operacao.",
        requestBody: json({ $ref: "#/components/schemas/PecaInput" }, { nome: "Pastilha", preco: 90, quantidade: 4, estoqueMinimo: 2 }),
        responses: { "201": { description: "Criado" } }
      }
    },
    "/pecas/{nome}": {
      patch: {
        tags: ["Catalogo"],
        security: bearer,
        summary: "Atualiza peca por nome",
        description: "Quando quantidade e informada, tambem atualiza o estoque disponivel da peca.",
        parameters: [{ name: "nome", in: "path", required: true, schema: { type: "string" }, example: "Pastilha" }],
        requestBody: json({ $ref: "#/components/schemas/PecaAtualizacaoInput" }, {
          preco: 95,
          quantidade: 8,
          estoqueMinimo: 3
        }),
        responses: {
          "200": {
            description: "Atualizada",
            content: {
              "application/json": {
                example: {
                  nome: "Pastilha",
                  preco: "95",
                  quantidade: 8,
                  estoqueMinimo: 3,
                  estoqueBaixo: false,
                  alertaEstoque: "Estoque em nivel adequado."
                }
              }
            }
          },
          "404": { description: "Peca nao encontrada" }
        }
      },
      delete: {
        tags: ["Catalogo"],
        security: bearer,
        summary: "Remove peca por nome",
        description: "Pecas vinculadas a orcamentos nao sao removidas para preservar historico financeiro da OS.",
        parameters: [{ name: "nome", in: "path", required: true, schema: { type: "string" }, example: "Pastilha" }],
        responses: {
          "200": { description: "Removida", content: { "application/json": { example: { message: "Peca removida" } } } },
          "409": { description: "Peca possui orcamentos" }
        }
      }
    },
    "/estoque/pecas": {
      get: {
        tags: ["Estoque"],
        security: bearer,
        summary: "Consulta estoque das pecas",
        description: "Use baixo=true para retornar apenas pecas com estoque disponivel menor ou igual ao estoque minimo.",
        parameters: [{ name: "baixo", in: "query", required: false, schema: { type: "string", enum: ["true", "false"] }, example: "true" }],
        responses: {
          "200": {
            description: "Estoque consultado com alerta textual",
            content: {
              "application/json": {
                examples: {
                  todos: {
                    summary: "Todas as pecas",
                    value: [
                      {
                        nome: "Filtro de oleo",
                        estoqueMinimo: 3,
                        estoque: { quantidadeDisponivel: 0, quantidadeReservada: 1 },
                        estoqueBaixo: true,
                        alertaEstoque: "Estoque baixo para Filtro de oleo: 0 disponivel(is), minimo 3."
                      },
                      {
                        nome: "Pastilha de freio",
                        estoqueMinimo: 3,
                        estoque: { quantidadeDisponivel: 9, quantidadeReservada: 1 },
                        estoqueBaixo: false,
                        alertaEstoque: "Estoque em nivel adequado."
                      }
                    ]
                  },
                  baixo: {
                    summary: "Com baixo=true",
                    value: [
                      {
                        nome: "Filtro de oleo",
                        estoqueMinimo: 3,
                        estoque: { quantidadeDisponivel: 0, quantidadeReservada: 1 },
                        estoqueBaixo: true,
                        alertaEstoque: "Estoque baixo para Filtro de oleo: 0 disponivel(is), minimo 3."
                      }
                    ]
                  }
                }
              }
            }
          }
        }
      }
    },
    "/estoque/pecas/{nome}": {
      get: {
        tags: ["Estoque"],
        security: bearer,
        summary: "Consulta estoque de uma peca pelo nome",
        parameters: [{ name: "nome", in: "path", required: true, schema: { type: "string" }, example: "Filtro de oleo" }],
        responses: {
          "200": {
            description: "Estoque da peca com alerta textual",
            content: {
              "application/json": {
                example: {
                  nome: "Filtro de oleo",
                  estoqueMinimo: 3,
                  estoque: { quantidadeDisponivel: 0, quantidadeReservada: 1 },
                  estoqueBaixo: true,
                  alertaEstoque: "Estoque baixo para Filtro de oleo: 0 disponivel(is), minimo 3."
                }
              }
            }
          },
          "404": { description: "Peca nao encontrada" }
        }
      },
      patch: {
        tags: ["Estoque"],
        security: bearer,
        summary: "Atualiza estoque disponivel da peca e retorna alerta",
        parameters: [{ name: "nome", in: "path", required: true, schema: { type: "string" }, example: "Filtro de oleo" }],
        requestBody: json({ $ref: "#/components/schemas/EstoqueAtualizacaoInput" }, { quantidadeDisponivel: 1 }),
        responses: {
          "200": {
            description: "Estoque atualizado",
            content: {
              "application/json": {
                example: {
                  nome: "Filtro de oleo",
                  estoqueMinimo: 3,
                  estoque: { quantidadeDisponivel: 1, quantidadeReservada: 0 },
                  estoqueBaixo: true,
                  alertaEstoque: "Estoque baixo para Filtro de oleo: 1 disponivel(is), minimo 3."
                }
              }
            }
          }
        }
      }
    },
    "/estoque/reservas": {
      post: {
        tags: ["Estoque"],
        security: bearer,
        summary: "Reserva peca pelo nome",
        description: "Ajuste manual. No fluxo principal, a reserva vinculada a OS e feita ao criar o orcamento.",
        requestBody: json({ $ref: "#/components/schemas/EstoqueMovimentoInput" }, { nome: "Pastilha", quantidade: 1 }),
        responses: { "200": { description: "OK" }, "422": { description: "Estoque insuficiente" } }
      }
    },
    "/estoque/reservas/liberar": {
      post: {
        tags: ["Estoque"],
        security: bearer,
        summary: "Libera peca reservada pelo nome (ajuste manual)",
        description: "Ajuste manual. Para OS rejeitada, preferir /estoque/reservas/liberar-os.",
        requestBody: json({ $ref: "#/components/schemas/EstoqueMovimentoInput" }, { nome: "Pastilha", quantidade: 1 }),
        responses: { "200": { description: "OK" }, "422": { description: "Reserva insuficiente" } }
      }
    },
    "/estoque/reservas/liberar-os": {
      post: {
        tags: ["Estoque"],
        security: bearer,
        summary: "Libera reservas de uma OS rejeitada",
        description: "Usado pela atendente apos consultar OS com status ORCAMENTO_REJEITADO.",
        requestBody: json({ $ref: "#/components/schemas/LiberarReservasOsInput" }, { numeroOs: "OS-SEED-004" }),
        responses: { "200": { description: "Reservas liberadas" }, "422": { description: "OS ainda nao esta rejeitada" } }
      }
    },
    "/estoque/consumos": {
      post: {
        tags: ["Estoque"],
        security: bearer,
        summary: "Consome peca reservada pelo nome",
        description: "Ajuste manual. No fluxo principal, o consumo vinculado a OS ocorre em PATCH /ordens-servico/{numeroOs}/iniciar-execucao.",
        requestBody: json({ $ref: "#/components/schemas/EstoqueMovimentoInput" }, { nome: "Pastilha", quantidade: 1 }),
        responses: { "200": { description: "OK" }, "422": { description: "Reserva insuficiente" } }
      }
    },
    "/ordens-servico": {
      get: {
        tags: ["Atendimento"],
        security: bearer,
        summary: "Lista fila operacional de OS com filtro por status e retorno paginado",
        description: "Sem filtro, retorna apenas OS ativas, excluindo FINALIZADA e ENTREGUE. A fila e ordenada por prioridade de status: EM_EXECUCAO, AGUARDANDO_APROVACAO, EM_DIAGNOSTICO, RECEBIDA; dentro de cada status, as mais antigas aparecem primeiro.",
        parameters: [
          {
            name: "status",
            in: "query",
            required: false,
            schema: {
              type: "string",
              enum: [
                "RECEBIDA",
                "EM_DIAGNOSTICO",
                "AGUARDANDO_APROVACAO",
                "APROVADA",
                "ORCAMENTO_REJEITADO",
                "EM_EXECUCAO",
                "FINALIZADA",
                "ENTREGUE"
              ]
            },
            example: "ORCAMENTO_REJEITADO"
          },
          { name: "page", in: "query", required: false, schema: { type: "integer", default: 1 }, example: 1 },
          {
            name: "pageSize",
            in: "query",
            required: false,
            description: "Quantidade maxima de registros retornados por pagina. Maximo 100.",
            schema: { type: "integer", default: 10, maximum: 100 },
            example: 10
          }
        ],
        responses: {
          "200": {
            description: "Lista paginada",
            content: {
              "application/json": {
                examples: {
                  paginado: {
                    summary: "page=1&pageSize=3",
                    value: {
                      items: [
                        { numeroOs: "OS-SEED-005", status: "EM_EXECUCAO" },
                        { numeroOs: "OS-SEED-003", status: "AGUARDANDO_APROVACAO" },
                        { numeroOs: "OS-SEED-002", status: "EM_DIAGNOSTICO" }
                      ],
                      pagination: { page: 1, pageSize: 3, total: 4, totalPages: 2 }
                    }
                  },
                  porStatus: {
                    summary: "status=ORCAMENTO_REJEITADO&page=1&pageSize=10",
                    value: {
                      items: [{ numeroOs: "OS-SEED-004", status: "ORCAMENTO_REJEITADO" }],
                      pagination: { page: 1, pageSize: 10, total: 1, totalPages: 1 }
                    }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ["Atendimento"],
        security: bearer,
        summary: "Cria OS para o cliente atendido, veiculo, servicos e pecas",
        description: "Quando servicos ou pecas sao enviados, a abertura cria tambem um orcamento inicial pendente, reservando as pecas informadas.",
        requestBody: json({ $ref: "#/components/schemas/OrdemServicoInput" }, {
          cpfCnpj: "11.222.333/0001-81",
          placa: "ABC1D23",
          descricaoProblemaCliente: "Barulho ao frear",
          servicos: ["Troca de pastilha"],
          pecas: [{ nome: "Pastilha de freio", quantidade: 2 }]
        }),
        responses: {
          "201": { description: "OS criada, com orcamento inicial quando itens forem informados" },
          "404": { description: "Cliente, veiculo, servico ou peca nao encontrado" },
          "422": { description: "Estoque insuficiente ou fluxo invalido" }
        }
      }
    },
    "/ordens-servico/{numeroOs}": {
      get: {
        tags: ["Atendimento"],
        security: bearer,
        summary: "Busca OS por numero",
        parameters: [{ name: "numeroOs", in: "path", required: true, schema: { type: "string" }, example: "OS-SEED-003" }],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                example: {
                  numeroOs: "OS-SEED-003",
                  descricaoProblemaCliente: "Cliente relata pedal de freio baixo.",
                  problemaIdentificado: "Pastilhas gastas e fluido abaixo do nivel.",
                  status: "AGUARDANDO_APROVACAO",
                  cliente: {
                    nome: "Cliente Seed Oficina",
                    cpfCnpj: "11222333000181",
                    email: "seed.oficina@email.com",
                    telefone: "11999999999"
                  },
                  veiculo: {
                    placa: "ABC1D23",
                    marca: "Fiat",
                    modelo: "Uno",
                    ano: 2020
                  },
                  orcamento: {
                    status: "PENDENTE",
                    valorTotal: 240,
                    servicos: [{ nome: "Troca de pastilha", valor: 150 }],
                    pecas: [{ nome: "Pastilha de freio", quantidade: 1, valorUnitario: 90, valorTotal: 90 }]
                  },
                  historico: [
                    { status: "RECEBIDA", dataHora: "2026-05-04T10:00:00.000Z" },
                    { status: "EM_DIAGNOSTICO", dataHora: "2026-05-04T10:10:00.000Z" },
                    { status: "AGUARDANDO_APROVACAO", dataHora: "2026-05-04T10:30:00.000Z" }
                  ]
                }
              }
            }
          },
          "404": { description: "OS nao encontrada" }
        }
      }
    },
    "/ordens-servico/{numeroOs}/status": {
      get: {
        tags: ["Atendimento"],
        security: bearer,
        summary: "Consulta status atual da OS",
        parameters: [{ name: "numeroOs", in: "path", required: true, schema: { type: "string" }, example: "OS-SEED-003" }],
        responses: {
          "200": {
            description: "Status atual",
            content: {
              "application/json": {
                example: {
                  numeroOs: "OS-SEED-003",
                  statusAtual: "AGUARDANDO_APROVACAO",
                  dataCriacao: "2026-05-04T10:00:00.000Z",
                  ultimaAtualizacaoStatus: "2026-05-04T10:30:00.000Z"
                }
              }
            }
          },
          "404": { description: "OS nao encontrada" }
        }
      }
    },
    "/ordens-servico/{numeroOs}/historico": {
      get: {
        tags: ["Atendimento"],
        security: bearer,
        summary: "Historico imutavel de status",
        parameters: [{ name: "numeroOs", in: "path", required: true, schema: { type: "string" }, example: "OS-SEED-003" }],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                example: [
                  { status: "RECEBIDA", dataHora: "2026-05-02T22:00:00.000Z" },
                  { status: "EM_DIAGNOSTICO", dataHora: "2026-05-02T22:05:00.000Z" },
                  { status: "AGUARDANDO_APROVACAO", dataHora: "2026-05-02T22:10:00.000Z" }
                ]
              }
            }
          }
        }
      }
    },
    "/ordens-servico/{numeroOs}/iniciar-diagnostico": {
      patch: {
        tags: ["Atendimento"],
        security: bearer,
        summary: "Inicia diagnostico",
        parameters: [{ name: "numeroOs", in: "path", required: true, schema: { type: "string" }, example: "OS-SEED-001" }],
        responses: { "200": { description: "OK" } }
      }
    },
    "/ordens-servico/{numeroOs}/registrar-problema": {
      patch: {
        tags: ["Atendimento"],
        security: bearer,
        summary: "Registra problema tecnico",
        parameters: [{ name: "numeroOs", in: "path", required: true, schema: { type: "string" }, example: "OS-SEED-002" }],
        requestBody: json({ $ref: "#/components/schemas/ProblemaTecnicoInput" }, { problemaIdentificado: "Pastilha de freio gasta" }),
        responses: { "200": { description: "OK" } }
      }
    },
    "/ordens-servico/{numeroOs}/iniciar-execucao": {
      patch: {
        tags: ["Atendimento"],
        security: bearer,
        summary: "Inicia execucao e consome pecas vinculadas ao orcamento da OS",
        parameters: [{ name: "numeroOs", in: "path", required: true, schema: { type: "string" }, example: "OS-SEED-008" }],
        responses: { "200": { description: "OK" } }
      }
    },
    "/ordens-servico/{numeroOs}/finalizar": {
      patch: {
        tags: ["Atendimento"],
        security: bearer,
        summary: "Finaliza servico",
        parameters: [{ name: "numeroOs", in: "path", required: true, schema: { type: "string" }, example: "OS-SEED-005" }],
        responses: { "200": { description: "OK" } }
      }
    },
    "/ordens-servico/{numeroOs}/entregar": {
      patch: {
        tags: ["Atendimento"],
        security: bearer,
        summary: "Entrega veiculo",
        parameters: [{ name: "numeroOs", in: "path", required: true, schema: { type: "string" }, example: "OS-SEED-006" }],
        responses: { "200": { description: "OK" } }
      }
    },
    "/orcamentos": {
      post: {
        tags: ["Orcamento"],
        security: bearer,
        summary: "Cria orcamento por numero da OS, nomes de servicos e nomes de pecas",
        requestBody: json({ $ref: "#/components/schemas/OrcamentoInput" }, {
          numeroOs: "OS-SEED-003",
          servicos: ["Troca de pastilha"],
          pecas: [{ nome: "Pastilha de freio", quantidade: 2 }]
        }),
        responses: { "201": { description: "Criado" }, "422": { description: "Fluxo ou estoque invalido" } }
      }
    },
    "/orcamentos/notificacoes/aprovacao": {
      post: {
        tags: ["Orcamento"],
        security: bearer,
        summary: "Recebe notificacao externa de aprovacao ou recusa do orcamento",
        description: "Endpoint administrativo para decisao do orcamento feita por funcionario autenticado.",
        requestBody: json({ $ref: "#/components/schemas/NotificacaoDecisaoOrcamentoInput" }, {
          numeroOs: "OS-SEED-003",
          decisao: "APROVADO",
          origem: "email"
        }),
        responses: {
          "200": { description: "Decisao registrada na OS e no orcamento" },
          "404": { description: "Orcamento nao encontrado" },
          "422": { description: "Orcamento nao esta pendente" }
        }
      }
    },
    "/public/orcamentos/notificacoes/aprovacao": {
      post: {
        tags: ["Publico"],
        summary: "Recebe decisao externa de aprovacao ou recusa do orcamento",
        description: "Representa cliente ou sistema externo, sem autenticacao de funcionario.",
        requestBody: json({ $ref: "#/components/schemas/NotificacaoDecisaoOrcamentoInput" }, {
          numeroOs: "OS-SEED-003",
          decisao: "APROVADO",
          origem: "email"
        }),
        responses: {
          "200": { description: "Decisao registrada na OS e no orcamento" },
          "404": { description: "Orcamento nao encontrado" },
          "422": { description: "Orcamento nao esta pendente" }
        }
      }
    },
    "/orcamentos/{numeroOs}/aprovar": {
      patch: {
        tags: ["Orcamento"],
        security: bearer,
        summary: "Aprova orcamento por numero da OS",
        parameters: [{ name: "numeroOs", in: "path", required: true, schema: { type: "string" }, example: "OS-SEED-003" }],
        responses: { "200": { description: "OK" } }
      }
    },
    "/orcamentos/{numeroOs}/rejeitar": {
      patch: {
        tags: ["Orcamento"],
        security: bearer,
        summary: "Rejeita orcamento e altera OS para ORCAMENTO_REJEITADO",
        description: "Nao libera estoque automaticamente. A atendente deve chamar /estoque/reservas/liberar-os depois de consultar a OS.",
        parameters: [{ name: "numeroOs", in: "path", required: true, schema: { type: "string" }, example: "OS-SEED-003" }],
        responses: { "200": { description: "OK" } }
      }
    },
    "/metricas/tempo-medio": {
      get: {
        tags: ["Metricas"],
        security: bearer,
        summary: "Tempo medio de finalizacao",
        responses: { "200": { description: "OK", content: { "application/json": { example: { tempoMedioHoras: 12.5 } } } } }
      }
    },
    "/metricas/tempo-medio-servicos": {
      get: {
        tags: ["Metricas"],
        security: bearer,
        summary: "Tempo medio de execucao por servico",
        description: "Calcula por servico usando o intervalo do historico da OS entre EM_EXECUCAO e FINALIZADA.",
        responses: {
          "200": {
            description: "Tempo medio por servico",
            content: {
              "application/json": {
                example: [
                  {
                    servico: "Troca de pastilha",
                    execucoesConsideradas: 1,
                    tempoMedioExecucaoMs: 21600000,
                    tempoMedioExecucaoHoras: 6,
                    mensagem: "Tempo medio calculado com base no intervalo entre EM_EXECUCAO e FINALIZADA."
                  },
                  {
                    servico: "Alinhamento",
                    execucoesConsideradas: 0,
                    tempoMedioExecucaoMs: null,
                    tempoMedioExecucaoHoras: null,
                    mensagem: "Servico ainda nao possui execucoes finalizadas para calculo do tempo medio."
                  }
                ]
              }
            }
          }
        }
      }
    }
  }
};
