# Decisões Arquiteturais

## 1. Clean Architecture na borda HTTP

A camada HTTP foi mantida fina e sem regras de negócio.

- Controllers recebem use cases por injeção de dependência.
- Presenters isolam a forma de resposta da API.
- O composition root centraliza a montagem das dependências.
- As rotas apenas validam request e delegam para controllers.

## 2. Fluxo de branches com promoção automática

O pipeline foi organizado em etapas curtas e previsíveis.

- `feature/*` passa por checks rápidos e abre PR para `develop`.
- `develop` passa por validação completa e abre PR para `homolog`.
- `homolog` passa pela mesma validação e abre PR para `main`.
- O merge continua manual e depende dos checks.

## 3. Separação entre CI e CD

CI e CD foram separados para deixar o objetivo de cada fluxo claro.

- `ci-feature.yml` valida código rapidamente nas branches de feature.
- `ci.yml` valida aplicação, testes e infraestrutura nas branches principais.
- `cd.yml` executa o deploy no cluster efêmero do runner.
- O CD depende do sucesso da `main` via `workflow_run`.

## 4. Terraform para a base da infraestrutura

O Terraform provisiona o cluster Kind e aplica os manifests como resources declarativos.

- O cluster não é criado manualmente com `kubectl`.
- Os manifests ficam versionados em `k8s/`.
- A base inclui namespace, ConfigMap, Secret, PostgreSQL e Metrics Server.
- A aplicação fica separada da base e pode ser ligada ou desligada por variável.

## 5. Docker Compose para execução local

O Docker Compose foi mantido como o caminho mais rápido para rodar a solução localmente.

- `docker compose up -d` sobe API e PostgreSQL com configuração pronta.
- Migrations são aplicadas por um job dedicado no Kubernetes; o seed local é opcional e vem depois.
- O Sonar ficou separado para não poluir o fluxo principal.
- A escalabilidade é demonstrada no Kind, não no Compose.

## 6. PostgreSQL em container

O banco foi entregue como container para manter o ambiente reproduzível.

- Atende ao fluxo acadêmico e ao deploy local.
- Simplifica a demonstração no GitHub Actions.
- Preserva integridade relacional e transacional do domínio.
- Usa PVC para persistência dos dados.

## 7. Metrics Server e HPA

O HPA foi aplicado somente na API.

- A API é stateless e é o melhor ponto para escalar horizontalmente.
- O banco não precisa de HPA para atender ao requisito.
- O Metrics Server é necessário para leitura de CPU e memória.
- As réplicas vão de `2` a `6`, conforme a carga.

## 8. Job de migração no deploy

As migrações do Prisma foram colocadas em um Job dedicado no Kubernetes.

- Garante que o banco esteja pronto antes da API subir.
- Mantém a aplicação sem lógica de migração embarcada no container principal.
- Separa responsabilidade de deploy e de execução da API.
- Facilita reexecução controlada em CD.

## 9. Documentação modular

A documentação foi dividida em arquivos menores para facilitar leitura e manutenção.

- `execucao-local.md`
- `execucao-kind.md`
- `ci-cd.md`
- `infraestrutura.md`
- `arquitetura.md`
- `decisoes-arquiteturais.md`

## 10. Trade-off aceito

A opção por Kubernetes local e banco containerizado não é a forma mais forte para produção, mas é a melhor para uma entrega reproduzível, avaliável e demonstrável.
