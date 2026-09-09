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

Homologação e produção ficam em contas AWS separadas dentro de AWS
Organizations. Cada conta possui VPC, EKS, RDS, segredos e estado Terraform
próprios. Essa separação reduz o raio de impacto e torna as evidências de deploy
mais claras.

Para o trabalho acadêmico, `us-east-1` foi escolhida por disponibilidade ampla e
custo normalmente menor. A latência para usuários no Brasil é uma consequência
aceita. Uma implantação comercial brasileira deve reavaliar `sa-east-1` e os
requisitos de residência de dados.

## Rede

- duas Availability Zones por ambiente;
- load balancer em sub-redes públicas;
- EKS nodes e RDS em sub-redes privadas;
- RDS sem endpoint público;
- um NAT Gateway por ambiente na versão acadêmica;
- Security Groups referenciando outros Security Groups, nunca `0.0.0.0/0` na
  porta 5432;
- API Gateway acessa a API por VPC Link e load balancer interno.

## CI/CD e credenciais

GitHub Actions assume roles IAM por OpenID Connect. Não serão armazenadas
access keys AWS de longa duração no GitHub. Haverá uma role por repositório e
ambiente, com privilégio mínimo.

## Alternativas consideradas

- Azure: atende aos requisitos, mas foi descartada porque AWS foi escolhida pelo
  grupo.
- Um único EKS com namespaces por ambiente: mais barato, porém cria acoplamento,
  compartilha falhas e reduz o isolamento.
- Kind no GitHub runner: útil para testes, mas não é deploy cloud persistente.

## Consequências

- dois clusters aumentam o custo mínimo;
- a separação de contas melhora segurança, rastreabilidade e limpeza;
- será necessário bootstrap de estado Terraform e roles OIDC em cada conta;
- recursos atuais de Kind continuam úteis apenas para desenvolvimento/testes.

## Referências

- https://aws.amazon.com/eks/pricing/
- https://aws.amazon.com/api-gateway/pricing/
- https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_providers_create_oidc.html

