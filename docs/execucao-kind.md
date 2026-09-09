# Execução em Kind

Use este guia para subir a API no Kubernetes local e demonstrar escalabilidade com HPA.

## Pré-requisitos

- Docker Desktop aberto;
- `kubectl` instalado;
- `kind` instalado;
- `hey` instalado;
- Node.js 22+ e npm;
- projeto clonado.

## 1. Criar o cluster

```bash
kind create cluster --name oficina-local --image kindest/node:v1.29.14 --wait 5m
kind export kubeconfig --name oficina-local
kubectl config use-context kind-oficina-local
```

## 2. Buildar e carregar a imagem

```bash
docker build -t oficina-api:latest app
kind load docker-image oficina-api:latest --name oficina-local
```

## 3. Aplicar os manifests

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml -f k8s/secret.yaml -f k8s/postgres.yaml -f k8s/metrics-server.yaml -f k8s/api-pdb.yaml -f k8s/api.yaml -f k8s/hpa.yaml -f k8s/prisma-job.yaml
```

## 4. Aguardar a subida

```bash
kubectl rollout status deployment/postgres -n oficina --timeout=180s
kubectl rollout status deployment/oficina-api -n oficina --timeout=180s
```

## 5. Acessar a API

```bash
kubectl port-forward service/oficina-api -n oficina 3000:80
```

Valide:

- `http://localhost:3000/health`
- `http://localhost:3000/docs`

## 6. Popular o banco

```bash
kubectl port-forward svc/postgres -n oficina 15432:5432
cd app
npm install
$env:DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:15432/techchallenge_oficina"
npm run db:seed:ts
```

## 7. Gerar carga

```bash
hey -z 3m -c 40 -m POST -H "Content-Type: application/json" -d '{"username":"admin","password":"admin"}' http://localhost:3000/auth/login
```

## 8. Acompanhar a escala

Abra três terminais:

```bash
kubectl get pods -n oficina -w
```

```bash
kubectl get hpa -n oficina -w
```

```bash
kubectl top pods -n oficina
```

## 9. Encerrar

```bash
kind delete cluster --name oficina-local
```
