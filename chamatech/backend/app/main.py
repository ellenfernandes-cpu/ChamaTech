"""
API mínima do ChamaTech (ESBOÇO).

Serve para a Ellen testar os Dockerfiles, o Compose e o Kubernetes
enquanto a Ana Clara desenvolve a API de verdade (autenticação, CRUD de chamados).
A Ana Clara pode substituir este arquivo à vontade, mantendo /health e /metrics.
"""
import os
import time

from fastapi import FastAPI, Request
from prometheus_client import Counter, Histogram, make_asgi_app

app = FastAPI(title="ChamaTech API", version="0.1.0")

REQUESTS = Counter(
    "http_requests_total", "Total de requisições", ["method", "path", "status"]
)
LATENCY = Histogram(
    "http_request_duration_seconds", "Latência das requisições", ["method", "path"]
)


@app.middleware("http")
async def metrics_middleware(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    path = request.url.path
    if path != "/metrics":
        LATENCY.labels(request.method, path).observe(time.perf_counter() - start)
        REQUESTS.labels(request.method, path, response.status_code).inc()
    return response


# Endpoint de métricas lido pelo Prometheus
app.mount("/metrics", make_asgi_app())


@app.get("/health")
def health():
    return {"status": "ok", "service": "api", "env": os.getenv("APP_ENV", "dev")}


@app.get("/")
def root():
    return {"message": "ChamaTech API no ar"}
