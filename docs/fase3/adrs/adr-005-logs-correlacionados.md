# ADR-005 — Logs JSON e correlação

## Contexto
Investigar uma requisição entre Gateway, Function e EKS requer identificador comum e logs pesquisáveis.

## Decisão
Emitir JSON com serviço, ambiente, nível, evento, `correlationId`, rota, status e duração; aceitar ou gerar `x-correlation-id`. CPF completo, JWT, chaves e credenciais são proibidos.

## Alternativas
Texto livre dificulta filtros; CPF como correlação expõe dado pessoal.

## Consequências
Melhora dashboards e diagnóstico, exigindo mascaramento e retenção controlada.
