import os
import time
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from prometheus_client import Counter, Histogram, make_asgi_app

from .database import engine, Base
from . import models

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ChamaTech API",
    description="API de suporte ao cliente (Help Desk) - Projeto DevOps CEUB",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

REQUESTS = Counter(
    "http_requests_total",
    "Total de requisições",
    ["method", "path", "status"],
)
LATENCY = Histogram(
    "http_request_duration_seconds",
    "Latência das requisições",
    ["method", "path"],
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


app.mount("/metrics", make_asgi_app())


@app.get("/")
def root():
    return {"message": "ChamaTech API online"}


@app.get("/health", tags=["Sistema"])
def health():
    return {"status": "ok", "service": "api", "env": os.getenv("APP_ENV", "dev")}