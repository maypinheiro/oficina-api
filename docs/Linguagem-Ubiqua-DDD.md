# DDD - Linguagem Ubiqua da Oficina Mecanica

## Objetivo

Padronizar a linguagem do dominio da oficina mecanica para que negocio, documentacao, API, banco de dados, testes e codigo usem os mesmos termos.

---

## Contextos delimitados

### Cadastro

Responsavel por clientes, veiculos e vinculos entre clientes e veiculos.

Neste contexto, os identificadores usuais sao:

- CPF/CNPJ para cliente.
- Placa para veiculo.

### Catalogo

Responsavel pelos itens ofertados pela oficina.

Inclui:

- Servicos.
- Pecas.
- Preco de servico.
- Preco de peca.
- Estoque minimo inicial da peca.

### Estoque

Responsavel pelo saldo operacional das pecas.

Controla:

- Quantidade disponivel.
- Quantidade reservada.
- Alerta de estoque baixo.
- Reserva de peca.
- Liberacao de reserva.
- Consumo de peca.

### Atendimento

Responsavel pelo ciclo de vida da Ordem de Servico.

Inclui:

- Abertura da OS.
- Diagnostico.
- Registro do problema tecnico.
- Inicio da execucao.
- Finalizacao.
- Entrega do veiculo.
- Historico de status.

### Orcamento

Responsavel por calcular e controlar a decisao comercial da OS.

Inclui:

- Servicos do orcamento.
- Pecas do orcamento.
- Valor total.
- Aprovacao.
- Rejeicao.

### Metricas

Responsavel por leituras administrativas e indicadores operacionais.

Inclui:

- Tempo medio de finalizacao.
- Tempo medio de execucao por servico.

---

## Atores

### Cliente

Pessoa fisica ou juridica que solicita atendimento para um veiculo, acompanha o status da OS e aprova ou rejeita o orcamento.

### Atendente

Pessoa que realiza o atendimento administrativo.

Responsabilidades:

- Cadastrar cliente.
- Cadastrar ou vincular veiculo.
- Abrir OS.
- Consultar OS.
- Liberar reservas de OS rejeitada quando aplicavel.
- Registrar entrega do veiculo.

### Mecanico

Pessoa responsavel pela analise tecnica e execucao do servico.

Responsabilidades:

- Iniciar diagnostico.
- Registrar problema tecnico.
- Executar servicos aprovados.
- Finalizar servico.

### Administrador

Pessoa responsavel pela manutencao administrativa do sistema.

Responsabilidades:

- Cadastrar, atualizar e remover clientes quando permitido.
- Cadastrar, atualizar e remover veiculos quando permitido.
- Cadastrar, atualizar e remover servicos quando permitido.
- Cadastrar, atualizar e remover pecas quando permitido.
- Consultar estoque, metricas e relatorios.

### Sistema

Aplicacao responsavel por aplicar regras, validar transicoes, calcular valores, registrar historico, reservar estoque, consumir estoque e expor consultas.

---

## Entidades, agregados e conceitos

### Cliente

Pessoa fisica ou juridica que solicita servicos da oficina.

Identificador de negocio:

- CPF/CNPJ.

Regras:

- CPF/CNPJ deve ser unico.
- Cliente pode ter varios veiculos vinculados.
- Cliente com OS registrada nao deve ser removido, para preservar historico.

### Veiculo

Bem atendido pela oficina.

Atributos principais:

- Placa.
- Marca.
- Modelo.
- Ano.

Regras:

- Placa e identificador usual, mas nao e chave unica global do dominio.
- Um mesmo veiculo pode ser usado por mais de um cliente cadastrado.
- Um veiculo pode ter historico com diferentes responsaveis ao longo do tempo.
- Veiculo com OS registrada nao deve ser removido, para preservar historico.

### Vinculo Cliente-Veiculo

Relacionamento que indica que um cliente pode abrir OS para um veiculo.

Representa situacoes como:

- Familia usando o mesmo veiculo.
- Veiculo vendido e vinculado a outro cliente.
- Cliente com mais de um veiculo.

### Ordem de Servico (OS)

Agregado central do atendimento.

Controla:

- Numero da OS.
- Cliente.
- Veiculo.
- Relato do cliente.
- Problema tecnico identificado.
- Status atual.
- Historico de status.
- Orcamento.
- Datas do atendimento.

Identificador de negocio:

- Numero da OS.

Regra de linguagem:

- Usar "numero da OS" nas rotas e operacoes de negocio.
- Evitar expor `ordemServicoId` em contratos de API.

### Historico de Status da OS

Registro imutavel das mudancas de status da OS.

Cada transicao relevante deve gerar uma nova entrada.

### Diagnostico

Etapa tecnica na qual o mecanico analisa o veiculo e identifica o problema.

### Problema Tecnico

Descricao tecnica registrada pelo mecanico apos diagnostico.

### Orcamento

Proposta calculada com servicos e pecas necessarios para resolver o problema identificado.

Controla:

- Valor total.
- Status do orcamento.
- Servicos incluidos.
- Pecas incluidas.

### Servico

Atividade tecnica realizada no veiculo.

Exemplos:

- Troca de pastilha.
- Diagnostico mecanico.
- Troca de velas.
- Alinhamento.

Servico pode ter tempo medio calculado a partir de OS finalizadas.

### Peca

Item fisico utilizado durante a execucao.

Exemplos:

- Pastilha de freio.
- Filtro de oleo.
- Vela de ignicao.

### Estoque

Saldo operacional de uma peca.

Divide:

- Quantidade disponivel.
- Quantidade reservada.

### Reserva de Peca

Separacao de pecas para uma OS durante a criacao do orcamento.

No fluxo principal, a reserva fica vinculada a OS por meio do orcamento e dos itens de peca do orcamento.

### Consumo de Peca

Baixa efetiva da peca reservada quando a execucao da OS e iniciada.

### Liberacao de Reserva

Devolucao ao saldo disponivel de pecas que estavam reservadas para uma OS rejeitada.

Decisao do projeto:

- A rejeicao do orcamento nao libera estoque automaticamente.
- A atendente consulta a OS rejeitada e executa a liberacao da reserva da OS.

### Alerta de Estoque Baixo

Retorno textual emitido quando a quantidade disponivel esta menor ou igual ao estoque minimo da peca.

---

## Value Objects

### CPF/CNPJ

Identificador usual do cliente.

Deve ser validado, normalizado e usado nas rotas de negocio.

### Email

Contato digital do cliente.

Deve possuir formato valido.

### Telefone

Contato telefonico do cliente.

Deve aceitar formato brasileiro.

### Placa

Identificador usual do veiculo.

Deve aceitar placa brasileira, incluindo padrao Mercosul.

### Numero da OS

Identificador operacional da Ordem de Servico.

Deve ser usado para consulta, aprovacao, rejeicao, execucao, finalizacao e entrega.

---

## Estados da OS

| Status | Significado | Proxima decisao comum |
| --- | --- | --- |
| RECEBIDA | OS criada com relato do cliente. | Iniciar diagnostico. |
| EM_DIAGNOSTICO | Mecanico esta analisando o veiculo. | Registrar problema tecnico. |
| AGUARDANDO_APROVACAO | Orcamento foi criado e aguarda decisao do cliente. | Aprovar ou rejeitar orcamento. |
| APROVADA | Cliente aprovou o orcamento. | Iniciar execucao. |
| ORCAMENTO_REJEITADO | Cliente rejeitou o orcamento. | Liberar reservas da OS, quando houver. |
| EM_EXECUCAO | Servico aprovado esta em execucao. | Finalizar servico. |
| FINALIZADA | Oficina concluiu o servico. | Entregar veiculo. |
| ENTREGUE | Veiculo devolvido ao cliente. | Encerrar acompanhamento. |

---

## Estados do orcamento

| Status | Significado |
| --- | --- |
| PENDENTE | Orcamento calculado e aguardando decisao do cliente. |
| APROVADO | Cliente autorizou a execucao. |
| REJEITADO | Cliente nao autorizou a execucao. |

---

## Comandos de negocio

### Cadastro

- Cadastrar cliente.
- Atualizar cliente.
- Remover cliente.
- Cadastrar ou vincular veiculo.
- Atualizar veiculo.
- Remover veiculo.

### Catalogo

- Cadastrar servico.
- Atualizar servico.
- Remover servico.
- Cadastrar peca com estoque inicial.
- Atualizar peca.
- Remover peca.

### Estoque

- Consultar estoque.
- Consultar pecas com estoque baixo.
- Atualizar saldo disponivel.
- Reservar peca.
- Liberar peca reservada.
- Liberar reservas da OS.
- Consumir peca reservada.

### Atendimento

- Criar OS.
- Listar OS.
- Buscar OS por numero.
- Consultar historico da OS.
- Iniciar diagnostico.
- Registrar problema tecnico.
- Iniciar execucao.
- Finalizar servico.
- Entregar veiculo.

### Orcamento

- Criar orcamento.
- Aprovar orcamento.
- Rejeitar orcamento.

### Metricas

- Consultar tempo medio de finalizacao.
- Consultar tempo medio de execucao por servico.

---

## Eventos de dominio

### Cadastro

- Cliente cadastrado.
- Cliente atualizado.
- Cliente removido.
- Veiculo cadastrado.
- Veiculo vinculado ao cliente.
- Veiculo atualizado.
- Veiculo removido.

### Catalogo

- Servico cadastrado.
- Servico atualizado.
- Servico removido.
- Peca cadastrada.
- Estoque inicial criado.
- Peca atualizada.
- Peca removida.

### Estoque

- Estoque atualizado.
- Estoque baixo identificado.
- Peca reservada.
- Reserva liberada.
- Reserva da OS liberada.
- Peca consumida.

### Atendimento

- Ordem de Servico criada.
- Diagnostico iniciado.
- Problema tecnico registrado.
- Status da OS alterado.
- Execucao iniciada.
- Servico finalizado.
- Veiculo entregue.

### Orcamento

- Orcamento calculado.
- Orcamento aprovado.
- OS marcada como aprovada.
- Orcamento rejeitado.
- OS marcada com orcamento rejeitado.

### Metricas

- Tempo medio de finalizacao consultado.
- Tempo medio por servico consultado.

---

## Regras de negocio

- CPF/CNPJ identifica cliente de forma unica.
- Placa e usada como identificador usual do veiculo, mas nao deve ser tratada como chave unica global.
- Um cliente pode estar vinculado a varios veiculos.
- Um veiculo pode estar vinculado a varios clientes.
- A OS deve ser criada usando CPF/CNPJ, placa e relato do cliente.
- A OS so pode ser criada quando cliente e veiculo estiverem vinculados.
- Rotas de negocio devem evitar IDs internos e preferir CPF/CNPJ, placa, numero da OS, nome de peca e nome de servico.
- Diagnostico deve ocorrer antes do registro do problema tecnico.
- Orcamento deve ser criado antes de aprovacao ou rejeicao.
- Pecas devem ser reservadas durante a criacao do orcamento.
- A OS fica `AGUARDANDO_APROVACAO` apos o orcamento.
- Orcamento aprovado muda a OS para `APROVADA`.
- Execucao so pode iniciar quando a OS esta `APROVADA`.
- Pecas reservadas sao consumidas ao iniciar execucao.
- Orcamento rejeitado muda a OS para `ORCAMENTO_REJEITADO`.
- Rejeicao de orcamento nao libera reserva automaticamente.
- Liberacao de reserva rejeitada deve ser feita por comando relacionado a OS.
- Finalizacao so ocorre apos execucao iniciada.
- Entrega so ocorre apos finalizacao.
- Toda mudanca de status da OS deve ser registrada no historico.
- Historico de status deve ser imutavel.
- Consulta publica de status nao deve expor dados sensiveis, diagnostico tecnico ou valores.
- Servicos e pecas vinculados a orcamentos nao devem ser removidos, para preservar historico financeiro.
- Clientes e veiculos vinculados a OS nao devem ser removidos, para preservar historico operacional.
- Tempo medio por servico deve considerar o intervalo entre `EM_EXECUCAO` e `FINALIZADA`.
- Se um servico nunca tiver sido executado em OS finalizada, o sistema deve retornar mensagem informando ausencia de dados.

---

## Termos preferenciais

| Usar | Evitar em contratos de API | Motivo |
| --- | --- | --- |
| CPF/CNPJ | clienteId | Identificador usado pelo negocio. |
| Placa | veiculoId | Identificador usual do veiculo. |
| Numero da OS | ordemServicoId | Identificador operacional da OS. |
| Nome da peca | pecaId | Operacao do estoque e catalogo usa termo reconhecido pela oficina. |
| Nome do servico | servicoId | Operacao do catalogo e orcamento usa termo reconhecido pela oficina. |
| Ordem de Servico ou OS | ticket | Termo do dominio da oficina. |
| Orcamento | cotacao | Termo usado no fluxo de aprovacao do cliente. |
| Reserva de peca | bloqueio de estoque | Termo mais aderente ao processo operacional. |
| Liberacao de reserva | devolucao automatica | A liberacao e uma acao operacional da atendente. |
| Historico de status | log generico | Historico possui significado de negocio. |
| Estoque baixo | alerta generico | Alerta esta vinculado ao estoque minimo da peca. |

---

## Decisoes de dominio

- A API deve receber identificadores usuais sempre que possivel.
- A placa nao e unica globalmente.
- O mesmo veiculo pode ser usado por varios clientes.
- A OS e o agregado central do atendimento.
- A reserva de pecas fica relacionada a OS por meio do orcamento.
- A rejeicao do orcamento nao libera estoque automaticamente.
- A atendente libera reservas da OS rejeitada em comando proprio.
- `APROVADA` e um status explicito entre aprovacao do orcamento e inicio da execucao.
- O catalogo cadastra pecas e servicos; o estoque controla saldo operacional.
- Criar peca com estoque inicial faz sentido porque a peca nasce disponivel para operacao.
- O tempo medio por servico e uma metrica administrativa baseada no historico da OS.
