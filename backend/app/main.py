from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.database import init_db
from app.api.v1.router import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLite database tables on startup
    await init_db()
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=(
        "VERITY Backend API — Multimodal AI Impersonation & Fraud Prevention System.\n\n"
        "Evaluates:\n"
        "1. WHO is contacting you\n"
        "2. WHAT is being communicated\n"
        "3. WHAT you are being asked to do\n"
        "4. CAN THE INTERACTION BE TRUSTED?\n\n"
        "Combines rule-based indicators, link heuristics, speech-to-text, Gemini AI reasoning, and weighted risk scoring."
    ),
    lifespan=lifespan
)

# CORS configuration for future React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API v1 router
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/", tags=["Health"])
async def root():
    return {
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "online",
        "docs_url": "/docs",
        "api_v1": settings.API_V1_STR
    }


@app.get("/healthz", tags=["Health"])
async def healthz():
    return {"status": "healthy"}
