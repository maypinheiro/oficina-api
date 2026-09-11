# Roteiro do vídeo final - Fase 3

Limite: 15 minutos. Grave com o ambiente `hml` ativo e mantenha CPF, JWT, chaves e segredos ocultos.

## 0:00-1:30 - Contexto e arquitetura

- Apresente o desafio da oficina e os quatro repositórios públicos.
- Mostre o diagrama em `arquitetura-alvo.md`.
- Destaque AWS, RDS PostgreSQL, EKS, API Gateway, Lambda e Datadog.
- Explique a limitação do AWS Academy Learner Lab: credenciais temporárias e recursos sujeitos às permissões do `LabRole`.

## 1:30-3:30 - Autenticação

- Abra o Swagger do API Gateway.
- Envie um CPF ativo para `POST /auth/clientes`.
- Mostre apenas que a resposta contém um token Bearer, sem ampliar ou copiar o JWT.
- Demonstre CPF inválido, cliente inexistente e cliente inativo.

## 3:30-5:00 - Autorização e API privada

- Chame `GET /clientes` sem token e mostre a negação.
- Repita com o token e mostre o sucesso.
- Explique Lambda Authorizer, API Gateway, VPC Link e NLB interno.

## 5:00-7:30 - Fluxo da ordem de serviço

- Abra uma OS para o cliente e veículo de demonstração.
- Percorra diagnóstico, problema identificado, orçamento, aprovação, execução, finalização e entrega.
- Mostre o histórico e a consulta pública do status.

## 7:30-9:30 - CI/CD e infraestrutura

- Mostre os workflows verdes dos repositórios.
- Explique promoção `feature -> develop -> homolog -> main` e aprovação manual de PR.
- Mostre Terraform, migration controlada, imagem imutável no ECR e rollout no EKS.

## 9:30-11:00 - Kubernetes e elasticidade

- Mostre Deployment com duas réplicas, PDB e HPA de 2 a 6 réplicas.
- Gere carga e acompanhe `kubectl get hpa,pods`.
- Mostre aumento de réplicas e posterior estabilização.

## 11:00-13:30 - Observabilidade

- Mostre dashboards de API, Kubernetes e negócio no Datadog.
- Filtre logs JSON por `correlationId` e relacione-os ao trace.
- Gere uma falha controlada e mostre o monitor/alerta correspondente.
- Destaque que CPF completo, JWT e segredos não aparecem nos logs.

## 13:30-15:00 - Documentação e encerramento

- Mostre RFCs, ADRs, diagramas, matriz de rotas e runbook.
- Mostre RDS privado, Secrets Manager e ambientes separados.
- Encerre com o checklist dos requisitos e o link do PDF.

## Checklist antes de gravar

- Renovar as credenciais do Learner Lab nos GitHub Environments.
- Executar primeiro `Provision EKS`, pois os controllers usam a sessão temporária.
- Executar os deploys de banco, API e autenticação em `hml`.
- Abrir previamente Swagger, GitHub Actions e dashboards do Datadog.
- Ocultar painel de secrets, console, terminal com variáveis e respostas JWT.
- Manter um cronômetro visível fora da captura e encerrar antes de 15 minutos.
