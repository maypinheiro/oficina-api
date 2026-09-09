Boa noite, pessoal.

Primeiramente, peço desculpas pela demora na atualização do documento e pelos impactos causados, principalmente considerando a proximidade da data de entrega. Reconhecemos que os alunos não deveriam precisar retornar à gravação da live para identificar os requisitos e os ajustes discutidos.

Para evitar novas dúvidas, o documento disponibilizado será considerado a referência oficial para o desenvolvimento e a entrega do Tech Challenge da Fase 3. Não será necessário consultar a gravação da live para identificar requisitos adicionais.

O objetivo do projeto é evoluir a aplicação da oficina para uma arquitetura corporativa, contemplando segurança, escalabilidade, alta disponibilidade, infraestrutura em nuvem, automação de deploy, monitoramento, observabilidade e documentação arquitetural.

A solução deverá possuir um API Gateway responsável pelo controle e roteamento das requisições. A tecnologia poderá ser escolhida pelo grupo, podendo ser utilizado AWS API Gateway, Kong, Traefik ou outra solução equivalente. As rotas sensíveis deverão ser protegidas por autenticação.

A autenticação deverá ocorrer por meio do CPF do cliente. Esse fluxo deverá ser implementado utilizando uma Function Serverless, responsável por validar o CPF, consultar a existência e o status do cliente na base de dados e, caso o acesso seja autorizado, gerar um token JWT válido. Esse token deverá ser utilizado posteriormente para acessar as APIs protegidas da aplicação.
O projeto deverá ser organizado obrigatoriamente em quatro repositórios separados. Um repositório será destinado à Function Serverless de autenticação; outro será destinado à infraestrutura do Kubernetes desenvolvida com Terraform; o terceiro deverá conter a infraestrutura do banco de dados gerenciado, também utilizando Terraform; e o quarto deverá conter a aplicação principal executada no Kubernetes.

Cada um desses repositórios deverá possuir uma pipeline de CI/CD funcional. A ferramenta utilizada é de livre escolha, como GitHub Actions, GitLab CI, Azure DevOps ou outra equivalente. As pipelines deverão executar as validações pertinentes ao componente e automatizar o processo de entrega ou provisionamento. No caso da aplicação, por exemplo, a pipeline poderá realizar compilação, testes, construção da imagem Docker, publicação da imagem e deploy. Nos repositórios de infraestrutura, deverá validar e aplicar os códigos Terraform.

A branch principal, seja ela main ou master, deverá estar protegida e não poderá receber commits diretamente. As alterações deverão ser realizadas por meio de Pull Requests. Também deverá existir uma estratégia de deploy automatizado para os ambientes ou branches de homologação e produção.
A escolha do provedor de nuvem é livre. Poderão ser utilizados AWS, Azure, Google Cloud ou outros provedores que permitam atender aos requisitos. Independentemente da escolha, a infraestrutura deverá possuir API Gateway, Function Serverless, banco de dados gerenciado, cluster Kubernetes com escalabilidade e provisionamento por meio do Terraform.

O banco de dados poderá ser PostgreSQL, MySQL, SQL Server ou outra tecnologia considerada adequada pelo grupo. Entretanto, essa escolha deverá ser formalmente justificada. A documentação deverá apresentar o modelo relacional, o diagrama de entidade-relacionamento, os relacionamentos entre as entidades e os ajustes realizados para garantir consistência e desempenho.

A aplicação também deverá possuir monitoramento e observabilidade. Poderão ser utilizadas ferramentas como Datadog, New Relic ou outra solução equivalente. O monitoramento deverá permitir acompanhar a latência das APIs, o consumo de CPU e memória do Kubernetes, os healthchecks, a disponibilidade da aplicação e eventuais falhas no processamento das ordens de serviço.
Os logs deverão ser estruturados, preferencialmente em JSON, e possuir mecanismos de correlação, como correlationId ou traceId. O objetivo é permitir o acompanhamento de uma requisição durante sua passagem pelos diferentes componentes da arquitetura.

Os dashboards deverão apresentar informações relevantes para o acompanhamento da aplicação, como o volume diário de ordens de serviço, o tempo médio de execução nas etapas de diagnóstico, execução e finalização, além de erros e falhas nas integrações. Esses dashboards deverão ser demonstrados durante o vídeo da entrega.

Em relação à documentação arquitetural, deverá ser produzido um diagrama de componentes contendo a visão da nuvem, das APIs, do banco de dados, do Kubernetes, da Function Serverless e das ferramentas de monitoramento. Também deverão ser apresentados diagramas de sequência para o fluxo de autenticação e para o fluxo de abertura de uma ordem de serviço.

As principais decisões técnicas deverão ser documentadas por meio de RFCs e ADRs. As RFCs poderão registrar, por exemplo, a análise e a justificativa da escolha da nuvem, do banco de dados, da estratégia de autenticação e da ferramenta de observabilidade. As ADRs deverão registrar decisões arquiteturais mais permanentes, como o padrão de comunicação adotado, a estratégia de escalabilidade, o uso de HPA e a organização dos logs e traces. O documento não determina uma quantidade fixa de RFCs ou ADRs, portanto o grupo deverá registrar as decisões que forem relevantes para a compreensão da solução.

Cada um dos quatro repositórios deverá possuir um arquivo README.md contendo a descrição do seu propósito, as tecnologias utilizadas, os pré-requisitos, as instruções para execução, os passos necessários para o deploy, a explicação da pipeline e um diagrama relacionado ao componente daquele repositório. Também deverão ser incluídos os links para o Swagger ou para a collection do Postman, conforme aplicável.
Os Dockerfiles deverão ser incluídos nos repositórios em que forem tecnicamente necessários. A aplicação executada no Kubernetes, por exemplo, deverá possuir um Dockerfile. Já os repositórios compostos somente por arquivos Terraform não precisam incluir um Dockerfile sem uma finalidade técnica.

O vídeo de demonstração deverá ser publicado no YouTube ou Vimeo, podendo estar público ou não listado, e deverá possuir duração máxima de 15 minutos. Durante o vídeo, o grupo deverá demonstrar a autenticação com CPF, a geração e utilização do JWT, o consumo das APIs protegidas, a execução da pipeline de CI/CD, o deploy automatizado, os dashboards de monitoramento, os logs estruturados, a correlação das requisições e os traces em execução.

A entrega no Portal do Aluno deverá ser realizada por meio de um único arquivo PDF. Esse documento deverá centralizar os links dos quatro repositórios, o link do vídeo, os links das documentações arquiteturais e a confirmação de que o usuário soat-architecture foi adicionado a todos os repositórios.

Dessa forma, não é necessário inserir todo o código-fonte ou toda a documentação dentro do PDF enviado ao portal. O PDF deverá funcionar como um documento central de acesso às evidências da entrega.

Reforço que este documento e as orientações apresentadas nesta mensagem passam a ser a referência oficial do Tech Challenge da Fase 3. Caso exista alguma dúvida técnica específica sobre a implementação, ela poderá ser enviada nesta thread para que possamos responder de forma objetiva e manter o esclarecimento disponível para toda a turma.