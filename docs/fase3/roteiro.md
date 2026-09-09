Roteiro de implementação
Fase 0 — Definições arquiteturais
Antes de programar, fechar estas decisões:
Escolher o provedor de nuvem.
Escolher a ferramenta de observabilidade.
Definir ambientes:homologação;
produção.

Definir estratégia de branches.
Definir como API Gateway validará o JWT.
Definir se funcionários continuarão usando autenticação administrativa separada.
Definir armazenamento do segredo ou chave de assinatura.
Definir estratégia para acesso da Function ao banco privado.
Definir naming, tags, regiões e orçamento cloud.
Entregáveis dessa fase:
RFC da escolha da nuvem;
RFC do banco;
RFC da autenticação;
RFC da observabilidade;
estimativa básica de custo;
desenho da arquitetura-alvo.
Fase 1 — Separação dos repositórios
Criar os quatro repositórios e distribuir os artefatos atuais.
Aplicação
Mover/copiar para oficina-api:
app/src;
app/prisma;
app/Dockerfile;
package.json e lockfile;
testes;
Swagger;
documentação específica da API.
Kubernetes
Mover e adaptar para oficina-k8s-infra:
Terraform atual como referência;
manifests do Kubernetes;
HPA;
PDB;
namespace;
configuração de deployment.
Remover desse repositório:
PostgreSQL executado dentro do cluster;
segredos reais versionados;
dependência de Kind para produção.
Banco
Criar oficina-database-infra com Terraform novo para:
PostgreSQL gerenciado;
rede privada;
security groups;
backups;
parâmetros;
outputs;
credenciais armazenadas em secret manager.
Function
Criar oficina-auth-function com:
handler serverless;
validação de CPF;
consulta ao cliente;
verificação de status;
geração do JWT;
testes;
infraestrutura da Function e integração com o Gateway, dependendo da responsabilidade definida.
Fase 2 — Ajustes no modelo de dados
O modelo Cliente não possui status. Será necessário adicionar, por exemplo:
enum StatusCliente {
  ATIVO
  INATIVO
  BLOQUEADO
}

model Cliente {
  // campos existentes
  status StatusCliente @default(ATIVO)
}
Também devem ser avaliados:
índice de consulta por CPF;
índice de OS por status e data;
índices utilizados nos dashboards;
regras de exclusão e integridade referencial;
unicidade da placa, se a regra de negócio exigir;
histórico suficiente para medir cada etapa da OS.
O cpfCnpj já é único, o que ajuda a consulta da autenticação. Entretanto, o requisito fala especificamente em CPF; deve-se documentar como clientes pessoa jurídica serão tratados.
Entregáveis:
migration Prisma;
atualização de seeds;
testes;
diagrama ER;
justificativa formal do PostgreSQL;
explicação de índices, relacionamentos e consistência.
Fase 3 — Function Serverless de autenticação
Implementar o fluxo:
Receber o CPF.
Normalizar o valor.
Validar os dígitos verificadores.
Consultar o cliente por CPF.
Retornar resposta genérica para cliente inexistente ou não autorizado.
Verificar se o cliente está ativo.
Gerar JWT com expiração curta.
Incluir claims mínimas:sub: ID do cliente;
cpf;
role ou scope;
iat;
exp;
iss;
aud.

Registrar log estruturado sem expor CPF completo.
Propagar correlationId ou traceId.
Testes mínimos:
CPF inválido;
cliente inexistente;
cliente inativo;
cliente ativo;
falha de banco;
JWT válido;
JWT expirado;
segredo ausente;
CPF não exposto integralmente nos logs.
Ponto de atenção: autenticar somente pelo conhecimento do CPF é fraco em ambiente real. Como esse é o requisito acadêmico, isso deve ser registrado em RFC como limitação e risco aceito.
Fase 4 — API Gateway e proteção das APIs
Configurar o Gateway para:
expor o endpoint público de autenticação;
encaminhar autenticação para a Function;
encaminhar APIs de negócio para o Kubernetes;
validar JWT antes das rotas protegidas;
aplicar HTTPS;
configurar CORS;
throttling e limites;
access logs;
correlation ID;
respostas padronizadas;
healthcheck ou integração com o serviço.
Classificar as rotas:
públicas:health;
documentação, caso desejado;
autenticação por CPF;
possível fluxo público de aprovação de orçamento.

autenticadas como cliente;
administrativas/funcionário.
A aplicação também deve continuar validando identidade e autorização. O Gateway não deve ser a única barreira.
Fase 5 — Banco gerenciado
Provisionar PostgreSQL gerenciado via Terraform com:
instância separada por ambiente ou estratégia documentada;
rede privada;
acesso somente pelo cluster e pela Function;
criptografia em repouso;
TLS em trânsito;
backup automático;
retenção configurada;
proteção contra exclusão em produção;
monitoramento;
credenciais no secret manager;
migrations executadas por job controlado.
Critério essencial: não levar o postgres.yaml atual para produção. Ele é útil apenas para execução local.
Fase 6 — Kubernetes em nuvem
Converter o Terraform de Kind para o serviço Kubernetes escolhido.
Implementar:
cluster gerenciado;
node groups;
namespaces por ambiente;
autoscaling;
HPA da API;
PDB;
probes;
requests e limits;
ingress ou integração privada com o Gateway;
secrets externos;
rolling updates;
imagem em registry;
job de migration;
configurações distintas para homologação e produção.
O HPA e o PDB atuais são bons pontos de partida, mas o metrics-server.yaml local pode não ser necessário ou deve ser instalado de forma apropriada para a cloud.
Fase 7 — Observabilidade
Instrumentar a aplicação e a Function com uma abordagem única.
Logs
Todos os logs devem ser JSON e incluir:
timestamp;
nível;
serviço;
ambiente;
rota;
método;
status HTTP;
duração;
correlationId;
traceId;
número da OS quando aplicável;
tipo de erro.
Nunca registrar:
JWT completo;
segredo;
senha;
CPF completo;
connection string.
Métricas
Coletar:
latência por rota;
taxa de erros;
throughput;
CPU e memória dos pods;
quantidade de réplicas;
restarts;
disponibilidade;
falhas na criação e mudança de status de OS;
erros de integração;
volume diário de OS;
duração média em diagnóstico;
duração média em execução;
duração média até finalização.
A API já calcula algumas métricas de tempo, mas ainda não calcula exatamente todas as métricas por estágio exigidas.
Traces
Instrumentar:
API Gateway → Function → PostgreSQL
API Gateway → API Kubernetes → PostgreSQL
Propagar o mesmo identificador durante todo o fluxo.
Alertas
Criar alertas para:
erro na abertura da OS;
erro na atualização de status;
aumento de HTTP 5xx;
latência elevada;
aplicação indisponível;
pods reiniciando;
CPU/memória sustentada;
falha da Function;
falha de conexão com o banco.
Fase 8 — Dashboards obrigatórios
Criar pelo menos três dashboards ou uma visão consolidada:
Operação da API
latência;
throughput;
erros;
uptime.

Kubernetes
CPU;
memória;
réplicas;
restarts;
HPA.

Negócio/ordens de serviço
volume diário de OS;
tempo médio em diagnóstico;
tempo médio em execução;
tempo médio até finalização;
erros nas integrações.

É necessário produzir dados de demonstração para que os gráficos não apareçam vazios no vídeo.
Fase 9 — CI/CD dos quatro repositórios
Cada repositório deverá possuir seu próprio pipeline.
Function
CI:
lint;
typecheck;
testes;
análise de segurança;
empacotamento.
CD:
Terraform plan;
deploy em homologação;
smoke test;
aprovação de produção, se adotada;
deploy em produção.
Kubernetes
CI:
terraform fmt;
terraform validate;
lint;
scan de segurança;
terraform plan.
CD:
apply por ambiente;
validação do cluster;
outputs como evidência.
Banco
CI:
validação Terraform;
segurança;
plan.
CD:
apply controlado;
validação de conectividade;
políticas extras de aprovação para produção.
Aplicação
CI:
npm ci;
lint;
typecheck;
testes;
cobertura;
testes de integração;
build;
scan;
imagem Docker.
CD:
publicar imagem imutável por SHA;
executar migration;
deploy em homologação;
smoke test;
promover para produção;
validar rollout e healthcheck.
O deploy deve apontar para infraestrutura persistente em nuvem. O Kind efêmero atual não atende a essa parte.
Fase 10 — Proteção dos repositórios
Em todos os quatro:
bloquear commits diretos na main;
exigir Pull Request;
exigir checks;
impedir merge com pipeline falhando;
exigir branch atualizada;
impedir force push;
configurar CODEOWNERS, se possível;
criar environments homolog e production;
cadastrar secrets por ambiente;
adicionar o usuário soat-architecture;
guardar capturas ou links que comprovem essas configurações.
Sugestão de fluxo simples:
feature/* → develop → homolog → main
O documento exige deploy automático para homologação e produção; isso não significa que o merge precise ser automático.
Fase 11 — Documentação arquitetural
Produzir:
diagrama de componentes completo;
diagrama de sequência da autenticação;
diagrama de sequência da abertura da OS;
diagrama ER;
RFCs;
ADRs;
documentação de segurança;
documentação de observabilidade;
runbook operacional;
matriz de rotas e permissões.
ADRs recomendadas:
ADR-001: uso de JWT;
ADR-002: validação no Gateway e na aplicação;
ADR-003: EKS/AKS/GKE;
ADR-004: HPA;
ADR-005: logs JSON e correlação;
ADR-006: OpenTelemetry;
ADR-007: migrations via Kubernetes Job;
ADR-008: gestão de segredos.
A documentação atual em [decisoes-arquiteturais.md](C:/Users/mayar/pos-fiap/projeto1/POS-FIAP-15SOAT-TechChallenge/app/docs/decisoes-arquiteturais.md) pode alimentar esses ADRs, mas precisa ser dividida em documentos formais com contexto, decisão, alternativas e consequências.
Fase 12 — READMEs
Cada repositório precisa ter README próprio contendo:
propósito;
arquitetura;
tecnologias;
pré-requisitos;
execução local;
variáveis de ambiente;
testes;
pipeline;
deploy;
rollback;
diagrama específico;
endpoints ou outputs;
link para Swagger/Postman quando aplicável;
link do ambiente ativo.
O README atual ainda descreve a Fase 2 e Kind local, então precisará ser atualizado.
Fase 13 — Validação ponta a ponta
Executar um roteiro de aceite:
Criar cliente ativo no banco.
Autenticar com CPF válido.
Receber JWT.
Chamar rota protegida.
Testar CPF inválido.
Testar cliente inexistente.
Testar cliente inativo.
Abrir uma OS.
Percorrer os status da OS.
Confirmar logs JSON.
Confirmar o mesmo correlation/trace ID.
Confirmar métricas nos dashboards.
Forçar uma falha controlada.
Confirmar criação do alerta.
Gerar carga.
Demonstrar atuação do HPA.
Executar pipeline de homologação.
Executar ou mostrar pipeline de produção.
Fase 14 — Vídeo e PDF
Roteiro sugerido para o vídeo de 15 minutos
0–2 min: arquitetura e quatro repositórios;
2–4 min: autenticação por CPF e JWT;
4–6 min: APIs protegidas;
6–8 min: pipeline e deploy;
8–10 min: Kubernetes, pods e HPA;
10–13 min: dashboards, logs e traces;
13–15 min: documentação, banco gerenciado e conclusão.
PDF final
Centralizar:
links dos quatro repositórios;
link do vídeo;
links dos ambientes;
Swagger/Postman;
documentação arquitetural;
dashboards;
confirmação do usuário soat-architecture;
checklist dos requisitos.
Priorização prática
A ordem crítica recomendada é:
Escolha da cloud e observabilidade.
Criação dos quatro repositórios.
Banco gerenciado.
Ajuste de status do cliente.
Function por CPF/JWT.
API Gateway.
Kubernetes cloud.
CI/CD real de homologação e produção.
Logs, traces, métricas, dashboards e alertas.
Documentação e evidências.
Ensaio do vídeo.
PDF final.
O maior risco seria deixar observabilidade, documentação e separação dos repositórios para o final. Esses itens representam uma parcela grande da entrega e dependem de decisões feitas desde o início.