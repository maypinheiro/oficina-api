# Segurança

## Controles implementados

- API Gateway é a borda pública; backend acessado por VPC Link e load balancer interno.
- RDS privado aceita `5432` apenas dos security groups autorizados e exige TLS.
- JWT de cliente usa RS256 por 15 minutos e é validado no Authorizer e na API.
- Runtime usa Secrets Manager; valores reais não ficam em Git ou manifests.
- Helmet, CORS, throttling, validação de entrada e erros genéricos reduzem exposição.
- Logs não registram CPF completo, JWT, senha, chave privada ou conexão.
- CI executa testes, audit de dependências, tfsec e SonarCloud.

## Identidades e riscos

Clientes usam `scope=cliente`. Funcionários continuam temporariamente no login administrativo HS256, sem RBAC granular; a evolução recomendada é Cognito com grupos.

| Risco | Situação | Tratamento recomendado |
|---|---|---|
| Conhecimento do CPF como autenticação | Aceito apenas no requisito acadêmico | OTP ou segundo fator |
| Login administrativo HS256 | Legado temporário | Cognito e tokens assimétricos |
| Callback público de orçamento | Sem assinatura atual | HMAC/mTLS e proteção contra replay |
| Revogação antes de 15 minutos | Não implementada | Token version ou denylist |
| Credenciais AWS temporárias | Limitação Academy | Renovar por sessão; OIDC em conta real |

## Incidente

Rotacionar o segredo, interromper o deployment afetado, preservar logs sem dados pessoais, avaliar alcance por `correlationId`, corrigir por PR e registrar a linha do tempo.
