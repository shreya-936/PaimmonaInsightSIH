from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine
from .routes.projects import router as projects_router
from .routes.updates import router as updates_router
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="PAIMANA INSIGHT API",
    description="Predictive monitoring backend for infrastructure projects",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(projects_router)
app.include_router(updates_router)  

@app.get("/")
def root():
    return {
        "name": "PAIMANA INSIGHT",
        "status": "running",
        "version": "0.1.0",
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "paimana-insight-backend",
    }