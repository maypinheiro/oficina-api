# Entrega final - Tech Challenge Fase 3

## Repositórios

- API: https://github.com/maypinheiro/oficina-api
- Autenticação: https://github.com/maypinheiro/oficina-auth-function
- Kubernetes e observabilidade: https://github.com/maypinheiro/oficina-k8s-infra
- Banco gerenciado: https://github.com/maypinheiro/oficina-database-infra

## Ambiente validado

- Ambiente: homologação (`hml`)
- Região: `us-east-1`
- Conta acadêmica AWS: `982623100545`
- API Gateway: https://9o7vnq3io0.execute-api.us-east-1.amazonaws.com
- Swagger: https://9o7vnq3io0.execute-api.us-east-1.amazonaws.com/docs
- Provisionamento EKS validado: https://github.com/maypinheiro/oficina-k8s-infra/actions/runs/34616729840
- Autenticação e integração privada validadas: https://github.com/maypinheiro/oficina-auth-function/actions/runs/34617351925

O ambiente usa AWS Academy Learner Lab. As credenciais expiram ao fim da sessão; por isso, os GitHub Environments e os controllers que acessam AWS devem ser atualizados antes da demonstração. O ambiente pode deixar de responder quando a sessão ou os recursos do laboratório forem encerrados.

## Arquitetura entregue

API Gateway HTTP API recebe as requisições públicas. A autenticação por CPF é executada por Lambda e gera JWT RS256. Um Lambda Authorizer protege as rotas privadas. O Gateway alcança a API no EKS por VPC Link e NLB interno. A API usa PostgreSQL no RDS privado, com segredos no Secrets Manager. Datadog recebe métricas, logs e traces da API, Kubernetes e Functions.

## Evidência de aceite técnico

- Emissão de JWT para cliente ativo: validada.
- Lambda Authorizer e rota protegida `/clientes`: validados.
- API Gateway, VPC Link, NLB privado e API no EKS: validados.
- Health check `/health`: validado.
- Terraform, testes, build e deploy automatizado: validados.
- RDS privado, migration e seed de homologação: validados.
- Logs JSON, correlação, APM, dashboards e monitores: implementados.
- HPA de 2 a 6 réplicas e PDB: implementados.
- RFCs, ADRs, diagramas, matriz de permissões e runbook: versionados.

## Pendências humanas para submissão

- Gravar o vídeo com até 15 minutos.
- Publicar no YouTube ou Vimeo, público ou não listado.
- Inserir a URL do vídeo neste documento e regenerar o PDF.
- Durante a gravação, capturar visualmente os cenários negativos, ciclo completo da OS, correlação no Datadog, alerta e reação do HPA.
- Confirmar, se exigido pela banca, o usuário colaborador `soat-architecture`; a decisão atual foi manter repositórios públicos sem adicioná-lo.

## Documentação principal

- `docs/fase3/arquitetura-alvo.md`
- `docs/fase3/matriz-rotas-permissoes.md`
- `docs/fase3/observabilidade.md`
- `docs/fase3/runbook.md`
- `docs/fase3/seguranca.md`
- `docs/fase3/adrs/README.md`
- `docs/fase3/rfc-001-cloud-aws.md`
- `docs/fase3/rfc-002-banco-rds-postgresql.md`
- `docs/fase3/rfc-003-autenticacao.md`
- `docs/fase3/rfc-004-observabilidade-datadog.md`
- `docs/fase3/rfc-005-aws-academy-learner-lab.md`
