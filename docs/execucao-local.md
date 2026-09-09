# Execução local

Use este guia para rodar a API e o banco sem Kubernetes.

## Pré-requisitos

- Docker Desktop aberto;
- Node.js 22+;
- npm.

## 1. Subir a aplicação

Na raiz do projeto:

```bash
docker compose up -d
```

## 2. Acessar a API

- `http://localhost:3000/health`
- `http://localhost:3000/docs`

## 3. Fazer login de teste

```powershell
Invoke-RestMethod -Method Post `
  -Uri http://localhost:3000/auth/login `
  -ContentType "application/json" `
  -Body '{"username":"admin","password":"admin"}'
```

## 4. Recriar dados, se necessário

```bash
cd app
npm run db:seed
```

## 5. Encerrar

```bash
docker compose down -v
```
