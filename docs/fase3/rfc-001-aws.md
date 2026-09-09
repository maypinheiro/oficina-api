# RFC-001 — AWS e topologia dos ambientes

- Status: aceita
- Data: 2026-09-08

## Contexto

A Fase 3 exige API Gateway, Function Serverless, banco gerenciado, Kubernetes
escalável, Terraform e deploy automático em homologação e produção.

## Decisão

Usar AWS na região `us-east-1`, com os seguintes serviços:

- Amazon API Gateway HTTP API;
- AWS Lambda e Lambda Authorizer;
- Amazon EKS com Managed Node Groups;
- Amazon ECR;
- Amazon RDS for PostgreSQL;
- AWS Secrets Manager e Systems Manager Parameter Store;
- IAM/OIDC para GitHub Actions;
- CloudWatch como fonte nativa, encaminhando telemetria ao Datadog;
- S3 para estado Terraform e locking nativo do backend S3.

O projeto usará a conta única AWS Academy Learner Lab `982623100545`, fornecida
pela pós-graduação. Homologação e produção serão isoladas logicamente por
prefixos, tags, estados Terraform, secrets, bancos e recursos distintos. A
impossibilidade de isolamento por conta é aceita e detalhada na RFC-005.

Para o trabalho acadêmico, `us-east-1` foi escolhida por disponibilidade ampla e
custo normalmente menor. A latência para usuários no Brasil é uma consequência
aceita. Uma implantação comercial brasileira deve reavaliar `sa-east-1` e os
requisitos de residência de dados.

## Rede

- duas Availability Zones quando quotas e permissões permitirem;
- load balancer em sub-redes públicas;
- EKS nodes e RDS em sub-redes privadas;
- RDS sem endpoint público;
- NAT Gateway somente se permitido e necessário, priorizando homologação temporária;
- Security Groups referenciando outros Security Groups, nunca `0.0.0.0/0` na
  porta 5432;
- API Gateway acessa a API por VPC Link e load balancer interno.

## CI/CD e credenciais

GitHub Actions deverá assumir roles por OpenID Connect se o Learner Lab permitir
criar provider e roles. Se bloqueado, serão usados GitHub Environments com as
credenciais temporárias da sessão. Elas nunca serão commitadas e precisarão ser
renovadas quando expirarem.

## Alternativas consideradas

- Azure: atende aos requisitos, mas foi descartada porque AWS foi escolhida pelo
  grupo.
- Dois EKS na mesma conta: melhor isolamento, mas pode exceder saldo ou quotas.
- Um único EKS com namespaces por ambiente: contingência econômica que reduz o isolamento.
- Kind no GitHub runner: útil para testes, mas não é deploy cloud persistente.

## Consequências

- a conta e suas credenciais são temporárias;
- permissões, quotas, regiões e serviços podem ser limitados pela Academy;
- o isolamento é lógico, não uma barreira de conta;
- o número de clusters dependerá da validação de custo e quotas;
- haverá estado Terraform separado por ambiente;
- recursos atuais de Kind continuam úteis apenas para desenvolvimento/testes.

## Referências

- https://aws.amazon.com/eks/pricing/
- https://aws.amazon.com/api-gateway/pricing/
- https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_providers_create_oidc.html
