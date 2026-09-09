# RFC-003 — Autenticação por CPF e autorização JWT

- Status: aceita
- Data: 2026-09-08

## Contexto

O sistema atual emite JWT administrativo após validar usuário e senha em
variáveis de ambiente. A Fase 3 exige uma Function Serverless que valide CPF,
consulte existência e status do cliente e emita JWT para APIs protegidas.

## Decisão

Usar dois domínios de identidade.

### Clientes

`POST /auth/clientes` será uma integração pública do API Gateway com a Lambda de
autenticação. O corpo contém apenas o CPF. A função:

1. cria ou aceita um `correlationId`;
2. normaliza e valida o CPF;
3. consulta o cliente no RDS;
4. permite somente `status = ATIVO`;
5. emite JWT RS256 com validade inicial de 15 minutos;
6. retorna respostas que não revelem se um CPF está cadastrado;
7. registra CPF apenas mascarado ou em hash irreversível para correlação.

Claims mínimas:

```json
{
  "sub": "id-do-cliente",
  "scope": "cliente",
  "iss": "oficina-auth",
  "aud": "oficina-api",
  "iat": 0,
  "exp": 0,
  "jti": "uuid"
}
```

O CPF não precisa constar no token. A API usa `sub` para restringir operações ao
cliente autenticado.

### Funcionários

Funcionários continuarão com autenticação separada, mas o usuário/senha global
do código atual será substituído por Amazon Cognito User Pool. Cada funcionário
terá credencial individual e grupo/papel. O login administrativo legado deverá
ser removido após a migração.

### Validação no Gateway

O API Gateway HTTP API usará um Lambda Authorizer do tipo request:

- valida assinatura, `iss`, `aud`, expiração e escopo;
- aceita o token de cliente emitido pela Lambda e tokens de funcionário do
  Cognito segundo regras explícitas;
- retorna contexto mínimo para a API;
- usa cache curto, inicialmente 60 segundos;
- nega por padrão.

A API também valida autorização de negócio. Rotas administrativas exigem papel
de funcionário; rotas do cliente conferem se o recurso pertence ao `sub`.

## Chaves e segredos

- algoritmo: RS256;
- chave privada: Secrets Manager, acessível apenas à Lambda emissora;
- chave pública: Parameter Store ou variável segura do Authorizer;
- credencial RDS: Secrets Manager com permissão separada;
- rotação: nova chave com `kid`, janela de sobreposição e posterior retirada da
  chave antiga;
- nenhum JWT, CPF completo ou chave aparece em logs ou repositórios.

## Risco aceito

CPF é identificador pessoal e pode ser conhecido por terceiros; isoladamente,
não comprova posse ou identidade. O fluxo é adotado para cumprir o requisito
acadêmico. Para produção real, a recomendação é acrescentar segundo fator ou
desafio de posse, como OTP enviado a contato previamente cadastrado.

## Alternativas consideradas

- segredo HS256 compartilhado: mais simples, mas amplia o número de componentes
  com poder de emitir tokens.
- Authorizer JWT nativo: ideal com emissor OIDC/JWKS, mas a Function customizada
  exigida não fornece naturalmente toda essa infraestrutura.
- manter login administrativo estático: descartado por falta de identidade
  individual, rotação e auditoria adequadas.

## Critérios de aceite

- CPF inválido, inexistente ou inativo não recebe token;
- cliente ativo recebe token válido por 15 minutos;
- token alterado, expirado, com audience/issuer incorretos é rejeitado;
- cliente não acessa recurso de outro cliente;
- funcionário usa identidade própria e papel verificável;
- testes cobrem falha do banco e ausência de segredo;
- logs e traces mantêm correlação sem vazar dados sensíveis.

## Referências

- https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-lambda-authorizer.html
- https://docs.aws.amazon.com/secretsmanager/latest/userguide/intro.html

