# Runbook operacional

## Pré-requisitos

- sessão AWS Academy ativa na conta `982623100545`, região `us-east-1`;
- renovar `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` e `AWS_SESSION_TOKEN` no environment;
- outputs de rede, chaves Datadog e acesso ao cluster disponíveis.

## Implantação

1. Executar CD de `oficina-k8s-infra` e guardar outputs.
2. Cadastrar os outputs e provisionar `oficina-database-infra`.
3. Cadastrar ARN do segredo/banco e rede; provisionar `oficina-auth-function`.
4. Publicar `oficina-api`, executar migration Job e rollout.
5. Validar `/health`, autenticação, rota protegida e dashboards.

`prod` exige aprovação manual. Nunca usar `terraform destroy` como diagnóstico.

| Sintoma | Verificação | Ação segura |
|---|---|---|
| 401 na autenticação | cliente, Function, secret e RDS | corrigir configuração sem logar CPF |
| 401/403 protegido | `alg`, `iss`, `aud`, expiração e chave | alinhar valores e emitir novo token |
| 5xx/latência | dashboard, pods, traces e RDS | isolar dependência; rollback de imagem compatível |
| Pods pendentes | eventos, requests e nodes | liberar capacidade permitida |
| Migration falhou | logs do Job e Prisma | criar nova migration; não alterar aplicada |
| Datadog sem dados | Agent, secret, tags e egress | corrigir integração; consultar CloudWatch |

## Rollback e encerramento

Reimplantar o último SHA saudável. Migration não é revertida automaticamente: usar expand/contract. Para Terraform, revisar plan/state e aplicar correção incremental. Ao encerrar o laboratório, registrar evidências, remover recursos caros na ordem inversa quando autorizado e confirmar que EKS, RDS, NAT/LB e endpoints não ficaram ativos.
