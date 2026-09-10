# ADR-008 — Gestão de segredos

## Contexto
Banco, assinatura JWT, Datadog e credenciais temporárias não podem ser versionados.

## Decisão
Usar Secrets Manager no runtime, External Secrets no EKS quando disponível e GitHub Environment secrets no bootstrap. `hml` e `prod` são isolados e produção exige aprovação. Credenciais temporárias Academy são usadas porque OIDC/IAM pode estar bloqueado.

## Alternativas
Segredos em Git foram rejeitados; Secret Kubernetes estático serve apenas como exemplo local; OIDC é preferido fora do laboratório.

## Consequências
Reduz exposição, mas requer rotação coordenada. A cada sessão Academy, os três valores AWS dos environments precisam ser renovados.
