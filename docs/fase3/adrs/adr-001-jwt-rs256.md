# ADR-001 — JWT RS256 para clientes

## Contexto
O cliente autentica-se por CPF em uma Function independente, enquanto Gateway e API precisam validar a identidade sem compartilhar a chave de emissão.

## Decisão
Emitir JWT RS256 por 15 minutos, com `sub` igual ao ID interno, `scope=cliente`, `iss` e `aud`. A chave privada fica no Secrets Manager e a pública nos validadores. CPF não entra nos claims.

## Alternativas
HS256 foi rejeitado por distribuir o segredo; token opaco exigiria consulta central; Cognito para CPF foi adiado por aumentar a adaptação ao requisito acadêmico.

## Consequências
Emissão e validação ficam separadas, mas rotação e revogação antecipada precisam de procedimento. Conhecer apenas o CPF é risco acadêmico aceito.
