# Ownership e isolamento dos dados

## Regra principal

Cada serviço é a única autoridade de escrita e leitura direta do próprio banco.
Compartilhamento ocorre por API ou eventos, nunca por conexão ao banco alheio.

## Mapa de ownership

| Entidade/dado | Dono | Tecnologia | Observação |
|---|---|---|---|
| Ordem de serviço | OS | PostgreSQL | estado global e referências externas |
| Histórico global da OS | OS | PostgreSQL | projeção baseada em eventos |
| Saga e passos | OS | PostgreSQL | estado, tentativas, deadlines e auditoria |
| Cliente/veículo | OS inicialmente | PostgreSQL | permanece no OS nesta fase; extração futura exige nova decisão |
| Orçamento | Billing | PostgreSQL | valores, itens, aprovação e cancelamento |
| Pagamento | Billing | PostgreSQL | estado e referência do provedor |
| Diagnóstico | Execution | DynamoDB | problema identificado e andamento |
| Execução/reparo | Execution | DynamoDB | fila, progresso e conclusão |
| Reservas técnicas/peças | Execution | DynamoDB | quando pertencentes ao fluxo de execução |
| Inbox/Outbox | cada serviço | banco próprio | idempotência e publicação confiável |

## Dados replicados como projeção

O OS Service pode manter estado resumido de orçamento, execução e pagamento
para consulta da jornada. Esses campos são projeções derivadas de eventos e não
substituem a fonte oficial.

Exemplos permitidos no OS:

- `quoteId` e `quoteStatus`;
- `executionId` e `executionStatus`;
- `paymentId` e `paymentStatus`;
- timestamps das transições.

Exemplos proibidos:

- consultar tabelas do Billing para montar a OS;
- alterar pagamento com Prisma/SQL pelo OS;
- criar foreign key entre databases;
- compartilhar o mesmo usuário de banco entre serviços;
- copiar dados completos sem finalidade de consulta definida.

## Estratégia de infraestrutura

- OS e Billing podem usar databases isolados na mesma instância RDS acadêmica;
- cada database possui usuário e secret próprios;
- Security Groups e IAM limitam cada workload ao recurso necessário;
- Execution usa tabela DynamoDB e policy próprias;
- Terraform/state deve permitir deploy de um banco sem recriar os demais;
- produção real deve preferir instâncias separadas quando custo permitir.

## Migração do monólito

1. congelar o mapa atual de tabelas e dependências;
2. criar schemas dos serviços de destino;
3. copiar e reconciliar dados históricos;
4. introduzir eventos e projeções sem remover o fluxo antigo;
5. migrar escrita por domínio;
6. validar contagens, totais e estados;
7. remover tabelas/relacionamentos do banco original;
8. revogar acessos antigos.

Não haverá dual write ingênuo em dois bancos. Durante a transição, Outbox e
consumidores idempotentes coordenam sincronização temporária.
