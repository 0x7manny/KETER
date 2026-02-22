

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

from kyc_engine import KYCEngine

app = FastAPI(
    title="KYC Face ID API",
    description="Vérification d'identité par reconnaissance faciale",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], 
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)

engine = KYCEngine()


class KYCResult(BaseModel):
    success: bool
    similarity: float | None
    liveness_score: float | None
    face_found_on_document: bool
    face_found_on_selfie: bool
    reason: str


@app.post("/kyc/verify", response_model=KYCResult)
async def verify_kyc(
    document: UploadFile = File(..., description="Photo CNI / Passeport / Permis"),
    selfie:   UploadFile = File(..., description="Selfie live de l'utilisateur"),
):
    """
    Vérifie que le selfie correspond au visage sur la pièce d'identité.
    Ne stocke rien — traitement one-shot en mémoire.
    """
    doc_bytes     = await document.read()
    selfie_bytes  = await selfie.read()

    result = engine.verify_kyc(doc_bytes, selfie_bytes)
    return KYCResult(**result)


@app.get("/health")
async def health():
    return {"status": "ok", "model": "ArcFace buffalo_l + liveness"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)