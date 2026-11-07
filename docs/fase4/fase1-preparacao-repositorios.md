# Fase 1 — Preparação dos repositórios

## Objetivo

Preparar os três microsserviços da Fase 4 para evolução independente, sem extrair prematuramente regras de negócio nem interromper a entrega funcional da Fase 3.

## Decisão sobre o OS Service

O repositório remoto `oficina-api` será preservado e passará a representar o **Oficina OS Service**. Manter o nome remoto evita quebrar links, histórico, pipelines e evidências já entregues. O nome funcional do serviço passa a constar no README, nas imagens e na documentação.

O escopo definitivo do OS Service será:

- abrir e consultar ordens de serviço;
- manter status e histórico global da OS;
- orquestrar a Saga;
- persistir estado da Saga, outbox e inbox/idempotência;
- publicar comandos e consumir eventos de Billing e Execution.

Temporariamente, o repositório ainda contém clientes, veículos, catálogo, estoque e orçamento. Esses módulos são legado controlado da Fase 3 e serão retirados somente depois que seus substitutos estiverem implantados e validados.

## Repositórios da solução

| Repositório | Responsabilidade | Banco planejado |
|---|---|---|
| [`oficina-api`](https://github.com/maypinheiro/oficina-api) (OS Service) | OS, histórico e orquestração da Saga | PostgreSQL |
| [`oficina-billing-service`](https://github.com/maypinheiro/oficina-billing-service) | orçamento, aprovação e pagamento | PostgreSQL |
| [`oficina-execution-service`](https://github.com/maypinheiro/oficina-execution-service) | fila, diagnóstico e execução | DynamoDB |

Cada serviço terá build, testes, imagem, manifestos Kubernetes, infraestrutura, documentação e pipeline próprios. Nenhum serviço poderá acessar o banco de outro.

## Critérios de conclusão da fase

- [x] OS Service identificado sem perder o histórico da Fase 3;
- [x] estrutura inicial documentada para Billing e Execution;
- [x] health check e teste automatizado nos novos serviços;
- [x] Dockerfile, manifestos Kubernetes e diretório Terraform por serviço;
- [x] CI independente com cobertura mínima de 80%;
- [x] repositórios públicos publicados no GitHub;
- [x] proteção da `main` com pull request e verificação `quality` obrigatória.

## Evidências da execução

- [PR do OS Service](https://github.com/maypinheiro/oficina-api/pull/72), aprovado por `validate` e SonarCloud;
- [PR do Billing Service](https://github.com/maypinheiro/oficina-billing-service/pull/1), aprovado pelo CI independente;
- [PR do Execution Service](https://github.com/maypinheiro/oficina-execution-service/pull/1), aprovado pelo CI independente;
- branches `main`, `develop` e `homolog` publicadas nos novos serviços;
- proteção da `main` com histórico linear, bloqueio de force push e exclusão, resolução de conversas e PR obrigatório;
- testes locais dos novos serviços com 100% de linhas, 100% de funções e 81,25% de branches.

Extração de domínio, mensageria, Saga e bancos são fases posteriores e não são declarados como concluídos aqui.
