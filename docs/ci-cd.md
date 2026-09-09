# CI/CD

## Fluxo de branches

O repositório segue o fluxo:

- `feature/*`  -> `develop`
- `develop` -> `homolog`
- `homolog` -> `main`
- `main` -> CD automático após CI concluído com sucesso

O merge continua manual em todas as etapas. O GitHub Actions apenas valida e cria a PR da próxima fase quando o job anterior termina com sucesso.

## CI de feature

Quando uma branch `feature/*` ` recebe push, o workflow `ci-feature.yml` executa:

- checkout;
- instalação de dependências;
- geração do Prisma Client;
- lint;
- typecheck;
- testes unitários;
- build da aplicação.

Se tudo passar, o workflow abre automaticamente uma PR para `develop`.

## CI completo

Nas branches `develop`, `homolog` e `main`, e também nas PRs para essas branches, o workflow `ci.yml` executa:

- checkout;
- instalação de dependências;
- geração do Prisma Client;
- migrações do Prisma;
- lint;
- typecheck;
- testes unitários;
- cobertura;
- testes de integração;
- build da aplicação;
- validação do Terraform.

## SonarCloud

O SonarCloud é executado apenas no fluxo de `develop -> homolog`.

Esse job usa `SONAR_TOKEN` no environment configurado para o fluxo e monta automaticamente a organização e a chave do projeto a partir do repositório.

## Promoção entre branches

Depois que os checks passam:

- `feature/*` abre PR para `develop`;
- `develop` abre PR para `homolog`;
- `homolog` abre PR para `main`.

O workflow apenas cria a PR. Ele não aprova nem faz merge automático.

## CD

O workflow `cd.yml` é disparado por `workflow_run` quando o CI da `main` conclui com sucesso.

Ele executa:

- build da imagem Docker;
- push para GHCR;
- preparação da base do cluster com Terraform;
- importação da imagem no Kind;
- execução do Job de migration;
- aplicação dos manifests da API;
- validação de `GET /health`;
- coleta de diagnósticos do cluster.

## Boas práticas adotadas

- cada etapa valida apenas o seu estágio;
- a promoção entre branches é automática, mas o merge continua manual;
- o CD só começa depois do CI da `main`;
- a infraestrutura fica separada da aplicação em Terraform e Kubernetes.
