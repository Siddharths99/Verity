from fastapi import APIRouter
from app.api.v1.endpoints import text, audio, media, url, analyze, incidents

api_router = APIRouter()

# Analysis Routes
api_router.include_router(analyze.router, prefix="/analyze", tags=["Multimodal Analysis"])
api_router.include_router(text.router, prefix="/analyze", tags=["Text Analysis"])
api_router.include_router(audio.router, prefix="/analyze", tags=["Audio & Voice Analysis"])
api_router.include_router(media.router, prefix="/analyze", tags=["Media Analysis"])
api_router.include_router(url.router, prefix="/analyze", tags=["URL & Phishing Checks"])

# Incident & Storage Routes
api_router.include_router(incidents.router, prefix="/incidents", tags=["Incidents & History"])


@api_router.get("/healthz", tags=["Health"])
async def api_healthz():
    return {"status": "healthy"}

