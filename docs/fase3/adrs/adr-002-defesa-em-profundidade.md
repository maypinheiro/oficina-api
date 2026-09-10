# ADR-002 — Validação no Gateway e na API

## Contexto
Confiar apenas na borda permitiria acesso indevido se a API fosse alcançada por outra rota ou o Gateway regredisse.

## Decisão
O Lambda Authorizer valida assinatura, algoritmo, emissor, audiência, expiração e escopo. A API repete as verificações criptográficas e de identidade antes das rotas protegidas.

## Alternativas
Somente Gateway cria um único controle; somente API consome recursos internos com tráfego inválido.

## Consequências
Há defesa em profundidade, com necessidade de manter chave pública, `iss` e `aud` coerentes nos componentes.
