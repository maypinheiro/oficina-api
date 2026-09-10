# Fase 3 — Definições arquiteturais

Status: **aprovado para implementação**  
Última revisão: 2026-09-08

Este diretório consolida a primeira etapa da Fase 3. O documento oficial da
fase continua sendo `../definicoesFase3.md`, complementado por
`../explicacaoProfessorFase3.md`.

## Decisões consolidadas

| Tema | Decisão |
|---|---|
| Nuvem | AWS |
| Conta | AWS Academy Learner Lab (`982623100545`), conta única e temporária |
| Região primária | `us-east-1` (N. Virginia), por custo e disponibilidade de serviços |
| Observabilidade | Datadog, integrado a EKS, Lambda, API Gateway e PostgreSQL/RDS |
| Homologação | Recursos `hml`, preferencialmente temporários, com deploy da branch `homolog` |
| Produção | Recursos `prod`, deploy da branch `main` e aprovação do environment |
| Entrada HTTP | Amazon API Gateway HTTP API |
| Autenticação do cliente | CPF validado por AWS Lambda, consulta ao RDS e emissão de JWT |
| Validação do JWT | Lambda Authorizer no API Gateway, com cache curto |
| Assinatura | JWT assimétrico `RS256`; chave privada no Secrets Manager e chave pública disponível ao Authorizer |
| Funcionários | Identidade separada no Amazon Cognito, com grupos/papéis administrativos |
| Banco | Amazon RDS for PostgreSQL, privado e fora do EKS |
| Acesso ao banco | Lambda e EKS na VPC; Security Groups aceitam PostgreSQL somente dessas origens |
| Kubernetes | Amazon EKS com Managed Node Groups e HPA |
| Segredos | AWS Secrets Manager; configurações não sensíveis em Parameter Store/ConfigMap |
| Imagens | Amazon ECR, com tags imutáveis pelo SHA do commit |
| IaC | Terraform com estado remoto S3 e locking nativo do backend S3 |

## Ambientes e promoção

```text
feature/* -> develop -> homolog -> main
                    |          |
                    |          +-> deploy em produção
                    +------------> deploy em homologação
```

- Pull Requests e checks obrigatórios em todas as promoções.
- `homolog` aplica no ambiente lógico de homologação da conta Learner Lab.
- `main` inicia o CD de produção; o GitHub Environment `production` exige
  aprovação e, depois dela, o restante do deploy é automático.
- Produção e homologação usam nomes, tags, estados Terraform, secrets e bancos
  distintos dentro da mesma conta. Não há compartilhamento de dados pessoais.
- Homologação usa dados sintéticos e pode ter recursos desligados fora da janela
  de trabalho para redução de custo.

## Autorização

As identidades são separadas:

- cliente: autenticação por CPF conforme requisito acadêmico, com escopos
  limitados às operações do próprio cliente;
- funcionário: Cognito User Pool, credencial individual e grupos como
  `atendimento`, `mecanico` e `admin`;
- serviço: IAM Roles for Service Accounts (IRSA) e IAM roles da Lambda, sem
  credenciais AWS estáticas.

O fato de conhecer um CPF não representa autenticação forte em uma solução
real. O risco é aceito exclusivamente para cumprir o enunciado e está registrado
na RFC de autenticação. CPF completo e JWT nunca devem aparecer nos logs.

## Documentos desta etapa

- `rfc-001-aws.md`: escolha da nuvem e topologia dos ambientes;
- `rfc-002-postgresql-rds.md`: banco e acesso privado;
- `rfc-003-autenticacao.md`: CPF, JWT, Authorizer e funcionários;
- `rfc-004-observabilidade-datadog.md`: métricas, logs, traces e alertas;
- `estimativa-custos.md`: estimativa inicial e mecanismos de controle;
- `arquitetura-alvo.md`: visão de componentes e fluxos principais.
- `modelo-dados.md`: modelo ER, índices, integridade e justificativa relacional.
- `rfc-005-aws-academy-learner-lab.md`: limitações da conta acadêmica e contingências.

## Próximo gate

Antes de provisionar recursos pagos:

1. instalar/configurar AWS CLI e iniciar uma sessão do Learner Lab;
2. executar a matriz de permissões da RFC-005;
3. confirmar saldo e data de expiração do laboratório;
4. criar budgets e alertas, se a role permitir;
5. configurar OIDC se permitido; caso contrário, usar a contingência de
   credenciais temporárias sem versioná-las.
