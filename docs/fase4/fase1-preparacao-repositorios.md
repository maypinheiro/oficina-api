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
| `oficina-api` (OS Service) | OS, histórico e orquestração da Saga | PostgreSQL |
| `oficina-billing-service` | orçamento, aprovação e pagamento | PostgreSQL |
| `oficina-execution-service` | fila, diagnóstico e execução | DynamoDB |

Cada serviço terá build, testes, imagem, manifestos Kubernetes, infraestrutura, documentação e pipeline próprios. Nenhum serviço poderá acessar o banco de outro.

## Critérios de conclusão da fase

- [x] OS Service identificado sem perder o histórico da Fase 3;
- [x] estrutura inicial documentada para Billing e Execution;
- [x] health check e teste automatizado nos novos serviços;
- [x] Dockerfile, manifestos Kubernetes e diretório Terraform por serviço;
- [x] CI independente com cobertura mínima de 80%;
- [ ] repositórios públicos publicados no GitHub;
- [ ] proteção da `main` com pull request e verificações obrigatórias.

Os dois últimos itens dependem de uma sessão autenticada do GitHub CLI e serão marcados após a publicação. Extração de domínio, mensageria, Saga e bancos são fases posteriores e não são declarados como concluídos aqui.
