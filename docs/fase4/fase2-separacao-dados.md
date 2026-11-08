# Fase 2 — Separação dos dados

## Estratégia

A migração segue `expand → migrate → reconcile → contract`. As tabelas legadas não são removidas enquanto a aplicação da Fase 3 ainda depende delas. Primeiro são criados os bancos-alvo, depois os dados são copiados preservando identificadores, reconciliados e, somente após o cutover, o acesso legado será removido.

## Ownership final

| Serviço | Persistência | Dados próprios |
|---|---|---|
| OS Service | PostgreSQL `oficina_os` | cliente/veículo necessários, OS, histórico global, Saga, outbox e inbox |
| Billing Service | PostgreSQL `oficina_billing` | orçamento, itens, aprovação, pagamento, outbox e inbox |
| Execution Service | DynamoDB `oficina-execution-{env}` | fila, diagnóstico, execução, reservas e idempotência |

IDs dos outros domínios são referências externas e não possuem foreign keys entre bancos. Nenhum serviço recebe credencial do banco de outro serviço.

## Procedimento de migração

1. Fazer backup consistente do banco legado.
2. Aplicar as migrations expansivas do OS e Billing.
3. Provisionar a tabela DynamoDB do Execution.
4. Executar os migradores com credenciais temporárias de leitura no legado e escrita apenas no destino.
5. Executar reconciliação de contagens e órfãos; resultado diferente exige rollback do cutover.
6. Fazer dual-read ou shadow validation antes de mudar o tráfego.
7. Revogar do usuário de migração o acesso ao legado.
8. Remover tabelas legadas somente em uma fase posterior e com backup validado.

## Rollback

Enquanto não ocorrer o passo `contract`, a API atual permanece fonte da verdade. O rollback consiste em interromper os migradores, descartar/recriar somente o destino e repetir a cópia. Os scripts são idempotentes: PostgreSQL usa `ON CONFLICT` e DynamoDB usa chaves estáveis.

## Critérios de aceite

- schemas independentes versionados;
- IDs externos preservados;
- zero órfãos no Billing;
- contagens reconciliadas nos destinos;
- DynamoDB criptografado, com point-in-time recovery e IAM limitado à tabela;
- nenhuma foreign key ou credencial cruzando serviços;
- tabelas legadas mantidas explicitamente como compatibilidade temporária.
