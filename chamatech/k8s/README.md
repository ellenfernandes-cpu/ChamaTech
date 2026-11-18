# Kubernetes — ChamaTech

Os arquivos são numerados para serem aplicados na ordem certa.

| Arquivo | O que cria |
|---|---|
| `00-namespace.yaml` | Namespace `chamatech` |
| `01-configmap.yaml` | Configurações não sensíveis |
| `02-postgres.yaml` | Banco PostgreSQL (PVC, Deployment e Service) |
| `03-api.yaml` | API (Deployment com 2 réplicas e Service) |
| `04-api-hpa.yaml` | HorizontalPodAutoscaler da API (2 a 6 pods) |
| `05-frontend.yaml` | Frontend Nginx (Deployment e Service NodePort) |
| `exemplos/secret.example.yaml` | Modelo do Secret (não é aplicado automaticamente) |

## Passo a passo (Minikube)

```bash
# 1. Subir o cluster e ativar o metrics-server (necessário para o HPA)
minikube start
minikube addons enable metrics-server

# 2. Construir as imagens e carregá-las no Minikube
docker build -t chamatech-api:latest ./backend
docker build -t chamatech-frontend:latest ./frontend
minikube image load chamatech-api:latest
minikube image load chamatech-frontend:latest

# 3. Criar o namespace e o Secret (senhas ficam fora do Git)
kubectl apply -f k8s/00-namespace.yaml
kubectl create secret generic chamatech-secret -n chamatech \
  --from-literal=POSTGRES_USER=chamatech \
  --from-literal=POSTGRES_PASSWORD=sua-senha \
  --from-literal=DATABASE_URL=postgresql://chamatech:sua-senha@db:5432/chamatech

# 4. Aplicar o restante
kubectl apply -f k8s/

# 5. Conferir
kubectl get pods,svc,hpa -n chamatech
minikube service frontend -n chamatech    # abre o frontend no navegador
```

> Com **kind**, troque o passo 2 por `kind load docker-image chamatech-api:latest` (e o mesmo para o frontend).

## Testar o HPA na apresentação

```bash
# Gera carga na API
kubectl run carga -n chamatech --rm -it --image=busybox -- \
  sh -c "while true; do wget -q -O- http://api:8000/health; done"

# Em outro terminal, acompanhe as réplicas aumentando
kubectl get hpa -n chamatech -w
```
